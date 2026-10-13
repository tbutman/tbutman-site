// The built contact page (dist/tilde/c.html) in real browser engines, Chromium and WebKit (Safari's),
// against every shared test vector: what each link shows, that the CSP reports nothing, that the
// page asks for nothing but itself, its favicon and the site's two font files, and that Save
// contact downloads exactly the vector's .vcf. Run with `npm run test:browser` (it builds first);
// CI runs it after the build. Spec: tilde-review/specs/x1-contact-link.md, sections 4 and 6.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { after, before, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from 'playwright'
import { decodeFragment, displayAddress } from './link.ts'

const dist = fileURLToPath(new URL('../../dist/', import.meta.url))
const vectors = JSON.parse(await readFile(new URL('./vectors.json', import.meta.url), 'utf8'))
const fragmentOf = (url) => (url.includes('#') ? url.slice(url.indexOf('#')) : '')

// The English headings of the error states (page.ts).
const headings = {
  empty: 'No contact in this link',
  damaged: 'This contact link is damaged',
  unsupported: 'This contact needs a newer page',
}
// What the page may ask for, whatever the link says.
const allowed = /^\/(tilde\/c|favicon\.svg|assets\/(inter|jetbrains-mono)-latin-wght-normal-[\w-]+\.woff2)$/

// Every link the vectors hold, with what the page should make of it.
const cases = [
  ...vectors.encode.map((v) => ({ name: `encode: ${v.name}`, fragment: fragmentOf(v.url) })),
  ...vectors.decode.map((v) => ({ name: `decode: ${v.name}`, fragment: fragmentOf(v.url) })),
]

// dist/ as nginx serves it: the path, then .html.
let server
let base
before(async () => {
  server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
    for (const file of [join(dist, path), join(dist, `${path}.html`)]) {
      try {
        const body = await readFile(file)
        const type = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }[extname(file)]
        res.writeHead(200, { 'content-type': type ?? 'application/octet-stream' })
        res.end(body)
        return
      } catch {
        // the next candidate
      }
    }
    res.writeHead(404)
    res.end()
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}`
})
after(() => server?.close())

for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  describe(engine, () => {
    let browser
    before(async () => {
      browser = await type.launch()
    })
    after(() => browser?.close())

    /** Opens the page on a fragment, and returns what it showed, asked for and complained about. */
    async function open(fragment, options = {}) {
      const context = await browser.newContext({ locale: 'en-US', acceptDownloads: true, ...options })
      const page = await context.newPage()
      const problems = []
      const requests = []
      page.on('console', (message) => {
        if (message.type() === 'error' || /Content Security Policy/i.test(message.text())) problems.push(message.text())
      })
      page.on('pageerror', (error) => problems.push(String(error)))
      page.on('request', (request) => requests.push(new URL(request.url()).pathname))
      await page.goto(`${base}/tilde/c${fragment}`)
      await page.evaluate(() => document.fonts.ready)
      return { context, page, problems, requests }
    }

    for (const c of cases) {
      test(c.name, async () => {
        const { context, page, problems, requests } = await open(c.fragment)
        try {
          const decoded = decodeFragment(c.fragment)
          const shown = await page.evaluate(() => ({
            face: document.querySelector('.face')?.className ?? null,
            name: document.querySelector('.face .name')?.getAttribute('aria-label') ?? null,
            handle: document.querySelector('.face:not(.void) .handle')?.textContent ?? null,
            role: document.querySelector('.face .role')?.textContent ?? null,
            details: [...document.querySelectorAll('.details dd')].map((dd) => dd.textContent),
            heading: document.querySelector('.void h1')?.textContent ?? null,
            // Nothing from the link may become markup: the page's own elements only.
            tags: [...new Set([...document.querySelectorAll('#contact *')].map((node) => node.localName))].sort(),
            overflow: document.documentElement.scrollWidth > innerWidth,
          }))
          if (decoded.ok) {
            const contact = decoded.contact
            assert.equal(shown.face, `face k-${contact.color ?? 'amber'}`)
            assert.equal(shown.name, contact.name)
            assert.equal(shown.handle, contact.handle ? `~/${contact.handle}` : null)
            assert.equal(shown.role, [contact.title, contact.company].filter(Boolean).join(' · '))
            assert.deepEqual(shown.details, [...contact.emails, ...contact.phones.map((p) => p.number), ...contact.links.map((l) => displayAddress(l.url))])
          } else {
            assert.equal(shown.face, 'face void k-amber')
            assert.equal(shown.heading, headings[decoded.reason])
          }
          for (const tag of shown.tags) assert.match(tag, /^(a|button|circle|dd|div|dl|dt|footer|h1|p|path|rect|section|span|svg)$/)
          assert.equal(shown.overflow, false, 'no sideways scroll')
          assert.deepEqual(problems, [])
          for (const path of requests) assert.match(path, allowed)
        } finally {
          await context.close()
        }
      })
    }

    test('a second fragment on the open page shows the new contact', async () => {
      const { context, page } = await open('#1;n=Jane%20Doe')
      try {
        await page.evaluate(() => (location.hash = '#1;n=John%20Roe;h=johnroe;c=sea'))
        await page.waitForFunction(() => document.querySelector('.face .name')?.getAttribute('aria-label') === 'John Roe')
        assert.equal(await page.locator('.face').getAttribute('class'), 'face k-sea')
      } finally {
        await context.close()
      }
    })

    test('Portuguese follows the phone', async () => {
      const { context, page } = await open('#1;n=Jane%20Doe', { locale: 'pt-PT' })
      try {
        assert.equal(await page.locator('html').getAttribute('lang'), 'pt-PT')
        assert.equal((await page.locator('.save').textContent()).trim(), 'Guardar contacto')
      } finally {
        await context.close()
      }
    })

    // Downloads are how Save contact works outside iOS (spec section 4); WebKit here is not iOS.
    for (const v of vectors.vcard) {
      test(`Save contact downloads the .vcf: ${v.name}`, async () => {
        const { context, page } = await open(fragmentOf(v.url))
        try {
          const [download] = await Promise.all([page.waitForEvent('download'), page.locator('.save').click()])
          const text = await readFile(await download.path(), 'utf8')
          assert.equal(text, v.vcard)
        } finally {
          await context.close()
        }
      })
    }
  })
}
