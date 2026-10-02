import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ isPreview }) => ({
  plugins: [react()],
  // `vite preview` serves the prerendered pages as files (like production) instead of
  // falling back to the home page; the dev server keeps the SPA fallback.
  appType: isPreview ? 'mpa' : 'spa',
}))
