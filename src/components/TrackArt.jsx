// TrackArt.jsx — cover art for a track.
//
// Most tracks are CC0 and had no artwork to ship, so each one gets a small
// procedural SVG instead: a gradient built from the site's amber/teal accents
// with a planet and orbit ring over it. The layout is derived from the track's
// `art` index, so a given track always looks the same, and the whole set costs
// nothing in the bundle and nothing in the repository.
//
// A playlist can override that with a real photograph by setting `cover` in
// src/data/playlist.js. When `src` is given the photo is used and the generated
// art is skipped, so one picture can stand in for a whole playlist.

import { useId } from 'react'

// Gradient pairs drawn from the index.css tokens (amber, teal) plus deeper
// space tones that sit between them.
const PALETTES = [
  { from: '#E8A33D', to: '#6E4110' },
  { from: '#5EC8C0', to: '#10403E' },
  { from: '#F0B85F', to: '#4C2A57' },
  { from: '#7FD6CF', to: '#182650' },
  { from: '#C4832A', to: '#241A38' },
  { from: '#5EC8C0', to: '#0D262B' },
  { from: '#E8A33D', to: '#0F3050' },
  { from: '#A78BFA', to: '#1B1844' },
]

// Stable 0..1 values from an integer seed — the artwork has to be identical on
// every render, so the "randomness" is fully deterministic.
const rand = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Cover art for one track.
 *
 * @param {number} art     Palette/layout index, normally `track.art`.
 * @param {string} src     Photograph to use instead of the generated art.
 * @param {string} className  Sizing classes, e.g. "w-10 h-10".
 * @param {string} label   Accessible name; omit to hide the image from a11y tree.
 */
export default function TrackArt({ art = 0, src, className = '', label }) {
  // A real photograph replaces the generated art entirely. object-cover keeps it
  // filling whatever shape it is given, so a portrait photo sits correctly in the
  // square dock without the file needing to be pre-cropped.
  if (src) {
    return (
      <img
        src={src}
        alt={label || ''}
        aria-hidden={label ? undefined : 'true'}
        className={`block shrink-0 object-cover ${className}`}
        loading="lazy"
        decoding="async"
      />
    )
  }

  // React's useId includes colons, which are not safe inside url(#...) refs.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const seed = art % PALETTES.length
  const palette = PALETTES[seed]

  const planetX = 20 + rand(seed * 3 + 1) * 24
  const planetY = 20 + rand(seed * 3 + 2) * 24
  const planetR = 7 + rand(seed * 3 + 3) * 9
  const tilt = -30 + rand(seed * 3 + 4) * 60
  const dotX = 8 + rand(seed * 3 + 5) * 48
  const dotY = 8 + rand(seed * 3 + 6) * 48
  const dotR = 0.9 + rand(seed * 3 + 7) * 1.4

  return (
    <svg
      viewBox="0 0 64 64"
      className={`block shrink-0 ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      <defs>
        <linearGradient id={`${uid}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
        <radialGradient id={`${uid}sheen`} cx="0.3" cy="0.22" r="0.85">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="64" height="64" rx="10" fill={`url(#${uid}bg)`} />
      <rect width="64" height="64" rx="10" fill={`url(#${uid}sheen)`} />

      {/* Faint orbit ring behind the planet */}
      <ellipse
        cx={planetX}
        cy={planetY}
        rx={planetR * 1.75}
        ry={planetR * 0.55}
        transform={`rotate(${tilt} ${planetX} ${planetY})`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.3"
        strokeWidth="0.7"
      />

      {/* The planet itself */}
      <circle cx={planetX} cy={planetY} r={planetR} fill="#ffffff" fillOpacity="0.22" />
      <circle cx={planetX} cy={planetY} r={planetR * 0.62} fill="#ffffff" fillOpacity="0.18" />

      {/* A single distant star, to break up the gradient */}
      <circle cx={dotX} cy={dotY} r={dotR} fill="#ffffff" fillOpacity="0.5" />
    </svg>
  )
}
