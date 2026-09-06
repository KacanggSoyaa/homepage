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

## Notes

- Dark/light theme is toggled from the navbar and saved in `localStorage`.
- The contact form currently just logs to the console (see `TODO` in
  `src/pages/Contact.jsx`) — connect it to a service like Formspree or
  EmailJS if you want it to actually send messages, since there's no backend.
- Fonts (IBM Plex Mono / IBM Plex Sans) are loaded from Google Fonts via a
  `<link>` in `index.html`, so you'll need an internet connection the first
  time you load the site for fonts to appear correctly.
