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
  set: '(max-width: 680px) 56vw, 230px',
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
  if (layout === 'omit') return null
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

  if (layout === 'sets') {
    // One row per design (Thomas's review note): its front, its default back, then its alternate
    // backs, each under the owner's caption without the design's name, which heads the row. On a
    // phone the row scrolls sideways inside itself; on a desktop it wraps.
    const rows = new Map<string, typeof images>()
    for (const entry of images) {
      const key = entry.id.replace(/-(front|back)$/, '')
      rows.set(key, [...(rows.get(key) ?? []), entry])
    }
    if (placement.alternates) {
      const { slot, designs } = placement.alternates
      for (const image of slotImages(page, slot)) {
        const prefix = Object.keys(designs).find((start) => image.id.startsWith(start))
        const owners = prefix ? designs[prefix].filter((design) => rows.has(design)) : []
        if (!owners.length) throw new Error(`booth: the back ${image.id} belongs to no design (alternateBacks in pages.ts)`)
        for (const design of owners) rows.get(design)?.push({ id: image.id, image })
      }
    }
    return (
      <ul className="booth-sets">
        {[...rows].map(([key, items]) => {
          const name = items[0].image?.caption?.replace(/ · front$/, '') ?? themeName(key)
          return (
            <li key={key}>
              <b className="booth-set-name">{name}</b>
              <ul className="booth-set-row" tabIndex={0} aria-label={`${name}: its front, its back and its other backs`}>
                {items.map(({ id, image }) => (
                  <li key={id}>
                    <Render image={image} id={id} ratio={ratio} size="set" />
                    <span>{image?.caption?.split(' · ').slice(1).join(' · ') || image?.caption}</span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className={`booth-grid booth-grid-${layout}`}>
      {images.map(({ id, image }) => {
        // The owner's caption from site-renders.json; a wide image or a use's tag has its heading instead.
        const caption = layout === 'wide' || layout === 'tag' ? undefined : image?.caption
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
