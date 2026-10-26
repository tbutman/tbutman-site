import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import { getMeta } from './meta'
import Hello from './pages/Hello'
import Home from './pages/Home'
import HowIWork from './pages/HowIWork'
import NotFound from './pages/NotFound'
import Project from './pages/Project'
import Resume from './pages/Resume'
import Thanks from './pages/Thanks'
import Tilde, { AppSections } from './pages/Tilde'
import TildePrivacy from './pages/TildePrivacy'
import PackagePage from './pages/PackagePage'
import SupportPage from './pages/SupportPage'
import TildeCard from './pages/TildeCard'
import { AppPage, FobsPage, HomePage, UsesPage } from './booth'

function useDocumentMeta() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const meta = getMeta(pathname)
    document.title = meta.title
    document.documentElement.lang = meta.lang
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
    // A target inside a fold (the card's print guide, the app's extras) opens it first.
    const target = hash ? document.getElementById(hash.slice(1)) : null
    for (let fold = target?.closest('details'); fold; fold = fold.parentElement?.closest('details')) fold.open = true
    if (target) target.scrollIntoView()
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
          <Route path="/resume" element={<Resume />} />
          {/* The old address, still on LinkedIn and printed material; nginx redirects it too. */}
          <Route path="/cv" element={<Navigate to="/resume" replace />} />
          <Route path="/how-i-work" element={<HowIWork />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/hello" element={<Hello locale="en" />} />
          <Route path="/pt/hello" element={<Hello locale="pt" />} />
          <Route path="/tilde" element={<Tilde locale="en" />} />
          <Route path="/pt/tilde" element={<Tilde locale="pt" />} />
          <Route path="/tilde/privacy" element={<TildePrivacy locale="en" />} />
          <Route path="/pt/tilde/privacy" element={<TildePrivacy locale="pt" />} />
          <Route path="/tilde/card" element={<TildeCard locale="en" />} />
          <Route path="/pt/tilde/card" element={<TildeCard locale="pt" />} />
          {/* The booth's stations (English only): taptilde.com/fobs, /uses and /app. */}
          <Route path="/tilde/fobs" element={<FobsPage />} />
          <Route path="/tilde/uses" element={<UsesPage />} />
          <Route path="/tilde/app" element={<AppPage insert={<AppSections locale="en" fold />} />} />
          <Route path="/tilde/home" element={<HomePage />} />
          <Route path="/tilde/p" element={<PackagePage />} />
          <Route path="/tilde/support" element={<SupportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}
