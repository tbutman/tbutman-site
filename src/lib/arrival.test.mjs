// Tests for /hello's ?from= arrivals, and that deploy/nginx.conf's $hello_arrival map serves the same
// page the app would pick. Run with `npm test`.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { ARRIVALS, arrivalOf } from './arrival.ts'

const conf = readFileSync(new URL('../../deploy/nginx.conf', import.meta.url), 'utf8')
const block = /map \$arg_from \$hello_arrival \{\n([\s\S]*?)\n\}/.exec(conf)?.[1]
const entries = (block ?? '')
  .split('\n')
  .map((line) => line.trim().replace(/;$/, '').split(/\s+/))
  .map(([key, value]) => [key, value === '""' ? '' : value])

// What nginx serves for a value: an exact key first, then the first regex that matches.
function served(from) {
  const exact = entries.find(([key]) => key === from)
  if (exact) return exact[1]
  const regex = entries.find(([key]) => key.startsWith('~') && new RegExp(key.slice(1)).test(from))
  return regex ? regex[1] : entries.find(([key]) => key === 'default')[1]
}

test('listed values and their kinds', () => {
  for (const arrival of ARRIVALS) assert.equal(arrivalOf(arrival), arrival)
  assert.equal(arrivalOf('key-nfc'), 'fob')
  assert.equal(arrivalOf('qr-laptop'), 'qr')
  assert.equal(arrivalOf('nfc-desk-2'), 'nfc')
})

test('anything else is the plain page', () => {
  for (const from of [null, '', 'link', 'nope', 'Card-QR', 'qr-', 'nfc-Laptop', 'qr-a b', '../index', 'phone-pixel']) {
    assert.equal(arrivalOf(from), 'link', String(from))
  }
})

test('nginx serves the page the app picks', () => {
  assert.ok(block, 'no $hello_arrival map in deploy/nginx.conf')
  const samples = [...ARRIVALS, 'key-nfc', 'qr-laptop', 'nfc-desk-2', '', 'link', 'nope', 'Card-QR', 'qr-', 'nfc-Laptop', '../index', 'phone-pixel']
  for (const from of samples) {
    const arrival = arrivalOf(from)
    assert.equal(served(from), arrival === 'link' ? '' : arrival, from)
  }
  // Every page nginx can pick is one the build writes.
  for (const [, value] of entries) if (value) assert.ok(ARRIVALS.includes(value), value)
})
