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
  // Thomas and his son (Thomas, November 12, 2026; his choice to include him): one circle crop, as
  // the avatar and enlarged to 280 px (2x), made from his original without its metadata
  // (src/components/HelloPhoto.tsx).
  photo: {
    avatar: { src: '/hello/photo-96.webp', width: 96 },
    large: { src: '/hello/photo-560.webp', width: 560 },
  },
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
type ArrivalText = {
  status: string
  /** The intro's first sentence, in both versions. */
  thanks: string
  /** The Tilde version's (?about=tilde) second sentence: Thomas's other devices. */
  others: string
  mine: Step | null
  yours: Step
  /** Under the diagram; empty for none. */
  note: string
}

const en = {
  // The second line in a quieter color, the third in the accent (Thomas).
  headline: ['Hi, I’m Thomas.', 'Good to meet you.', 'Let’s keep in touch.'],
  // The default version's intro, after the arrival's "Thanks for…": it reads naturally with Thomas
  // right there (Thomas: most visitors open it while he's talking to them).
  ready: 'Everything you need to reach me is below, ready whenever you are.',
  arrivals: {
    link: {
      status: 'you found my hello page',
      thanks: 'Thanks for visiting.',
      others: 'My business card, keychain and phone all lead here, with a tap or a scan.',
      mine: null,
      yours: { label: 'Your phone or computer', detail: 'a link, a tap or a scan' },
      note: '',
    },
    'card-qr': {
      status: 'you scanned my card',
      thanks: 'Thanks for scanning my business card.',
      others: 'My keychain and phone do the same, with a tap or a scan.',
      mine: { label: 'My business card', detail: 'a QR code on the front' },
      yours: { label: 'Your phone', detail: 'scanned the code' },
      note: '',
    },
    'card-nfc': {
      status: 'you tapped my card',
      thanks: 'Thanks for tapping my business card.',
      others: 'My keychain and phone do the same, with a tap or a scan.',
      mine: { label: 'My business card', detail: 'an NFC sticker inside' },
      yours: { label: 'Your phone', detail: 'tapped the card' },
      note: 'There’s a QR code on the front too, for phones without NFC.',
    },
    'key-qr': {
      status: 'you scanned my keychain',
      thanks: 'Thanks for scanning my keychain.',
      others: 'My business card and phone do the same, with a tap or a scan.',
      mine: { label: 'My keychain', detail: 'a QR tag' },
      yours: { label: 'Your phone', detail: 'scanned the tag' },
      note: 'The tag’s size follows its link: the 3D model picks the smallest QR code that holds it.',
    },
    fob: {
      status: 'you tapped my keychain',
      thanks: 'Thanks for tapping my keychain.',
      others: 'My business card and phone do the same, with a tap or a scan.',
      mine: { label: 'My keychain', detail: 'an NFC sticker inside' },
      yours: { label: 'Your phone', detail: 'tapped it' },
      note: 'The fob’s two pieces twist shut with a quarter turn and no glue, so the sticker inside can be swapped.',
    },
    phone: {
      status: 'you tapped or scanned my phone',
      thanks: 'Thanks for tapping or scanning my phone.',
      others: 'My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My phone', detail: 'a tap or a code' },
      yours: { label: 'Your phone', detail: 'opened the link' },
      note: 'On my Android phone, Tilde shares it with a tap or a QR code, and your phone needs no app to read it.',
    },
    'phone-android': {
      status: 'you tapped or scanned my phone',
      thanks: 'Thanks for tapping or scanning my phone.',
      others: 'My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My Android phone', detail: 'running Tilde' },
      yours: { label: 'Your phone', detail: 'a tap or a scan' },
      note: 'Your phone didn’t need an app: it reads mine the way it reads an NFC sticker or a contactless business card.',
    },
    'phone-android-nfc': {
      status: 'you tapped my phone',
      thanks: 'Thanks for tapping my phone.',
      others: 'My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My Android phone', detail: 'running Tilde' },
      yours: { label: 'Your phone', detail: 'tapped it' },
      note: 'Your phone didn’t need an app: it reads mine the way it reads an NFC sticker or a contactless business card.',
    },
    'phone-android-qr': {
      status: 'you scanned my phone',
      thanks: 'Thanks for scanning my phone.',
      others: 'My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My Android phone', detail: 'running Tilde' },
      yours: { label: 'Your phone', detail: 'scanned my screen' },
      note: 'Tilde shows the link as a QR code too, for phones without NFC or people who’d rather scan.',
    },
    'phone-iphone': {
      status: 'you got this from my iphone',
      thanks: 'Thanks for opening the link from my iPhone.',
      others: 'My business card and keychain do the same, with a tap or a scan.',
      mine: { label: 'My iPhone', detail: 'a shared link' },
      yours: { label: 'Your phone', detail: 'opened the link' },
      note: 'Tilde’s app is Android only for now, so on my iPhone the link is just a link.',
    },
    qr: {
      status: 'you scanned one of my codes',
      thanks: 'Thanks for scanning one of my QR codes.',
      others: 'My business card, keychain and phone do the same, with a tap or a scan.',
      mine: { label: 'A code of mine', detail: 'a QR code' },
      yours: { label: 'Your phone', detail: 'scanned it' },
      note: '',
    },
    nfc: {
      status: 'you tapped one of my tags',
      thanks: 'Thanks for tapping one of my NFC tags.',
      others: 'My business card, keychain and phone do the same, with a tap or a scan.',
      mine: { label: 'A tag of mine', detail: 'an NFC sticker' },
      yours: { label: 'Your phone', detail: 'tapped it' },
      note: 'Phones read a tag like this without any app. The 3D models and the app are open source.',
    },
  } satisfies Record<Arrival, ArrivalText>,
  // The Tilde version's last sentence, the same for every arrival; the link is the app's page, the
  // best introduction to Tilde (Thomas).
  tilde: {
    before: 'They’re all part of ',
    link: 'Tilde',
    after: ', an open-source project of mine that lets anyone share their website, contact card, WhatsApp, or socials (or anything that can be shared using a URL) with a tap or a scan, from a phone or a 3D-printed object.',
    href: 'https://taptilde.com/app',
  },
  openTo: 'open to',
  availability: profile.availability.toLowerCase(),
  engagement: profile.engagement.toLowerCase(),
  photo: { open: 'See my photo', close: 'Close', alt: 'Thomas Butman with his son on a sofa, feeding him a bottle' },
  keepInTouchHeading: 'keep in touch',
  copy: { idle: 'copy', copied: 'copied ✓', selected: 'selected', copiedAnnounce: 'Email address copied', selectedAnnounce: 'Email address selected' },
  saveContact: 'save my contact card',
  // Opens a chat with Thomas with the start of a message already typed; they add their name.
  whatsapp: { label: 'message me on whatsapp ↗', text: 'Hey Thomas, it’s ' },
  workHeading: 'work with me',
  bookCall: 'book a 20-minute intro call ↗',
  resume: 'résumé',
  fullSite: 'the full site →',
  // The default version only (Thomas): for North American founders and CEOs who need someone in
  // Europe, first written for Web Summit 2026's networking events.
  american: {
    heading: 'an american in europe',
    intro: 'I’m an American software engineer living in Lisbon. If your company is based in North America and needs someone on this side of the Atlantic, I can help:',
    points: [
      ['European or US hours.', 'Lisbon is 5 hours ahead of New York and 8 ahead of San Francisco. I can work the European day, US hours, or a mix that overlaps with your team.'],
      ['A presence on the ground.', 'I can meet customers and partners, show up at events or conferences, or be your first engineer in Europe.'],
      ['Nothing lost in translation.', 'I’m a native English speaker and a US citizen, used to American teams, startups and expectations.'],
    ],
  },
  aboutHeading: 'about me',
  bio: profile.lede,
  diagramHeading: 'how this page reached you',
  mineColumn: 'mine',
  diagram: 'hello',
  // ?about=tilde (Thomas): for someone who'd like to know about Tilde itself. Tilde is its own site
  // (Thomas, October 26: src/site.ts).
  tildeVersion: {
    headline: 'This is Tilde.',
    heading: 'make your own',
    app: { label: 'get the free android app ↗', href: 'https://taptilde.com/app' },
    iphone: 'On an iPhone? The app is Android only for now, but a printed card or keychain works with any phone.',
    links: [
      { label: 'print a tilde card ↗', href: 'https://taptilde.com/card' },
      { label: 'keychains and fobs ↗', href: 'https://taptilde.com/fobs' },
      { label: 'what people use it for ↗', href: 'https://taptilde.com/uses' },
    ],
  },
  // For a hiring manager who got Thomas's own card (visitor round 2, item 27); the Tilde version
  // only (Thomas).
  buildLink: { label: 'how I built this →', to: '/work/tilde' },
}

