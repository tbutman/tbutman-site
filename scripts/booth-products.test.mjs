// The product sheet converter (scripts/booth-products.mjs): docs' site-content/products.md to the
// families and products ProductSection draws. Run with `npm test`.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { checkProducts, parseProducts } from './booth-products.mjs'

const stub = await readFile(new URL('./fixtures/products-stub.md', import.meta.url), 'utf8')

test('the stub sheet becomes families, products and their fields', () => {
  const sheet = parseProducts(stub)
  assert.deepEqual(
    sheet.families.map((family) => [family.id, family.products.map((product) => product.id)]),
    [
      ['cards', ['stub-card']],
      ['around-the-home', ['stub-note']],
    ],
  )
  const card = sheet.families[0].products[0]
  assert.equal(card.fields.howItWorks.text, 'Tap it with a phone, or scan its code. Any phone reads it; the app writes it on Android.')
  assert.equal(card.fields.uses.items.length, 2)
  assert.equal(card.fields.oneLiner.text, 'A made-up product, for checking the layout. Jane Doe’s, as every sample is.')
  assert.match(card.fields.options.items[1], /\[Thomas: which options to list here\?\]/)
  assert.equal(sheet.families[1].name, 'Around the home [name TBD]')
  assert.deepEqual(sheet.sections.map((section) => section.id), ['family-intro', 'glossary'])
  checkProducts(sheet)
})

test('a field the site doesn’t know stops the sync', () => {
  assert.throws(() => parseProducts('---\n\n## Cards\n\n### X\n\n- **Colour:** red\n'), /a field this site doesn't know/)
})

test('a line outside a field stops the sync', () => {
  assert.throws(() => parseProducts('---\n\n## Cards\n\n### X\n\nLoose text.\n'), /outside a field/)
})

test('a product without its one-liner or how it works fails the check', () => {
  assert.throws(() => checkProducts(parseProducts('---\n\n## Cards\n\n### X\n\n- **Problem:** none\n')), /no oneLiner or howItWorks/)
})
