// The booth site (tilde-review/briefs/booth-site.md): the booth's stations as pages, each opening the
// way the booth agent at that station would, so each page is that agent's script. The copy is docs'
// (tilde-review/site-content/), ported into the files next to this one; the images are the render
// export's only (images.json, written by scripts/booth-sync.mjs), picked by page and slot.
import exported from './images.json'

/** One web image from the render export: its widths, smallest first. */
export type BoothImage = {
  page: string | null
  slot: string | null
  alt: string
  /** For icons: the Model Maker's name. */
  name?: string
  /** For icons: the one-line example use. */
  use?: string
  caption?: string
  sources: { src: string; width: number; height: number }[]
}

export const boothImages = exported.images as Record<string, BoothImage>
/** The export this build carries: its manifest's SHA-256 (null before the first sync). */
export const boothManifest = exported.manifest as string | null

/** The images for one page's slot, in the export's order. */
export function slotImages(page: string, slot: string): (BoothImage & { id: string })[] {
  return Object.entries(boothImages)
    .filter(([, image]) => image.page === page && image.slot === slot)
    .map(([id, image]) => ({ id, ...image }))
}

/** The placeholder's shape until a render lands: a card (85.6 × 54), square, 4:3, 16:9 or 3:4. */
export type Ratio = 'card' | 'square' | 'photo' | 'wide' | 'tall'

/** Where a page shows every render the export puts in its page and slot. */
export type Gallery = {
  slot: string
  /** How wide each image is on a desktop: a few large ones, or many small ones (the icons). */
  size?: 'wide' | 'medium' | 'small'
  ratio?: Ratio
  /** What the gallery waits for, shown in its placeholder ("each theme's front and back"). */
  expects: string
}

/** A section of the lineup: what the booth can't lay out on the table. */
export type LineupSection = {
  id: string
  heading: string
  body?: string[]
  gallery?: Gallery
  /** Items with copy of their own, each with its render by id (the use cases' stacks). */
  items?: LineupItem[]
  points?: string[]
}

export type LineupItem = {
  key: string
  title: string
  body: string
  /** Rows under the body, such as "On iPhone" and "On Android". */
  facts?: { label: string; value: string }[]
  /** The export's id for this item's render. */
  image: string
  ratio?: Ratio
}

export type CrossLink = { to: string; title: string; body: string }

/** A station page's script: the opening, the concept, the lineup, how to get one, the other stations. */
export type Station = {
  path: string
  /** The page's name in the render export's manifest: card, fobs, uses or hub. */
  page: string
  /**
   * True until docs' copy (tilde-review/site-content/) is ported: the page then says it's a draft,
   * with [TBD], so CI won't build it.
   */
  draft: boolean
  /** The station's short link, printed on its lid: never changes. */
  shortLink: string
  status: string
  name: string
  headline: [string, string]
  /** What the booth agent says first: what it is and why it's useful. */
  opening: string
  /** The station's own render (the box on the table). */
  hero: { image: string; ratio: Ratio }
  /** The hero's button down to the lineup ("see every card"). */
  lineupLink: string
  conceptHeading: string
  concept: string[]
  lineup: LineupSection[]
  getHeading: string
  get: { title: string; body: string; link?: { label: string; href: string } }[]
  crossHeading: string
  cross: CrossLink[]
}
