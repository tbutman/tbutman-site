import { useLocation } from 'react-router'
import { tour } from '../content/booth/pages'
import { internalPath } from '../site'
import { Link } from './SiteLink'

// taptilde.com's header: the ~/tilde mark (home) and the family, in the tour's order. Written with
// tbutman.com's paths, as every Tilde page is; SiteLink writes them for taptilde.com (src/site.ts).
export default function TildeHeader() {
  const current = internalPath(useLocation().pathname)
  return (
    <header className="site-header tilde-header">
      <Link to="/tilde" className="site-name" aria-label="Tilde, home">
        <b>~/</b>tilde
      </Link>
      <nav className="tilde-nav" aria-label="Tilde">
        {tour.slice(1).map((stop) => (
          <Link key={stop.key} to={stop.path} aria-current={current === stop.path ? 'page' : undefined}>
            {stop.label.toLowerCase()}
          </Link>
        ))}
      </nav>
    </header>
  )
}
