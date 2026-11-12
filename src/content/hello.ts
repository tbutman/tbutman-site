// /hello and /pt/hello: where the printed Tilde Card's QR code and NFC sticker point, and what
// Thomas's phone shares through Tilde. Visitors arrive on a phone, usually right after meeting
// Thomas at an event; a phone set to Portuguese gets /pt/hello (see src/components/LangSwitch.tsx).
// Both are open source: github.com/tbutman/tilde-card and github.com/tbutman/tilde. Kept out of
// search and the sitemap (see src/meta.ts). The social accounts appear only here: people meeting
// Thomas in person may want them, but the rest of the site is for hiring.
//
// The English bio and availability come from profile.ts so the facts stay in one place; the
// Portuguese ones are translations of them, so change both together. European Portuguese (pt-PT),
// informal "tu".
//
// The status line, the intro's opening, the diagram's first steps and the note under it follow where
// the visitor came from (src/lib/arrival.ts): the card's QR code or NFC sticker, the keychain, one
// of Thomas's phones, or another code or tag of his. 'link' is the default, for a link and for
// anything printed or shared before the ?from= values, so it fits all of them.
import type { Locale } from '../i18n'
import type { Arrival } from '../lib/arrival'
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

type Step = { label: string; detail: string }
/**
 * What changes with where the visitor came from. The diagram starts at Thomas's card, keychain or
 * phone (`mine`, in a column of its own) and then the visitor's phone (`yours`); a plain link has no
 * `mine`.
 */
type ArrivalText = { status: string; intro: string; mine: Step | null; yours: Step; note: string }

