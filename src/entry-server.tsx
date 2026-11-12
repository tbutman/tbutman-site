import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { projects } from './content/projects'
import { ARRIVALS } from './lib/arrival'
import { getMeta } from './meta'

export { contactCard } from './lib/vcard'
export { tildeTwin } from './site'

export const paths = ['/', '/resume', '/how-i-work', '/thanks', '/hello', '/pt/hello', '/tilde', '/pt/tilde', '/tilde/privacy', '/pt/tilde/privacy', '/tilde/card', '/pt/tilde/card', '/tilde/fobs', '/tilde/home', '/tilde/p', '/tilde/support', '/tilde/uses', '/tilde/app', ...projects.map((project) => `/work/${project.slug}`), '/404']

// /hello's page for each ?from= arrival (src/lib/arrival.ts), in both languages, where nginx looks for
// them (deploy/nginx.conf): /hello?from=card-qr is _hello/card-qr.html, /pt/hello's is _hello/pt/card-qr.html.
export const arrivalPages = ['/hello', '/pt/hello'].flatMap((path) =>
  ARRIVALS.map((arrival) => ({ path: `${path}?from=${arrival}`, file: `_hello/${path === '/hello' ? '' : 'pt/'}${arrival}.html` })),
)

/** A path may carry a query (an arrival page's ?from=); the page's meta are its path's. */
export function render(path: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
  return { html, meta: getMeta(path.split('?')[0]) }
}
