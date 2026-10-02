import { education, experience, skills } from '../content/experience'
import { profile } from '../content/profile'
import { projects } from '../content/projects'

export default function Cv() {
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
          <p className="cv-contact">
            <span>Software Engineer</span>
            <span>{profile.location}</span>
            <span>{profile.workAuthorization}</span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            {profile.links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.href.replace(/^https:\/\/(www\.)?/, '')}
              </a>
            ))}
            <a href="https://tbutman.com">tbutman.com</a>
          </p>
        </header>

        <section aria-labelledby="cv-summary">
          <h2 id="cv-summary">Summary</h2>
          <p>
            {profile.lede} Open to remote US or on-site Lisbon roles, full-time or contract, in any US time zone.
          </p>
        </section>

        <section aria-labelledby="cv-experience">
          <h2 id="cv-experience">Experience</h2>
          {experience.map((role) => (
            <div key={role.company} className="cv-role">
              <h3>
                {role.company} · {role.title}
                <span>
                  {role.location} · {role.start} – {role.end}
                </span>
              </h3>
              <ul>
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {role.stack && <p className="cv-stack">{role.stack.join(' · ')}</p>}
            </div>
          ))}
        </section>

        <section aria-labelledby="cv-projects">
          <h2 id="cv-projects">Selected projects</h2>
          <ul className="cv-projects">
            {projects.map((project) => (
              <li key={project.slug}>
                <b>{project.title}</b> · {project.summary} <span className="cv-stack">{project.stack.join(' · ')}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cv-skills">
          <h2 id="cv-skills">Skills</h2>
          <dl className="cv-skills">
            {skills.map((group) => (
              <div key={group.area}>
                <dt>{group.area}:</dt> <dd>{group.items}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="cv-education">
          <h2 id="cv-education">Education</h2>
          <ul className="cv-education">
            {education.map((item) => (
              <li key={item.school}>
                <b>{item.school}</b> · {item.detail} · {item.year}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  )
}
