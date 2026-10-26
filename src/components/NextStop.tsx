import { Link } from 'react-router'
import ledes from '../content/booth/copy/ledes.json'
import { hubSection, nextStop } from '../content/booth/pages'
import { type Block, sections } from '../content/booth/types'
import RichText from './RichText'

// The end of every page on the tour (src/content/booth/pages.ts, tour): where to go next, as one card.
// Its line is docs' own: the station's line from the hub's "See everything" table, or the hub's
// description for the way back. A stop docs hasn't written a line for (Around the home) has none.

function tileLine(path: string): string | null {
  const see = sections(hubSection.copy.blocks).find((section) => section.heading.id === 'see-everything')
  const table = see?.blocks.find((block): block is Extract<Block, { type: 'table' }> => block.type === 'table')
  const index = table?.rows[0]?.findIndex((cell) => cell.includes(`](${path})`)) ?? -1
  return index >= 0 ? (table?.rows[1]?.[index] ?? null) : null
}

export default function NextStop({ from }: { from: string }) {
  const stop = nextStop(from)
  const line = stop.key === 'hub' ? (ledes as Record<string, string>).hub : tileLine(stop.path)
  return (
    <nav className="booth-next" aria-label="Next stop">
      <Link className="panel" to={stop.path}>
        <small>next stop</small>
        <b>{stop.label} →</b>
        {line && (
          <span>
            <RichText text={line} />
          </span>
        )}
      </Link>
    </nav>
  )
}
