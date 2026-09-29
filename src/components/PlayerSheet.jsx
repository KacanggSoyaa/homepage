// PlayerSheet.jsx — the full-screen now-playing panel the dock expands into.
//
// Clicking the dock's track readout opens this, the way a music player's mini
// bar opens into its full view: same player, more room, the artwork large enough
// to actually look at. Nothing here owns audio state. Every value comes from
// PlayerContext, exactly as the dock and the /music page get theirs, so opening
// and closing the sheet can never interrupt or restart playback.
//
// Open state lives in PlayerDock, which owns the button that toggles it. The
// sheet is mounted only while open, so the two share nothing but the context
// and a callback — and a collapsed dock is left untouched in the DOM, which
// means the toggle button keeps its place in the tab order.

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatTime, usePlayer } from '../player/PlayerContext.jsx'
import TrackArt from './TrackArt.jsx'
import { Scrubber, Transport, VolumeControl } from './PlayerControls.jsx'
import { ChevronDownIcon, QueueIcon } from './Icons.jsx'

// Plain-language readout of the two mode toggles, since a "1" on the repeat icon
// is not self-explanatory. Same phrasing as the one on the /music page.
const REPEAT_WORDS = {
  off: 'stops at the end',
  all: 'repeats the playlist',
  one: 'repeats this track',
}

export default function PlayerSheet({ onClose, openerRef }) {
  const {
    playlist,
    tracks,
    track,
    isPlaying,
    error,
    currentTime,
    duration,
    repeat,
    shuffle,
  } = usePlayer()

  // Focus the collapse button on open and hand focus back to the dock's trigger
  // on close. Without the second half, dismissing the sheet would drop keyboard
  // users back at the top of the document.
  //
  // The trigger is passed in as a ref rather than recovered from
  // document.activeElement, because that is only the trigger on browsers that
  // focus buttons when they are clicked — Safari does not, and it would hand
  // focus to <body> instead.
  const closeRef = useRef(null)
  useEffect(() => {
    closeRef.current?.focus()
    return () => openerRef?.current?.focus()
  }, [openerRef])

  // Escape closes. Bound on the document rather than the panel so it works
  // wherever focus has wandered to inside the sheet.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // The sheet covers the viewport, so the page behind it must not scroll. Hiding
  // the scrollbar would otherwise reflow the entire page sideways as it
  // disappeared, so its width is handed back to the root as padding.
  useEffect(() => {
    const root = document.documentElement
    const overflow = root.style.overflow
    const padding = root.style.paddingRight
    const gap = window.innerWidth - root.clientWidth
    root.style.overflow = 'hidden'
    if (gap > 0) root.style.paddingRight = `${gap}px`
    return () => {
      root.style.overflow = overflow
      root.style.paddingRight = padding
    }
  }, [])

  // An empty library has no track to describe, and PlayerDock already renders
  // nothing in that state, so the sheet is never reached with one.
  if (!track || !tracks.length) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-sheet-fade">
      {/* Backdrop. Sits behind the panel and covers whatever the page is
          showing, so a click anywhere outside the card dismisses the sheet. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-ink-950/55 dark:bg-space-950/80 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Now playing: ${track.title}`}
        className="relative w-full sm:max-w-md max-h-[100dvh] sm:max-h-[92dvh]
                   overflow-y-auto overscroll-contain feed-scroll
                   bg-paper-100 dark:bg-space-900
                   border-ink-200/20 dark:border-paper-50/10 border
                   rounded-t-2xl sm:rounded-2xl
                   shadow-2xl shadow-ink-950/25 dark:shadow-black/60
                   animate-sheet-rise"
      >
        {/* Header: where the track came from, and the way back down. */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <QueueIcon width="15" height="15" className="text-amber shrink-0" />
          <span className="font-mono text-xs text-ink-600 dark:text-paper-200/60 truncate">
            {playlist.title.toLowerCase()}.m3u
          </span>
          <span className="ml-auto font-mono text-[11px] text-teal shrink-0">
            {playlist.license}
          </span>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close now playing"
            title="Close now playing"
            className="w-9 h-9 -mr-1 flex items-center justify-center rounded-full text-ink-600
                       dark:text-paper-200/60 hover:text-amber hover:bg-ink-900/5
                       dark:hover:bg-paper-50/5 transition-colors shrink-0"
          >
            <ChevronDownIcon width="20" height="20" />
          </button>
        </div>

        <div className="px-6 sm:px-8 pt-4 pb-8 sm:pb-10">
          {/* Artwork, sized in vw so it stays square and shrinks with the screen
              instead of being capped by a rem value a short phone would overflow.
              Centred on its own, the way a player's full view sits, while the text
              below it stays left-aligned. The panel scrolls if it still runs out
              of room. */}
          <TrackArt
            art={track.art}
            src={track.cover}
            label={`Cover art for ${track.title}`}
            className="mx-auto w-[min(68vw,22rem)] h-[min(68vw,22rem)] rounded-xl shadow-2xl shadow-black/30 dark:shadow-black/60"
          />

          {/* Title over artist. Left in the accessibility tree: the dock's own
              aria-live is still mounted behind this panel and keeps announcing
              track changes, but the title has to be readable on its own for
              anyone browsing the sheet directly. */}
          <div className="mt-7">
            <h2 className="font-mono text-2xl sm:text-3xl font-semibold truncate">{track.title}</h2>
            <p className="font-mono text-sm text-ink-600 dark:text-paper-200/60 truncate mt-1">
              {error ? <span className="text-amber">{error}</span> : `${track.artist} · ${playlist.title}`}
            </p>
          </div>

          <div className="mt-6">
            <Scrubber />
            <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-ink-600 dark:text-paper-200/50">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <Transport size="md" />
          </div>

          <p className="mt-5 text-center font-mono text-[11px] text-ink-600 dark:text-paper-200/50">
            {isPlaying ? 'playing' : 'paused'} · shuffle {shuffle ? 'on' : 'off'} ·{' '}
            {REPEAT_WORDS[repeat]}
          </p>

          {/* Volume has room here, so it is shown on phones too rather than
              hidden the way the dock hides it. */}
          <div className="mt-5 flex items-center justify-center">
            <VolumeControl />
          </div>

          {/* The full tracklist lives on /music, so the sheet's job here is to
              get there and close itself on the way — an overlay left open over a
              new route would cover the page it just navigated to. */}
          <Link
            to={`/music/${playlist.id}`}
            onClick={onClose}
            className="mt-7 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                       border border-ink-200/20 dark:border-paper-50/15
                       font-mono text-xs text-ink-700 dark:text-paper-200/80
                       hover:text-amber hover:border-amber/40 hover:bg-ink-900/5
                       dark:hover:bg-paper-50/5 transition-colors"
          >
            <QueueIcon width="14" height="14" />
            full tracklist
          </Link>
        </div>
      </div>
    </div>
  )
}
