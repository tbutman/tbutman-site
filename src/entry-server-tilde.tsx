import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { getMeta } from './meta'
import { internalPath } from './site'
import TildeApp from './TildeApp'

export { tildeTwin } from './site'

// The prerender's entry for taptilde.com (SITE=tilde; scripts/prerender.mjs): its pages at the root,
// each with its tbutman.com twin's title and description.
export const paths = ['/', '/pt', '/card', '/pt/card', '/fobs', '/home', '/p', '/uses', '/app', '/privacy', '/pt/privacy', '/404']

export function render(path: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <TildeApp />
      </StaticRouter>
    </StrictMode>,
  )
  // The 404 keeps Tilde's own preview image (tbutman.com's isn't on this site).
  const meta = path === '/404' ? { ...getMeta('/404'), image: '/og/tilde.png' } : getMeta(internalPath(path))
  return { html, meta }
}
