// Builds /tilde/n, the note page (N1), into dist/tilde/n.html: one self-contained file with the script
// and styles inline and allowed by hash (scripts/inline-page.mjs). Spec:
// tilde-review/specs/notes-link.md, section 3. Runs after vite build and prerender.
import { inlinePage } from './inline-page.mjs'

await inlinePage({ route: '/tilde/n', dir: 'note', what: 'note page', global: 'tildeNote' })
