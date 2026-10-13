// The script of /tilde/c, the contact page (X1, version 2): reads the contact from the fragment and
// shows it as a card face, like the app's and the printed card's, with a Save contact button that
// builds the .vcf on the phone. Bundled and inlined into the page by scripts/contact-page.mjs.
//
// Everything from the link is hostile input: it only ever reaches the page as textContent, never
// as HTML or a style, and the page sends nothing anywhere (the CSP forbids it too). The only links
// it makes are tel: and mailto: from numbers and addresses the decoder has checked (telHref,
// mailtoHref); websites stay text.
import {
  addressParts,
  AUTO_PHONE_LABEL,
  decodeFragment,
  mailtoHref,
  telHref,
  vcard,
  vcardFileName,
  type Color,
  type Contact,
} from './link.ts'

// The Latin subset's unicode-range ("U+0000-00FF,U+0131,…"), put in by the build from fontsource.
declare const __LATIN_RANGE__: string

const copy = {
  en: {
    save: 'Save contact',
    asks: 'Your phone asks before adding it.',
    email: 'Email',
    workEmail: 'Work email',
    homeEmail: 'Personal email',
    phone: 'Phone',
    mobile: 'Mobile',
    website: 'Website',
    callTo: 'Call %s',
    writeTo: 'Email %s',
    // The saved contact's words: the app's "mobile (US)", and a note with the day it was saved.
    mobileWord: 'mobile',
    note: 'Saved from a Tilde link on %s',
    privacy: 'These details came inside the link. This page didn’t send them to any server or store them.',
    madeWith: 'Made with Tilde',
    makeYourOwn: 'make your own',
    tildeHref: '/tilde',
    title: 'Tilde contact',
    empty: ['No contact in this link', 'The link ends before the contact details. It may have been cut short when it was copied.'],
    damaged: ['This contact link is damaged', 'Part of it is missing or was changed, so it can’t be read safely.'],
    unsupported: ['This contact needs a newer page', 'It was made by a newer version of Tilde. Reloading usually fixes it.'],
    reload: 'Reload',
    tip: 'Ask them to tap again, or to show the code on their phone and scan it with your camera.',
  },
  pt: {
    save: 'Guardar contacto',
    asks: 'O teu telemóvel pergunta antes de o adicionar.',
    email: 'Email',
    workEmail: 'Email profissional',
    homeEmail: 'Email pessoal',
    phone: 'Telefone',
    mobile: 'Telemóvel',
    website: 'Site',
    callTo: 'Ligar para %s',
    writeTo: 'Enviar email para %s',
    mobileWord: 'telemóvel',
    note: 'Guardado a partir de uma ligação Tilde a %s',
    privacy: 'Estes dados vieram dentro da ligação. Esta página não os enviou para nenhum servidor nem os guardou.',
    madeWith: 'Feito com a Tilde',
    makeYourOwn: 'faz o teu',
    tildeHref: '/pt/tilde',
    title: 'Contacto Tilde',
    empty: ['Esta ligação não tem nenhum contacto', 'A ligação acaba antes dos dados do contacto. Pode ter sido cortada quando foi copiada.'],
    damaged: ['Esta ligação de contacto está danificada', 'Falta uma parte ou foi alterada, por isso não pode ser lida com segurança.'],
    unsupported: ['Este contacto precisa de uma página mais recente', 'Foi criado por uma versão mais recente da Tilde. Recarregar a página costuma resolver.'],
    reload: 'Recarregar',
    tip: 'Pede à pessoa para encostar outra vez, ou para mostrar o código no telemóvel, e lê-o com a tua câmara.',
  },
}

