import { useSyncExternalStore } from 'react'
import { Link } from 'react-router'
import { helloShared } from '../content/hello'
import { profile } from '../content/profile'

// Screen 0 of the hub (visitor round 1, item 3; the coordinator's wording): a line for where the
// visitor came from, read from ?from= in the browser only (the server's snapshot is null), so the
// prerendered page is the same for everyone and hydrates cleanly.
// - from=mystery-card: the reveal. Who made the card, and why it was in their hand.
// - from=tag: what just happened, and how to make one yours.
// - from=card: the card's own line, to the Cards page.
// Anyone else sees nothing here.

type From = 'mystery-card' | 'tag' | 'card'
const linkedIn = profile.links.find((link) => link.label === 'LinkedIn')?.href

const arrivedFrom = (): From | null => {
  const value = new URLSearchParams(window.location.search).get('from')
  return value === 'mystery-card' || value === 'tag' || value === 'card' ? value : null
}
// The query doesn't change while the page is open: nothing to subscribe to.
const subscribe = () => () => {}

export default function Arrival() {
  const from = useSyncExternalStore(subscribe, arrivedFrom, () => null)

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
        <p>
          <b>Make one yours:</b> on an iPhone, write a link with the free NFC Tools app. On Android, Tilde writes a link, your
          contact card or your guest Wi-Fi.
        </p>
        <div className="button-row">
          <Link className="button primary" to="/tilde/uses">
            what a tag can do →
          </Link>
          <Link className="button" to="/tilde/app">
            get the app →
          </Link>
        </div>
      </section>
    )
  }
  if (from === 'mystery-card') {
    return (
      <section className="arrival arrival-reveal panel" aria-labelledby="arrival-heading">
        <h2 id="arrival-heading">You got a mystery card.</h2>
        <p>I’m Thomas: I designed it, printed it, and wrote the app it talks to. I’m looking for my next role.</p>
        <div className="button-row">
          <a className="button primary" href={helloShared.vcardPath} download>
            save my contact ↓
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
