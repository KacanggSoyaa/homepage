// playlist.js — the site's self-hosted music library.
//
// The player used to be a Spotify embed, which locked the page out of all
// transport control (Spotify audio is encrypted and its CDN URLs are signed
// per-session, so there is no file an <audio> tag can point at) and capped
// non-Premium visitors at 30-second previews. The audio is now CC0 and lives
// in public/audio/, so the site owns the files and controls playback outright.
//
// Source: "free archive of ambient music" by josh korda, released under
// CC0 1.0 Universal ("no copyright, use however you wish"). Re-encoding for
// the web (2:30 excerpt, mono 64 kbps) keeps the repo small; because the
// material is continuous ambient drone, the excerpts loop seamlessly and the
// player's loop button covers the rest.
//
// Track shape:
//   - id       : 1-based position (React key + row number)
//   - title    : track name
//   - artist   : credited artist
//   - src      : path to the encoded mp3 in public/audio
//   - duration : nominal length in seconds, used before metadata loads
//   - art      : index into TrackArt's palette, so every row has cover art
//                without shipping a single image file

// Vite rewrites this at build time (it is "/" for this site's config), which
// keeps the paths correct if the site is ever served from a subdirectory.
const BASE = import.meta.env.BASE_URL || '/'
const audioPath = (file) => `${BASE.endsWith('/') ? BASE : `${BASE}/`}audio/${file}`

export const playlist = {
  title: 'Free Archive of Ambient Music',
  artist: 'josh korda',
  description:
    'Twelve pieces of long-form ambient electronics, re-encoded for the web. Loop, shuffle, and scrub freely — the files are yours to host.',
  source: 'https://archive.org/details/FreeArchiveOfAmbientMusic',
  license: 'CC0 1.0 Universal',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
}

export const tracks = [
  { id: 1, title: 'Stasis', src: audioPath('stasis.mp3'), duration: 150, art: 0 },
  { id: 2, title: 'Ominous Tidings', src: audioPath('ominous-tidings.mp3'), duration: 150, art: 1 },
  { id: 3, title: 'Spacey Psychedelic Ambience', src: audioPath('spacey-psychedelic-ambience.mp3'), duration: 150, art: 2 },
  { id: 4, title: 'Hardly Ever Awake', src: audioPath('hardly-ever-awake.mp3'), duration: 150, art: 3 },
  { id: 5, title: 'Dim Light Peaking Over the Horizon', src: audioPath('dim-light-peaking-over-the-horizon.mp3'), duration: 150, art: 4 },
  { id: 6, title: 'The Monk Makes Slow Passage', src: audioPath('the-monk-makes-slow-passage.mp3'), duration: 150, art: 5 },
  { id: 7, title: 'Chromatic Shifts Over Sliding Tones', src: audioPath('chromatic-shifts-over-sliding-tones.mp3'), duration: 150, art: 6 },
  { id: 8, title: 'Overlapping Events in Time', src: audioPath('overlapping-events-in-time.mp3'), duration: 150, art: 7 },
  { id: 9, title: 'Low Visibility Advisory', src: audioPath('low-visibility-advisory.mp3'), duration: 150, art: 0 },
  { id: 10, title: 'Slow Ambient Arise and Pass', src: audioPath('slow-ambient-arise-and-pass.mp3'), duration: 150, art: 1 },
  { id: 11, title: 'Slowing to a Final Descent', src: audioPath('slowing-to-a-final-descent.mp3'), duration: 150, art: 2 },
  { id: 12, title: 'The Romance of Returning Signals', src: audioPath('the-romance-of-returning-signals.mp3'), duration: 150, art: 3 },
].map((track) => ({ ...track, artist: playlist.artist }))
