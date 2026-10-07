// /hello and /pt/hello: where the printed business card's QR code and NFC tag point, and what
// Thomas's phone shares through Tilde. Visitors arrive on a phone, usually right after meeting
// Thomas at an event; a phone set to Portuguese gets /pt/hello (see src/components/LangSwitch.tsx).
// Both are open source: github.com/tbutman/tilde-card and github.com/tbutman/tilde. Kept out of
// search and the sitemap (see src/meta.ts). The social accounts appear only here: people meeting
// Thomas in person may want them, but the rest of the site is for hiring.
//
// The English bio and availability come from profile.ts so the facts stay in one place; the
// Portuguese ones are translations of them, so change both together. European Portuguese (pt-PT),
// informal "tu".
import type { Locale } from '../i18n'
import { profile } from './profile'

const shared = {
  // Generated at build time by src/lib/vcard.ts; nginx serves it as text/vcard.
  vcardPath: '/thomas-butman.vcf',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/t.butman/' },
    { label: 'X', href: 'https://x.com/tbutman' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/thomasbutman' },
  ],
}

const en = {
  status: 'you tapped or scanned my card',
  headline: ['Hi, I’m Thomas.', 'Good to meet you.'],
  intro:
    'You got here from my business card or my phone. The card is one I designed and 3D-printed, with an NFC sticker sealed inside it halfway through the print. The phone runs Tilde, an open-source Android app I wrote that makes it work like the card. This page is served from a small server in my home in Lisbon.',
  openTo: 'open to',
  availability: profile.availability.toLowerCase(),
  engagement: profile.engagement.toLowerCase(),
  keepInTouchHeading: 'keep in touch',
  copy: { idle: 'copy', copied: 'copied ✓', selected: 'selected', copiedAnnounce: 'Email address copied', selectedAnnounce: 'Email address selected' },
  saveContact: 'save my contact',
  workHeading: 'work with me',
  bookCall: 'book a 20-minute intro call ↗',
  cv: 'cv',
  fullSite: 'the full site →',
  aboutHeading: 'about me',
  bio: profile.lede,
  diagramHeading: 'how this page reached you',
  diagram: 'hello',
  cardNote:
    'The 3D model generates its own QR code, and a script decodes it from the exported model before anything is printed.',
  projectLink: { label: 'get the app or print the card, free →', to: '/tilde' },
}

export type HelloText = typeof en

const pt: HelloText = {
  status: 'tocaste ou leste o meu cartão',
  // A non-breaking hyphen (U+2011) keeps “conhecer‑te” on one line in the large headline.
  headline: ['Olá, sou o Thomas.', 'Prazer em conhecer\u2011te.'],
  intro:
    'Chegaste aqui pelo meu cartão de visita ou pelo meu telemóvel. O cartão fui eu que o desenhei e imprimi em 3D, com um autocolante NFC selado lá dentro a meio da impressão. O telemóvel tem a Tilde, uma app Android de código aberto que escrevi para funcionar como o cartão. Esta página é servida a partir de um pequeno servidor na minha casa, em Lisboa.',
  openTo: 'disponível para',
  availability: 'remoto (EUA) ou presencial em Lisboa',
  engagement: 'tempo inteiro ou contrato',
  keepInTouchHeading: 'vamos manter o contacto',
  copy: { idle: 'copiar', copied: 'copiado ✓', selected: 'selecionado', copiedAnnounce: 'Endereço de email copiado', selectedAnnounce: 'Endereço de email selecionado' },
  saveContact: 'guardar o meu contacto',
  workHeading: 'trabalhar comigo',
  bookCall: 'marcar uma conversa de 20 minutos ↗',
  cv: 'cv (em inglês)',
  fullSite: 'o site completo (em inglês) →',
  aboutHeading: 'sobre mim',
  bio: 'Engenheiro de produto sénior, com dez anos em fintech e muita experiência em React. Fui responsável pelo frontend das aplicações de pagamento da DigitalPay e hoje construo produtos full-stack, do modelo de dados até à produção.',
  diagramHeading: 'como esta página chegou até ti',
  diagram: 'hello-pt',
  cardNote:
    'O modelo 3D gera o seu próprio código QR, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
  projectLink: { label: 'obtém a app ou imprime o cartão, grátis →', to: '/pt/tilde' },
}

export const helloText: Record<Locale, HelloText> = { en, pt }

/** The shared parts and the English text, for the vCard and other English-only uses. */
export const hello = { ...shared, ...en }
export { shared as helloShared }
