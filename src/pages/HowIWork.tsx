import { Link } from 'react-router'
import { processIntro, processPrinciples, processStats, processSteps } from '../content/process'

export default function HowIWork() {
  return (
    <article className="process">
      <Link className="back-link" to="/">
        ← home
      </Link>
      <p className="card-meta">
        <span>process · told through pepalert</span>
      </p>
      <h1>{processIntro.title}</h1>
      <p className="lede">{processIntro.lede}</p>

      <dl className="stats">
        {processStats.map((stat) => (
          <div key={stat.label} className="panel">
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <ol className="steps">
        {processSteps.map((step, index) => (
          <li key={step.title} className="step">
            <div className="step-text">
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <h2>{step.title}</h2>
              {step.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {step.excerpt && (
              <figure className="excerpt panel">
                <figcaption>{step.excerpt.file}</figcaption>
                <pre>
                  <code>{step.excerpt.text}</code>
                </pre>
              </figure>
            )}
          </li>
        ))}
      </ol>

      <section className="case-section" aria-labelledby="principles-heading">
        <div className="section-head">
          <h2 id="principles-heading">what stays constant</h2>
        </div>
        <ul className="principles">
          {processPrinciples.map((principle, index) => (
            <li key={principle.title} className="principle panel">
              <span className="num">{String(index + 1).padStart(2, '0')}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="button-row">
        <Link className="button primary" to="/work/pepalert">
          pepalert case study
        </Link>
        <a className="button" href="https://pepalert.com">
          visit pepalert.com ↗
        </a>
      </div>
    </article>
  )
}
