import { Link } from 'react-router'
import LangSwitch from '../components/LangSwitch'
import RichText from '../components/RichText'
import { tildePrivacyText } from '../content/tildePrivacy'
import { type Locale, translations } from '../i18n'

export default function TildePrivacy({ locale }: { locale: Locale }) {
  const privacy = tildePrivacyText[locale]
  return (
    <article className="product">
      <LangSwitch locale={locale} paths={{ en: '/tilde/privacy', pt: translations['/tilde/privacy'] }} />
      <section className="product-hero privacy-hero" aria-labelledby="privacy-heading">
        <div className="product-hero-text">
          <p className="status">
            <span className="status-dot" aria-hidden="true" />
            {privacy.status}
          </p>
          <p className="product-name">
            <b>~</b> {privacy.name}
          </p>
          <h1 id="privacy-heading">
            {privacy.headline[0]} <span>{privacy.headline[1]}</span>
          </h1>
          <p className="lede">{privacy.lede}</p>
        </div>
      </section>

      {privacy.sections.map((section, index) => (
        <section key={section.heading} className="section" aria-labelledby={`privacy-${index}`}>
          <div className="section-head">
            <h2 id={`privacy-${index}`}>{section.heading}</h2>
          </div>
          <ul className="privacy-list panel">
            {section.points.map((point) => (
              <li key={point}>
                <RichText text={point} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="product-cta panel" aria-label={privacy.ctaText}>
        <p>
          <b>~</b> {privacy.ctaText}
        </p>
        <div className="button-row">
          <Link className="button primary" to={privacy.backLink.to}>
            {privacy.backLink.label} →
          </Link>
          <a className="button" href={privacy.sourceLink.href}>
            {privacy.sourceLink.label} ↗
          </a>
        </div>
      </section>
    </article>
  )
}
