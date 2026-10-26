// What a visitor must never read (visitor round 1, item 1: "no internal text on any page"): our
// drafts' gates, placeholders, questions for Thomas, and the names of the agents, briefs and findings
// that wrote the copy. scripts/prerender.mjs runs it on every Tilde page of every build, and the build
// stops on a leak. SITE_DRAFT=1 turns the stop into a warning, for a local preview while docs is
// mid-rewrite; CI never sets it, so nothing leaks to the live site.
//
// Two lists: LEAKS on every build, and RELEASE (things that are honest in a preview but not on the
// live site: a render older than its model, a MakerWorld stand-in) only when CI is set.

/** [name, pattern] pairs, each matched against a page's visible text and its alt and aria-label text. */
export const LEAKS = [
  ['a phone-test gate', /\[depends/i],
  ['a fallback note ("If T-… fails")', /\bIf T-[A-Z0-9]/],
  ['a [TBD]', /\[TBD/i],
  ['a question for Thomas', /\[Thomas/],
  ['a name to settle', /\[name TBD\]/i],
  ['a placeholder', /\[placeholder|PLACEHOLDER/],
  // Our agents by their names ("the card agent"), not the words in general: the case study says it
  // was built with AI coding agents.
  ['an agent', /\b(?:the|card|fob|app|docs|site|design|media|checker|booth|giveaway)\s+agents?\b/i],
  ['the coordinator', /\bcoordinator/i],
  ['an audit finding (F1–F18)', /\(F(?:[1-9]|1[0-8])\b|\bF(?:[1-9]|1[0-8])[,)]/],
  ['a note for us', /for us, not the page/i],
  ['a print-guide-only note', /not for ads/i],
  ['Google Play (not live: Thomas, October 26)', /on Google Play/i],
  ['"iPhone app coming soon" (Thomas, October 26)', /iPhone app coming soon/i],
  // No company voice on the Tilde pages (visitor round 2, item 13): "I" only in the mystery reveal and
  // the case study. "us" only in lower case, so "US quarter" and "US 5/16" washers" pass.
  ['"we", "our" or "us" (no company voice)', /\b(?:[Ww]e|[Oo]urs?|us)\b/],
]

export const RELEASE = [
  ['a render older than its model', /data-render-status=/],
  ['a MakerWorld stand-in', /MAKERWORLD-[A-Z]+-URL/],
]

/** What a visitor can read: the text between tags, and alt, title and aria-label values. No scripts or styles. */
export function readable(html) {
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  const attributes = [...body.matchAll(/\s(?:alt|title|aria-label|placeholder|content)="([^"]*)"/g)].map((m) => m[1])
  const text = body.replace(/<[^>]+>/g, ' ')
  return [text, ...attributes].join('\n').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
}

/** Each leak in a page's HTML: [what, the text around it]. `release` adds the RELEASE list. */
export function findLeaks(html, { release = false } = {}) {
  const found = []
  const text = readable(html)
  for (const [what, pattern] of LEAKS) {
    const m = text.match(pattern)
    if (m) found.push([what, text.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\s+/g, ' ').trim()])
  }
  if (release) {
    for (const [what, pattern] of RELEASE) {
      const m = html.match(pattern)
      if (m) found.push([what, html.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\s+/g, ' ').trim()])
    }
  }
  return found
}

/** The pages the guard reads: every Tilde page (the product pages, the hub, the app, privacy, the case study). */
export const guarded = (path) => /^\/(pt\/)?tilde(\/|$)|^\/work\/tilde$/.test(path)
