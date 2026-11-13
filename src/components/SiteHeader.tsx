import { Link, useLocation } from 'react-router'
import { profile } from '../content/profile'
import CommandPalette from './CommandPalette'
import HelloPhoto from './HelloPhoto'
import LangSwitch from './LangSwitch'
import { translations } from '../i18n'

const navItems = [
  { label: 'experience', to: '/#experience', section: 'experience' },
  { label: 'work', to: '/#work', section: 'work' },
  { label: 'about', to: '/#about', section: 'about' },
  { label: 'lab', to: '/#lab', section: 'lab' },
  { label: 'résumé', to: '/resume', section: 'resume' },
  // Tilde has its own site (Thomas, October 26): a plain link there.
  { label: 'tilde ↗', to: 'https://taptilde.com', section: 'tilde' },
]

function currentSection(pathname: string) {
  if (pathname.startsWith('/work/')) return 'work'
  if (pathname === '/resume') return 'resume'
  return undefined
}

export default function SiteHeader() {
  const { pathname } = useLocation()
  const active = currentSection(pathname)
  // /hello's photo, as a small avatar before the name (src/components/HelloPhoto.tsx).
  const hello = pathname === '/hello' ? 'en' : pathname === '/pt/hello' ? 'pt' : null

  return (
    <header className={hello ? 'site-header site-header-hello' : 'site-header'}>
      <div className="site-brand">
        {hello && <HelloPhoto locale={hello} />}
        <Link to="/" className="site-name" aria-label={`${profile.name}, home`}>
          <b>~/</b>tbutman
        </Link>
      </div>
      <nav className="site-nav" aria-label="Primary">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            aria-current={active === item.section ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
        <Link to="/#contact">contact</Link>
        <CommandPalette />
      </nav>
      {/* /hello's EN · PT on a row of its own, under the menu (Thomas). */}
      {hello && <LangSwitch locale={hello} paths={{ en: '/hello', pt: translations['/hello'] }} />}
    </header>
  )
}
