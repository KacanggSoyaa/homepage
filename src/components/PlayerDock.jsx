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

import { Link } from 'react-router-dom'
import { formatTime, usePlayer } from '../player/PlayerContext.jsx'
import TrackArt from './TrackArt.jsx'
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

  // With no tracks there is nothing to show and nothing to control, so the bar
  // and the spacer that reserves its height are both dropped. Rendering it
  // anyway would mean a row of dead buttons and a track with no title, since
  // `track` is undefined for an empty library. Safe to return early: the only
  // hook above is the context read.
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
              {/* Artwork for the loaded track, pulsing while it buffers.
                  Hidden on phones: five transport buttons leave the title only
                  a few characters there, and the art still reads on /music. */}
              <div className="hidden sm:block shrink-0">
                <TrackArt
                  art={track.art}
                  label={`Cover art for ${track.title}`}
                  className={`w-10 h-10 ${loading && !isPlaying ? 'animate-pulse' : ''}`}
                />
              </div>

              {/* Title over artist. aria-live announces track changes without
                  interrupting whatever the listener is doing. */}
              <div className="min-w-0 flex-1">
                <p aria-live="polite" className="font-mono text-sm font-medium truncate">
                  {track.title}
                </p>
                <p className="font-mono text-[11px] text-ink-600 dark:text-paper-200/60 truncate">
                  {error ? (
                    <span className="text-amber">{error}</span>
                  ) : (
                    `${track.artist} · ${playlist.title}`
                  )}
                </p>
              </div>

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
    </>
  )
}

// Spelled out for the queue link's tooltip, where "all"/"one" would be cryptic.
const REPEAT_WORDS = {
  off: 'repeat off',
  all: 'repeating the playlist',
  one: 'repeating this track',
}
