// /tilde and /pt/tilde: the product page for Tilde, the open-source Android NFC business-card app,
// and its printable card. Written for people who might use it, not for hiring managers (the case
// study at /work/tilde covers the engineering). Source: github.com/tbutman/tilde and
// github.com/tbutman/tilde-card. Images in public/tilde/ come from those repos' screenshots and
// renders, with the made-up person Jane Doe.
//
// The Portuguese is European Portuguese (pt-PT) and uses the informal "tu", for people Thomas
// meets in person. The app itself is in English, which the FAQ says.
import type { Locale } from '../i18n'

const releases = 'https://github.com/tbutman/tilde/releases/latest'
const repo = 'https://github.com/tbutman/tilde'
const printing = 'https://github.com/tbutman/tilde-card/blob/main/PRINTING.md'
const cardRepo = 'https://github.com/tbutman/tilde-card'

const en = {
  name: 'Tilde',
  status: 'free · open source · android',
  headline: ['Your business card,', 'on your phone.'],
  lede: 'Tap phones to share your contact card, your website or your WhatsApp, or let them scan the code on your screen. Switch what you share with one tap. Free, open source, and nothing to sign up for.',
  download: { label: 'download for android', href: releases },
  printCard: { label: 'print the card', href: '#card' },
  requirements: 'Android 8 or newer · tapping needs NFC; the QR code works with any phone',
  heroCardAlt: 'A 3D-printed black business card for Jane Doe, with a QR code and an NFC tap marker',
  heroPhoneAlt: 'Tilde’s Share screen: Jane Doe’s card and a QR code',

  modesHeading: 'one tap, the right details',
  modesIntro:
    'Tap the line under the QR code to switch what the next tap shares, depending on who you’re talking to.',
  modesPhoneAlt:
    'Choosing what a tap shares: website, contact card, WhatsApp, LinkedIn, GitHub, a link or guest Wi-Fi',
  modes: [
    {
      title: 'Contact card',
      body: 'Your name, title, phone numbers, email, website and social links, all at once and ready to save to their contacts. It’s a vCard, the standard every phone’s contacts app understands.',
    },
    {
      title: 'A link',
      body: 'Your website, LinkedIn, GitHub, Instagram, X or any link you like. Links to your own site can carry the name of the event you’re at.',
    },
    {
      title: 'WhatsApp',
      body: 'Opens a chat with you, with a short greeting already typed so they can say hello in one tap.',
    },
    {
      title: 'Guest Wi-Fi',
      body: 'Joins your network without anyone reading out a password.',
    },
  ],

  stepsHeading: 'how it works',
  steps: [
    {
      title: 'Fill in your card',
      body: 'Name, job, email, phone and links, plus a photo if you like. It all stays on your phone.',
    },
    {
      title: 'Hold the phones together',
      body: 'Back to back for a second or two. Their phone doesn’t need any app: it reads yours like an NFC tag. Or they scan the code on your screen.',
    },
    {
      title: 'Remember who you met',
      body: 'Every tap lands in your Met list with the time and the event. Add a note while it’s fresh, and export the list later.',
    },
  ],

  freeHeading: 'free, and yours',
  freeFacts: [
    { value: '0', label: 'accounts, sign-ups or subscriptions' },
    { value: '0', label: 'internet access: it can’t send your details anywhere' },
    { value: 'MIT', label: 'open-source licence: read, change and share the code' },
  ],
  freeBody:
    'No ads, no analytics and no cloud backup. Your profile, photo and Met list stay on your phone until you share them, and uninstalling Tilde removes everything.',
  metPhoneAlt: 'Tilde’s Met list: people shared with, with notes and events',

  cardHeading: 'the printable card',
  cardOptional: 'optional',
  cardBody: [
    'Tilde works on its own, but if you have a 3D printer there’s a free card to go with it. A QR code on the front opens your website, and an optional NFC tag sealed inside lets people tap it too.',
    'Type in your name, links and colours, choose a back (a terminal window, a plain one or none), and print it in one go on a multi-colour printer. Tilde can write your link or your whole contact card onto its tag.',
  ],
  cardFrontAlt: 'The printed card, front',
  backs: [
    { src: '/tilde/back-terminal.webp', caption: 'terminal back', alt: 'Terminal-style back: $ whoami, name, title and email' },
    { src: '/tilde/back-plain.webp', caption: 'plain back', alt: 'Plain back: name, title and email' },
  ],
  cardLinks: [
    { label: 'how to print it', href: printing },
    { label: 'model on github', href: cardRepo },
  ],
  cardNote: 'Coming soon: customise it in your browser on MakerWorld.',

  faqHeading: 'questions',
  faq: [
    {
      q: 'Does the other person need Tilde?',
      a: 'No. Their phone reads yours the way it reads any NFC tag or card, and anyone can scan the QR code with their camera.',
    },
    {
      q: 'Does it work with iPhones?',
      a: 'iPhones read Tilde, but they only act on links from a tap. If you share your contact card, a tapping iPhone opens your website instead, and scanning the code on your screen saves the contact.',
    },
    {
      q: 'Why only Android?',
      a: 'Tilde makes your phone act as an NFC tag. Android lets apps do that; iOS doesn’t. iPhones can still read it.',
    },
    {
      q: 'Is it really free?',
      a: 'Yes. No price, no paid tier, no account and no ads. The code is public under the MIT licence, so anyone can check what it does.',
    },
    {
      q: 'How do I install it without the Play Store?',
      a: 'No developer mode needed. On your phone, download the file ending in .apk from the latest release and open it. Android asks once to let your browser install apps, and Google Play Protect may say it doesn’t recognise the developer, because Tilde isn’t in the Play Store yet: choose to install anyway. There’s a step-by-step guide on GitHub. For automatic updates, add the GitHub page to the free Obtainium app.',
    },
  ],

  ctaText: 'Tilde is free and open source.',
  sourceLink: { label: 'source on github', href: repo },
  caseStudyLink: { label: 'how i built it', to: '/work/tilde' },
}

