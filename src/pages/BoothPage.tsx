import { Fragment, type ReactNode } from 'react'
import { Placed, Render } from '../components/BoothRender'
import RichText from '../components/RichText'
import { type BoothPage as Page, placementFor } from '../content/booth/pages'
import { type Block, boothImages, type Section, sections } from '../content/booth/types'

// A booth station as a page (tilde-review/briefs/booth-site.md), from docs' copy as written: its
// opening is the hero, beside the closed box the visitor just tapped; every other ## is a section,
// with the renders docs' [image: …] lines ask for. Headings are lowercased, as the site writes them.

// Docs' note where a page's own sections follow ("(The page's current print sections follow here…)").
const isNote = (block: Block) => block.type === 'p' && /^\(The page’?'?s /.test(block.text)

/** The blocks without docs' notes to us (pages.ts): a note, and the list after a note that ends in ":". */
function visible(page: Page, blocks: Block[]): Block[] {
  const out: Block[] = []
  let skipList = false
  for (const block of blocks) {
    if (block.type === 'p' && page.notes?.some((start) => block.text.startsWith(start))) {
      skipList = block.text.endsWith(':')
      continue
    }
    if (skipList && (block.type === 'ul' || block.type === 'ol')) {
      skipList = false
      continue
    }
    skipList = false
    out.push(block)
  }
  return out
}

function List({ block }: { block: Extract<Block, { type: 'ul' | 'ol' }> }) {
  const Tag = block.type
  return (
    <Tag className={`booth-list${Tag === 'ol' ? ' booth-list-numbered' : ''}`}>
      {block.items.map((item) => (
        <li key={item.text}>
          <RichText text={item.text} />
          {item.sub.length > 0 && (
            <ul>
              {item.sub.map((sub) => (
                <li key={sub}>
                  <RichText text={sub} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </Tag>
  )
}

/** A table; on a phone each row stacks, each cell under its column's name. */
function Table({ block }: { block: Extract<Block, { type: 'table' }> }) {
  const label = (index: number) => block.head[index].replace(/\*\*/g, '')
  return (
    <div className="booth-table panel">
      <table>
        {block.head.some(Boolean) && (
          <thead>
            <tr>
              {block.head.map((cell, index) => (
                <th key={index} scope="col">
                  <RichText text={cell} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row">
                    <RichText text={cell} />
                  </th>
                ) : (
                  <td key={index} data-label={label(index)}>
                    <RichText text={cell} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Blocks({ page, blocks }: { page: Page; blocks: Block[] }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case 'h3':
        return (
          <h3 key={index} id={block.id} className="booth-h3">
            <RichText text={block.text} />
          </h3>
        )
      case 'p':
        return (
          <p key={index} className="product-body booth-p">
            <RichText text={block.text} />
          </p>
        )
      case 'ul':
      case 'ol':
        return <List key={index} block={block} />
      case 'table':
        return <Table key={index} block={block} />
      case 'image':
      case 'generated':
        return <Placed key={index} page={page.page} placement={placementFor(page, block.text)} marker={block.text} />
      default:
        return null
    }
  })
}

/** The opening beside the closed box, with a way down to the lineup and to how to get one. */
function Hero({ page, opening, lineup, get }: { page: Page; opening?: Section; lineup?: Section; get?: Section }) {
  return (
    <section className="product-hero booth-hero" aria-labelledby={`${page.page}-heading`}>
      <div className="product-hero-text">
        <p className="status">
          <span className="status-dot" aria-hidden="true" />
          {page.status}
        </p>
        <p className="product-name">
          <b>~</b> {page.name}
        </p>
        <h1 id={`${page.page}-heading`}>
          {page.headline[0]} <span>{page.headline[1]}</span>
        </h1>
        {opening?.blocks.map((block, index) =>
          block.type === 'p' ? (
            <p key={index} className="lede">
              <RichText text={block.text} />
            </p>
          ) : null,
        )}
        <div className="button-row">
          {lineup && (
            <a className="button primary" href={`#${lineup.heading.id}`}>
              {lineup.heading.text.toLowerCase()} ↓
            </a>
          )}
          {get && (
            <a className="button" href={`#${get.heading.id}`}>
              {get.heading.text.toLowerCase()} ↓
            </a>
          )}
        </div>
      </div>
      <div className="booth-hero-visual">
        <Render image={boothImages[page.hero]} id={page.hero} ratio="photo" size="wide" eager />
      </div>
    </section>
  )
}

/**
 * The whole page from docs' copy. `insert` goes where docs' note says the page's own sections follow
 * (on /tilde/card, the print guide); `end` closes the page.
 */
export function BoothBody({ page, insert, end }: { page: Page; insert?: ReactNode; end?: ReactNode }) {
  const all = sections(page.copy.blocks)
  const opening = all.find((section) => section.heading.id === 'the-opening')
  const rest = all.filter((section) => section !== opening)
  // Docs' order: the opening, how it works, then the lineup.
  const get = rest.find((section) => /^how to get/i.test(section.heading.text))
  return (
    <>
      <Hero page={page} opening={opening} lineup={rest[1]} get={get} />
      {rest.map((section) => {
        const note = section.blocks.some(isNote)
        return (
          <Fragment key={section.heading.id}>
            <section
              id={section.heading.id}
              className={`section booth-section${section.heading.id === 'see-more' ? ' booth-see-more' : ''}`}
              aria-labelledby={`${section.heading.id}-heading`}
            >
              <div className="section-head">
                <h2 id={`${section.heading.id}-heading`}>{section.heading.text.toLowerCase()}</h2>
              </div>
              <Blocks page={page} blocks={visible(page, section.blocks).filter((block) => !isNote(block))} />
            </section>
            {note && insert}
          </Fragment>
        )
      })}
      {end}
    </>
  )
}

/** /tilde/fobs and /tilde/uses: a whole station page. */
export default function BoothPage({ page }: { page: Page }) {
  return (
    <article className="product booth">
      <BoothBody page={page} />
    </article>
  )
}
