#!/usr/bin/env node
// import-audio.mjs — turn a folder of audio into the site's player manifest.
//
// The player serves plain files from public/audio and reads its track list from
// src/data/audio-manifest.js. This script is the bridge: point it at a folder
// of tracks and it encodes each one for the web, writes the files into
// public/audio, and regenerates the manifest the player reads.
//
//   node scripts/import-audio.mjs ~/Music/my-playlist
//   node scripts/import-audio.mjs ~/Music/my-playlist --title "Mood" --artist "me"
//   node scripts/import-audio.mjs ~/Music/new-track.mp3 --no-encode   # already encoded
//   node scripts/import-audio.mjs ~/Music/my-playlist --limit 150      # 2:30 excerpts
//   node scripts/import-audio.mjs ~/Music/my-playlist --clean          # drop orphans
//   node scripts/import-audio.mjs public/audio --allow-empty           # clear the library
//
// Everything except the generated manifest is hand-maintained: page copy lives
// in src/data/playlist.js and is never touched here.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, unlinkSync } from 'node:fs'
import { basename, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const AUDIO_DIR = join(ROOT, 'public', 'audio')
const MANIFEST = join(ROOT, 'src', 'data', 'audio-manifest.js')

// Must match TrackArt's PALETTES length, or artwork runs out and goes blank.
const PALETTE_COUNT = 8
const EXTENSIONS = new Set(['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg', '.oga', '.opus', '.webm'])

// Bitrate profiles. "small" reproduces the CC0 set that shipped with the site
// (mono, 64 kbps) — fine for ambient drones, brutal for anything with bass in
// it. "medium" is the default because most music survives 128 kbps stereo.
const QUALITY = {
  small: { args: ['-ac', '1', '-b:a', '64k'], label: 'mono 64 kbps (~1 MB per 2 min)' },
  medium: { args: ['-ac', '2', '-b:a', '128k'], label: 'stereo 128 kbps (~2 MB per 2 min)' },
  high: { args: ['-ac', '2', '-b:a', '256k'], label: 'stereo 256 kbps (~4 MB per 2 min)' },
}

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2)
const source = argv.find((a) => !a.startsWith('--'))
const flags = {}
for (let i = 0; i < argv.length; i += 1) {
  if (!argv[i].startsWith('--')) continue
  const key = argv[i].slice(2)
  const next = argv[i + 1]
  flags[key] = next && !next.startsWith('--') ? argv[(i += 1)] : true
}

const fail = (message) => {
  console.error(`\n  ${message}\n`)
  process.exit(1)
}

if (!source) {
  console.log(`
  Usage: node scripts/import-audio.mjs <folder-or-file> [options]

  Options
    --title <text>        playlist title shown in the player
    --artist <text>       credited artist for every track
    --description <text>  one-line blurb for the playlist
    --quality <name>      small | medium | high        (default: medium)
    --order <file>         pin the running order from a newline-separated list
    --limit <seconds>      trim each track to an excerpt, with a 1.5s fade
    --normalize            even out loudness across tracks (single-pass)
    --no-encode            files are already encoded; just build the manifest
    --clean                delete public/audio files the manifest no longer uses
    --allow-empty          permit a source folder with no audio (writes an empty library)
    --dry-run              report everything, write nothing
`)
  process.exit(0)
}

const quality = QUALITY[flags.quality] || QUALITY.medium
if (flags.quality && !QUALITY[flags.quality]) {
  fail(`Unknown --quality "${flags.quality}". Use small, medium or high.`)
}
const limit = flags.limit ? Number(flags.limit) : null
if (flags.limit && (!Number.isFinite(limit) || limit <= 0)) {
  fail(`--limit needs a positive number of seconds, got "${flags.limit}".`)
}
const dryRun = Boolean(flags['dry-run'])

// ------------------------------------------------------------------ ffmpeg

