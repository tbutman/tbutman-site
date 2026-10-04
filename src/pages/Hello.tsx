import { useRef, useState } from 'react'
import { Link } from 'react-router'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import { diagrams } from '../content/diagrams'
import { hello } from '../content/hello'
import { profile } from '../content/profile'
import { copyText, selectText } from '../lib/clipboard'

// Landing page for the business card. Phone-first: ways to stay in touch come first, for anyone
// met in person, then the work actions, then everything else.
export default function Hello() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'selected'>('idle')
  const emailRef = useRef<HTMLAnchorElement>(null)
  // GitHub and the like; LinkedIn is already under the socials.
  const workLinks = profile.links.filter((link) => !hello.socials.some((social) => social.href === link.href))

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
      <section className="hello-intro" aria-labelledby="hello-heading">
        <p className="status">
          <span className="status-dot" aria-hidden="true" />
          {hello.status}
        </p>
        <h1 id="hello-heading">
          {hello.headline[0]} <span>{hello.headline[1]}</span>
        </h1>
        <p className="lede">{hello.intro}</p>
        <p className="hello-open">
          <span>open to</span> {profile.availability.toLowerCase()} · {profile.engagement.toLowerCase()}
        </p>
      </section>

      <section className="section" aria-labelledby="hello-touch-heading">
        <div className="section-head">
          <h2 id="hello-touch-heading">{hello.keepInTouchHeading}</h2>
        </div>
        <div className="hello-actions panel">
          <div className="contact-email">
            <a ref={emailRef} href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <button type="button" className="button" onClick={() => void copyEmail()}>
              {status === 'copied' ? 'copied ✓' : status === 'selected' ? 'selected' : 'copy'}
            </button>
            <span className="visually-hidden" aria-live="polite">
              {status === 'copied' ? 'Email address copied' : status === 'selected' ? 'Email address selected' : ''}
            </span>
          </div>
          <div className="button-row">
            {hello.socials.map((link) => (
              <a key={link.href} className="button" href={link.href}>
                {link.label.toLowerCase()} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="hello-work-heading">
        <div className="section-head">
          <h2 id="hello-work-heading">{hello.workHeading}</h2>
        </div>
        <div className="hello-actions panel">
          <a className="button primary" href={profile.bookingUrl}>
            book a 20-minute intro call ↗
          </a>
          <div className="button-row">
            <Link className="button" to="/cv">
              cv
            </Link>
            {workLinks.map((link) => (
              <a key={link.href} className="button" href={link.href}>
                {link.label.toLowerCase()}
              </a>
            ))}
            <Link className="button" to="/">
              the full site →
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="hello-about-heading">
        <div className="section-head">
          <h2 id="hello-about-heading">{hello.aboutHeading}</h2>
        </div>
        <p className="hello-bio">{profile.lede}</p>
      </section>

      <section className="section" aria-labelledby="hello-path-heading">
        <div className="section-head">
          <h2 id="hello-path-heading">{hello.diagramHeading}</h2>
        </div>
        <ArchitectureDiagram diagram={diagrams.hello} />
        <p className="hello-note">{hello.cardNote}</p>
      </section>
    </article>
  )
}
