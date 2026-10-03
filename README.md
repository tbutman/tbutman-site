# tbutman-site

Personal site for Thomas Butman. React and TypeScript on Vite, prerendered to static HTML at build time and
self-hosted.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build     # client bundle + SSR bundle, then scripts/prerender.mjs writes one HTML file per route
npm run preview   # serves dist/ the way production does
```

`dist/` is the whole site: one HTML file per route (`/cv` → `cv.html`) plus `404.html`.

## Deploy

Pushes to `main` build a GitHub release, and the home server installs it within a few minutes.
See [deploy/README.md](deploy/README.md).

## Content

Everything on the site and the CV comes from `src/content/`. Edit the copy there, not in the components.
