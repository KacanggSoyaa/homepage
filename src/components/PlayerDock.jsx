// PlayerDock.jsx — the persistent bottom transport bar.
//
// Mounted once in App.jsx below <Footer />, outside <Routes>, so a track keeps
// playing while scrolling or moving between pages. The audio element itself
// lives in PlayerProvider and is never unmounted, so this bar only has to read
// state — it no longer has to protect an iframe from being torn down.
//
// The bar is a fixed height with every control visible: shuffle, previous,
// play/pause, next and repeat are always on screen rather than hidden behind an
// expand toggle, because they are the reason to reach for a player in the
// first place. A progress hairline runs along the top edge, full bleed.
//
// The track readout on the left is a button, not a label: it opens PlayerSheet,
// the full-screen now-playing view. Only that readout is the trigger — the
// transport, volume and queue controls sit outside it, so expanding the player
// never sits between anyone and the button they meant to press.

import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatTime, usePlayer } from '../player/PlayerContext.jsx'
import TrackArt from './TrackArt.jsx'
import PlayerSheet from './PlayerSheet.jsx'
import { QueueIcon } from './Icons.jsx'
import { Scrubber, Transport, VolumeControl } from './PlayerControls.jsx'

// Fixed pixel heights, mirrored by the spacer so the layout never jumps and
// the bar never covers the footer. PROGRESS_H is the seek hairline's hit area,
// and BORDER_H is the card's top border — it has `border-b-0`, so the other
// three edges each add a pixel the spacer has to account for.
const BAR_H = 64
const PROGRESS_H = 14
const BORDER_H = 1
const DOCK_H = BAR_H + PROGRESS_H + BORDER_H

export default function PlayerDock() {
  const { playlist, tracks, track, isPlaying, loading, error, currentTime, duration, repeat, shuffle } =
    usePlayer()

  // Whether the full-screen now-playing sheet is open. Plain component state
  // rather than player state: it is a view of the engine, not a fact about
  // playback, so it must not survive a reload or be remembered in prefs.
  const [expanded, setExpanded] = useState(false)

  // Handed to the sheet so dismissing it can put focus back on the button that
  // opened it, rather than dropping keyboard users at the top of the document.
  const triggerRef = useRef(null)

  // With no tracks there is nothing to show and nothing to control, so the bar
  // and the spacer that reserves its height are both dropped. Rendering it
  // anyway would mean a row of dead buttons and a track with no title, since
  // `track` is undefined for an empty library. Safe to return early: the only
  // hooks above are the context read and this state.
  if (!tracks.length) return null

  return (
    <>
      {/* Reserves the dock's height in normal document flow. Layout only. */}
      <div aria-hidden="true" style={{ height: DOCK_H }} className="shrink-0" />

      {/* inset-x-0 spans the viewport; container-page inside keeps the bar
          aligned with the rest of the page. z-40 sits above page content
          (z-10) and below the sticky navbar (z-50). */}
      <div className="fixed bottom-0 inset-x-0 z-40">
        <div className="container-page">
          <div className="glass rounded-t-xl overflow-hidden border border-b-0 border-ink-200/20 dark:border-paper-50/10">
            {/* Progress/seek line across the very top of the dock. Its thumb
                stays hidden until hover, so the resting state is just a rule. */}
            <Scrubber variant="slim" className="w-full" />

            <div className="flex items-center gap-3 px-3 sm:px-4" style={{ height: BAR_H }}>
              {/* Artwork and title together are the expand trigger, so they
                  share one button. It is the only click target in the bar that
                  opens the sheet — the transport, volume and queue controls all
                  sit outside it.

                  The artwork is hidden on phones: five transport buttons leave
                  the title only a few characters there, and the art still reads
                  on /music. The button still works without it, since the title
                  is what it is named by. */}
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setExpanded(true)}
                aria-expanded={expanded}
                aria-haspopup="dialog"
                className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-md
                           -ml-1 pl-1 pr-1 py-1 hover:bg-ink-900/5 dark:hover:bg-paper-50/5
                           transition-colors"
              >
                <span className="hidden sm:block shrink-0">
                  <TrackArt
                    art={track.art}
                    src={track.cover}
                    label={`Cover art for ${track.title}`}
                    className={`w-10 h-10 ${loading && !isPlaying ? 'animate-pulse' : ''}`}
                  />
                </span>

                {/* Title over artist. aria-live announces track changes without
                    interrupting whatever the listener is doing. The paragraphs
                    become spans because a button's content model is phrasing
                    content only, and each is pulled up to block by its own
                    class rather than by a wrapper. */}
                <span className="min-w-0 flex-1">
                  <span aria-live="polite" className="block font-mono text-sm font-medium truncate">
                    {track.title}
                  </span>
                  <span className="block font-mono text-[11px] text-ink-600 dark:text-paper-200/60 truncate">
                    {error ? (
                      <span className="text-amber">{error}</span>
                    ) : (
                      `${track.artist} · ${playlist.title}`
                    )}
                  </span>
                </span>
              </button>

              <Transport size="sm" />

              {/* Elapsed / total. Wide viewports only — the dock stays
                  comfortable on a phone without it. */}
              <div className="hidden lg:flex items-center gap-1.5 shrink-0 font-mono text-[11px] tabular-nums text-ink-600 dark:text-paper-200/50">
                <span>{formatTime(currentTime)}</span>
                <span className="opacity-50">/</span>
                <span>{formatTime(duration)}</span>
              </div>

              <VolumeControl className="hidden sm:flex" />

              {/* Jump to the full tracklist — of the playlist that is playing,
                  not of whichever one the music page last showed, since the
                  dock can be reached from any page. Doubles as a readout of the
                  active modes for anyone who has not noticed the button
                  colours. */}
              <Link
                to={`/music/${playlist.id}`}
                title={`Shuffle ${shuffle ? 'on' : 'off'}, ${REPEAT_WORDS[repeat]}`}
                className="hidden md:flex items-center gap-1.5 shrink-0 font-mono text-xs text-ink-600 dark:text-paper-200/70 hover:text-amber transition-colors"
              >
                <QueueIcon width={15} height={15} />
                queue
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* Full-screen now-playing view, mounted only while open.

          Deliberately a sibling of the bar's fixed wrapper rather than a child of
          it: that wrapper carries z-40, which makes it a stacking context, so a
          z-60 child would still be painted underneath the z-50 navbar. As a
          sibling it competes in the root context and covers everything,
          including the bar it was opened from. */}
      {expanded && <PlayerSheet onClose={() => setExpanded(false)} openerRef={triggerRef} />}
    </>
  )
}

// Spelled out for the queue link's tooltip, where "all"/"one" would be cryptic.
const REPEAT_WORDS = {
  off: 'repeat off',
  all: 'repeating the playlist',
  one: 'repeating this track',
}
