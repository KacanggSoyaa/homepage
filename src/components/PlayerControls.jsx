// PlayerControls.jsx — the transport controls, shared by the dock and the
// /music page so both render identical behaviour.
//
// Everything here reads from PlayerContext; none of it owns audio state.

import { useState } from 'react'
import { formatTime, usePlayer } from '../player/PlayerContext.jsx'
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  ShuffleIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from './Icons.jsx'

// Button and icon dimensions per transport size. "sm" is the dock, "md" the
// full-size control row on the music page. The dock's sizes step down below
// `sm` so that all five buttons and a readable title fit a 320px screen.
const SIZES = {
  sm: {
    gap: 'gap-0.5',
    toggle: 'w-7 h-7 sm:w-8 sm:h-8',
    play: 'w-9 h-9 sm:w-10 sm:h-10',
    icon: 15,
    playIcon: 17,
  },
  md: { gap: 'gap-2', toggle: 'w-10 h-10', play: 'w-14 h-14', icon: 20, playIcon: 24 },
}

const REPEAT_LABEL = {
  off: 'Repeat off',
  all: 'Repeat all',
  one: 'Repeat one',
}

/**
 * The styled range input that Scrubber and VolumeControl are built on.
 *
 * Played, buffered and unplayed are painted as a single gradient using CSS
 * variables that the .scrubber* rules in index.css read, so there is no
 * wrapper element per bar and no per-frame style churn beyond these two values.
 */
function RangeField({
  variant = 'default',
  value,
  max,
  buffered = 0,
  disabled = false,
  onInput,
  onSettle,
  className = '',
  ...rest
}) {
  const variantClass =
    variant === 'slim' ? 'scrubber-slim' : variant === 'mini' ? 'scrubber-mini' : 'scrubber'
  const percent = (n) => `${Math.min(100, Math.max(0, (n / max) * 100)).toFixed(2)}%`

  return (
    <input
      type="range"
      className={`${variantClass} ${className}`}
      style={{
        '--played': percent(value),
        // The buffered bar is never drawn behind the played bar.
        '--buffered': percent(Math.max(buffered, value)),
      }}
      min="0"
      max={max}
      step="0.1"
      value={value}
      disabled={disabled}
      onChange={(event) => onInput(Number(event.target.value))}
      onPointerUp={onSettle}
      onPointerCancel={onSettle}
      onBlur={onSettle}
      {...rest}
    />
  )
}

/** Seek bar. Stays disabled until the element reports a real duration. */
export function Scrubber({ variant = 'default', label = 'Seek within track', className = '' }) {
  const { currentTime, duration, buffered, ready, seek } = usePlayer()
  // While the pointer is held down the thumb follows the pointer rather than
  // the audio clock, so a slow seek cannot drag the thumb back to where it
  // started. Cleared on release, blur or cancel.
  const [scrubbing, setScrubbing] = useState(null)
  const shown = scrubbing === null ? currentTime : scrubbing
  const max = duration || 1

  return (
    <RangeField
      variant={variant}
      className={className}
      label={label}
      value={Math.min(shown, max)}
      max={max}
      buffered={buffered}
      disabled={!ready}
      aria-valuetext={`${formatTime(shown)} of ${formatTime(duration)}`}
      onInput={(value) => {
        setScrubbing(value)
        seek(value)
      }}
      onSettle={() => setScrubbing(null)}
    />
  )
}

/** Mute toggle plus a compact volume slider. Hidden on phones by the caller. */
export function VolumeControl({ className = '' }) {
  const { volume, muted, setVolume, toggleMute } = usePlayer()
  const silent = muted || volume === 0
  const level = Math.round((muted ? 0 : volume) * 100)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleMute}
        aria-label={silent ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
        title={silent ? 'Unmute' : 'Mute'}
        className="w-7 h-7 flex items-center justify-center rounded-md text-ink-600 dark:text-paper-200/60 hover:text-amber transition-colors shrink-0"
      >
        {silent ? <VolumeMuteIcon width={16} height={16} /> : <VolumeIcon width={16} height={16} />}
      </button>
      <RangeField
        variant="mini"
        className="w-20"
        label="Volume"
        value={level}
        max={100}
        aria-valuetext={`${level} percent`}
        onInput={(value) => setVolume(value / 100)}
      />
    </div>
  )
}

/** Shuffle, previous, play/pause, next, repeat. */
export function Transport({ size = 'sm', className = '' }) {
  const {
    isPlaying,
    loading,
    toggle,
    next,
    previous,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
  } = usePlayer()
  const s = SIZES[size] || SIZES.sm

  const base = 'flex items-center justify-center rounded-full transition-all duration-150 shrink-0'
  const idle = 'text-ink-600 dark:text-paper-200/60 hover:text-amber hover:bg-ink-900/5 dark:hover:bg-paper-50/5'
  const active = 'text-amber bg-amber/10 hover:text-amber-light hover:bg-amber/15'

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <button
        type="button"
        onClick={toggleShuffle}
        aria-pressed={shuffle}
        aria-label="Shuffle"
        title="Shuffle"
        className={`${base} ${s.toggle} ${shuffle ? active : idle}`}
      >
        <ShuffleIcon width={s.icon} height={s.icon} />
      </button>

      <button
        type="button"
        onClick={previous}
        aria-label="Previous track"
        title="Previous track"
        className={`${base} ${s.toggle} ${idle}`}
      >
        <PrevIcon width={s.icon} height={s.icon} />
      </button>

      {/* Primary control: filled amber, and pulses while a track is buffering. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
        className={`${base} ${s.play} bg-amber text-ink-950 hover:bg-amber-light hover:shadow-lg hover:shadow-amber/30 ${loading && !isPlaying ? 'animate-pulse' : ''}`}
      >
        {isPlaying ? (
          <PauseIcon width={s.playIcon} height={s.playIcon} />
        ) : (
          <PlayIcon width={s.playIcon} height={s.playIcon} />
        )}
      </button>

      <button
        type="button"
        onClick={next}
        aria-label="Next track"
        title="Next track"
        className={`${base} ${s.toggle} ${idle}`}
      >
        <NextIcon width={s.icon} height={s.icon} />
      </button>

      {/* repeat cycles off -> all -> one, so the label and the "1" overlay on
          the icon both change to say which mode is active. */}
      <button
        type="button"
        onClick={cycleRepeat}
        aria-pressed={repeat !== 'off'}
        aria-label={REPEAT_LABEL[repeat]}
        title={REPEAT_LABEL[repeat]}
        className={`${base} ${s.toggle} ${repeat === 'off' ? idle : active}`}
      >
        <RepeatIcon once={repeat === 'one'} width={s.icon} height={s.icon} />
      </button>
    </div>
  )
}

/** Three bouncing bars marking the row that is currently loaded. */
export function NowPlayingBars({ paused = false, className = '' }) {
  return (
    <span
      className={`playing-eq ${className}`}
      data-paused={paused ? 'true' : 'false'}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  )
}
