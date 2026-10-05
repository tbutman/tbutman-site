import { profile } from './content/profile'
import { processIntro } from './content/process'
import { findProject } from './content/projects'
import { helloText } from './content/hello'
import { tildeText } from './content/tilde'
import { alternatesFor, htmlLang, localeOf, type Locale } from './i18n'

export type Meta = {
  title: string
  description: string
  /** Keep the page out of search results and the sitemap. */
  noindex?: boolean
  /** The link-preview image in public/og/, drawn by scripts/og-images.mjs. */
  image: string
  /** The page's <html lang>. */
  lang: string
  /** Both language versions of a translated page, for hreflang links. */
  alternates?: Record<Locale, string>
}

const defaultDescription = `${profile.name} is a ${profile.role.toLowerCase()} in ${profile.location}. ${profile.lede}`

export function getMeta(pathname: string): Meta {
  return {
    image: '/og/home.png',
    lang: htmlLang[localeOf(pathname)],
    alternates: alternatesFor(pathname),
    ...pageMeta(pathname),
  }
}

function pageMeta(pathname: string): Omit<Meta, 'image' | 'lang'> & { image?: string } {
  if (pathname === '/') {
    return { title: `${profile.name} · ${profile.role}`, description: defaultDescription }
  }
  if (pathname === '/how-i-work') {
    return { title: `${processIntro.title} · ${profile.name}`, description: processIntro.lede, image: '/og/how-i-work.png' }
  }
  if (pathname === '/thanks') {
    return { title: `Message sent · ${profile.name}`, description: defaultDescription, noindex: true }
  }
  if (pathname === '/hello') {
    // Only reached from the printed business card.
    return { title: `Hello · ${profile.name}`, description: defaultDescription, noindex: true }
  }
  if (pathname === '/pt/hello') {
    return { title: `Olá · ${profile.name}`, description: helloText.pt.bio, noindex: true }
  }
  if (pathname === '/tilde') {
    return { title: 'Tilde · a free NFC business card app for Android', description: tildeText.en.lede, image: '/og/tilde.png' }
  }
  if (pathname === '/pt/tilde') {
    return { title: 'Tilde · cartão de visita NFC grátis para Android', description: tildeText.pt.lede, image: '/og/tilde.png' }
  }
  if (pathname === '/cv') {
    return { title: `CV · ${profile.name}`, description: defaultDescription }
  }
  const project = findProject(pathname.match(/^\/work\/([^/]+)$/)?.[1])
  if (project) {
    return { title: `${project.title} · ${profile.name}`, description: project.summary, image: `/og/work-${project.slug}.png` }
  }
  return { title: `Not found · ${profile.name}`, description: defaultDescription }
}
