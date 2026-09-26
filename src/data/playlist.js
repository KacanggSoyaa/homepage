// playlist.js — hand-maintained half of the site's music library.
//
// The track list itself is generated: src/data/audio-manifest.js is written by
// scripts/import-audio.mjs, which encodes whatever audio you point it at and
// keeps public/audio in step. This file holds the parts a human curates.
//
// To change the songs, run the importer against a folder of audio you have the
// rights to redistribute:
//
//   node scripts/import-audio.mjs ~/Music/my-playlist --title "Mood"
//
// The set that shipped with the site was "free archive of ambient music" by
// josh korda, released under CC0 1.0 Universal, re-encoded to 2:30 mono
// 64 kbps excerpts — about 14 MB for twelve tracks. Regenerate that exact
// state with:
//
//   node scripts/import-audio.mjs --title ... --license "CC0 1.0 Universal"

import { manifest } from './audio-manifest.js'

export const playlist = manifest

export const tracks = manifest.tracks
