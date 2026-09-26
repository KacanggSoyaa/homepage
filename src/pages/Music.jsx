// Music.jsx — the "now playing" page on the /music route.
//
// The audio is served from /audio, so this page is a real player: the panel
// below drives the same engine as the persistent dock, and every row of the
// tracklist is a play button.
//
// There is one page for the whole library, and the playlist it shows is the id
// in the URL: /music opens whichever playlist was loaded last, /music/focus
// opens Focus. Opening a playlist loads it in the player, because the panel here
// *is* the player — a tracklist for one playlist above a now-playing panel for
// another would be a lie about what the transport buttons do.

import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { usePlayer, formatTime } from '../player/PlayerContext.jsx'
import TrackArt from '../components/TrackArt.jsx'
import PlaylistSwitcher from '../components/PlaylistSwitcher.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import { ExternalLinkIcon, QueueIcon } from '../components/Icons.jsx'
import { NowPlayingBars, Scrubber, Transport } from '../components/PlayerControls.jsx'

const REPEAT_WORDS = {
  off: 'stops at the end',
  all: 'repeats the playlist',
  one: 'repeats this track',
}

export default function Music() {
  const { id } = useParams()
  const {
    playlists,
    playlist,
    activeId,
    track,
    index,
    isPlaying,
    error,
    currentTime,
    duration,
    repeat,
    shuffle,
    select,
    switchPlaylist,
  } = usePlayer()

  // An id in the URL wins over the remembered playlist, and it wins immediately
  // rather than after an effect: `shown` is what the page renders, so following
  // a link to /music/focus never paints Mood's tracklist first.
  const requested = playlists.find((entry) => entry.id === id) || null
  const shown = requested || playlist
  const tracks = shown?.tracks ?? []

  // Until the engine has caught up with the URL, `index` refers to the previously
  // loaded playlist, so the highlighted row is only meaningful when they agree.
  const isLoaded = shown?.id === activeId

  // Browsing to another playlist must never interrupt what is playing. The URL
  // decides which tracklist is on screen; the player keeps whatever it has
  // loaded until something explicitly asks for a change — a row tap, the dock,
  // or the OS media keys.
  //
  // The one exception is arriving with nothing playing: there the URL picks what
  // to preload, so a shared /music/galau link opens Galau instead of whichever
  // playlist happened to be remembered. It never autoplays, and it is latched
  // with a ref so that pausing a moment later cannot retroactively swap the
  // loaded playlist out from under the dock.
  const adopted = useRef(false)
  useEffect(() => {
    if (adopted.current) return
    adopted.current = true
    if (!requested || requested.id === activeId || isPlaying) return
    switchPlaylist(requested.id, { play: false })
  }, [requested, activeId, isPlaying, switchPlaylist])

  // The card scrolls internally, so the row that is playing has to be brought
  // back into view as the playlist advances. Scrolling the container directly
  // (rather than node.scrollIntoView) keeps the page itself from jumping.
  const scrollerRef = useRef(null)
  const rowRefs = useRef(new Map())

  useEffect(() => {
    const scroller = scrollerRef.current
    // `index` belongs to the loaded playlist, so scrolling to that row only makes
    // sense while the list on screen is the loaded one. Browsing to another
    // playlist must not yank its list to an unrelated row.
    if (!isLoaded) return
    const row = rowRefs.current.get(index)
    if (!scroller || !row) return
    const box = scroller.getBoundingClientRect()
    const line = row.getBoundingClientRect()
    const inset = 8
    if (line.top < box.top + inset) scroller.scrollTop -= box.top + inset - line.top
    else if (line.bottom > box.bottom - inset) scroller.scrollTop += line.bottom - box.bottom + inset
  }, [index, isLoaded])

  return (
    <section className="container-page py-16 sm:py-20">
      {/* Section heading with terminal-style "~/music" prompt */}
      <ScrollReveal>
        <p className="prompt font-mono text-sm text-amber mb-2">music</p>
        <h1 className="text-3xl font-mono font-semibold mb-3 dark:text-glow-amber">
          What I'm listening to
        </h1>
        <p className="text-ink-700 dark:text-paper-200/80 max-w-xl">
          Playlists I keep coming back to, hosted on this site rather than
          streamed from somewhere else. Shuffle one, loop it, scrub around — it
          is meant to be played.
        </p>
      </ScrollReveal>

      {/* Playlist picker. Renders nothing until there is a second playlist to
          pick between, so a one-playlist library shows no chrome at all. */}
      <PlaylistSwitcher className="mt-8" viewingId={shown?.id} />

      {/* An empty library is a valid state, not an error: the importer can
          write a manifest with no playlists, and there is no audio for the
          panel, the tracklist or the licence note to describe. Rather than
          render a player with an undefined track, the page says what is going
          on and how to fill it. */}
      {playlists.length === 0 ? (
        <ScrollReveal delay={80}>
          <div className="mt-10 glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 px-6 py-10 sm:px-10 sm:py-14">
            <h2 className="font-mono text-lg font-semibold">nothing queued</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-paper-200/80 max-w-xl">
              The library is empty, so there is no player to show. Audio added
              later appears here automatically, with the full set of controls.
            </p>
            <p className="mt-4 font-mono text-xs text-ink-600 dark:text-paper-200/50">
              to add a playlist: make a folder in <span className="text-amber">public/audio</span>,
              drop audio in, and run <span className="text-amber">node scripts/import-audio.mjs</span>
            </p>
          </div>
        </ScrollReveal>
      ) : !track || tracks.length === 0 ? (
        /* The playlist exists and it is empty, which is a different situation
           from an empty library: the folder is there, the audio is not. The
           check is on `track` as well as on the visible list, because the panel
           above describes the loaded playlist and needs a track to describe. */
        <ScrollReveal delay={80}>
          <div className="mt-10 glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 px-6 py-10 sm:px-10 sm:py-14">
            <h2 className="font-mono text-lg font-semibold">{shown.title} is empty</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-paper-200/80 max-w-xl">
              This playlist has no audio in it yet. Add a file to{' '}
              <span className="font-mono text-xs text-amber">
                public/audio/{shown.id}
              </span>{' '}
              and re-run the importer.
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <>
      {/* Player panel, in the site's glass card so it matches the project and
          certificate cards. This is a view onto the shared engine, not a
          second player — the dock shows the same state. */}
      <ScrollReveal delay={120} y={32}>
        <div className="mt-10 glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 bg-ink-900/5 dark:bg-paper-50/5 border-b border-ink-200/10 dark:border-paper-50/10">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-teal/70" />
            <span className="ml-3 font-mono text-xs text-ink-600 dark:text-paper-200/60 truncate">
              {playlist.title.toLowerCase()}.m3u
            </span>
            <span className="ml-auto font-mono text-[11px] text-teal shrink-0">
              {playlist.license}
            </span>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-4 sm:gap-6">
  <TrackArt
    art={track.art}
    src={track.cover}
    label={`Cover art for ${track.title}`}
    className="w-20 h-20 sm:w-24 sm:h-24"
  />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-widest text-amber">
                  now playing
                </p>
                <h2 className="font-mono text-lg sm:text-xl font-semibold truncate mt-0.5">
                  {track.title}
                </h2>
                <p className="font-mono text-xs text-ink-600 dark:text-paper-200/60 truncate">
                  {error ? <span className="text-amber">{error}</span> : track.artist}
                </p>
              </div>
            </div>

            {/* Seek bar, with the elapsed and total times tucked under each end
                of it the way a physical player's display sits under the dial. */}
            <div className="mt-6">
              <Scrubber />
              <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-ink-600 dark:text-paper-200/50">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <Transport size="md" />
            </div>

            {/* Plain-language readout of the two mode toggles, since a "1" on
                the repeat icon is not self-explanatory. The count is the loaded
                playlist's: the transport buttons act on that one, not on
                whichever the URL names. */}
            <p className="mt-4 text-center font-mono text-[11px] text-ink-600 dark:text-paper-200/50">
              shuffle {shuffle ? 'on' : 'off'} · {REPEAT_WORDS[repeat]} ·{' '}
              {playlist.tracks.length} tracks
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Tracklist. Rows are buttons now: selecting one loads and plays it
          immediately, and the loaded row gets the amber treatment plus a
          running equaliser. */}
      <ScrollReveal delay={120}>
        <div className="mt-14 mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-mono text-lg font-semibold">tracklist</h2>
            <p className="font-mono text-xs text-ink-600 dark:text-paper-200/60 mt-1">
              {tracks.length} tracks · tap a row to play it
            </p>
          </div>

          {/* Credit for where the audio came from. Audio the site owner
              supplied has no upstream source, so the button is simply absent
              rather than rendered as a link with no href. */}
          {playlist.source && (
            <a
              href={playlist.source}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber text-ink-950 font-mono text-xs font-medium hover:bg-amber-light hover:shadow-lg hover:shadow-amber/25 transition-all"
            >
              source
              <ExternalLinkIcon width="13" height="13" />
            </a>
          )}
        </div>

        {/* The list lives in a card with its own scrollbar, capped so about a
            dozen rows are on screen and the rest are reached by scrolling
            inside the card rather than by pushing the page down. The cap
            doubles at sm, where the grid gains a second column and the same
            twelve tracks occupy half as many rows. */}
        <div className="glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-ink-900/5 dark:bg-paper-50/5 border-b border-ink-200/10 dark:border-paper-50/10">
            <QueueIcon width="15" height="15" className="text-amber shrink-0" />
            <span className="font-mono text-xs text-ink-600 dark:text-paper-200/60 truncate">
              {shown.title.toLowerCase()}.m3u
            </span>
            <span className="ml-auto font-mono text-[11px] text-ink-600 dark:text-paper-200/50 shrink-0">
              {tracks.length} tracks
            </span>
          </div>

          <div
            ref={scrollerRef}
            className="max-h-[43.75rem] sm:max-h-[22.375rem] overflow-y-auto overscroll-contain feed-scroll p-2"
          >
            {/* Two columns from sm up; a single column of a dozen rows would
                otherwise make for a very long, very empty scroll. */}
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-0.5">
              {tracks.map((entry, position) => {
                // Gated on the engine having caught up with the URL, so the
                // highlight never lands on row 2 of a list it isn't playing yet.
                const isCurrent = isLoaded && position === index
                return (
                  <li key={entry.id}>
                    <button
                      ref={(node) => {
                        if (node) rowRefs.current.set(position, node)
                        else rowRefs.current.delete(position)
                      }}
                      type="button"
                      onClick={() => select(shown.id, position)}
                      aria-current={isCurrent ? 'true' : undefined}
                      aria-label={`${isCurrent && isPlaying ? 'Pause' : 'Play'} ${entry.title}`}
                      className={`group w-full text-left flex items-center gap-3 px-3 py-2 rounded-md border transition-colors ${
                        isCurrent
                          ? 'border-amber/40 bg-amber/5'
                          : 'border-transparent hover:border-amber/30 hover:bg-ink-900/5 dark:hover:bg-paper-50/5'
                      }`}
                    >
                      {/* Position number, swapped for the equaliser on the row
                          that is currently loaded. */}
                      <span className="w-6 flex justify-end shrink-0">
                        {isCurrent ? (
                          <NowPlayingBars paused={!isPlaying} className="text-amber" />
                        ) : (
                          <span className="font-mono text-xs text-ink-600 dark:text-paper-200/40 tabular-nums">
                            {entry.id}
                          </span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block font-mono text-sm truncate transition-colors ${
                            isCurrent
                              ? 'text-amber'
                              : 'text-ink-900 dark:text-paper-50 group-hover:text-amber'
                          }`}
                        >
                          {entry.title}
                        </span>
                        <span className="block font-mono text-[11px] text-ink-600 dark:text-paper-200/60 truncate">
                          {entry.artist}
                        </span>
                      </span>

                      {/* Runtime of the re-encoded excerpt, not the full original. */}
                      <span className="font-mono text-xs text-ink-600 dark:text-paper-200/40 tabular-nums shrink-0">
                        {formatTime(entry.duration)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </ScrollReveal>

      {/* Where the audio comes from and what may be done with it. The wording
          follows the playlist's own metadata: a licence is only claimed when one
          is set in src/data/playlist.js, so audio the site owner owns never gets
          described with a public-domain grant that does not apply to it. */}
      <ScrollReveal delay={160}>
        <div className="mt-14 border-l-2 border-amber/40 pl-4">
          <h2 className="font-mono text-sm font-semibold text-amber">source &amp; licence</h2>
          {shown.license ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-paper-200/80 max-w-2xl">
              Every track in <strong>{shown.title}</strong> is by {shown.artist},
              released under{' '}
              {shown.licenseUrl ? (
                <a
                  href={shown.licenseUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-amber hover:text-amber-light underline underline-offset-2"
                >
                  {shown.license}
                </a>
              ) : (
                <span>{shown.license}</span>
              )}
              , so the files are served straight from this site with no account,
              no subscription, and no preview cut-offs.
            </p>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-paper-200/80 max-w-2xl">
              <strong>{shown.title}</strong> by me, hosted here so
              the player keeps real shuffle, loop, seek and volume controls. The
              audio is served for personal listening; it is not offered for
              redistribution, and the files stay the property of whoever made
              them.
            </p>
          )}
        </div>
      </ScrollReveal>
        </>
      )}
    </section>
  )
}
