// Tests for /hello's ?social= and ?links= (scripts/hello-share.mjs): what the script hides, and
// that the stylesheet hides each thing it can name. Run with `npm test`.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { helloShareScript, SHARE_GROUPS } from './hello-share.mjs'

// Runs the script for a query and returns what it hid, as <html data-hello-hide> would hold it.
function hidden(search) {
  let attribute = null
  const document = { documentElement: { setAttribute: (name, value) => (attribute = name === 'data-hello-hide' ? value : attribute) } }
  new Function('location', 'document', helloShareScript)({ search }, document)
  return attribute === null ? [] : attribute.split(' ')
}

test('no setting, all, or nothing it knows shows everything', () => {
  for (const search of ['', '?from=card-qr', '?social=all', '?links=all', '?social=', '?social=myspace', '?links=all,none']) {
    assert.deepEqual(hidden(search), [], search)
  }
})

test('a list shows only what it names', () => {
  assert.deepEqual(hidden('?social=linkedin'), ['instagram', 'x'])
  assert.deepEqual(hidden('?social=LinkedIn,instagram,myspace'), ['x'])
  assert.deepEqual(hidden('?links=resume,book'), ['github', 'site'])
  assert.deepEqual(hidden('?social=x&links=github'), ['instagram', 'linkedin', 'book', 'resume', 'site'])
})

test('none hides the whole group', () => {
  assert.deepEqual(hidden('?social=none'), ['instagram', 'x', 'linkedin', 'social'])
  assert.deepEqual(hidden('?links=none&social=all'), ['book', 'resume', 'github', 'site', 'links'])
})

test('the stylesheet hides every key and group', () => {
  const css = readFileSync(new URL('../src/styles/site.css', import.meta.url), 'utf8')
  for (const key of [...Object.keys(SHARE_GROUPS), ...Object.values(SHARE_GROUPS).flat()]) {
    assert.ok(css.includes(`[data-hello-hide~='${key}'] [data-hello-item='${key}']`), key)
  }
})