const en = {
  headline: ['Hi, I’m Thomas.', 'Good to meet you.'],
  arrivals: {
    link: {
      status: 'you found my hello page',
      intro: 'This is where my business card, my keychain and my phone send people. They’re Tilde, an open-source project of mine: a business card and keychain fobs I designed and 3D-printed, each with an NFC sticker inside, and an Android app that makes a phone work like the card.',
      mine: null,
      yours: { label: 'Your phone or computer', detail: 'a link, a tap or a scan' },
      note: 'The card’s 3D model generates its own QR code, and a script decodes it from the exported model before anything is printed.',
    },
    'card-qr': {
      status: 'you scanned my card',
      intro: 'You scanned the QR code on my business card. It’s a Tilde Card I designed and 3D-printed, with an NFC sticker pressed in between its two printed pieces, so a tap works too.',
      mine: { label: 'My business card', detail: 'a QR code on the front' },
      yours: { label: 'Your phone', detail: 'scanned the code' },
      note: 'The 3D model generates its own QR code, and a script decodes it from the exported model before anything is printed.',
    },
    'card-nfc': {
      status: 'you tapped my card',
      intro: 'You tapped my business card. It’s a Tilde Card I designed and 3D-printed, with an NFC sticker pressed in between its two printed pieces.',
      mine: { label: 'My business card', detail: 'an NFC sticker inside' },
      yours: { label: 'Your phone', detail: 'tapped the card' },
      note: 'There’s a QR code on the front too, for phones without NFC. The 3D model generates it, and a script decodes it from the exported model before anything is printed.',
    },
    'key-qr': {
      status: 'you scanned my keychain',
      intro: 'You scanned the QR tag on my keys, a companion to my business card, which is a Tilde Card I designed and 3D-printed. The tag is printed the same way, with an NFC sticker inside, so a tap works too.',
      mine: { label: 'My keychain', detail: 'a QR tag' },
      yours: { label: 'Your phone', detail: 'scanned the tag' },
      note: 'The tag’s size follows its link: the 3D model picks the smallest QR code that holds it.',
    },
    fob: {
      status: 'you tapped my keychain',
      intro: 'You tapped the fob on my keys, a companion to my business card. Both are Tilde designs I 3D-printed, with an NFC sticker inside.',
      mine: { label: 'My keychain', detail: 'an NFC sticker inside' },
      yours: { label: 'Your phone', detail: 'tapped it' },
      note: 'The fob’s two pieces twist shut with a quarter turn and no glue, so the sticker inside can be swapped.',
    },
    phone: {
      status: 'you got this from my phone',
      intro: 'You got this from my phone. My Android phone runs Tilde, an open-source app I wrote that makes a phone work like my business card, a Tilde Card I designed and 3D-printed.',
      mine: { label: 'My phone', detail: 'a tap or a code' },
      yours: { label: 'Your phone', detail: 'opened the link' },
      note: 'On my Android phone, Tilde shares it with a tap or a QR code, and your phone needs no app to read it.',
    },
    'phone-android': {
      status: 'you tapped or scanned my phone',
      intro: 'You got this from my Android phone. It runs Tilde, an open-source app I wrote that makes a phone work like my business card: a tap, or the QR code on its screen.',
      mine: { label: 'My Android phone', detail: 'running Tilde' },
      yours: { label: 'Your phone', detail: 'a tap or a scan' },
      note: 'Your phone didn’t need an app: it reads mine the way it reads an NFC sticker or a contactless business card.',
    },
    'phone-iphone': {
      status: 'you got this from my iphone',
      intro: 'You got this from my iPhone. My business card and keychain do the same with a tap or a scan: they’re Tilde, an open-source project of mine, 3D-printed with an NFC sticker inside.',
      mine: { label: 'My iPhone', detail: 'a shared link' },
      yours: { label: 'Your phone', detail: 'opened the link' },
      note: 'Tilde’s app is Android only for now, so on my iPhone the link is just a link.',
    },
    qr: {
      status: 'you scanned one of my codes',
      intro: 'You scanned one of my QR codes. They’re part of Tilde, an open-source project of mine: a business card and keychain fobs I designed and 3D-printed, and an Android app that makes a phone work like the card.',
      mine: { label: 'A code of mine', detail: 'a QR code' },
      yours: { label: 'Your phone', detail: 'scanned it' },
      note: 'The card’s 3D model generates its own QR code, and a script decodes it from the exported model before anything is printed.',
    },
    nfc: {
      status: 'you tapped one of my tags',
      intro: 'You tapped one of my NFC tags. They’re part of Tilde, an open-source project of mine: a business card and keychain fobs I designed and 3D-printed, and an Android app that makes a phone work like the card.',
      mine: { label: 'A tag of mine', detail: 'an NFC sticker' },
      yours: { label: 'Your phone', detail: 'tapped it' },
      note: 'Phones read a tag like this without any app. The 3D models and the app are open source.',
    },
  } satisfies Record<Arrival, ArrivalText>,
  introEnd: 'This page is served from a small server in my home in Lisbon.',
  openTo: 'open to',
  availability: profile.availability.toLowerCase(),
  engagement: profile.engagement.toLowerCase(),
  keepInTouchHeading: 'keep in touch',
  copy: { idle: 'copy', copied: 'copied ✓', selected: 'selected', copiedAnnounce: 'Email address copied', selectedAnnounce: 'Email address selected' },
  saveContact: 'save my contact',
  workHeading: 'work with me',
  bookCall: 'book a 20-minute intro call ↗',
  resume: 'résumé',
  fullSite: 'the full site →',
  aboutHeading: 'about me',
  bio: profile.lede,
  diagramHeading: 'how this page reached you',
  mineColumn: 'mine',
  diagram: 'hello',
  // Tilde is its own site (Thomas, October 26: src/site.ts).
  projectLink: { label: 'get the app or print a tilde card, free →', to: 'https://taptilde.com' },
  // For a hiring manager who got Thomas's own card (visitor round 2, item 27).
  buildLink: { label: 'how I built this →', to: '/work/tilde' },
}

export type HelloText = typeof en

