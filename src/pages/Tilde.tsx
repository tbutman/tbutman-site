import { Link } from 'react-router'
import LangSwitch from '../components/LangSwitch'
import RichText from '../components/RichText'
import { tildeText } from '../content/tilde'
import { htmlLang, type Locale, translations } from '../i18n'

// The newest release, looked up when the site builds; without it the button opens the release page.
const release = __TILDE_RELEASE__

function Phone({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="phone">
      <img src={src} alt={alt} width={450} height={1000} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  )
}

export default function Tilde({ locale }: { locale: Locale }) {
  const tilde = tildeText[locale]
  const downloadHref = release?.apk ?? tilde.download.fallbackHref
  // "version 1.1.0 · 1.7 MB · android 8 or newer", with the decimal comma in Portuguese.
  const size = release && new Intl.NumberFormat(htmlLang[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(release.bytes / 1e6)
  const releaseLine = [release && `${tilde.release.version} ${release.version}`, release && `${size} MB`, tilde.release.minAndroid]
    .filter(Boolean)
    .join(' · ')
  return (
    <article className="product">
      <p className="product-strip">
        <a href={tilde.sampleStrip.href}>
          {tilde.sampleStrip.question} <b>{tilde.sampleStrip.link}</b>
          <span aria-hidden="true"> →</span>
        </a>
      </p>
      <LangSwitch locale={locale} paths={{ en: '/tilde', pt: translations['/tilde'] }} />
      <section className="product-hero" aria-labelledby="tilde-heading">
        <div className="product-hero-text">
          <p className="status">
            <span className="status-dot" aria-hidden="true" />
            {tilde.status}
          </p>
          <p className="product-name">
            <b>~</b> {tilde.name}
          </p>
          <h1 id="tilde-heading">
            {tilde.headline[0]} <span>{tilde.headline[1]}</span>
          </h1>
          <p className="lede">{tilde.lede}</p>
          <div className="button-row">
            <a className="button primary" href={downloadHref}>
              {tilde.download.label} ↓
            </a>
            <a className="button" href={tilde.printCard.href}>
              {tilde.printCard.label}
            </a>
          </div>
          <p className="product-small product-release">{releaseLine}</p>
          <p className="product-small">{tilde.requirements}</p>
        </div>
        <div className="product-hero-visual">
          <img
            className="product-card"
            src="/tilde/card.webp"
            alt={tilde.heroCardAlt}
            width={1200}
            height={601}
          />
          <Phone {...tilde.heroPhone} eager />
        </div>
      </section>

      <section id="install" className="section" aria-labelledby="install-heading">
        <div className="section-head">
          <h2 id="install-heading">{tilde.installHeading}</h2>
        </div>
        <ol className="product-steps">
          {tilde.installSteps.map((step, index) => (
            <li key={step} className="panel">
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <p>
                <RichText text={step} />
              </p>
            </li>
          ))}
        </ol>
        <p className="product-body product-install-note">
          <RichText text={tilde.installNote} />
        </p>
      </section>

      <section className="section" aria-labelledby="modes-heading">
        <div className="section-head">
          <h2 id="modes-heading">{tilde.modesHeading}</h2>
        </div>
        <div className="product-split">
          <Phone {...tilde.modesPhone} />
          <div>
            <p className="section-intro">{tilde.modesIntro}</p>
            <ul className="mode-grid">
              {tilde.modes.map((mode) => (
                <li key={mode.title} className="panel">
                  <h3>{mode.title}</h3>
                  <p>{mode.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="cards-heading">
        <div className="section-head">
          <h2 id="cards-heading">{tilde.cardsHeading}</h2>
        </div>
        <div className={tilde.cardsPhones.length > 1 ? 'product-split product-split-reverse product-split-pair' : 'product-split product-split-reverse'}>
          <div>
            {tilde.cardsBody.map((paragraph) => (
              <p key={paragraph} className="product-body product-paragraph">
                <RichText text={paragraph} />
              </p>
            ))}
          </div>
          <div className="product-phones">
            {tilde.cardsPhones.map((phone) => (
              <Phone key={phone.src} {...phone} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="steps-heading">
        <div className="section-head">
          <h2 id="steps-heading">{tilde.stepsHeading}</h2>
        </div>
        <ol className="product-steps">
          {tilde.steps.map((step, index) => (
            <li key={step.title} className="panel">
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="free-heading">
        <div className="section-head">
          <h2 id="free-heading">{tilde.freeHeading}</h2>
        </div>
        <div className="product-split product-split-reverse">
          <div>
            <dl className="stats product-stats">
              {tilde.freeFacts.map((fact) => (
                <div key={fact.label} className="panel">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className="product-body">
              <RichText text={tilde.freeBody} />
            </p>
            <p className="product-small">
              <Link to={tilde.privacyLink.to}>{tilde.privacyLink.label} →</Link>
            </p>
          </div>
          <Phone {...tilde.metPhone} />
        </div>
      </section>

      <section id="card" className="section" aria-labelledby="card-heading">
        <div className="section-head">
          <h2 id="card-heading">{tilde.cardHeading}</h2>
        </div>
        <div className="product-card-section">
          <div className="product-card-images">
            <img src="/tilde/card.webp" alt={tilde.cardFrontAlt} width={1200} height={601} loading="lazy" decoding="async" />
            <div className="product-backs">
              {tilde.backs.map((back) => (
                <figure key={back.src}>
                  <img src={back.src} alt={back.alt} width={800} height={505} loading="lazy" decoding="async" />
                  <figcaption>{back.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div>
            {tilde.cardBody.map((paragraph) => (
              <p key={paragraph} className="product-body">
                {paragraph}
              </p>
            ))}
            <div className="button-row">
              {tilde.cardLinks.map((link) => (
                <a key={link.href} className="button" href={link.href}>
                  {link.label} ↗
                </a>
              ))}
            </div>
            <p className="product-small">{tilde.cardNote}</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-heading">
        <div className="section-head">
          <h2 id="faq-heading">{tilde.faqHeading}</h2>
        </div>
        <div className="faq">
          {tilde.faq.map((item) => (
            <details key={item.q} className="panel">
              <summary>{item.q}</summary>
              <p>
                <RichText text={item.a} />
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="product-cta panel" aria-label={tilde.ctaText}>
        <p>
          <b>~</b> {tilde.ctaText}
        </p>
        <div className="button-row">
          <a className="button primary" href={downloadHref}>
            {tilde.download.label} ↓
          </a>
          <a className="button" href={tilde.sourceLink.href}>
            {tilde.sourceLink.label} ↗
          </a>
          <Link className="button" to={tilde.caseStudyLink.to}>
            {tilde.caseStudyLink.label} →
          </Link>
        </div>
      </section>
    </article>
  )
}
