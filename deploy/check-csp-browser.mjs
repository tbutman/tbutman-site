// Opens the site through the production nginx config in Chromium, with its Content Security Policy
// headers, and fails on any CSP report or script error: every page in the sitemap, the 404 page,
// the contact page, and /tilde's forwarder for old contact links (its inline script runs only
// when allowed by hash). CI runs it next to deploy/check-nginx.sh.
// Usage: node deploy/check-csp-browser.mjs http://127.0.0.1:8080
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const base = process.argv[2]
if (!base) throw new Error('usage: node deploy/check-csp-browser.mjs <base url>')
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sitemap = await readFile(join(root, 'dist', 'sitemap.xml'), 'utf8')
const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map(([, path]) => path || '/')
if (paths.length < 5) throw new Error(`check-csp-browser: only ${paths.length} pages in the sitemap`)

const browser = await chromium.launch()
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
await visit('/tilde/c#1;n=Jane%20Doe', async (page) => {
  if ((await page.locator('.save').count()) !== 1) failures.push('/tilde/c: no contact shown')
})
await visit('/tilde#1;n=Jane%20Doe', async (page) => {
  await page.waitForURL(/\/tilde\/c#1;n=Jane%20Doe$/, { timeout: 5000 }).catch(() => failures.push('/tilde: the forwarder did not run'))
})
await browser.close()

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`check-csp-browser: ${paths.length + 3} pages, no CSP reports`)
