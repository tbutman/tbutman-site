// Renders every route in src/entry-server.tsx to a static HTML file in dist/.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const serverDist = join(root, 'dist-server')

const template = await readFile(join(dist, 'index.html'), 'utf8')
const { paths, render } = await import(pathToFileURL(join(serverDist, 'entry-server.js')).href)

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function outputFile(path) {
  if (path === '/') return 'index.html'
  if (path === '/404') return '404.html'
  return `${path.slice(1)}.html`
}

for (const path of paths) {
  const { html, meta } = render(path)
  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  ].join('\n    ')
  const page = template.replace('<!--app-head-->', () => head).replace('<!--app-html-->', () => html)
  const file = join(dist, outputFile(path))
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, page)
  console.log(`prerendered ${path} -> ${outputFile(path)}`)
}

await rm(serverDist, { recursive: true, force: true })
