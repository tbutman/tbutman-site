import { Link } from 'react-router'
import { experience } from '../content/experience'
import { profile } from '../content/profile'
import { projects } from '../content/projects'

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">
          {profile.role} · {profile.location} · {profile.availability}
        </p>
        <h1>{profile.headline}</h1>
        <p className="lede">{profile.lede}</p>
        <p className="actions">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <Link to="/cv">CV</Link>
          {profile.links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </p>
      </section>

      <section id="work" aria-labelledby="work-heading">
        <h2 id="work-heading">Selected work</h2>
        <ol className="work-list">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link to={`/work/${project.slug}`}>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <p className="stack">{project.stack.join(' · ')}</p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="how-heading">
        <h2 id="how-heading">How I work</h2>
        <div className="principles">
          {profile.principles.map((principle) => (
            <div key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" aria-labelledby="about-heading">
        <h2 id="about-heading">About</h2>
        {profile.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section id="experience" aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience</h2>
        <ol className="roles">
          {experience.map((role) => (
            <li key={role.company}>
              <span className="when">
                {role.start} – {role.end}
              </span>
              <div>
                <h3>
                  {role.company} <span>· {role.title}</span>
                </h3>
                <p>{role.summary}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link to="/cv">Full CV</Link>
      </section>
    </>
  )
}
