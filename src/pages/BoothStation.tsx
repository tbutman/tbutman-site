import { Link } from 'react-router'
import { BoothGallery, BoothRender } from '../components/BoothRender'
import RichText from '../components/RichText'
import type { Station } from '../content/booth/types'

// A booth station as a page (tilde-review/briefs/booth-site.md): the opening a booth agent would say,
// the concept in plain words, the lineup from renders, how to get one, and the other stations. The
// parts are separate so /tilde/card can put its print guide between the lineup and the way out.

export function StationHero({ station }: { station: Station }) {
  const headingId = `${station.page}-heading`
  return (
    <section className="product-hero booth-hero" aria-labelledby={headingId}>
      <div className="product-hero-text">
        {station.draft && <p className="booth-draft">[TBD] Draft copy: docs’ text for this page isn’t in yet.</p>}
        <p className="status">
          <span className="status-dot" aria-hidden="true" />
          {station.status}
        </p>
        <p className="product-name">
          <b>~</b> {station.name}
        </p>
        <h1 id={headingId}>
          {station.headline[0]} <span>{station.headline[1]}</span>
        </h1>
        <p className="lede">
          <RichText text={station.opening} />
        </p>
        <div className="button-row">
          <a className="button primary" href="#lineup">
            {station.lineupLink} ↓
          </a>
          <a className="button" href="#get">
            {station.getHeading} ↓
          </a>
        </div>
      </div>
      <div className="booth-hero-visual">
        <BoothRender id={station.hero.image} ratio={station.hero.ratio} eager />
      </div>
    </section>
  )
}

export function StationConcept({ station }: { station: Station }) {
  const id = `${station.page}-concept`
  return (
    <section className="section" aria-labelledby={id}>
      <div className="section-head">
        <h2 id={id}>{station.conceptHeading}</h2>
      </div>
      <ul className="privacy-list panel">
        {station.concept.map((point) => (
          <li key={point}>
            <RichText text={point} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function StationLineup({ station }: { station: Station }) {
  return (
    <div id="lineup" className="booth-lineup">
      {station.lineup.map((section) => (
        <section key={section.id} id={section.id} className="section booth-section" aria-labelledby={`${section.id}-heading`}>
          <div className="section-head">
            <h2 id={`${section.id}-heading`}>{section.heading}</h2>
          </div>
          {section.body?.map((paragraph) => (
            <p key={paragraph} className="product-body booth-intro">
              <RichText text={paragraph} />
            </p>
          ))}
          {section.gallery && <BoothGallery page={station.page} gallery={section.gallery} />}
          {section.items && (
            <ul className="booth-items">
              {section.items.map((item) => (
                <li key={item.key} id={`${section.id}-${item.key}`} className="panel booth-item">
                  <BoothRender id={item.image} ratio={item.ratio ?? 'square'} size="medium" />
                  <div className="booth-item-text">
                    <h3>{item.title}</h3>
                    <p>
                      <RichText text={item.body} />
                    </p>
                    {item.facts && (
                      <dl className="booth-facts">
                        {item.facts.map((fact) => (
                          <div key={fact.label}>
                            <dt>{fact.label}</dt>
                            <dd>
                              <RichText text={fact.value} />
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {section.points && (
            <ul className="privacy-list panel">
              {section.points.map((point) => (
                <li key={point}>
                  <RichText text={point} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

export function StationGet({ station }: { station: Station }) {
  return (
    <section id="get" className="section" aria-labelledby="get-heading">
      <div className="section-head">
        <h2 id="get-heading">{station.getHeading}</h2>
      </div>
      <ol className="product-steps booth-get">
        {station.get.map((way, index) => (
          <li key={way.title} className="panel">
            <span className="num">{String(index + 1).padStart(2, '0')}</span>
            <h3>{way.title}</h3>
            <p>
              <RichText text={way.body} />
            </p>
            {way.link && (
              <a className="booth-more" href={way.link.href}>
                {way.link.label} {/^[/#]/.test(way.link.href) ? '→' : '↗'}
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export function StationCross({ station }: { station: Station }) {
  return (
    <section className="section" aria-labelledby="cross-heading">
      <div className="section-head">
        <h2 id="cross-heading">{station.crossHeading}</h2>
      </div>
      <ul className="booth-cross">
        {station.cross.map((link) => (
          <li key={link.to}>
            <Link className="panel" to={link.to}>
              <b>{link.title} →</b>
              <span>{link.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** A whole station page: Fobs and Use cases. */
export default function BoothStation({ station }: { station: Station }) {
  return (
    <article className="product booth">
      <StationHero station={station} />
      <StationConcept station={station} />
      <StationLineup station={station} />
      <StationGet station={station} />
      <StationCross station={station} />
    </article>
  )
}
