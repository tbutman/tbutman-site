import { Link } from 'react-router'
import LangSwitch from '../components/LangSwitch'
import ProductVideo from '../components/ProductVideo'
import RichText from '../components/RichText'
import { tildeText } from '../content/tilde'
import { tildeCardText } from '../content/tildeCard'
import { type Locale, translations } from '../i18n'

// /tilde/card: the Tilde Card for makers, in the product page's style. The video, real photos and
// the MakerWorld button come later (see content/tildeCard.ts).
export default function TildeCard({ locale }: { locale: Locale }) {
  const card = tildeCardText[locale]
  const { guide, source, makerWorld } = card.links
  return (
    <article className="product">
      <LangSwitch locale={locale} paths={{ en: '/tilde/card', pt: translations['/tilde/card'] }} />
      <section className="product-hero" aria-labelledby="card-heading">
        <div className="product-hero-text">
          <p className="status">
            <span className="status-dot" aria-hidden="true" />
            {card.status}
          </p>
          <p className="product-name">
            <b>~</b> {card.name}
          </p>
          <h1 id="card-heading">
            {card.headline[0]} <span>{card.headline[1]}</span>
          </h1>
          <p className="lede">{card.lede}</p>
          <div className="button-row">
            {makerWorld && (
              <a className="button primary" href={makerWorld.href}>
                {makerWorld.label} ↗
              </a>
            )}
            <a className={makerWorld ? 'button' : 'button primary'} href={guide.href}>
              {guide.label} ↗
            </a>
            <a className="button" href={source.href}>
              {source.label} ↗
            </a>
          </div>
        </div>
        <div className="card-page-hero">
          <img src="/tilde/card.webp" alt={card.heroAlt} width={1200} height={603} />
        </div>
      </section>

      <figure className="product-video panel">
        <ProductVideo video={tildeText[locale].video} />
      </figure>

      <section className="section" aria-labelledby="need-heading">
        <div className="section-head">
          <h2 id="need-heading">{card.needHeading}</h2>
        </div>
        <ul className="privacy-list panel">
          {card.need.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="steps-heading">
        <div className="section-head">
          <h2 id="steps-heading">{card.stepsHeading}</h2>
        </div>
        <ol className="product-steps card-page-steps">
          {card.steps.map((step, index) => (
            <li key={step.title} className="panel">
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="time-heading">
        <div className="section-head">
          <h2 id="time-heading">{card.timeHeading}</h2>
        </div>
        <dl className="stats product-stats">
          {card.times.map((fact) => (
            <div key={fact.label} className="panel">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <p className="product-body">{card.timeBody}</p>
      </section>

      <section className="section" aria-labelledby="backs-heading">
        <div className="section-head">
          <h2 id="backs-heading">{card.backsHeading}</h2>
        </div>
        <p className="product-body card-page-intro">{card.backsBody}</p>
        <div className="product-backs card-page-backs">
          {card.backs.map((back) => (
            <figure key={back.src}>
              <img src={back.src} alt={back.alt} width={800} height={505} loading="lazy" decoding="async" />
              <figcaption>{back.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="sticker-heading">
        <div className="section-head">
          <h2 id="sticker-heading">{card.stickerHeading}</h2>
        </div>
        <ul className="privacy-list panel">
          {card.sticker.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="faq-heading">
        <div className="section-head">
          <h2 id="faq-heading">{card.faqHeading}</h2>
        </div>
        <div className="faq">
          {card.faq.map((item) => (
            <details key={item.q} className="panel">
              <summary>{item.q}</summary>
              <p>
                <RichText text={item.a} />
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="product-cta panel" aria-label={card.ctaText}>
        <p>
          <b>~</b> {card.ctaText}
        </p>
        <div className="button-row">
          <a className="button primary" href={guide.href}>
            {guide.label} ↗
          </a>
          <Link className="button" to={card.appLink.to}>
            {card.appLink.label} →
          </Link>
        </div>
      </section>
    </article>
  )
}
