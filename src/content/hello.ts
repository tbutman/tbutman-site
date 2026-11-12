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
      intro: 'Thanks for stopping by. My business card, keychain and phone all lead here, with a tap or a scan.',
      mine: null,
      yours: { label: 'Your phone or computer', detail: 'a link, a tap or a scan' },
      note: 'The card’s 3D model generates its own QR code, and a script decodes it from the exported model before anything is printed.',
    },
    'card-qr': {
      status: 'you scanned my card',
      intro: 'Thanks for scanning my business card. My keychain and phone do the same, with a tap or a scan.',
      mine: { label: 'My business card', detail: 'a QR code on the front' },
      yours: { label: 'Your phone', detail: 'scanned the code' },
      note: 'The 3D model generates its own QR code, and a script decodes it from the exported model before anything is printed.',
    },
    'card-nfc': {
      status: 'you tapped my card',
      intro: 'Thanks for tapping my business card. My keychain and phone do the same, with a tap or a scan.',
      mine: { label: 'My business card', detail: 'an NFC sticker inside' },
      yours: { label: 'Your phone', detail: 'tapped the card' },
      note: 'There’s a QR code on the front too, for phones without NFC. The 3D model generates it, and a script decodes it from the exported model before anything is printed.',
    },
    'key-qr': {
      status: 'you scanned my keychain',
      intro: 'Thanks for scanning my keychain. My business card and phone do the same, with a tap or a scan.',
      mine: { label: 'My keychain', detail: 'a QR tag' },
      yours: { label: 'Your phone', detail: 'scanned the tag' },
      note: 'The tag’s size follows its link: the 3D model picks the smallest QR code that holds it.',
    },
    fob: {
      status: 'you tapped my keychain',
      intro: 'Thanks for tapping my keychain. My business card and phone do the same, with a tap or a scan.',
      mine: { label: 'My keychain', detail: 'an NFC sticker inside' },
      yours: { label: 'Your phone', detail: 'tapped it' },
      note: 'The fob’s two pieces twist shut with a quarter turn and no glue, so the sticker inside can be swapped.',
    },
    phone: {
      status: 'you tapped or scanned my phone',
      intro: 'Thanks for tapping or scanning my phone. My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My phone', detail: 'a tap or a code' },
      yours: { label: 'Your phone', detail: 'opened the link' },
      note: 'On my Android phone, Tilde shares it with a tap or a QR code, and your phone needs no app to read it.',
    },
    'phone-android': {
      status: 'you tapped or scanned my phone',
      intro: 'Thanks for tapping or scanning my phone. My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My Android phone', detail: 'running Tilde' },
      yours: { label: 'Your phone', detail: 'a tap or a scan' },
      note: 'Your phone didn’t need an app: it reads mine the way it reads an NFC sticker or a contactless business card.',
    },
    'phone-android-nfc': {
      status: 'you tapped my phone',
      intro: 'Thanks for tapping my phone. My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My Android phone', detail: 'running Tilde' },
      yours: { label: 'Your phone', detail: 'tapped it' },
      note: 'Your phone didn’t need an app: it reads mine the way it reads an NFC sticker or a contactless business card.',
    },
    'phone-android-qr': {
      status: 'you scanned my phone',
      intro: 'Thanks for scanning my phone. My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My Android phone', detail: 'running Tilde' },
      yours: { label: 'Your phone', detail: 'scanned my screen' },
      note: 'Tilde shows the link as a QR code too, for phones without NFC or people who’d rather scan.',
    },
    'phone-iphone': {
      status: 'you got this from my iphone',
      intro: 'Thanks for opening the link from my iPhone. My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My iPhone', detail: 'a shared link' },
      yours: { label: 'Your phone', detail: 'opened the link' },
      note: 'Tilde’s app is Android only for now, so on my iPhone the link is just a link.',
    },
    qr: {
      status: 'you scanned one of my codes',
      intro: 'Thanks for scanning one of my QR codes. My business card, keychain and phone do the same, with a tap or a scan.',
      mine: { label: 'A code of mine', detail: 'a QR code' },
      yours: { label: 'Your phone', detail: 'scanned it' },
      note: 'The card’s 3D model generates its own QR code, and a script decodes it from the exported model before anything is printed.',
    },
    nfc: {
      status: 'you tapped one of my tags',
      intro: 'Thanks for tapping one of my NFC tags. My business card, keychain and phone do the same, with a tap or a scan.',
      mine: { label: 'A tag of mine', detail: 'an NFC sticker' },
      yours: { label: 'Your phone', detail: 'tapped it' },
      note: 'Phones read a tag like this without any app. The 3D models and the app are open source.',
    },
  } satisfies Record<Arrival, ArrivalText>,
  // The same for every arrival, after its own two sentences; the link is the app's page, the best
  // introduction to Tilde (Thomas).
  tilde: {
    before: 'They’re all part of ',
    link: 'Tilde',
    after: ', an open-source project of mine that lets anyone share their website, contact card, WhatsApp, or socials (or anything that can be shared using a URL) with a tap or a scan, from a phone or a 3D-printed object.',
    href: 'https://taptilde.com/app',
  },
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
      intro: 'Obrigado pela visita. O meu cartão de visita, o meu porta-chaves e o meu telemóvel trazem-te até aqui, com um toque ou um código.',
      mine: null,
      yours: { label: 'O teu navegador', detail: 'um link, toque ou código' },
      note: 'O modelo 3D do cartão gera o seu próprio código QR, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
    },
    'card-qr': {
      status: 'leste o código do meu cartão',
      intro: 'Obrigado por leres o código do meu cartão de visita. O meu porta-chaves e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu cartão de visita', detail: 'um código QR na frente' },
      yours: { label: 'O teu telemóvel', detail: 'leu o código' },
      note: 'O modelo 3D gera o seu próprio código QR, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
    },
    'card-nfc': {
      status: 'tocaste no meu cartão',
      intro: 'Obrigado por encostares o telemóvel ao meu cartão de visita. O meu porta-chaves e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu cartão de visita', detail: 'com NFC lá dentro' },
      yours: { label: 'O teu telemóvel', detail: 'tocou no cartão' },
      note: 'Também há um código QR na frente, para telemóveis sem NFC. O modelo 3D gera-o, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
    },
    'key-qr': {
      status: 'leste o código do meu porta-chaves',
      intro: 'Obrigado por leres o código do meu porta-chaves. O meu cartão de visita e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu porta-chaves', detail: 'uma etiqueta QR' },
      yours: { label: 'O teu telemóvel', detail: 'leu a etiqueta' },
      note: 'O tamanho da etiqueta acompanha o link: o modelo 3D escolhe o código QR mais pequeno que o comporta.',
    },
    fob: {
      status: 'tocaste no meu porta-chaves',
      intro: 'Obrigado por encostares o telemóvel ao meu porta-chaves. O meu cartão de visita e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu porta-chaves', detail: 'com NFC lá dentro' },
      yours: { label: 'O teu telemóvel', detail: 'tocou-lhe' },
      note: 'As duas peças do porta-chaves fecham com um quarto de volta e sem cola, por isso o autocolante lá dentro pode ser trocado.',
    },
    phone: {
      status: 'tocaste ou leste o meu telemóvel',
      intro: 'Obrigado por encostares o teu telemóvel ao meu ou leres o código no ecrã. O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu telemóvel', detail: 'um toque ou um código' },
      yours: { label: 'O teu telemóvel', detail: 'abriu o link' },
      note: 'No meu Android, a Tilde partilha-o com um toque ou um código QR, e o teu telemóvel não precisa de nenhuma app para o ler.',
    },
    'phone-android': {
      status: 'tocaste ou leste o meu telemóvel',
      intro: 'Obrigado por encostares o teu telemóvel ao meu ou leres o código no ecrã. O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu Android', detail: 'com a Tilde' },
      yours: { label: 'O teu telemóvel', detail: 'um toque ou um código' },
      note: 'O teu telemóvel não precisou de nenhuma app: lê o meu como lê um autocolante NFC ou um cartão de visita sem contacto.',
    },
    'phone-android-nfc': {
      status: 'tocaste no meu telemóvel',
      intro: 'Obrigado por encostares o teu telemóvel ao meu. O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu Android', detail: 'com a Tilde' },
      yours: { label: 'O teu telemóvel', detail: 'tocou-lhe' },
      note: 'O teu telemóvel não precisou de nenhuma app: lê o meu como lê um autocolante NFC ou um cartão de visita sem contacto.',
    },
    'phone-android-qr': {
      status: 'leste o código do meu telemóvel',
      intro: 'Obrigado por leres o código no ecrã do meu telemóvel. O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu Android', detail: 'com a Tilde' },
      yours: { label: 'O teu telemóvel', detail: 'leu o código no ecrã' },
      note: 'A Tilde também mostra o link num código QR, para telemóveis sem NFC ou para quem prefere ler o código.',
    },
    'phone-iphone': {
      status: 'recebeste isto do meu iphone',
      intro: 'Obrigado por abrires o link do meu iPhone. O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu iPhone', detail: 'um link partilhado' },
      yours: { label: 'O teu telemóvel', detail: 'abriu o link' },
      note: 'Por agora, a app Tilde só existe para Android, por isso no meu iPhone o link é só um link.',
    },
    qr: {
      status: 'leste um dos meus códigos',
      intro: 'Obrigado por leres um dos meus códigos QR. O meu cartão de visita, o meu porta-chaves e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'Um código meu', detail: 'um código QR' },
      yours: { label: 'O teu telemóvel', detail: 'leu-o' },
      note: 'O modelo 3D do cartão gera o seu próprio código QR, e um script descodifica-o a partir do modelo exportado antes de qualquer impressão.',
    },
    nfc: {
      status: 'tocaste numa das minhas etiquetas',
      intro: 'Obrigado por encostares o telemóvel a uma das minhas etiquetas NFC. O meu cartão de visita, o meu porta-chaves e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'Uma etiqueta minha', detail: 'uma etiqueta NFC' },
      yours: { label: 'O teu telemóvel', detail: 'tocou-lhe' },
      note: 'Os telemóveis leem uma etiqueta destas sem nenhuma app. Os modelos 3D e a app são de código aberto.',
    },
  },
  // taptilde.com/app has no Portuguese version yet.
  tilde: {
    before: 'Fazem todos parte da ',
    link: 'Tilde',
    after: ', um projeto meu de código aberto que permite a qualquer pessoa partilhar o seu site, cartão de contacto, WhatsApp ou redes sociais (ou qualquer coisa que se partilhe com um URL) com um toque ou um código, a partir de um telemóvel ou de um objeto impresso em 3D.',
    href: 'https://taptilde.com/app',
  },
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