export type HelloText = typeof en

const pt: HelloText = {
  // A non-breaking hyphen (U+2011) keeps “conhecer‑te” on one line in the large headline.
  headline: ['Olá, sou o Thomas.', 'Prazer em conhecer\u2011te.', 'Vamos falando.'],
  // "Vamos falando" is how pt-PT says "let's keep in touch", and fits the headline's line (PT: review).
  ready: 'Tens aqui em baixo tudo o que precisas para falar comigo, para quando te der jeito.',
  // New for the ?from= arrivals (PT: review).
  arrivals: {
    link: {
      status: 'encontraste a minha página',
      thanks: 'Obrigado pela visita.',
      others: 'O meu cartão de visita, o meu porta-chaves e o meu telemóvel trazem-te até aqui, com um toque ou um código.',
      mine: null,
      yours: { label: 'O teu navegador', detail: 'um link, toque ou código' },
      note: '',
    },
    'card-qr': {
      status: 'leste o código do meu cartão',
      thanks: 'Obrigado por leres o código do meu cartão de visita.',
      others: 'O meu porta-chaves e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu cartão de visita', detail: 'um código QR na frente' },
      yours: { label: 'O teu telemóvel', detail: 'leu o código' },
      note: '',
    },
    'card-nfc': {
      status: 'tocaste no meu cartão',
      thanks: 'Obrigado por encostares o telemóvel ao meu cartão de visita.',
      others: 'O meu porta-chaves e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu cartão de visita', detail: 'com NFC lá dentro' },
      yours: { label: 'O teu telemóvel', detail: 'tocou no cartão' },
      note: 'Também há um código QR na frente, para telemóveis sem NFC.',
    },
    'key-qr': {
      status: 'leste o código do meu porta-chaves',
      thanks: 'Obrigado por leres o código do meu porta-chaves.',
      others: 'O meu cartão de visita e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu porta-chaves', detail: 'uma etiqueta QR' },
      yours: { label: 'O teu telemóvel', detail: 'leu a etiqueta' },
      note: 'O tamanho da etiqueta acompanha o link: o modelo 3D escolhe o código QR mais pequeno que o comporta.',
    },
    fob: {
      status: 'tocaste no meu porta-chaves',
      thanks: 'Obrigado por encostares o telemóvel ao meu porta-chaves.',
      others: 'O meu cartão de visita e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu porta-chaves', detail: 'com NFC lá dentro' },
      yours: { label: 'O teu telemóvel', detail: 'tocou-lhe' },
      note: 'As duas peças do porta-chaves fecham com um quarto de volta e sem cola, por isso o autocolante lá dentro pode ser trocado.',
    },
    phone: {
      status: 'tocaste ou leste o meu telemóvel',
      thanks: 'Obrigado por encostares o teu telemóvel ao meu ou leres o código no ecrã.',
      others: 'O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu telemóvel', detail: 'um toque ou um código' },
      yours: { label: 'O teu telemóvel', detail: 'abriu o link' },
      note: 'No meu Android, a Tilde partilha-o com um toque ou um código QR, e o teu telemóvel não precisa de nenhuma app para o ler.',
    },
    'phone-android': {
      status: 'tocaste ou leste o meu telemóvel',
      thanks: 'Obrigado por encostares o teu telemóvel ao meu ou leres o código no ecrã.',
      others: 'O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu Android', detail: 'com a Tilde' },
      yours: { label: 'O teu telemóvel', detail: 'um toque ou um código' },
      note: 'O teu telemóvel não precisou de nenhuma app: lê o meu como lê um autocolante NFC ou um cartão de visita sem contacto.',
    },
    'phone-android-nfc': {
      status: 'tocaste no meu telemóvel',
      thanks: 'Obrigado por encostares o teu telemóvel ao meu.',
      others: 'O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu Android', detail: 'com a Tilde' },
      yours: { label: 'O teu telemóvel', detail: 'tocou-lhe' },
      note: 'O teu telemóvel não precisou de nenhuma app: lê o meu como lê um autocolante NFC ou um cartão de visita sem contacto.',
    },
    'phone-android-qr': {
      status: 'leste o código do meu telemóvel',
      thanks: 'Obrigado por leres o código no ecrã do meu telemóvel.',
      others: 'O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu Android', detail: 'com a Tilde' },
      yours: { label: 'O teu telemóvel', detail: 'leu o código no ecrã' },
      note: 'A Tilde também mostra o link num código QR, para telemóveis sem NFC ou para quem prefere ler o código.',
    },
    'phone-iphone': {
      status: 'recebeste isto do meu iphone',
      thanks: 'Obrigado por abrires o link do meu iPhone.',
      others: 'O meu cartão de visita e o meu porta-chaves fazem o mesmo, com um toque ou um código.',
      mine: { label: 'O meu iPhone', detail: 'um link partilhado' },
      yours: { label: 'O teu telemóvel', detail: 'abriu o link' },
      note: 'Por agora, a app Tilde só existe para Android, por isso no meu iPhone o link é só um link.',
    },
    qr: {
      status: 'leste um dos meus códigos',
      thanks: 'Obrigado por leres um dos meus códigos QR.',
      others: 'O meu cartão de visita, o meu porta-chaves e o meu telemóvel fazem o mesmo, com um toque ou um código.',
      mine: { label: 'Um código meu', detail: 'um código QR' },
      yours: { label: 'O teu telemóvel', detail: 'leu-o' },
      note: '',
    },
    nfc: {
      status: 'tocaste numa das minhas etiquetas',
      thanks: 'Obrigado por encostares o telemóvel a uma das minhas etiquetas NFC.',
      others: 'O meu cartão de visita, o meu porta-chaves e o meu telemóvel fazem o mesmo, com um toque ou um código.',
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
  photo: { open: 'Ver a minha foto', close: 'Fechar', alt: 'Thomas Butman com o filho num sofá, a dar-lhe o biberão' },
  keepInTouchHeading: 'vamos manter o contacto',
  copy: { idle: 'copiar', copied: 'copiado ✓', selected: 'selecionado', copiedAnnounce: 'Endereço de email copiado', selectedAnnounce: 'Endereço de email selecionado' },
  saveContact: 'guardar o meu cartão de contacto',
  // "Sou …" works for anyone, with no o/a to choose (PT: review).
  whatsapp: { label: 'mensagem no whatsapp ↗', text: 'Olá Thomas, sou ' },
  workHeading: 'trabalhar comigo',
  bookCall: 'marcar uma conversa de 20 minutos ↗',
  resume: 'cv',
  fullSite: 'o site completo →',
  // PT: review.
  american: {
    heading: 'um americano na europa',
    intro: 'Sou um engenheiro de software americano a viver em Lisboa. Se a tua empresa está na América do Norte e precisa de alguém deste lado do Atlântico, posso ajudar:',
    points: [
      ['Horário europeu ou americano.', 'Lisboa está 5 horas à frente de Nova Iorque e 8 à frente de São Francisco. Posso trabalhar no horário europeu, no americano ou num misto que se cruze com o da tua equipa.'],
      ['Presença no terreno.', 'Posso reunir com clientes e parceiros, ir a eventos ou conferências, ou ser o primeiro engenheiro da tua empresa na Europa.'],
      ['Nada se perde na tradução.', 'Sou falante nativo de inglês e cidadão americano, habituado a equipas, startups e expectativas americanas.'],
    ],
  },
  aboutHeading: 'sobre mim',
  bio: 'Engenheiro de produto sénior, com dez anos em fintech e muita experiência em React. Fui responsável pelo frontend das aplicações de pagamento da DigitalPay e hoje construo produtos full-stack, do modelo de dados até à produção.',
  diagramHeading: 'como esta página chegou até ti',
  mineColumn: 'de mim',
  diagram: 'hello-pt',
  // taptilde.com has Portuguese only for its home, the card and privacy; the rest links in English (PT: review).
  tildeVersion: {
    headline: 'Isto é a Tilde.',
    heading: 'faz o teu',
    app: { label: 'obtém a app android grátis ↗', href: 'https://taptilde.com/app' },
    iphone: 'Tens um iPhone? Por agora, a app só existe para Android, mas um cartão ou porta-chaves impresso funciona com qualquer telemóvel.',
    links: [
      { label: 'imprime um cartão tilde ↗', href: 'https://taptilde.com/pt/card' },
      { label: 'porta-chaves (em inglês) ↗', href: 'https://taptilde.com/fobs' },
      { label: 'para que serve (em inglês) ↗', href: 'https://taptilde.com/uses' },
    ],
  },
  buildLink: { label: 'como o fiz (em inglês) →', to: '/work/tilde' },
}

export const helloText: Record<Locale, HelloText> = { en, pt }

/** The shared parts and the English text, for the vCard and other English-only uses. */
export const hello = { ...shared, ...en }
export { shared as helloShared }
