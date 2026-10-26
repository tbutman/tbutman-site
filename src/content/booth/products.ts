// Docs' product sheet (tilde-review/site-content/products.md), as npm run booth:sync writes it: one
// source of facts for every core product, drawn by ProductSection. Empty until docs' draft lands.
import sheet from './copy/products.json'
import type { Product, ProductSheet } from './types'

export const productSheet = sheet as ProductSheet

/** A product by its id, from any family. */
export const product = (id: string): Product | undefined => productSheet.families.flatMap((family) => family.products).find((item) => item.id === id)

/** A family's line from the sheet's "Four families" list (The family), without its bold name. */
export function familyLine(family: string): string | undefined {
  const name = productSheet.families.find((item) => item.id === family)?.name
  const intro = productSheet.sections.find((section) => section.id === 'the-family')
  for (const block of intro?.blocks ?? []) {
    if (block.type !== 'ul') continue
    const item = block.items.find((entry) => name && entry.text.startsWith(`**${name}:**`))
    if (item) {
      const line = item.text.slice(`**${name}:**`.length).trim()
      return line.charAt(0).toUpperCase() + line.slice(1)
    }
  }
  return undefined
}
