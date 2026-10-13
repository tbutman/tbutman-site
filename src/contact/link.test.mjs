// Tests for the contact link (X1) against the shared vectors in vectors.json, which the app's
// tests use too (spec: tilde-review/specs/x1-contact-link.md). Run with `npm test`.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  addressParts,
  COLORS,
  decodeFragment,
  defaultLabel,
  displayAddress,
  encodeContact,
  LIMITS,
  LINK_BASE,
  mailtoHref,
  stickerLink,
  telHref,
  uriRecordBytes,
  vcard,
  vcardFileName,
} from './link.ts'

// The vectors' SHA-256, pinned in the spec's header and in the app's ContactLinkTest too: a change
// to the vectors fails every suite until each copy and each pin is updated (checker improvement 3).
const X1_VECTORS_SHA256 = '5e4ac1133df3c7116409dfee16c7f66926273f14592ace8e9f831b6c3bed4538'
const vectorsFile = readFileSync(new URL('./vectors.json', import.meta.url))
const vectors = JSON.parse(vectorsFile.toString('utf8'))
const fragmentOf = (url) => (url.includes('#') ? url.slice(url.indexOf('#')) : '')

test('the vectors are the pinned copy', () => {
  assert.equal(createHash('sha256').update(vectorsFile).digest('hex'), X1_VECTORS_SHA256)
})

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

