// The few pages with a Portuguese version: /hello (where the business card and Tilde lead) and the
// Tilde product and privacy pages, for people Thomas meets in person in Portugal. Everything else is English.
export type Locale = 'en' | 'pt'

/** The <html lang> value for each locale: European Portuguese, not Brazilian. */
export const htmlLang: Record<Locale, string> = { en: 'en', pt: 'pt-PT' }

/** English path → Portuguese path, for every translated page. */
export const translations: Record<string, string> = {
  '/hello': '/pt/hello',
  '/tilde': '/pt/tilde',
  '/tilde/privacy': '/pt/tilde/privacy',
}

/** Both versions of a translated page, from either of its paths. */
export function alternatesFor(pathname: string): Record<Locale, string> | undefined {
  for (const [en, pt] of Object.entries(translations)) {
    if (pathname === en || pathname === pt) return { en, pt }
  }
  return undefined
}

export const localeOf = (pathname: string): Locale => (pathname.startsWith('/pt/') ? 'pt' : 'en')

// A visitor's explicit choice (from the EN · PT switch) beats their phone's language. Storage can
// be unavailable (private mode, blocked site data), so every access is guarded.
const KEY = 'tbutman-lang'

export function savedLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(KEY)
    return value === 'en' || value === 'pt' ? value : null
  } catch {
    return null
  }
}

export function saveLocale(locale: Locale) {
  try {
    window.localStorage.setItem(KEY, locale)
  } catch {
    // The switch still works; the choice just isn't remembered.
  }
}

/**
 * True when the browser ranks Portuguese above English. Browsers often list many languages (one
 * here listed 35, with Portuguese 13th), so only the order of the two this site offers counts.
 */
export function prefersPortuguese() {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  const first = languages.map((lang) => lang?.toLowerCase().slice(0, 2)).find((lang) => lang === 'pt' || lang === 'en')
  return first === 'pt'
}