// Look for ffmpeg in the places it realistically lives: an explicit override,
// the PATH, the project's own dependency, then the copy the CC0 prep used.
function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG_PATH,
    'ffmpeg',
    join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    join(
      process.env.LOCALAPPDATA || '',
      'Temp',
      'opencode',
      'audio-prep',
      'node_modules',
      'ffmpeg-static',
      'ffmpeg.exe',
    ),
  ].filter(Boolean)
  for (const candidate of candidates) {
    const probe =
      candidate === 'ffmpeg'
        ? spawnSync('ffmpeg', ['-hide_banner', '-version'], { encoding: 'utf8' })
        : existsSync(candidate)
          ? spawnSync(candidate, ['-hide_banner', '-version'], { encoding: 'utf8' })
          : { status: 1 }
    if (probe.status === 0) return candidate === 'ffmpeg' ? 'ffmpeg' : candidate
  }
  return null
}

const ffmpeg = findFfmpeg()
if (!ffmpeg) {
  fail(
    'ffmpeg not found.\n' +
      '  Install it, then re-run. Either:\n' +
      '    winget install Gyan.FFmpeg          (and add it to PATH)\n' +
      '    npm install --save-dev ffmpeg-static (drops it in node_modules)\n' +
      '  Or point at an existing copy:\n' +
      '    set FFMPEG_PATH=C:\\path\\to\\ffmpeg.exe',
  )
}

const run = (args) => spawnSync(ffmpeg, args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 })

// ffmpeg prints "Duration: 00:03:45.67, ..." to stderr and exits non-zero
// when it has no output target, so the status code is not an error signal here.
function durationOf(file) {
  const probe = run(['-hide_banner', '-i', file])
  const match = /Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/.exec(probe.stderr || '')
  if (!match) return 0
  return Math.round(Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]))
}

// ----------------------------------------------------------------- sources

const inputPath = resolve(source)
if (!existsSync(inputPath)) fail(`No such file or folder: ${inputPath}`)

const files = statSync(inputPath).isDirectory()
  ? readdirSync(inputPath)
      .filter((name) => EXTENSIONS.has(extname(name).toLowerCase()) && !name.startsWith('.'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name) => join(inputPath, name))
  : [inputPath]

if (files.length === 0) {
  // An empty library is a legitimate end state — the music page is designed to
  // render without a tracklist — but it is far more often a mistyped path. So
  // it has to be asked for, which keeps a wrong --source from silently wiping
  // the manifest.
  if (!flags['allow-empty']) {
    fail(
      `No audio files in ${inputPath}\n` +
        `  Looked for: ${[...EXTENSIONS].join(', ')}\n` +
        `  To clear the library on purpose, add --allow-empty.`,
    )
  }
  console.log(`  no audio files in ${inputPath} — writing an empty library (--allow-empty)`)
}


