// Tests for /hello's ?social= and ?links= (scripts/hello-share.mjs): what the script hides, and
// that the stylesheet hides each thing it can name. Run with `npm test`.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { helloShareScript, SHARE_GROUPS } from './hello-share.mjs'

// Runs the script for a query and returns the attributes it set on <html>.
function run(search) {
  const set = {}
  const document = { documentElement: { setAttribute: (name, value) => (set[name] = value) } }
  new Function('location', 'document', helloShareScript)({ search }, document)
  return set
}

// What it hid, as <html data-hello-hide> holds it.
const hidden = (search) => run(search)['data-hello-hide']?.split(' ') ?? []

const DEFAULT = ['instagram', 'x', 'linkedin', 'social', 'book', 'resume', 'github']

test('no setting, or nothing it knows, is the default: ways to reach Thomas and his site', () => {
  for (const search of ['', '?from=card-qr', '?social=', '?social=myspace', '?links=nope&contact=']) {
    assert.deepEqual(hidden(search), DEFAULT, search)
  }
})

test('all shows the whole group', () => {
  assert.deepEqual(hidden('?social=all'), ['book', 'resume', 'github'])
  assert.deepEqual(hidden('?links=all,none'), ['instagram', 'x', 'linkedin', 'social'])
  assert.deepEqual(hidden('?contact=all&social=all&links=all'), [])
})

test('a list shows only what it names', () => {
  assert.deepEqual(hidden('?social=linkedin'), ['instagram', 'x', 'book', 'resume', 'github'])
  assert.deepEqual(hidden('?social=LinkedIn,instagram,myspace&links=all'), ['x'])
  assert.deepEqual(hidden('?links=resume,book'), ['instagram', 'x', 'linkedin', 'social', 'github', 'site'])
  assert.deepEqual(hidden('?contact=whatsapp,card'), ['email', ...DEFAULT])
})

test('none hides the whole group', () => {
  assert.deepEqual(hidden('?contact=none&social=all&links=all'), ['email', 'card', 'whatsapp', 'contact'])
  assert.deepEqual(hidden('?links=none&social=all'), ['book', 'resume', 'github', 'site', 'links'])
})

test('about=tilde picks the Tilde version, and links= marks that it asked', () => {
  assert.deepEqual(run('?from=card-nfc&about=tilde'), { 'data-hello-hide': DEFAULT.join(' '), 'data-hello-about': 'tilde' })
  assert.equal(run('?about=me')['data-hello-about'], undefined)
  assert.equal(run('?about=tilde&links=resume')['data-hello-links-set'], '')
  assert.equal(run('?about=tilde')['data-hello-links-set'], undefined)
})

test('the stylesheet hides every key and group', () => {
  const css = readFileSync(new URL('../src/styles/site.css', import.meta.url), 'utf8')
  // A group's own rule, except contact's: the section goes only with the socials too (touch).
  assert.ok(css.includes(`[data-hello-hide~='contact'][data-hello-hide~='social'] [data-hello-item='touch']`), 'touch')
  assert.ok(css.includes(`[data-hello-hide~='email'][data-hello-hide~='whatsapp'] [data-hello-item='reach']`), 'reach')
  for (const key of [...Object.keys(SHARE_GROUPS).filter((group) => group !== 'contact'), ...Object.values(SHARE_GROUPS).flat()]) {
    assert.ok(css.includes(`[data-hello-hide~='${key}'] [data-hello-item='${key}']`), key)
  }
})
