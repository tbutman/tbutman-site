import { Fragment } from 'react'
import { Link } from 'react-router'

// Content strings with **bold** and [links](url). A link to one of the site's own pages (a path
// starting with /) uses the router; any other opens as a normal link.
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/

export default function RichText({ text }: { text: string }) {
  return text.split(TOKEN).map((part, index) => {
    const bold = part.match(/^\*\*(.+)\*\*$/)
    if (bold) return <b key={index}>{bold[1]}</b>
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
