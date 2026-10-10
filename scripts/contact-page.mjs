// Builds /tilde/c, the contact page (X1), into dist/tilde/c.html: one self-contained file with the
// script and styles inline, so the page is a single request and draws at once on event Wi-Fi.
// The Content Security Policy allows exactly those two inline blocks, by hash, and nothing else
// (spec: tilde-review/specs/x1-contact-link.md, section 6). Runs after vite build and prerender.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'src', 'contact')
const out = join(root, 'dist', 'tilde', 'c.html')

const result = await build({
  configFile: false,
  logLevel: 'warn',
  build: {
    write: false,
    // Older iPhones still on iOS 15 and up.
    target: ['es2020', 'safari15'],
    lib: { entry: join(source, 'page.ts'), formats: ['iife'], name: 'tildeContact' },
  },
})
const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output)
const chunk = outputs.find((o) => o.type === 'chunk')
if (!chunk) throw new Error('contact page: no script in the build output')
// Pure ASCII: the minifier writes \u escapes back as raw characters, which would put invisible
// bidi controls (in the decoder's regex) into the page source. Escaping UTF-16 code units is valid
// in strings, template literals, regexes and identifiers alike.
const script = chunk.code.trim().replace(/[\u0080-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)

// A small minifier is enough for this one stylesheet: no strings with meaningful spaces in it.
const style = (await readFile(join(source, 'page.css'), 'utf8'))
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
  "base-uri 'none'",
  "form-action 'none'",
  // The page has no HTML sinks; this makes Chrome refuse one if it ever gets one.
  "require-trusted-types-for 'script'",
].join('; ')

const template = await readFile(join(source, 'page.html'), 'utf8')
const html = template
  .replace('<!--csp-->', () => `<meta http-equiv="Content-Security-Policy" content="${csp}" />`)
  .replace('<!--style-->', () => `<style>${style}</style>`)
  .replace('<!--script-->', () => `<script>${script}</script>`)
// Every placeholder must be filled; a leftover would mean the template changed.
const left = html.match(/<!--(csp|style|script)-->/)
if (left) throw new Error(`contact page: placeholder ${left[0]} not filled`)

await mkdir(dirname(out), { recursive: true })
await writeFile(out, html)
console.log(`built /tilde/c -> tilde/c.html (${(gzipSync(html).length / 1000).toFixed(1)} kB gzipped)`)