// The page follows the phone's language.
const lang = (navigator.languages?.[0] ?? navigator.language ?? 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en'
const t = copy[lang]
const locale = lang === 'pt' ? 'pt-PT' : 'en-US'
document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en'

// Icon paths (24 × 24, stroked), from the mockup.
const icons = {
  add: ['M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M19 8v6M16 11h6', 'circle 9 8 4'],
  lock: ['M8 11V8a4 4 0 0 1 8 0v3', 'rect 5 11 14 10 2'],
  empty: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
  damaged: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1M4 4l16 16'],
  unsupported: ['M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5'],
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2'],
  mail: ['M4 6l8 7 8-7', 'rect 3 5 18 14 2'],
  scan: ['M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10'],
}

const SVG = 'http://www.w3.org/2000/svg'

function icon(name: keyof typeof icons): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg')
  svg.setAttribute('class', 'icon')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  for (const shape of icons[name]) {
    const [kind, ...n] = shape.split(' ')
    if (kind === 'circle') {
      const c = document.createElementNS(SVG, 'circle')
      c.setAttribute('cx', n[0])
      c.setAttribute('cy', n[1])
      c.setAttribute('r', n[2])
      svg.append(c)
    } else if (kind === 'rect') {
      const r = document.createElementNS(SVG, 'rect')
      ;['x', 'y', 'width', 'height', 'rx'].forEach((attr, i) => r.setAttribute(attr, n[i]))
      svg.append(r)
    } else {
      const p = document.createElementNS(SVG, 'path')
      p.setAttribute('d', shape)
      svg.append(p)
    }
  }
  return svg
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

// Every character the site's Latin font files have. A value with anything else (Polish ł, Greek,
// Japanese, an emoji) is set all in the system font, so fonts never mix within one name.
const latin = new RegExp(
  `^[${__LATIN_RANGE__
    .split(',')
    .map((range) => range.replace(/U\+([0-9A-F]+)(?:-([0-9A-F]+))?/, (_, from, to) => `\\u{${from}}${to ? `-\\u{${to}}` : ''}`))
    .join('')}]*$`,
  'u',
)

/** An element with a value from the link: the only way one reaches the page. */
function value<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text: string): HTMLElementTagNameMap[K] {
  const node = el(tag, `${className} value`, text)
  if (!latin.test(text)) node.classList.add('system')
  return node
}

/** Hidden from screen readers: decoration, or said elsewhere. */
function decorative<T extends Element>(node: T): T {
  node.setAttribute('aria-hidden', 'true')
  return node
}

/**
 * "JD" from "Jane Doe": the first letter (with any marks on it) of the first and last words. A
 * word without a letter, such as an emoji or a flag, adds nothing: "Jane 🏴" gives "J".
 */
function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  const letter = (word: string) => word.match(/\p{L}\p{M}*/u)?.[0] ?? ''
  const first = letter(words[0])
  const last = words.length > 1 ? letter(words[words.length - 1]) : ''
  return (first + last).toUpperCase()
}

// The card's color, from a fixed list: a value from the link never reaches CSS.
const colorClass: Record<Color, string> = {
  amber: 'k-amber',
  sea: 'k-sea',
  sky: 'k-sky',
  iris: 'k-iris',
  clay: 'k-clay',
  moss: 'k-moss',
}

/** "~/janedoe", with the "~/" in the card's color. */
function handle(text: string): HTMLParagraphElement {
  const line = el('p', 'handle')
  line.append(el('span', undefined, '~/'), text)
  return line
}

/**
 * A phone's label in the page's language (design rec. 5): the app's own "mobile" and "mobile (US)"
 * become "Mobile" and "Mobile (US)" ("Telemóvel"); a typed label gets a capital first letter.
 */
function phoneLabel(label: string): string {
  if (!label) return t.phone
  const auto = label.match(AUTO_PHONE_LABEL)
  if (auto) return t.mobile + (auto[1] ?? '')
  const [first, ...rest] = label
  return first.toLocaleUpperCase(locale) + rest.join('')
}

/**
 * Each email's label (design recs. 8 and 9): "Work email" and "Personal email" from the link's
 * keys, "Email" without one, numbered from the second of a kind ("Email", "Email 2").
 */
function emailLabels(contact: Contact): string[] {
  const keys = contact.emails.map((_, i) => contact.emailLabels?.[i] ?? '')
  const seen = new Map<string, number>()
  return keys.map((key) => {
    const word = key === 'work' ? t.workEmail : key === 'home' ? t.homeEmail : t.email
    const nth = (seen.get(key) ?? 0) + 1
    seen.set(key, nth)
    return nth > 1 ? `${word} ${nth}` : word
  })
}

