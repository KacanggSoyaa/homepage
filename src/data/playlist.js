// playlist.js — the hand-maintained half of the site's music library.
//
// The audio and the track lists are generated: scripts/import-audio.mjs writes
// src/data/audio-manifest.js from the folders under public/audio, one folder per
// playlist. This file holds the parts a human curates — a playlist's title, who
// it's by, where it came from, how it may be used — keyed by playlist id, which
// is the folder name under public/audio:
//
//   public/audio/mood    ->   mood:   { title: 'Mood', artist: 'Various artists' }
//   public/audio/focus   ->   focus:  { title: 'Deep Focus', artist: 'Various artists' }
//
// Keeping the wording here rather than in the manifest is what makes
// re-importing audio safe: the importer rewrites the track lists and never reads
// or writes this file, so a title you chose survives every future import.
//
// A folder with no entry here still works. The title falls back to the id read
// as words, so "late-night" shows as "Late Night" and a brand-new playlist
// appears in the switcher the moment it is imported.

import { audioUrl } from './audio.js'
import { library } from './audio-manifest.js'
import bodyProfile from '../components/img/bodyProfile.jpg'

const UNKNOWN = 'Unknown artist'

// One photograph stands in for the artwork of every track in the library. It is
// imported rather than referenced by path so the bundler fingerprints and
// serves it from the site's own assets, and so a typo fails the build instead of
// a broken image. Set `cover: null` on a playlist to fall back to the generated
// planet art in TrackArt.
const COVER = bodyProfile

export const playlistMeta = {
  mood: {
    title: 'Mood',
    artist: 'Various artists',
    description: 'The songs I keep coming back to, hosted here rather than streamed.',
  },
  focus: {
    title: 'Deep Focus',
    artist: 'Various artists',
    description: 'Instrumental, for working through something long.',
  },
}

// "late-night" -> "Late Night". Only ever the fallback for a title: anything set
// in playlistMeta above is used exactly as written.
const humanize = (id) =>
  id
    .split('-')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ') || id

/**
 * Every playlist on the site, generated track lists merged with the metadata
 * above. The id is also the URL: /music/mood, /music/focus.
 */
export const playlists = library.playlists.map((generated) => {
  const meta = playlistMeta[generated.id] || {}
  const artist = meta.artist || UNKNOWN
  return {
    id: generated.id,
    title: meta.title || humanize(generated.id),
    artist,
    description: meta.description || `${generated.tracks.length} tracks, hosted on this site.`,
    license: meta.license || null,
    licenseUrl: meta.licenseUrl || null,
    source: meta.source || null,
    // Track artists come from the manifest, where the importer split them off the
    // "Artist - Song" filename. A file that does not name an artist has none
    // stored, and falls back to the playlist's own. Spreading `artist` onto each
    // track keeps every consumer — the tracklist rows, the dock, the media
    // session — reading one field.
    //
    // 'file' is the path inside the audio root; 'src' is the URL the player
    // actually loads, which is the same path until audio.js is told the audio
    // lives on another host. Resolving it here, rather than in the generated
    // manifest, is what lets a re-import never disturb where the site looks for
    // its music.
    tracks: generated.tracks.map((track) => ({
      ...track,
      src: audioUrl(track.file),
      artist: track.artist || artist,
      cover: meta.cover === undefined ? COVER : meta.cover,
    })),
  }
})

const byId = new Map(playlists.map((playlist) => [playlist.id, playlist]))

/**
 * The playlist with this id, or the first one when the id is unknown.
 *
 * The fallback is what keeps a stale bookmark or a renamed folder from rendering
 * an empty page: /music/late-night still opens the library.
 */
export const getPlaylist = (id) => byId.get(id) || playlists[0] || null

export const hasPlaylist = (id) => byId.has(id)
