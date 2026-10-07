import { profile } from '../content/profile'

// scripts/prerender.mjs measures each page after the build and swaps this token for the
// real size, mirroring it into a meta tag so hydration reads the same value.
const PAGE_WEIGHT_TOKEN = '__PAGE_WEIGHT__'

// The build date in US style ("October 7, 2026"). UTC, so the server and the browser agree.
const buildDate = __BUILD_DATE__
  ? new Date(`${__BUILD_DATE__}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  : ''

function pageWeight() {
  if (typeof document === 'undefined') return PAGE_WEIGHT_TOKEN
  return document.querySelector<HTMLMetaElement>('meta[name="page-weight"]')?.content ?? ''
}

export default function SiteFooter() {
  const weight = pageWeight()

  return (
    <footer className="site-footer">
      <p>© {profile.name}</p>
      <p className="proof" aria-label="How this site is built">
        {__BUILD_COMMIT__ && (
          <span>
            build <b>{__BUILD_COMMIT__}</b> · {buildDate}
          </span>
        )}
        {weight && (
          <span>
            <b>{weight}</b> over the wire
          </span>
        )}
        <span>
          <b>0</b> cookies · <b>0</b> trackers
        </span>
        <span>self-hosted in Lisbon</span>
      </p>
    </footer>
  )
}
