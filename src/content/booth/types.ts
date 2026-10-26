// The booth site (tilde-review/briefs/booth-site.md): the booth's stations as pages, each opening the
// way the booth agent at that station would, so each page is that agent's script. Both halves come in
// by npm run booth:sync, never by hand: the copy is docs' (tilde-review/site-content/*.md, as blocks
// in copy/), and the images are design's render export (images.json) and, on the App page, the app
// agent's screenshots (screens.json). pages.ts says where each of docs' [image: …] lines takes its
// renders from.
import exported from './images.json'
import screens from './screens.json'

/** One image in the render export. `sources` is empty until its render exists (status "missing"). */
export type BoothImage = {
  id: string
  pages: string[]
  slot: string
  alt: string
  /** ok, stale (a model changed since), unrecorded, or missing. */
  status: string
  /** The owner's short caption for a grid, from site-renders.json, if it gives one. */
  caption?: string
  /** For icons: the value in the model's Icon list, and its name there. */
  icon?: string
  name?: string
  sources: { src: string; width: number; height: number }[]
}

export const boothImages: Record<string, BoothImage> = Object.fromEntries(
  Object.entries({ ...exported.images, ...screens.images } as Record<string, Omit<BoothImage, 'id'>>).map(([id, image]) => [id, { id, ...image }]),
)
/** The export this build carries: its manifest's SHA-256. */
export const boothManifest = exported.manifest as string | null
/** The model's icons, in its Icon list's order: [value, the Model Maker's name]. */
export const modelIcons = ((exported as { icons?: string[][] }).icons ?? []) as [string, string][]

/** The images in one page's slot, in the export's order. */
export const slotImages = (page: string, slot: string) => Object.values(boothImages).filter((image) => image.pages.includes(page) && image.slot === slot)

/** A placeholder's shape until its render lands: a card (85.6 × 54), square, 4:3, 16:9 or a phone's screen (9:20). */
export type Ratio = 'card' | 'square' | 'photo' | 'wide' | 'phone'

/**
 * How a group of renders is laid out: one wide, a grid, small ones, one row per design (front, back,
 * then its alternate backs), a tag beside its text, the icons, a row of app screenshots, or not at all.
 */
export type Layout = 'wide' | 'grid' | 'small' | 'sets' | 'tag' | 'icons' | 'screens' | 'omit'

/** Where one of docs' [image: …] lines takes its renders from: export ids, or a whole slot (the first of several names that has images). */
export type Placement = {
  ids?: string[]
  slot?: string | string[]
  layout: Layout
  ratio: Ratio
  /** For `sets`: another slot's renders, each added to the rows of the designs its id prefix names. */
  alternates?: { slot: string; designs: Record<string, string[]> }
}

/** One block of docs' copy (scripts/booth-copy.mjs). */
export type Block =
  | { type: 'h2' | 'h3'; text: string; id: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: { text: string; sub: string[] }[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'image' | 'generated'; text: string }

export type BoothCopy = { source: string; blocks: Block[] }

export type Section = { heading: { text: string; id: string }; blocks: Block[] }

/** The copy's blocks as sections, one per ## heading. */
export function sections(blocks: Block[]): Section[] {
  const out: Section[] = []
  for (const block of blocks) {
    if (block.type === 'h2') out.push({ heading: block, blocks: [] })
    else if (out.length) out[out.length - 1].blocks.push(block)
  }
  return out
}

/** One field of a product in docs' product sheet (scripts/booth-products.mjs): its text and/or a list. */
export type ProductField = { text: string; items: string[] }
export type ProductFieldKey = 'name' | 'oneLiner' | 'problem' | 'howItWorks' | 'uses' | 'options' | 'sizes' | 'pairsWith' | 'makeYourOwn' | 'status' | 'sources'
export type Product = { name: string; id: string; fields: Partial<Record<ProductFieldKey, ProductField>> }
export type ProductFamily = { name: string; id: string; products: Product[] }
/** site-content/products.md as synced: the families and their products, plus the intro and glossary. */
export type ProductSheet = { source: string; families: ProductFamily[]; sections: { title: string; id: string; text: string }[] }
