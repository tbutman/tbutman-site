// Builds /tilde/c, the contact page (X1), into dist/tilde/c.html: one self-contained file with the
// script and styles inline and allowed by hash (scripts/inline-page.mjs). Spec:
// tilde-review/specs/x1-contact-link.md, section 6. Runs after vite build and prerender.
import { inlinePage } from './inline-page.mjs'

await inlinePage({ route: '/tilde/c', dir: 'contact', what: 'contact page', global: 'tildeContact' })
