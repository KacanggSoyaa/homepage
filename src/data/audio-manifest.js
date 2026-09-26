// GENERATED FILE — do not edit by hand.
//
// Written by scripts/import-audio.mjs. Re-run the importer to change the audio.
// Titles, artists and licences are hand-maintained in src/data/playlist.js,
// keyed by these playlist ids.

const BASE = import.meta.env.BASE_URL || '/'
const audioPath = (file) => `${BASE.endsWith('/') ? BASE : `${BASE}/`}audio/${file}`

export const library = {
  playlists: [
    {
      id: 'galau',
      tracks: [
        { id: 1, title: 'Mahalini - Sial', src: audioPath('galau/Mahalini - Sial.mp3'), duration: 244, art: 0 },
      ],
    },
    {
      id: 'mood',
      tracks: [
        { id: 1, title: 'James Arthur - Car\'s Outside', src: audioPath('mood/James Arthur - Car\'s Outside.mp3'), duration: 246, art: 1 },
      ],
    },
  ],
}
