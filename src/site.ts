// Which site this build is (Thomas, October 26: taptilde.com as its own site; one repo, two builds,
// two hostnames, the same server). The main build is tbutman.com; the Tilde build (SITE=tilde, into
// dist-tilde/) is taptilde.com, with the Tilde pages at its root. The pages are the same components
// on both, written with tbutman.com's paths (/tilde/card); sitePath() turns them into this site's.

export type Site = 'main' | 'tilde'
export const SITE: Site = __SITE__
export const MAIN_ORIGIN = 'https://tbutman.com'
export const TILDE_ORIGIN = 'https://taptilde.com'

// /tilde, /tilde/card, /pt/tilde, /pt/tilde/card, with an optional ?query and #fragment.
const TILDE_PATH = /^(\/pt)?\/tilde(\/[^?#]*)?([?#].*)?$/

/** A Tilde path's twin on taptilde.com ("/tilde/card#x" → "/card#x", "/pt/tilde" → "/pt"), or null if it isn't one. */
export function tildeTwin(path: string): string | null {
  const m = path.match(TILDE_PATH)
  if (!m) return null
  const [, pt = '', rest = '', tail = ''] = m
  return `${pt}${rest}` ? `${pt}${rest}${tail}` : `/${tail}`
}

/** The inverse: a taptilde.com path ("/card", "/pt") as the page's path on tbutman.com ("/tilde/card", "/pt/tilde"). */
export function internalPath(path: string): string {
  const pt = path === '/pt' || path.startsWith('/pt/')
  const rest = pt ? path.slice(3) : path
  return `${pt ? '/pt' : ''}/tilde${rest === '/' || rest === '' ? '' : rest}`
}

/**
 * A link as this site writes it. On tbutman.com: unchanged. On taptilde.com: a Tilde path becomes its
 * twin at the root, and any other path of tbutman.com (the résumé, the case study) goes there in full.
 * Absolute URLs, #fragments and mailto: links are left alone.
 */
export function sitePath(path: string): string {
  if (SITE === 'main' || !path.startsWith('/')) return path
  return tildeTwin(path) ?? `${MAIN_ORIGIN}${path}`
}
