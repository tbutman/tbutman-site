// The booth site (tilde-review/briefs/booth-site.md): the booth's stations as pages, each opening the
// way the booth agent at that station would, so each page is that agent's script. Both halves come in
// by npm run booth:sync, never by hand: the copy is docs' (tilde-review/site-content/*.md, as blocks
// in copy/), and the images are design's render export (images.json). pages.ts says where each of
// docs' [image: …] lines takes its renders from.
import exported from './images.json'

/** One image in the render export. `sources` is empty until its render exists (status "missing"). */
export type BoothImage = {
  id: string
  pages: string[]
  slot: string
  alt: string
  /** ok, stale (a model changed since), unrecorded, or missing. */
  status: string
  /** For icons: the value in the model's Icon list, and its name there. */
  icon?: string
  name?: string
  sources: { src: string; width: number; height: number }[]
}

export const boothImages: Record<string, BoothImage> = Object.fromEntries(
  Object.entries(exported.images as Record<string, Omit<BoothImage, 'id'>>).map(([id, image]) => [id, { id, ...image }]),
)
/** The export this build carries: its manifest's SHA-256. */
export const boothManifest = exported.manifest as string | null
/** The model's icons, in its Icon list's order: [value, the Model Maker's name]. */
export const modelIcons = ((exported as { icons?: string[][] }).icons ?? []) as [string, string][]

/** The images in one page's slot, in the export's order. */
export const slotImages = (page: string, slot: string) => Object.values(boothImages).filter((image) => image.pages.includes(page) && image.slot === slot)

/** A placeholder's shape until its render lands: a card (85.6 × 54), square, 4:3 or 16:9. */
export type Ratio = 'card' | 'square' | 'photo' | 'wide'

/** How a group of renders is laid out: one wide, a grid, small ones, front-and-back pairs, a tag beside its text, or the icons. */
export type Layout = 'wide' | 'grid' | 'small' | 'pairs' | 'tag' | 'icons'

/** Where one of docs' [image: …] lines takes its renders from: export ids, or a whole slot (the first of several names that has images). */
export type Placement = { ids?: string[]; slot?: string | string[]; layout: Layout; ratio: Ratio }

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
