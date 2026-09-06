// gphoto-link.mjs — extracts direct image URLs from a Google Photos share link.
//
// Google Photos share links (photos.app.goo.gl/... or photos.google.com/share/...)
// are web pages, not image files, so they can't be used in a post's `images`
// array. This script opens the share page and pulls out the real
// "lh3.googleusercontent.com/..." image URLs embedded in it — those DO work.
//
// Usage:
//   npm run gphoto:link "<share-link>"            print direct image URL(s)
//   npm run gphoto:link "<share-link>" --size=1920  also append a max-width resize
//
// For a single-photo share link you'll get one URL; for an album share link you'll
// get one URL per photo — pick the one(s) you want and paste them into
// src/data/blog.js.

const args = process.argv.slice(2)
const url = args.find((a) => a.startsWith('http'))
const sizeFlag = args.find((a) => a.startsWith('--size='))
const size = sizeFlag ? sizeFlag.split('=')[1] : null

if (!url) {
  console.error('✗ Usage: npm run gphoto:link "<google-photos-share-link>" [--size=1920]')
  process.exit(1)
}

// Fetch the share page (follows redirects, so photos.app.goo.gl short links work too).
let html
try {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  html = await res.text()
} catch (err) {
  console.error(`✗ Could not load the share link: ${err.message}`)
  process.exit(1)
}

// Find every shared-media URL. The page mixes raw (https://...) and escaped
// (https:\/\/...) forms, so allow optional backslashes before slashes.
const shareRe =
  /https:(\\)?\/(\\)?\/lh3\.googleusercontent\.com(\\)?\/(\\)?pw(\\)?\/AP1Gc[A-Za-z0-9_-]+/g

const seen = new Set()
const links = []
for (const match of html.matchAll(shareRe)) {
  // Normalize escaped slashes, then drop any size suffix (=...-no) to get the
  // base image URL.
  let clean = match[0].replaceAll('\\/', '/').split('=')[0]
  if (!seen.has(clean)) {
    seen.add(clean)
    if (size) clean += `=w${size}-k-no`
    links.push(clean)
  }
}

if (links.length === 0) {
  console.error('✗ No direct image URLs found. The album may be restricted or empty.')
  process.exit(1)
}

console.log(`Found ${links.length} direct image URL(s):\n`)
links.forEach((link, i) => console.log(`${i + 1}. ${link}`))
console.log('\nPaste the link(s) into the post\'s `images` array in src/data/blog.js.')
if (!size) {
  console.log('Tip: add --size=1920 to get a resized (lighter) version of each image.')
}