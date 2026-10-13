// Serves the built site on the local network for testing the contact page (X1) on a real iPhone
// before anything is deployed (spec: tilde-review/specs/x1-contact-link.md, section 7, T1 and T2).
// Open the printed /x1-test address on the phone: it lists every test vector, and each save method.
// Files resolve like deploy/nginx.conf: the path, then .html, then index.html. Local use only.
import { createReadStream, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { networkInterfaces } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const port = Number(process.env.PORT || 4173)
const vectors = JSON.parse(readFileSync(join(root, 'src', 'contact', 'vectors.json'), 'utf8'))

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.vcf': 'text/vcard; charset=utf-8',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
}

const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const pagePath = (url) => '/tilde/c' + (url.includes('#') ? url.slice(url.indexOf('#')) : '')

function testIndex() {
  const item = (href, label, detail = '') =>
    `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a>${detail ? `<br><small>${escapeHtml(detail)}</small>` : ''}</li>`
  const typical = pagePath(vectors.encode[1].url)
  const fragment = typical.slice(typical.indexOf('#'))
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>X1 test links</title><style>body{font:16px/1.5 system-ui,sans-serif;margin:16px;max-width:40rem}li{margin:.6em 0}small{color:#666;word-break:break-all}</style></head><body>
<h1>X1 contact page: test links</h1>
<p>For the iPhone test (spec section 7). The page is always dark. Set the phone's language to Portuguese for the PT copy. Open a contact twice: the second time the fonts come from the cache (Inter and JetBrains Mono); a first visit on a slow network keeps the system font.</p>
<h2>T2: Save contact, by method</h2><p>Each opens the typical card. Press Save contact and note what the phone does.</p><ul>
${['blob', 'data', 'download', 'share'].map((m) => item(`/tilde/c?save=${m}${fragment}`, `save=${m}`, m === 'share' ? 'needs https: expect it to fall back to blob here' : '')).join('\n')}
</ul>
<h2>T1: contacts (encode vectors)</h2><ul>
${vectors.encode.map((v) => item(pagePath(v.url), v.name, v.url)).join('\n')}
</ul>
<h2>T1: malformed and hostile links (decode vectors)</h2><ul>
${vectors.decode.map((v) => item(pagePath(v.url), `${v.name}: ${v.error ?? 'shows a contact'}`, v.url.length > 200 ? `${v.url.slice(0, 200)}…` : v.url)).join('\n')}
</ul>
<h2>The redirect fallback</h2><ul>
${item(`/tilde${fragment}`, '/tilde with a contact fragment', 'should forward to /tilde/c and show the typical card')}
</ul></body></html>`
}

function resolve(pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return 'bad request'
  }
  const clean = normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  for (const candidate of [clean, `${clean}.html`, join(clean, 'index.html')]) {
    const file = join(dist, candidate)
    if (!file.startsWith(dist)) return null
    try {
      if (statSync(file).isFile()) return file
    } catch {
      // try the next candidate
    }
  }
  return null
}

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost')
  if (pathname === '/x1-test') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    res.end(testIndex())
    return
  }
  const file = resolve(pathname)
  if (file === 'bad request') {
    res.writeHead(400, { 'content-type': 'text/plain' })
    res.end('bad request')
    return
  }
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('not found')
    return
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
  createReadStream(file).pipe(res)
}).listen(port, '0.0.0.0', () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => a.address)
  console.log('Contact page test server. On the iPhone (same Wi-Fi), open:')
  for (const address of addresses) console.log(`  http://${address}:${port}/x1-test`)
  console.log(`On this Mac: http://localhost:${port}/x1-test`)
  console.log('It serves every network this Mac is on: stop it with Ctrl-C when the test is done.')
})