// Each case is the page's Save contact in one language, on October 13, 2026.
for (const v of vectors.vcard) {
  test(`vcard: ${v.name}`, () => {
    const decoded = decodeFragment(fragmentOf(v.url))
    assert.ok(decoded.ok)
    assert.ok(['en-US', 'pt-PT'].includes(v.locale))
    assert.equal(vcard(decoded.contact, v.options), v.vcard)
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

test('without options, the vCard keeps "mobile (US)" in English and adds no note', () => {
  const decoded = decodeFragment('#1;n=Jane;p=+1%20555%20010%200199,mobile%20(US);p=+351%20912%20345%20678,mobile')
  assert.ok(decoded.ok)
  const text = vcard(decoded.contact)
  assert.match(text, /item1\.X-ABLabel:mobile \(US\)\r\n/)
  assert.doesNotMatch(text, /item2\.X-ABLabel|NOTE/)
})

test('one email is never PREF; a label without its key adds no type', () => {
  const one = decodeFragment('#1;n=Jane;e=jane@example.com,work')
  assert.match(vcard(one.contact), /\r\nEMAIL;TYPE=INTERNET,WORK:jane@example\.com\r\n/)
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

test('international domains in Latin script show as written, others in punycode', () => {
  assert.equal(displayAddress('https://xn--bcher-kva.example/'), 'bücher.example')
  assert.equal(displayAddress('https://www.xn--caf-dma.pt/menu'), 'café.pt/menu')
  assert.equal(displayAddress('http://xn--bcher-kva.example:8443/a?b=1'), 'http://bücher.example:8443/a?b=1')
  assert.equal(displayAddress(new URL('https://łódź.example/').href), 'łódź.example')
  // Look-alikes stay in punycode: Cyrillic "а", and the Latin letters that pass for ASCII (R8-S6, C14).
  // Kept as written: letters with a visible mark, such as đ, ħ and ŋ.
  assert.equal(displayAddress('https://xn--pple-43d.com/'), 'xn--pple-43d.com')
  for (const host of ['lınkedın.com', 'ŀinkedin.com', 'ĸite.example', 'ŉews.example', 'þaypal.com', 'ðropbox.com']) {
    const url = new URL(`https://${host}/`).href
    assert.match(displayAddress(url), /^xn--/, host)
  }
  assert.equal(displayAddress(new URL('https://đaħŋ.example/').href), 'đaħŋ.example')
  // One non-Latin label keeps the whole host in punycode.
  assert.equal(displayAddress('https://xn--bcher-kva.xn--pple-43d.com/'), 'xn--bcher-kva.xn--pple-43d.com')
  assert.deepEqual(addressParts('https://www.example.com/a/b?c=1&d=2'), { host: 'example.com', rest: '/a/b?c=1&d=2' })
  assert.deepEqual(addressParts('https://example.com/'), { host: 'example.com', rest: '' })
})

test('tel: and mailto: links come only from checked values (checker C8)', () => {
  assert.equal(telHref('+351 912 345 678'), 'tel:+351912345678')
  assert.equal(telHref('*#06#'), null)
  assert.equal(telHref('+1 555 010 0199,1'), null)
  assert.equal(mailtoHref('jane@example.com'), 'mailto:jane@example.com')
  assert.equal(mailtoHref('jane@example.com?bcc=x@evil.example'), null)
  assert.equal(mailtoHref('jane@example.com,work'), null)
  const all = [...vectors.encode.map((v) => v.decoded), ...vectors.decode.filter((v) => v.contact).map((v) => v.contact)]
  for (const c of all) {
    for (const p of c.phones) assert.match(telHref(p.number), /^tel:\+?[0-9]+$/)
    for (const e of c.emails) assert.match(mailtoHref(e), /^mailto:[A-Za-z0-9.!$'*+/=^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/)
  }
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
  const pieces = ['%F3%A0%81%81', '%E1%A0%8E', '%EF%BF%B9', '%E3%85%A4', '%E2%A0%80', '%E2%80%8D', '%C3%9F', 'h', 'c', 'janedoe', 'iris', 'IRIS', '~', '1', ';', '=', ',', '%', '%0A', '%0D', '%00', '%E2%80%AE', '%E2%80%A8', '%E2%80%A9', '%E2%80%8B', '%C2%AD', '%CC%81', '%FF', '%C3%A3', 'n', 't', 'o', 'e', 'p', 'u', 'a', '@', 'work', 'home', 'paypal.com', '%CB%99', '%EA%93%B8', '%EF%B8%8F', '%C2%B7', '%E2%80%A2', '%C2%B8', '%E3%80%81', 'GitHub', 'l', '.', ' ', '+', '9', 'x.com', 'https://', 'javascript:', '<b>', '"', '#', '\\']
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
    const values = [c.name, c.title, c.company, ...(c.line === undefined ? [] : [c.line]), ...c.emails, ...c.phones.flatMap((p) => [p.number, p.label]), ...c.links.flatMap((l) => [l.url, l.label])]
    // oxlint-disable-next-line no-control-regex -- matching control characters is the point
    for (const value of values) {
      // Flags keep their tag characters; nothing else invisible gets through.
      const outsideFlags = value.replace(/\u{1f3f4}[\u{e0020}-\u{e007e}]+\u{e007f}/gu, '')
      // oxlint-disable-next-line no-control-regex -- matching control characters is the point
      assert.doesNotMatch(outsideFlags, /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u115f\u1160\u3164\uffa0]|(?![\u200c\u200d])\p{Cf}|(?:\p{M}[\u200c\u200d]*){4}/u)
    }
    for (const link of c.links) assert.match(link.url, /^https?:\/\/[^/@]+\//)
    for (const p of c.phones) assert.match(telHref(p.number), /^tel:\+?[0-9]+$/)
    for (const e of c.emails) assert.match(mailtoHref(e) ?? '', /^mailto:[^?&#%,]+$/)
    if (c.emailLabels !== undefined) {
      assert.equal(c.emailLabels.length, c.emails.length)
      assert.ok(c.emailLabels.some(Boolean) && c.emailLabels.every((l) => ['', 'work', 'home'].includes(l)))
    }
    if (c.handle !== undefined) assert.match(c.handle, /^[a-z0-9._-]{1,20}$/)
    if (c.color !== undefined) assert.ok(COLORS.includes(c.color), c.color)
    if (c.line !== undefined) assert.ok(c.line !== '' && [...c.line].length <= LIMITS.line, c.line)
    // One card, with only the properties the page writes.
    const lines = vcard(c).split('\r\n').filter(Boolean)
    for (const line of lines) {
      assert.match(line, /^( |BEGIN:VCARD$|END:VCARD$|VERSION:3\.0$|N:|FN:|ORG:|TITLE:|EMAIL;TYPE=INTERNET(,WORK|,HOME)?(,PREF)?:|item\d+\.(TEL;TYPE=CELL|URL|X-ABLabel):)/, line)
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
  const face = decodeFragment(fragmentOf(vectors.encode.find((v) => v.fields.line).url))
  assert.ok(face.ok && face.contact.handle === 'janedoe' && face.contact.color === 'sea' && face.contact.line === 'Web Summit 2026 · Lisbon')
  const { handle: _handle, color: _color, line: _line, ...plain } = face.contact
  assert.equal(vcard(face.contact), vcard(plain))
})

test('the card face comes last, so the rest of the link keeps its bytes', () => {
  const plain = encodeContact(vectors.encode[1].fields)
  const face = encodeContact({ ...vectors.encode[1].fields, handle: 'janedoe', color: 'iris' })
  assert.equal(face, `${plain};h=janedoe;c=iris`)
  // The line (design §17 rec. 8) comes after them.
  assert.equal(encodeContact({ ...vectors.encode[1].fields, handle: 'janedoe', color: 'iris', line: 'Lisbon' }), `${face};l=Lisbon`)
})
