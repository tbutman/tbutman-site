// Draws the link-preview images (Open Graph cards, 1200x630) that LinkedIn, Slack, X and messaging
// apps show for the site's pages, and writes them to public/og/. Each card is an HTML page in the
// site's style, screenshotted with headless Chrome, the same way cv-pdf.mjs prints the CV. Run
// after changing a title or summary; commit the PNGs. src/meta.ts says which page uses which card.
//
// CHROME_PATH overrides the browser binary.
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'og')
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const fileUrl = (path) => pathToFileURL(join(root, path)).href

// Load the site's content straight from the TypeScript sources.
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { profile } = await vite.ssrLoadModule('/src/content/profile.ts')
const { projects } = await vite.ssrLoadModule('/src/content/projects.ts')
const { processIntro } = await vite.ssrLoadModule('/src/content/process.ts')
const { tilde } = await vite.ssrLoadModule('/src/content/tilde.ts')
await vite.close()

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const style = `
@font-face { font-family: Inter; src: url(${fileUrl('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}); font-weight: 100 900; }
@font-face { font-family: Mono; src: url(${fileUrl('node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')}); font-weight: 100 800; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body {
  position: relative; padding: 64px 72px; color: #e7eaee; font-family: Inter, sans-serif;
  background:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px) 0 0 / 60px 60px,
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px) 0 0 / 60px 60px,
    radial-gradient(circle at 85% 15%, rgba(255,181,71,0.10), transparent 45%),
    #0b0d10;
}
body::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 6px; background: #ffb547; }
.mark { font: 600 26px/1 Mono, monospace; }
.mark b { color: #ffb547; }
.kicker { margin-top: 52px; font: 400 22px/1.3 Mono, monospace; color: #a2abb6; text-transform: lowercase; }
h1 { margin-top: 18px; font-weight: 650; letter-spacing: -0.045em; line-height: 1.04; }
h1 span { display: block; color: #ffb547; }
p.summary { margin-top: 26px; max-width: 980px; font-size: 27px; line-height: 1.45; color: #b6bec8;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.foot { position: absolute; left: 72px; bottom: 50px; font: 500 24px/1 Mono, monospace; color: #8a94a0; }
.foot b { color: #e7eaee; font-weight: 500; }
`

const page = (body, extraStyle = '') =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${style}${extraStyle}</style></head><body>${body}</body></html>`

const mark = '<div class="mark"><b>~/</b>tbutman</div>'
// The first part of a project's status ("Live", "Production"), unless the kind already says it.
const statusWord = (project) => {
  const word = project.status?.split('·')[0].trim()
  return word && !project.kind.toLowerCase().includes(word.toLowerCase()) ? ` · ${escape(word)}` : ''
}
const foot = (path) => `<div class="foot"><b>tbutman.com</b>${escape(path)}</div>`

const cards = [
  {
    file: 'home.png',
    html: page(
      `${mark}
      <div class="kicker">${escape(profile.role)} · ${escape(profile.location)}</div>
      <h1 style="font-size: 104px">${escape(profile.headline[0])} <span>${escape(profile.headline[1])}</span></h1>
      <p class="summary" style="-webkit-line-clamp: 2">${escape(profile.name)}: ten years shipping fintech products, now full stack, from data model to deployment.</p>
      ${foot('')}`,
    ),
  },
  {
    file: 'how-i-work.png',
    html: page(
      `${mark}
      <div class="kicker">how i work</div>
      <h1 style="font-size: 76px">${escape(processIntro.title)}</h1>
      <p class="summary">${escape(processIntro.lede)}</p>
      ${foot('/how-i-work')}`,
    ),
  },
  ...projects.map((project) => ({
    file: `work-${project.slug}.png`,
    html: page(
      `${mark}
      <div class="kicker">case study · ${escape(project.kind)}${statusWord(project)}</div>
      <h1 style="font-size: ${project.title.length > 18 ? 76 : 92}px">${escape(project.title)}</h1>
      <p class="summary" style="font-size: 25px; -webkit-line-clamp: 4">${escape(project.summary)}</p>
      ${foot(`/work/${project.slug}`)}`,
    ),
  })),
  {
    file: 'tilde.png',
    html: page(
      `${mark}
      <div class="kicker">${escape(tilde.status)}</div>
      <h1 style="font-size: 120px">${escape(tilde.name)}</h1>
      <p class="tagline">${escape(tilde.headline[0])} <span>${escape(tilde.headline[1])}</span></p>
      <p class="points">Tap or scan to share your contact card,<br>website or WhatsApp. No account, no internet.</p>
      <img class="phone" src="${fileUrl('public/tilde/share.webp')}">
      <img class="card" src="${fileUrl('public/tilde/card.webp')}">
      ${foot('/tilde')}`,
      `.tagline { margin-top: 18px; font: 650 46px/1.12 Inter; letter-spacing: -0.03em; }
       .tagline span { display: block; color: #ffb547; }
       .points { margin-top: 26px; font-size: 26px; line-height: 1.45; color: #b6bec8; }
       .phone { position: absolute; right: 86px; top: 46px; width: 250px; padding: 7px; border-radius: 34px;
         background: #050608; border: 1px solid #2b343e; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
       .card { position: absolute; right: 236px; bottom: 84px; width: 360px; filter: drop-shadow(0 24px 40px rgba(0,0,0,0.6)); }`,
    ),
  },
]

await mkdir(outDir, { recursive: true })
const work = await mkdtemp(join(tmpdir(), 'og-'))
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const sizeOf = (file) => stat(file).then((s) => s.size, () => 0)

for (const card of cards) {
  const html = join(work, card.file.replace('.png', '.html'))
  const output = join(outDir, card.file)
  await writeFile(html, card.html)
  await rm(output, { force: true })
  const browser = spawn(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--allow-file-access-from-files',
      `--user-data-dir=${join(work, 'profile')}`,
      '--window-size=1200,630',
      '--virtual-time-budget=3000',
      `--screenshot=${output}`,
      pathToFileURL(html).href,
    ],
    { stdio: 'ignore' },
  )
  // As in cv-pdf.mjs: Chrome can stay alive after writing the file, so wait for it to settle.
  let size = 0
  for (let attempt = 0; attempt < 40; attempt++) {
    await wait(250)
    const next = await sizeOf(output)
    if (next > 0 && next === size) break
    size = next
  }
  const exited = new Promise((resolve) => browser.once('exit', resolve))
  browser.kill()
  await exited
  if (!size) {
    console.error(`Failed to draw ${card.file}`)
    process.exit(1)
  }
  console.log(`wrote public/og/${card.file} (${Math.round(size / 1000)} kB)`)
}
await rm(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
