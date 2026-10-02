import { education, experience, skills } from '../content/experience'
import { profile } from '../content/profile'
import { projects } from '../content/projects'

// The CV favours plain structure over layout tricks so text extractors and applicant-tracking
// systems read it in order: real list bullets, metadata on its own line, literal separators.
const CV_PROJECTS = ['pepalert', 'smart-shopping', 'chatlingo']

const bareUrl = (href: string) => href.replace(/^https:\/\/(www\.)?/, '')

export default function Cv() {
  const cvProjects = CV_PROJECTS.flatMap((slug) => projects.filter((project) => project.slug === slug))
  const contact = [
    profile.location,
    profile.workAuthorization,
    profile.email,
    'tbutman.com',
    ...profile.links.map((link) => bareUrl(link.href)),
  ]

  return (
    <div className="cv-page">
      <div className="cv-toolbar">
        <p className="section-head">
          <span className="label">cv</span>
        </p>
        <a className="button primary" href={profile.cvPdf} download>
          download pdf
        </a>
      </div>

      <article className="cv panel">
        <header>
          <h1>{profile.name}</h1>
          <p className="cv-title">Senior Software Engineer · Full-stack and product</p>
          <p className="cv-contact">{contact.join('  |  ')}</p>
        </header>

        <section aria-labelledby="cv-summary">
          <h2 id="cv-summary">Summary</h2>
          <p>
            {profile.lede} Open to remote roles with US companies or on-site in Lisbon, full-time or contract.{' '}
            {profile.hours}.
          </p>
        </section>

        <section aria-labelledby="cv-experience">
          <h2 id="cv-experience">Experience</h2>
          {experience.map((role) => (
            <div key={role.company} className="cv-role">
              <h3>
                {role.title}, {role.company}
              </h3>
              <p className="cv-meta">
                {role.location} | {role.start} – {role.end}
              </p>
              <ul>
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {role.stack && <p className="cv-stack">Technologies: {role.stack.join(', ')}</p>}
            </div>
          ))}
        </section>

        <section aria-labelledby="cv-projects">
          <h2 id="cv-projects">Projects</h2>
          {cvProjects.map((project) => (
            <div key={project.slug} className="cv-role">
              <h3>
                {project.title}
                {project.live && ` (${bareUrl(project.live)})`}
              </h3>
              <p className="cv-meta">{project.status}</p>
              <ul>
                <li>{project.summary}</li>
              </ul>
              <p className="cv-stack">Technologies: {project.stack.join(', ')}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="cv-skills">
          <h2 id="cv-skills">Skills</h2>
          <ul className="cv-skills">
            {skills.map((group) => (
              <li key={group.area}>
                <b>{group.area}:</b> {group.items}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cv-education">
          <h2 id="cv-education">Education</h2>
          <ul className="cv-education">
            {education.map((item) => (
              <li key={item.school}>
                <b>{item.school}</b>, {item.detail}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  )
}
