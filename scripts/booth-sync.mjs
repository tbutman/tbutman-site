// Brings the booth site's renders and copy in, so the pages show exactly what the models make and say
// what docs wrote (tilde-review/briefs/booth-site.md):
// - the renders: tilde-card's presskit/site-export/ (design's site_export.py, from site-renders.json)
//   into public/tilde/booth/, and src/content/booth/images.json with each image's page, slot, alt,
//   status and widths, and the manifest's hash;
// - the icons' names, from the model's Icon list (tilde-card/keyring.scad), never copied by hand;
// - the copy: tilde-review/site-content/{cards,fobs,uses,hub}.md as blocks
//   (scripts/booth-copy.mjs) in src/content/booth/copy/, and icon-uses.json beside them.
//
//   npm run booth:sync             bring everything in
//   npm run booth:sync -- --check  only report what's newer at the source than here
//
// Every web file is checked against the manifest's size and SHA-1 before anything is copied, and
// files the manifest no longer lists are removed. Paths: BOOTH_CARD (default ../tilde-card) and
// BOOTH_CONTENT (default ../tilde-review/site-content), next to this repo's checkout.
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkFidelity, parseCopy } from './booth-copy.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// The checkout's parent: ~/Documents/personal for both tbutman-site and its worktrees.
const personal = resolve(root, '..')
const cardRepo = resolve(process.env.BOOTH_CARD ?? join(personal, 'tilde-card'))
const exportDir = join(cardRepo, 'presskit', 'site-export')
const contentDir = resolve(process.env.BOOTH_CONTENT ?? join(personal, 'tilde-review', 'site-content'))
const publicDir = join(root, 'public', 'tilde', 'booth')
const boothDir = join(root, 'src', 'content', 'booth')
const imagesJson = join(boothDir, 'images.json')
const copyDir = join(boothDir, 'copy')
const PAGES = ['cards', 'fobs', 'uses', 'hub']
const check = process.argv.includes('--check')

