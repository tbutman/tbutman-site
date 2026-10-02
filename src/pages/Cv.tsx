import { education, experience } from '../content/experience'
import { profile } from '../content/profile'

export default function Cv() {
  return (
    <article className="cv">
      <header>
        <h1>{profile.name}</h1>
        <p>
          {profile.role} · {profile.location} · {profile.availability} · {profile.engagement}
        </p>
        <p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          {profile.links.map((link) => (
            <span key={link.href}>
              {' · '}
              <a href={link.href}>{link.href.replace(/^https:\/\/(www\.)?/, '')}</a>
            </span>
          ))}
        </p>
      </header>

      <section aria-labelledby="cv-summary">
        <h2 id="cv-summary">Summary</h2>
        <p>{profile.lede}</p>
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
            {role.stack && <p className="stack">{role.stack.join(' · ')}</p>}
          </div>
        ))}
      </section>

      <section aria-labelledby="cv-education">
        <h2 id="cv-education">Education</h2>
        <ul>
          {education.map((item) => (
            <li key={item.school}>
              <b>{item.school}</b> · {item.detail} · {item.year}
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
