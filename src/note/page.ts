// The script of /tilde/n, the note page (N1): a note or a list from the link's fragment, with tick
// boxes for a list and Copy. Bundled and inlined into the page by scripts/note-page.mjs. Spec:
// tilde-review/specs/notes-link.md, section 3.
//
// Everything from the link is hostile input: it only ever reaches the page as textContent, never as
// HTML, a style or a link, and the page sends nothing anywhere (the CSP forbids it too). The one
// thing it keeps is which boxes are ticked, by position, on this phone, for a week (§3.3). The title
// stays generic: it lands in the browser's history, and the note's title shouldn't.
import { decode, type Item, type Note } from './link.ts'

// The Latin subset's unicode-range ("U+0000-00FF,U+0131,…"), put in by the build from fontsource.
declare const __LATIN_RANGE__: string

const copyText = {
  en: {
    title: 'A note from Tilde',
    note: 'Note',
    aNote: 'A note',
    list: 'List',
    updated: 'Updated %s',
    copy: 'Copy',
    copied: 'Copied',
    select: 'Select it',
    copyNote: 'Copy the note',
    copyList: 'Copy what’s still to get',
    copiedNote: 'The note is copied.',
    copiedList: 'What’s still to get is copied, one per line.',
    failed: 'Couldn’t copy: press and hold the text to select it.',
    counts: (open: number, done: number) => `${open} to get · ${done} done`,
    ticksLead: 'Your ticks stay on this phone.',
    ticks: ' They don’t change the list on the fridge: its owner updates that in Tilde.',
    madeWith: 'Made with ',
    tilde: 'Tilde',
    about: ': notes, lists and links on printed things you tap. Any phone reads them; the app that writes them is for Android.',
    next: 'Next stop: what else a tap can do →',
    privacy: 'Anyone who taps this note can read it. It’s in the link after the #, which browsers never send: this page reads it on your phone.',
    empty: 'Nothing in this note',
    emptyBody: 'The link has no note in it. Tap the sticker again.',
    damaged: 'This note can’t be read',
    damagedBody: 'It may have been cut short. Ask its owner to write it again.',
    newer: 'This note needs a newer page',
    newerBody: 'It was written by a newer version of Tilde. Reloading usually fixes it.',
    reload: 'Reload',
  },
  pt: {
    title: 'Uma nota da Tilde',
    note: 'Nota',
    aNote: 'Uma nota',
    list: 'Lista',
    updated: 'Atualizada a %s',
    copy: 'Copiar',
    copied: 'Copiado',
    select: 'Seleciona',
    copyNote: 'Copiar a nota',
    copyList: 'Copiar o que falta',
    copiedNote: 'A nota foi copiada.',
    copiedList: 'O que falta foi copiado, um por linha.',
    failed: 'Não deu para copiar: mantém o dedo no texto para o selecionar.',
    counts: (open: number, done: number) => `${open} por comprar · ${done} ${done === 1 ? 'feito' : 'feitos'}`,
    ticksLead: 'Os teus vistos ficam neste telemóvel.',
    ticks: ' Não mudam a lista do frigorífico: quem a escreveu atualiza-a na Tilde.',
    madeWith: 'Feito com a ',
    tilde: 'Tilde',
    about: ': notas, listas e ligações em objetos impressos que se tocam. Qualquer telemóvel as lê; a app que as escreve é para Android.',
    next: 'Próxima paragem: o que mais um toque faz →',
    privacy: 'Quem tocar nesta nota pode lê-la. Está na ligação depois do #, que os browsers nunca enviam: esta página lê-a no teu telemóvel.',
    empty: 'Esta nota não tem nada',
    emptyBody: 'A ligação não traz nenhuma nota. Toca outra vez no autocolante.',
    damaged: 'Esta nota não pode ser lida',
    damagedBody: 'Pode ter sido cortada. Pede a quem a escreveu para a escrever outra vez.',
    newer: 'Esta nota precisa de uma página mais recente',
    newerBody: 'Foi escrita por uma versão mais recente da Tilde. Recarregar a página costuma resolver.',
    reload: 'Recarregar',
  },
}

