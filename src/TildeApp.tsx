import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { AppPage, FobsPage, HomePage, UsesPage } from './booth'
import TildeFooter from './components/TildeFooter'
import TildeHeader from './components/TildeHeader'
import { Link } from './components/SiteLink'
import { getMeta } from './meta'
import Tilde, { AppSections } from './pages/Tilde'
import PackagePage from './pages/PackagePage'
import SupportPage from './pages/SupportPage'
import TildeCard from './pages/TildeCard'
import TildePrivacy from './pages/TildePrivacy'
import { internalPath } from './site'

// taptilde.com (SITE=tilde): Tilde's pages at the root, with Tilde's own header and footer, and the
// same components and stylesheet as tbutman.com (src/App.tsx), so the two never drift. Each page's
// title and description are tbutman.com's for its twin (src/site.ts, internalPath).

function useDocumentMeta() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const meta = getMeta(internalPath(pathname))
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

function NotFound() {
  return (
    <section className="not-found">
      <p className="status">
        <span className="status-dot" aria-hidden="true" />
        404
      </p>
      <h1>Nothing at this path.</h1>
      <p>
        The page may have moved. <Link to="/tilde">Back to Tilde →</Link>
      </p>
    </section>
  )
}

export default function TildeApp() {
  useDocumentMeta()

  return (
    <div className="shell">
      <TildeHeader />
      <main>
        <Routes>
          <Route path="/" element={<Tilde locale="en" />} />
          <Route path="/pt" element={<Tilde locale="pt" />} />
          <Route path="/card" element={<TildeCard locale="en" />} />
          <Route path="/pt/card" element={<TildeCard locale="pt" />} />
          <Route path="/fobs" element={<FobsPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/p" element={<PackagePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/uses" element={<UsesPage />} />
          <Route path="/app" element={<AppPage insert={<AppSections locale="en" fold />} />} />
          <Route path="/privacy" element={<TildePrivacy locale="en" />} />
          <Route path="/pt/privacy" element={<TildePrivacy locale="pt" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <TildeFooter />
    </div>
  )
}
