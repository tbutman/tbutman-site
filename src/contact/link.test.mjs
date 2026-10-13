// Tests for the contact link (X1) against the shared vectors in vectors.json, which the app's
// tests use too (spec: tilde-review/specs/x1-contact-link.md). Run with `npm test`.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  COLORS,
  decodeFragment,
  defaultLabel,
  displayAddress,
  encodeContact,
  LIMITS,
  LINK_BASE,
  stickerLink,
  uriRecordBytes,
  vcard,
  vcardFileName,
} from './link.ts'

const vectors = JSON.parse(readFileSync(new URL('./vectors.json', import.meta.url), 'utf8'))
const fragmentOf = (url) => (url.includes('#') ? url.slice(url.indexOf('#')) : '')

test('the vectors are version 1 on taptilde.com', () => {
  assert.equal(vectors.version, 1)
  assert.equal(vectors.base, LINK_BASE)
  assert.ok(vectors.encode.length >= 11 && vectors.decode.length >= 33 && vectors.vcard.length >= 4 && vectors.sticker.length >= 7)
})

for (const v of vectors.encode) {
  test(`encode: ${v.name}`, () => {
    assert.equal(encodeContact(v.fields), v.url)
    assert.equal(uriRecordBytes(v.url), v.uriRecordBytes)
    // ASCII only, so the NDEF URI record needs no further encoding.
    assert.match(v.url, /^[\x21-\x7e]+$/)
    assert.deepEqual(decodeFragment(fragmentOf(v.url)), { ok: true, contact: v.decoded })
  })
}

for (const v of vectors.decode) {
  test(`decode: ${v.name}`, () => {
    const decoded = decodeFragment(fragmentOf(v.url))
    if (v.error) assert.deepEqual(decoded, { ok: false, reason: v.error })
    else assert.deepEqual(decoded, { ok: true, contact: v.contact })
  })
}

for (const v of vectors.vcard) {
  test(`vcard: ${v.name}`, () => {
    const decoded = decodeFragment(fragmentOf(v.url))
    assert.ok(decoded.ok)
    assert.equal(vcard(decoded.contact), v.vcard)
  })
}

for (const v of vectors.sticker) {
  test(`sticker: ${v.name}`, () => {
    const result = stickerLink(v.fields, v.maxBytes)
    assert.deepEqual(result, v.result)
    if (result) assert.ok(uriRecordBytes(result.url) <= v.maxBytes)
  })
}

test('decoding accepts the fragment with or without the #', () => {
  const url = vectors.encode[1].url
  assert.deepEqual(decodeFragment(fragmentOf(url)), decodeFragment(fragmentOf(url).slice(1)))
})

test('every decoded contact round-trips through the encoder', () => {
  for (const v of vectors.encode) {
    const again = encodeContact(v.decoded)
    assert.deepEqual(decodeFragment(fragmentOf(again)).contact, v.decoded)
  }
})

test('the encoder refuses a contact without a visible name', () => {
  assert.throws(() => encodeContact({ name: '  ' }))
  assert.throws(() => encodeContact({ name: '\u200b\u200d' }))
})

test('stickerLink never returns a link the page would refuse or misread', () => {
  for (const v of vectors.encode) {
    for (const maxBytes of [1024, 300, 137, 90]) {
      const result = stickerLink(v.fields, maxBytes)
      if (!result) continue
      const decoded = decodeFragment(fragmentOf(result.url))
      assert.ok(decoded.ok, `${v.name} at ${maxBytes}`)
      assert.equal(encodeContact(decoded.contact), result.url)
    }
  }
})

test('default labels come from the address', () => {
  assert.equal(defaultLabel('https://www.linkedin.com/in/janedoe'), 'LinkedIn')
  assert.equal(defaultLabel('https://uk.linkedin.com/in/janedoe'), 'LinkedIn')
  assert.equal(defaultLabel('https://notlinkedin.com/'), 'Website')
  assert.equal(defaultLabel('https://twitter.com/janedoe'), 'X')
  assert.equal(defaultLabel('https://example.com/'), 'Website')
  assert.equal(defaultLabel('not a url at all'), 'Website')
})

test('addresses show without https://, www. or a lone slash', () => {
  assert.equal(displayAddress('https://www.linkedin.com/in/janedoe'), 'linkedin.com/in/janedoe')
  assert.equal(displayAddress('https://example.com/'), 'example.com')
  assert.equal(displayAddress('http://example.org/blog'), 'http://example.org/blog')
  assert.equal(displayAddress('https://example.com/shop?ref=tilde&x=1'), 'example.com/shop?ref=tilde&x=1')
  assert.equal(displayAddress('https://xn--pple-43d.com/'), 'xn--pple-43d.com')
  assert.equal(displayAddress('https://www.com/'), 'www.com')
  assert.equal(displayAddress('https://www.example.co.uk/'), 'example.co.uk')
})

