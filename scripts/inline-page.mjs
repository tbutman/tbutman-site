// Builds one of Tilde's link pages, /tilde/c (the contact page, X1), /tilde/w (the Wi-Fi page, W1) or
// /tilde/n (the note page, N1),
// into dist/tilde/<name>.html: one self-contained file with the script and styles inline, so the page
// is a single request and draws at once on event Wi-Fi. The Content Security Policy allows exactly
// those two inline blocks, by hash, and the site's own two font files, and nothing else (spec:
// tilde-review/specs/x1-contact-link.md, section 6). Runs after vite build and prerender, so the
// fonts' hashed names are known. Used by scripts/contact-page.mjs and scripts/wifi-page.mjs.
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// SITE=tilde builds taptilde.com (src/site.ts): into dist-tilde/, with the pages at the root (/c, /n).
const site = process.env.SITE === 'tilde' ? 'tilde' : 'main'
const dist = join(root, site === 'tilde' ? 'dist-tilde' : 'dist')
const assets = join(dist, 'assets')

/**
 * Builds `route` (/tilde/c, /tilde/w or /tilde/n) from src/<dir>/page.html, page.ts and page.css. `what` names
 * the page in errors ("contact page"), and `global` is the script's IIFE name.
 */
export async function inlinePage({ route, dir, what, global }) {
  const source = join(root, 'src', dir)
  // On taptilde.com the page is at the root: /tilde/c is /c.
  if (site === 'tilde') route = route.replace(/^\/tilde/, '')
  const out = join(dist, `${route.slice(1)}.html`)

  // The site's own Inter and JetBrains Mono (Latin subset), which Vite has written to dist/assets
  // under content-hashed names that nginx caches for a year: the page shares them instead of
  // keeping copies. Exactly one of each, or the build stops.
  const files = await readdir(assets)
  const font = (prefix) => {
    const found = files.filter((f) => f.startsWith(prefix) && f.endsWith('.woff2'))
    if (found.length !== 1) throw new Error(`${what}: ${found.length} files named ${prefix}*.woff2 in dist/assets`)
    return `/assets/${found[0]}`
  }
  const inter = font('inter-latin-wght-normal-')
  const mono = font('jetbrains-mono-latin-wght-normal-')
  // The Latin subset's range, from fontsource itself, for the @font-face rules and for the page's
  // check that sends a value outside it to the system font (page.ts).
  const fontsourceCss = await readFile(join(root, 'node_modules', '@fontsource-variable', 'inter', 'index.css'), 'utf8')
  const latinRange = fontsourceCss.match(/\/\* inter-latin-wght-normal \*\/[^}]*unicode-range: ([^;]+);/)?.[1]
  if (!latinRange || !/^(U\+[0-9A-F]{4}(-[0-9A-F]{4})?,?)+$/.test(latinRange)) throw new Error(`${what}: no Latin unicode-range in fontsource`)

  const result = await build({
    configFile: false,
    logLevel: 'warn',
    build: {
      write: false,
      // Older iPhones still on iOS 15 and up.
      target: ['es2020', 'safari15'],
      lib: { entry: join(source, 'page.ts'), formats: ['iife'], name: global },
    },
    // __SITE__: the pages' links to Tilde's pages are written for the site they're on (src/site.ts).
    define: { __LATIN_RANGE__: JSON.stringify(latinRange), __SITE__: JSON.stringify(site) },
  })
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output)
  const chunk = outputs.find((o) => o.type === 'chunk')
  if (!chunk) throw new Error(`${what}: no script in the build output`)
  // Pure ASCII: the minifier writes \u escapes back as raw characters, which would put invisible
  // bidi controls (in the decoders' regexes) into the page source. Escaping UTF-16 code units is
  // valid in strings, template literals, regexes and identifiers alike.
  const script = chunk.code.trim().replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)

  // font-display: optional: a font is used only if it's cached or arrives within the browser's short
  // block period; otherwise the page stays on the system font for the visit, with no swap. Inter is
  // 6-9% wider than SF Pro, so size-adjust makes a name break in the same place either way
  // (measured by the designer; JetBrains Mono and SF Mono are both 0.6 em, so no adjustment).
  const fontFaces = `
@font-face { font-family: 'Tilde Inter'; font-style: normal; font-weight: 100 900; font-display: optional; size-adjust: 93.5%; src: url(${inter}) format('woff2'); unicode-range: ${latinRange}; }
@font-face { font-family: 'Tilde Mono'; font-style: normal; font-weight: 100 800; font-display: optional; src: url(${mono}) format('woff2'); unicode-range: ${latinRange}; }
`
  // A small minifier is enough for these stylesheets: no strings with meaningful spaces in them.
  const style = (fontFaces + (await readFile(join(source, 'page.css'), 'utf8')))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim()

  const hash = (text) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`
  const csp = [
    "default-src 'none'",
    `script-src ${hash(script)}`,
    `style-src ${hash(style)}`,
    // Only the site's own favicon; nothing from the link can become an image.
    "img-src 'self'",
    // Only the site's own two font files.
    "font-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    // The page has no HTML sinks; this makes Chrome refuse one if it ever gets one.
    "require-trusted-types-for 'script'",
  ].join('; ')

  const template = await readFile(join(source, 'page.html'), 'utf8')
  const html = template
    .replace('<!--csp-->', () => `<meta http-equiv="Content-Security-Policy" content="${csp}" />`)
    .replace(
      '<!--fonts-->',
      // crossorigin, or the browser fetches each font twice (fonts are always CORS requests).
      () => [inter, mono].map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`).join('\n'),
    )
    .replace('<!--style-->', () => `<style>${style}</style>`)
    .replace('<!--script-->', () => `<script>${script}</script>`)
  // Every placeholder must be filled; a leftover would mean the template changed.
  const left = html.match(/<!--(csp|fonts|style|script)-->/)
  if (left) throw new Error(`${what}: placeholder ${left[0]} not filled`)

  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, html)
  console.log(`built ${route} -> ${route.slice(1)}.html (${(gzipSync(html).length / 1000).toFixed(1)} kB gzipped)`)
}
