// Opens the site through the production nginx config in Chromium, with its Content Security Policy
// headers, and fails on any CSP report or script error: every page in the sitemap and the 404 page;
// on taptilde.com also the contact and note pages, and the home page's forwarder for old contact
// and note links (its inline script runs only when allowed by hash). CI runs it next to
// deploy/check-nginx.sh, once per site.
// Usage: node deploy/check-csp-browser.mjs http://127.0.0.1:8080             (tbutman.com)
//        SITE=tilde node deploy/check-csp-browser.mjs http://127.0.0.1:8080  (taptilde.com, by its Host)
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const given = process.argv[2]
if (!given) throw new Error('usage: node deploy/check-csp-browser.mjs <base url>')
const tilde = process.env.SITE === 'tilde'
// taptilde.com: the browser resolves the name to the server under test, so nginx gets its Host header.
const server = new URL(given)
const base = tilde ? `http://taptilde.com:${server.port || 80}` : given
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sitemap = await readFile(join(root, tilde ? 'dist-tilde' : 'dist', 'sitemap.xml'), 'utf8')
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map(([, path]) => path || '/')
if (paths.length < 5) throw new Error(`check-csp-browser: only ${paths.length} pages in the sitemap`)

const browser = await chromium.launch(tilde ? { args: [`--host-resolver-rules=MAP taptilde.com ${server.hostname}`] } : {})
const failures = []
async function visit(path, expect) {
  const page = await browser.newPage()
  const problems = []
  page.on('console', (message) => {
    if (message.type() === 'error' || /Content Security Policy/i.test(message.text())) problems.push(message.text())
  })
  page.on('pageerror', (error) => problems.push(String(error)))
  const response = await page.goto(base + path, { waitUntil: 'networkidle' })
  if (expect) await expect(page, response)
  // A 404 page logs its own status as a console error; that's expected there, not a CSP problem.
  const real = problems.filter((text) => !(path === '/no-such-page' && /status of 404/.test(text)))
  if (real.length) failures.push(`${path}: ${real.map((text) => text.slice(0, 160)).join(' | ')}`)
  await page.close()
}

for (const path of paths) {
  await visit(path, async (page, response) => {
    if (!/default-src 'self'/.test(response.headers()['content-security-policy'] ?? '')) failures.push(`${path}: no CSP header`)
  })
}
await visit('/no-such-page')
let extra = 1
if (tilde) {
  extra += 4
  await visit('/c#1;n=Jane%20Doe', async (page) => {
    if ((await page.locator('.save').count()) !== 1) failures.push('/c: no contact shown')
  })
  await visit('/#1;n=Jane%20Doe', async (page) => {
    await page.waitForURL(/\/c#1;n=Jane%20Doe$/, { timeout: 5000 }).catch(() => failures.push('/: the contact forwarder did not run'))
  })
  await visit('/n#n1;t=Groceries;i=Milk;x=Eggs', async (page) => {
    if ((await page.locator('.tick').count()) !== 2) failures.push('/n: no list shown')
  })
  await visit('/#n1;t=Groceries;i=Milk', async (page) => {
    await page.waitForURL(/\/n#n1;t=Groceries;i=Milk$/, { timeout: 5000 }).catch(() => failures.push('/: the note forwarder did not run'))
  })
}
await browser.close()

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`check-csp-browser: ${tilde ? 'taptilde.com' : 'tbutman.com'}, ${paths.length + extra} pages, no CSP reports`)
