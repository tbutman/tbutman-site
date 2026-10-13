// The Tilde contact link (X1): a tap from Tilde's contact card carries
// https://taptilde.com/c#1;n=Jane%20Doe;…, and /tilde/c shows that contact with a Save contact
// button. The details live in the fragment, which browsers never send, so no server receives them.
//
// The format is specified in tilde-review/specs/x1-contact-link.md, and src/contact/vectors.json
// holds the test vectors the app shares. This file is the page's decoder and vCard builder, plus a
// reference encoder for the tests. Plain TypeScript with no DOM, so node --test runs it as is.

export type Phone = { number: string; label: string }
export type Link = { url: string; label: string }
export type Contact = {
  name: string
  title: string
  company: string
  emails: string[]
  phones: Phone[]
  links: Link[]
  /** The card face (contact page v2): the ~/handle without "~/", and the card's color. Present only when the link carries a valid one. */
  handle?: string
  color?: Color
}

/** What the encoder takes: the app's contact card. Labels are optional. */
export type ContactInput = {
  name: string
  title?: string
  company?: string
  emails?: string[]
  phones?: { number: string; label?: string }[]
  links?: { url: string; label?: string }[]
  /** The handle the card face shows, already cleaned by the app (Profile.cleanHandle). */
  handle?: string
  /** The card's color key. */
  color?: string
}

export type Decoded =
  | { ok: true; contact: Contact }
  /** empty: no fragment. damaged: not a link Tilde makes. unsupported: a newer version. */
  | { ok: false; reason: 'empty' | 'damaged' | 'unsupported' }

/** The app's card colors (Cards.COLOURS keys). The page maps each to its own token; amber is the default. */
export const COLORS = ['amber', 'sea', 'sky', 'iris', 'clay', 'moss'] as const
export type Color = (typeof COLORS)[number]
const isColor = (value: string): value is Color => (COLORS as readonly string[]).includes(value)

export const LINK_BASE = 'https://taptilde.com/c#'
export const VERSION = '1'

export const LIMITS = {
  /** The whole fragment, before decoding. Longer links are refused unread. */
  fragment: 2048,
  /** Name, title and company, in characters (code points). */
  text: 100,
  label: 40,
  email: 254,
  /** A phone number, with its spaces. */
  phone: 32,
  url: 512,
  emails: 3,
  phones: 5,
  links: 10,
  /** The handle, in characters (the app's HANDLE_MAX). */
  handle: 20,
} as const

