// Contact-form endpoint for the static site. nginx proxies POST /api/contact here; messages are
// emailed through Resend. No dependencies beyond Node itself.
//
// Environment:
//   RESEND_API_KEY   Resend API key (without it the endpoint answers 503)
//   CONTACT_TO       where messages are delivered
//   CONTACT_FROM     verified sender, e.g. "Website contact <contact@tbutman.com>"
//   PORT             default 3000
//   CONTACT_DRY_RUN  set to 1 in local development to log messages instead of emailing them
import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'

const MAX_BODY_BYTES = 16 * 1024
const LIMITS = { name: 100, email: 254, company: 120, message: 5000 }
const MIN_MESSAGE = 10
const PER_IP = { max: 5, windowMs: 60 * 60 * 1000 }
const GLOBAL = { max: 100, windowMs: 24 * 60 * 60 * 1000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Removes control characters except newlines and tabs, and trims.
const clean = (value) =>
  String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\P{Cc}\n\t]/gu, '')
    .trim()

const oneLine = (value) => value.replace(/\s+/g, ' ')

export function validate(fields) {
  const name = oneLine(clean(fields.name))
  const email = oneLine(clean(fields.email))
  const company = oneLine(clean(fields.company))
  const message = clean(fields.message)
  const errors = []
  if (!name) errors.push('name is required')
  if (!EMAIL_RE.test(email)) errors.push('a valid email address is required')
  if (message.length < MIN_MESSAGE) errors.push(`message must be at least ${MIN_MESSAGE} characters`)
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = { name, email, company, message }[key]
    if (value.length > max) errors.push(`${key} is too long`)
  }
  return { errors, value: { name, email, company, message } }
}

export function createRateLimiter(now = Date.now) {
  const hits = new Map()
  let global = []
  return function allow(key) {
    const t = now()
    global = global.filter((at) => t - at < GLOBAL.windowMs)
    const recent = (hits.get(key) ?? []).filter((at) => t - at < PER_IP.windowMs)
    if (recent.length >= PER_IP.max || global.length >= GLOBAL.max) {
      hits.set(key, recent)
      return false
    }
    recent.push(t)
    global.push(t)
    hits.set(key, recent)
    if (hits.size > 10_000) hits.clear()
    return true
  }
}

export async function sendWithResend({ apiKey, from, to }, message) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: message.email,
      subject: `New message from ${message.name} via tbutman.com`,
      text: [
        `Name: ${message.name}`,
        `Email: ${message.email}`,
        message.company ? `Company: ${message.company}` : null,
        '',
        message.message,
      ]
        .filter((line) => line !== null)
        .join('\n'),
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) {
    // Resend explains rejections (e.g. a malformed sender); its messages contain no secrets.
    const detail = await response
      .json()
      .then((body) => body?.message)
      .catch(() => undefined)
    throw new Error(`Resend responded ${response.status}${detail ? `: ${String(detail).slice(0, 200)}` : ''}`)
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        // Stop buffering but drain the rest, so the 413 reaches the client instead of a reset.
        req.removeAllListeners('data')
        req.resume()
        reject(Object.assign(new Error('body too large'), { status: 413 }))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function parseBody(raw, contentType) {
  if (contentType.startsWith('application/json')) return JSON.parse(raw || '{}')
  return Object.fromEntries(new URLSearchParams(raw))
}

/**
 * Builds the request handler. `send` delivers a validated message; `allow` rate-limits by client.
 */
export function createHandler({ send, allow = createRateLimiter(), log = console.log }) {
  return async function handle(req, res) {
    const contentType = String(req.headers['content-type'] ?? '')
    const wantsJson = contentType.startsWith('application/json')

    const reply = (status, body) => {
      if (status === 413) res.setHeader('Connection', 'close')
      if (wantsJson) {
        res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
        res.end(JSON.stringify(body))
      } else if (status === 200) {
        res.writeHead(303, { Location: '/thanks', 'Cache-Control': 'no-store' })
        res.end()
      } else {
        res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
        res.end(
          `<!doctype html><meta charset="utf-8"><title>Message not sent</title>` +
            `<p>Sorry, your message could not be sent: ${body.error}.</p>` +
            `<p><a href="/#contact">Back to the contact form</a></p>`,
        )
      }
    }

    if (req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('ok')
      return
    }
    if (req.url?.split('?')[0] !== '/api/contact' || req.method !== 'POST') {
      reply(404, { ok: false, error: 'not found' })
      return
    }

    let fields
    try {
      fields = parseBody(await readBody(req), contentType)
    } catch (error) {
      reply(error.status ?? 400, { ok: false, error: 'the request could not be read' })
      return
    }

    // Honeypot: real visitors never see or fill this field. Pretend success so bots move on.
    if (clean(fields.website)) {
      log('contact: honeypot triggered')
      reply(200, { ok: true })
      return
    }

    const { errors, value } = validate(fields)
    if (errors.length) {
      reply(400, { ok: false, error: errors.join(', ') })
      return
    }

    // Behind Cloudflare Tunnel every request arrives from cloudflared, so key on the visitor
    // address Cloudflare reports.
    const client = String(req.headers['cf-connecting-ip'] ?? req.socket.remoteAddress ?? 'unknown')
    if (!allow(client)) {
      reply(429, { ok: false, error: 'too many messages, please try again later or email me directly' })
      return
    }

    try {
      await send(value)
      log('contact: message sent')
      reply(200, { ok: true })
    } catch (error) {
      log(`contact: send failed: ${error.message}`)
      reply(502, { ok: false, error: 'the email service is unavailable, please email me directly' })
    }
  }
}

function main() {
  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM, CONTACT_DRY_RUN, PORT = '3000' } = process.env
  const configured = Boolean(RESEND_API_KEY && CONTACT_TO && CONTACT_FROM)
  const send = CONTACT_DRY_RUN
    ? async (message) => console.log('contact: dry run, would send', JSON.stringify(message))
    : configured
    ? (message) => sendWithResend({ apiKey: RESEND_API_KEY, from: CONTACT_FROM, to: CONTACT_TO }, message)
    : async () => {
        throw new Error('not configured')
      }
  const server = createServer(createHandler({ send }))
  server.listen(Number(PORT), () => {
    const mode = CONTACT_DRY_RUN ? ' (dry run: logging instead of emailing)' : configured ? '' : ' (not configured: sends will fail)'
    console.log(`contact: listening on ${PORT}${mode}`)
  })
  const stop = () => server.close(() => process.exit(0))
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()