export type TildeText = typeof en

const pt: TildeText = {
  name: 'Tilde',
  status: 'grátis · código aberto · android',
  headline: ['O teu cartão de visita,', 'no teu telemóvel.'],
  lede: 'Encosta os telemóveis para partilhar o teu cartão de contacto, o teu site ou o teu WhatsApp, ou deixa que leiam o código no teu ecrã. Muda o que partilhas com um toque. Grátis, de código aberto e sem registo.',
  download: { label: 'descarregar para android', href: releases },
  printCard: { label: 'imprimir o cartão', href: '#card' },
  requirements: 'Android 8 ou mais recente · encostar requer NFC; o código QR funciona com qualquer telemóvel',
  heroCardAlt: 'Um cartão de visita preto impresso em 3D para Jane Doe, com um código QR e uma marca NFC para encostar',
  heroPhoneAlt: 'O ecrã Share da Tilde: o cartão de Jane Doe e um código QR',

  modesHeading: 'um toque, os contactos certos',
  modesIntro:
    'Toca na linha por baixo do código QR para mudar o que o próximo toque partilha, conforme a pessoa com quem estás a falar.',
  modesPhoneAlt:
    'A escolher o que um toque partilha: site, cartão de contacto, WhatsApp, LinkedIn, GitHub, uma ligação ou Wi-Fi para convidados',
  modes: [
    {
      title: 'Cartão de contacto',
      body: 'O teu nome, cargo, números de telefone, email, site e redes sociais, tudo de uma vez e pronto a guardar nos contactos. É um vCard, o formato padrão que a app de contactos de qualquer telemóvel entende.',
    },
    {
      title: 'Uma ligação',
      body: 'O teu site, LinkedIn, GitHub, Instagram, X ou qualquer ligação que quiseres. As ligações para o teu próprio site podem levar o nome do evento em que estás.',
    },
    {
      title: 'WhatsApp',
      body: 'Abre uma conversa contigo, com uma saudação curta já escrita, para te dizerem olá com um toque.',
    },
    {
      title: 'Wi-Fi para convidados',
      body: 'Liga-se à tua rede sem ninguém ter de ditar a palavra-passe.',
    },
  ],

  stepsHeading: 'como funciona',
  steps: [
    {
      title: 'Preenche o teu cartão',
      body: 'Nome, profissão, email, telefone e ligações, e uma fotografia se quiseres. Fica tudo no teu telemóvel.',
    },
    {
      title: 'Encosta os telemóveis',
      body: 'Costas com costas, durante um ou dois segundos. O telemóvel da outra pessoa não precisa de nenhuma app: lê o teu como uma etiqueta NFC. Ou lê o código no teu ecrã.',
    },
    {
      title: 'Lembra-te de quem conheceste',
      body: 'Cada toque fica na tua lista Met (as pessoas que conheceste), com a hora e o evento. Acrescenta uma nota enquanto está fresco e exporta a lista mais tarde.',
    },
  ],

  freeHeading: 'grátis, e teu',
  freeFacts: [
    { value: '0', label: 'contas, registos ou subscrições' },
    { value: '0', label: 'acesso à internet: não consegue enviar os teus dados para lado nenhum' },
    { value: 'MIT', label: 'licença de código aberto: lê, altera e partilha o código' },
  ],
  freeBody:
    'Sem anúncios, sem estatísticas e sem cópias de segurança na nuvem. O teu perfil, a tua fotografia e a lista Met ficam no teu telemóvel até os partilhares, e desinstalar a Tilde apaga tudo.',
  metPhoneAlt: 'A lista Met da Tilde: as pessoas com quem partilhaste, com notas e eventos',

  cardHeading: 'o cartão para imprimir',
  cardOptional: 'opcional',
  cardBody: [
    'A Tilde funciona sozinha, mas, se tiveres uma impressora 3D, há um cartão grátis para a acompanhar. Um código QR na frente abre o teu site, e uma etiqueta NFC opcional, selada lá dentro, permite que também o encostem.',
    'Escreve o teu nome, as tuas ligações e as cores, escolhe um verso (uma janela de terminal, um simples ou nenhum) e imprime-o de uma só vez numa impressora multicolor. A Tilde pode escrever a tua ligação ou o teu cartão de contacto completo na etiqueta.',
  ],
  cardFrontAlt: 'O cartão impresso, frente',
  backs: [
    { src: '/tilde/back-terminal.webp', caption: 'verso terminal', alt: 'Verso estilo terminal: $ whoami, nome, cargo e email' },
    { src: '/tilde/back-plain.webp', caption: 'verso simples', alt: 'Verso simples: nome, cargo e email' },
  ],
  cardLinks: [
    { label: 'como imprimir (em inglês)', href: printing },
    { label: 'modelo no github', href: cardRepo },
  ],
  cardNote: 'Em breve: personaliza-o no browser, no MakerWorld.',

  faqHeading: 'perguntas',
  faq: [
    {
      q: 'A outra pessoa precisa da Tilde?',
      a: 'Não. O telemóvel dela lê o teu como lê qualquer etiqueta ou cartão NFC, e qualquer pessoa pode ler o código QR com a câmara.',
    },
    {
      q: 'Funciona com iPhones?',
      a: 'Os iPhones leem a Tilde, mas só abrem ligações recebidas por toque. Se partilhares o teu cartão de contacto, um iPhone que encoste abre o teu site; para guardar o contacto, basta ler o código no teu ecrã.',
    },
    {
      q: 'Porquê só Android?',
      a: 'A Tilde põe o teu telemóvel a funcionar como uma etiqueta NFC. O Android permite que as apps o façam; o iOS não. Os iPhones conseguem lê-la na mesma.',
    },
    {
      q: 'É mesmo grátis?',
      a: 'Sim. Sem preço, sem plano pago, sem conta e sem anúncios. O código é público, com licença MIT, por isso qualquer pessoa pode verificar o que faz.',
    },
    {
      q: 'Como a instalo sem a Play Store?',
      a: 'Não precisas das opções de programador. No telemóvel, descarrega o ficheiro que termina em .apk da versão mais recente e abre-o. O Android pede-te uma vez para deixares o browser instalar apps, e o Google Play Protect pode dizer que não reconhece o programador, porque a Tilde ainda não está na Play Store: escolhe instalar na mesma. Há um guia passo a passo no GitHub. Para receberes atualizações automaticamente, adiciona a página do GitHub à app gratuita Obtainium.',
    },
    {
      q: 'A app está em português?',
      a: 'Por enquanto, a app está em inglês. Esta página é a primeira parte da Tilde em português.',
    },
  ],

  ctaText: 'A Tilde é grátis e de código aberto.',
  sourceLink: { label: 'código no github', href: repo },
  caseStudyLink: { label: 'como a construí (em inglês)', to: '/work/tilde' },
}

export const tildeText: Record<Locale, TildeText> = { en, pt }

/** The English text, for meta tags and the link-preview card. */
export const tilde = en
