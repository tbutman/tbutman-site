import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { after, before, describe, it } from 'node:test'
import { createHandler, createRateLimiter, validate } from './server.mjs'

const good = { name: 'Ada Lovelace', email: 'ada@example.com', company: 'Engines Ltd', message: 'Hello, can we talk?' }

describe('validate', () => {
  it('accepts a complete message and normalizes whitespace', () => {
    const { errors, value } = validate({ ...good, name: '  Ada\nLovelace ' })
    assert.deepEqual(errors, [])
    assert.equal(value.name, 'Ada Lovelace')
  })

  it('rejects missing name, bad email and short message', () => {
    const { errors } = validate({ name: '', email: 'nope', message: 'hi' })
    assert.equal(errors.length, 3)
  })

  it('strips control characters but keeps newlines', () => {
    const { value } = validate({ ...good, message: 'line one\u0007\nline two' })
    assert.equal(value.message, 'line one\nline two')
  })

  it('rejects overlong fields', () => {
    const { errors } = validate({ ...good, message: 'x'.repeat(5001) })
    assert.ok(errors.some((e) => e.includes('message is too long')))
  })
})

describe('createRateLimiter', () => {
  it('allows five messages per client per hour', () => {
    let t = 0
    const allow = createRateLimiter(() => t)
    for (let i = 0; i < 5; i++) assert.equal(allow('a'), true)
    assert.equal(allow('a'), false)
    assert.equal(allow('b'), true)
    t += 60 * 60 * 1000 + 1
    assert.equal(allow('a'), true)
  })
})

describe('HTTP handler', () => {
  const sent = []
  let failSend = false
  let server
  let base

  before(async () => {
    const handler = createHandler({
      send: async (message) => {
        if (failSend) throw new Error('boom')
        sent.push(message)
      },
      allow: createRateLimiter(),
      log: () => {},
    })
    server = createServer(handler)
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    base = `http://127.0.0.1:${server.address().port}`
  })

  after(() => server.close())

  const postJson = (body, headers = {}) =>
    fetch(`${base}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })

  it('sends a valid JSON message', async () => {
    const response = await postJson(good)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { ok: true })
    assert.equal(sent.at(-1).email, 'ada@example.com')
  })

  it('redirects form posts to /thanks', async () => {
    const response = await fetch(`${base}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(good),
      redirect: 'manual',
    })
    assert.equal(response.status, 303)
    assert.equal(response.headers.get('location'), '/thanks')
  })

  it('silently drops honeypot submissions', async () => {
    const before = sent.length
    const response = await postJson({ ...good, website: 'http://spam.example' })
    assert.equal(response.status, 200)
    assert.equal(sent.length, before)
  })

  it('returns 400 with reasons for invalid input', async () => {
    const response = await postJson({ name: '', email: 'x', message: '' })
    assert.equal(response.status, 400)
    assert.match((await response.json()).error, /name is required/)
  })

  it('rate-limits by the Cloudflare client address', async () => {
    const headers = { 'CF-Connecting-IP': '203.0.113.9' }
    for (let i = 0; i < 5; i++) assert.equal((await postJson(good, headers)).status, 200)
    assert.equal((await postJson(good, headers)).status, 429)
  })

  it('rejects oversized bodies', async () => {
    const response = await postJson({ ...good, message: 'x'.repeat(20_000) })
    assert.equal(response.status, 413)
  })

  it('reports a failed send as 502', async () => {
    failSend = true
    const response = await postJson(good, { 'CF-Connecting-IP': '198.51.100.1' })
    failSend = false
    assert.equal(response.status, 502)
  })

  it('answers health checks and 404s other paths', async () => {
    assert.equal((await fetch(`${base}/healthz`)).status, 200)
    assert.equal((await fetch(`${base}/api/contact`)).status, 404)
  })
})
