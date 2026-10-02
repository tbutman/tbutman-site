import { useId } from 'react'
import type { Diagram, DiagramNode } from '../content/diagrams'

const NODE_W = 196
const NODE_H = 58
const GAP_X = 56
const ROW_STEP = 84
const HEADER_H = 34

const nodeX = (node: DiagramNode) => node.col * (NODE_W + GAP_X)
const nodeY = (node: DiagramNode) => HEADER_H + node.row * ROW_STEP

function edgePath(from: DiagramNode, to: DiagramNode) {
  if (from.col === to.col) {
    const x = nodeX(from) + NODE_W / 2
    const down = to.row > from.row
    const y1 = nodeY(from) + (down ? NODE_H : 0)
    const y2 = nodeY(to) + (down ? 0 : NODE_H)
    return `M ${x} ${y1} L ${x} ${y2 + (down ? -4 : 4)}`
  }
  const x1 = nodeX(from) + NODE_W
  const y1 = nodeY(from) + NODE_H / 2
  const x2 = nodeX(to) - 4
  const y2 = nodeY(to) + NODE_H / 2
  const bend = (x2 - x1) / 2
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`
}

export default function ArchitectureDiagram({ diagram }: { diagram: Diagram }) {
  // useId output can contain characters that break url(#…) references.
  const id = 'diagram' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const byId = new Map(diagram.nodes.map((node) => [node.id, node]))
  const width = diagram.columns.length * NODE_W + (diagram.columns.length - 1) * GAP_X
  const height = HEADER_H + (diagram.rows - 1) * ROW_STEP + NODE_H
  const description = diagram.edges
    .map(([from, to]) => `${byId.get(from)?.label} to ${byId.get(to)?.label}`)
    .join('; ')

  return (
    <figure className="diagram panel">
      <div className="diagram-scroll">
        <svg
          viewBox={`-2 -2 ${width + 4} ${height + 4}`}
          style={{ maxWidth: width + 4 }}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>{diagram.title}</title>
          <desc id={`${id}-desc`}>{description}</desc>
          <defs>
            <marker
              id={`${id}-arrow`}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" className="diagram-arrowhead" />
            </marker>
          </defs>

          {diagram.columns.map((column, index) => (
            <text key={column} className="diagram-column" x={index * (NODE_W + GAP_X)} y={12}>
              {column}
            </text>
          ))}

          {diagram.edges.map(([from, to]) => {
            const a = byId.get(from)
            const b = byId.get(to)
            if (!a || !b) return null
            return (
              <path
                key={`${from}-${to}`}
                d={edgePath(a, b)}
                className="diagram-edge"
                markerEnd={`url(#${id}-arrow)`}
              />
            )
          })}

          {diagram.nodes.map((node) => (
            <g key={node.id} className={node.highlight ? 'diagram-node highlight' : 'diagram-node'}>
              <rect x={nodeX(node)} y={nodeY(node)} width={NODE_W} height={NODE_H} rx={8} />
              <text className="diagram-label" x={nodeX(node) + 14} y={nodeY(node) + (node.detail ? 25 : 34)}>
                {node.label}
              </text>
              {node.detail && (
                <text className="diagram-detail" x={nodeX(node) + 14} y={nodeY(node) + 43}>
                  {node.detail}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Phones get the same system as stacked columns instead of a sideways-scrolling drawing. */}
      <ol className="diagram-list" aria-hidden="true">
        {diagram.columns.map((column, index) => (
          <li key={column}>
            <span className="diagram-list-column">{column}</span>
            <ul>
              {diagram.nodes
                .filter((node) => node.col === index)
                .sort((a, b) => a.row - b.row)
                .map((node) => (
                  <li key={node.id} className={node.highlight ? 'highlight' : undefined}>
                    <b>{node.label}</b>
                    {node.detail && <span>{node.detail}</span>}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </figure>
  )
}
