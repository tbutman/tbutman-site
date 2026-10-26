import { Fragment } from 'react'
import { Link } from 'react-router'

// Content strings with **bold** and [links](url). A link to one of the site's own pages (a path
// starting with /) uses the router; any other opens as a normal link. The booth pages' copy (docs'
// Markdown) also has `code`, links inside bold, and [depends on …] gates: a line that waits on a
// phone or print test (there are no release gates: Thomas, October 20), shown as a badge, and
// blocked from going live by CI (scripts/prerender.mjs). Docs' product sheet adds two more of the
// kind: [Thomas: …], a question only he can answer, and [name TBD].
const TOKEN = /(\*\*[^*]+\*\*|\[(?:depends on |Thomas: )[^\]]+\]|\[name TBD\]|\[[^\]]+\]\([^)\s]+\)|`[^`]+`)/

export default function RichText({ text }: { text: string }) {
  return text.split(TOKEN).map((part, index) => {
    const bold = part.match(/^\*\*(.+)\*\*$/)
    if (bold) {
      return (
        <b key={index}>
          <RichText text={bold[1]} />
        </b>
      )
    }
    // A gate, bare or in backticks as docs writes it.
    if (/^`?\[(?:(?:depends on |Thomas: )[^\]]+|name TBD)\]`?$/.test(part)) {
      return (
        <span key={index} className="gate">
          {part.replace(/`/g, '')}
        </span>
      )
    }
    const code = part.match(/^`(.+)`$/)
    if (code) return <code key={index}>{code[1]}</code>
    const link = part.match(/^\[(.+)\]\((.+)\)$/)
    if (link) {
      const [, label, href] = link
      return href.startsWith('/') ? (
        <Link key={index} to={href}>
          {label}
        </Link>
      ) : (
        <a key={index} href={href}>
          {label}
        </a>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}
