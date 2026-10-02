import { Link, useLocation } from 'react-router'
import { profile } from '../content/profile'

const navItems = [
  { label: 'work', to: '/#work', section: 'work' },
  { label: 'lab', to: '/#lab', section: 'lab' },
  { label: 'about', to: '/#about', section: 'about' },
  { label: 'experience', to: '/#experience', section: 'experience' },
  { label: 'cv', to: '/cv', section: 'cv' },
]

function currentSection(pathname: string) {
  if (pathname.startsWith('/work/')) return 'work'
  if (pathname === '/cv') return 'cv'
  return undefined
}

export default function SiteHeader() {
  const active = currentSection(useLocation().pathname)

  return (
    <header className="site-header">
      <Link to="/" className="site-name" aria-label={`${profile.name}, home`}>
        <b>~/</b>tbutman
      </Link>
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
        <a href={`mailto:${profile.email}`}>contact</a>
      </nav>
    </header>
  )
}
