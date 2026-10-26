// Tests for the note link (N1, tilde-review/specs/notes-link.md, section 2): the page's decoder, and
// the encoder this side keeps for the LAN test server. The cases below are the spec's own list
// (§2.5); the shared vectors (specs/notes-test-vectors.json, the app agent's) run too once they're
// copied to src/note/vectors.json and pinned. Run with `npm test`.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import { cleanMessage, decode, encodeNote, encodeValue, LIMITS } from './link.ts'

const note = (fragment) => {
  const decoded = decode(fragment)
  assert.equal(decoded.ok, true, `expected a note from ${fragment.slice(0, 80)}: ${decoded.reason}`)
  return decoded.note
}
const reason = (fragment) => {
  const decoded = decode(fragment)
  assert.equal(decoded.ok, false, `expected no note from ${fragment.slice(0, 80)}`)
  return decoded.reason
}

test('the spec’s two examples', () => {
  const list = note('#n1;d=k3f9;w=20261026;t=Groceries;i=Milk;i=Bread;i=Olive+oil;x=Eggs')
  assert.deepEqual(list, {
    id: 'k3f9',
    written: '20261026',
    title: 'Groceries',
    message: '',
    items: [
      { text: 'Milk', done: false },
      { text: 'Bread', done: false },
      { text: 'Olive oil', done: false },
      { text: 'Eggs', done: true },
    ],
  })
  const message = note("#n1;d=7qa2;t=For+the+sitter;m=Back+at+6.%0ADinner's+in+the+fridge,+bedtime+8:30.")
  assert.equal(message.message, "Back at 6.\nDinner's in the fridge, bedtime 8:30.")
})

test('fields in any order, items in theirs; unknown and long keys are skipped', () => {
  const n = note('#n1;i=One;t=Title;zz=skip;longerkey=skip;nokey;=x;x=Two;d=ab12')
  assert.equal(n.title, 'Title')
  assert.deepEqual(n.items.map((item) => item.text), ['One', 'Two'])
})

test('the version: not a note link, newer, or a contact or Wi-Fi link', () => {
  assert.equal(reason(''), 'empty')
  assert.equal(reason('#n1'), 'empty')
  assert.equal(reason('#1;n=Jane'), 'empty')
  assert.equal(reason('#w1;s=Cafe'), 'empty')
  assert.equal(reason('#n2;t=Later'), 'newer')
  assert.equal(reason('#n1;'), 'empty')
})

test('damaged: twice, bad escapes, overlong UTF-8, too long', () => {
  assert.equal(reason('#n1;t=A;t=B'), 'damaged')
  assert.equal(reason('#n1;d=ab12;d=cd34;t=A'), 'damaged')
  assert.equal(reason('#n1;t=%G1'), 'damaged')
  assert.equal(reason('#n1;t=%E2%82'), 'damaged')
  assert.equal(reason('#n1;t=%C0%AF'), 'damaged')
  assert.equal(reason('#n1;t=50%'), 'damaged')
  // The fragment after the #: "n1;t=" and the value. 4,096 is read; 4,097 is damaged.
  assert.equal(reason(`#n1;t=${'a'.repeat(LIMITS.fragment - 4)}`), 'damaged')
  assert.equal(note(`#n1;t=${'a'.repeat(LIMITS.fragment - 5)}`).title.length, LIMITS.title)
})

test('a bad date or id is skipped, not damaged', () => {
  const n = note('#n1;d=AB12;w=20260231;t=Hi')
  assert.equal(n.id, null)
  assert.equal(n.written, null)
  assert.equal(note('#n1;w=20251231;t=Hi').written, null)
  assert.equal(note('#n1;w=20280229;t=Hi').written, '20280229')
})

test('hostile text stays text: controls, bidi overrides, markup, links', () => {
  const n = note('#n1;t=%E2%80%AEevil;m=Visit+https://example.com/x%0A%01bell;i=%3Cscript%3Ealert(1)%3C/script%3E')
  assert.equal(n.title, 'evil')
  assert.equal(n.message, 'Visit https://example.com/x\nbell')
  assert.equal(n.items[0].text, '<script>alert(1)</script>')
})

test('limits: a 41-character title, an 81-character item, 101 items, empty items', () => {
  assert.equal([...note(`#n1;t=${'a'.repeat(41)}`).title].length, 40)
  assert.equal([...note(`#n1;i=${'b'.repeat(81)}`).items[0].text].length, 80)
  const many = note(`#n1;${Array.from({ length: 101 }, (_, i) => `i=item+${i}`).join(';')}`)
  assert.equal(many.items.length, 100)
  assert.deepEqual(note('#n1;i=+++;i=Milk').items, [{ text: 'Milk', done: false }])
  assert.equal(reason('#n1;i=+++;t=%20'), 'empty')
})

test('the message: CR LF, blank lines, 12 lines, 500 characters', () => {
  assert.equal(cleanMessage('a\r\nb\rc'), 'a\nb\nc')
  assert.equal(cleanMessage('a\n\n\n\nb'), 'a\n\nb')
  assert.equal(cleanMessage('\n\na  \n'), 'a')
  assert.equal(cleanMessage(Array.from({ length: 14 }, (_, i) => `line ${i}`).join('\n')).split('\n').length, 12)
  assert.equal([...cleanMessage('x'.repeat(600))].length, 500)
})

test('a cut never splits what a reader sees as one character', () => {
  const family = '\u{1f468}‍\u{1f469}‍\u{1f467}'
  const title = note(`#n1;t=${encodeValue('a'.repeat(38) + family)}`).title
  assert.ok(!title.endsWith('‍'))
  const flags = note(`#n1;t=${encodeValue('a'.repeat(39) + '\u{1f1f5}\u{1f1f9}')}`).title
  assert.equal(flags, 'a'.repeat(39))
})

test('encoding: + for space, a real + escaped, the safe set kept, UTF-8 upper case', () => {
  assert.equal(encodeValue("Milk & eggs + café; 50% #1 (it's)"), "Milk+&+eggs+%2B+caf%C3%A9%3B+50%25+%231+(it's)")
  const link = encodeNote({ id: 'k3f9', written: '20261026', title: 'Groceries', items: [{ text: 'Milk', done: false }, { text: 'Eggs', done: true }] })
  assert.equal(link, 'https://taptilde.com/n#n1;d=k3f9;w=20261026;t=Groceries;i=Milk;x=Eggs')
  for (const text of ['pão', 'שלום', 'مرحبا', '🇵🇹', 'a+b;c%d#e']) {
    assert.equal(note(encodeNote({ title: text }).slice(LINK_BASE_LENGTH)).title, text)
  }
})
const LINK_BASE_LENGTH = 'https://taptilde.com/n'.length

// The shared vectors, once the app agent's are final: the same file as the app's, pinned by hash.
const vectorsUrl = new URL('./vectors.json', import.meta.url)
const N1_VECTORS_SHA256 = null
test('the shared vectors (specs/notes-test-vectors.json)', { skip: !existsSync(vectorsUrl) && 'not final yet' }, () => {
  const bytes = readFileSync(vectorsUrl)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), N1_VECTORS_SHA256)
})