// Kept as is in a value; every other byte is percent-encoded (UTF-8, upper-case hex). The set is
// fragment-safe in every browser, and leaves out the separators ; and , and the escape %.
const SAFE = /^[A-Za-z0-9\-._~!$&'()*+=:@/?]$/
// Control characters and the line and paragraph separators, which Apple's text APIs treat as line
// breaks: a value with one could add lines to the .vcf, or draw a fake line under a name.
// oxlint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g
// Removed from every value: bidi embeddings, overrides and isolates (a name could use them to show
// text backwards) and invisible format characters (soft hyphen, Arabic letter mark, zero-width
// space, LRM and RLM, word joiners, BOM), which can hide characters or leave a blank name. ZWNJ and
// ZWJ (U+200C, U+200D) stay: Persian, Indic scripts and emoji sequences need them.
const INVISIBLE = /[\u00ad\u061c\u200b\u200e\u200f\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff]/g
// At most 3 combining marks in a row: real text never needs more, and a stack of them draws over
// the lines around it.
const MARKS = /(\p{M}{3})\p{M}+/gu
// A value must have something to see, not just spaces, joiners and marks.
const VISIBLE = /[\p{L}\p{N}\p{P}\p{S}]/u
const EMAIL = /^[A-Za-z0-9.!$'*+/=^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/
// A phone number: an optional +, then digits in groups separated by single spaces.
const PHONE = /^\+?[0-9]+( [0-9]+)*$/
// The app's handle characters. Never percent-encoded, and nothing a page could misread.
const HANDLE = /^[a-z0-9._-]{1,20}$/
const phoneOk = (n: string) => PHONE.test(n) && n.replace(/[^0-9]/g, '').length >= 3 && n.length <= LIMITS.phone

/** Link labels the page works out from the address, so the link needn't carry them. */
const PLATFORMS: [string, string[]][] = [
  ['LinkedIn', ['linkedin.com', 'lnkd.in']],
  ['GitHub', ['github.com']],
  ['Instagram', ['instagram.com', 'instagr.am']],
  ['X', ['x.com', 'twitter.com']],
  ['Facebook', ['facebook.com', 'fb.com']],
  ['MakerWorld', ['makerworld.com']],
]

const length = (value: string) => [...value].length
const truncate = (value: string, max: number) => [...value].slice(0, max).join('').trim()

/** What every text value goes through, in the encoder and the decoder alike. */
const tidy = (value: string) => value.replace(INVISIBLE, '').replace(MARKS, '$1').trim()

/** The encoder's cleaning: control characters become spaces; "" when nothing visible is left. */
function clean(value: string | undefined): string {
  const tidied = tidy((value ?? '').replace(CONTROL, ' '))
  return VISIBLE.test(tidied) ? tidied : ''
}

/** The label a link gets when it carries none: the network's name, or "Website". */
export function defaultLabel(url: string): string {
  let host: string
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase()
  } catch {
    return 'Website'
  }
  const platform = PLATFORMS.find(([, hosts]) => hosts.some((h) => host === h || host.endsWith(`.${h}`)))
  return platform ? platform[0] : 'Website'
}

/**
 * A web link as both sides keep it: parsed and serialized by the WHATWG URL parser (lower-case
 * host, punycode, no default port, "/" for an empty path), or null when it isn't an http(s) link
 * with a host and without a user name or password, or is too long.
 */
function webLink(text: string): string | null {
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null
  return length(url.href) <= LIMITS.url ? url.href : null
}

/**
 * A phone number as the link carries it: digits in the groups they were typed in
 * ("+1 (555) 010-0199" → "+1 555 010 0199"), which is easier to check on the page than a run of
 * digits. An extension at the end is cut off; any other letter (a vanity number such as
 * "1-800-FLOWERS") leaves the number out rather than change it. Null when it isn't a number.
 */
function phoneNumber(text: string): string | null {
  const number = text.replace(/\s*(?:x|ext\.?|extension|ramal)\s*[0-9]+\s*$/i, '')
  if (/\p{L}/u.test(number)) return null
  const grouped = number.replace(/[^0-9+]+/g, ' ').trim()
  return phoneOk(grouped) ? grouped : null
}

function percentEncode(value: string): string {
  let out = ''
  for (const byte of new TextEncoder().encode(value)) {
    const char = String.fromCharCode(byte)
    out += byte < 0x80 && SAFE.test(char) ? char : `%${byte.toString(16).toUpperCase().padStart(2, '0')}`
  }
  return out
}

/**
 * A contact card as the link will carry it: cleaned, checked and capped by the spec's rules, with
 * link labels only where they differ from the default. Everything the encoder and stickerLink do
 * starts here, so nothing is counted that the link wouldn't carry.
 */
function normalize(input: ContactInput): Contact {
  const name = truncate(clean(input.name), LIMITS.text)
  if (!name) throw new Error('A contact link needs a name')
  return {
    name,
    title: truncate(clean(input.title), LIMITS.text),
    company: truncate(clean(input.company), LIMITS.text),
    emails: (input.emails ?? [])
      .map(clean)
      .filter((e) => EMAIL.test(e) && e.length <= LIMITS.email)
      .slice(0, LIMITS.emails),
    phones: (input.phones ?? [])
      .map((p) => ({ number: phoneNumber(clean(p.number)), label: truncate(clean(p.label), LIMITS.label) }))
      .filter((p): p is Phone => p.number !== null)
      .slice(0, LIMITS.phones),
    links: (input.links ?? [])
      .map((l) => {
        const url = webLink(clean(l.url))
        const label = truncate(clean(l.label), LIMITS.label)
        return { url, label: url && label !== defaultLabel(url) ? label : '' }
      })
      .filter((l): l is Link => l.url !== null)
      .slice(0, LIMITS.links),
    // The face fields are kept only as they are: the app cleans the handle first, and amber, the
    // default, is left out to save 8 bytes.
    ...(input.handle && HANDLE.test(input.handle) ? { handle: input.handle } : {}),
    ...(input.color && isColor(input.color) && input.color !== 'amber' ? { color: input.color } : {}),
  }
}

/** Writes a normalized contact as a link. */
function serialize(c: Contact): string {
  const fields: string[] = [VERSION, `n=${percentEncode(c.name)}`]
  if (c.title) fields.push(`t=${percentEncode(c.title)}`)
  if (c.company) fields.push(`o=${percentEncode(c.company)}`)
  for (const email of c.emails) fields.push(`e=${percentEncode(email)}`)
  for (const p of c.phones) fields.push(`p=${percentEncode(p.number)}${p.label ? `,${percentEncode(p.label)}` : ''}`)
  for (const l of c.links) fields.push(`u=${percentEncode(l.url.replace(/^https:\/\//, ''))}${l.label ? `,${percentEncode(l.label)}` : ''}`)
  // Last, so everything a page without the card face reads keeps its bytes, and a sticker drops them first.
  if (c.handle) fields.push(`h=${c.handle}`)
  if (c.color) fields.push(`c=${c.color}`)
  return LINK_BASE + fields.join(';')
}

/** The contact link for a contact card. Fields over the limits are cut or left out, never refused. */
export function encodeContact(input: ContactInput): string {
  return serialize(normalize(input))
}

class Damaged extends Error {}

function decodeValue(raw: string): string | null {
  let value: string
  try {
    value = decodeURIComponent(raw)
  } catch {
    // A broken escape or bytes that aren't UTF-8: not something Tilde wrote.
    throw new Damaged()
  }
  CONTROL.lastIndex = 0
  if (CONTROL.test(value)) return null
  value = tidy(value)
  return VISIBLE.test(value) ? value : null
}

function decodeLink(raw: string): string | null {
  if (length(raw) > LIMITS.url) return null
  const hasScheme = /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(raw)
  if (hasScheme && !/^https?:\/\//i.test(raw)) return null
  return webLink(hasScheme ? raw : `https://${raw}`)
}

/** Reads a contact link's fragment (with or without the #). Never throws. */
export function decodeFragment(hash: string): Decoded {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (raw === '') return { ok: false, reason: 'empty' }
  if (raw.length > LIMITS.fragment) return { ok: false, reason: 'damaged' }
  const [version, ...tokens] = raw.split(';')
  if (!/^[1-9][0-9]{0,2}$/.test(version)) return { ok: false, reason: 'damaged' }
  if (version !== VERSION) return { ok: false, reason: 'unsupported' }

  const contact: Contact = { name: '', title: '', company: '', emails: [], phones: [], links: [] }
  try {
    for (const token of tokens) {
      const eq = token.indexOf('=')
      if (eq !== 1) continue // empty tokens, no "=", or keys that aren't one letter
      const key = token[0]
      const body = token.slice(2)
      // Phones and links carry an optional label after the first comma.
      const comma = body.indexOf(',')
      const main = comma < 0 ? body : body.slice(0, comma)
      const label = () => (comma < 0 ? '' : decodeValue(body.slice(comma + 1)) ?? '')
      switch (key) {
        case 'n':
        case 't':
        case 'o': {
          const field = key === 'n' ? 'name' : key === 't' ? 'title' : 'company'
          const value = decodeValue(body)
          if (value && !contact[field] && length(value) <= LIMITS.text) contact[field] = value
          break
        }
        case 'e': {
          const value = decodeValue(body)
          if (value && EMAIL.test(value) && value.length <= LIMITS.email && contact.emails.length < LIMITS.emails) contact.emails.push(value)
          break
        }
        case 'p': {
          const number = decodeValue(main)
          const text = label()
          if (number && phoneOk(number) && length(text) <= LIMITS.label && contact.phones.length < LIMITS.phones) {
            contact.phones.push({ number, label: text })
          }
          break
        }
        case 'u': {
          const value = decodeValue(main)
          const url = value && decodeLink(value)
          const text = label()
          if (url && length(text) <= LIMITS.label && contact.links.length < LIMITS.links) {
            contact.links.push({ url, label: text || defaultLabel(url) })
          }
          break
        }
        case 'h': {
          // Exactly the app's handle characters, never cleaned or guessed: anything else is skipped.
          const value = decodeValue(body)
          if (value && contact.handle === undefined && HANDLE.test(value)) contact.handle = value
          break
        }
        case 'c': {
          // One of the six names, exact and lower case: the page never takes a color from the link.
          const value = decodeValue(body)
          if (value && contact.color === undefined && isColor(value)) contact.color = value
          break
        }
        default:
          // A field from a later version of v1: skipped, so old pages still read new links.
          break
      }
    }
  } catch (error) {
    if (error instanceof Damaged) return { ok: false, reason: 'damaged' }
    throw error
  }
  if (!contact.name) return { ok: false, reason: 'damaged' }
  return { ok: true, contact }
}

/** A link as the page shows it: no https://, www. or lone trailing slash. */
export function displayAddress(url: string): string {
  const parsed = new URL(url)
  // "www." goes only when a domain with a dot is left: www.com stays www.com.
  const host = /^www\.[^.]+\./.test(parsed.host) ? parsed.host.slice(4) : parsed.host
  const rest = `${parsed.pathname}${parsed.search}${parsed.hash}`
  return (parsed.protocol === 'http:' ? 'http://' : '') + host + (rest === '/' ? '' : rest)
}

function escapeText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1')
}

// Lines longer than 75 octets continue on the next line after a space (RFC 2425), never inside
// a character.
function fold(line: string) {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let part = ''
  for (const char of line) {
    if (encoder.encode(part + char).length > 75) {
      parts.push(part)
      part = ' '
    }
    part += char
  }
  parts.push(part)
  return parts.join('\r\n')
}

/** vCard 3.0, laid out like the app's own (Profile.vcard), which iOS and Android both import. */
export function vcard(contact: Contact): string {
  const name = contact.name
  const first = name.split(' ')[0]
  const last = name.includes(' ') ? name.slice(name.indexOf(' ') + 1) : ''
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeText(last)};${escapeText(first)};;;`, `FN:${escapeText(name)}`]
  if (contact.company) lines.push(`ORG:${escapeText(contact.company)}`)
  if (contact.title) lines.push(`TITLE:${escapeText(contact.title)}`)
  for (const email of contact.emails) lines.push(`EMAIL;TYPE=INTERNET:${email}`)
  let item = 0
  for (const phone of contact.phones) {
    item++
    lines.push(`item${item}.TEL;TYPE=CELL:${phone.number}`)
    if (phone.label) lines.push(`item${item}.X-ABLabel:${escapeText(phone.label)}`)
  }
  for (const link of contact.links) {
    item++
    // A backslash, which lenient parsers read as an escape, goes in percent-encoded.
    lines.push(`item${item}.URL:${link.url.replace(/\\/g, '%5C')}`, `item${item}.X-ABLabel:${escapeText(link.label)}`)
  }
  lines.push('END:VCARD')
  return lines.map(fold).join('\r\n') + '\r\n'
}

/** "Jane Doe.vcf": the name without characters file systems refuse. */
export function vcardFileName(contact: Contact): string {
  const base = truncate(contact.name.replace(/[\\/:*?"<>|.]/g, ''), 60)
  return `${base || 'contact'}.vcf`
}

/** Bytes of the NDEF URI record for a link (https:// is the 1-byte prefix code 4). */
export function uriRecordBytes(url: string): number {
  const payload = 1 + new TextEncoder().encode(url.replace(/^https:\/\//, '')).length
  return (payload <= 255 ? 4 : 7) + payload
}

/**
 * The link for a sticker with room for `maxBytes` of NDEF message: the whole contact card when it
 * fits, otherwise with details left out in the spec's order (the card's color and handle, which are
 * only its look, then labels, extra links, title, company, extra emails and phones, the last link)
 * until it does. Null when even the name with one email
 * and one phone doesn't fit. The app does this when writing a sticker; it lives here as the
 * reference its tests share.
 */
export function stickerLink(input: ContactInput, maxBytes: number): { url: string; dropped: string[] } | null {
  // Only what the link would carry: an invalid email or a default label isn't something to drop,
  // and an invalid email can't take the place of a valid one.
  const c = normalize(input)
  const dropped: string[] = []
  const fits = () => uriRecordBytes(serialize(c)) <= maxBytes
  const steps: [string, () => boolean][] = [
    // Each step removes one thing and says whether there was anything to remove.
    ['color', () => c.color !== undefined && delete c.color],
    ['handle', () => c.handle !== undefined && delete c.handle],
    ['label', () => {
      const labeled = [...c.phones, ...c.links].reverse().find((x) => x.label)
      if (labeled) labeled.label = ''
      return labeled !== undefined
    }],
    ['link', () => c.links.length > 1 && c.links.pop() !== undefined],
    ['title', () => c.title !== '' && (c.title = '') === ''],
    ['company', () => c.company !== '' && (c.company = '') === ''],
    ['email', () => c.emails.length > 1 && c.emails.pop() !== undefined],
    ['phone', () => c.phones.length > 1 && c.phones.pop() !== undefined],
    ['link', () => c.links.length > 0 && c.links.pop() !== undefined],
  ]
  for (const [what, step] of steps) {
    while (!fits() && step()) dropped.push(what)
  }
  return fits() ? { url: serialize(c), dropped } : null
}
