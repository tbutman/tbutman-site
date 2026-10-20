import { Link } from 'react-router'
import { hub } from '../content/booth/hub'
import { BoothRender } from './BoothRender'

// /tilde's booth section (#booth): the whole booth table and a way into each station, for anyone who
// reaches taptilde.com without tapping a lid. English only (tilde-review/briefs/booth-site.md).
export default function BoothHub() {
  return (
    <section id="booth" className="section booth-hub" aria-labelledby="booth-heading">
      <div className="section-head">
        <h2 id="booth-heading">{hub.heading}</h2>
      </div>
      {hub.draft && <p className="booth-draft">[TBD] Draft copy: docs’ text for this section isn’t in yet.</p>}
      <p className="product-body booth-intro">{hub.body}</p>
      <BoothRender id={hub.image} ratio="wide" />
      <ul className="booth-stations">
        {hub.stations.map(({ station, title, body }) => (
          <li key={station.path}>
            <Link className="panel" to={station.path}>
              <BoothRender id={station.hero.image} ratio={station.hero.ratio} size="medium" />
              <b>{title} →</b>
              <span>{body}</span>
              <small>{station.shortLink}</small>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
