// The built note page (dist/tilde/n.html) in real browser engines, Chromium and WebKit (Safari's):
// what a note, a list and each state show, that values only ever land as text, that ticks survive a
// reload by position and never store the words, that they expire after a week, that Copy copies the
// open items, that the CSP reports nothing, and that the page asks for nothing but itself, its
// favicon and the site's two font files. Run with `npm run test:browser` (it builds first). Spec:
// tilde-review/specs/notes-link.md, section 3.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { after, before, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from 'playwright'
import { encodeNote } from './link.ts'

const dist = fileURLToPath(new URL('../../dist/', import.meta.url))
const fragmentOf = (url) => url.slice(url.indexOf('#'))
const allowed = /^\/(tilde\/n|favicon\.svg|assets\/(inter|jetbrains-mono)-latin-wght-normal-[\w-]+\.woff2)$/

const groceries = fragmentOf(
  encodeNote({
    id: 'k3f9',
    written: '20261026',
    title: 'Groceries',
    items: [
      { text: 'Milk', done: false },
      { text: 'Bread', done: false },
      { text: 'Olive oil', done: false },
      { text: 'Eggs', done: true },
    ],
  }),
)
const sitter = fragmentOf(encodeNote({ id: '7qa2', title: 'For the sitter', message: "Back at 6.\nDinner's in the fridge, bedtime 8:30." }))
const hostile = fragmentOf(encodeNote({ title: '<img src=x onerror=alert(1)>', message: 'https://example.com/login', items: [{ text: '<script>alert(1)</script>', done: false }] }))

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

    async function open(fragment, { locale = 'en-US', context: given, time } = {}) {
      const context = given ?? (await browser.newContext({ locale }))
      const page = await context.newPage()
      if (time) await page.clock.setFixedTime(time)
      const problems = []
      const requests = []
      page.on('console', (message) => {
        if (message.type() === 'error' || /Content Security Policy/i.test(message.text())) problems.push(message.text())
      })
      page.on('pageerror', (error) => problems.push(String(error)))
      page.on('request', (request) => requests.push(new URL(request.url()).pathname))
      await page.goto(`${base}/tilde/n${fragment}`)
      await page.waitForSelector('#note > *')
      return { page, context, problems, requests }
    }

    test('a list: title, items in order, done ones ticked, the counts, the ticks line', async () => {
      const { page, context, problems, requests } = await open(groceries)
      assert.equal(await page.locator('.kicker').first().textContent(), 'List')
      assert.equal(await page.locator('h1').textContent(), 'Groceries')
      assert.deepEqual(await page.locator('.item').allTextContents(), ['Milk', 'Bread', 'Olive oil', 'Eggs'])
      assert.deepEqual(await page.locator('.tick').evaluateAll((boxes) => boxes.map((box) => box.checked)), [false, false, false, true])
      assert.equal(await page.locator('.counts').textContent(), '3 to get · 1 done')
      assert.match(await page.locator('.updated').textContent(), /^Updated October 26/)
      assert.match(await page.locator('.ticks').textContent(), /Your ticks stay on this phone/)
      assert.equal(await page.title(), 'A note from Tilde')
      // VoiceOver and TalkBack read the item as the checkbox's label.
      assert.equal(await page.getByRole('checkbox', { name: 'Milk' }).count(), 1)
      assert.deepEqual(problems, [])
      for (const path of requests) assert.match(path, allowed)
      await context.close()
    })

    test('ticks come back after a reload, by position only, and a rewritten list starts clean', async () => {
      const { page, context } = await open(groceries)
      await page.getByRole('checkbox', { name: 'Bread' }).check()
      assert.equal(await page.locator('.counts').textContent(), '2 to get · 2 done')
      await page.reload()
      await page.waitForSelector('.tick')
      assert.deepEqual(await page.locator('.tick').evaluateAll((boxes) => boxes.map((box) => box.checked)), [false, true, false, true])
      const stored = await page.evaluate(() => Object.entries(localStorage))
      assert.equal(stored.length, 1)
      assert.match(stored[0][0], /^tilde-n:k3f9:/)
      assert.deepEqual(JSON.parse(stored[0][1]).ticked, [1, 3])
      assert.ok(!stored.flat().join(' ').includes('Bread'), 'the words are never stored')
      // The same note, rewritten with another item: a new key, so nothing ticked but its own.
      const rewritten = fragmentOf(encodeNote({ id: 'k3f9', title: 'Groceries', items: [{ text: 'Milk', done: false }, { text: 'Rice', done: false }] }))
      await page.goto(`${base}/tilde/n${rewritten}`)
      await page.waitForSelector('.tick')
      assert.deepEqual(await page.locator('.tick').evaluateAll((boxes) => boxes.map((box) => box.checked)), [false, false])
      await context.close()
    })

    test('ticks older than a week are cleared on the next visit', async () => {
      const context = await browser.newContext({ locale: 'en-US' })
      const first = await open(groceries, { context, time: new Date('2026-11-01T10:00:00Z') })
      await first.page.getByRole('checkbox', { name: 'Milk' }).check()
      await first.page.close()
      const later = await open(sitter, { context, time: new Date('2026-11-09T10:00:00Z') })
      assert.deepEqual(await later.page.evaluate(() => Object.keys(localStorage)), [])
      await context.close()
    })

    test('Copy copies the open items, one per line', async () => {
      const context = await browser.newContext({ locale: 'en-US' })
      if (engine === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      const { page } = await open(groceries, { context })
      await page.getByRole('checkbox', { name: 'Milk' }).check()
      await page.locator('button.copy').click()
      await page.waitForFunction(() => document.querySelector('button.copy')?.textContent !== 'Copy')
      if (engine === 'chromium') assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Bread\nOlive oil')
      await context.close()
    })

    test('a note: its message with its line breaks, as text', async () => {
      const { page, context, problems } = await open(sitter)
      assert.equal(await page.locator('.kicker').first().textContent(), 'Note')
      assert.equal(await page.locator('h1').textContent(), 'For the sitter')
      assert.equal(await page.locator('.message').evaluate((node) => node.innerText), "Back at 6.\nDinner's in the fridge, bedtime 8:30.")
      assert.equal(await page.locator('.tick').count(), 0)
      assert.equal(await page.locator('.updated').count(), 0)
      assert.deepEqual(problems, [])
      await context.close()
    })

    test('hostile values stay text: no element, no link, no script', async () => {
      const { page, context, problems } = await open(hostile)
      assert.equal(await page.locator('h1').textContent(), '<img src=x onerror=alert(1)>')
      assert.equal(await page.locator('#note img, #note script').count(), 0)
      assert.equal(await page.locator('.message a').count(), 0)
      assert.deepEqual(problems, [])
      await context.close()
    })

    test('the states: empty, damaged, newer', async () => {
      for (const [fragment, heading] of [
        ['', 'Nothing in this note'],
        ['#n1;t=%G1', 'This note can’t be read'],
        ['#n2;t=Later', 'This note needs a newer page'],
      ]) {
        const { page, context, problems } = await open(fragment)
        assert.equal(await page.locator('h1').textContent(), heading)
        assert.deepEqual(problems, [])
        await context.close()
      }
    })

    test('Portuguese, by the browser’s language', async () => {
      const { page, context } = await open(groceries, { locale: 'pt-PT' })
      assert.equal(await page.locator('.kicker').first().textContent(), 'Lista')
      assert.equal(await page.locator('.counts').textContent(), '3 por comprar · 1 feito')
      assert.match(await page.locator('.updated').textContent(), /^Atualizada a 26 de outubro/)
      assert.equal(await page.title(), 'Uma nota da Tilde')
      await context.close()
    })

    test('the footer leads to Home & desk and the use cases', async () => {
      const { page, context } = await open(sitter)
      assert.deepEqual(await page.locator('footer a').evaluateAll((links) => links.map((a) => a.getAttribute('href'))), ['/tilde/home', '/tilde/uses'])
      await context.close()
    })
  })
}
