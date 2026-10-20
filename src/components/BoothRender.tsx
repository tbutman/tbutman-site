import { type BoothImage, boothImages, type Gallery, type Ratio, slotImages } from '../content/booth/types'

// The booth pages' images, only ever from the render export (src/content/booth/images.json). Until a
// render lands, a placeholder of the same shape holds its place and says what it waits for; it
// carries [TBD], so CI won't build a page that still has one (scripts/prerender.mjs).

const sizes = {
  wide: '(max-width: 680px) calc(100vw - 32px), 760px',
  medium: '(max-width: 680px) calc(100vw - 32px), 360px',
  small: '(max-width: 680px) 30vw, 150px',
}

function Picture({ image, size, eager }: { image: BoothImage; size: keyof typeof sizes; eager?: boolean }) {
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
    />
  )
}

function Pending({ what, ratio }: { what: string; ratio: Ratio }) {
  return (
    <div className={`booth-pending booth-ratio-${ratio}`}>
      <span>[TBD] render: {what}</span>
    </div>
  )
}

/** One render by its export id. */
export function BoothRender({
  id,
  ratio = 'photo',
  size = 'wide',
  eager,
  caption,
}: {
  id: string
  ratio?: Ratio
  size?: keyof typeof sizes
  eager?: boolean
  caption?: string
}) {
  const image = boothImages[id]
  return (
    <figure className="booth-figure">
      {image ? <Picture image={image} size={size} eager={eager} /> : <Pending what={id} ratio={ratio} />}
      {(caption ?? image?.caption) && <figcaption>{caption ?? image?.caption}</figcaption>}
    </figure>
  )
}

/** Every render the export puts in a page's slot, in its order. */
export function BoothGallery({ page, gallery }: { page: string; gallery: Gallery }) {
  const size = gallery.size ?? 'medium'
  const images = slotImages(page, gallery.slot)
  return (
    <div className={`booth-gallery booth-gallery-${size}`}>
      {images.length === 0 ? (
        <figure className="booth-figure">
          <Pending what={`${page} · ${gallery.slot}: ${gallery.expects}`} ratio={gallery.ratio ?? 'photo'} />
        </figure>
      ) : (
        images.map((image) => (
          <figure key={image.id} className="booth-figure">
            <Picture image={image} size={size} />
            {image.name ? (
              <figcaption>
                <b>{image.name}</b>
                {image.use && <span>{image.use}</span>}
              </figcaption>
            ) : (
              image.caption && <figcaption>{image.caption}</figcaption>
            )}
          </figure>
        ))
      )}
    </div>
  )
}