const pt: HelloText = {
  // A non-breaking hyphen (U+2011) keeps “conhecer‑te” on one line in the large headline.
  headline: ['Olá, sou o Thomas.', 'Prazer em conhecer\u2011te.'],
  // New for the ?from= arrivals (PT: review).
  arrivals: {
    link: {
      status: 'encontraste a minha página',
      intro: 'É aqui que o meu cartão de visita, o meu porta-chaves e o meu telemóvel levam as pessoas. São a Tilde, um projeto meu de código aberto: um cartão de visita e porta-chaves que desenhei e imprimi em 3D, cada um com um autocolante NFC lá dentro, e uma app Android que põe um telemóvel a funcionar como o cartão.',
      mine: null,
      yours: { label: 'O teu navegador', detail: 'um link, toque ou código' },
      note: 'O modelo 3D do cartão gera o seu próprio código QR, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
    },
    'card-qr': {
      status: 'leste o código do meu cartão',
      intro: 'Leste o código QR do meu cartão de visita. É um cartão Tilde que desenhei e imprimi em 3D, com um autocolante NFC encaixado entre as suas duas peças impressas, por isso também funciona com um toque.',
      mine: { label: 'O meu cartão de visita', detail: 'um código QR na frente' },
      yours: { label: 'O teu telemóvel', detail: 'leu o código' },
      note: 'O modelo 3D gera o seu próprio código QR, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
    },
    'card-nfc': {
      status: 'tocaste no meu cartão',
      intro: 'Encostaste o telemóvel ao meu cartão de visita. É um cartão Tilde que desenhei e imprimi em 3D, com um autocolante NFC encaixado entre as suas duas peças impressas.',
      mine: { label: 'O meu cartão de visita', detail: 'com NFC lá dentro' },
      yours: { label: 'O teu telemóvel', detail: 'tocou no cartão' },
      note: 'Também há um código QR na frente, para telemóveis sem NFC. O modelo 3D gera-o, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
    },
    'key-qr': {
      status: 'leste o código do meu porta-chaves',
      intro: 'Leste a etiqueta QR das minhas chaves, que acompanha o meu cartão de visita, um cartão Tilde que desenhei e imprimi em 3D. A etiqueta é impressa da mesma forma, com um autocolante NFC lá dentro, por isso também funciona com um toque.',
      mine: { label: 'O meu porta-chaves', detail: 'uma etiqueta QR' },
      yours: { label: 'O teu telemóvel', detail: 'leu a etiqueta' },
      note: 'O tamanho da etiqueta acompanha o link: o modelo 3D escolhe o código QR mais pequeno que o comporta.',
    },
    fob: {
      status: 'tocaste no meu porta-chaves',
      intro: 'Encostaste o telemóvel ao porta-chaves das minhas chaves, que acompanha o meu cartão de visita. Ambos são designs Tilde que imprimi em 3D, com um autocolante NFC lá dentro.',
      mine: { label: 'O meu porta-chaves', detail: 'com NFC lá dentro' },
      yours: { label: 'O teu telemóvel', detail: 'tocou-lhe' },
      note: 'As duas peças do porta-chaves fecham com um quarto de volta e sem cola, por isso o autocolante lá dentro pode ser trocado.',
    },
    phone: {
      status: 'recebeste isto do meu telemóvel',
      intro: 'Recebeste isto do meu telemóvel. O meu Android tem a Tilde, uma app de código aberto que escrevi para pôr um telemóvel a funcionar como o meu cartão de visita, um cartão Tilde que desenhei e imprimi em 3D.',
      mine: { label: 'O meu telemóvel', detail: 'um toque ou um código' },
      yours: { label: 'O teu telemóvel', detail: 'abriu o link' },
      note: 'No meu Android, a Tilde partilha-o com um toque ou um código QR, e o teu telemóvel não precisa de nenhuma app para o ler.',
    },
    'phone-android': {
      status: 'tocaste ou leste o meu telemóvel',
      intro: 'Recebeste isto do meu telemóvel Android. Tem a Tilde, uma app de código aberto que escrevi para pôr um telemóvel a funcionar como o meu cartão de visita: um toque, ou o código QR no ecrã.',
      mine: { label: 'O meu Android', detail: 'com a Tilde' },
      yours: { label: 'O teu telemóvel', detail: 'um toque ou um código' },
      note: 'O teu telemóvel não precisou de nenhuma app: lê o meu como lê um autocolante NFC ou um cartão de visita sem contacto.',
    },
    'phone-iphone': {
      status: 'recebeste isto do meu iphone',
      intro: 'Recebeste isto do meu iPhone. O meu cartão de visita e o meu porta-chaves fazem o mesmo com um toque ou um código: são a Tilde, um projeto meu de código aberto, impressos em 3D com um autocolante NFC lá dentro.',
      mine: { label: 'O meu iPhone', detail: 'um link partilhado' },
      yours: { label: 'O teu telemóvel', detail: 'abriu o link' },
      note: 'Por agora, a app Tilde só existe para Android, por isso no meu iPhone o link é só um link.',
    },
    qr: {
      status: 'leste um dos meus códigos',
      intro: 'Leste um dos meus códigos QR. Fazem parte da Tilde, um projeto meu de código aberto: um cartão de visita e porta-chaves que desenhei e imprimi em 3D, e uma app Android que põe um telemóvel a funcionar como o cartão.',
      mine: { label: 'Um código meu', detail: 'um código QR' },
      yours: { label: 'O teu telemóvel', detail: 'leu-o' },
      note: 'O modelo 3D do cartão gera o seu próprio código QR, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
    },
    nfc: {
      status: 'tocaste numa das minhas etiquetas',
      intro: 'Encostaste o telemóvel a uma das minhas etiquetas NFC. Fazem parte da Tilde, um projeto meu de código aberto: um cartão de visita e porta-chaves que desenhei e imprimi em 3D, e uma app Android que põe um telemóvel a funcionar como o cartão.',
      mine: { label: 'Uma etiqueta minha', detail: 'uma etiqueta NFC' },
      yours: { label: 'O teu telemóvel', detail: 'tocou-lhe' },
      note: 'Os telemóveis leem uma etiqueta destas sem nenhuma app. Os modelos 3D e a app são de código aberto.',
    },
  },
  introEnd: 'Esta página é servida a partir de um pequeno servidor na minha casa, em Lisboa.',
  openTo: 'disponível para',
  availability: 'remoto (EUA) ou presencial em Lisboa',
  engagement: 'tempo inteiro ou contrato',
  keepInTouchHeading: 'vamos manter o contacto',
  copy: { idle: 'copiar', copied: 'copiado ✓', selected: 'selecionado', copiedAnnounce: 'Endereço de email copiado', selectedAnnounce: 'Endereço de email selecionado' },
  saveContact: 'guardar o meu contacto',
  workHeading: 'trabalhar comigo',
  bookCall: 'marcar uma conversa de 20 minutos ↗',
  resume: 'cv (em inglês)',
  fullSite: 'o site completo (em inglês) →',
  aboutHeading: 'sobre mim',
  bio: 'Engenheiro de produto sénior, com dez anos em fintech e muita experiência em React. Fui responsável pelo frontend das aplicações de pagamento da DigitalPay e hoje construo produtos full-stack, do modelo de dados até à produção.',
  diagramHeading: 'como esta página chegou até ti',
  mineColumn: 'de mim',
  diagram: 'hello-pt',
  projectLink: { label: 'obtém a app ou imprime um cartão tilde, grátis →', to: 'https://taptilde.com/pt' },
  buildLink: { label: 'como o fiz (em inglês) →', to: '/work/tilde' },
}

export const helloText: Record<Locale, HelloText> = { en, pt }

/** The shared parts and the English text, for the vCard and other English-only uses. */
export const hello = { ...shared, ...en }
export { shared as helloShared }
