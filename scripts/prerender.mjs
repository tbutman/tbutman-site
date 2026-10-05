// Renders every route in src/entry-server.tsx to a static HTML file in dist/, adds per-page
// head tags, and measures what each page costs to load for the footer.
//
// SITE_URL sets the canonical origin (default https://tbutman.com). Builds for any other
// origin, such as the home.tbutman.com test site, are marked noindex.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

const CANONICAL_ORIGIN = 'https://tbutman.com'
const siteUrl = (process.env.SITE_URL || CANONICAL_ORIGIN).replace(/\/$/, '')
const indexable = siteUrl === CANONICAL_ORIGIN

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const serverDist = join(root, 'dist-server')

const template = await readFile(join(dist, 'index.html'), 'utf8')
const { paths, render, contactCard } = await import(pathToFileURL(join(serverDist, 'entry-server.js')).href)

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function outputFile(path) {
  if (path === '/') return 'index.html'
  if (path === '/404') return '404.html'
  return `${path.slice(1)}.html`
}

// Bytes a first visit transfers: gzipped HTML, JS and CSS, plus the Latin font files
// (already compressed; the other subsets only load for characters this site never uses).
const assetFiles = await readdir(join(dist, 'assets'))
const fontBytes = await sumBytes(
  assetFiles.filter((file) => /-latin-wght-normal-.*\.woff2$/.test(file)),
  (file) => readFile(join(dist, 'assets', file)),
)

async function sumBytes(files, load) {
  let total = 0
  for (const file of files) total += (await load(file)).length
  return total
}

async function pageWeight(html) {
  const linked = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+\.(?:js|css))"/g)].map((match) => match[1])
  const code = await sumBytes(linked, async (file) => gzipSync(await readFile(join(dist, 'assets', file))))
  const total = gzipSync(html).length + code + fontBytes
  return `${Math.round(total / 1000)} kB`
}

for (const path of paths) {
  const { html, meta } = render(path)
  // The images are drawn by `npm run og` and committed; catch a page whose card was never drawn.
  if (!(await readFile(join(dist, meta.image)).then(() => true, () => false))) {
    throw new Error(`${path}: missing link-preview image ${meta.image}; run npm run og`)
  }
  const url = path === '/' || path === '/404' ? `${siteUrl}/` : `${siteUrl}${path}`
  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    path === '/404' ? '' : `<link rel="canonical" href="${url}" />`,
    indexable && path !== '/404' && !meta.noindex ? '' : '<meta name="robots" content="noindex" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Thomas Butman" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    meta.lang === 'pt-PT' ? `<meta property="og:locale" content="pt_PT" />` : '',
    // A translated page links to both versions, with English as the default.
    ...(meta.alternates
      ? [
          `<link rel="alternate" hreflang="en" href="${siteUrl}${meta.alternates.en}" />`,
          `<link rel="alternate" hreflang="pt-PT" href="${siteUrl}${meta.alternates.pt}" />`,
          `<link rel="alternate" hreflang="x-default" href="${siteUrl}${meta.alternates.en}" />`,
        ]
      : []),
    `<meta property="og:image" content="${siteUrl}${meta.image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="theme-color" content="#0b0d10" />`,
    `<meta name="page-weight" content="__PAGE_WEIGHT__" />`,
  ]
    .filter(Boolean)
    .join('\n    ')

  let page = template
    .replace('<html lang="en">', `<html lang="${meta.lang}">`)
    .replace('<!--app-head-->', () => head)
    .replace('<!--app-html-->', () => html)
  const weight = await pageWeight(page)
  page = page.replaceAll('__PAGE_WEIGHT__', weight)

  const file = join(dist, outputFile(path))
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, page)
  console.log(`prerendered ${path} -> ${outputFile(path)} (${weight})`)
}

await writeFile(
  join(dist, 'robots.txt'),
  indexable ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n',
)
await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .filter((path) => path !== '/404' && !render(path).meta.noindex)
    .map((path) => `  <url><loc>${siteUrl}${path === '/' ? '/' : path}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
)

const card = contactCard(siteUrl)
await writeFile(join(dist, card.file), card.body)
console.log(`wrote ${card.file}`)

await rm(serverDist, { recursive: true, force: true })
