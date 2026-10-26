// The booth copy converter (scripts/booth-copy.mjs): docs' Markdown subset to blocks, curly quotes,
// and the check that no text is dropped. Run with `npm test`.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkFidelity, curly, describe, parseCopy, relink } from './booth-copy.mjs'

const sample = `# Page

- **Page:** docs' notes, never on the page.

---

## The opening

**This is it.** Tap it and
it opens.

## Icons {#icons}

- **Tap it.** A sticker. \`[depends on U15]\`
  - If it fails, say: "not yet".
- Second,
  wrapped.

1. **Print** it.
2. Write it.

| | Coin | Tag |
|---|---|---|
| **Base** | Thin | Thin too |

[image: the box, open]

[image per design: the front, and the back]

[generated: one image per icon]
`

test('docs’ subset becomes blocks, without docs’ notes', () => {
  const blocks = parseCopy(sample, 'sample')
  assert.deepEqual(
    blocks.map((block) => block.type),
    ['h2', 'p', 'h2', 'ul', 'ol', 'table', 'image', 'image', 'generated'],
  )
  assert.deepEqual(blocks[0], { type: 'h2', text: 'The opening', id: 'the-opening' })
  assert.equal(blocks[1].text, '**This is it.** Tap it and it opens.')
  assert.equal(blocks[2].id, 'icons')
  assert.deepEqual(blocks[3].items, [
    { text: '**Tap it.** A sticker. `[depends on U15]`', sub: ['If it fails, say: “not yet”.'] },
    { text: 'Second, wrapped.', sub: [] },
  ])
  assert.deepEqual(blocks[5], { type: 'table', head: ['', 'Coin', 'Tag'], rows: [['**Base**', 'Thin', 'Thin too']] })
  assert.deepEqual(blocks[6], { type: 'image', text: 'the box, open' })
  assert.deepEqual(blocks[7], { type: 'image', text: 'per design: the front, and the back' })
  assert.doesNotThrow(() => checkFidelity(sample, blocks, 'sample'))
})

test('an [image: …] line wrapped over two lines is one marker', () => {
  const markdown = '---\n\n[image: the Share screen, with its\nchoices open]\n\nAfter.\n'
  const blocks = parseCopy(markdown, 'wrapped')
  assert.deepEqual(blocks, [
    { type: 'image', text: 'the Share screen, with its choices open' },
    { type: 'p', text: 'After.' },
  ])
  assert.doesNotThrow(() => checkFidelity(markdown, blocks, 'wrapped'))
  // Unclosed, it stops the sync instead of looping (it used to hang).
  assert.throws(() => parseCopy('---\n\n[image: never closed\n\nNext.\n'), /without its \]/)
})

test('a line the converter doesn’t read stops it', () => {
  assert.throws(() => parseCopy('---\n\n> a quote\n'), /doesn’t read/)
  assert.throws(() => parseCopy('no notes'), /no ---/)
})

test('dropped or changed text fails the fidelity check', () => {
  const blocks = parseCopy(sample, 'sample')
  blocks[1] = { type: 'p', text: '**This is it.** Tap it.' }
  assert.throws(() => checkFidelity(sample, blocks, 'sample'), /differ/)
})

test('quotes curl, except in code and link targets', () => {
  assert.equal(curly(`It's "ready" ('yes')`), 'It’s “ready” (‘yes’)')
  assert.equal(curly("`it's` [Thomas's](/a'b)"), "`it's` [Thomas’s](/a'b)")
})

test('a heading’s id leaves its gate out', () => {
  const blocks = parseCopy('---\n\n### Two-piece or solid `[depends on two-piece card]`\n')
  assert.equal(blocks[0].id, 'two-piece-or-solid')
})

test('docs’ link-preview description comes from the notes, wrapped or not', () => {
  const page = "# Page\n\n- **Page:** `/tilde/x`.\n- **Description (link previews):** One tag, one job: it's\n  wrapped.\n- **Name:** X.\n\n---\n\n## The opening\n\nText.\n"
  assert.equal(describe(page), 'One tag, one job: it’s wrapped.')
  assert.equal(describe('---\n\n## The opening\n\nText.\n'), null)
})

test('"Tilde for Android" links go to the App page, and nothing else moves', () => {
  const blocks = parseCopy('---\n\n- **The app:** [Tilde for Android](/tilde)\n- **Install:** [Tilde](/tilde)\n')
  const { blocks: out, changed } = relink(blocks)
  assert.equal(changed, 1)
  assert.equal(out[0].items[0].text, '**The app:** [Tilde for Android](/tilde/app)')
  assert.equal(out[0].items[1].text, '**Install:** [Tilde](/tilde)')
})

// Printed links land on these (booth tags, lids, the demo ring: tilde-review/booth-kit), so a heading
// docs renames must keep its id with {#id}, or this fails.
const USE_ANCHORS = ['call-my-family', 'contact-card', 'link', 'whatsapp', 'guest-wi-fi', 'share-your-number', 'lost-item', 'book-a-meeting', 'physical-bookmarks', 'with-just-your-phone']

test('every use on /tilde/uses keeps its anchor', async () => {
  const { readFile } = await import('node:fs/promises')
  const uses = JSON.parse(await readFile(new URL('../src/content/booth/copy/uses.json', import.meta.url), 'utf8'))
  const ids = uses.blocks.filter((block) => block.type === 'h3').map((block) => block.id)
  assert.deepEqual(ids.filter((id) => !USE_ANCHORS.includes(id)), [], 'a use without a pinned anchor: add it to USE_ANCHORS')
  assert.deepEqual(USE_ANCHORS.filter((id) => !ids.includes(id)), [], 'a pinned anchor is gone: docs can keep it with {#id}')
})
