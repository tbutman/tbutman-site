// Prints the built /resume page to public/Thomas_Butman_Resume.pdf (and dist/) with headless
// Chrome, so the downloadable résumé always matches the site. Run after `npm run build`; commit the PDF.
//
// CHROME_PATH overrides the browser binary.
import { spawn } from 'node:child_process'
import { copyFile, mkdtemp, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const output = join(root, 'public', 'Thomas_Butman_Resume.pdf')
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const server = await preview({ root, preview: { port: 0, open: false }, logLevel: 'silent' })
const url = `${server.resolvedUrls.local[0]}resume`
const profileDir = await mkdtemp(join(tmpdir(), 'resume-pdf-'))

const sizeOf = (file) => stat(file).then((s) => s.size, () => 0)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

await rm(output, { force: true })
const browser = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--user-data-dir=${profileDir}`,
    '--virtual-time-budget=5000',
    `--print-to-pdf=${output}`,
    url,
  ],
  { stdio: 'ignore' },
)

// Chrome sometimes stays alive after writing the file, so wait for the size to settle instead of
// waiting for exit.
let size = 0
for (let attempt = 0; attempt < 60; attempt++) {
  await wait(500)
  const next = await sizeOf(output)
  if (next > 0 && next === size) break
  size = next
}
const exited = new Promise((resolve) => browser.once('exit', resolve))
browser.kill()
await exited
await server.close()
await rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })

if (!size) {
  console.error(`Failed to print ${url} to PDF`)
  process.exit(1)
}
await copyFile(output, join(root, 'dist', 'Thomas_Butman_Resume.pdf'))
console.log(`wrote public/Thomas_Butman_Resume.pdf (${Math.round(size / 1000)} kB)`)
