import { Link } from 'react-router'
import { helloShared } from '../content/hello'
import { profile } from '../content/profile'
import { useArrival } from './useArrival'
import NotOnIPhone from './NotOnIPhone'

// Screen 0 of the hub (visitor round 1, item 3; the coordinator's wording): a line for where the
// visitor came from, read from ?from= in the browser only (the server's snapshot is null), so the
// prerendered page is the same for everyone and hydrates cleanly.
// - from=mystery-card: the reveal. Who made the card, and why it was in their hand.
// - from=tag: what just happened, and how to make one yours.
// - from=card: the card's own line, to the Cards page.
// Anyone else sees nothing here.

const linkedIn = profile.links.find((link) => link.label === 'LinkedIn')?.href

export default function Arrival() {
  const from = useArrival()

  if (from === 'card') {
    return (
      <p className="product-strip">
        <Link to="/tilde/card">
          Scanned a Tilde Card?{' '}
          <span className="nowrap">
            <b>Make your own</b>
            <span aria-hidden="true"> →</span>
          </span>
        </Link>
      </p>
    )
  }
  if (from === 'tag') {
    return (
      <section className="arrival panel" aria-labelledby="arrival-heading">
        <h2 id="arrival-heading">You just tapped or scanned a Tilde tag.</h2>
        <p>Your phone did that with no app.</p>
        {/* What the tag in their hand is, and the booth's offer (visitor round 2, item 8; no "we": item 13). */}
        <p>This tag opens this page. It can open anything: your LinkedIn, your booking page.</p>
        <p>
          <b>At the Tilde booth at Web Summit?</b> Ask for yours: it’s written in 10 seconds.
        </p>
        <p>
          <b>Make one yours:</b> on an iPhone, write a link with the free NFC Tools app. On Android, Tilde writes a link, your
          contact card or your guest Wi-Fi.
        </p>
        <div className="button-row">
          <Link className="button primary" to="/tilde/uses">
            what a tag can do →
          </Link>
          <NotOnIPhone>
            <Link className="button" to="/tilde/app">
              get the app →
            </Link>
          </NotOnIPhone>
        </div>
      </section>
    )
  }
  if (from === 'mystery-card') {
    return (
      <section className="arrival arrival-reveal panel" aria-labelledby="arrival-heading">
        <h2 id="arrival-heading">You got a mystery card.</h2>
        {/* Visitor round 2, items 9–12: the role, the Android app, the tap, and where to meet. */}
        <p>
          I’m Thomas: I designed it, printed it, and wrote the Android app that programs it. I’m looking for my next role:
          senior full-stack / product engineer, remote US or Lisbon.
        </p>
        <p>Hold it to the back of your phone, too: there’s a sticker behind its tap mark.</p>
        <p>
          <b>Come find me at Web Summit,</b> Lisbon, November 9–12.
        </p>
        <div className="button-row">
          <a className="button primary" href={helloShared.vcardPath} download>
            save my contact ↓
          </a>
          <a className="button" href={`mailto:${profile.email}`}>
            email
          </a>
          <Link className="button" to="/resume">
            résumé →
          </Link>
          {linkedIn && (
            <a className="button" href={linkedIn}>
              LinkedIn ↗
            </a>
          )}
        </div>
      </section>
    )
  }
  return null
}
