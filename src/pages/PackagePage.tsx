import NotOnIPhone from '../components/NotOnIPhone'
import { Link } from '../components/SiteLink'

// /tilde/p (taptilde.com/p): where a package tracker tag lands on a phone without Tilde. With Tilde on
// Android, the App Link opens the app instead (public/.well-known: assetlinks.json, written by the
// prerender from src/content/app-links.json). The coordinator's brief, October 26: package tracking
// in Tilde 1.4.0.
export default function PackagePage() {
  return (
    <article className="product booth">
      <section className="product-hero booth-hero booth-hero-text-only" aria-labelledby="package-heading">
        <div className="product-hero-text">
          <p className="status">
            <span className="status-dot" aria-hidden="true" />
            nfc · android
          </p>
          <p className="product-name">
            <b>~</b> Tilde
          </p>
          <h1 id="package-heading">A package tracker tag.</h1>
          <p className="lede">This tag opens a package tracker in Tilde for Android. Nothing about the packages is on the tag.</p>
          <div className="button-row">
            <NotOnIPhone>
              <Link className="button primary" to="/tilde/app">
                get the app →
              </Link>
            </NotOnIPhone>
            <Link className="button" to="/tilde/uses">
              what else a tap can do →
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}
