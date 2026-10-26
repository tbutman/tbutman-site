import { Fragment, type ReactNode } from 'react'
import { Link } from '../components/SiteLink'
import { Placed, Render } from '../components/BoothRender'
import FamilyProducts from '../components/FamilyProducts'
import IPhoneNote from '../components/IPhoneNote'
import NotOnIPhone from '../components/NotOnIPhone'
import NextStop from '../components/NextStop'
import RichText from '../components/RichText'
import { familyPaths, type BoothPage as Page, placementFor, tour, useOrder, useProducts } from '../content/booth/pages'
import { productSheet } from '../content/booth/products'
import { tildeText } from '../content/tilde'
import { type Block, boothImages, type Section, sections } from '../content/booth/types'

// A booth station as a page (tilde-review/briefs/booth-site.md), from docs' copy as written: its
// opening is the hero, beside the closed box the visitor just tapped; every other ## is a section,
// with the renders docs' [image: …] lines ask for. Headings are lowercased, as the site writes them.

// Docs' note where a page's own sections follow ("(The page's current print sections follow here…)").
const isNote = (block: Block) => block.type === 'p' && /^\(The page’?'?s /.test(block.text)

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

// The newest app release, looked up when the site builds (the App page's download, as /tilde's).
const release = __TILDE_RELEASE__
/** "version 1.2.0 · 2.0 MB · October 7, 2026 · android 8 or newer" under the download (visitor round 1, item 9). */
function releaseLine(found: NonNullable<typeof release>): string {
  const size = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(found.bytes / 1e6)
  const date = found.date && new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${found.date}T00:00:00Z`))
  return [`${tildeText.en.release.version} ${found.version}`, `${size} MB`, date, tildeText.en.release.minAndroid].filter(Boolean).join(' · ')
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
          {page.download && (
            <NotOnIPhone>
              <a className="button primary" href={release?.apk ?? tildeText.en.download.fallbackHref}>
                {tildeText.en.download.label} ↓
              </a>
            </NotOnIPhone>
          )}
          {lineup && (
            <a className={page.download ? 'button' : 'button primary'} href={`#${lineup.heading.id}`}>
              {lineup.heading.text.toLowerCase()} ↓
            </a>
          )}
          {get && (
            <a className="button" href={`#${get.heading.id}`}>
              {get.heading.text.toLowerCase()} ↓
            </a>
          )}
        </div>
        {page.download && release && <p className="product-small product-release">{releaseLine(release)}</p>}
        {/* What installing takes, beside the button (visitor round 2, item 18). Not on an iPhone. */}
        {page.download && (
          <NotOnIPhone>
            <p className="product-small">
              3 steps to install. Android’s Play Protect may warn: choose <b>Install anyway</b>. <a href="#install">The steps ↓</a>
            </p>
          </NotOnIPhone>
        )}
      </div>
      <div className={`booth-hero-visual${page.heroRatio === 'phone' ? ' booth-hero-phone' : ''}`}>
        <Render image={boothImages[page.hero]} id={page.hero} ratio={page.heroRatio ?? 'photo'} size={page.heroRatio === 'phone' ? 'screen' : 'wide'} eager />
      </div>
    </section>
  )
}

/**
 * The booth's stations in walk order, this one marked: a way from any station to the others, the App
 * page included, whatever each page's own "See more" lists.
 */
