// heic-to-jpg.mjs — converts HEIC/HEIF photos to JPG (or WebP) for the web.
//
// Browsers (outside Safari) can't display .heic, so this script converts any
// .heic/.heif files found in the blog images folder into web-friendly files you
// can reference in src/data/blog.js.
//
// Quality/size balance:
//   - Default is FULL QUALITY: quality 100 at original resolution — no visible
//     loss, at the cost of larger files (several MB per photo).
//   - If you'd rather have smaller files, pass --quality=<n> and/or --width=<px>
//     (or use --format=webp which looks great at lower sizes).
//
// Usage:
//   npm run heic:jpg                          convert blog photos (default folder)
//   npm run heic:jpg -- <folder>              convert a specific folder
//   npm run heic:jpg -- --delete              also delete the original .heic files
//   npm run heic:jpg -- --overwrite           re-convert even if the output exists
//   npm run heic:jpg -- --quality=90          set quality 0-100 (default 100 = max)
//   npm run heic:jpg -- --width=1920          resize to max width in px
//                                             (default: keep original resolution)
//   npm run heic:jpg -- --format=webp         output WebP instead of JPG (default jpg)
//
// The output keeps the same name as the source (photo.heic → photo.jpg / photo.webp).
// EXIF orientation is respected, so upside-down phone photos are corrected.
// Subfolders (e.g. an "August26" album) are scanned automatically.

import { existsSync, readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_DIR = path.resolve(__dirname, '../src/components/img/blog')

// Parse command-line arguments into a small options object.
const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const positional = args.filter((a) => !a.startsWith('--'))

const targetDir = path.resolve(positional[0] || DEFAULT_DIR)
const deleteSource = flags.has('--delete')
const overwrite = flags.has('--overwrite')
const qualityFlag = [...flags].find((f) => f.startsWith('--quality='))
const quality = qualityFlag ? Number(qualityFlag.split('=')[1]) : 100
const widthFlag = [...flags].find((f) => f.startsWith('--width='))
const width = widthFlag ? Number(widthFlag.split('=')[1]) : 0
const formatFlag = [...flags].find((f) => f.startsWith('--format='))
const format = formatFlag ? formatFlag.split('=')[1].toLowerCase() : 'jpg'

// Only these two formats are web-safe; anything else falls back to jpg.
const OUTPUT_FORMATS = {
  jpg: 'jpg',
  jpeg: 'jpg',
  webp: 'webp',
}
const outFormat = OUTPUT_FORMATS[format] || 'jpg'
const outExt = outFormat === 'webp' ? 'webp' : 'jpg'

const HEIC_EXTS = ['.heic', '.heif']
const results = { ok: 0, skipped: 0, failed: 0 }

if (!existsSync(targetDir)) {
  console.error(`✗ Folder not found: ${targetDir}`)
  process.exit(1)
}

// Recursively collect every .heic/.heif file inside the folder, including
// subfolders (e.g. an "August26" album directory).
function findHeicFiles(dir) {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      found.push(...findHeicFiles(full))
    } else if (HEIC_EXTS.includes(path.extname(entry).toLowerCase())) {
      found.push(full)
    }
  }
  return found
}

const files = findHeicFiles(targetDir)

if (files.length === 0) {
  console.log(`No HEIC/HEIF files found in:\n  ${targetDir}`)
  process.exit(0)
}

console.log(`Converting ${files.length} file(s) in ${targetDir}\n`)

for (const src of files) {
  const base = path.basename(src)
  const out = path.join(path.dirname(src), path.basename(src, path.extname(src)) + '.' + outExt)

  if (existsSync(out) && !overwrite) {
    console.log(`• skip   ${base} — ${path.basename(out)} already exists (use --overwrite)`)
    results.skipped++
    continue
  }

  try {
    let decodedBuffer
    try {
      // Preferred path: sharp (fast native decoder). Covers most HEIC files.
      // PNG is used as the intermediate step so decoding stays lossless —
      // the only lossy step is the final JPEG/WebP encode.
      decodedBuffer = await sharp(src).rotate().png().toBuffer()
    } catch {
      // Fallback: heic-convert (pure-JS decoder). Handles HEVC-compressed
      // iPhone photos that sharp's bundled codec can't decode.
      const convert = (await import('heic-convert')).default
      decodedBuffer = await convert({
        buffer: readFileSync(src),
        format: 'PNG',
      })
    }

    // Final encode. width > 0 resizes (max width, never upscales), while the
    // default width=0 keeps the photo at its original resolution.
    const pipeline = sharp(decodedBuffer).resize({
      width: width > 0 ? width : undefined,
      withoutEnlargement: true,
    })
    if (outFormat === 'webp') {
      // WebP keeps visual quality high at much smaller file sizes than JPEG.
      await pipeline.webp({ quality }).toFile(out)
    } else {
      await pipeline.jpeg({ quality }).toFile(out)
    }
    if (deleteSource) {
      unlinkSync(src)
      console.log(`✓ ${base} → ${path.basename(out)} (original deleted)`)
    } else {
      console.log(`✓ ${base} → ${path.basename(out)}`)
    }
    results.ok++
  } catch (err) {
    console.error(`✗ ${base} — ${err.message.split('\n')[0]}`)
    results.failed++
  }
}

const { ok, skipped, failed } = results
console.log(
  `\nDone: ${ok} converted, ${skipped} skipped, ${failed} failed.` +
    (deleteSource ? '' : '\nTip: add --delete to remove the original .heic files.'),
)