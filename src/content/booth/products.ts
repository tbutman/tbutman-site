// Docs' product sheet (tilde-review/site-content/products.md), as npm run booth:sync writes it: one
// source of facts for every core product, drawn by ProductSection. Empty until docs' draft lands.
import sheet from './copy/products.json'
import type { Product, ProductSheet } from './types'

export const productSheet = sheet as ProductSheet

/** A product by its id, from any family. */
export const product = (id: string): Product | undefined => productSheet.families.flatMap((family) => family.products).find((item) => item.id === id)
