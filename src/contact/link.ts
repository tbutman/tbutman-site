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
}

/** What the encoder takes: the app's contact card. Labels are optional. */
export type ContactInput = {
  name: string
  title?: string
  company?: string
  emails?: string[]
  phones?: { number: string; label?: string }[]
  links?: { url: string; label?: string }[]
}

export type Decoded =
  | { ok: true; contact: Contact }
  /** empty: no fragment. damaged: not a link Tilde makes. unsupported: a newer version. */
  | { ok: false; reason: 'empty' | 'damaged' | 'unsupported' }

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
} as const

// Kept as is in a value; every other byte is percent-encoded (UTF-8, upper-case hex). The set is
// fragment-safe in every browser, and leaves out the separators ; and , and the escape %.
const SAFE = /^[A-Za-z0-9\-._~!$&'()*+=:@/?]$/
// oxlint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/g
// Bidi embeddings, overrides and isolates: a name could use them to show text backwards.
const BIDI = /[\u202a-\u202e\u2066-\u2069]/g
const EMAIL = /^[A-Za-z0-9.!$'*+/=^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/
// A phone number: an optional +, then digits in groups separated by single spaces.
const PHONE = /^\+?[0-9]+( [0-9]+)*$/
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
const clean = (value: string | undefined) => (value ?? '').replace(CONTROL, ' ').trim()

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

function percentEncode(value: string): string {
  let out = ''
  for (const byte of new TextEncoder().encode(value)) {
    const char = String.fromCharCode(byte)
    out += byte < 0x80 && SAFE.test(char) ? char : `%${byte.toString(16).toUpperCase().padStart(2, '0')}`
  }
  return out
}

/** The contact link for a contact card. Fields over the limits are cut or left out, never refused. */
export function encodeContact(input: ContactInput): string {
  const fields: string[] = [VERSION]
  const add = (key: string, value: string) => fields.push(`${key}=${value}`)

  const name = truncate(clean(input.name), LIMITS.text)
  if (!name) throw new Error('A contact link needs a name')
  add('n', percentEncode(name))
  const title = truncate(clean(input.title), LIMITS.text)
  if (title) add('t', percentEncode(title))
  const company = truncate(clean(input.company), LIMITS.text)
  if (company) add('o', percentEncode(company))

  const emails = (input.emails ?? []).map(clean).filter((e) => EMAIL.test(e) && e.length <= LIMITS.email)
  for (const email of emails.slice(0, LIMITS.emails)) add('e', percentEncode(email))

  // Digits in the groups they were typed in ("+1 (555) 010-0199" → "+1 555 010 0199"): the page
  // shows the number as the owner wrote it, which is easier to check than a run of digits.
  const phones = (input.phones ?? [])
    .map((p) => ({ number: clean(p.number).replace(/[^0-9+]+/g, ' ').trim(), label: truncate(clean(p.label), LIMITS.label) }))
    .filter((p) => phoneOk(p.number))
  for (const p of phones.slice(0, LIMITS.phones)) add('p', percentEncode(p.number) + (p.label ? `,${percentEncode(p.label)}` : ''))

  const links = (input.links ?? [])
    .map((l) => ({ url: clean(l.url), label: truncate(clean(l.label), LIMITS.label) }))
    .filter((l) => /^https?:\/\/[^/?#]/i.test(l.url) && length(l.url) <= LIMITS.url)
  for (const l of links.slice(0, LIMITS.links)) {
    const url = l.url.replace(/^https:\/\//i, '')
    const label = l.label && l.label !== defaultLabel(l.url) ? `,${percentEncode(l.label)}` : ''
    add('u', percentEncode(url) + label)
  }
  return LINK_BASE + fields.join(';')
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
  value = value.replace(BIDI, '').trim()
  return value || null
}

function decodeLink(raw: string): string | null {
  if (length(raw) > LIMITS.url) return null
  const hasScheme = /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(raw)
  if (hasScheme && !/^https?:\/\//i.test(raw)) return null
  let url: URL
  try {
    url = new URL(hasScheme ? raw : `https://${raw}`)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null
  return url.href
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
  const host = parsed.host.replace(/^www\./, '')
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
    lines.push(`item${item}.URL:${link.url}`, `item${item}.X-ABLabel:${escapeText(link.label)}`)
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
 * fits, otherwise with details left out in the spec's order (labels, extra links, title, company,
 * extra emails and phones, the last link) until it does. Null when even the name with one email
 * and one phone doesn't fit. The app does this when writing a sticker; it lives here as the
 * reference its tests share.
 */
export function stickerLink(input: ContactInput, maxBytes: number): { url: string; dropped: string[] } | null {
  const c: Required<ContactInput> = {
    name: input.name,
    title: input.title ?? '',
    company: input.company ?? '',
    emails: [...(input.emails ?? [])],
    phones: (input.phones ?? []).map((p) => ({ ...p })),
    // A label the link wouldn't carry anyway (LinkedIn, Website) isn't something to drop.
    links: (input.links ?? []).map((l) => ({ url: l.url, label: l.label === defaultLabel(l.url) ? '' : l.label })),
  }
  const dropped: string[] = []
  const fits = () => uriRecordBytes(encodeContact(c)) <= maxBytes
  const steps: [string, () => boolean][] = [
    // Each step removes one thing and says whether there was anything to remove.
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
  return fits() ? { url: encodeContact(c), dropped } : null
}
