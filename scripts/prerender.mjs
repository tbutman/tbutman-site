// Renders every route in src/entry-server.tsx to a static HTML file in dist/, adds per-page
// head tags, and measures what each page costs to load for the footer.
//
// SITE_URL sets the canonical origin (default https://tbutman.com). Builds for any other
// origin, such as the home.tbutman.com test site, are marked noindex.
//
// SITE=tilde renders taptilde.com instead (src/site.ts): src/entry-server-tilde.tsx's pages at the
// root, into dist-tilde/, canonical at https://taptilde.com (TILDE_SITE_URL for a test origin). On
// tbutman.com, the Tilde pages that remain (until the server redirects them: deploy/README.md) name
// their taptilde.com twin as canonical, and leave the sitemap.
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import { findLeaks, guarded } from './leak-guard.mjs'

const TILDE = process.env.SITE === 'tilde'
const TILDE_ORIGIN = 'https://taptilde.com'
const CANONICAL_ORIGIN = TILDE ? TILDE_ORIGIN : 'https://tbutman.com'
const siteUrl = ((TILDE ? process.env.TILDE_SITE_URL : process.env.SITE_URL) || CANONICAL_ORIGIN).replace(/\/$/, '')
const indexable = siteUrl === CANONICAL_ORIGIN

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, TILDE ? 'dist-tilde' : 'dist')
const serverDist = join(root, TILDE ? 'dist-server-tilde' : 'dist-server')

const template = await readFile(join(dist, 'index.html'), 'utf8')
const { paths, render, contactCard, tildeTwin } = await import(pathToFileURL(join(serverDist, TILDE ? 'entry-server-tilde.js' : 'entry-server.js')).href)
// A tbutman.com Tilde path's address on taptilde.com ("/tilde/card" → "https://taptilde.com/card"), or null.
const twinUrl = (path) => {
  const twin = tildeTwin(path)
  return twin === null ? null : `${TILDE_ORIGIN}${twin === '/' ? '/' : twin}`
}

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function outputFile(path) {
  if (path === '/') return 'index.html'
  if (path === '/404') return '404.html'
  return `${path.slice(1)}.html`
}

// Bytes a first visit transfers before any scrolling: gzipped HTML, JS and CSS, the Latin font files
// (already compressed; the other subsets only load for characters this site never uses), and the
// images the page loads at once, those not marked loading="lazy" (the heroes), at their full size,
// the most a phone fetches. Lazy images and the video load as the visitor scrolls, so they don't
// count (checker S15).
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
  const eager = [...html.matchAll(/<img\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => !/\sloading="lazy"/.test(tag))
    .map((tag) => tag.match(/\ssrc="(\/[^"]+)"/)?.[1])
    .filter(Boolean)
  const images = await sumBytes(eager, (src) => readFile(join(dist, src)))
  const total = gzipSync(html).length + code + fontBytes + images
  return `${Math.round(total / 1000)} kB`
}

// The booth pages' lazy chunk (src/booth/index.tsx): preloaded where a page draws it, so it arrives
// with the main bundle instead of after it, and counts in that page's weight.
const boothChunk = assetFiles.find((file) => /^parts-[\w-]+\.js$/.test(file))
if (!boothChunk) throw new Error('no booth chunk (assets/parts-*.js) in the build')
const boothPaths = new Set(TILDE ? ['/', '/card', '/fobs', '/home', '/uses', '/app'] : ['/tilde', '/tilde/card', '/tilde/fobs', '/tilde/home', '/tilde/uses', '/tilde/app'])

