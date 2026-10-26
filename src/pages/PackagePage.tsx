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
          {/* The app agent's copy (tilde-review/handoffs/packages-page, section 1). */}
          <p className="product-name">
            <b>~</b> Packages
          </p>
          <h1 id="package-heading">A package tag</h1>
          <p className="lede">
            On its owner’s Android phone, this tag opens their list of packages in Tilde. The list stays on their phone;
            nothing about the packages is on the tag.
          </p>
          <div className="button-row">
            <Link className="button primary" to="/tilde/home">
              next stop: home &amp; desk →
            </Link>
            <NotOnIPhone>
              <Link className="button" to="/tilde/app">
                get the app →
              </Link>
            </NotOnIPhone>
          </div>
        </div>
      </section>
    </article>
  )
}
