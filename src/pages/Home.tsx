import { Link } from 'react-router'
import ContactSection from '../components/ContactSection'
import { experience, roleDates } from '../content/experience'
import { lab, labIntro } from '../content/lab'
import { profile } from '../content/profile'
import { projects } from '../content/projects'

const facts = [
  { label: 'based in', value: 'Lisbon, Portugal' },
  { label: 'work auth', value: profile.workAuthorization },
  { label: 'languages', value: profile.languages },
  { label: 'hours', value: profile.hours },
  { label: 'open to', value: profile.engagement },
]

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <p className="status">
          <span className="status-dot" aria-hidden="true" />
          open to new roles · remote (US) or on-site in Lisbon
        </p>
        <h1 id="hero-heading">
          {profile.headline[0]} <span>{profile.headline[1]}</span>
        </h1>
        <p className="lede">{profile.lede}</p>
        <div className="button-row">
          <a className="button primary" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <Link className="button" to="/resume">
            résumé
          </Link>
          {profile.links.map((link) => (
            <a key={link.href} className="button" href={link.href}>
              {link.label.toLowerCase()}
            </a>
          ))}
        </div>
        <dl className="facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="experience" className="section" aria-labelledby="experience-heading">
        <div className="section-head">
          <h2 id="experience-heading">experience</h2>
          <Link to="/resume">full résumé →</Link>
        </div>
        <ol className="log panel">
          {experience.map((role) => (
            <li key={`${role.company}-${role.start}`}>
              <span className="when">
                {roleDates(role, ' — ').toLowerCase()}
              </span>
              <h3>
                {role.company}
                <small>{role.title.toLowerCase()}</small>
              </h3>
              <p>{role.summary}</p>
            </li>
          ))}
        </ol>
      </section>
      <section id="work" className="section" aria-labelledby="work-heading">
        <div className="section-head">
          <h2 id="work-heading">selected work</h2>
          <span>{projects.length} projects</span>
        </div>
        <ul className="work-grid">
          {projects.map((project, index) => (
            <li key={project.slug} className={project.product ? 'has-product' : undefined}>
              <Link className="work-card panel" to={`/work/${project.slug}`}>
                <span className="card-meta">
                  <span>
                    {String(index + 1).padStart(2, '0')} / {project.kind.toLowerCase()}
                  </span>
                  {project.live ? <span className="badge on">live</span> : <span>{project.year}</span>}
                </span>
                <h3>
                  {project.title}
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                </h3>
                <p>{project.summary}</p>
                <ul className="tags" aria-label="Stack">
                  {project.stack.map((tech) => (
                    <li key={tech}>{tech.toLowerCase()}</li>
                  ))}
                </ul>
              </Link>
              {/* A second link can't sit inside the card's own link, so it's placed over the card's foot. */}
              {project.product && (
                <Link className="work-product" to={project.product.to}>
                  {project.product.label} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="how-heading">
        <div className="section-head">
          <h2 id="how-heading">how i work</h2>
          <Link to="/how-i-work">the process on a real project →</Link>
        </div>
        <ul className="principles principles-four">
          {profile.principles.map((principle, index) => (
            <li key={principle.title} className="principle panel">
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="hire" className="section" aria-labelledby="hire-heading">
        <div className="section-head">
          <h2 id="hire-heading">work with me</h2>
          <a href={profile.bookingUrl}>book an intro call →</a>
        </div>
        <ul className="engagements">
          {profile.engagements.map((engagement) => (
            <li key={engagement.title} className="panel">
              <h3>{engagement.title}</h3>
              <p>{engagement.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="about" className="section" aria-labelledby="about-heading">
        <div className="section-head">
          <h2 id="about-heading">about</h2>
        </div>
        <div className="about">
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>


      <section id="lab" className="section" aria-labelledby="lab-heading">
        <div className="section-head">
          <h2 id="lab-heading">lab</h2>
          <span>hardware side projects</span>
        </div>
        <p className="section-intro">{labIntro}</p>
        <ul className="lab-grid">
          {lab.map((item) => (
            <li key={item.title} className="lab-item panel">
              <span className="card-meta">
                <span>{item.hardware.toLowerCase()}</span>
                <span className={item.status === 'working' ? 'badge on' : 'badge'}>{item.status}</span>
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <ContactSection />
    </>
  )
}
