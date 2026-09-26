#!/usr/bin/env node
// import-audio.mjs — turn folders of audio into the site's playlists.
//
// The player serves plain files from public/audio and reads its track lists from
// src/data/audio-manifest.js, which this script writes. One folder under
// public/audio is one playlist, and the folder tree *is* the whole library:
//
//   public/audio/mood/*.mp3      ->  playlist id "mood"
//   public/audio/focus/*.mp3     ->  playlist id "focus"
//
// So adding a playlist is: make the folder, drop the audio in, re-run.
//
//   node scripts/import-audio.mjs                        # rebuild the manifest
//   node scripts/import-audio.mjs "~/Music/late-night" --id late-night
//   node scripts/import-audio.mjs "~/Music/late-night" --id late-night --limit 150
//   node scripts/import-audio.mjs --dry-run              # report, write nothing
//   node scripts/import-audio.mjs --clean                # prune unused files
//
// With no source folder nothing is encoded: whatever audio is already in
// public/audio is adopted as it stands, so a re-import is fast and lossless. Pass
// a folder *outside* the project to encode fresh audio in.
//
// Titles, artists and licences are deliberately not generated. They live in
// src/data/playlist.js, keyed by playlist id, so re-importing audio can never
// overwrite wording you chose.

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const AUDIO_DIR = join(ROOT, 'public', 'audio')
const MANIFEST = join(ROOT, 'src', 'data', 'audio-manifest.js')

// Must match TrackArt's PALETTES length, or artwork runs out and goes blank.
const PALETTE_COUNT = 8
const EXTENSIONS = new Set(['.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg', '.oga', '.opus', '.webm'])

// Bitrate profiles. "small" reproduces the CC0 set that originally shipped with
// the site (mono, 64 kbps) — fine for ambient drones, brutal for anything with
// bass in it. "medium" is the default because most music survives 128 kbps stereo.
const QUALITY = {
  small: { args: ['-ac', '1', '-b:a', '64k'], label: 'mono 64 kbps (~1 MB per 2 min)' },
  medium: { args: ['-ac', '2', '-b:a', '128k'], label: 'stereo 128 kbps (~2 MB per 2 min)' },
  high: { args: ['-ac', '2', '-b:a', '256k'], label: 'stereo 256 kbps (~4 MB per 2 min)' },
}

// ---------------------------------------------------------------- arguments

// Parsed in one pass rather than by scanning for the first non-flag token: a
// flag's *value* is not the source, so `--id focus` must not leave "focus" lying
// around to be picked up as a path (and `--order list.txt` must not import
// list.txt as if it were a track).
const argv = process.argv.slice(2)
const flags = {}
let source = null
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i]
  if (!arg.startsWith('--')) {
    if (source === null) source = arg
    continue
  }
  const key = arg.slice(2)
  const next = argv[i + 1]
  if (next && !next.startsWith('--')) {
    flags[key] = next
    i += 1
  } else {
    flags[key] = true
  }
}

const fail = (message) => {
  console.error(`\n  ${message}\n`)
  process.exit(1)
}

