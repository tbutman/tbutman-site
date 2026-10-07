import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { profile } from '../content/profile'
import { copyText, selectText } from '../lib/clipboard'
import ContactForm from './ContactForm'

export default function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'selected'>('idle')
  const emailRef = useRef<HTMLAnchorElement>(null)

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
    <section id="contact" className="section" aria-labelledby="contact-heading">
      <div className="section-head">
        <h2 id="contact-heading">contact</h2>
      </div>
      <div className="contact panel">
        <p className="contact-lede">
          Email me, or book a 20-minute intro call at a time that suits you, whether it is about a role, a contract or just an introduction.
        </p>
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
        {profile.contactFormEnabled && <ContactForm />}
        <div className="button-row">
          <a className="button primary" href={profile.bookingUrl}>
            book a 20-minute intro call ↗
          </a>
          {profile.links.map((link) => (
            <a key={link.href} className="button" href={link.href}>
              {link.label.toLowerCase()}
            </a>
          ))}
          <Link className="button" to="/resume">
            résumé
          </Link>
        </div>
      </div>
    </section>
  )
}
