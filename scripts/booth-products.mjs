// Turns docs' product sheet (tilde-review/site-content/products.md, briefs/products-sheet.md) into
// src/content/booth/copy/products.json, for the site's ProductSection: one source of facts for every
// core product. It reads the sheet as docs writes it (draft 4, after visitor round 1), and stops on
// anything else rather than drop a fact:
//
//   (docs' notes, then)
//   ---
//   ## The family                    shared text, kept as blocks as the booth copy is
//   ### How every Tilde works        (scripts/booth-copy.mjs): The family and its ### parts
//   ---                              a rule between parts: ignored
//   ## Cards                         a family; its products follow
//   ### Tilde Card, Solid            a product (an optional {#id})
//   - **One-liner:** …               its page fields: a bold label, its text, and wrapped lines,
//     - **Scan:** …                  and/or a list under it (bullets or numbers), one level
//   **For makers**                   then its makers' fields, the same way (folded on the page)
//   - **What you need:**
//   **Notes (never rendered)**       docs' notes: setting names, gates, status, sources. Never read.
//   ## … (never rendered)            the same for whole sections: notes for surfaces, the glossary,
//                                    open questions, source keys
//
// Fields (docs' labels): Name, Availability, One-liner, Problem, How it works, Uses, Pairs well with;
// for makers: Options, Size and materials, What you need, Get the files. A label's note in brackets
// ("Options (Model Maker)") and a value inside the bold ("Status: final.") are both read.
import { curly, parseCopy } from './booth-copy.mjs'

export const FIELDS = {
  name: 'name',
  availability: 'availability',
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
  'what you need': 'whatYouNeed',
  'get the files': 'files',
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
const PRIVATE = /never rendered|^(open questions|source keys)/i
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
  let skipping = false
  const fail = (i, message) => {
    throw new Error(`${name}:${i + 1}: ${message}: ${lines[i]}`)
  }
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    const h2 = line.match(/^## (.+)$/)
    if (h2) {
      product = field = null
      skipping = false
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
      skipping = false
      continue
    }
    // A product's parts: its page fields, then **For makers**, then **Notes (never rendered)**.
    const part = line.match(/^\*\*(For makers|Notes[^*]*)\*\*$/)
    if (part && product) {
      skipping = /^Notes/.test(part[1])
      field = null
      continue
    }
    if (skipping) {
      if (/^\S/.test(line) && !/^(- |\d+\. )/.test(line)) fail(i, 'a line after Notes that isn\'t a note')
      continue
    }
    // A field: "- **Label:** text", or numbered as in earlier drafts.
    const top = line.match(/^(?:- |\d+\. )\*\*(.+?)\*\*(.*)$/)
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
    fail(i, product ? 'a line outside a field' : 'a line outside a product (###)')
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