test('file names drop characters file systems refuse', () => {
  const contact = (name) => ({ name, title: '', company: '', emails: [], phones: [], links: [] })
  assert.equal(vcardFileName(contact('Jane Doe')), 'Jane Doe.vcf')
  assert.equal(vcardFileName(contact('J. Doe/../../etc')), 'J Doeetc.vcf')
  assert.equal(vcardFileName(contact('...')), 'contact.vcf')
})

test('long vCard lines fold at 75 octets without splitting a character', () => {
  const decoded = decodeFragment(`#1;n=${encodeURIComponent('Ã'.repeat(100))}`)
  assert.ok(decoded.ok)
  for (const line of vcard(decoded.contact).split('\r\n')) {
    assert.ok(new TextEncoder().encode(line).length <= 75, line)
    assert.ok(!line.includes('\uFFFD'))
  }
})

// Random fragments made of the characters that matter: whatever comes in, the decoder returns a
// result instead of throwing, and anything it accepts is safe to show and to put in a vCard.
test('fuzz: hostile fragments never throw or leak control characters', () => {
  const pieces = ['h', 'c', 'janedoe', 'iris', 'IRIS', '~', '1', ';', '=', ',', '%', '%0A', '%0D', '%00', '%E2%80%AE', '%E2%80%A8', '%E2%80%A9', '%E2%80%8B', '%C2%AD', '%CC%81', '%FF', '%C3%A3', 'n', 't', 'o', 'e', 'p', 'u', 'a', '@', '.', ' ', '+', '9', 'x.com', 'https://', 'javascript:', '<b>', '"', '#', '\\']
  let seed = 7
  const random = (n) => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed % n
  }
  for (let i = 0; i < 5000; i++) {
    let fragment = '1;n=Jane'
    const length = random(40)
    for (let j = 0; j < length; j++) fragment += pieces[random(pieces.length)]
    const decoded = decodeFragment(fragment)
    if (!decoded.ok) continue
    const c = decoded.contact
    const values = [c.name, c.title, c.company, ...c.emails, ...c.phones.flatMap((p) => [p.number, p.label]), ...c.links.flatMap((l) => [l.url, l.label])]
    // oxlint-disable-next-line no-control-regex -- matching control characters is the point
    for (const value of values) assert.doesNotMatch(value, /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u00ad\u061c\u200b\u200e\u200f\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff]|\p{M}{4}/u)
    for (const link of c.links) assert.match(link.url, /^https?:\/\/[^/@]+\//)
    if (c.handle !== undefined) assert.match(c.handle, /^[a-z0-9._-]{1,20}$/)
    if (c.color !== undefined) assert.ok(COLORS.includes(c.color), c.color)
    // One card, with only the properties the page writes.
    const lines = vcard(c).split('\r\n').filter(Boolean)
    for (const line of lines) {
      assert.match(line, /^( |BEGIN:VCARD$|END:VCARD$|VERSION:3\.0$|N:|FN:|ORG:|TITLE:|EMAIL;TYPE=INTERNET:|item\d+\.(TEL;TYPE=CELL|URL|X-ABLabel):)/, line)
    }
    assert.equal(lines.filter((line) => line === 'BEGIN:VCARD').length, 1)
  }
})

test('the limits hold', () => {
  assert.equal(decodeFragment(`#1;n=Jane;t=${'a'.repeat(LIMITS.fragment)}`).reason, 'damaged')
  const many = Array.from({ length: 12 }, (_, i) => `u=example${i}.com`).join(';')
  const decoded = decodeFragment(`#1;n=Jane;${many}`)
  assert.equal(decoded.contact.links.length, LIMITS.links)
})

test('the card face never reaches the vCard', () => {
  const face = decodeFragment(fragmentOf(vectors.encode.find((v) => v.fields.color === 'iris').url))
  assert.ok(face.ok && face.contact.handle === 'janedoe' && face.contact.color === 'iris')
  const { handle: _handle, color: _color, ...plain } = face.contact
  assert.equal(vcard(face.contact), vcard(plain))
})

test('the card face comes last, so the rest of the link keeps its bytes', () => {
  const plain = encodeContact(vectors.encode[1].fields)
  const face = encodeContact({ ...vectors.encode[1].fields, handle: 'janedoe', color: 'iris' })
  assert.equal(face, `${plain};h=janedoe;c=iris`)
})
