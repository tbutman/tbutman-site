// Turns docs' product sheet (tilde-review/site-content/products.md, briefs/products-sheet.md) into
// src/content/booth/copy/products.json, for the site's ProductSection: one source of facts for every
// core product. It reads the sheet as docs writes it, and stops on anything else rather than drop a
// fact:
//
//   (docs' notes, then)
//   ---
//   ## The family                    shared text (## The family, ## Glossary): kept as blocks, as the
//   ### How every Tilde works        booth copy is (scripts/booth-copy.mjs)
//   ---                              a rule between parts: ignored
//   ## Cards                         a family; its products follow
//   ### Tilde Card, Solid body       a product (an optional {#id})
//   1. **Name:** …                   its fields, numbered, docs' labels in bold;
//      - **Scan:** …                 a field's list, one level, indented under it,
//        wrapped …                   and wrapped lines
//   ## Open questions for Thomas     for Thomas and us: never on a page
//   ## Source keys                   the same
//
// Fields (docs' labels): Name, One-liner, Problem, How it works, Uses, Options, Size and materials,
// Pairs well with, Make your own, Status, Sources. A label's note in brackets ("Options (Model
// Maker)") and a value inside the bold ("Status: final.") are both read. `[Thomas: …]`, `[name TBD]`
// and `[placeholder…]` stay in the text: the page shows them as gates, and the release build refuses
// them (scripts/prerender.mjs).
import { curly, parseCopy } from './booth-copy.mjs'

export const FIELDS = {
  name: 'name',
  'one-liner': 'oneLiner',
  problem: 'problem',
  'how it works': 'howItWorks',
  uses: 'uses',
  'use cases': 'uses',
  options: 'options',
  'size and materials': 'specs',
  'sizes and materials': 'specs',
  'pairs well with': 'pairsWith',
  'make your own': 'makeYourOwn',
  status: 'status',
  sources: 'sources',
}

// The site's anchors for each product and family, so links (Uses, Next stop, printed links) survive
// docs' renames (Fob Display → Tilde Stand, Thomas, October 26). Matched on the heading, first match
// wins; a heading's own {#id} wins over all of them.
export const PRODUCT_IDS = [
  [/^Tilde Card, Solid/i, 'solid'],
  [/^Tilde Card, Two-Piece/i, 'two-piece'],
  [/^Base tag/i, 'base-tag'],
  [/^Base coin/i, 'base-coin'],
  [/^Premium tag/i, 'premium-tag'],
  [/^Premium coin/i, 'premium-coin'],
  [/Retro handheld/i, 'retro-handheld'],
  [/^Sticky note/i, 'sticky-note'],
  [/^Calendar/i, 'calendar'],
  [/^Grocery list/i, 'grocery-list'],
  [/coaster/i, 'wifi-coaster'],
  [/Stand Mini|Fob Display, small|desk stand/i, 'stand-mini'],
  [/Tilde Stand|Fob Display, large|Wi-Fi console/i, 'stand'],
]
export const FAMILY_IDS = [
  [/^Cards/i, 'cards'],
  [/^Fobs/i, 'fobs'],
  [/home|desk/i, 'home'],
]
const pinned = (list, title) => list.find(([pattern]) => pattern.test(title))?.[1]

/** Sections kept for us, never on a page. */
const PRIVATE = /^(open questions|source keys)/i
/** Sections kept as text (blocks) rather than products. */
const TEXT = /^(the family|family intro|glossary)/i

