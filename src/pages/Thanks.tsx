import { Link } from 'react-router'
import { profile } from '../content/profile'

// Landing page for the contact form when JavaScript is off; the form posts and the server
// redirects here.
export default function Thanks() {
  return (
    <section className="not-found">
      <p className="status">
        <span className="status-dot" aria-hidden="true" />
        message sent
      </p>
      <h1>Thanks, I got your message.</h1>
      <p>
        I will reply to the email address you gave. If anything is urgent, you can also email me at{' '}
        <a href={`mailto:${profile.email}`}>{profile.email}</a> or <a href={profile.bookingUrl}>book a call</a>.
      </p>
      <p>
        <Link to="/">Back to the home page →</Link>
      </p>
    </section>
  )
}
