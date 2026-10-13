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
  /** Each email's label, in the same order: present only when at least one email has one. */
  emailLabels?: EmailLabel[]
  phones: Phone[]
  links: Link[]
  /** The card face (contact page v2): the ~/handle without "~/", and the card's color. Present only when the link carries a valid one. */
  handle?: string
  color?: Color
  /** The line under the name on the card face (design §17 rec. 8), in place of title and company. Present only when the link carries one. */
  line?: string
}

/** What the encoder takes: the app's contact card. Labels are optional. */
export type ContactInput = {
  name: string
  title?: string
  company?: string
  emails?: string[]
  /** Each email's label key, in the same order: "work", "home" or "" (the app's Profile.emailLabels). */
  emailLabels?: string[]
  phones?: { number: string; label?: string }[]
  links?: { url: string; label?: string }[]
  /** The handle the card face shows, already cleaned by the app (Profile.cleanHandle). */
  handle?: string
  /** The card's color key. */
  color?: string
  /** The line the owner typed under their name (the app's Profile.line); empty or left out when none. */
  line?: string
}

export type Decoded =
  | { ok: true; contact: Contact }
  /** empty: no fragment. damaged: not a link Tilde makes. unsupported: a newer version. */
  | { ok: false; reason: 'empty' | 'damaged' | 'unsupported' }

/** The app's card colors (Cards.COLOURS keys). The page maps each to its own token; amber is the default. */
export const COLORS = ['amber', 'sea', 'sky', 'iris', 'clay', 'moss'] as const
export type Color = (typeof COLORS)[number]
const isColor = (value: string): value is Color => (COLORS as readonly string[]).includes(value)

/**
 * An email's label (design rec. 9): one of two fixed keys, never free text, which the vCard turns
 * into TYPE=WORK or TYPE=HOME and each phone shows in its own language. "" is no label.
 */
export type EmailLabel = '' | 'work' | 'home'
const emailLabel = (key: string | undefined): EmailLabel => (key === 'work' || key === 'home' ? key : '')

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
  /** The line under the name (the app's Profile.line). */
  line: 40,
} as const

