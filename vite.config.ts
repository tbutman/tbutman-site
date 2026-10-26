import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function gitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

// The newest Tilde release, from scripts/tilde-release.mjs (the build runs it first), or null:
// the /tilde download button then links to the release page.
function tildeRelease() {
  try {
    return JSON.parse(readFileSync('tilde-release.json', 'utf8'))
  } catch {
    return null
  }
}

// The booth pages' parts load lazily in the browser (src/booth/index.tsx): there, src/booth/direct.ts
// is src/booth/none.ts, so the copy and the render index stay out of the main bundle. The prerender
// keeps the real file.
const boothParts: Plugin = {
  name: 'booth-parts',
  enforce: 'pre',
  resolveId(source, importer, options) {
    if (source === './direct' && importer?.endsWith('/src/booth/index.tsx') && !options?.ssr) {
      return fileURLToPath(new URL('./src/booth/none.ts', import.meta.url))
    }
  },
}

// Which site (src/site.ts): SITE=tilde builds taptilde.com, whose app is src/TildeApp.tsx.
const site = process.env.SITE === 'tilde' ? 'tilde' : 'main'
const siteApp: Plugin = {
  name: 'site-app',
  enforce: 'pre',
  resolveId(source, importer) {
    if (site === 'tilde' && source === './App' && importer?.endsWith('/src/entry-client.tsx')) {
      return fileURLToPath(new URL('./src/TildeApp.tsx', import.meta.url))
    }
  },
}

// https://vite.dev/config/
export default defineConfig(({ isPreview }) => ({
  plugins: [react(), boothParts, siteApp],
  // In development, forward the contact form to a local `node services/contact/server.mjs`.
  server: { proxy: { '/api': 'http://127.0.0.1:3000' } },
  define: {
    __BUILD_COMMIT__: JSON.stringify(gitCommit()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __TILDE_RELEASE__: JSON.stringify(tildeRelease()),
    __SITE__: JSON.stringify(site),
  },
  // `vite preview` serves the prerendered pages as files (like production) instead of
  // falling back to the home page; the dev server keeps the SPA fallback.
  appType: isPreview ? 'mpa' : 'spa',
  // Fonts stay files, never data: URLs, which the site's CSP (font-src 'self') would block: Vite
  // would otherwise inline the smallest subsets, such as JetBrains Mono's Vietnamese one.
  build: { assetsInlineLimit: (file: string) => (file.endsWith('.woff2') ? false : undefined) },
}))
