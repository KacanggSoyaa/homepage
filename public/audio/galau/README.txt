Playlist folder.

The name of this folder is the playlist's id, and the id is the last part of its
URL -- this folder is /music/galau. Rename it to whatever you want the playlist
called; letters, numbers and dashes are what you get, so "Late Night" would
become "late-night".

To add a song, drop the audio in here and run:

    node scripts/import-audio.mjs

Until you give the playlist a title of its own it is shown by this folder's name
read as words, so this one is "Galau". Titles, artists and licences are set in
src/data/playlist.js under the same id, and the importer never writes to that
file, so a title you choose survives every future import.