// Usage is for `--help` only. A bare run is the common case — re-read the
// folders in public/audio and rewrite the manifest — so it must not be mistaken
// for a request for instructions.
if (flags.help || flags.h) {
  console.log(`
  Usage: node scripts/import-audio.mjs [folder-or-file] [options]

  With no source, every folder in public/audio is re-read and the manifest is
  rewritten. Nothing is encoded — the files in place are the ones you get.
  Pass a folder outside the project to encode audio into public/audio/<id>/.

  Options
    --id <slug>            playlist id for the source (default: its folder name)
    --quality <name>       small | medium | high        (default: medium)
    --limit <seconds>      trim each track to an excerpt, with a 1.5s fade
    --order <file>         pin the running order from a newline-separated list
    --normalize            even out loudness across tracks (single pass)
    --no-encode            don't encode; the source must already be in public/audio
    --clean                delete public/audio files no playlist references
    --allow-empty          keep a playlist whose folder holds no audio
    --dry-run              report everything, write nothing

  Titles, artists and licences are set in src/data/playlist.js, not here.
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
const wantsEncode = !flags['no-encode']

if (flags.id !== undefined && !source) {
  fail('--id names the playlist for a source folder, so it needs a source.\n  Run without --id to re-read the folders already in public/audio.')
}

// ------------------------------------------------------------------- ffmpeg

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

// ---------------------------------------------------------------- playlists

/**
 * The playlist id for a folder name.
 *
 * The id ends up in the URL (/music/focus) and in the manifest, so it is
 * normalised to lowercase alphanumerics and dashes: "Late Night" and
 * "late night" both become "late-night". Names with no usable ASCII left (an
 * all-CJK folder, say) fall back to "playlist" and collide loudly if there is
 * more than one.
 */
const slugify = (value) =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const audioFilesIn = (dir) =>
  readdirSync(dir)
    .filter((name) => EXTENSIONS.has(extname(name).toLowerCase()) && !name.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => join(dir, name))

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
 * The name the encoded file gets inside its playlist folder.
 *
 * Intentionally the source filename with only URL-unsafe characters removed —
 * spaces and case are left alone. That keeps one invariant true: the name is
 * always exactly the name of the file on disk, so a re-read can never look for
 * "Ominous-Tidings.mp3" while the folder holds "Ominous Tidings.mp3", which is
 * a 404 on any case- or space-sensitive host. Spaces in an audio src are
 * harmless; the browser percent-encodes them.
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

// -------------------------------------------------------------- import step

let imported = null

if (source) {
  const inputPath = resolve(source)
  if (!existsSync(inputPath)) fail(`No such file or folder: ${inputPath}`)

  const isFile = !statSync(inputPath).isDirectory()
  const id = slugify(String(flags.id !== undefined ? flags.id : isFile ? basename(inputPath, extname(inputPath)) : basename(inputPath)))
  if (!id) fail(`Cannot make a playlist id out of "${flags.id ?? source}".`)

  const destDir = join(AUDIO_DIR, id)
  const insideProject = inputPath === AUDIO_DIR || inputPath.startsWith(AUDIO_DIR + sep)

  // The importer writes its encodes into public/audio/<id>/. Handing ffmpeg a
  // file that is already at that path would make it its own input and output,
  // which is how a re-encode destroys the only copy of a track. Refuse instead.
  if (wantsEncode && insideProject) {
    fail(
      `The source is inside public/audio, so encoding would write each file onto itself.\n` +
        `  Copy the originals somewhere outside the project and point at those:\n` +
        `    node scripts/import-audio.mjs "C:\\path\\to\\${id}" --id ${id}\n` +
        `  Or drop --no-encode to re-read the files already there without touching them.`,
    )
  }

  const inputs = isFile ? [inputPath] : audioFilesIn(inputPath)
  if (inputs.length === 0 && !flags['allow-empty']) {
    fail(
      `No audio files in ${inputPath}\n` +
        `  Looked for: ${[...EXTENSIONS].join(', ')}\n` +
        `  To import an empty playlist on purpose, add --allow-empty.`,
    )
  }

  console.log(`\n  importing ${relative(ROOT, inputPath) || '.'} -> audio/${id}`)
  console.log(`  quality ${flags.quality || 'medium'} — ${quality.label}`)
  if (limit) console.log(`  trimming to ${limit}s with a 1.5s fade at each end`)
  if (flags.normalize) console.log('  normalising loudness (single pass)')
  if (!wantsEncode) console.log('  --no-encode: reusing the files already in public/audio')

  let bytes = 0
  // ffmpeg writes to an existing path only; the playlist folder is created here
  // so importing a brand-new playlist needs nothing but this one command.
  if (wantsEncode && !dryRun) mkdirSync(destDir, { recursive: true })

  inputs.forEach((file, i) => {
    const slug = slugOf(file)
    const target = join(destDir, `${slug}.mp3`)
    const label = `  ${String(i + 1).padStart(2, '0')}/${inputs.length}  ${titleOf(file)}`

    if (wantsEncode && !dryRun) {
      const filters = []
      if (flags.normalize) filters.push('loudnorm=I=-16:TP=-1.5:LRA=11')
      if (limit) {
        const fade = Math.min(1.5, limit / 4).toFixed(2)
        filters.push(`afade=t=in:st=0:d=${fade}`)
        filters.push(`afade=t=out:st=${(limit - fade).toFixed(2)}:d=${fade}`)
      }
      const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', file]
      if (filters.length) args.push('-af', filters.join(','))
      // 44.1kHz throughout so the browser never has to resample.
      args.push('-ar', '44100', ...quality.args, target)
      const result = run(args)
      if (result.status !== 0) {
        fail(
          `ffmpeg failed on ${basename(file)}\n  ${(result.stderr || '').trim().split('\n').slice(-3).join('\n  ')}`,
        )
      }
    }

    if (!dryRun) {
      if (!existsSync(target)) {
        fail(
          `--no-encode but ${relative(ROOT, target)} does not exist.\n` +
            `  That flag means the audio is already encoded and in place, so the\n` +
            `  source has to be the folder in public/audio it came from.`,
        )
      }
      bytes += statSync(target).size
    }
    console.log(`  ${label}  ->  ${slug}.mp3${dryRun ? '' : `  ${(statSync(target).size / 1024 / 1024).toFixed(2)} MB`}`)
  })

  imported = { id, count: inputs.length, bytes }
}

// ------------------------------------------------------------------ collect

if (!existsSync(AUDIO_DIR)) {
  if (!dryRun) {
    console.log(`\n  no ${relative(ROOT, AUDIO_DIR)} yet — writing an empty library`)
  }
}

const folders = existsSync(AUDIO_DIR)
  ? readdirSync(AUDIO_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => ({ name: entry.name, id: slugify(entry.name), dir: join(AUDIO_DIR, entry.name) }))
      .sort((a, b) => a.id.localeCompare(b.id))
  : []

// Two folders can normalise to the same id ("Late Night" and "late-night"), and
// the manifest keys playlists by id, so one would silently shadow the other.
const seenIds = new Map()
for (const folder of folders) {
  if (!folder.id) fail(`Cannot make a playlist id out of the folder "${folder.name}".`)
  if (seenIds.has(folder.id)) {
    fail(
      `Two folders both become the playlist id "${folder.id}":\n` +
        `  public/audio/${seenIds.get(folder.id)}\n` +
        `  public/audio/${folder.name}\n` +
        `  Rename one so the ids differ.`,
    )
  }
  seenIds.set(folder.id, folder.name)
}

const playlists = []
let bytes = 0
let art = 0

for (const folder of folders) {
  let files = audioFilesIn(folder.dir)

  if (files.length === 0 && !flags['allow-empty']) {
    console.log(`  skipping audio/${folder.name} — no audio in it (use --allow-empty to keep it)`)
    continue
  }

  if (typeof flags.order === 'string') {
    if (!existsSync(flags.order)) fail(`--order file not found: ${flags.order}`)
    const wanted = readFileSync(flags.order, 'utf8')
      .split('\n')
      .map((line) => line.replace(/#.*$/, '').trim())
      .filter(Boolean)
    const rank = new Map(wanted.map((name, i) => [name.toLowerCase(), i]))
    const missing = wanted.filter((name) => !files.some((f) => basename(f).toLowerCase() === name.toLowerCase()))
    if (missing.length) {
      fail(`--order lists files that are not in audio/${folder.name}:\n  ${missing.join('\n  ')}`)
    }
    files = [...files].sort((a, b) => {
      const ra = rank.has(basename(a).toLowerCase()) ? rank.get(basename(a).toLowerCase()) : Infinity
      const rb = rank.has(basename(b).toLowerCase()) ? rank.get(basename(b).toLowerCase()) : Infinity
      return ra === rb
        ? basename(a).localeCompare(b, undefined, { numeric: true })
        : ra - rb
    })
  }

  // Tracks are listed by their path relative to public/audio, with forward
  // slashes: "mood/Sial.mp3". The playlist folder is part of the path, so two
  // playlists can hold files of the same name without colliding.
  const tracks = files.map((file, i) => {
    bytes += statSync(file).size
    return {
      id: i + 1,
      title: titleOf(file),
      file: relative(AUDIO_DIR, file).split(sep).join('/'),
      duration: limit ?? durationOf(file),
      art: art++ % PALETTE_COUNT,
    }
  })

  playlists.push({ id: folder.id, tracks })
}

// ----------------------------------------------------------------- manifest

// The project is single-quoted throughout, so the generated file should be too.
const js = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

const body = `// GENERATED FILE — do not edit by hand.
//
// Written by scripts/import-audio.mjs. Re-run the importer to change the audio.
// Titles, artists and licences are hand-maintained in src/data/playlist.js,
// keyed by these playlist ids.

const BASE = import.meta.env.BASE_URL || '/'
const audioPath = (file) => \`\${BASE.endsWith('/') ? BASE : \`\${BASE}/\`}audio/\${file}\`

export const library = {
  playlists: [
${playlists
  .map(
    (playlist) => `    {
      id: ${js(playlist.id)},
      tracks: [
${playlist.tracks
  .map(
    (track) =>
      `        { id: ${track.id}, title: ${js(track.title)}, src: audioPath(${js(
        track.file,
      )}), duration: ${track.duration}, art: ${track.art} },`,
  )
  .join('\n')}
      ],
    },`,
  )
  .join('\n')}
  ],
}
`

if (!dryRun) {
  writeFileSync(MANIFEST, body, 'utf8')
  console.log(`\n  wrote ${relative(ROOT, MANIFEST)}  (${playlists.length} playlist${playlists.length === 1 ? '' : 's'})`)
} else {
  console.log(`\n  would write ${relative(ROOT, MANIFEST)}  (${playlists.length} playlist${playlists.length === 1 ? '' : 's'})`)
}
for (const playlist of playlists) {
  console.log(`    ${playlist.id}  ${playlist.tracks.length} track${playlist.tracks.length === 1 ? '' : 's'}`)
}

// -------------------------------------------------------------------- clean

if (flags.clean) {
  const keep = new Set()
  for (const playlist of playlists) {
    for (const track of playlist.tracks) keep.add(track.file.split('/').join(sep))
  }
  const orphans = []
  for (const folder of folders) {
    for (const name of readdirSync(folder.dir)) {
      const rel = relative(AUDIO_DIR, join(folder.dir, name))
      // Only audio is ever pruned: a playlist folder may legitimately hold
      // notes or artwork next to the audio.
      if (EXTENSIONS.has(extname(name).toLowerCase()) && !keep.has(rel)) {
        orphans.push(rel)
      }
    }
  }
  if (orphans.length === 0) {
    console.log('  nothing to clean')
  } else if (dryRun) {
    console.log(`  would delete ${orphans.length} unused file(s): ${orphans.join(', ')}`)
  } else {
    for (const rel of orphans) unlinkSync(join(AUDIO_DIR, rel))
    console.log(`  deleted ${orphans.length} unused file(s): ${orphans.join(', ')}`)
  }
  console.log('  folders with no audio are left alone — delete them yourself if they are done with')
}

const total = playlists.reduce((sum, playlist) => sum + playlist.tracks.length, 0)
console.log(
  `\n  ${total} track${total === 1 ? '' : 's'} in ${playlists.length} playlist${playlists.length === 1 ? '' : 's'}` +
    `${dryRun ? '' : `, ${(bytes / 1024 / 1024).toFixed(2)} MB`}` +
    `${imported && wantsEncode ? ` (${imported.count} re-encoded)` : ''}\n`,
)