// The page follows the phone's language, as the contact page does.
const lang = (navigator.languages?.[0] ?? navigator.language ?? 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en'
const t = copyText[lang]
document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en'
document.title = t.title

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  node.append(...children)
  return node
}

// Every character the site's Latin font files have. A value with anything else (Polish ł, Greek,
// Arabic, an emoji) is set all in the system font, so fonts never mix within one line.
const latin = new RegExp(
  `^[${__LATIN_RANGE__
    .split(',')
    .map((range) => range.replace(/U\+([0-9A-F]+)(?:-([0-9A-F]+))?/, (_, from, to) => `\\u{${from}}${to ? `-\\u{${to}}` : ''}`))
    .join('')}\\n]*$`,
  'u',
)

/** An element with a value from the link: the only way one reaches the page. Its own direction (RTL). */
function value<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text: string): HTMLElementTagNameMap[K] {
  const node = el(tag, className ? `${className} value` : 'value', text)
  node.dir = 'auto'
  if (!latin.test(text)) node.classList.add('system')
  return node
}

// Over https, the Clipboard API; over the LAN's http (the phone tests), it's missing, so a selected
// read-only field and execCommand, which iOS Safari still honors inside a tap. The field is placed by
// a class: the CSP allows no style attributes.
async function copy(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through
    }
  }
  const field = el('textarea', 'copy-field')
  field.readOnly = true
  field.setAttribute('aria-hidden', 'true')
  field.value = text
  document.body.append(field)
  field.focus()
  field.setSelectionRange(0, text.length)
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  field.remove()
  return ok
}

function copyButton(text: () => string, label: string, done: string, status: HTMLElement): HTMLButtonElement {
  const button = el('button', 'copy', t.copy)
  button.type = 'button'
  button.setAttribute('aria-label', label)
  let timer: ReturnType<typeof setTimeout> | undefined
  button.addEventListener('click', async () => {
    const ok = await copy(text())
    button.textContent = ok ? t.copied : t.select
    button.classList.toggle('done', ok)
    status.textContent = ok ? done : t.failed
    clearTimeout(timer)
    timer = setTimeout(() => {
      button.textContent = t.copy
      button.classList.remove('done')
    }, 2500)
  })
  return button
}

// ---------- Ticks: kept on this phone for a week, positions only (§3.3) ----------
const PREFIX = 'tilde-n:'
const WEEK = 7 * 24 * 60 * 60 * 1000

/** FNV-1a over the items and whether each is done: a rewritten list gets a new key, so it starts clean. */
function itemsHash(items: Item[]): string {
  let hash = 0x811c9dc5
  for (const char of items.map((item) => `${item.done ? 'x' : 'i'}${item.text}`).join('\n')) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(36)
}

// Storage can be missing, blocked or full (private browsing): ticks then just don't outlive a reload.
function store(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Clears every entry older than a week, on every visit. */
function expire(now: number) {
  const storage = store()
  if (!storage) return
  try {
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i)
      if (!key?.startsWith(PREFIX)) continue
      const saved = JSON.parse(storage.getItem(key) ?? 'null') as { at?: unknown } | null
      if (typeof saved?.at !== 'number' || now - saved.at > WEEK) storage.removeItem(key)
    }
  } catch {
    // nothing to do
  }
}

function loadTicks(key: string | null, count: number): number[] | null {
  const storage = store()
  if (!key || !storage) return null
  try {
    const saved = JSON.parse(storage.getItem(key) ?? 'null') as { at?: unknown; ticked?: unknown } | null
    if (!saved || !Array.isArray(saved.ticked)) return null
    return saved.ticked.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < count)
  } catch {
    return null
  }
}

function saveTicks(key: string | null, ticked: number[]) {
  const storage = store()
  if (!key || !storage) return
  try {
    storage.setItem(key, JSON.stringify({ at: Date.now(), ticked }))
  } catch {
    // full or blocked: the ticks last until the page closes
  }
}

