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

const DEFAULT = ['instagram', 'x', 'linkedin', 'social']

test('no setting, or nothing it knows, is the default: everything but the socials', () => {
  for (const search of ['', '?from=card-qr', '?social=', '?social=myspace', '?links=nope&contact=', '?links=resume,book']) {
    assert.deepEqual(hidden(search), DEFAULT, search)
  }
})

test('a list adds to the default', () => {
  assert.deepEqual(hidden('?social=linkedin'), ['instagram', 'x'])
  assert.deepEqual(hidden('?social=LinkedIn,instagram,myspace'), ['x'])
  assert.deepEqual(hidden('?social=all'), [])
})

test('none first starts from nothing: only what it lists', () => {
  assert.deepEqual(hidden('?links=none,resume,site'), [...DEFAULT, 'book', 'github'])
  assert.deepEqual(hidden('?contact=none,whatsapp'), ['email', 'card', ...DEFAULT])
  assert.deepEqual(hidden('?contact=none&social=all'), ['email', 'card', 'whatsapp', 'contact'])
  assert.deepEqual(hidden('?links=none'), [...DEFAULT, 'book', 'resume', 'github', 'site', 'links'])
  assert.deepEqual(hidden('?links=all,none'), DEFAULT)
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
