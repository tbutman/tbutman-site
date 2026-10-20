// Brings the booth site's renders in from tilde-card's render export (presskit/site-export/, written
// by presskit/site_export.py from presskit/site-renders.json), so the pages show exactly what the
// models make: the site takes its booth images only from that export, never by hand. Brief:
// tilde-review/briefs/booth-site.md.
//
//   npm run booth:sync            copy the export in and write src/content/booth/images.json
//   npm run booth:sync -- --check only report: is the export newer than the copy here, and has the
//                                 copy in tilde-review/site-content/ changed since it was ported?
//
// It copies every web image the manifest lists into public/tilde/booth/ (and removes ones it no
// longer lists), checks each file's size and SHA-256 when the manifest gives them, and records the
// manifest's SHA-256, so a build shows which export it carries. Paths: BOOTH_EXPORT (default
// ../tilde-card/presskit/site-export) and BOOTH_CONTENT (default ../tilde-review/site-content),
// both next to this repo's checkout.
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// The checkout's parent: ~/Documents/personal for both tbutman-site and its worktrees.
const personal = resolve(root, '..')
const exportDir = resolve(process.env.BOOTH_EXPORT ?? join(personal, 'tilde-card', 'presskit', 'site-export'))
const contentDir = resolve(process.env.BOOTH_CONTENT ?? join(personal, 'tilde-review', 'site-content'))
const publicDir = join(root, 'public', 'tilde', 'booth')
const imagesJson = join(root, 'src', 'content', 'booth', 'images.json')
const portedJson = join(root, 'src', 'content', 'booth', 'ported.json')
const check = process.argv.includes('--check')

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const fail = (message) => {
  console.error(`booth-sync: ${message}`)
  process.exit(1)
}

// The copy: which site-content files changed since their text was ported into src/content/booth/.
async function contentReport() {
  if (!existsSync(contentDir)) return console.log(`copy: ${contentDir} doesn't exist yet`)
  const ported = existsSync(portedJson) ? JSON.parse(await readFile(portedJson, 'utf8')) : {}
  for (const name of (await readdir(contentDir)).filter((n) => n.endsWith('.md')).sort()) {
    const hash = sha256(await readFile(join(contentDir, name)))
    const state = ported[name] === hash ? 'ported' : ported[name] ? 'CHANGED since ported' : 'not ported yet'
    console.log(`copy: ${name.padEnd(20)} ${state}`)
  }
}

/**
 * One image from the manifest, in the shape the pages use. The export's manifest is design's
 * (presskit/site_export.py); this reads the fields the brief names (page, slot, alt, the web
 * files at phone and desktop widths) and keeps the rest out of the page.
 */
function image(entry, index) {
  const where = `images[${index}]${entry?.id ? ` (${entry.id})` : ''}`
  const id = entry.id ?? entry.key ?? entry.name
  if (typeof id !== 'string' || !id) fail(`${where}: no id`)
  if (typeof entry.alt !== 'string' || !entry.alt.trim()) fail(`${where}: no alt text`)
  const files = entry.files ?? entry.web ?? entry.sources
  if (!Array.isArray(files) || files.length === 0) fail(`${where}: no web files`)
  const sources = files.map((file, n) => {
    const path = file.file ?? file.path ?? file.src
    if (typeof path !== 'string' || !path.endsWith('.webp')) fail(`${where}: files[${n}] isn't a WebP file`)
    if (!(file.width > 0 && file.height > 0)) fail(`${where}: files[${n}] has no width and height`)
    return { path, width: file.width, height: file.height, bytes: file.bytes, sha256: file.sha256 }
  })
  sources.sort((a, b) => a.width - b.width)
  return {
    id,
    page: entry.page ?? null,
    slot: entry.slot ?? null,
    alt: entry.alt.trim(),
    // For the icon library: the Model Maker's name and the one-line use, from the model.
    ...(entry.name && entry.name !== id ? { name: entry.name } : {}),
    ...(entry.use ? { use: entry.use } : {}),
    ...(entry.caption ? { caption: entry.caption } : {}),
    sources,
  }
}

if (!existsSync(join(exportDir, 'manifest.json'))) {
  console.log(`images: no export yet (${join(exportDir, 'manifest.json')})`)
  await contentReport()
  process.exit(check ? 0 : 1)
}

const manifestBytes = await readFile(join(exportDir, 'manifest.json'))
const manifestHash = sha256(manifestBytes)
const manifest = JSON.parse(manifestBytes.toString('utf8'))
const list = Array.isArray(manifest) ? manifest : Array.isArray(manifest.images) ? manifest.images : Object.entries(manifest.images ?? {}).map(([id, e]) => ({ id, ...e }))
if (list.length === 0) fail('the manifest lists no images')
const images = list.map(image)
const ids = new Set()
for (const { id } of images) {
  if (ids.has(id)) fail(`two images with the id ${id}`)
  ids.add(id)
}

const current = existsSync(imagesJson) ? JSON.parse(await readFile(imagesJson, 'utf8')) : null
if (check) {
  console.log(current?.manifest === manifestHash ? `images: up to date (${images.length}, manifest ${manifestHash.slice(0, 12)})` : `images: the export is NEWER than the copy here: run npm run booth:sync`)
  await contentReport()
  process.exit(0)
}

// Check every file first, so a bad export changes nothing here; then copy each under a flat,
// readable name in public/tilde/booth/.
const keep = new Set()
const copies = []
for (const entry of images) {
  for (const source of entry.sources) {
    const from = resolve(exportDir, source.path)
    if (relative(exportDir, from).startsWith('..')) fail(`${entry.id}: ${source.path} is outside the export`)
    const bytes = await readFile(from).catch(() => fail(`${entry.id}: ${source.path} is in the manifest but not in the export`))
    if (source.bytes !== undefined && source.bytes !== bytes.length) fail(`${entry.id}: ${source.path} is ${bytes.length} bytes, the manifest says ${source.bytes}`)
    if (source.sha256 !== undefined && source.sha256 !== sha256(bytes)) fail(`${entry.id}: ${source.path} doesn't match its SHA-256 in the manifest`)
    const name = source.path.replace(/[\\/]/g, '--')
    if (keep.has(name)) fail(`${entry.id}: two files would be copied to ${name}`)
    keep.add(name)
    copies.push([from, join(publicDir, name)])
    source.src = `/tilde/booth/${name}`
    source.bytes = bytes.length
  }
}
await mkdir(publicDir, { recursive: true })
for (const [from, to] of copies) await copyFile(from, to)
let removed = 0
for (const name of await readdir(publicDir)) {
  if (!keep.has(name)) {
    await rm(join(publicDir, name))
    removed++
  }
}

const out = {
  // Generated by scripts/booth-sync.mjs from tilde-card's presskit/site-export/: don't edit.
  manifest: manifestHash,
  exported: manifest.generated ?? manifest.exported ?? null,
  images: Object.fromEntries(
    images.map(({ id, sources, ...rest }) => [id, { ...rest, sources: sources.map(({ src, width, height }) => ({ src, width, height })) }]),
  ),
}
await mkdir(dirname(imagesJson), { recursive: true })
await writeFile(imagesJson, `${JSON.stringify(out, null, 2)}\n`)
const total = [...keep].length
console.log(`images: ${images.length} renders, ${total} files in public/tilde/booth/ (${removed} removed), manifest ${manifestHash.slice(0, 12)} from ${basename(dirname(exportDir))}/${basename(exportDir)}`)
await contentReport()
