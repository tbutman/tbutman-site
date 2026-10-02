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

`dist/` is the whole site. Routes are flat files (`/cv` → `cv.html`, `/work/spot-watch` →
`work/spot-watch.html`) plus `404.html`, so the web server needs to try `$uri.html` and fall back to
`404.html`. With nginx:

```nginx
location / {
  try_files $uri $uri.html $uri/ =404;
}
error_page 404 /404.html;
```

## Content

Everything on the site and the CV comes from `src/content/`. Edit the copy there, not in the components.
