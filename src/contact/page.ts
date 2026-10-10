// The script of /tilde/c, the contact page (X1): reads the contact from the fragment and shows it,
// with a Save contact button that builds the .vcf on the phone. Bundled and inlined into the page
// by scripts/contact-page.mjs.
//
// Everything from the link is hostile input: it only ever reaches the page as textContent, never
// as HTML or as a link, and the page sends nothing anywhere (the CSP forbids it too).
import { decodeFragment, displayAddress, vcard, vcardFileName, type Contact } from './link.ts'

const copy = {
  en: {
    save: 'Save contact',
    asks: 'Your phone asks before adding it.',
    email: 'Email',
    phone: 'Phone',
    website: 'Website',
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
    phone: 'Telefone',
    website: 'Site',
    privacy: 'Estes dados vieram dentro da ligação. Esta página não os enviou para nenhum servidor nem os guardou.',
    madeWith: 'Feito com a Tilde',
    makeYourOwn: 'faz o teu',
    tildeHref: '/pt/tilde',
    title: 'Contacto Tilde',
    empty: ['Esta ligação não tem nenhum contacto', 'A ligação acaba antes dos dados do contacto. Pode ter sido cortada quando foi copiada.'],
    damaged: ['Esta ligação de contacto está danificada', 'Falta uma parte ou foi alterada, por isso não pode ser lida com segurança.'],
    unsupported: ['Este contacto precisa de uma página mais recente', 'Foi criado por uma versão mais recente da Tilde. Recarregar a página costuma resolver.'],
    reload: 'Recarregar',
    tip: 'Pede-lhe para encostar outra vez, ou para mostrar o código no telemóvel e lê-o com a câmara.',
  },
}

// The page follows the phone's language.
const lang = (navigator.languages?.[0] ?? navigator.language ?? 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en'
const t = copy[lang]
document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en'

// Icon paths (24 × 24, stroked), from the mockup.
const icons = {
  add: ['M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M19 8v6M16 11h6', 'circle 9 8 4'],
  lock: ['M8 11V8a4 4 0 0 1 8 0v3', 'rect 5 11 14 10 2'],
  empty: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
  damaged: ['M9 15l-1.5 1.5a3.5 3.5 0 0 1-5-5L4 10M15 9l1.5-1.5a3.5 3.5 0 0 1 5 5L20 14M8 2v3M2 8h3M16 22v-3M22 16h-3'],
  unsupported: ['M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5'],
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

/** An element with text: the only way a value from the link reaches the page. */
function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

/** "JD" from "Jane Doe": the first letters of the first and last words. */
function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  const first = [...words[0]][0] ?? ''
  const last = words.length > 1 ? ([...words[words.length - 1]][0] ?? '') : ''
  return (first + last).toUpperCase()
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
  const text = vcard(contact)
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

function showContact(root: HTMLElement, contact: Contact) {
  document.title = `${contact.name} · Tilde`

  const card = el('section', 'card')
  const avatar = el('div', 'avatar value', initials(contact.name))
  avatar.setAttribute('aria-hidden', 'true')
  card.append(avatar, el('h1', 'name value', contact.name))
  const role = [contact.title, contact.company].filter(Boolean).join(' · ')
  if (role) card.append(el('p', 'role value', role))
  const button = el('button', 'save')
  button.type = 'button'
  button.append(icon('add'), t.save)
  button.addEventListener('click', () => void save(contact))
  card.append(button, el('p', 'under', t.asks))
  root.append(card)

  const rows: [string, string][] = [
    ...contact.emails.map((email): [string, string] => [t.email, email]),
    ...contact.phones.map((phone): [string, string] => [phone.label || t.phone, phone.number]),
    ...contact.links.map((link): [string, string] => [link.label === 'Website' ? t.website : link.label, displayAddress(link.url)]),
  ]
  if (rows.length) {
    const details = el('dl', 'details')
    for (const [label, value] of rows) {
      const row = el('div', 'row')
      row.append(el('dt', 'value', label), el('dd', 'value', value))
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
  const box = el('section', 'error')
  const badge = el('div', 'error-icon')
  badge.append(icon(reason))
  box.append(badge, el('h1', undefined, heading), el('p', undefined, line))
  if (reason === 'unsupported') {
    const reload = el('button', 'button')
    reload.type = 'button'
    reload.append(icon('unsupported'), t.reload)
    reload.addEventListener('click', () => location.reload())
    box.append(reload)
  }
  const tip = el('p', 'tip')
  tip.append(icon('scan'), el('span', undefined, t.tip))
  box.append(tip)
  root.append(box)
}

function render() {
  const root = document.getElementById('contact')
  if (!root) return
  root.replaceChildren()
  const decoded = decodeFragment(location.hash)
  if (decoded.ok) showContact(root, decoded.contact)
  else showError(root, decoded.reason)
  root.append(footer())
}

render()
// A second tap can land on the same open page with a new fragment.
addEventListener('hashchange', render)