/**
 * Text with a line-break chance after each character of `after` and before each of `before`, so a
 * long address wraps at its seams (design rec. 2): after a "/", "?" or "&", and before a dot or an
 * email's "@", so no line starts with "com" cut from its dot (design N2). A break inside a word
 * stays the last resort.
 */
function seams(text: string, after: string, before = ''): Node[] {
  const nodes: Node[] = []
  let part = ''
  const cut = () => {
    nodes.push(document.createTextNode(part), el('wbr'))
    part = ''
  }
  for (const char of text) {
    if (before.includes(char) && part) cut()
    part += char
    if (after.includes(char)) cut()
  }
  if (part) nodes.push(document.createTextNode(part))
  return nodes
}

/**
 * A phone number or an email (design rec. 1): the value as shown, in a tel: or mailto: link with
 * the call or mail icon at its end. The phone asks before calling, and the href comes only from the
 * decoder's checked value; without one, the value stays text.
 */
function tappable(text: string, nodes: Node[], href: string | null, kind: 'phone' | 'mail'): HTMLElement {
  const shown = value('span', 'shown', text)
  shown.replaceChildren(...nodes)
  const dd = el('dd', 'text')
  if (!href) {
    dd.append(shown)
    return dd
  }
  const a = el('a', 'tap')
  a.href = href
  a.setAttribute('aria-label', (kind === 'phone' ? t.callTo : t.writeTo).replace('%s', text))
  a.append(shown, icon(kind))
  dd.append(a)
  return dd
}

/** A website (design recs. 2 and 3): where it goes in the text color, the rest dimmer. Never a link. */
function website(url: string): HTMLElement {
  const { host, rest } = addressParts(url)
  const dd = value('dd', 'text', host + rest)
  const where = el('span', 'host')
  where.append(...seams(host, '', '.'))
  const path = el('span', 'path')
  path.append(...seams(rest, '/?&'))
  dd.replaceChildren(where, ...(rest ? [path] : []))
  return dd
}

function footer(): HTMLElement {
  const foot = el('footer', 'footer')
  const link = el('a', undefined, `${t.makeYourOwn} →`)
  link.href = t.tildeHref
  foot.append(el('span', undefined, t.madeWith), link)
  return foot
}

// How Save contact hands the file to the phone. iOS Safari's best way is settled by the iPhone test
// (spec section 7, T2); until then `?save=` picks one. The query never carries contact data.
type SaveMethod = 'blob' | 'data' | 'download' | 'share'
const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const asked = new URLSearchParams(location.search).get('save')
const method: SaveMethod = asked === 'blob' || asked === 'data' || asked === 'download' || asked === 'share' ? asked : isIos ? 'blob' : 'download'

async function save(contact: Contact) {
  const day = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date())
  const text = vcard(contact, { mobile: t.mobileWord, note: t.note.replace('%s', day) })
  const name = vcardFileName(contact)
  const blob = new Blob([text], { type: 'text/vcard;charset=utf-8' })
  if (method === 'share') {
    const file = new File([blob], name, { type: 'text/vcard' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] }).catch(() => undefined)
      return
    }
  }
  if (method === 'data') {
    location.href = `data:text/vcard;charset=utf-8,${encodeURIComponent(text)}`
    return
  }
  const url = URL.createObjectURL(blob)
  if (method === 'blob') {
    location.href = url
  } else {
    const a = el('a')
    a.href = url
    a.download = name
    document.body.append(a)
    a.click()
    a.remove()
  }
  // Long enough for the phone to read it, then let it go.
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/**
 * The name as on the printed card, the first word and then the rest, each line on one line: the
 * size steps down from 34 to 26 px until both fit, and only then do the lines wrap. Never cut off.
 * Runs again when the fonts are ready, though size-adjust makes both fonts nearly the same width.
 */