// An --order file pins the running order, which is how a curated sequence
// survives a re-import. Anything not listed keeps its alphabetical position
// after the listed tracks rather than being dropped.
if (typeof flags.order === 'string') {
  if (!existsSync(flags.order)) fail(`--order file not found: ${flags.order}`)
  const wanted = readFileSync(flags.order, 'utf8')
    .split('\n')
    .map((line) => line.replace(/#.*$/, '').trim())
    .filter(Boolean)
  const rank = new Map(wanted.map((name, i) => [name.toLowerCase(), i]))
  const missing = wanted.filter((name) => !files.some((f) => basename(f).toLowerCase() === name.toLowerCase()))
  if (missing.length) {
    fail(`--order lists files that are not in the folder:\n  ${missing.join('\n  ')}`)
  }
  const sorted = [...files].sort((a, b) => {
    const ra = rank.has(basename(a).toLowerCase()) ? rank.get(basename(a).toLowerCase()) : Infinity
    const rb = rank.has(basename(b).toLowerCase()) ? rank.get(basename(b).toLowerCase()) : Infinity
    return ra === rb
      ? basename(a).localeCompare(basename(b), undefined, { numeric: true })
      : ra - rb
  })
  files.length = 0
  files.push(...sorted)
}

// ------------------------------------------------------------------ encode

/**
 * Derive a display title from a filename.
 *
 * A leading track number is dropped, but only when a separator or space
 * follows it — so "01 - Song" and "03_track" both lose it while "2001" and
 * "24 Seven" keep theirs. Separators become spaces, so "my_song#1" reads as
 * "my song 1". Casing is left exactly as the filename has it; rename the files
 * if you want title case on screen.
 */
const titleOf = (file) =>
  basename(file, extname(file))
    .replace(/^\s*\d{1,3}\s*[-\u2013\u2014._)\]]*\s+(?=\S)/, '')
    .replace(/^\s*\d{1,3}\s*[-\u2013\u2014._)\]]+(?=\S)/, '')
    .replace(/[._#]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim() || basename(file)

/**
 * The name the encoded file gets in public/audio.
 *
 * Intentionally the source filename with only URL-unsafe characters removed —
 * spaces and case are left alone. That keeps one invariant true: the slug is
 * always exactly the name of the file on disk, so a --no-encode re-import can
 * never look for "Ominous-Tidings.mp3" while the folder holds
 * "Ominous Tidings.mp3", which is a 404 on any case- or space-sensitive host.
 * Spaces in audio src are harmless; the browser percent-encodes them.
 */
const slugOf = (file) => {
  const stem = basename(file, extname(file))
    .normalize('NFKD')
    // Reserved in URLs and/or illegal in filenames.
    .replace(/[#%?&=\s]+$/g, '')
    .replace(/[#%?"<>|:*\\]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return stem || 'track'
}

const plan = []
const used = new Set()
for (const file of files) {
  let slug = slugOf(file)
  // Two different sources can slugify the same; keep both.
  if (used.has(slug)) {
    let n = 2
    while (used.has(`${slug}-${n}`)) n += 1
    slug = `${slug}-${n}`
  }
  used.add(slug)

  const target = join(AUDIO_DIR, `${slug}.mp3`)
  const duration = limit ? limit : durationOf(file)
  plan.push({
    file,
    slug,
    target,
    title: titleOf(file),
    duration,
    // Trimming changes the length, so only trust the source probe when we
    // are not cutting: the player reloads the real duration from the file
    // anyway, and this value is what the tracklist prints before that.
    needsEncode: !flags['no-encode'],
  })
}

console.log(`\n  ${plan.length} track${plan.length === 1 ? '' : 's'} from ${relative(ROOT, inputPath) || '.'}`)
console.log(`  quality ${flags.quality || 'medium'} — ${quality.label}`)
if (limit) console.log(`  trimming to ${limit}s with a 1.5s fade at each end`)
if (flags.normalize) console.log('  normalising loudness (single pass)')
if (flags['no-encode']) console.log('  --no-encode: reusing the files already in public/audio')
if (dryRun) console.log('  --dry-run: nothing will be written\n')

let written = 0
let bytes = 0

for (const [i, item] of plan.entries()) {
  const label = `${String(i + 1).padStart(2, '0')}/${plan.length}  ${item.title}`

  if (item.needsEncode) {
    if (!dryRun) {
      const filters = []
      if (flags.normalize) filters.push('loudnorm=I=-16:TP=-1.5:LRA=11')
      if (limit) {
        const fade = Math.min(1.5, limit / 4).toFixed(2)
        filters.push(`afade=t=in:st=0:d=${fade}`)
        filters.push(`afade=t=out:st=${(limit - fade).toFixed(2)}:d=${fade}`)
      }
      const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', item.file]
      if (filters.length) args.push('-af', filters.join(','))
      // 44.1kHz throughout so the browser never has to resample.
      args.push('-ar', '44100', ...quality.args, item.target)
      const result = run(args)
      if (result.status !== 0) {
        fail(
          `ffmpeg failed on ${basename(item.file)}\n  ${(result.stderr || '').trim().split('\n').slice(-3).join('\n  ')}`,
        )
      }
    }
    const size = dryRun ? 0 : statSync(item.target).size
    bytes += size
    written += 1
    console.log(`  ${label}  ->  ${item.slug}.mp3${dryRun ? '' : `  ${(size / 1024 / 1024).toFixed(2)} MB`}`)
  } else {
    // --no-encode: the file is expected to already sit in public/audio.
    const existing = join(AUDIO_DIR, `${item.slug}.mp3`)
    if (!existsSync(existing)) {
      fail(`--no-encode but ${relative(ROOT, existing)} does not exist.`)
    }
    bytes += statSync(existing).size
    console.log(`  ${label}  ->  ${item.slug}.mp3  (reused)`)
  }
}

// ----------------------------------------------------------------- manifest

const playlistTitle = typeof flags.title === 'string' ? flags.title : 'Untitled playlist'
const artist = typeof flags.artist === 'string' ? flags.artist : 'Unknown artist'
const description =
  typeof flags.description === 'string'
    ? flags.description
    : `${plan.length} track${plan.length === 1 ? '' : 's'}, hosted on this site.`

// No licence is claimed unless the importer is told one. Leaving this null is
// the honest default for audio you own: the page then says so rather than
// asserting a public-domain grant that does not apply.
const manifest = {
  title: playlistTitle,
  artist,
  description,
  license: typeof flags.license === 'string' ? flags.license : null,
  licenseUrl: typeof flags['license-url'] === 'string' ? flags['license-url'] : null,
  source: typeof flags.source === 'string' ? flags.source : null,
  tracks: plan.map((item, i) => ({
    id: i + 1,
    title: item.title,
    artist,
    file: `${item.slug}.mp3`,
    duration: item.duration,
    art: i % PALETTE_COUNT,
  })),
}

// The project is single-quoted throughout, so the generated file should be too.
// null has to survive as a null, not become the string 'null' — the page tests
// these fields for truthiness, and 'null' is a truthy string that would render
// as "released under null".
const js = (value) =>
  value === null || value === undefined
    ? 'null'
    : `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const body = `// GENERATED FILE — do not edit by hand.
//
// Written by scripts/import-audio.mjs. Re-run the importer to change the audio.
// For hand-maintained metadata (page copy) edit src/data/playlist.js instead.

const BASE = import.meta.env.BASE_URL || '/'
const audioPath = (file) => \`\${BASE.endsWith('/') ? BASE : \`\${BASE}/\`}audio/\${file}\`

export const manifest = {
  title: ${js(manifest.title)},
  artist: ${js(manifest.artist)},
  description: ${js(manifest.description)},
  license: ${js(manifest.license)},
  licenseUrl: ${js(manifest.licenseUrl)},
  source: ${js(manifest.source)},
  tracks: [
${manifest.tracks
  .map(
    (t) =>
      `    { id: ${t.id}, title: ${js(t.title)}, artist: ${js(t.artist)}, src: audioPath(${js(
        t.file,
      )}), duration: ${t.duration}, art: ${t.art} },`,
  )
  .join('\n')}
  ],
}
`

if (!dryRun) {
  writeFileSync(MANIFEST, body, 'utf8')
  console.log(`\n  wrote ${relative(ROOT, MANIFEST)}  (${manifest.tracks.length} tracks)`)
} else {
  console.log(`\n  would write ${relative(ROOT, MANIFEST)}  (${manifest.tracks.length} tracks)`)
}

// -------------------------------------------------------------------- clean

if (flags.clean) {
  // Importing from public/audio itself adopts every file already in there, so
  // --clean can never find an orphan in that mode. Say so rather than letting
  // it look like the flag worked.
  if (resolve(inputPath) === AUDIO_DIR) {
    console.log(
      '\n  --clean has no effect when the source is public/audio: every file in\n' +
        '  there is part of the playlist by definition. Point the importer at your\n' +
        '  own folder to prune files the new tracklist drops.',
    )
  } else {
    const keep = new Set(plan.map((item) => `${item.slug}.mp3`))
    const orphans = readdirSync(AUDIO_DIR).filter((name) => !keep.has(name))
    if (orphans.length === 0) {
      console.log('  nothing to clean')
    } else if (dryRun) {
      console.log(`  would delete ${orphans.length} unused file(s): ${orphans.join(', ')}`)
    } else {
      for (const name of orphans) unlinkSync(join(AUDIO_DIR, name))
      console.log(`  deleted ${orphans.length} unused file(s): ${orphans.join(', ')}`)
    }
  }
}

console.log(
  `\n  total ${(bytes / 1024 / 1024).toFixed(2)} MB for ${plan.length} track${plan.length === 1 ? '' : 's'}` +
    `${written ? ` (${written} re-encoded)` : ''}\n`,
)
