import { profile } from '../content/profile'
import { MAIN_ORIGIN } from '../site'
import SiteFooter from './SiteFooter'
import { Link } from './SiteLink'

// taptilde.com's footer: who made Tilde, plainly, with a link to him and to how it was built (the
// case study on tbutman.com), and the privacy page; then the same proof line as tbutman.com.
export default function TildeFooter() {
  return (
    <SiteFooter
      lead={
        <p className="tilde-made-by">
          Tilde is made by <a href={`${MAIN_ORIGIN}/`}>{profile.name}</a> · <a href={`${MAIN_ORIGIN}/work/tilde`}>how it was built</a> ·{' '}
          <Link to="/tilde/privacy">privacy</Link> · <Link to="/tilde/support">support Tilde</Link>
        </p>
      }
    />
  )
}
