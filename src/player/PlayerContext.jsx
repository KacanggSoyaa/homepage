// PlayerContext.jsx — the audio engine, and the only source of truth for
// playback state anywhere in the app.
//
// One HTMLAudioElement is created for the lifetime of the provider and is
// never attached to the DOM, which is what lets a track keep playing while
// the user scrolls or navigates between routes. Every control (the dock, the
// /music page) reads the same context instead of owning its own audio.
//
// The site has any number of playlists, and exactly one of them is loaded at a
// time. Callbacks never close over a playlist: they read engine.current, which
// holds the active playlist's id, and resolve it through the data layer on every
// call. That is what keeps a handler bound to the audio element — `ended` fires
// long after a render — from advancing a playlist that is no longer loaded.
//
// Mutable state is mirrored into a ref as well as into React state. The
// element's event handlers and the transport callbacks need the newest values
// at all times — `ended` fires while React state may still be catching up —
// so they read engine.current and push rendered values out through commit().

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getPlaylist, playlists } from '../data/playlist.js'

const PlayerContext = createContext(null)

const PREFS_KEY = 'player:prefs'
const REPEAT_MODES = ['off', 'all', 'one']

// Stand-in track list for a library with nothing in it. Module-level so the
// identity is stable and an empty library does not re-render on every commit.
const EMPTY = []

// "m:ss" for a duration in seconds, floored so a track never reads 2:30 early.
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

// Volume, mute, the two playback modes and the playlist you last had open are
// the settings a listener expects to survive a reload, so they are the only
// things persisted.
function loadPrefs() {
  const defaults = { volume: 0.7, muted: false, repeat: 'all', shuffle: false, playlistId: null }
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null')
    if (!saved) return defaults
    return {
      volume:
        typeof saved.volume === 'number' && saved.volume >= 0 && saved.volume <= 1
          ? saved.volume
          : defaults.volume,
      muted: typeof saved.muted === 'boolean' ? saved.muted : defaults.muted,
      repeat: REPEAT_MODES.includes(saved.repeat) ? saved.repeat : defaults.repeat,
      shuffle: typeof saved.shuffle === 'boolean' ? saved.shuffle : defaults.shuffle,
      // A remembered id that no longer exists is not an error: getPlaylist falls
      // back to the first playlist, which is the right thing to open.
      playlistId: typeof saved.playlistId === 'string' ? saved.playlistId : defaults.playlistId,
    }
  } catch {
    // No storage, or corrupt JSON. Defaults are a fine outcome.
    return defaults
  }
}

// Playback order is a list of track indices: 0..n-1 when shuffle is off, and a
// Fisher-Yates permutation of the same set when it is on. The playing track is
// always pinned to the front, so switching shuffle on mid-song never interrupts
// what is already playing — it only changes what plays next.
function buildOrder(count, currentIndex, shuffled) {
  // An empty library has no order at all. Without this the function would hand
  // back [0] — a track index that does not exist — and `step` would treat the
  // playlist as non-empty and try to load it.
  if (count <= 0) return []
  const rest = []
  for (let i = 0; i < count; i += 1) if (i !== currentIndex) rest.push(i)
  if (shuffled) {
    for (let i = rest.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const swap = rest[i]
      rest[i] = rest[j]
      rest[j] = swap
    }
  }
  return [currentIndex, ...rest]
}

