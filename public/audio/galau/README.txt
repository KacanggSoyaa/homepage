This folder is a playlist.

Anything you drop in here is ignored until you run the importer:

    node scripts/import-audio.mjs

The folder name is the playlist's id, and it is the last part of its URL —
this folder is /music/focus — so rename it to whatever you want the playlist
called. Use letters, numbers and dashes; "Late Night" becomes "late-night".

The playlist's title, artist and licence are set in src/data/playlist.js
under the same id, and survive every future import.
