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
import { decodeFragment, displayAddress, mailtoHref, telHref } from './link.ts'

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
      const { time, ...contextOptions } = options
      const context = await browser.newContext({ locale: 'en-US', acceptDownloads: true, ...contextOptions })
      const page = await context.newPage()
      if (time) await page.clock.setFixedTime(time)
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
            ring: document.querySelector('.face .ring')?.textContent ?? null,
            details: [...document.querySelectorAll('.details dd')].map((dd) => dd.textContent),
            labels: [...document.querySelectorAll('.details dt')].map((dt) => dt.textContent),
            // Every link the page made from the data, with its row's text.
            taps: [...document.querySelectorAll('.details a')].map((a) => [a.getAttribute('href'), a.closest('dd').textContent]),
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
            // Initials are letters only: never an emoji, a flag or a symbol.
            assert.match(shown.ring, /^(\p{L}\p{M}*){0,2}$/u)
            assert.deepEqual(shown.details, [...contact.emails, ...contact.phones.map((p) => p.number), ...contact.links.map((l) => displayAddress(l.url))])
            // Phones and emails link to exactly what they show; websites never link (design rec. 1).
            assert.deepEqual(shown.taps, [...contact.emails.map((e) => [mailtoHref(e), e]), ...contact.phones.map((p) => [telHref(p.number), p.number])])
            for (const [href] of shown.taps) assert.match(href, /^(tel:\+?[0-9]+|mailto:[^?&#%,\s]+)$/)
            assert.equal(shown.labels.length, shown.details.length)
            // A link's label is the decoder's, which has already replaced any look-alike.
            assert.deepEqual(shown.labels.slice(shown.labels.length - contact.links.length), contact.links.map((l) => l.label))
          } else {
            assert.equal(shown.face, 'face void k-amber')
            assert.equal(shown.heading, headings[decoded.reason])
          }
          for (const tag of shown.tags) assert.match(tag, /^(a|button|circle|dd|div|dl|dt|footer|h1|p|path|rect|section|span|svg|wbr)$/)
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

    test('initials come from letters: a flag as the last word adds nothing', async () => {
      const flag = String.fromCodePoint(0x1f3f4, 0xe0067, 0xe0062, 0xe0073, 0xe0063, 0xe0074, 0xe007f)
      const { context, page } = await open(`#1;n=${encodeURIComponent(`Jane ${flag}`)}`)
      try {
        assert.equal(await page.locator('.face .ring').textContent(), 'J')
      } finally {
        await context.close()
      }
    })

    test('the error card keeps the gap under ~/tilde', async () => {
      const { context, page } = await open('#1;n=%ZZ')
      try {
        assert.equal(await page.locator('.void .handle').evaluate((node) => getComputedStyle(node).marginBottom), '14px')
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

    test('labels in the page language, and tappable rows (design recs. 1, 5, 8, 9)', async () => {
      const fragment =
        '#1;n=Jane%20Doe;e=jane@acme.example,work;e=jane@example.com;e=j@example.org;p=+351%20912%20345%20678,mobile;p=+1%20555%20010%200199,mobile%20(US);p=+351%20213%20000%20000,casa;u=example.com/'
      for (const [locale, labels, call] of [
        ['en-US', ['Work email', 'Email', 'Email 2', 'Mobile', 'Mobile (US)', 'Casa', 'Website'], 'Call +351 912 345 678'],
        ['pt-PT', ['Email profissional', 'Email', 'Email 2', 'Telemóvel', 'Telemóvel (US)', 'Casa', 'Site'], 'Ligar para +351 912 345 678'],
      ]) {
        const { context, page } = await open(fragment, { locale, viewport: { width: 320, height: 640 } })
        try {
          assert.deepEqual(await page.locator('.details dt').allTextContents(), labels)
          const tap = page.locator('.details a[href^="tel:"]').first()
          assert.equal(await tap.getAttribute('href'), 'tel:+351912345678')
          assert.equal(await tap.getAttribute('aria-label'), call)
          assert.ok((await tap.boundingBox()).height >= 32)
          assert.equal(await page.locator('.details a').count(), 6)
        } finally {
          await context.close()
        }
      }
    })

    test('addresses: Latin domains as written, look-alikes in punycode, the host brighter (recs. 2–4)', async () => {
      const { context, page } = await open('#1;n=Jane;u=b%C3%BCcher.example/a/b,paypal.com;u=xn--pple-43d.com;u=l%C4%B1nked%C4%B1n.com,GitHub')
      try {
        assert.deepEqual(await page.locator('.details dt').allTextContents(), ['Website', 'Website', 'Website'])
        assert.deepEqual(await page.locator('.details .host').allTextContents(), ['bücher.example', 'xn--pple-43d.com', 'xn--lnkedn-p9ae.com'])
        const [host, path] = await page.locator('.details dd').first().evaluate((dd) => [...dd.children].map((node) => getComputedStyle(node).color))
        assert.notEqual(host, path)
        assert.equal(await page.locator('.details dd').first().locator('wbr').count(), 3)
      } finally {
        await context.close()
      }
    })

    test('the Portuguese tip (rec. 6)', async () => {
      const { context, page } = await open('#1;n=%ZZ', { locale: 'pt-PT' })
      try {
        assert.equal(await page.locator('.tip span').textContent(), 'Pede à pessoa para encostar outra vez, ou para mostrar o código no telemóvel, e lê-o com a tua câmara.')
      } finally {
        await context.close()
      }
    })

    // Downloads are how Save contact works outside iOS (spec section 4); WebKit here is not iOS.
    // Each vector is the page in its language on October 13, 2026 (the note carries the date).
    for (const v of vectors.vcard) {
      test(`Save contact downloads the .vcf: ${v.name}`, async () => {
        const { context, page } = await open(fragmentOf(v.url), { locale: v.locale, time: new Date(2026, 9, 13, 12) })
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
