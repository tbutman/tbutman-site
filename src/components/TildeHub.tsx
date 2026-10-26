import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import usesCopy from '../content/booth/copy/uses.json'
import { useOrder } from '../content/booth/pages'
import { productSheet } from '../content/booth/products'
import { type Block, type BoothCopy, boothImages } from '../content/booth/types'
import BoothHub from './BoothHub'
import { Render } from './BoothRender'
import NextStop from './NextStop'
import RichText from './RichText'

// /tilde, the family's hub (finish-line plan §3; Thomas, October 26): what Tilde is in one breath, the
// four families, the most common uses, how every Tilde works, and how to make your own, all in docs'
// words (the product sheet's "The family", and the Use cases page's leads). The booth's own section
// (#booth) follows, then the tour's first stop. The app's install steps and questions are on
// /tilde/app now; old links to them (#install, #faq) are passed on there.

const FAMILIES: Record<string, { path: string; image: string }> = {
  Cards: { path: '/tilde/card', image: 'card-classic-dark-front' },
  Fobs: { path: '/tilde/fobs', image: 'fob-premium-tag-tilde' },
  'Home & desk': { path: '/tilde/home', image: 'product-home' },
  'The app': { path: '/tilde/app', image: 'app-09-tap-ready' },
}

const MOVED: Record<string, string> = {
  '#install': '/tilde/app#install',
  '#faq': '/tilde/app#faq',
  '#app': '/tilde/app',
  '#card': '/tilde/card',
}

/** The three uses that lead (the plan's order), each with its bold lead from the Use cases page. */
function leadUses() {
  const blocks = (usesCopy as BoothCopy).blocks
  return useOrder.slice(0, 3).flatMap((id) => {
    const at = blocks.findIndex((block) => block.type === 'h3' && block.id === id)
    if (at < 0) return []
    const lead = blocks.slice(at + 1).find((block): block is Extract<Block, { type: 'p' }> => block.type === 'p')
    return [{ id, title: (blocks[at] as { text: string }).text, line: lead?.text.match(/^\*\*(.+?)\*\*/)?.[1] ?? lead?.text ?? '' }]
  })
}

function Text({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, index) =>
    block.type === 'p' ? (
      <p key={index} className="product-body booth-p">
        <RichText text={block.text} />
      </p>
    ) : block.type === 'ul' ? (
      <ul key={index} className="booth-list">
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
      </ul>
    ) : null,
  )
}

export default function TildeHub() {
  const { hash } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (MOVED[hash]) navigate(MOVED[hash], { replace: true })
  }, [hash, navigate])

  const intro = productSheet.sections.find((section) => section.id === 'the-family')?.blocks ?? []
  // The sheet's "The family": its opening, the four families, "Print a few", then its ### parts.
  const firstH3 = intro.findIndex((block) => block.type === 'h3')
  const top = firstH3 < 0 ? intro : intro.slice(0, firstH3)
  const opening = top.find((block): block is Extract<Block, { type: 'p' }> => block.type === 'p')
  const [headline, ...lede] = (opening?.text ?? '').split(/(?<=\*\*) /)
  const familiesAt = top.findIndex((block) => block.type === 'ul')
  const families = familiesAt < 0 ? null : (top[familiesAt] as Extract<Block, { type: 'ul' | 'ol' }>)
  const after = familiesAt < 0 ? [] : top.slice(familiesAt + 1)
  const how = (() => {
    const at = intro.findIndex((block) => block.type === 'h3' && /^how every tilde works/i.test(block.text))
    if (at < 0) return []
    const next = intro.findIndex((block, index) => index > at && block.type === 'h3')
    return intro.slice(at + 1, next < 0 ? undefined : next)
  })()

  return (
    <>
      <section className="product-hero booth-hero" aria-labelledby="tilde-heading">
        <div className="product-hero-text">
          <p className="status">
            <span className="status-dot" aria-hidden="true" />
            nfc · qr · 3d-printable · android
          </p>
          <p className="product-name">
            <b>~</b> Tilde
          </p>
          <h1 id="tilde-heading">{headline.replace(/\*\*/g, '')}</h1>
          <p className="lede">
            <RichText text={lede.join(' ')} />
          </p>
          <div className="button-row">
            <Link className="button primary" to="/tilde/card">
              start the tour →
            </Link>
            <Link className="button" to="/tilde/app">
              get the app →
            </Link>
          </div>
        </div>
        <div className="booth-hero-visual">
          <Render image={boothImages['booth-table-open']} id="booth-table-open" ratio="wide" size="wide" eager />
        </div>
      </section>

      <section id="family" className="section" aria-labelledby="family-heading">
        <div className="section-head">
          <h2 id="family-heading">the family</h2>
        </div>
        <ul className="booth-stations">
          {families?.items.map((item) => {
            const [, name, line] = item.text.match(/^\*\*([^*]+?):\*\* ?(.*)$/) ?? []
            const family = FAMILIES[name]
            if (!family) return null
            return (
              <li key={name}>
                <Link className="panel" to={family.path}>
                  <div className={family.image.startsWith('app-') ? 'booth-tile-screen' : undefined}>
                    <Render image={boothImages[family.image]} id={family.image} ratio="photo" size="grid" />
                  </div>
                  <b>{name} →</b>
                  <span>
                    <RichText text={line.charAt(0).toUpperCase() + line.slice(1)} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <Text blocks={after} />
      </section>

      <section id="uses" className="section" aria-labelledby="uses-heading">
        <div className="section-head">
          <h2 id="uses-heading">what it’s for</h2>
        </div>
        <ul className="booth-stations booth-uses">
          {leadUses().map((use) => (
            <li key={use.id}>
              <Link className="panel" to={`/tilde/uses#${use.id}`}>
                <b>{use.title} →</b>
                <span>
                  <RichText text={use.line} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="product-small">
          <Link to="/tilde/uses">every use case →</Link>
        </p>
      </section>

      <section id="how" className="section" aria-labelledby="how-heading">
        <div className="section-head">
          <h2 id="how-heading">how every tilde works</h2>
        </div>
        <Text blocks={how} />
      </section>

      <section id="make" className="section" aria-labelledby="make-heading">
        <div className="section-head">
          <h2 id="make-heading">make your own</h2>
        </div>
        <ul className="booth-make">
          <li>
            <Link to="/tilde/card#how-to-get-one">print a card →</Link>
          </li>
          <li>
            <Link to="/tilde/fobs#how-to-get-one">print a fob →</Link>
          </li>
          <li>
            <Link to="/tilde/home#products">print for home &amp; desk →</Link>
          </li>
          <li>
            <a href="https://github.com/tbutman/tilde-card">the models on github ↗</a>
          </li>
          <li>
            <Link to="/tilde/app">get the app →</Link>
          </li>
        </ul>
      </section>

      <BoothHub />
      <NextStop from="hub" />
    </>
  )
}
