// Builds /tilde/c, the contact page (X1), into dist/tilde/c.html: one self-contained file with the
// script and styles inline, so the page is a single request and draws at once on event Wi-Fi.
// The Content Security Policy allows exactly those two inline blocks, by hash, and the site's own
// two font files, and nothing else (spec: tilde-review/specs/x1-contact-link.md, section 6).
// Runs after vite build and prerender, so the fonts' hashed names are known.
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'src', 'contact')
const out = join(root, 'dist', 'tilde', 'c.html')
const assets = join(root, 'dist', 'assets')

// The site's own Inter and JetBrains Mono (Latin subset), which Vite has written to dist/assets
// under content-hashed names that nginx caches for a year: the page shares them instead of
// keeping copies. Exactly one of each, or the build stops.
const files = await readdir(assets)
const font = (prefix) => {
  const found = files.filter((f) => f.startsWith(prefix) && f.endsWith('.woff2'))
  if (found.length !== 1) throw new Error(`contact page: ${found.length} files named ${prefix}*.woff2 in dist/assets`)
  return `/assets/${found[0]}`
}
const inter = font('inter-latin-wght-normal-')
const mono = font('jetbrains-mono-latin-wght-normal-')
// The Latin subset's range, from fontsource itself, for the @font-face rules and for the page's
// check that sends a value outside it to the system font (page.ts).
const fontsourceCss = await readFile(join(root, 'node_modules', '@fontsource-variable', 'inter', 'index.css'), 'utf8')
const latinRange = fontsourceCss.match(/\/\* inter-latin-wght-normal \*\/[^}]*unicode-range: ([^;]+);/)?.[1]
if (!latinRange || !/^(U\+[0-9A-F]{4}(-[0-9A-F]{4})?,?)+$/.test(latinRange)) throw new Error('contact page: no Latin unicode-range in fontsource')

const result = await build({
  configFile: false,
  logLevel: 'warn',
  build: {
    write: false,
    // Older iPhones still on iOS 15 and up.
    target: ['es2020', 'safari15'],
    lib: { entry: join(source, 'page.ts'), formats: ['iife'], name: 'tildeContact' },
  },
  define: { __LATIN_RANGE__: JSON.stringify(latinRange) },
})
const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output)
const chunk = outputs.find((o) => o.type === 'chunk')
if (!chunk) throw new Error('contact page: no script in the build output')
// Pure ASCII: the minifier writes \u escapes back as raw characters, which would put invisible
// bidi controls (in the decoder's regex) into the page source. Escaping UTF-16 code units is valid
// in strings, template literals, regexes and identifiers alike.
const script = chunk.code.trim().replace(/[\u0080-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)

// font-display: optional: a font is used only if it's cached or arrives within the browser's short
// block period; otherwise the page stays on the system font for the visit, with no swap. Inter is
// 6-9% wider than SF Pro, so size-adjust makes a name break in the same place either way
// (measured by the designer; JetBrains Mono and SF Mono are both 0.6 em, so no adjustment).
const fontFaces = `
@font-face { font-family: 'Tilde Inter'; font-style: normal; font-weight: 100 900; font-display: optional; size-adjust: 93.5%; src: url(${inter}) format('woff2'); unicode-range: ${latinRange}; }
@font-face { font-family: 'Tilde Mono'; font-style: normal; font-weight: 100 800; font-display: optional; src: url(${mono}) format('woff2'); unicode-range: ${latinRange}; }
`
// A small minifier is enough for this one stylesheet: no strings with meaningful spaces in it.
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
if (left) throw new Error(`contact page: placeholder ${left[0]} not filled`)

await mkdir(dirname(out), { recursive: true })
await writeFile(out, html)
console.log(`built /tilde/c -> tilde/c.html (${(gzipSync(html).length / 1000).toFixed(1)} kB gzipped)`)
