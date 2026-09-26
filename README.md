# Danis Nazri — Portfolio

A minimal, dark-mode-first portfolio built with React, Vite, React Router, and Tailwind CSS.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

The production build is output to the `dist/` folder — you can deploy that folder
to Vercel, Netlify, GitHub Pages, or any static host. Note that `dist/` only
contains the music if the audio is in `public/audio` at build time; the audio
tracks are git-ignored, so a build made from the repository (which is what the
GitHub Pages workflow does) needs the audio hosted separately — see
[Where the audio lives](#where-the-audio-lives).

## Where to edit your content

| What | File |
|---|---|
| Projects | `src/data/projects.js` |
| Certificates | `src/data/certificates.js` |
| Skills | `src/data/skills.js` |
| Blog / threads | `src/data/blog.js` (+ photos in `src/components/img/blog/`) |
| Bio / education | `src/pages/About.jsx` |
| Hero text | `src/pages/Home.jsx` |
| Music / tracks | `public/audio/<playlist>/*.mp3` + `node scripts/import-audio.mjs` (generates `src/data/audio-manifest.js`; titles live in `src/data/playlist.js`) |
| Contact links (email, GitHub, LinkedIn) | `src/components/Footer.jsx`, `src/pages/Contact.jsx` |

Every placeholder is marked with a `// TODO:` comment.

## Blog photos & image quality

The Threads section (on the `/about` page) shows casual posts with an optional
photo carousel. Photos are referenced from `src/data/blog.js` via the post's
`images` array.

**Recommended: use direct image links (no local files).** Host your photos on a
cloud album and paste the direct image URLs into the `images` array. This keeps
the build small and the site fast no matter how many photos you add:

```js
// src/data/blog.js
images: [
  'https://your-cloud-host.com/photo-1.jpg',
  'https://your-cloud-host.com/photo-2.jpg',
],
```

Good hosts for direct image links: Imgur, Cloudinary, GitHub raw
(`https://raw.githubusercontent.com/...`). Plain Google Photos share links do
NOT work — they open a web page, not the image itself.

**Google Photos → working link (automatic):** run the helper to extract the real
image URLs from any Google Photos share link:

```bash
npm run gphoto:link "https://photos.app.goo.gl/xxxx"       # prints direct URLs
npm run gphoto:link "<share-link>" --size=1920             # resized (lighter) links
```

**Alternative: convert local photos.** If you prefer keeping photos in the repo
(folder `src/components/img/blog/`, subfolders scanned), convert iPhone `.heic`
files first — browsers (except Safari) can't display them:

```bash
npm run heic:jpg
```

That produces full-quality `.jpg` files (quality 100, original resolution) — but
each 3024×4032 photo is ~7MB, which slows page loading. Rebalance quality vs.
speed with flags:

```bash
npm run heic:jpg -- --overwrite --quality=90 --width=1920   # nice quality, ~1.5MB
npm run heic:jpg -- --overwrite --quality=95 --width=1920   # higher quality, slightly larger
npm run heic:jpg -- --overwrite --width=0                   # full resolution, current quality
npm run heic:jpg -- --overwrite --quality=85 --width=1600   # smaller files, web-snappy
```

Other options:

- `--quality=<0-100>` — JPEG/WebP quality (default `100`).
- `--width=<px>` — resize to max width, never upscales (default: keep original).
- `--format=webp` — output `.webp` instead of `.jpg` (same look, smaller file).
- `--delete` — delete the original `.heic` after converting.
- Run `npm run heic:jpg -- <folder>` to convert a different folder.

See `src/components/img/blog/README.md` for the full documentation.

## Music: playlists and songs

The `/music` page is a real player — shuffle, loop, seek, volume, and a persistent
dock. It plays whatever audio sits in `public/audio`, and one generated file
decides what shows up: `src/data/audio-manifest.js`.

**One folder is one playlist**, and the folder tree is the whole library:

```
public/audio/mood/James Arthur - Car's Outside.mp3   ->  /music/mood
public/audio/focus/Ominous Tidings.mp3                ->  /music/focus
```

The folder name is the playlist's id, and the id is the last part of its URL, so
each playlist is linkable and the browser's back button moves between them. `/music`
with no id opens whichever playlist you had last.

### Adding a playlist

1. Make a folder: `public/audio/focus`
2. Drop the audio in
3. Run `node scripts/import-audio.mjs`
4. Give it a title in `src/data/playlist.js` (optional — the folder name is used
   until you do)

The importer picks up every folder in `public/audio` each time it runs, so this
is the whole procedure for the second playlist, the third, and every one after.

### Adding songs to a playlist you already have

Same thing — drop the files into that playlist's folder and re-run:

```bash
node scripts/import-audio.mjs
```

That never re-encodes and never rewrites your titles: it re-reads the folders and
regenerates the track lists. It takes a second.

### Importing a folder of music from elsewhere

To encode audio that isn't in the project yet, point the importer at it and name
the playlist:

```bash
node scripts/import-audio.mjs "~/Music/late-night" --id late-night
```

The files are encoded into `public/audio/late-night/` and the playlist is added.
Add `--limit 150` for 2:30 excerpts, `--quality small|medium|high` to pick a
bitrate.

**The source has to be outside the project.** The importer writes into
`public/audio/`, so a source inside it would hand ffmpeg the same file as both
input and output — the one way to lose the only copy of a track. It refuses
rather than trying:

```
The source is inside public/audio, so encoding would write each file onto itself.
```

### If your songs don't play

Audio sitting in `public/audio` that isn't listed in the manifest is **invisible**.
The player reads the manifest, not the folder, so tracks missing from it have no
play button, no duration, and no row — and `/music` renders its "nothing queued"
panel instead of a player. Having the files on disk is not enough; the manifest
is what makes them playable.

So if a folder is right but the page is empty, re-run the importer. The quickest
check is to open `src/data/audio-manifest.js` and look at `playlists: [...]` — if
the list is empty or a playlist is missing from it, nothing can play. Use
`--dry-run` first to see what it *would* write.

Other things that look like "it doesn't play":

| Symptom | Cause |
|---|---|
| A playlist is missing from the switcher | Its folder has no audio in it. The importer skips empty folders and says so. |
| Rows appear, pressing play shows "This track could not be loaded." | A 404 — the file named in the manifest isn't in `public/audio`. Renaming a file means re-running the importer. |
| Nothing happens on first load, works after a click | Expected. Browsers block audio that isn't tied to a user gesture; every control here starts from a click. |
| Player works locally, 404s on the deployed site | The audio is git-ignored, so the Pages build has none of it. Set the `VITE_AUDIO_BASE` repository variable — see [Where the audio lives](#where-the-audio-lives). The tracklist still looks right in this case, because the manifest is committed; only playback fails. |
| Tracks load but the console reports a CORS error | Only relevant if the code starts setting `crossOrigin` on the audio element. It doesn't, so a cross-origin bucket needs no CORS config — see [Where the audio lives](#where-the-audio-lives). |
| Player works locally, 404s on a hand-uploaded `dist/` | The audio wasn't in the build. Re-run `npm run build` — `public/` is copied into `dist/`, and anything added after a build is missing. |
| A track's time shows 0:00 until you press play | The duration is read from the file by the browser. It fills in on load. |

### Naming tracks

The filename becomes the display title, so name files the way you want them read
in the tracklist. A leading track number is stripped:

| Filename | Shown as |
|---|---|
| `01 - Ominous Tidings.mp3` | Ominous Tidings |
| `03_track.mp3` | track |
| `2001.mp3` | 2001 (numbers alone are left alone) |
| `Mahalini - Sial.mp3` | Mahalini - Sial |

The title keeps the artist prefix as typed above — the importer does **not** split
`Artist - Title` on the dash. Track artist comes from the playlist's `artist` in
`src/data/playlist.js`, so a mixed set is usually best labelled `Various artists`.

MP3, M4A, AAC, WAV, FLAC, OGG, OPUS and WEBM are all read.

### Removing a playlist

Delete the folder, re-run the importer, and remove its entry from
`src/data/playlist.js`. To delete the audio too, add `--clean` — it prunes files
in `public/audio` that no playlist references. That is permanent, so run
`--dry-run --clean` first to see the list.

### Options

| Flag | What it does |
|---|---|
| `--id <slug>` | Playlist id for an imported source (default: its folder name) |
| `--quality <name>` | `small` (mono 64k) · `medium` (stereo 128k, default) · `high` (stereo 256k) |
| `--limit <seconds>` | Trim each track to an excerpt, with a 1.5s fade |
| `--order <file>` | Pin the running order from a newline-separated list |
| `--normalize` | Even out loudness across tracks (single pass) |
| `--no-encode` | Don't encode; the source must already be in `public/audio` |
| `--clean` | Delete `public/audio` files no playlist references |
| `--allow-empty` | Keep a playlist whose folder holds no audio |
| `--dry-run` | Report everything, write nothing |
| `--help` | List the flags and exit |

Run with `--dry-run` first when you're unsure how it'll read your filenames — it
prints every playlist, title and output size without touching a file.

There is deliberately no `--title` or `--artist` flag. Those belong to a playlist
rather than to an import run, and with more than one playlist a single flag could
only ever name one of them, so they live in `src/data/playlist.js` instead.

### Where the audio lives

This is the one piece of setup that differs between your machine and the
published site, and it is worth understanding before you change anything else.

**The tracks are git-ignored.** `public/audio/*/*.mp3` and friends are excluded on
purpose: they're recordings you have no right to redistribute, so they stay out
of the repository. But that repo is also what the deploy builds from
(`.github/workflows/deploy.yml` checks it out and runs `npm run build` on
GitHub's servers), so **a build from the repo has no audio in it at all.**

That failure is quiet, which is why it's worth stating plainly. The manifest
*is* committed, so the deployed page still lists every playlist and every track
with correct durations. It looks completely healthy. Nothing tells you the audio
is missing until you press play and get "This track could not be loaded."

So the audio is hosted separately, and `src/data/audio.js` points at it:

| | Audio root | Resolves to |
|---|---|---|
| Local dev | same site | `/audio/mood/Sial.mp3` — served out of `public/audio` |
| Published | `VITE_AUDIO_BASE` | `https://your-audio-host/mood/Sial.mp3` |

The manifest never decides this. It records each track as a path inside the audio
root (`mood/Sial.mp3`) and stops there, so re-importing audio can't disturb where
the site looks for it — the same reason titles moved out of the manifest.

**To point a deploy at your audio host,** set one repository variable and
redeploy:

> Settings → Secrets and variables → Actions → **Variables** → New variable →
> `VITE_AUDIO_BASE` = `https://your-audio-host`

It's a variable rather than a secret because a public URL needs no
encrypting. The workflow passes it to the build, so future deploys need no code
change. The host has to serve `public/audio`'s layout — the `mood/` and `galau/`
subfolders — so uploading the contents of `public/audio/` to it does it directly.

Two ways to expose the bucket, both free:

- **`r2.dev` subdomain** — one toggle, live in a minute. Cloudflare describes it
  as development-only and applies a variable throttle (hundreds of requests per
  second, and bandwidth throttling too). Fine for a personal site with a handful
  of listeners; not something to depend on.
- **Custom domain** (`audio.kacanggsoyaa.ovh`) — production-appropriate, no
  throttle, and it gets Cloudflare's CDN caching. Requires adding the domain to
  Cloudflare as a zone first; the *partial (CNAME)* setup does this for the one
  subdomain and leaves your existing OVH DNS for the main site untouched.

**The free tier covers this comfortably.** 10 GB of storage is roughly 1,700
tracks at the current ~5.6 MB encodes, 10 million reads a month is about 300
plays a day, and egress — the billable thing on every other host — is free.
The one thing to know: R2 asks for a payment method when you create the account.
Nothing is charged while you stay inside those numbers, but set a billing alert
so an overrun is visible rather than surprising.

Unset, the build falls back to serving audio from the site itself. That's right
for local work and wrong for GitHub Pages, which is why the workflow comments
say so.

**Getting the layout right in the bucket.** `VITE_AUDIO_BASE` is the bucket's
root URL, and the manifest appends `mood/Sial.mp3` to it — so the playlist
folders need to sit at the *top level* of the bucket, not inside another
folder. Upload the contents of `public/audio/`, so the bucket looks like:

```
mood/James Arthur - Car's Outside.mp3
galau/Mahalini - Sial.mp3
```

`dist/audio/` has the same layout if you've built recently, but `public/audio/`
is the canonical copy — `dist/` is a build artifact. Upload the folders, not
`public/audio` itself, or every track 404s on a stray path segment. The
`.txt` notes in a playlist folder are optional to upload; nothing references
them.

**CORS is not needed.** The player sets no `crossOrigin` attribute, so the
browser requests the audio in no-cors mode and plays it without any
`Access-Control-Allow-Origin` header. That's why an R2 bucket works here with no
CORS configuration at all. It would only matter if the code ever needed to read
the audio bytes — the Web Audio API, or drawing it to a canvas — which it
doesn't.

### Keeping the deploy small

Audio is no longer part of `dist/` on a Pages build, so it doesn't bloat the site
or the repo — but it is still re-uploaded to the audio host on every change, and
bandwidth is what costs money there. Full-length tracks are big: the two
currently in `public/audio` are ~11 MB, and at ~192 kbps a 100-track library is
~570 MB.

`--no-encode` never shrinks anything, so to actually reduce the weight, re-encode
from a copy kept **outside** the project:

```bash
# 1. copy the originals out of the project first
Copy-Item "public\audio\mood\*" "$HOME\Music\mood\"        # Windows PowerShell

# 2. re-encode from there — the files land back in public/audio/mood
node scripts/import-audio.mjs "$HOME/Music/mood" --id mood --limit 210 --quality medium
```

That trims each track to a 3:30 excerpt with a fade at both ends, at stereo
128 kbps. The new encodes share the originals' filenames, so they replace them in
place; add `--clean` to also delete files no playlist references. Drop
`--limit` to keep full lengths and shrink only the bitrate.

`--quality small` is mono 64 kbps — fine for ambient/drone material, thin for
anything with bass in it. `medium` is the safer default.

Note the source in that command is *not* `public/audio`. Re-encoding writes to
that same tree, so importing from inside it would hand ffmpeg each file as both
input and output; the importer refuses rather than risk the only copy of a track.

### Custom running order

`--order` takes a plain text file, one filename per line. Anything not listed
keeps its alphabetical position after the listed tracks rather than being dropped.

```bash
node scripts/import-audio.mjs "~/Music/mood" --id mood --order my-order.txt
```

`#` starts a comment, and blank lines are ignored — see `scripts/cc0-order.txt`
for a worked example.

### Starting from empty

An empty library is a supported state. `/music` renders a short "nothing queued"
panel instead of a player, and the dock is not mounted at all, so an empty
library costs the page no dead controls.

Folders with no audio in them are skipped, so a playlist you have created but not
filled yet costs nothing — it just doesn't appear in the switcher until there's
something in it. Pass `--allow-empty` to keep those as empty playlists, which
render a short "this playlist is empty" note instead.

### Naming a playlist

Titles, artists, descriptions and licences are hand-maintained in
`src/data/playlist.js`, keyed by playlist id:

```js
export const playlistMeta = {
  mood: {
    title: 'Mood',
    artist: 'Various artists',
    description: 'The songs I keep coming back to.',
  },
  focus: {
    title: 'Deep Focus',
    artist: 'Various artists',
    // Only for audio that genuinely is public domain or CC-licensed. Left out,
    // the page says the audio is hosted for personal listening and not offered
    // for redistribution, which is the honest wording for anything you own.
    // license: 'CC0 1.0 Universal',
    // licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    // source: 'https://wherever-it-came-from',
  },
}
```

A playlist with no entry here still works: the title falls back to the folder
name read as words, so `late-night` shows as "Late Night".

Keeping this separate from the manifest is the point — the importer rewrites
`src/data/audio-manifest.js` on every run and never reads or writes
`src/data/playlist.js`, so wording you chose survives every future import.

### Notes

- `src/data/audio-manifest.js` is **generated** — don't hand-edit it, or your next
  import will overwrite your changes. Titles and licences live in
  `src/data/playlist.js`.
- Two folders that normalise to the same id ("Late Night" and "late-night") are
  refused rather than silently shadowing each other, since the manifest is keyed
  by id and the id is the URL.
- Importing needs **ffmpeg**, which ships with the project as the `ffmpeg-static`
  dev dependency — so a fresh `npm install` is all you need. The importer looks
  for it in this order: the `FFMPEG_PATH` environment variable, `ffmpeg` on your
  `PATH`, `node_modules/ffmpeg-static/`, then a legacy copy under `%TEMP%`. If it
  can't find one it prints the fix and stops without writing anything.
- `--clean` **deletes** audio in `public/audio` that no playlist references. It
  leaves non-audio files and empty folders alone. Run `--dry-run --clean` first
  to see the list — a dry run does not protect you from a real one.
- Re-encoding a folder of full-length tracks takes a few minutes. A plain
  `node scripts/import-audio.mjs` re-reads the folders without encoding anything
  and finishes in a second.
- Any change to `public/audio` — adding, renaming, deleting — needs a fresh import
  to reach the player. The manifest holds the filenames, so a rename without a
  re-import is a 404.
- **The audio is git-ignored**, so a deploy built from the repo has no audio in
  it — the site is pointed at a separate audio host instead. See
  [Where the audio lives](#where-the-audio-lives); that's the first thing to
  check if every track fails to load on the published site while working
  perfectly on localhost.

## Notes

- Dark/light theme is toggled from the navbar and saved in `localStorage`.
- The contact form currently just logs to the console (see `TODO` in
  `src/pages/Contact.jsx`) — connect it to a service like Formspree or
  EmailJS if you want it to actually send messages, since there's no backend.
- Fonts (IBM Plex Mono / IBM Plex Sans) are loaded from Google Fonts via a
  `<link>` in `index.html`, so you'll need an internet connection the first
  time you load the site for fonts to appear correctly.
