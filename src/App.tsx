import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router'
import { profile } from './content/profile'
import { getMeta } from './meta'
import Cv from './pages/Cv'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Project from './pages/Project'

function useDocumentMeta() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const meta = getMeta(pathname)
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
}

export default function App() {
  useDocumentMeta()

  return (
    <>
      <header className="site-header">
        <Link to="/" className="site-name">
          {profile.name}
        </Link>
        <nav aria-label="Primary">
          <Link to="/#work">Work</Link>
          <Link to="/#about">About</Link>
          <Link to="/#experience">Experience</Link>
          <Link to="/cv">CV</Link>
          <a href={`mailto:${profile.email}`}>Contact</a>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:slug" element={<Project />} />
          <Route path="/cv" element={<Cv />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>
          © {profile.name} · {profile.location}
        </p>
      </footer>
    </>
  )
}
