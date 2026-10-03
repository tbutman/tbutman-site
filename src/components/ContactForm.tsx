import { useState } from 'react'
import type { FormEvent } from 'react'
import { profile } from '../content/profile'

type Status = { state: 'idle' | 'sending' | 'sent' } | { state: 'error'; message: string }

// Posts to the self-hosted contact service (services/contact). Without JavaScript the browser
// submits the form normally and the service redirects to /thanks.
export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: 'idle' })

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setStatus({ state: 'sending' })
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!response.ok || !body.ok) throw new Error(body.error ?? 'the message could not be sent')
      form.reset()
      setStatus({ state: 'sent' })
    } catch (error) {
      setStatus({ state: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }

  if (status.state === 'sent') {
    return (
      <p className="form-status sent" role="status">
        Thanks, your message is on its way. I will reply to the email address you gave.
      </p>
    )
  }

  return (
    <form className="contact-form" method="post" action="/api/contact" onSubmit={(event) => void submit(event)}>
      <div className="form-row">
        <label>
          <span>Name</span>
          <input name="name" autoComplete="name" required maxLength={100} />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
      </div>
      <label>
        <span>
          Company <em>(optional)</em>
        </span>
        <input name="company" autoComplete="organization" maxLength={120} />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" required minLength={10} maxLength={5000} rows={5} />
      </label>
      {/* Honeypot for bots: hidden from people and assistive technology. */}
      <label className="honeypot" aria-hidden="true">
        Leave this empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="form-actions">
        <button className="button primary" type="submit" disabled={status.state === 'sending'}>
          {status.state === 'sending' ? 'sending…' : 'send message'}
        </button>
        <p className="form-status" role="status" aria-live="polite">
          {status.state === 'error' && (
            <>
              Sorry, {status.message}. You can email me at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
            </>
          )}
        </p>
      </div>
    </form>
  )
}
