// audio.js — where the music lives.
//
// The generated manifest (src/data/audio-manifest.js) records each track as a
// path inside the audio root, e.g. "mood/Sial.mp3", and knows nothing about
// URLs. This file decides what that root is, which is the one piece of the
// setup that changes between where you run the site and where you publish it:
//
//   locally          the audio is in public/audio and is served by Vite, so the
//                    root is this site and AUDIO_BASE stays ''
//   GitHub Pages     the audio is not in the repository (the tracks are
//                    recordings you have no right to redistribute, so they are
//                    git-ignored), so the build here produces a site whose
//                    music 404s unless AUDIO_BASE points somewhere the audio
//                    actually is
//
// Set it in src/data/audio.js, or per-build with a VITE_AUDIO_BASE environment
// variable — which is how the deploy workflow does it, so a redeploy needs no
// code change. The environment variable wins when it is set to a non-empty
// value; the constant below is the fallback for local work.
//
// Either way this is a plain string, not a flag on the importer. Like a
// playlist's title, where the audio is served is a property of the site rather
// than of an import run, and one flag could only ever describe one of them.

const HAND_MAINTAINED_BASE = ''

/**
 * The root the audio is served from, without a trailing slash. Empty means
 * "same origin as this page", which is what local development uses.
 */
export const AUDIO_BASE = import.meta.env.VITE_AUDIO_BASE || HAND_MAINTAINED_BASE

// Vite's base, so the local case still works if the site is ever served from a
// subpath rather than a domain root. It is '/' in vite.config.js today.
const SITE_BASE = import.meta.env.BASE_URL || '/'

/**
 * The URL for one track, from its path within the audio root.
 *
 * A configured base is treated as a prefix, not a replacement, so it has to end
 * in a slash. Trailing slashes are tolerated either way because a doubled one
 * is a redirect rather than an error, and a missing one is a 404 on every
 * single track — worth normalising here rather than in the constant.
 */
export const audioUrl = (file) => {
  if (AUDIO_BASE) return `${AUDIO_BASE.replace(/\/+$/, '')}/${file}`
  const base = SITE_BASE.endsWith('/') ? SITE_BASE : `${SITE_BASE}/`
  return `${base}audio/${file}`
}
