import { Link } from 'react-router'
import { hubSection } from '../content/booth/pages'
import { boothImages, type Block, sections } from '../content/booth/types'
import { Render } from './BoothRender'
import RichText from './RichText'

// /tilde's booth section (#booth): where and when the booth is, the whole booth table, docs' "See
// everything" line, and a link to each station from docs' table. English only. The hub above it
// already says what Tilde is and shows the families (visitor round 1, item 12).

export default function BoothHub() {
  const all = sections(hubSection.copy.blocks)
  const see = all.find((section) => section.heading.id === 'see-everything')
  const table = see?.blocks.find((block): block is Extract<Block, { type: 'table' }> => block.type === 'table')
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
        <h2 id="booth-heading">at our booth</h2>
      </div>
      {/* The booth line (visitor round 1, item 11). Docs' opening and concept say what Tilde is, which
          the hub's hero already does (item 12), so the hub shows only the booth itself. */}
      <p className="product-body booth-p">
        <b>Web Summit, Lisbon, November 9–12.</b>
      </p>
      <div className="booth-grid booth-grid-wide">
        <Render image={boothImages[hubSection.table]} id={hubSection.table} ratio="wide" size="wide" />
      </div>
      {text(see?.blocks.filter((block) => block.type !== 'table') ?? [])}
      {table && (
        <ul className="booth-make">
          {table.rows[0].map((cell) => {
            const link = cell.match(/\[([^\]]+)\]\((\/[^)]+)\)/)
            return link ? (
              <li key={link[2]}>
                <Link to={link[2]}>{link[1].toLowerCase()} →</Link>
              </li>
            ) : null
          })}
        </ul>
      )}
    </section>
  )
}