const hash = (algorithm, bytes) => createHash(algorithm).update(bytes).digest('hex')
const fail = (message) => {
  console.error(`booth-sync: ${message}`)
  process.exit(1)
}
const readJson = async (path) => (existsSync(path) ? JSON.parse(await readFile(path, 'utf8')) : null)
const writeJson = async (path, value) => {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

// The keyring model's Icon list, as the Model Maker shows it: [value, name], without None.
async function iconNames() {
  const scad = await readFile(join(cardRepo, 'keyring.scad'), 'utf8').catch(() => fail(`no keyring.scad in ${cardRepo}`))
  const line = scad.match(/^icon = "\w+"; \/\/ \[(.*)\]$/m)?.[1]
  if (!line) fail('no Icon list in keyring.scad')
  return line
    .split(', ')
    .map((option) => option.split(/:(.*)/s).slice(0, 2))
    .filter(([value]) => value !== 'none')
}

// ---------- The copy ----------
async function syncCopy() {
  if (!existsSync(contentDir)) return console.log(`copy: ${contentDir} doesn't exist yet`)
  for (const page of PAGES) {
    const file = join(contentDir, `${page}.md`)
    const target = join(copyDir, `${page}.json`)
    if (!existsSync(file)) {
      console.log(`copy: ${page}.md not written yet`)
      continue
    }
    const bytes = await readFile(file)
    const source = hash('sha256', bytes)
    const current = await readJson(target)
    if (current?.source === source) {
      console.log(`copy: ${page}.md up to date`)
      continue
    }
    if (check) {
      console.log(`copy: ${page}.md is NEWER than the site's copy`)
      continue
    }
    const markdown = bytes.toString('utf8')
    const blocks = parseCopy(markdown, `${page}.md`)
    checkFidelity(markdown, blocks, `${page}.md`)
    await writeJson(target, { source, blocks })
    console.log(`copy: ${page}.md ${current ? 'updated' : 'added'}`)
  }
  // Each page's opening without its Markdown: its description for search and link previews, kept
  // out of the booth chunk so every page's head can have it (src/meta.ts).
  if (!check) {
    const ledes = {}
    for (const page of PAGES) {
      const copy = await readJson(join(copyDir, `${page}.json`))
      const opening = copy?.blocks.find((block) => block.type === 'p')?.text
      if (opening) ledes[page] = opening.replace(/\*\*|`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    }
    await writeJson(join(copyDir, 'ledes.json'), ledes)
  }
  const uses = await readJson(join(contentDir, 'icon-uses.json'))
  if (uses && !check) await writeJson(join(copyDir, 'icon-uses.json'), uses.uses)
}

// ---------- The renders ----------
/** One image from design's manifest, in the shape the pages use. */
function image(entry, index) {
  const where = `images[${index}] (${entry?.id})`
  if (typeof entry.id !== 'string' || !entry.id) fail(`${where}: no id`)
  if (!Array.isArray(entry.pages) || entry.pages.some((page) => !PAGES.includes(page))) fail(`${where}: pages must be among ${PAGES.join(', ')}`)
  if (typeof entry.alt !== 'string' || !entry.alt.trim()) fail(`${where}: no alt text`)
  const files = Object.values(entry.files ?? {})
  for (const file of files) {
    if (!file.path?.endsWith('.webp') || !(file.width > 0 && file.height > 0)) fail(`${where}: a file without a WebP path, width and height`)
  }
  return { id: entry.id, pages: entry.pages, slot: entry.slot, alt: entry.alt.trim(), status: entry.status, files: files.sort((a, b) => a.width - b.width) }
}

async function syncImages() {
  const manifestPath = join(exportDir, 'manifest.json')
  if (!existsSync(manifestPath)) return console.log(`images: no export yet (${relative(personal, manifestPath)})`)
  const manifestBytes = await readFile(manifestPath)
  const manifestHash = hash('sha256', manifestBytes)
  const manifest = JSON.parse(manifestBytes.toString('utf8'))
  const current = await readJson(imagesJson)
  if (current?.manifest === manifestHash) return console.log(`images: up to date (manifest ${manifestHash.slice(0, 12)})`)
  if (check) return console.log('images: the export is NEWER than the site’s copy')

  const images = (manifest.images ?? []).map(image)
  if (images.length === 0) fail('the manifest lists no images')
  // The icons' names, from the model: each icon render is "icons-<value>".
  const names = new Map(await iconNames())

  // Check every file first, so a bad export changes nothing here.
  const keep = new Map()
  for (const entry of images) {
    for (const file of entry.files) {
      const from = resolve(exportDir, file.path)
      if (relative(exportDir, from).startsWith('..')) fail(`${entry.id}: ${file.path} is outside the export`)
      const bytes = await readFile(from).catch(() => fail(`${entry.id}: ${file.path} is in the manifest but not in the export`))
      if (file.bytes !== undefined && file.bytes !== bytes.length) fail(`${entry.id}: ${file.path} is ${bytes.length} bytes, the manifest says ${file.bytes}`)
      if (file.sha1 !== undefined && file.sha1 !== hash('sha1', bytes)) fail(`${entry.id}: ${file.path} doesn't match its SHA-1 in the manifest`)
      const name = file.path.replace(/[\\/]/g, '--')
      if (keep.has(name)) fail(`${entry.id}: two files would be copied to ${name}`)
      keep.set(name, from)
      file.src = `/tilde/booth/${name}`
    }
  }
  await mkdir(publicDir, { recursive: true })
  for (const [name, from] of keep) await copyFile(from, join(publicDir, name))
  let removed = 0
  for (const name of await readdir(publicDir)) {
    if (!keep.has(name)) {
      await rm(join(publicDir, name))
      removed++
    }
  }

  const counts = {}
  for (const { status } of images) counts[status] = (counts[status] ?? 0) + 1
  await writeJson(imagesJson, {
    // Generated by scripts/booth-sync.mjs from tilde-card's presskit/site-export/: don't edit.
    manifest: manifestHash,
    exported: manifest.generated ?? null,
    images: Object.fromEntries(
      images.map(({ id, files, ...rest }) => {
        const icon = id.startsWith('icons-') ? id.slice('icons-'.length) : null
        if (icon && !names.has(icon)) fail(`${id}: the icon "${icon}" isn't in keyring.scad's Icon list`)
        return [id, { ...rest, ...(icon ? { icon, name: names.get(icon) } : {}), sources: files.map(({ src, width, height }) => ({ src, width, height })) }]
      }),
    ),
    // The model's icons in its own order, with their names, for the icon library.
    icons: [...names],
  })
  console.log(
    `images: ${images.length} in the manifest (${Object.entries(counts)
      .map(([status, n]) => `${n} ${status}`)
      .join(', ')}), ${keep.size} files in public/tilde/booth/ (${removed} removed), manifest ${manifestHash.slice(0, 12)}`,
  )
}

await syncImages()
await syncCopy()