export function Stations({ current }: { current: string }) {
  return (
    <nav className="booth-nav" aria-label="Tilde’s pages">
      <Link to="/tilde">tilde</Link>
      <ul>
        {tour.slice(1).map((stop) => (
          <li key={stop.key}>
            {stop.key === current ? (
              <span aria-current="page">{stop.label.toLowerCase()}</span>
            ) : (
              <Link to={stop.path}>{stop.label.toLowerCase()}</Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Use cases (finish-line plan §3): the uses in the plan's lead order, each followed by the products
 * that do it, from their uses in docs' product sheet (pages.ts, useOrder and useProducts).
 */
function withProducts(blocks: Block[]): Block[] {
  const head: Block[] = []
  const groups: Block[][] = []
  for (const block of blocks) {
    if (block.type === 'h3') groups.push([block])
    else if (groups.length) groups[groups.length - 1].push(block)
    else head.push(block)
  }
  const rank = (group: Block[]) => {
    const at = useOrder.indexOf((group[0] as { id: string }).id)
    return at < 0 ? useOrder.length : at
  }
  const sorted = groups.map((group, index) => ({ group, index })).sort((a, b) => rank(a.group) - rank(b.group) || a.index - b.index)
  return [
    ...head,
    ...sorted.flatMap(({ group }) => {
      const pattern = useProducts[(group[0] as { id: string }).id]
      const on = pattern
        ? productSheet.families.flatMap((family) =>
            family.products
              .filter((product) => product.fields.uses?.items.some((item) => pattern.test(item.replace(/^\*\*/, ''))))
              .map((product) => `[${product.name.replace(/`?\[[^\]]*\]`?/g, '').trim()}](${familyPaths[family.id]}#${product.id})`),
          )
        : []
      return on.length ? [...group, { type: 'p', text: `**Lives on:** ${on.join(' · ')}` } as Block] : group
    }),
  ]
}

/**
 * The whole page from docs' copy. `insert` goes where docs' note says the page's own sections follow
 * (on /tilde/card, the print guide); `end` closes the page.
 */
/** Docs' blocks without the ## sections and ### parts the page leaves out (pages.ts, omit). */
function without(blocks: Block[], omit: string[] = []): Block[] {
  const out: Block[] = []
  let skip: 'h2' | 'h3' | null = null
  for (const block of blocks) {
    if (block.type === 'h2' || block.type === 'h3') {
      if (skip && (block.type === 'h2' || skip === 'h3')) skip = null
      if (omit.includes(block.id)) {
        skip = block.type
        continue
      }
    }
    if (!skip) out.push(block)
  }
  return out
}

export function BoothBody({ page, insert, insertBefore, end }: { page: Page; insert?: ReactNode; insertBefore?: string; end?: ReactNode }) {
  const all = sections(without(page.copy.blocks, page.omit))
  const opening = all.find((section) => section.heading.id === 'the-opening')
  const rest = all.filter((section) => section !== opening)
  // Docs' order: the opening, how it works, then the lineup.
  const get = rest.find((section) => /^how to get/i.test(section.heading.text))
  return (
    <>
      <Hero page={page} opening={opening} lineup={rest.find((section) => section.heading.id === page.lineup) ?? rest[1]} get={get} />
      {page.iphoneNote && <IPhoneNote />}
      {page.family && <FamilyProducts family={page.family} />}
      {rest.map((section) => {
        const note = section.blocks.some(isNote)
        const blocks = page.page === 'uses' && section.heading.id === 'in-the-boxes' ? withProducts(section.blocks) : section.blocks
        return (
          <Fragment key={section.heading.id}>
            {insertBefore === section.heading.id && insert}
            <section
              id={section.heading.id}
              className={`section booth-section${section.heading.id === 'see-more' ? ' booth-see-more' : ''}`}
              aria-labelledby={`${section.heading.id}-heading`}
            >
              <div className="section-head">
                <h2 id={`${section.heading.id}-heading`}>{section.heading.text.toLowerCase()}</h2>
              </div>
              <Blocks page={page} blocks={blocks.filter((block) => !isNote(block))} />
            </section>
            {note && !insertBefore && insert}
          </Fragment>
        )
      })}
      <NextStop from={page.page} />
      <Stations current={page.page} />
      {end}
    </>
  )
}

/** /tilde/fobs, /tilde/uses and /tilde/app: a whole station page. */
export default function BoothPage({ page, insert, insertBefore }: { page: Page; insert?: ReactNode; insertBefore?: string }) {
  return (
    <article className="product booth">
      <BoothBody page={page} insert={insert} insertBefore={insertBefore} />
    </article>
  )
}