const GATE = /`?\[(?:name TBD|Thomas: [^\]]*|placeholder[^\]]*)\]`?/g
export const slug = (text) =>
  text
    .replace(GATE, '')
    .toLowerCase()
    .replace(/\*\*|`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** The sheet as { sections, families }. Throws on a line it doesn't understand. */
export function parseProducts(markdown, name = 'products.md') {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const start = lines.indexOf('---')
  if (start < 0) throw new Error(`${name}: no --- after docs' notes`)
  const sections = []
  const families = []
  let mode = null // 'text', 'family', 'private'
  let text = null
  let family = null
  let product = null
  let field = null
  const fail = (i, message) => {
    throw new Error(`${name}:${i + 1}: ${message}: ${lines[i]}`)
  }
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    const h2 = line.match(/^## (.+)$/)
    if (h2) {
      product = field = null
      const title = h2[1].trim()
      if (PRIVATE.test(title)) mode = 'private'
      else if (TEXT.test(title)) {
        mode = 'text'
        text = { title, id: slug(title), lines: [] }
        sections.push(text)
      } else {
        mode = 'family'
        family = { name: title, id: pinned(FAMILY_IDS, title) ?? slug(title), products: [] }
        families.push(family)
      }
      continue
    }
    if (line === '---' || mode === 'private') continue
    if (mode === 'text') {
      text.lines.push(line)
      continue
    }
    if (!line.trim()) {
      continue
    }
    if (mode !== 'family') fail(i, 'a line before the first ## heading')
    const h3 = line.match(/^### (.+?)(?: \{#([a-z0-9-]+)\})?$/)
    if (h3) {
      product = { name: h3[1].trim(), id: h3[2] ?? pinned(PRODUCT_IDS, h3[1]) ?? slug(h3[1]), fields: {} }
      family.products.push(product)
      field = null
      continue
    }
    const top = line.match(/^\d+\. \*\*(.+?)\*\*(.*)$/)
    if (top && product) {
      // "Name:" / "Status: final." in the bold, or "Options" then " (Model Maker): …" after it.
      const [bold, rest] = [top[1], top[2]]
      let label = bold.replace(/:$/, '')
      let value = rest
      if (bold.includes(':')) {
        label = bold.slice(0, bold.indexOf(':'))
        value = `${bold.slice(bold.indexOf(':') + 1)}${rest}`
      } else value = rest.replace(/^\s*\([^)]*\)/, '').replace(/^:/, '')
      const key = FIELDS[label.trim().toLowerCase()]
      if (!key) fail(i, `a field this site doesn't know ("${label}"): add it to FIELDS, or ask docs`)
      field = product.fields[key] = { text: value.trim(), items: [] }
      continue
    }
    const item = line.match(/^ {2,4}(?:- |\d+\. )(.*)$/)
    if (item && field) {
      field.items.push(item[1].trim())
      continue
    }
    if (/^ {2,}\S/.test(line) && field) {
      // A wrapped line: of the field's last list item, or of its text before the list starts.
      if (field.items.length) field.items[field.items.length - 1] += ` ${line.trim()}`
      else field.text = `${field.text} ${line.trim()}`.trim()
      continue
    }
    fail(i, product ? 'a line outside a numbered field' : 'a line outside a product (###)')
  }
  const tidy = (value) => ({ text: curly(value.text), items: value.items.map(curly) })
  return {
    sections: sections.map((section) => ({
      title: curly(section.title),
      id: section.id,
      blocks: parseCopy(`---\n${section.lines.join('\n')}\n`, `${name}, ${section.title}`),
    })),
    families: families.map((f) => ({
      name: curly(f.name),
      id: f.id,
      products: f.products.map((p) => ({ name: curly(p.name), id: p.id, fields: Object.fromEntries(Object.entries(p.fields).map(([key, value]) => [key, tidy(value)])) })),
    })),
  }
}

/** Throws unless every product has the fields a page needs, and every id is unique. */
export function checkProducts(sheet, name = 'products.md') {
  const needed = ['oneLiner', 'howItWorks']
  const ids = new Set()
  for (const family of sheet.families) {
    for (const product of family.products) {
      if (ids.has(product.id)) throw new Error(`${name}: two products with the id ${product.id}: give one an {#id}`)
      ids.add(product.id)
      const missing = needed.filter((key) => !product.fields[key]?.text && !product.fields[key]?.items.length)
      if (missing.length) throw new Error(`${name}: ${product.name} has no ${missing.join(' or ')}`)
    }
  }
}
