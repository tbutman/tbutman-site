import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import ArchitectureDiagram from '../components/ArchitectureDiagram'
import { diagrams } from '../content/diagrams'
import { findProject, projects, type Project as ProjectType } from '../content/projects'
import NotFound from './NotFound'

export default function Project() {
  const project = findProject(useParams().slug)
  if (!project) return <NotFound />

  const number = String(projects.indexOf(project) + 1).padStart(2, '0')
  const diagram = diagrams[project.slug]

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
        {project.status && (
          <span className={project.live ? 'badge on' : 'badge'}>{project.status.toLowerCase()}</span>
        )}
      </p>
      <h1>{project.title}</h1>
      <p className="lede">{project.summary}</p>
      {project.scope && <p className="scope">{project.scope}</p>}
      <ul className="tags" aria-label="Stack">
        {project.stack.map((tech) => (
          <li key={tech}>{tech.toLowerCase()}</li>
        ))}
      </ul>
      <ProjectLinks project={project} className="button-row project-links-top" />

      <section className="case-section" aria-labelledby="problem-heading">
        <div className="section-head">
          <h2 id="problem-heading">the problem</h2>
        </div>
        <p>{project.problem}</p>
      </section>

      {project.story?.map((section, index) => (
        <section key={section.heading} className="case-section" aria-labelledby={`story-heading-${index}`}>
          <div className="section-head">
            <h2 id={`story-heading-${index}`}>{section.heading}</h2>
          </div>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}

      {project.screens && (
        <section className="case-section" aria-labelledby="screens-heading">
          <div className="section-head">
            <h2 id="screens-heading">screens</h2>
          </div>
          <div className="case-screens">
            {project.screens.map((screen) => (
              <figure key={screen.src}>
                <div className="phone">
                  <img src={screen.src} alt={screen.alt} width={450} height={1000} loading="lazy" decoding="async" />
                </div>
                <figcaption>{screen.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {diagram && (
        <section className="case-section diagram-section" aria-labelledby="architecture-heading">
          <div className="section-head">
            <h2 id="architecture-heading">architecture</h2>
          </div>
          <ArchitectureDiagram diagram={diagram} />
        </section>
      )}

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

      {project.outcomes && (
        <section className="case-section" aria-labelledby="outcomes-heading">
          <div className="section-head">
            <h2 id="outcomes-heading">what changed</h2>
          </div>
          <ul className="built-list">
            {project.outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {project.reflection && (
        <section className="case-section" aria-labelledby="reflection-heading">
          <div className="section-head">
            <h2 id="reflection-heading">looking back</h2>
          </div>
          <p>{project.reflection}</p>
        </section>
      )}

      <ProjectLinks project={project} className="button-row project-links-end">
        <Link className="button" to="/#work">
          all work
        </Link>
      </ProjectLinks>
    </article>
  )
}

/** The live product and source links, shown under the summary and again at the end. */
function ProjectLinks({ project, className, children }: { project: ProjectType; className: string; children?: ReactNode }) {
  if (!project.live && !project.repo && !project.links && !children) return null
  return (
    <div className={className}>
      {project.live && (
        <a className="button primary" href={project.live}>
          visit {project.live.replace(/^https:\/\//, '')} ↗
        </a>
      )}
      {project.repo && (
        <a className={project.live ? 'button' : 'button primary'} href={project.repo}>
          source on github
        </a>
      )}
      {project.links?.map((link) => (
        <a key={link.href} className="button" href={link.href}>
          {link.label}
        </a>
      ))}
      {children}
    </div>
  )
}
