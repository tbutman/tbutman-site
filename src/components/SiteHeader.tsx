import { Link, useLocation } from 'react-router'
import { profile } from '../content/profile'
import CommandPalette from './CommandPalette'

const navItems = [
  { label: 'experience', to: '/#experience', section: 'experience' },
  { label: 'work', to: '/#work', section: 'work' },
  { label: 'about', to: '/#about', section: 'about' },
  { label: 'lab', to: '/#lab', section: 'lab' },
  { label: 'résumé', to: '/resume', section: 'resume' },
]

function currentSection(pathname: string) {
  if (pathname.startsWith('/work/')) return 'work'
  if (pathname === '/resume') return 'resume'
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
        <Link to="/#contact">contact</Link>
        <CommandPalette />
      </nav>
    </header>
  )
}
