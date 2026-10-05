import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { projects } from './content/projects'
import { getMeta } from './meta'

export { contactCard } from './lib/vcard'

export const paths = ['/', '/cv', '/how-i-work', '/thanks', '/hello', '/tilde', ...projects.map((project) => `/work/${project.slug}`), '/404']

export function render(path: string) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
  return { html, meta: getMeta(path) }
}
