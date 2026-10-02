import { Link, useParams } from 'react-router'
import { findProject, projects } from '../content/projects'
import NotFound from './NotFound'

export default function Project() {
  const project = findProject(useParams().slug)
  if (!project) return <NotFound />

  const number = String(projects.indexOf(project) + 1).padStart(2, '0')

  return (
    <article className="case-study">
      <Link className="back-link" to="/#work">
        ← all work
      </Link>
      <p className="card-meta">
        <span>
          {number} / {project.kind.toLowerCase()}
        </span>
        <span>{project.year}</span>
      </p>
      <h1>{project.title}</h1>
      <p className="lede">{project.summary}</p>
      <ul className="tags" aria-label="Stack">
        {project.stack.map((tech) => (
          <li key={tech}>{tech.toLowerCase()}</li>
        ))}
      </ul>

      <section className="case-section" aria-labelledby="problem-heading">
        <div className="section-head">
          <h2 id="problem-heading">the problem</h2>
        </div>
        <p>{project.problem}</p>
      </section>

      <section className="case-section" aria-labelledby="built-heading">
        <div className="section-head">
          <h2 id="built-heading">what i built</h2>
        </div>
        <ul className="built-list">
          {project.built.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="button-row">
        {project.repo && (
          <a className="button primary" href={project.repo}>
            source on github
          </a>
        )}
        <Link className="button" to="/#work">
          all work
        </Link>
      </div>
    </article>
  )
}
