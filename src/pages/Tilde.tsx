import { Link } from 'react-router'
import { tilde } from '../content/tilde'

function Phone({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="phone">
      <img src={src} alt={alt} width={450} height={1000} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  )
}

export default function Tilde() {
  return (
    <article className="product">
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
            <a className="button primary" href={tilde.download.href}>
              {tilde.download.label} ↓
            </a>
            <a className="button" href={tilde.printCard.href}>
              {tilde.printCard.label}
            </a>
          </div>
          <p className="product-small">{tilde.requirements}</p>
        </div>
        <div className="product-hero-visual">
          <img
            className="product-card"
            src="/tilde/card.webp"
            alt="A 3D-printed black business card for Jane Doe, with a QR code and an NFC tap marker"
            width={1200}
            height={601}
          />
          <Phone src="/tilde/app-share.webp" alt="Tilde's Share screen: Jane Doe's card and a QR code" eager />
        </div>
      </section>

      <section className="section" aria-labelledby="modes-heading">
        <div className="section-head">
          <h2 id="modes-heading">{tilde.modesHeading}</h2>
        </div>
        <div className="product-split">
          <Phone src="/tilde/app-picker.webp" alt="Choosing what a tap shares: website, contact card, WhatsApp, LinkedIn, GitHub, a link or guest Wi-Fi" />
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
            <p className="product-body">{tilde.freeBody}</p>
          </div>
          <Phone src="/tilde/app-met.webp" alt="Tilde's Met list: people shared with, with notes and events" />
        </div>
      </section>

      <section id="card" className="section" aria-labelledby="card-heading">
        <div className="section-head">
          <h2 id="card-heading">{tilde.cardHeading}</h2>
          <span>optional</span>
        </div>
        <div className="product-card-section">
          <div className="product-card-images">
            <img src="/tilde/card.webp" alt="The printed card, front" width={1200} height={601} loading="lazy" decoding="async" />
            <div className="product-backs">
              <figure>
                <img src="/tilde/back-terminal.webp" alt="Terminal-style back: $ whoami, name, title and email" width={800} height={505} loading="lazy" decoding="async" />
                <figcaption>terminal back</figcaption>
              </figure>
              <figure>
                <img src="/tilde/back-plain.webp" alt="Plain back: name, title and email" width={800} height={505} loading="lazy" decoding="async" />
                <figcaption>plain back</figcaption>
              </figure>
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
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="product-cta panel" aria-label="Get Tilde">
        <p>
          <b>~</b> Tilde is free and open source.
        </p>
        <div className="button-row">
          <a className="button primary" href={tilde.download.href}>
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
