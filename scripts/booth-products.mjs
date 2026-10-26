// Turns docs' product sheet (tilde-review/site-content/products.md, briefs/products-sheet.md) into
// src/content/booth/copy/products.json, for the site's ProductSection: one source of facts for every
// core product. It reads this shape, and stops on anything else rather than drop a fact:
//
//   (docs' notes, then)
//   ---
//   ## Cards                         a family; `## Around the home [name TBD]` keeps its marker
//   ### Two-Piece                    a product, with an optional {#id}
//   - **One-liner:** …               a field: its text on the line and wrapped lines under it,
//   - **Use cases:**                 and/or sub-bullets (a list)
//     - Save my contact: …
//   ## Family intro / ## Glossary    kept as text, for the hub and the checker
//
// Fields, by docs' labels (any case; "Field (note)" counts as "Field"): Name, One-liner, Problem, How it
// works, Use cases, Options, Sizes and materials, Pairs well with, Make your own, Status, Sources.
// `[Thomas: …]` and `[name TBD]` stay in the text: the page shows them as gates, and the release build
// refuses them (scripts/prerender.mjs).
import { curly } from './booth-copy.mjs'

export const FIELDS = {
  name: 'name',
  'one-liner': 'oneLiner',
  problem: 'problem',
  'the problem': 'problem',
  'how it works': 'howItWorks',
  'use cases': 'uses',
  uses: 'uses',
  options: 'options',
  'sizes and materials': 'sizes',
  sizes: 'sizes',
  'pairs well with': 'pairsWith',
  'make your own': 'makeYourOwn',
  status: 'status',
  sources: 'sources',
}

const slug = (text) =>
  text
    .replace(/\[(?:name TBD|Thomas: [^\]]*)\]/g, '')
    .toLowerCase()
    .replace(/\*\*|`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const TEXT_SECTIONS = /^(family intro|the family|glossary)\b/i

/** The sheet as { families, sections }. Throws on a line it doesn't understand. */
export function parseProducts(markdown, name = 'products.md') {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const start = lines.indexOf('---')
  if (start < 0) throw new Error(`${name}: no --- after docs' notes`)
  const families = []
  const sections = []
  let family = null
  let product = null
  let section = null
  let field = null
  const fail = (i, message) => {
    throw new Error(`${name}:${i + 1}: ${message}: ${lines[i]}`)
  }
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) {
      field = null
      continue
    }
    const h2 = line.match(/^## (.+)$/)
    if (h2) {
      product = field = null
      if (TEXT_SECTIONS.test(h2[1])) {
        section = { title: h2[1].trim(), id: slug(h2[1]), text: [] }
        sections.push(section)
        family = null
      } else {
        section = null
        family = { name: h2[1].trim(), id: slug(h2[1]), products: [] }
        families.push(family)
      }
      continue
    }
    if (section) {
      if (/^#{3,} /.test(line)) fail(i, 'a heading inside the intro or glossary')
      section.text.push(line)
      continue
    }
    const h3 = line.match(/^### (.+?)(?: \{#([a-z0-9-]+)\})?$/)
    if (h3) {
      if (!family) fail(i, 'a product before its family (##)')
      product = { name: h3[1].trim(), id: h3[2] ?? slug(h3[1]), fields: {} }
      family.products.push(product)
      field = null
      continue
    }
    const top = line.match(/^- \*\*([^*]+?):?\*\*:? ?(.*)$/)
    if (top && product) {
      const label = top[1].replace(/\s*\(.*\)$/, '').trim().toLowerCase()
      const key = FIELDS[label]
      if (!key) fail(i, `a field this site doesn't know ("${top[1]}"): add it to FIELDS, or ask docs`)
      field = product.fields[key] = { text: top[2].trim(), items: [] }
      continue
    }
    const sub = line.match(/^ {2,4}- (.*)$/)
    if (sub && field) {
      field.items.push(sub[1].trim())
      continue
    }
    if (/^ {2,}\S/.test(line) && field) {
      // A wrapped line: of the last sub-bullet if it's indented under one, else of the field's text.
      if (field.items.length && /^ {4,}\S/.test(line)) field.items[field.items.length - 1] += ` ${line.trim()}`
      else field.text = `${field.text} ${line.trim()}`.trim()
      continue
    }
    fail(i, product ? 'a line outside a field (- **Field:** …)' : 'a line outside a product')
  }
  const tidy = (field) => ({ text: curly(field.text), items: field.items.map(curly) })
  return {
    families: families.map((f) => ({
      ...f,
      name: curly(f.name),
      products: f.products.map((p) => ({ ...p, name: curly(p.name), fields: Object.fromEntries(Object.entries(p.fields).map(([key, value]) => [key, tidy(value)])) })),
    })),
    sections: sections.map((s) => ({ ...s, text: curly(s.text.join('\n').trim()) })),
  }
}

/** Throws unless every product has the fields a page needs (the rest may wait for Thomas). */
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
