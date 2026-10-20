import iconUses from '../content/booth/copy/icon-uses.json'
import { type BoothImage, boothImages, modelIcons, type Placement, type Ratio, slotImages } from '../content/booth/types'

// The booth pages' images, only ever from the render export (src/content/booth/images.json). Until a
// render exists, a placeholder of the same shape holds its place and says which render it waits
// for; it carries [TBD], so CI won't build a page that still has one (scripts/prerender.mjs). An
// image whose model changed since it was rendered (stale) or that was never recorded is marked
// data-render-status, which CI also stops on.

const sizes = {
  wide: '(max-width: 680px) calc(100vw - 32px), 1040px',
  grid: '(max-width: 680px) calc(100vw - 32px), 340px',
  small: '(max-width: 680px) 45vw, 200px',
  icons: '(max-width: 680px) 30vw, 130px',
  tag: '(max-width: 680px) 40vw, 200px',
}

type Size = keyof typeof sizes

function Pending({ what, ratio }: { what: string; ratio: Ratio }) {
  return (
    <div className={`booth-pending booth-ratio-${ratio}`}>
      <span>[TBD] render: {what}</span>
    </div>
  )
}

/** One render, or its placeholder. */
export function Render({ image, id, ratio, size, eager }: { image?: BoothImage; id: string; ratio: Ratio; size: Size; eager?: boolean }) {
  if (!image?.sources.length) return <Pending what={id} ratio={ratio} />
  const largest = image.sources[image.sources.length - 1]
  return (
    <img
      src={largest.src}
      srcSet={image.sources.map((source) => `${source.src} ${source.width}w`).join(', ')}
      sizes={sizes[size]}
      alt={image.alt}
      width={largest.width}
      height={largest.height}
      loading={eager ? undefined : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      data-render-status={image.status === 'ok' ? undefined : image.status}
    />
  )
}

// "card-usa-light-front" → "USA Light": the designs' names as docs' table writes them.
const words: Record<string, string> = { usa: 'USA' }
const themeName = (key: string) => {
  const theme = key.replace(/^card-/, '')
  if (theme === 'tap' || theme === 'tap-card') return 'The tap card'
  return theme
    .split('-')
    .map((word) => words[word] ?? word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

// A short caption for a render in a grid, where the picture alone doesn't say which one it is: the
// owner's own (site-renders.json's `caption`), or else one from its export id, lowercase like the
// site's other labels.
const fixed: Record<string, string> = {
  'fob-tag-front': 'a tag’s front: the code',
  'fob-tag-back': 'a tag’s back: the icon',
  'card-two-piece': 'two-piece, taken apart',
  'card-two-piece-back': 'two-piece, from the back',
  'card-solid-back': 'solid, from the back',
  'holder-pocket-3': '3-card pocket case',
  'holder-pocket-5': '5-card pocket case',
  'holder-cards-only-box': 'the cards-only box',
}
function captionFor(id: string): string | undefined {
  if (fixed[id]) return fixed[id]
  const front = id.match(/^card-front-(\w+)$/)
  if (front) return front[1] === 'taponly' ? 'tap only' : front[1]
  const fob = id.match(/^fob-(base|premium)-(coin|tag)-(\w+)$/)
  if (fob) return `${fob[1]} ${fob[2]} · ${fob[3]}`
  const back = id.match(/^card-back-([a-z]+)-(.+)$/)
  if (back) return `${back[1] === 'usa' ? 'USA' : back[1]} · ${back[2].replace(/-/g, ' ')}`
  return undefined
}

/** The renders one of docs' [image: …] lines stands for, laid out. */
export function Placed({ page, placement, marker }: { page: string; placement: Placement | null; marker: string }) {
  if (!placement) {
    return (
      <div className="booth-grid booth-grid-wide">
        <Pending what={marker} ratio="photo" />
      </div>
    )
  }
  const { layout, ratio } = placement
  const slotNames = placement.slot === undefined ? [] : [placement.slot].flat()

  if (layout === 'icons') {
    // Every icon in the model's own list, with its name there and docs' line for it.
    return (
      <ul className="booth-grid booth-grid-icons">
        {modelIcons.map(([value, name]) => (
          <li key={value}>
            <Render image={boothImages[`icons-${value}`]} id={`icons-${value}`} ratio="square" size="icons" />
            <b>{name}</b>
            <span>{(iconUses as Record<string, string>)[value] ?? '[TBD] no line in icon-uses.json'}</span>
          </li>
        ))}
      </ul>
    )
  }

  const images: { id: string; image?: BoothImage }[] = placement.ids
    ? placement.ids.map((id) => ({ id, image: boothImages[id] }))
    : (slotNames
        .map((slot) => slotImages(page, slot))
        .find((found) => found.length)
        ?.map((image) => ({ id: image.id, image })) ?? [])
  if (images.length === 0) images.push({ id: slotNames.length ? `${page} · ${slotNames[0]}: ${marker}` : marker })

  if (layout === 'pairs') {
    // Each design's front and back side by side, under its name.
    const pairs = new Map<string, typeof images>()
    for (const entry of images) {
      const key = entry.id.replace(/-(front|back)$/, '')
      pairs.set(key, [...(pairs.get(key) ?? []), entry])
    }
    return (
      <ul className="booth-grid booth-grid-pairs">
        {[...pairs].map(([key, sides]) => (
          <li key={key}>
            <div className="booth-pair">
              {sides.map(({ id, image }) => (
                <Render key={id} image={image} id={id} ratio={ratio} size="small" />
              ))}
            </div>
            <span>{themeName(key)}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={`booth-grid booth-grid-${layout}`}>
      {images.map(({ id, image }) => {
        const caption = layout === 'wide' || layout === 'tag' ? undefined : (image?.caption ?? captionFor(id))
        return caption ? (
          <figure key={id}>
            <Render image={image} id={id} ratio={ratio} size={layout} />
            <figcaption>{caption}</figcaption>
          </figure>
        ) : (
          <Render key={id} image={image} id={id} ratio={ratio} size={layout} />
        )
      })}
    </div>
  )
}
