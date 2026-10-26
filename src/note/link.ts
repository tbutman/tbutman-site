// Note links (N1): a note or a list on a sticker, as https://taptilde.com/n#n1;… . Spec:
// tilde-review/specs/notes-link.md, section 2. The app writes them (its encoder is the reference);
// the note page (/tilde/n) reads them with decode() here. encodeNote() is the same format from this
// side, for the vectors and the LAN test server.
//
// The text rules are the contact link's (X1 §1, src/contact/link.ts): the same cleaning and the same
// cut between characters as a reader sees them. The one difference is the message, which keeps its
// line breaks.
import { CONTROL, clean, isVisible, tidy, truncate } from '../contact/link.ts'

export type Item = { text: string; done: boolean }
export type Note = {
  /** The note's id: 4 of [a-z0-9], random, never shown; "" without one (as the shared vectors write it). */
  id: string
  /** The day it was last saved, as YYYYMMDD; "" without one. */
  written: string
  title: string
  message: string
  items: Item[]
}
export type Decoded = { ok: true; note: Note } | { ok: false; reason: 'empty' | 'damaged' | 'newer' }

export const LINK_BASE = 'https://taptilde.com/n#'
export const VERSION = 'n1'

export const LIMITS = {
  /** The whole fragment, before decoding. Longer is damaged. */
  fragment: 4096,
  title: 40,
  message: 500,
  lines: 12,
  item: 80,
  items: 100,
  key: 8,
} as const

// Kept as is (§2.2); every other byte is %XX in upper case. Space is +, so a real + is %2B.
const SAFE = /^[A-Za-z0-9\-._~!$&'()*,:@/?=]$/

/** A value as the link carries it. */
export function encodeValue(value: string): string {
  let out = ''
  for (const char of value) {
    if (char === ' ') out += '+'
    else if (SAFE.test(char)) out += char
    else for (const byte of new TextEncoder().encode(char)) out += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`
  }
  return out
}

/** One line of a title or an item: X1's cleaning, then the cut. */
const line = (value: string, max: number) => truncate(clean(value), max)

/**
 * The message: CR LF and CR become LF, each line is cleaned as X1 does (control characters become
 * spaces, runs of spaces one, no spaces at either end), more than one blank line in a row becomes
 * one, blank lines at the start and end go, then at most 12 lines and 500 characters.
 */
export function cleanMessage(value: string): string {
  const lines = value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((text) => tidy(text.replace(CONTROL, ' ')).replace(/ {2,}/g, ' '))
  const kept: string[] = []
  for (const text of lines) {
    if (text === '' && (kept.length === 0 || kept[kept.length - 1] === '')) continue
    kept.push(text)
  }
  while (kept.length && kept[kept.length - 1] === '') kept.pop()
  const message = truncate(kept.slice(0, LIMITS.lines).join('\n'), LIMITS.message)
  return isVisible(message) ? message : ''
}

/** A note's fields, cleaned and cut as both sides do. */
export function normalize(note: Partial<Note>): Note {
  return {
    id: note.id && /^[a-z0-9]{4}$/.test(note.id) ? note.id : '',
    written: note.written && realDate(note.written) ? note.written : '',
    title: line(note.title ?? '', LIMITS.title),
    message: cleanMessage(note.message ?? ''),
    items: (note.items ?? [])
      .map((item) => ({ text: line(item.text, LIMITS.item), done: item.done }))
      .filter((item) => item.text !== '')
      .slice(0, LIMITS.items),
  }
}

/** The link for a note: its fields in order, empty ones left out (§2.1). */
export function encodeNote(input: Partial<Note>): string {
  const note = normalize(input)
  const fields: string[] = [VERSION]
  if (note.id) fields.push(`d=${note.id}`)
  if (note.written) fields.push(`w=${note.written}`)
  if (note.title) fields.push(`t=${encodeValue(note.title)}`)
  if (note.message) fields.push(`m=${encodeValue(note.message)}`)
  for (const item of note.items) fields.push(`${item.done ? 'x' : 'i'}=${encodeValue(item.text)}`)
  return LINK_BASE + fields.join(';')
}

/** YYYYMMDD, a day that exists, from 2026 to 2099. */
function realDate(value: string): boolean {
  const m = value.match(/^(20[2-9][0-9])([01][0-9])([0-3][0-9])$/)
  if (!m) return false
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (year < 2026 || month < 1 || month > 12 || day < 1) return false
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

class Damaged extends Error {}

/** Strict percent-decoding (§2.3, step 4): + is a space, and anything malformed is damaged. */
function decodeValue(raw: string): string {
  if (/%(?![0-9A-Fa-f]{2})/.test(raw)) throw new Damaged()
  try {
    // decodeURIComponent refuses bytes that aren't UTF-8, overlong forms and surrogates included.
    return decodeURIComponent(raw.replace(/\+/g, ' '))
  } catch {
    throw new Damaged()
  }
}

const KEYS = ['d', 'w', 't', 'm', 'i', 'x'] as const
const ONCE = new Set(['d', 'w', 't', 'm'])

/** Reads a note link's fragment (with or without the #). Never throws. */
export function decode(hash: string): Decoded {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const version = raw.match(/^n([0-9]+);/)
  if (!version || !/^[1-9][0-9]{0,2}$/.test(version[1])) return { ok: false, reason: 'empty' }
  if (`n${version[1]}` !== VERSION) return { ok: false, reason: 'newer' }
  if (raw.length > LIMITS.fragment) return { ok: false, reason: 'damaged' }

  const seen = new Set<string>()
  const fields: Partial<Note> & { items: Item[] } = { items: [] }
  try {
    for (const token of raw.slice(version[0].length).split(';')) {
      const eq = token.indexOf('=')
      if (eq < 1) continue
      const key = token.slice(0, eq)
      if (key.length > LIMITS.key || !(KEYS as readonly string[]).includes(key)) continue
      if (ONCE.has(key)) {
        if (seen.has(key)) throw new Damaged()
        seen.add(key)
      }
      const value = decodeValue(token.slice(eq + 1))
      if (key === 'd') fields.id = value
      else if (key === 'w') fields.written = value
      else if (key === 't') fields.title = value
      else if (key === 'm') fields.message = value
      else fields.items.push({ text: value, done: key === 'x' })
    }
  } catch (error) {
    if (error instanceof Damaged) return { ok: false, reason: 'damaged' }
    throw error
  }
  const note = normalize(fields)
  if (!note.title && !note.message && !note.items.length) return { ok: false, reason: 'empty' }
  return { ok: true, note }
}
