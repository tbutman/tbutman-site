// Looks up the newest Tilde release when the site builds, so the /tilde download button links
// straight to its APK and can show the version and size. Writes tilde-release.json, which
// vite.config.ts reads.
//
// Like deploy/deploy-site.sh, it asks github.com and never GitHub's REST API (see
// deploy/README.md): /releases/latest redirects to the newest tag, that release's asset list names
// the APK, and a HEAD request for the APK confirms it downloads and gives its size. If any step
// fails it writes null and the button links to the release page instead, so it never breaks.
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = 'tbutman/tilde'
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'tilde-release.json')

async function lookUp() {
  const latest = await fetch(`https://github.com/${REPO}/releases/latest`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(20_000),
  })
  const location = latest.headers.get('location') ?? ''
  if (latest.status !== 302) throw new Error(`github.com answered HTTP ${latest.status} for the latest release`)
  const tag = location.split('/releases/tag/')[1] ?? ''
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) throw new Error(`unexpected release tag: ${tag || location}`)

  const assets = await fetch(`https://github.com/${REPO}/releases/expanded_assets/${tag}`, {
    signal: AbortSignal.timeout(20_000),
  })
  if (!assets.ok) throw new Error(`github.com answered HTTP ${assets.status} for the assets of ${tag}`)
  const pattern = new RegExp(`/${REPO}/releases/download/${tag}/[^"/]+\\.apk`, 'g')
  const html = await assets.text()
  const apks = [...new Set(html.match(pattern))]
  if (apks.length !== 1) throw new Error(`expected one APK in ${tag}, found ${apks.length}`)

  const apk = `https://github.com${apks[0]}`
  const head = await fetch(apk, { method: 'HEAD', signal: AbortSignal.timeout(20_000) })
  const bytes = Number(head.headers.get('content-length'))
  if (!head.ok || !bytes) throw new Error(`the APK answered HTTP ${head.status} (${bytes} bytes): ${apk}`)

  // The APK's row also gives its SHA-256 and when it was uploaded (the App page shows both, visitor
  // round 1, item 9). Optional: without them the button still works.
  const row = html.match(/<li\b[\s\S]*?<\/li>/g)?.find((li) => li.includes(apks[0])) ?? ''
  const sha256 = row.match(/sha256:([0-9a-f]{64})/)?.[1] ?? null
  const date = row.match(/datetime="(\d{4}-\d{2}-\d{2})T/)?.[1] ?? null
  return { version: tag.slice(1), apk, bytes, sha256, date }
}

let release = null
try {
  release = await lookUp()
  console.log(`tilde-release: ${release.version}, ${release.apk} (${release.bytes} bytes, ${release.date ?? 'no date'}, sha256 ${release.sha256 ?? 'not listed'})`)
} catch (error) {
  console.warn(`tilde-release: ${error.message}; the download button will link to the release page`)
}
await writeFile(out, `${JSON.stringify(release, null, 2)}\n`)
