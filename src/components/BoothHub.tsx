import { Link } from 'react-router'
import { hubSection } from '../content/booth/pages'
import { boothImages, type Block, sections } from '../content/booth/types'
import { Render } from './BoothRender'
import RichText from './RichText'

// /tilde's booth section (#booth), from docs' hub copy: for anyone who reached taptilde.com without
// tapping a lid. Its opening and concept, the whole booth table, a way into each station (docs' "See
// everything" table: a picture and a link above, a line below), and how to get it. English only.
// A station the table doesn't link yet (the App page, until docs adds its column) still gets a tile,
// whose line is a [TBD] that CI won't build.

export default function BoothHub() {
  const all = sections(hubSection.copy.blocks)
  const find = (id: string) => all.find((section) => section.heading.id === id)?.blocks ?? []
  const see = all.find((section) => section.heading.id === 'see-everything')
  const table = see?.blocks.find((block): block is Extract<Block, { type: 'table' }> => block.type === 'table')
  const get = all.find((section) => /^how to get/i.test(section.heading.text))
  const text = (blocks: Block[]) =>
    blocks.map((block, index) =>
      block.type === 'p' ? (
        <p key={index} className="product-body booth-p">
          <RichText text={block.text} />
        </p>
      ) : block.type === 'ul' ? (
        <ul key={index} className="booth-list">
          {block.items.map((item) => (
            <li key={item.text}>
              <RichText text={item.text} />
            </li>
          ))}
        </ul>
      ) : null,
    )
  return (
    <section id="booth" className="section booth-hub" aria-labelledby="booth-heading">
      <div className="section-head">
        <h2 id="booth-heading">{(see?.heading.text ?? 'See everything').toLowerCase()}</h2>
      </div>
      {text(find('the-opening'))}
      <div className="booth-grid booth-grid-wide">
        <Render image={boothImages[hubSection.table]} id={hubSection.table} ratio="wide" size="wide" />
      </div>
      {text(find('the-concept'))}
      {text(see?.blocks.filter((block) => block.type !== 'table') ?? [])}
      {table && (
        <ul className="booth-stations">
          {[
            ...table.rows[0].map((cell, index) => [cell, table.rows[1]?.[index] ?? ''] as const),
            ...hubSection.stations
              .filter((page) => !table.rows[0].some((cell) => cell.includes(`](${page.path})`)))
              .map((page) => [`**[${page.label}](${page.path})**`, `[TBD] docs’ line for the ${page.label} tile (hub.md)`] as const),
          ].map(([cell, line]) => {
            const marker = cell.match(/^\[image: ([^\]]+)\]\s*/)
            const link = cell.match(/\[([^\]]+)\]\((\/[^)]+)\)/)
            const station = hubSection.stations.find((page) => page.path === link?.[2])
            const id = hubSection.images.find(([start]) => marker?.[1].startsWith(start))?.[1] ?? station?.hero ?? ''
            return (
              <li key={cell}>
                <Link className="panel" to={link?.[2] ?? '/tilde'}>
                  {/* A screenshot shows its top, at the tiles' 4:3. */}
                  <div className={boothImages[id]?.slot === 'screens' || id.startsWith('app-') ? 'booth-tile-screen' : undefined}>
                    <Render image={boothImages[id]} id={id || (marker?.[1] ?? cell)} ratio="photo" size="grid" />
                  </div>
                  <b>{link?.[1]} →</b>
                  <span>
                    <RichText text={line} />
                  </span>
                  {station && <small>{station.shortLink}</small>}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {get && (
        <>
          <h3 className="booth-h3">{get.heading.text}</h3>
          {text(get.blocks)}
        </>
      )}
    </section>
  )
}