for (const path of paths) {
  const { html, meta } = render(path)
  // Nothing internal reaches a visitor (scripts/leak-guard.mjs; visitor round 1, item 1): on every
  // Tilde page, every build stops on our drafts' gates, placeholders, questions and names, and CI
  // also on a render older than its model or a MakerWorld stand-in. SITE_DRAFT=1 only warns, for a
  // local preview; CI never sets it.
  if (TILDE || guarded(path)) {
    // The head's title and description too: they're what a link preview shows.
    const leaks = findLeaks(`${html}<p>${meta.title}</p><p>${meta.description}</p>`, { release: Boolean(process.env.CI) })
    if (leaks.length) {
      const report = `${path}: ${leaks.length} thing(s) a visitor must not read:\n${leaks.map(([what, around]) => `  - ${what}: …${around}…`).join('\n')}`
      if (process.env.SITE_DRAFT && !process.env.CI) console.warn(`draft: ${report}`)
      else throw new Error(report)
    }
  }
  // The images are drawn by `npm run og` and committed; catch a page whose card was never drawn.
  if (!(await readFile(join(dist, meta.image)).then(() => true, () => false))) {
    throw new Error(`${path}: missing link-preview image ${meta.image}; run npm run og`)
  }
  const url = path === '/' || path === '/404' ? `${siteUrl}/` : `${siteUrl}${path}`
  // On tbutman.com, a Tilde page's canonical address is its twin on taptilde.com.
  const canonical = (!TILDE && twinUrl(path)) || url
  // Alternates are tbutman.com paths (src/i18n.ts): on taptilde.com, and for tbutman.com's Tilde pages, their twins.
  const alternate = (to) => (TILDE ? `${siteUrl}${tildeTwin(to) ?? to}` : (twinUrl(to) ?? `${siteUrl}${to}`))
  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    boothPaths.has(path) ? `<link rel="modulepreload" crossorigin href="/assets/${boothChunk}" />` : '',
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    path === '/404' ? '' : `<link rel="canonical" href="${canonical}" />`,
    indexable && path !== '/404' && !meta.noindex ? '' : '<meta name="robots" content="noindex" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${TILDE ? 'Tilde' : 'Thomas Butman'}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    meta.lang === 'pt-PT' ? `<meta property="og:locale" content="pt_PT" />` : '',
    // A translated page links to both versions, with English as the default.
    ...(meta.alternates
      ? [
          `<link rel="alternate" hreflang="en" href="${alternate(meta.alternates.en)}" />`,
          `<link rel="alternate" hreflang="pt-PT" href="${alternate(meta.alternates.pt)}" />`,
          `<link rel="alternate" hreflang="x-default" href="${alternate(meta.alternates.en)}" />`,
        ]
      : []),
    `<meta property="og:image" content="${siteUrl}${meta.image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt ?? meta.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="theme-color" content="#0b0d10" />`,
    `<meta name="page-weight" content="__PAGE_WEIGHT__" />`,
    // Permanently: browsers cache the old taptilde.com catch-all 301 (→ /tilde), so a phone that
    // opened a contact link before the /c rule existed keeps landing here. The browser keeps the
    // fragment across the redirect; pass it on to the contact page before anything draws. Note links
    // (#n1;…, tilde-review/specs/notes-link.md §3.7) name themselves, and go to the note page.
    path === '/tilde' ? `<script>if(/^#[1-9][0-9]{0,2};/.test(location.hash))location.replace('/tilde/c'+location.hash);if(/^#n[1-9][0-9]{0,2};/.test(location.hash))location.replace('/tilde/n'+location.hash)</script>` : '',
    // taptilde.com's home does the same for its own pages at the root.
    TILDE && path === '/' ? `<script>if(/^#[1-9][0-9]{0,2};/.test(location.hash))location.replace('/c'+location.hash);if(/^#n[1-9][0-9]{0,2};/.test(location.hash))location.replace('/n'+location.hash)</script>` : '',
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
    .filter((path) => path !== '/404' && !render(path).meta.noindex && (TILDE || !tildeTwin(path)))
    .map((path) => `  <url><loc>${siteUrl}${path === '/' ? '/' : path}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
)

if (!TILDE) {
  // Old addresses of the résumé, for a server whose nginx config predates the redirects in
  // deploy/nginx.conf: a page that forwards to /resume, and a copy of the PDF under its old name.
  await writeFile(
    join(dist, 'cv.html'),
    `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<title>Résumé · Thomas Butman</title>\n<meta name="robots" content="noindex" />\n<link rel="canonical" href="${siteUrl}/resume" />\n<meta http-equiv="refresh" content="0; url=/resume" />\n</head>\n<body><p><a href="/resume">Résumé</a></p></body>\n</html>\n`,
  )
  await copyFile(join(dist, 'Thomas_Butman_Resume.pdf'), join(dist, 'Thomas_Butman_CV.pdf')).catch(() => {
    console.warn('no Thomas_Butman_Resume.pdf in dist; run npm run resume:pdf')
  })

  const card = contactCard(siteUrl)
  await writeFile(join(dist, card.file), card.body)
  console.log(`wrote ${card.file}`)
}

// taptilde.com carries Tilde's files only: not the résumé, other projects' images, or their previews.
if (TILDE) {
  for (const file of ['Thomas_Butman_Resume.pdf', 'trails']) await rm(join(dist, file), { recursive: true, force: true })
  for (const file of await readdir(join(dist, 'og'))) if (!file.startsWith('tilde')) await rm(join(dist, 'og', file))
}

await rm(serverDist, { recursive: true, force: true })
