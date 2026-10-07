import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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

// https://vite.dev/config/
export default defineConfig(({ isPreview }) => ({
  plugins: [react()],
  // In development, forward the contact form to a local `node services/contact/server.mjs`.
  server: { proxy: { '/api': 'http://127.0.0.1:3000' } },
  define: {
    __BUILD_COMMIT__: JSON.stringify(gitCommit()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __TILDE_RELEASE__: JSON.stringify(tildeRelease()),
  },
  // `vite preview` serves the prerendered pages as files (like production) instead of
  // falling back to the home page; the dev server keeps the SPA fallback.
  appType: isPreview ? 'mpa' : 'spa',
}))
