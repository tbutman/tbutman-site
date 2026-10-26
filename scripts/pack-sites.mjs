// One release for both sites (Thomas, October 26: taptilde.com as its own site, on the same server):
// taptilde.com's build (dist-tilde/) goes into tbutman.com's (dist/) as _taptilde/, so the release
// tarball, deploy/deploy-site.sh and a rollback cover both at once. nginx serves _taptilde/ only for
// taptilde.com, and 404s it on tbutman.com (deploy/nginx.conf). Runs last in npm run build.
import { cp, rm, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const from = join(root, 'dist-tilde')
const to = join(root, 'dist', '_taptilde')
await stat(join(from, 'index.html')).catch(() => {
  throw new Error('pack-sites: no dist-tilde/index.html: run npm run build:tilde first')
})
await rm(to, { recursive: true, force: true })
await cp(from, to, { recursive: true })
console.log('pack-sites: dist-tilde/ -> dist/_taptilde/')
