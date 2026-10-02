import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { getMeta } from './meta'
import Cv from './pages/Cv'
import Home from './pages/Home'
import HowIWork from './pages/HowIWork'
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
    <div className="shell">
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:slug" element={<Project />} />
          <Route path="/cv" element={<Cv />} />
          <Route path="/how-i-work" element={<HowIWork />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}