// Kept as is in a value; every other byte is percent-encoded (UTF-8, upper-case hex). The set is
// fragment-safe in every browser, and leaves out the separators ; and , and the escape %.
const SAFE = /^[A-Za-z0-9\-._~!$&'()*+=:@/?]$/
// Control characters and the line and paragraph separators, which Apple's text APIs treat as line
// breaks: a value with one could add lines to the .vcf, or draw a fake line under a name.
// oxlint-disable-next-line no-control-regex -- matching control characters is the point
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g
// Removed from every value: every format character (\p{Cf}: bidi embeddings, overrides and
// isolates, which could show a name backwards; soft hyphen, zero-width space, LRM and RLM, word
// joiners, BOM, the Mongolian vowel separator, interlinear annotations, tag characters, which can
// hide letters), and the Hangul fillers, letters that draw nothing. Kept: ZWNJ and ZWJ (U+200C,
// U+200D), which Persian, Indic scripts and emoji sequences need, and the tag characters inside an
// emoji flag (U+1F3F4, tags, U+E007F), such as Scotland's.
const INVISIBLE = /(\u{1f3f4}[\u{e0020}-\u{e007e}]+\u{e007f})|(?![\u200c\u200d])[\p{Cf}\u115f\u1160\u3164\uffa0]/gu
// At most 3 combining marks per character: real text never needs more, and a stack of them draws
// over the lines around it. Joiners between the marks don't start a new character, and what's
// dropped starts with a mark, so a second pass changes nothing.
const MARKS = /((?:\p{M}[\u200c\u200d]*){3})(?:\p{M}[\u200c\u200d]*)+/gu
// A value must have something to see, not just spaces, joiners, marks and blanks. The braille
// blank (U+2800) stays in a value but doesn't count.
const VISIBLE = /[\p{L}\p{N}\p{P}\p{S}]/u
const isVisible = (value: string) => VISIBLE.test(value.replace(/\u2800/g, ''))
// Hosts on which the two IDNA standards disagree: UTS #46 (the WHATWG parser, the page) keeps ß
// and final sigma and gives xn--strae-oqa.de, while IDNA2003 (java.net.IDN, the app) maps them to
// strasse.de and σ, someone else's domain. Links on such hosts are left out on both sides.
const DEVIATION = /[\u00df\u03c2\u200c\u200d]/u
const EMAIL = /^[A-Za-z0-9.!$'*+/=^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/
// A phone number: an optional +, then digits in groups separated by single spaces.
const PHONE = /^\+?[0-9]+( [0-9]+)*$/
// The app's handle characters. Never percent-encoded, and nothing a page could misread.
const HANDLE = /^[a-z0-9._-]{1,20}$/
const phoneOk = (n: string) => PHONE.test(n) && n.replace(/[^0-9]/g, '').length >= 3 && n.length <= LIMITS.phone
// The app's own phone labels (Countries.isAutoLabel): "mobile" for one number, "mobile (US)" when
// there are several. Anything else was typed by the owner.
export const AUTO_PHONE_LABEL = /^mobile( \([A-Z]{2}\))?$/

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
const tidy = (value: string) =>
  value
    .replace(INVISIBLE, (_, flag: string | undefined) => flag ?? '')
    .replace(MARKS, '$1')
    .trim()

/** The encoder's cleaning: control characters become spaces; "" when nothing visible is left. */
function clean(value: string | undefined): string {
  const tidied = tidy((value ?? '').replace(CONTROL, ' '))
  return isVisible(tidied) ? tidied : ''
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

// A domain written in a label: labels of letters, digits and inner hyphens, each followed by a dot,
// then a top-level label that starts with a letter and has two characters or more.
const CLAIMED_HOST = /(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+\p{L}[\p{L}\p{N}-]+/gu

// Marks a reader takes for a dot between two words (after NFKC, which already folds the fullwidth,
// small and one-dot-leader dots): 。 ｡ ꓸ · · ‧ ∙ ⋅ ・ ܁ ۔ ⸱ ⸼ ᛫ ᐧ ˙ ։ ¸.
const LOOKALIKE_DOT = /[\u3002\uff61\ua4f8\u00b7\u0387\u2027\u2219\u22c5\u30fb\u0701\u06d4\u2e31\u2e3c\u16eb\u1427\u02d9\u0589\u00b8]/g

// Any other non-ASCII punctuation mark (\p{Po}) between two letters or digits, which can pass for a
// dot too (checker V3-S1: ܂ ⸳ ་ • ⸰ ꓿), so the list above needn't be complete. Not the ideographic
// and Arabic commas 、 and ، ("東京、大阪" isn't a domain); the fullwidth comma is ASCII after NFKC.
const PUNCTUATION_DOT = /(?<=[\p{L}\p{N}])(?![\p{ASCII}\u3001\u060c])\p{Po}(?=[\p{L}\p{N}])/gu

/**
 * Whether a link's label poses as another site (design rec. 4, checker R8-S5): it names a domain
 * that isn't the link's host or a parent of it ("paypal.com" over evil.example, also written with
 * look-alike dots, a space before the dot, or other words around it), or it's one of the page's
 * network names over another host ("GitHub" over evil.example). The decoder then gives the link its
 * default label, so the row and the .vcf name one domain, the real one. Kept: a label naming the
 * link's own host or a parent ("janedoe.com" over blog.janedoe.com) and names without a dot
 * ("PayPal").
 */
function posesAsOtherHost(label: string, url: string): boolean {
  const host = new URL(url).hostname.replace(/^www\./, '')
  // Invisible characters go (checker V3-M1: a variation selector or ZWJ before the dot), dot-like
  // marks become dots (middle dots, ideographic and Lisu dots, and other punctuation between
  // letters), and blanks before a dot go. The dots fold before NFKC too, which turns ˙ and ¸ into a
  // space and a combining mark.
  const text = label
    .replace(LOOKALIKE_DOT, '.')
    .normalize('NFKC')
    .replace(/\p{DI}/gu, '')
    .replace(LOOKALIKE_DOT, '.')
    .replace(PUNCTUATION_DOT, '.')
    .replace(/[\s\u2800]+\./g, '.')
    .toLowerCase()
  for (const [claimed] of text.matchAll(CLAIMED_HOST)) {
    let named: string
    try {
      named = new URL(`https://${claimed}/`).hostname.replace(/^www\./, '')
    } catch {
      return true
    }
    if (named !== host && !host.endsWith(`.${named}`)) return true
  }
  const bare = text.replace(/[^\p{L}\p{N}]/gu, '')
  const platform = PLATFORMS.find(([name]) => name.toLowerCase() === (bare === 'twitter' ? 'x' : bare))
  return platform !== undefined && defaultLabel(url) !== platform[0]
}

/**
 * A web link as both sides keep it: parsed and serialized by the WHATWG URL parser (lower-case
 * host, punycode, no default port, "/" for an empty path), or null when it isn't an http(s) link
 * with a host and without a user name or password, is too long, or has a host with ß, ς, ZWNJ or
 * ZWJ (DEVIATION).
 */
function webLink(text: string): string | null {
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return null
  }
  // The host as written, percent-decoded as the parser does, before it became punycode.
  const authority = text.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#\\]*)/i)?.[1] ?? ''
  let host = authority.slice(authority.lastIndexOf('@') + 1)
  try {
    host = decodeURIComponent(host)
  } catch {
    return null
  }
  if (DEVIATION.test(host)) return null
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
  const line = truncate(clean(input.line), LIMITS.line)
  const emails = (input.emails ?? [])
    .map((email, i) => ({ address: clean(email), label: emailLabel(input.emailLabels?.[i]) }))
    .filter((e) => EMAIL.test(e.address) && e.address.length <= LIMITS.email)
    .slice(0, LIMITS.emails)
  return {
    name,
    title: truncate(clean(input.title), LIMITS.text),
    company: truncate(clean(input.company), LIMITS.text),
    emails: emails.map((e) => e.address),
    ...(emails.some((e) => e.label) ? { emailLabels: emails.map((e) => e.label) } : {}),
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
    // Only when typed: the app never sends a line made from the title and company.
    ...(line ? { line } : {}),
  }
}

/** Writes a normalized contact as a link. */
function serialize(c: Contact): string {
  const fields: string[] = [VERSION, `n=${percentEncode(c.name)}`]
  if (c.title) fields.push(`t=${percentEncode(c.title)}`)
  if (c.company) fields.push(`o=${percentEncode(c.company)}`)
  c.emails.forEach((email, i) => fields.push(`e=${percentEncode(email)}${c.emailLabels?.[i] ? `,${c.emailLabels[i]}` : ''}`))
  for (const p of c.phones) fields.push(`p=${percentEncode(p.number)}${p.label ? `,${percentEncode(p.label)}` : ''}`)
  for (const l of c.links) fields.push(`u=${percentEncode(l.url.replace(/^https:\/\//, ''))}${l.label ? `,${percentEncode(l.label)}` : ''}`)
  // Last, so everything a page without the card face reads keeps its bytes, and a sticker drops them
  // first (the line, then the color and the handle).
  if (c.handle) fields.push(`h=${c.handle}`)
  if (c.color) fields.push(`c=${c.color}`)
  if (c.line) fields.push(`l=${percentEncode(c.line)}`)
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
  return isVisible(value) ? value : null
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
  const emailLabels: EmailLabel[] = []
  try {
    for (const token of tokens) {
      const eq = token.indexOf('=')
      if (eq !== 1) continue // empty tokens, no "=", or keys that aren't one letter
      const key = token[0]
      const body = token.slice(2)
      // Emails, phones and links carry an optional label after the first comma, which none of
      // their values can contain.
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
          // The label must be one of the two keys, exactly; anything else is ignored and the
          // address kept.
          const address = decodeValue(main)
          const key = emailLabel(label())
          if (address && EMAIL.test(address) && address.length <= LIMITS.email && contact.emails.length < LIMITS.emails) {
            contact.emails.push(address)
            emailLabels.push(key)
          }
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
            contact.links.push({ url, label: text && !posesAsOtherHost(text, url) ? text : defaultLabel(url) })
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
        case 'l': {
          // Cleaned like a title, and never in the .vcf: it's how the card looks, not the contact.
          const value = decodeValue(body)
          if (value && contact.line === undefined && length(value) <= LIMITS.line) contact.line = value
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
  if (!emailLabels.some(Boolean)) return { ok: true, contact }
  const { name, title, company, emails, ...rest } = contact
  return { ok: true, contact: { name, title, company, emails, emailLabels, ...rest } }
}

/**
 * One punycode label ("bcher-kva") as Unicode ("bücher"), by RFC 3492. Throws on anything that
 * isn't valid punycode; the caller then keeps the punycode (checker R8-S6).
 */
function punyDecode(input: string): string {
  const base = 36
  const tMin = 1
  const tMax = 26
  const out: number[] = []
  let i = 0
  let n = 128
  let bias = 72
  const dash = input.lastIndexOf('-')
  for (let j = 0; j < Math.max(dash, 0); j++) out.push(input.charCodeAt(j))
  for (let k = dash > 0 ? dash + 1 : 0; k < input.length; ) {
    const old = i
    for (let w = 1, x = base; ; x += base) {
      if (k >= input.length) throw new Error('punycode ends mid-number')
      const c = input.charCodeAt(k++)
      const digit = c >= 48 && c <= 57 ? c - 22 : c >= 97 && c <= 122 ? c - 97 : base
      if (digit >= base) throw new Error('not a punycode digit')
      i += digit * w
      const t = x <= bias ? tMin : x >= bias + tMax ? tMax : x - bias
      if (digit < t) break
      w *= base - t
    }
    const count = out.length + 1
    let delta = old === 0 ? Math.floor((i - old) / 700) : (i - old) >> 1
    delta += Math.floor(delta / count)
    let kk = 0
    for (; delta > ((base - tMin) * tMax) >> 1; kk += base) delta = Math.floor(delta / (base - tMin))
    bias = Math.floor(kk + ((base - tMin + 1) * delta) / (delta + 38))
    n += Math.floor(i / count)
    i %= count
    if (n > 0x10ffff || out.length > 63) throw new Error('not a host label')
    out.splice(i++, 0, n)
  }
  return String.fromCodePoint(...out)
}

// Hosts shown as written (design rec. 3): ASCII letters, digits, dots and hyphens, plus the Latin-1
// and Latin Extended-A letters, without ÷ and without the ones that pass for ASCII letters (checker
// R8-S6, C14): dotless ı (U+0131), kra ĸ (U+0138), Ŀ and ŀ (U+013F, U+0140), ŉ (U+0149), and eth ð
// and thorn þ (U+00F0, U+00FE), which pass for d and p ("þaypal.com", "ðropbox.com"). Any other
// letter, such as a Cyrillic "а" in "аpple.com", keeps the whole host in punycode.
const LATIN_HOST = /^[a-z0-9.\-\u00e0-\u00ef\u00f1-\u00f6\u00f8-\u00fd\u00ff\u0100-\u0130\u0132-\u0137\u0139-\u013e\u0141-\u0148\u014a-\u017e]+$/

/** A host as the page shows it: international domains in Latin script as written, the rest as parsed. */
function displayHost(hostname: string): string {
  if (!hostname.split('.').some((label) => label.startsWith('xn--'))) return hostname
  try {
    const unicode = hostname
      .split('.')
      .map((label) => (label.startsWith('xn--') ? punyDecode(label.slice(4)) : label))
      .join('.')
    // Shown as written only when it's Latin and the parser turns it back into the same host.
    return LATIN_HOST.test(unicode) && new URL(`https://${unicode}/`).hostname === hostname ? unicode : hostname
  } catch {
    return hostname
  }
}

/**
 * A link as the page shows it, in two parts (design rec. 2): where it goes ("http://" if it isn't
 * https, then the host without "www.", and a port), and the rest of the address, in full. No lone
 * trailing slash.
 */
export function addressParts(url: string): { host: string; rest: string } {
  const parsed = new URL(url)
  // "www." goes only when a domain with a dot is left: www.com stays www.com.
  const hostname = displayHost(/^www\.[^.]+\./.test(parsed.hostname) ? parsed.hostname.slice(4) : parsed.hostname)
  const rest = `${parsed.pathname}${parsed.search}${parsed.hash}`
  return {
    host: (parsed.protocol === 'http:' ? 'http://' : '') + hostname + (parsed.port ? `:${parsed.port}` : ''),
    rest: rest === '/' ? '' : rest,
  }
}

/** A link as the page shows it: no https://, www. or lone trailing slash. */
export function displayAddress(url: string): string {
  const { host, rest } = addressParts(url)
  return host + rest
}

/** A decoded phone number's tel: link: its digits and +, without the spaces (design rec. 1). */
export function telHref(number: string): string | null {
  const digits = number.replace(/ /g, '')
  return phoneOk(number) && /^\+?[0-9]+$/.test(digits) ? `tel:${digits}` : null
}

/** A decoded email's mailto: link. EMAIL allows no ?, &, #, % or comma, so no subject, copy or body. */
export function mailtoHref(address: string): string | null {
  return EMAIL.test(address) && address.length <= LIMITS.email ? `mailto:${address}` : null
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

export type VcardOptions = {
  /** The page's word for the app's "mobile", for "mobile (US)": "mobile" (the default) or "telemóvel". */
  mobile?: string
  /** A NOTE, such as "Saved from a Tilde link on October 13, 2026" (design rec. 10). */
  note?: string
}

/**
 * vCard 3.0, laid out like the app's own (Profile.vcard), which iOS and Android both import. The
 * phone's own words win where they exist (design recs. 7 to 9): the app's "mobile" is TYPE=CELL
 * alone and the default "Website" label is left out, so Contacts shows its own words in its own
 * language; emails get TYPE=WORK or HOME from their label, and with two or more, the first is PREF.
 */
export function vcard(contact: Contact, options: VcardOptions = {}): string {
  const name = contact.name
  const first = name.split(' ')[0]
  const last = name.includes(' ') ? name.slice(name.indexOf(' ') + 1) : ''
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeText(last)};${escapeText(first)};;;`, `FN:${escapeText(name)}`]
  if (contact.company) lines.push(`ORG:${escapeText(contact.company)}`)
  if (contact.title) lines.push(`TITLE:${escapeText(contact.title)}`)
  contact.emails.forEach((email, i) => {
    const label = contact.emailLabels?.[i]
    const types = ['INTERNET', ...(label ? [label.toUpperCase()] : []), ...(i === 0 && contact.emails.length > 1 ? ['PREF'] : [])]
    lines.push(`EMAIL;TYPE=${types.join(',')}:${email}`)
  })
  let item = 0
  for (const phone of contact.phones) {
    item++
    lines.push(`item${item}.TEL;TYPE=CELL:${phone.number}`)
    const country = phone.label.match(AUTO_PHONE_LABEL)?.[1]
    const label = AUTO_PHONE_LABEL.test(phone.label) ? (country ? `${options.mobile ?? 'mobile'}${country}` : '') : phone.label
    if (label) lines.push(`item${item}.X-ABLabel:${escapeText(label)}`)
  }
  for (const link of contact.links) {
    item++
    // A backslash, which lenient parsers read as an escape, goes in percent-encoded.
    lines.push(`item${item}.URL:${link.url.replace(/\\/g, '%5C')}`)
    if (link.label !== 'Website') lines.push(`item${item}.X-ABLabel:${escapeText(link.label)}`)
  }
  if (options.note) lines.push(`NOTE:${escapeText(options.note)}`)
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
 * fits, otherwise with details left out in the spec's order (the card's line, color and handle, which
 * are only its look, then labels, extra links, title, company, extra emails and phones, the last link)
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
  const labels = c.emailLabels ?? []
  const steps: [string, () => boolean][] = [
    // Each step removes one thing and says whether there was anything to remove.
    ['line', () => c.line !== undefined && delete c.line],
    ['color', () => c.color !== undefined && delete c.color],
    ['handle', () => c.handle !== undefined && delete c.handle],
    // Labels from the end of the link: links', then phones', then emails'.
    ['label', () => {
      const labeled = [...c.phones, ...c.links].reverse().find((x) => x.label)
      if (labeled) labeled.label = ''
      const email = labeled ? -1 : labels.findLastIndex(Boolean)
      if (email >= 0) labels[email] = ''
      return labeled !== undefined || email >= 0
    }],
    ['link', () => c.links.length > 1 && c.links.pop() !== undefined],
    ['title', () => c.title !== '' && (c.title = '') === ''],
    ['company', () => c.company !== '' && (c.company = '') === ''],
    ['email', () => c.emails.length > 1 && c.emails.pop() !== undefined && (labels.splice(c.emails.length), true)],
    ['phone', () => c.phones.length > 1 && c.phones.pop() !== undefined],
    ['link', () => c.links.length > 0 && c.links.pop() !== undefined],
  ]
  for (const [what, step] of steps) {
    while (!fits() && step()) dropped.push(what)
  }
  return fits() ? { url: serialize(c), dropped } : null
}
