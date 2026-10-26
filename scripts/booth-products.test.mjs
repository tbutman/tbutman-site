// The product sheet converter (scripts/booth-products.mjs): docs' site-content/products.md to the
// families and products ProductSection draws. Run with `npm test`.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { checkProducts, parseProducts } from './booth-products.mjs'

const stub = await readFile(new URL('./fixtures/products-stub.md', import.meta.url), 'utf8')

test('the sheet becomes families, products and their fields, as docs numbers them', () => {
  const sheet = parseProducts(stub)
  assert.deepEqual(
    sheet.families.map((family) => [family.id, family.products.map((product) => product.id)]),
    [
      ['cards', ['solid']],
      ['home', ['stand-mini']],
    ],
  )
  const card = sheet.families[0].products[0]
  assert.deepEqual(card.fields.howItWorks.items, ['**Scan:** the code opens your link.', '**Tap:** hold the phone there, within 1–3 cm.'])
  assert.equal(card.fields.uses.items.length, 2)
  assert.equal(card.fields.oneLiner.text, 'a made-up product, for checking the layout. Jane Doe’s, as every sample is.')
  assert.equal(card.fields.options.items[0], '**Colors:** your own. `[Thomas: which options to list here?]`')
  assert.equal(card.fields.specs.items[0], '85.6 × 54 mm, PLA.')
  assert.equal(card.fields.status.text, 'final. What’s left: nothing.')
  checkProducts(sheet)
})

test('the family intro and glossary are blocks; open questions never reach the site', () => {
  const sheet = parseProducts(stub)
  assert.deepEqual(sheet.sections.map((section) => section.id), ['the-family', 'glossary-one-name-for-each-thing'])
  assert.equal(sheet.sections[0].blocks[0].type, 'p')
  assert.ok(!JSON.stringify(sheet).includes('Never on a page'))
})

test('a field the site doesn’t know stops the sync', () => {
  assert.throws(() => parseProducts('---\n\n## Cards\n\n### X\n\n1. **Colour:** red\n'), /a field this site doesn't know/)
})

test('a line outside a field stops the sync', () => {
  assert.throws(() => parseProducts('---\n\n## Cards\n\n### X\n\nLoose text.\n'), /outside a numbered field/)
})

test('a product without its one-liner or how it works fails the check', () => {
  assert.throws(() => checkProducts(parseProducts('---\n\n## Cards\n\n### X\n\n1. **Problem:** none\n')), /no oneLiner or howItWorks/)
})