// ---------- The page ----------
function updated(note: Note): HTMLElement | null {
  if (!note.written) return null
  const [y, m, d] = [note.written.slice(0, 4), note.written.slice(4, 6), note.written.slice(6, 8)].map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  const sameYear = y === new Date().getFullYear()
  const shown = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-PT' : 'en-US', { day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }), timeZone: 'UTC' }).format(date)
  return el('p', 'updated', t.updated.replace('%s', shown))
}

function list(note: Note, status: HTMLElement): { rows: HTMLElement; counts: HTMLElement; open: () => string } {
  const key = note.id ? `${PREFIX}${note.id}:${itemsHash(note.items)}` : null
  const restored = loadTicks(key, note.items.length)
  const boxes: HTMLInputElement[] = []
  const counts = el('p', 'counts')
  counts.setAttribute('aria-live', 'polite')
  const recount = () => {
    const done = boxes.filter((box) => box.checked).length
    counts.textContent = t.counts(boxes.length - done, done)
  }
  const rows = el(
    'ul',
    'items',
    ...note.items.map((item, index) => {
      const box = el('input', 'tick')
      box.type = 'checkbox'
      box.id = `item-${index}`
      box.checked = restored ? restored.includes(index) : item.done
      boxes.push(box)
      const label = el('label', undefined, box, value('span', 'item', item.text))
      label.htmlFor = box.id
      box.addEventListener('change', () => {
        recount()
        saveTicks(
          key,
          boxes.flatMap((b, i) => (b.checked ? [i] : [])),
        )
        status.textContent = ''
      })
      return el('li', undefined, label)
    }),
  )
  recount()
  const open = () =>
    note.items
      .filter((_, index) => !boxes[index].checked)
      .map((item) => item.text)
      .join('\n')
  return { rows, counts, open }
}

function footer(): HTMLElement {
  const tilde = el('a', undefined, t.tilde)
  tilde.href = '/tilde/home'
  const next = el('a', undefined, t.next)
  next.href = '/tilde/uses'
  return el('footer', undefined, el('p', undefined, t.madeWith, tilde, t.about), el('p', 'more', next), el('p', 'privacy', t.privacy))
}

function show(note: Note): HTMLElement[] {
  const status = el('p', 'note-status')
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  const isList = note.items.length > 0
  const parts: (HTMLElement | null)[] = [
    el('p', 'kicker', isList ? t.list : t.note),
    el('h1', undefined, note.title ? value('span', '', note.title) : isList ? t.list : t.aNote),
  ]
  if (note.message) parts.push(value('p', 'message', note.message))
  let copyWhat = () => note.message
  if (isList) {
    const { rows, counts, open } = list(note, status)
    parts.push(rows, counts)
    copyWhat = open
  }
  parts.push(updated(note))
  const face = el('section', isList ? 'face list' : 'face', ...parts.filter((part): part is HTMLElement => part !== null))
  const actions = el('div', 'actions', copyButton(copyWhat, isList ? t.copyList : t.copyNote, isList ? t.copiedList : t.copiedNote, status), status)
  const after: HTMLElement[] = [face, actions]
  if (isList) after.push(el('p', 'ticks', el('strong', undefined, t.ticksLead), t.ticks))
  return [...after, footer()]
}

function problem(reason: 'empty' | 'damaged' | 'newer'): HTMLElement[] {
  const [title, body] = reason === 'empty' ? [t.empty, t.emptyBody] : reason === 'damaged' ? [t.damaged, t.damagedBody] : [t.newer, t.newerBody]
  const face = el('section', 'face void', el('p', 'kicker', t.note), el('h1', undefined, title), el('p', 'muted', body))
  if (reason === 'newer') {
    const reload = el('button', 'copy', t.reload)
    reload.type = 'button'
    reload.addEventListener('click', () => location.reload())
    face.append(reload)
  }
  return [face, footer()]
}

function render() {
  const root = document.getElementById('note')
  if (!root) return
  expire(Date.now())
  const decoded = decode(location.hash)
  root.replaceChildren(...(decoded.ok ? show(decoded.note) : problem(decoded.reason)))
}

render()
// A second tap can land on the same open page with a new fragment.
addEventListener('hashchange', render)
