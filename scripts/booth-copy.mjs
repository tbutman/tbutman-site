// Turns docs' booth page copy (tilde-review/site-content/{cards,fobs,uses,hub}.md) into the blocks the
// booth pages render (src/content/booth/copy/*.json), so docs' text reaches the site as written, by
// npm run booth:sync. It reads the subset of Markdown docs uses, and stops on anything else rather
// than drop text:
// - the notes before the first `---` are docs' (page, gates, sources) and stay out of the page;
// - ## and ### headings, with an optional {#id};
// - paragraphs, bullet lists (one level of sub-bullets), numbered lists, and pipe tables;
// - `[image: …]`, `[image per …: …]` and `[generated: …]` lines: where renders go, matched to the export by
//   src/content/booth/slots.ts;
// - **bold**, [links](…) and `code` inside text, which the page renders.

// A heading's id: its words, without a gate (an anchor shouldn't change when the gate goes).
const slug = (text) =>
  text
    .replace(/`?\[depends on [^\]]+\]`?/g, '')
    .toLowerCase()
    .replace(/\*\*|`|\[|\]\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// The site's typography: curly quotes and apostrophes, as in the rest of its copy (docs' Markdown uses
// straight ones). `code` and link targets stay as written.
export function curly(text) {
  return text
    .split(/(`[^`]*`|\]\([^)]*\))/)
    .map((part, index) =>
      index % 2
        ? part
        : part
            .replace(/(^|[\s([{“‘—-])"/g, '$1“')
            .replace(/"/g, '”')
            .replace(/(\w)'/g, '$1’')
            .replace(/(^|[\s([{“—-])'/g, '$1‘')
            .replace(/'/g, '’'),
    )
    .join('')
}

const cells = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim())

/** The page's blocks, in order. Throws on a line it doesn't understand. */
export function parseCopy(markdown, name = 'copy') {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const start = lines.indexOf('---')
  if (start < 0) throw new Error(`${name}: no --- after docs' notes`)
  const blocks = []
  let i = start + 1
  const fail = (message) => {
    throw new Error(`${name}:${i + 1}: ${message}: ${lines[i]}`)
  }
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    const heading = line.match(/^(#{2,3}) (.+?)(?: \{#([a-z0-9-]+)\})?$/)
    if (heading) {
      const text = heading[2].trim()
      blocks.push({ type: heading[1].length === 2 ? 'h2' : 'h3', text, id: heading[3] ?? slug(text) })
      i++
      continue
    }
    // [image: …], and [image per design: …] for one render per item, wrapped over lines or not.
    if (/^\[(image|generated)(: | per )/.test(line)) {
      let whole = line
      while (!whole.endsWith(']') && i + 1 < lines.length && lines[i + 1].trim()) whole += ` ${lines[++i].trim()}`
      const marker = whole.match(/^\[(image|generated)(?:: | (?=per ))(.+)\]$/)
      if (!marker) fail('an [image: …] line without its ]')
      blocks.push({ type: marker[1], text: marker[2] })
      i++
      continue
    }
    if (line.startsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].startsWith('|')) rows.push(cells(lines[i++]))
      if (rows.length < 2 || !rows[1].every((cell) => /^:?-{3,}:?$/.test(cell))) fail('a table without its --- row')
      blocks.push({ type: 'table', head: rows[0], rows: rows.slice(2) })
      continue
    }
    if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line)
      const items = []
      while (i < lines.length && lines[i].trim()) {
        const current = lines[i]
        const top = current.match(ordered ? /^\d+\. (.*)$/ : /^- (.*)$/)
        const sub = current.match(/^ {2,4}- (.*)$/)
        if (top) items.push({ text: top[1], sub: [] })
        else if (sub && items.length) items[items.length - 1].sub.push(sub[1])
        else if (/^ {2,}\S/.test(current) && items.length) {
          // A wrapped line belongs to the item or sub-item above it.
          const last = items[items.length - 1]
          if (last.sub.length && /^ {4,}\S/.test(current)) last.sub[last.sub.length - 1] += ` ${current.trim()}`
          else last.text += ` ${current.trim()}`
        } else break
        i++
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items })
      continue
    }
    if (/^[#>]/.test(line)) fail('a line this converter doesn’t read')
    // A paragraph: lines up to a blank line or another block.
    const text = []
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |\||- |\d+\. |\[(image|generated)(: | per ))/.test(lines[i])) text.push(lines[i++].trim())
    // Every pass takes at least a line: one no rule takes stops here rather than loop.
    if (!text.length) fail('a line this converter doesn’t read')
    blocks.push({ type: 'p', text: text.join(' ') })
  }
  return blocks.map((block) => {
    if ('items' in block) return { ...block, items: block.items.map((item) => ({ text: curly(item.text), sub: item.sub.map(curly) })) }
    if (block.type === 'table') return { ...block, head: block.head.map(curly), rows: block.rows.map((row) => row.map(curly)) }
    if (block.type === 'image' || block.type === 'generated') return block
    return { ...block, text: curly(block.text) }
  })
}

// The site's own link targets, where docs' copy predates a page: "Tilde for Android" is the App page
// since /tilde/app exists (site audit, item 2; the coordinator, October 26). Applied after the
// fidelity check; docs' Markdown can catch up, and then it changes nothing.
export const RELINK = [['[Tilde for Android](/tilde)', '[Tilde for Android](/tilde/app)']]

/** The blocks with RELINK's targets swapped in, and how many links it changed. */
export function relink(blocks) {
  let changed = 0
  const swap = (text) =>
    RELINK.reduce((out, [from, to]) => {
      changed += out.split(from).length - 1
      return out.split(from).join(to)
    }, text)
  const out = blocks.map((block) => {
    if ('items' in block) return { ...block, items: block.items.map((item) => ({ text: swap(item.text), sub: item.sub.map(swap) })) }
    if (block.type === 'table') return { ...block, head: block.head.map(swap), rows: block.rows.map((row) => row.map(swap)) }
    if (block.type === 'image' || block.type === 'generated') return block
    return { ...block, text: swap(block.text) }
  })
  return { blocks: out, changed }
}

/** Docs' "Description (link previews)" line from the page's notes (before the `---`), or null. */
export function describe(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const notes = lines.slice(0, Math.max(0, lines.indexOf('---')))
  const at = notes.findIndex((line) => line.startsWith('- **Description (link previews):** '))
  if (at < 0) return null
  const text = [notes[at].slice('- **Description (link previews):** '.length)]
  // A wrapped line is indented under its bullet.
  for (let i = at + 1; i < notes.length && /^ {2,}\S/.test(notes[i]); i++) text.push(notes[i].trim())
  return curly(text.join(' '))
}

// Everything docs wrote, without Markdown's syntax, spacing or quote style: to prove no text was
// dropped on the way to blocks.
const bare = (text) =>
  text
    .replace(/ \{#[a-z0-9-]+\}/g, '')
    .replace(/^\s*\d+\. /gm, '')
    .replace(/^\|?[\s|:-]*-{3,}[\s|:-]*$/gm, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[\s#|*-]/g, '')

/** Throws unless the blocks hold every word of the copy after docs' notes, in order. */
export function checkFidelity(markdown, blocks, name = 'copy') {
  const body = markdown.replace(/\r\n/g, '\n').split('\n')
  const source = bare(body.slice(body.indexOf('---') + 1).join('\n'))
  const parts = blocks.flatMap((block) => {
    if ('items' in block) return block.items.flatMap((item) => [item.text, ...item.sub])
    if (block.type === 'table') return [...block.head, ...block.rows.flat()]
    if (block.type === 'image' || block.type === 'generated') return [`[${block.type}${block.text.startsWith('per ') ? ' ' : ': '}${block.text}]`]
    return [block.text]
  })
  const out = bare(parts.join('\n'))
  if (source !== out) {
    let at = 0
    while (source[at] === out[at]) at++
    throw new Error(`${name}: the blocks differ from the copy near "${source.slice(Math.max(0, at - 30), at + 30)}"`)
  }
}
