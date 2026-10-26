// The leak guard (scripts/leak-guard.mjs): visitor round 1's quotes are caught, real copy isn't.
// Run with `npm test`.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findLeaks, guarded, readable } from './leak-guard.mjs'

const leaks = (text, options) => findLeaks(`<main><p>${text}</p></main>`, options).map(([what]) => what)

test('every quote from visitor round 1 is caught', () => {
  for (const quote of [
    '[depends on T1–T4]',
    'If T-S1 or T-S2 fail, this step goes',
    '[TBD] render: product-home',
    '(Where on each phone to hold it is open question 5 below, for us, not the page.)',
    'The card agent is changing the tap row’s printed default',
    'about 6 mm (F16, the coordinator’s call)',
    'Print guide only (not for ads): about 53 min',
    '[Thomas: which listings go public]',
    'Get Tilde on Google Play',
    'iPhone app coming soon',
    'https://makerworld.com/en/models/PLACEHOLDER-tilde-card',
  ]) {
    assert.notDeepEqual(leaks(quote), [], quote)
  }
})

test('real copy passes', () => {
  for (const line of [
    'Tap or scan. Any phone reads it; the app writes it.',
    'Android only for now; your iPhone reads every tag.',
    'Formula 1 fans: F1 2026 tickets',
    'A tag’s size follows its link: 28.8 × 35.3 mm.',
    'Tilde for Android writes your link or your contact card through the plastic.',
    'I built it with AI coding agents, using the process on the how-i-work page.',
  ]) {
    assert.deepEqual(leaks(line), [], line)
  }
})

test('alt text and descriptions count; scripts and styles don’t', () => {
  assert.deepEqual(findLeaks('<img alt="[TBD] alt text for 06.png" />').map(([what]) => what), ['a [TBD]'])
  assert.deepEqual(findLeaks('<script>if(x)"[depends"</script><style>.agent{}</style><p>ok</p>'), [])
  assert.match(readable('<p>a &amp; b</p>'), /a & b/)
})

test('a stale render and a MakerWorld stand-in stop only the release build', () => {
  const html = '<img data-render-status="stale" /><p>MAKERWORLD-CARD-URL</p>'
  assert.deepEqual(findLeaks(html), [])
  assert.deepEqual(
    findLeaks(html, { release: true }).map(([what]) => what),
    ['a render older than its model', 'a MakerWorld stand-in'],
  )
})

test('the guarded pages: every Tilde page and the case study', () => {
  for (const path of ['/tilde', '/tilde/card', '/pt/tilde/card', '/tilde/home', '/tilde/privacy', '/work/tilde']) assert.ok(guarded(path), path)
  for (const path of ['/', '/resume', '/how-i-work', '/work/trails', '/tildes']) assert.ok(!guarded(path), path)
})