function fitName() {
  const name = document.querySelector<HTMLElement>('.face .name')
  if (!name) return
  name.classList.remove('wrap')
  const lines = [...name.children] as HTMLElement[]
  for (let size = 34; size >= 26; size--) {
    name.style.setProperty('--n', `${size}px`)
    if (lines.every((line) => line.scrollWidth <= name.clientWidth)) return
  }
  name.classList.add('wrap')
}

function showContact(root: HTMLElement, contact: Contact) {
  document.title = `${contact.name} · Tilde`

  // The card face. No handle or color is ever made up: without h= the face starts at the name,
  // and without c= it's amber.
  const face = el('section', `face ${colorClass[contact.color ?? 'amber'] ?? 'k-amber'}`)
  if (contact.handle) face.append(handle(contact.handle))
  const name = value('h1', 'name', contact.name)
  const space = contact.name.indexOf(' ')
  const lines = space < 0 ? [contact.name] : [contact.name.slice(0, space), contact.name.slice(space + 1)]
  name.replaceChildren(...lines.map((line) => el('span', undefined, line)))
  // Read as one name, not two lines.
  name.setAttribute('aria-label', contact.name)
  const role = [contact.title, contact.company].filter(Boolean).join(' · ')
  face.append(
    name,
    decorative(el('div', 'rule')),
    // The row stays when empty, so the ring never touches the name.
    role ? value('p', 'role', role) : el('p', 'role'),
    decorative(value('div', 'ring', initials(contact.name))),
  )

  const button = el('button', 'save')
  button.type = 'button'
  button.append(icon('add'), t.save)
  button.addEventListener('click', () => void save(contact))
  root.append(face, button, el('p', 'under', t.asks))

  const labels = emailLabels(contact)
  const rows: [string, HTMLElement][] = [
    ...contact.emails.map((email, i): [string, HTMLElement] => [labels[i], tappable(email, seams(email, '', '.@'), mailtoHref(email), 'mail')]),
    ...contact.phones.map((phone): [string, HTMLElement] => [
      phoneLabel(phone.label),
      tappable(phone.number, [document.createTextNode(phone.number)], telHref(phone.number), 'phone'),
    ]),
    // The decoder has already replaced a label that poses as another site with the default.
    ...contact.links.map((link): [string, HTMLElement] => [link.label === 'Website' ? t.website : link.label, website(link.url)]),
  ]
  if (rows.length) {
    const details = el('dl', 'details')
    for (const [label, dd] of rows) {
      const row = el('div', 'row')
      row.append(value('dt', 'label', label), dd)
      details.append(row)
    }
    root.append(details)
  }

  const privacy = el('p', 'privacy')
  privacy.append(icon('lock'), el('span', undefined, t.privacy))
  root.append(privacy)
}

function showError(root: HTMLElement, reason: 'empty' | 'damaged' | 'unsupported') {
  document.title = t.title
  const [heading, line] = t[reason]
  // The face's place, dashed like the app's blank card: the page speaks as itself (~/tilde),
  // never as someone, and never shows part of a contact.
  const box = el('section', 'face void k-amber')
  const badge = el('div', 'badge')
  badge.append(icon(reason))
  box.append(decorative(handle('tilde')), badge, el('h1', undefined, heading), decorative(el('div', 'rule')), el('p', undefined, line))
  root.append(box)
  if (reason === 'unsupported') {
    const reload = el('button', 'button')
    reload.type = 'button'
    reload.append(icon('unsupported'), t.reload)
    reload.addEventListener('click', () => location.reload())
    root.append(reload)
  }
  const tip = el('p', 'tip')
  tip.append(icon('scan'), el('span', undefined, t.tip))
  root.append(tip)
}

function render() {
  const root = document.getElementById('contact')
  if (!root) return
  root.replaceChildren()
  const decoded = decodeFragment(location.hash)
  if (decoded.ok) showContact(root, decoded.contact)
  else showError(root, decoded.reason)
  root.append(footer())
  fitName()
}

render()
void document.fonts?.ready.then(fitName)
addEventListener('resize', fitName)
// A second tap can land on the same open page with a new fragment.
addEventListener('hashchange', render)
