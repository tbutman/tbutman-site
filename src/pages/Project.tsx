import { Link, useParams } from 'react-router'
import { findProject } from '../content/projects'
import NotFound from './NotFound'

export default function Project() {
  const project = findProject(useParams().slug)
  if (!project) return <NotFound />

  return (
    <article className="case-study">
      <p className="eyebrow">
        {project.kind} · {project.year}
      </p>
      <h1>{project.title}</h1>
      <p className="lede">{project.summary}</p>
      <p className="stack">{project.stack.join(' · ')}</p>

      <h2>The problem</h2>
      <p>{project.problem}</p>

      <h2>What I built</h2>
      <ul>
        {project.built.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p className="actions">
        {project.repo && <a href={project.repo}>Source on GitHub</a>}
        <Link to="/#work">All work</Link>
      </p>
    </article>
  )
}
