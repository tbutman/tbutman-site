// Checks the built pages against the Content Security Policy in deploy/nginx.conf, so a change that
// the policy would block (an inline script without its hash, an inline style or event handler, a
// script, style, font or image from another site) fails CI instead of breaking the live site once
// the config is installed. /tilde/c is left out: it carries its own policy, checked by
// src/contact/page.browser.test.mjs. Usage: node deploy/check-csp.mjs (after npm run build).
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const conf = await readFile(join(root, 'deploy', 'nginx.conf'), 'utf8')
const policy = conf.match(/~\^text\/html "([^"]+)";/)?.[1]
if (!policy) throw new Error('check-csp: no text/html policy in deploy/nginx.conf')
const directives = Object.fromEntries(
  policy.split(';').map((part) => {
    const [name, ...values] = part.trim().split(/\s+/)
    return [name, values]
  }),
)
for (const name of ['default-src', 'script-src', 'style-src']) {
  if (!directives[name]) throw new Error(`check-csp: the policy has no ${name}`)
}
if (directives['style-src'].some((v) => v.includes('unsafe'))) throw new Error("check-csp: style-src must not allow 'unsafe-…'")
const allowedScripts = new Set(directives['script-src'].filter((v) => v.startsWith("'sha256-")).map((v) => v.slice(8, -1)))

async function* pages(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* pages(path)
    else if (entry.name.endsWith('.html')) yield path
  }
}

const problems = []
const used = new Set()
let count = 0
for await (const file of pages(dist)) {
  const name = relative(dist, file)
  if (name === join('tilde', 'c.html')) continue
  count++
  const html = await readFile(file, 'utf8')
  for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attributes)) continue
    if (/type="application\/(ld\+)?json"/.test(attributes)) continue
    const hash = createHash('sha256').update(body, 'utf8').digest('base64')
    if (allowedScripts.has(hash)) used.add(hash)
    else problems.push(`${name}: an inline script the policy doesn't allow (sha256-${hash}): ${body.slice(0, 60)}`)
  }
  if (/<style\b/.test(html)) problems.push(`${name}: a <style> block (style-src is 'self' only)`)
  for (const [, attribute] of html.matchAll(/\s(style|on[a-z]+)="/g)) problems.push(`${name}: an inline ${attribute} attribute`)
  for (const [element, tag, url] of html.matchAll(/<(script|link|img|source|video|audio|iframe|embed|object)\b[^>]*?\s(?:src|href)="((?:https?:)?\/\/[^"]+)"[^>]*>/g)) {
    // <link rel="canonical"> and rel="alternate" point elsewhere without loading anything.
    if (tag === 'link' && !/\srel="(stylesheet|preload|modulepreload|icon|manifest)"/.test(element)) continue
    problems.push(`${name}: <${tag}> loads ${url} from another site`)
  }
}
// Stylesheets: a data: URL (an inlined font or image) is blocked by font-src and img-src 'self'.
for (const entry of await readdir(join(dist, 'assets'))) {
  if (!entry.endsWith('.css')) continue
  const css = await readFile(join(dist, 'assets', entry), 'utf8')
  for (const [found] of css.matchAll(/url\(\s*["']?data:[^,;)]{0,40}/g)) problems.push(`assets/${entry}: ${found}… (a data: URL the policy blocks)`)
  for (const [found] of css.matchAll(/url\(\s*["']?(?:https?:)?\/\/[^)]{0,60}/g)) problems.push(`assets/${entry}: ${found} (from another site)`)
}
for (const hash of allowedScripts) if (!used.has(hash)) problems.push(`the policy allows sha256-${hash}, which no page uses any more: remove it`)

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`check-csp: ${count} pages fit the policy (${allowedScripts.size} inline script by hash)`)
