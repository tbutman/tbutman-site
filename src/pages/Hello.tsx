import { useRef, useState } from 'react'
import { Link } from 'react-router'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import LangSwitch from '../components/LangSwitch'
import { diagrams } from '../content/diagrams'
import { helloShared, helloText } from '../content/hello'
import { profile } from '../content/profile'
import { type Locale, translations } from '../i18n'
import { copyText, selectText } from '../lib/clipboard'

// Landing page for the business card. Phone-first: ways to stay in touch come first, for anyone
// met in person, then the work actions, then everything else.
export default function Hello({ locale }: { locale: Locale }) {
  const text = helloText[locale]
  const [status, setStatus] = useState<'idle' | 'copied' | 'selected'>('idle')
  const emailRef = useRef<HTMLAnchorElement>(null)
  // GitHub and the like; LinkedIn is already under the socials.
  const workLinks = profile.links.filter((link) => !helloShared.socials.some((social) => social.href === link.href))

  const copyEmail = async () => {
    if (await copyText(profile.email)) {
      setStatus('copied')
    } else {
      selectText(emailRef.current)
      setStatus('selected')
    }
    window.setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <article className="hello">
      <LangSwitch locale={locale} paths={{ en: '/hello', pt: translations['/hello'] }} />
      <section className="hello-intro" aria-labelledby="hello-heading">
        <p className="status">
          <span className="status-dot" aria-hidden="true" />
          {text.status}
        </p>
        <h1 id="hello-heading">
          {text.headline[0]} <span>{text.headline[1]}</span>
        </h1>
        <p className="lede">{text.intro}</p>
        <p className="hello-open">
          <span>{text.openTo}</span> {text.availability} · {text.engagement}
        </p>
      </section>

      <section className="section" aria-labelledby="hello-touch-heading">
        <div className="section-head">
          <h2 id="hello-touch-heading">{text.keepInTouchHeading}</h2>
        </div>
        <div className="hello-actions panel">
          <div className="contact-email">
            <a ref={emailRef} href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <button type="button" className="button" onClick={() => void copyEmail()}>
              {text.copy[status]}
            </button>
            <span className="visually-hidden" aria-live="polite">
              {status === 'copied' ? text.copy.copiedAnnounce : status === 'selected' ? text.copy.selectedAnnounce : ''}
            </span>
          </div>
          {/* No download attribute: iOS only offers "Create New Contact" when it opens the file. */}
          <a className="button primary" href={helloShared.vcardPath}>
            {text.saveContact}
          </a>
          <div className="button-row">
            {helloShared.socials.map((link) => (
              <a key={link.href} className="button" href={link.href}>
                {link.label.toLowerCase()} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="hello-work-heading">
        <div className="section-head">
          <h2 id="hello-work-heading">{text.workHeading}</h2>
        </div>
        <div className="hello-actions panel">
          <a className="button primary" href={profile.bookingUrl}>
            {text.bookCall}
          </a>
          <div className="button-row">
            <Link className="button" to="/cv">
              {text.cv}
            </Link>
            {workLinks.map((link) => (
              <a key={link.href} className="button" href={link.href}>
                {link.label.toLowerCase()}
              </a>
            ))}
            <Link className="button" to="/">
              {text.fullSite}
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="hello-about-heading">
        <div className="section-head">
          <h2 id="hello-about-heading">{text.aboutHeading}</h2>
        </div>
        <p className="hello-bio">{text.bio}</p>
      </section>

      <section className="section" aria-labelledby="hello-path-heading">
        <div className="section-head">
          <h2 id="hello-path-heading">{text.diagramHeading}</h2>
        </div>
        <ArchitectureDiagram diagram={diagrams[text.diagram]} />
        <p className="hello-note">{text.cardNote}</p>
        <p className="hello-note">
          <Link to={text.projectLink.to}>{text.projectLink.label}</Link>
        </p>
      </section>
    </article>
  )
}
