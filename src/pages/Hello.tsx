import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import LangSwitch from '../components/LangSwitch'
import NotOnIPhone from '../components/NotOnIPhone'
import { type Diagram, diagrams } from '../content/diagrams'
import { helloShared, helloText } from '../content/hello'
import { profile } from '../content/profile'
import { type Locale, translations } from '../i18n'
import { arrivalOf } from '../lib/arrival'
import { copyText, selectText } from '../lib/clipboard'

// The arrival the page was served for. nginx picks the prerendered page for the link's ?from=
// (deploy/nginx.conf), and the page names it in data-arrival; reading it back instead of the
// address means hydration always matches, even on a server whose config predates the arrivals. It
// stays for the visit, so switching language keeps it.
const served = typeof document === 'undefined' ? null : document.querySelector('.hello')?.getAttribute('data-arrival') ?? null

// Landing page for the business card. Phone-first: ways to stay in touch come first, for anyone
// met in person, then the work actions, then everything else.
export default function Hello({ locale }: { locale: Locale }) {
  const text = helloText[locale]
  const { search } = useLocation()
  const arrival = arrivalOf(typeof document === 'undefined' ? new URLSearchParams(search).get('from') : served)
  const from = text.arrivals[arrival]
  // The visitor's phone as this arrival names it, after Thomas's card, keychain or phone when known.
  const base = diagrams[text.diagram]
  const shift = from.mine ? 1 : 0
  const nodes = base.nodes.map((node) => ({ ...node, col: node.col + shift, ...(node.id === 'phone' ? from.yours : {}) }))
  const diagram: Diagram = from.mine
    ? {
        ...base,
        columns: [text.mineColumn, ...base.columns],
        nodes: [{ id: 'mine', ...from.mine, col: 0, row: 0 }, ...nodes],
        edges: [['mine', 'phone'], ...base.edges],
      }
    : { ...base, nodes }
  const [status, setStatus] = useState<'idle' | 'copied' | 'selected'>('idle')
  const emailRef = useRef<HTMLSpanElement>(null)
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

  // The server log has counted the ?from= already; take it off the address, so a forwarded link
  // doesn't tell its next reader they tapped the card.
  // The rest of the query stays as written (?links=resume,book keeps its commas).
  useEffect(() => {
    const { pathname, search, hash } = window.location
    const rest = search.slice(1).split('&').filter((part) => part && !part.startsWith('from='))
    if (rest.length === search.slice(1).split('&').filter(Boolean).length) return
    window.history.replaceState(window.history.state, '', `${pathname}${rest.length ? `?${rest.join('&')}` : ''}${hash}`)
  }, [])

  // ?about=tilde, the Tilde version: both versions are in the page (data-hello-version), and the head
  // script's <html data-hello-about> picks one (scripts/hello-share.mjs).
  const tilde = text.tildeVersion

  return (
    <article className="hello" data-arrival={arrival}>
      <LangSwitch locale={locale} paths={{ en: '/hello', pt: translations['/hello'] }} />
      <section className="hello-intro" aria-labelledby="hello-heading">
        <p className="status">
          <span className="status-dot" aria-hidden="true" />
          {from.status}
        </p>
        <h1 id="hello-heading">
          {text.headline[0]}{' '}
          <span className="hello-meet" data-hello-version="default">
            {text.headline[1]}
          </span>{' '}
          <span data-hello-version="default">{text.headline[2]}</span>
          <span data-hello-version="tilde">{tilde.headline}</span>
        </h1>
        <p className="lede" data-hello-version="default">
          {from.thanks} {text.ready}
        </p>
        <p className="lede" data-hello-version="tilde">
          {from.thanks} {from.others} {text.tilde.before}
          <a href={text.tilde.href}>{text.tilde.link}</a>
          {text.tilde.after}
        </p>
        <p className="hello-open">
          <span>{text.openTo}</span> {text.availability} · {text.engagement}
        </p>
      </section>

      <section className="section" aria-labelledby="hello-tilde-heading" data-hello-version="tilde">
        <div className="section-head">
          <h2 id="hello-tilde-heading">{tilde.heading}</h2>
        </div>
        <div className="hello-actions panel">
          <NotOnIPhone note={<p className="hello-iphone">{tilde.iphone}</p>}>
            <a className="button primary" href={tilde.app.href}>
              {tilde.app.label}
            </a>
          </NotOnIPhone>
          <div className="button-row">
            {tilde.links.map((link) => (
              <a key={link.href} className="button" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="hello-touch-heading" data-hello-item="touch">
        <div className="section-head">
          <h2 id="hello-touch-heading">{text.keepInTouchHeading}</h2>
        </div>
        <div className="hello-actions panel">
          {/* data-hello-item: what ?contact=, ?social= and ?links= can hide (scripts/hello-share.mjs). */}
          {/* The one call to action. No download attribute: iOS only offers "Create New Contact" when it opens the file. */}
          <a className="button primary" href={helloShared.vcardPath} data-hello-item="card">
            {text.saveContact}
          </a>
          {/* The address shows on its button, so a phone that won't copy can select it instead. */}
          <div className="button-row" data-hello-item="reach">
            <span className="hello-email" data-hello-item="email">
              <a className="button" href={`mailto:${profile.email}`}>
                <span ref={emailRef}>{profile.email}</span> ↗
              </a>
              <button type="button" className="button" onClick={() => void copyEmail()}>
                {text.copy[status]}
              </button>
              <span className="visually-hidden" aria-live="polite">
                {status === 'copied' ? text.copy.copiedAnnounce : status === 'selected' ? text.copy.selectedAnnounce : ''}
              </span>
            </span>
            {profile.whatsapp && (
              <a className="button" href={`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(text.whatsapp.text)}`} data-hello-item="whatsapp">
                {text.whatsapp.label}
              </a>
            )}
          </div>
          <div className="button-row" data-hello-item="social">
            {helloShared.socials.map((link) => (
              <a key={link.href} className="button" href={link.href} data-hello-item={link.label.toLowerCase()}>
                {link.label.toLowerCase()} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="hello-work-heading" data-hello-item="links">
        <div className="section-head">
          <h2 id="hello-work-heading">{text.workHeading}</h2>
        </div>
        <div className="hello-actions panel">
          <a className="button primary" href={profile.bookingUrl} data-hello-item="book">
            {text.bookCall}
          </a>
          <div className="button-row">
            <Link className="button" to="/resume" data-hello-item="resume">
              {text.resume}
            </Link>
            {workLinks.map((link) => (
              <a key={link.href} className="button" href={link.href} data-hello-item={link.label.toLowerCase()}>
                {link.label.toLowerCase()}
              </a>
            ))}
            <Link className="button" to="/" data-hello-item="site">
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

      <section className="section" aria-labelledby="hello-american-heading" data-hello-version="default">
        <div className="section-head">
          <h2 id="hello-american-heading">{text.american.heading}</h2>
        </div>
        <p className="hello-bio">{text.american.intro}</p>
        <ul className="hello-points">
          {text.american.points.map(([lead, body]) => (
            <li key={lead}>
              <b>{lead}</b> {body}
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="hello-path-heading">
        <div className="section-head">
          <h2 id="hello-path-heading">{text.diagramHeading}</h2>
        </div>
        <ArchitectureDiagram diagram={diagram} />
        {from.note && <p className="hello-note">{from.note}</p>}
        <p className="hello-note" data-hello-version="tilde">
          <Link to={text.buildLink.to}>{text.buildLink.label}</Link>
        </p>
      </section>
    </article>
  )
}