export function PlayerProvider({ children }) {
  // The audio element. Created once and kept out of the document, so React
  // re-renders and route changes cannot pause it.
  const audioRef = useRef(null)
  if (audioRef.current === null && typeof window !== 'undefined') {
    const element = new Audio()
    element.preload = 'metadata'
    audioRef.current = element
  }

  const initial = useRef(null)
  if (initial.current === null) {
    const prefs = loadPrefs()
    // getPlaylist resolves the remembered id, falling back to the first
    // playlist when it has been renamed or deleted since the last visit.
    const opening = getPlaylist(prefs.playlistId)
    const count = opening?.tracks.length ?? 0
    initial.current = {
      playlistId: opening?.id ?? null,
      index: 0,
      order: buildOrder(count, 0, prefs.shuffle),
      shuffle: prefs.shuffle,
      repeat: prefs.repeat,
      volume: prefs.volume,
      muted: prefs.muted,
      isPlaying: false,
      loading: false,
      ready: false,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      error: null,
    }
  }

  const [state, setState] = useState(initial.current)
  const engine = useRef(initial.current)

  const commit = useCallback((patch) => {
    engine.current = { ...engine.current, ...patch }
    setState(engine.current)
  }, [])

  const start = useCallback(() => {
    const element = audioRef.current
    if (!element) return
    const attempt = element.play()
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        // Browsers reject play() that is not tied to a user gesture. Leaving
        // isPlaying false is the honest state; the listener can retry by click.
        commit({ isPlaying: false, loading: false })
      })
    }
  }, [commit])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    const element = audioRef.current
    if (!element) return
    if (engine.current.isPlaying) element.pause()
    else start()
  }, [start])

  // The playlist currently loaded into the element. Resolved through the data
  // layer on every read rather than closed over, so the audio element's event
  // handlers — which are bound once and outlive any single playlist — always
  // act on the playlist that is loaded now.
  const activePlaylist = useCallback(() => getPlaylist(engine.current.playlistId), [])

  // Point the element at a track and optionally begin playing it.
  const load = useCallback(
    (index, autoplay) => {
      const element = audioRef.current
      const track = activePlaylist()?.tracks[index]
      if (!element || !track) return
      commit({
        index,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        ready: false,
        loading: true,
        error: null,
      })
      element.src = track.src
      element.load()
      if (autoplay) start()
    },
    [activePlaylist, commit, start],
  )

  // Walk the playback order by `delta` positions. `forced` is set when the
  // listener asked for it (the next button, the OS media key), which suppresses
  // repeat-one — otherwise that mode would make "next" a no-op.
  const step = useCallback(
    (delta, forced) => {
      const { order, index, repeat } = engine.current
      const element = audioRef.current
      if (!element || !order.length) return

      if (repeat === 'one' && !forced) {
        element.currentTime = 0
        start()
        return
      }

      let target = order.indexOf(index) + delta
      if (target >= order.length) {
        if (repeat === 'all') {
          target = 0
        } else {
          // End of the playlist with repeat off: stop, do not silently wrap.
          element.pause()
          commit({ isPlaying: false, currentTime: 0 })
          return
        }
      }
      if (target < 0) target = 0
      load(order[target], true)
    },
    [commit, load, start],
  )

  const next = useCallback(() => step(1, true), [step])

  const previous = useCallback(() => {
    const element = audioRef.current
    // The convention every player uses: restart the track unless we are a few
    // seconds in, in which case step back one.
    if (element && element.currentTime > 3) {
      element.currentTime = 0
      commit({ currentTime: 0 })
      return
    }
    step(-1, true)
  }, [commit, step])

  // Load a different playlist.
  //
  // A switch is meant to be unobtrusive, so the track that happens to be in both
  // playlists keeps playing untouched rather than restarting. Otherwise the
  // element is pointed at the new playlist's opening track.
  //
  // `play` is for the case where the listener asked for sound — tapping a row,
  // or switching playlists while something was already playing. It is a request,
  // not a guarantee: start() swallows the rejection browsers raise for play()
  // outside a user gesture, and the honest paused state is what shows instead.
  const switchPlaylist = useCallback(
    (id, { index: at, play = false } = {}) => {
      const next = getPlaylist(id)
      const element = audioRef.current
      if (!next) return

      const previous = activePlaylist()
      const loadedSrc = previous?.tracks[engine.current.index]?.src
      const shared = loadedSrc ? next.tracks.findIndex((track) => track.src === loadedSrc) : -1
      const index = at ?? (shared >= 0 ? shared : 0)
      const track = next.tracks[index]

      commit({
        playlistId: next.id,
        index,
        order: buildOrder(next.tracks.length, index, engine.current.shuffle),
        currentTime: 0,
        duration: 0,
        buffered: 0,
        ready: false,
        loading: Boolean(track),
        error: null,
      })

      if (!element) return

      if (!track) {
        // An empty playlist. Stop rather than leave the previous track running
        // with no row to select and no dock to pause it with.
        element.pause()
        element.removeAttribute('src')
        element.load()
        return
      }

      // The element already holds this track, so playback carries on and only
      // the surrounding state needed updating.
      if (loadedSrc === track.src) {
        if (play) start()
        return
      }

      element.src = track.src
      element.load()
      if (play) start()
    },
    [activePlaylist, commit, start],
  )

  // Play a track from a named playlist. The playlist is named rather than
  // implied so that tapping a row on a playlist the engine has not caught up
  // with yet cannot index into the wrong track list.
  const select = useCallback(
    (playlistId, index) => {
      if (playlistId !== engine.current.playlistId) {
        switchPlaylist(playlistId, { index, play: true })
        return
      }
      // Play the track at `index`. Tapping the row that is already loaded is
      // treated as play/pause, which is what people expect from a tracklist.
      if (index === engine.current.index) {
        toggle()
        return
      }
      load(index, true)
    },
    [load, switchPlaylist, toggle],
  )

  const seek = useCallback(
    (seconds) => {
      const element = audioRef.current
      if (!element || !Number.isFinite(element.duration)) return
      element.currentTime = Math.min(Math.max(seconds, 0), element.duration)
      commit({ currentTime: element.currentTime })
    },
    [commit],
  )

  const seekBy = useCallback((delta) => seek((audioRef.current?.currentTime || 0) + delta), [seek])

  const setVolume = useCallback(
    (value) => {
      const element = audioRef.current
      const next = Math.min(Math.max(value, 0), 1)
      if (element) {
        element.volume = next
        // Dragging off zero should unmute, matching every other player.
        if (next > 0 && element.muted) element.muted = false
      }
      commit({ volume: next, muted: next > 0 ? false : engine.current.muted })
    },
    [commit],
  )

  const toggleMute = useCallback(() => {
    const element = audioRef.current
    if (!element) return
    element.muted = !element.muted
    commit({ muted: element.muted })
  }, [commit])

  const toggleShuffle = useCallback(() => {
    const next = !engine.current.shuffle
    commit({
      shuffle: next,
      order: buildOrder(activePlaylist()?.tracks.length ?? 0, engine.current.index, next),
    })
  }, [activePlaylist, commit])

  const cycleRepeat = useCallback(() => {
    const next = REPEAT_MODES[(REPEAT_MODES.indexOf(engine.current.repeat) + 1) % REPEAT_MODES.length]
    commit({ repeat: next })
  }, [commit])

  // Element event wiring. Every callback below is stable, so this runs once.
  useEffect(() => {
    const element = audioRef.current
    if (!element) return undefined

    const onMetadata = () => {
      const duration = Number.isFinite(element.duration) ? element.duration : 0
      commit({ duration, ready: duration > 0, loading: false })
    }
    const onTimeUpdate = () => {
      const buffered = element.buffered.length
        ? element.buffered.end(element.buffered.length - 1)
        : 0
      commit({ currentTime: element.currentTime, buffered })
    }
    const onPlay = () => commit({ isPlaying: true, error: null })
    const onPlaying = () => commit({ isPlaying: true, loading: false })
    // canplay only means enough data is buffered to start, so it clears the
    // buffering flag without claiming the track is playing.
    const onCanPlay = () => commit({ loading: false })
    const onPause = () => commit({ isPlaying: false })
    const onWaiting = () => commit({ loading: true })
    const onEnded = () => step(1, false)
    const onError = () =>
      commit({ isPlaying: false, loading: false, error: 'This track could not be loaded.' })

    const bindings = {
      loadedmetadata: onMetadata,
      durationchange: onMetadata,
      timeupdate: onTimeUpdate,
      progress: onTimeUpdate,
      play: onPlay,
      playing: onPlaying,
      canplay: onCanPlay,
      pause: onPause,
      waiting: onWaiting,
      ended: onEnded,
      error: onError,
    }

    for (const [event, handler] of Object.entries(bindings)) {
      element.addEventListener(event, handler)
    }
    return () => {
      for (const [event, handler] of Object.entries(bindings)) {
        element.removeEventListener(event, handler)
      }
    }
  }, [commit, step])

  // Point the element at the opening track straight away. Without this the
  // transport buttons are dead until something is selected, because pressing
  // play on a fresh page would ask an element with no source to start. It also
  // lets the browser fetch metadata on load, so the seek bar and the dock's
  // time readout are populated before the first press.
  useEffect(() => {
    const element = audioRef.current
    const first = activePlaylist()?.tracks[0]
    if (element && first && !element.src) {
      element.src = first.src
      element.load()
    }
  }, [activePlaylist])

  // Apply the persisted volume/mute to the element once it exists.
  useEffect(() => {
    const element = audioRef.current
    if (!element) return
    element.volume = engine.current.volume
    element.muted = engine.current.muted
  }, [])

  // Persist the preference slice whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          volume: state.volume,
          muted: state.muted,
          repeat: state.repeat,
          shuffle: state.shuffle,
          playlistId: state.playlistId,
        }),
      )
    } catch {
      // Storage blocked or full: preferences last for this session only.
    }
  }, [state.volume, state.muted, state.repeat, state.shuffle, state.playlistId])

  // Media Session: OS media keys, lock-screen controls and headphone buttons.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return undefined
    const handlers = {
      play: () => start(),
      pause: () => pause(),
      previoustrack: () => previous(),
      nexttrack: () => next(),
      seekbackward: (details) => seekBy(-(details.seekOffset || 10)),
      seekforward: (details) => seekBy(details.seekOffset || 10),
      seekto: (details) => {
        if (typeof details.seekTime === 'number') seek(details.seekTime)
      },
    }
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // Not every browser implements every action.
      }
    }
    return () => {
      for (const action of Object.keys(handlers)) {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch {
          // Ignore.
        }
      }
    }
  }, [start, pause, previous, next, seek, seekBy])

  // Track metadata for lock screens and OS notifications.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    const current = getPlaylist(state.playlistId)
    const track = current?.tracks[state.index]
    if (!track || typeof MediaMetadata === 'undefined') return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: current.title,
    })
  }, [state.index, state.playlistId])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused'
  }, [state.isPlaying])

  // Stop audio if the provider itself is torn down (a full app unmount).
  useEffect(() => () => audioRef.current?.pause(), [])

  // The loaded playlist is derived from the id rather than stored as its own
  // object, so the active id and the track list can never drift apart. EMPTY is
  // a module-level constant so a library with no tracks keeps a stable reference
  // across renders.
  const playlist = getPlaylist(state.playlistId)
  const tracks = playlist?.tracks ?? EMPTY
  const track = tracks[state.index]

  const value = useMemo(
    () => ({
      playlists,
      playlist,
      tracks,
      track,
      activeId: state.playlistId,
      index: state.index,
      isPlaying: state.isPlaying,
      loading: state.loading,
      ready: state.ready,
      error: state.error,
      currentTime: state.currentTime,
      duration: state.duration,
      buffered: state.buffered,
      volume: state.volume,
      muted: state.muted,
      repeat: state.repeat,
      shuffle: state.shuffle,
      play: start,
      pause,
      toggle,
      next,
      previous,
      select,
      switchPlaylist,
      seek,
      seekBy,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
    }),
    [
      state.playlistId,
      state.index,
      state.isPlaying,
      state.loading,
      state.ready,
      state.error,
      state.currentTime,
      state.duration,
      state.buffered,
      state.volume,
      state.muted,
      state.repeat,
      state.shuffle,
      start,
      pause,
      toggle,
      next,
      previous,
      select,
      switchPlaylist,
      seek,
      seekBy,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used inside a PlayerProvider')
  return context
}
