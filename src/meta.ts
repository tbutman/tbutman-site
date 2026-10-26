import { profile } from './content/profile'
import { processIntro } from './content/process'
import { findProject } from './content/projects'
import { helloText } from './content/hello'
import { tildeText } from './content/tilde'
import { tildePrivacyText } from './content/tildePrivacy'
import { tildeCardText } from './content/tildeCard'
import boothLedes from './content/booth/copy/ledes.json'
import products from './content/booth/copy/products.json'
import { alternatesFor, htmlLang, localeOf, type Locale } from './i18n'

export type Meta = {
  title: string
  description: string
  /** Keep the page out of search results and the sitemap. */
  noindex?: boolean
  /** The link-preview image in public/og/, drawn by scripts/og-images.mjs (Tilde's: tilde-media). */
  image: string
  /** What the preview image shows, when it says more than the title (tilde-media's alt.json). */
  imageAlt?: string
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
    // The family's hub (finish-line plan §3): docs' hub description, and media's preview for the family.
    return { title: 'Tilde · everyday objects you can tap or scan', description: boothLedes.hub, image: '/og/tilde-hub.png', imageAlt: 'Tilde: Print it. Tap it. A Tilde Card for Jane Doe, a sticky note, a Premium coin and a Base tag.' }
  }
  if (pathname === '/pt/tilde') {
    return { title: 'Tilde · cartão de visita NFC grátis para Android', description: tildeText.pt.lede, image: '/og/tilde-pt.png', imageAlt: 'Tilde: O teu cartão de visita, no teu telemóvel. Um telemóvel com o cartão e o código QR de Jane Doe, e um cartão Tilde preto.' }
  }
  if (pathname === '/tilde/privacy') {
    return { title: 'Tilde privacy · your details stay on your phone', description: tildePrivacyText.en.lede, image: '/og/tilde-privacy.png', imageAlt: 'Tilde privacy: Your details stay on your phone. A phone showing the Met list, and a black Tilde Card for Jane Doe with a QR code.' }
  }
  if (pathname === '/pt/tilde/privacy') {
    return { title: 'Privacidade da Tilde · os teus dados ficam no teu telemóvel', description: tildePrivacyText.pt.lede, image: '/og/tilde-privacy-pt.png', imageAlt: 'Privacidade da Tilde: Os teus dados ficam no teu telemóvel. Um telemóvel com a lista de conhecidos e um cartão Tilde preto.' }
  }
  // Each page's own preview, from media (tilde-media/web/og, October 26), with media's alt lines.
  if (pathname === '/tilde/fobs') {
    return { title: 'Tilde Fobs · every shape, color and icon', description: boothLedes.fobs, image: '/og/tilde-fobs.png', imageAlt: 'Tilde Fobs: Your link, on your keys. A Premium coin and a Base tag, front and back, orange on black.' }
  }
  if (pathname === '/tilde/home') {
    return { title: 'Tilde Home & desk · notes, a coaster and stands you can tap', description: homeDescription(), image: '/og/tilde-home.png', imageAlt: 'Tilde Home & desk: a tap away. A sticky note and a grocery list on a fridge, and a desk calendar.' }
  }
  if (pathname === '/tilde/uses') {
    return { title: 'Tilde use cases · one tag, one job', description: boothLedes.uses, image: '/og/tilde-uses.png', imageAlt: 'Tilde use cases: One tag, one job. Ten tags on a ring, each with a different icon.' }
  }
  if (pathname === '/tilde/app') {
    return { title: 'Tilde for Android · write your own tags, or tap your phone', description: (boothLedes as Record<string, string>).app ?? tildeText.en.lede, image: '/og/tilde-app.png', imageAlt: 'Tilde for Android: Your business card, on your phone. A phone showing Jane Doe’s card and QR code.' }
  }
  if (pathname === '/tilde/card') {
    return { title: 'Tilde Card · countless designs, and how to print yours', description: boothLedes.cards, image: '/og/tilde-card.png', imageAlt: 'Tilde Card: Print your own business card. A photo of a printed black Tilde Card for Jane Doe with a QR code, held in a hand.' }
  }
  if (pathname === '/pt/tilde/card') {
    return { title: 'Cartão Tilde · imprime o teu cartão de visita', description: tildeCardText.pt.lede, image: '/og/tilde-card-pt.png', imageAlt: 'Cartão Tilde: Imprime o teu cartão de visita. Uma fotografia de um cartão Tilde preto impresso para Jane Doe, com um código QR, numa mão.' }
  }
  if (pathname === '/resume') {
    return { title: `Résumé · ${profile.name}`, description: defaultDescription }
  }
  const project = findProject(pathname.match(/^\/work\/([^/]+)$/)?.[1])
  if (project) {
    return {
      title: `${project.title} · ${profile.name}`,
      description: project.summary,
      image: `/og/work-${project.slug}.png`,
      ...(project.slug === 'tilde' ? { imageAlt: 'Case study: Tilde, a free, open-source Android app and a 3D-printable business card. A phone showing Jane Doe’s card, and a black Tilde Card for Jane Doe with a QR code.' } : {}),
    }
  }
  return { title: `Not found · ${profile.name}`, description: defaultDescription }
}

/** Home & desk's description: its line in docs' product sheet ("Four families"), without Markdown. */
function homeDescription(): string {
  for (const section of products.sections as { id: string; blocks: { type: string; items?: { text: string }[] }[] }[]) {
    if (section.id !== 'the-family') continue
    for (const block of section.blocks) {
      const item = block.items?.find((entry) => entry.text.startsWith('**Home & desk:**'))
      if (item) {
        const line = item.text.slice('**Home & desk:**'.length).replace(/\*\*|`/g, '').trim()
        return line.charAt(0).toUpperCase() + line.slice(1)
      }
    }
  }
  return boothLedes.hub
}
