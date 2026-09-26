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
to Vercel, Netlify, GitHub Pages, or any static host.

## Where to edit your content

| What | File |
|---|---|
| Projects | `src/data/projects.js` |
| Certificates | `src/data/certificates.js` |
| Skills | `src/data/skills.js` |
| Blog / threads | `src/data/blog.js` (+ photos in `src/components/img/blog/`) |
| Bio / education | `src/pages/About.jsx` |
| Hero text | `src/pages/Home.jsx` |
| Music / tracks | `public/audio/` + `scripts/import-audio.mjs` (generates `src/data/audio-manifest.js`) |
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

## Music: adding your own songs

The `/music` page is a real player — shuffle, loop, seek, volume, and a persistent
dock — and it plays whatever audio sits in `public/audio`. Only one thing controls
what shows up in the tracklist: the generated manifest.

**1. Drop your files into `public/audio`**

```
public/audio/Artist - Title.mp3
```

Naming them `Artist - Title` matters: the importer splits on the first dash and
fills in both fields, so `Mahalini - Sial.mp3` becomes artist *Mahalini*, title
*Sial*. Without the dash the whole filename becomes the title.

MP3, M4A, AAC, WAV, FLAC, OGG, OPUS and WEBM are all read.

**2. Empty the folder if you don't want the old set**

The importer reads the **whole** folder, so the CC0 tracks that ship with the site
are still in there and would get merged in. To start fresh, move them out first:

```bash
mv public/audio/* ~/somewhere-else/          # macOS / Linux
Move-Item "public\audio\*" "C:\somewhere-else\"   # Windows PowerShell
```

**3. Run the importer**

```bash
node scripts/import-audio.mjs "public/audio" --title "My Playlist"
```

That re-encodes everything in the folder and rewrites `src/data/audio-manifest.js`.

### Options

| Flag | What it does |
|---|---|
| `--title <text>` | Playlist title shown in the player |
| `--artist <text>` | Credit one artist for every track |
| `--description <text>` | One-line blurb under the title |
| `--quality <name>` | `small` (mono 64k) · `medium` (stereo 128k, default) · `high` (stereo 256k) |
| `--limit <seconds>` | Trim each track to an excerpt, with a 1.5s fade |
| `--order <file>` | Pin the running order from a newline-separated list |
| `--normalize` | Even out loudness across tracks (single pass) |
| `--no-encode` | Files are already encoded — just rebuild the manifest |
| `--clean` | Delete `public/audio` files the new manifest doesn't reference |
| `--allow-empty` | Permit a folder with no audio — writes an empty library |
| `--dry-run` | Report everything, write nothing |

Run with `--dry-run` first when you're unsure how it'll read your filenames — it
prints every title, artist, and output size without touching a file.

### Keeping the deploy small

Full-length tracks are big. A 14-song set of 5 MB encodes is ~76 MB shipped on
every deploy, which is most of your site. Two flags fix that:

```bash
node scripts/import-audio.mjs "public/audio" --title "My Playlist" --limit 210 --quality small
```

That trims to 3:30 excerpts at mono 64 kbps — roughly 8 MB for the same 14 songs.
`--quality small` is mono, so it's fine for ambient/drone material but thin for
anything with bass in it; use `--quality medium` as the safer default.

### Custom running order

`--order` takes a plain text file, one filename per line. Anything not listed
keeps its alphabetical position after the listed tracks rather than being dropped.

```bash
node scripts/import-audio.mjs "public/audio" --order my-order.txt
```

`#` starts a comment, and blank lines are ignored — see `scripts/cc0-order.txt`
for a worked example.

### Starting from empty

An empty library is a supported state. `/music` renders a short "nothing queued"
panel instead of a player, and the dock is not mounted at all, so an empty
library costs the page no dead controls.

```bash
node scripts/import-audio.mjs public/audio --allow-empty --no-encode --title "Music"
```

`--allow-empty` is required on purpose — without it the importer stops on a
folder with no audio, so a mistyped path can't silently wipe your tracklist.
Add `--clean` to also delete whatever is sitting in `public/audio`.

### Restoring the CC0 set

The set that ships with the site is *free archive of ambient music* by josh korda,
under CC0 1.0, trimmed to 2:30 mono 64 kbps. `scripts/cc0-order.txt` holds the
curated running order and documents the exact command to rebuild it.

### Notes

- `src/data/audio-manifest.js` is **generated** — don't hand-edit it, or your next
  import will overwrite your changes. Page copy lives in `src/data/playlist.js`.
- Importing needs **ffmpeg**, which ships with the project as the `ffmpeg-static`
  dev dependency — so a fresh `npm install` is all you need. The importer looks
  for it in this order: the `FFMPEG_PATH` environment variable, `ffmpeg` on your
  `PATH`, `node_modules/ffmpeg-static/`, then a legacy copy under `%TEMP%`. If it
  can't find one it prints the fix and stops without writing anything.
- `--clean` **deletes** anything in `public/audio` the new manifest doesn't
  reference. It's safe on a normal import, but don't reach for it expecting a
  dry run to protect anything.
- Importing is slow — re-encoding 14 full tracks takes a few minutes. Use
  `--no-encode` to skip straight to the manifest when the files are already the
  encodes you want.

## Notes

- Dark/light theme is toggled from the navbar and saved in `localStorage`.
- The contact form currently just logs to the console (see `TODO` in
  `src/pages/Contact.jsx`) — connect it to a service like Formspree or
  EmailJS if you want it to actually send messages, since there's no backend.
- Fonts (IBM Plex Mono / IBM Plex Sans) are loaded from Google Fonts via a
  `<link>` in `index.html`, so you'll need an internet connection the first
  time you load the site for fonts to appear correctly.
