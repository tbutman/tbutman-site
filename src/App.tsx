import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { getMeta } from './meta'
import Cv from './pages/Cv'
import Hello from './pages/Hello'
import Home from './pages/Home'
import HowIWork from './pages/HowIWork'
import NotFound from './pages/NotFound'
import Project from './pages/Project'
import Thanks from './pages/Thanks'
import Tilde from './pages/Tilde'
import TildePrivacy from './pages/TildePrivacy'

function useDocumentMeta() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const meta = getMeta(pathname)
    document.title = meta.title
    document.documentElement.lang = meta.lang
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
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/hello" element={<Hello locale="en" />} />
          <Route path="/pt/hello" element={<Hello locale="pt" />} />
          <Route path="/tilde" element={<Tilde locale="en" />} />
          <Route path="/pt/tilde" element={<Tilde locale="pt" />} />
          <Route path="/tilde/privacy" element={<TildePrivacy locale="en" />} />
          <Route path="/pt/tilde/privacy" element={<TildePrivacy locale="pt" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}
