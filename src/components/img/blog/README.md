# Blog Photos 📸

Photos for your blog threads. There are two ways to attach them — **link from a
cloud album (recommended)** or **store locally in this folder**.

## Quick — post a new photo (3 steps) ⚡

1. **Get the direct link** — in the project folder, run:

   ```bash
   npm run gphoto:link "https://photos.app.goo.gl/XXXX"
   ```

   It prints one or more `lh3.googleusercontent.com/...` URLs. Copy one.

2. **Add a post** — open `src/data/blog.js` and insert a new object at the **top**
   of `blogPosts` (most recent first):

   ```js
   {
     id: 3,               // next unused number
     date: '2026-09-06',  // YYYY-MM-DD
     text: 'your caption ', // shown in the feed
     tag: 'daily',        // optional badge
     likes: 10,
     images: ['https://lh3.googleusercontent.com/pw/...'], // from step 1
   },
   ```

   → Add more URLs to `images` (comma-separated) for a swipeable carousel.

3. **View it** — if running, refresh `http://localhost:5173/about`. If not,
   `npm run dev`. For the live site: `npm run build`, then redeploy.

## Option A — link photos from the cloud (recommended) 🚀

Host your photos on a cloud album and paste the **direct image links** into the
`images` array in `src/data/blog.js`. Nothing is bundled into the site, so the
build stays small and the pages load fast no matter how many photos you add:

```js
// src/data/blog.js
images: [
  'https://your-cloud-host.com/photo-1.jpg',
  'https://your-cloud-host.com/photo-2.jpg',
],
```

Good hosts that give direct image links:

- **Imgur** — upload, right-click the image → "Copy image address".
- **Cloudinary** — media uploads get permanent direct URLs.
- **GitHub raw** — `https://raw.githubusercontent.com/you/repo/path/photo.jpg`
  (works great since this project is already on GitHub).

⚠️ Plain **Google Photos** share links do NOT work — they open a web page, not
the image file. Same for Facebook/Instagram links.

**Google Photos → working link (automatic):** instead of hunting for "Copy image
address", run the included helper:

```bash
npm run gphoto:link "https://photos.app.goo.gl/xxxx"      # prints direct image URL(s)
npm run gphoto:link "https://photos.google.com/share/xxx" # same, for full share links
npm run gphoto:link "<link>" --size=1920                  # resize to 1920px max (lighter)
```

It opens the share page and prints the real `lh3.googleusercontent.com/...` URLs
— just paste those into `images`. Single-photo links give one URL; album links
give one per photo (pick the ones you want).

If a link is wrong or the host blocks hotlinking, the carousel shows a neat
"image unavailable" placeholder instead of a broken icon.

## Option B — store photos locally

Browsers (except Safari) **cannot display `.heic`/`.heif` files**, so iPhone
photos need converting first:

1. Drop your iPhone/HEIC photos anywhere in this folder (subfolders are fine).
2. Convert them:

```bash
npm run heic:jpg
```

3. Import the resulting `.jpg` files in `src/data/blog.js` and add them to a post's `images` array.

```js
import photo1 from '../components/img/blog/DSC_001.jpg'

// ...
images: [photo1, photo2, photo3],
```

They display as a swipeable carousel in the feed (thumbnail) and on the thread's detail page.

### Why convert `.heic`?

| Format | Chrome / Edge / Firefox / Android | Safari (iPhone/Mac) |
| ------ | --------------------------------- | ------------------- |
| `.heic` | ❌ won't display | ⚠️ partial (native iPhones) |
| `.jpg`  | ✅ works everywhere | ✅ works everywhere |

### Script reference

Run from the project root. The script scans the whole folder **including subfolders** (e.g. an `August26` album).

```bash
npm run heic:jpg                          # convert all .heic/.heif -> .jpg (FULL QUALITY)
npm run heic:jpg -- --delete              # also delete the original .heic after converting
npm run heic:jpg -- --overwrite           # re-convert even if the output already exists
npm run heic:jpg -- --quality=90          # quality 0-100 (default 100 = max)
npm run heic:jpg -- --width=1920          # resize to a max width of 1920px (default: keep original)
npm run heic:jpg -- --format=webp         # output .webp instead of .jpg
npm run heic:jpg -- "C:\some\other\path"  # convert a different folder
```

Notes:

- **Full quality by default.** Photos are converted at quality 100 and kept at their original resolution, so there's no visible quality loss. The trade-off is big files (a 3024×4032 iPhone photo ends up ~7MB) — keep that in mind if your site feels slow.
- The output keeps the same name as the source (`photo.heic` → `photo.jpg`, or `photo.webp` with `--format=webp`).
- The script tries a fast native decoder first, then falls back to a pure-JS one that handles HEVC-compressed iPhone photos. Either way, your files convert.
- If you ever want smaller files again: pass `--quality=90 --width=1920` (nice quality, much lighter), or `--format=webp`.
- Original `.heic` files are kept by default — add `--delete` when you're sure you don't need them anymore.

## Supported image types for the site

`.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.gif` all work in `src/data/blog.js`, whether used as local imports or direct URLs. Only HEIC/HEIF need the conversion step.