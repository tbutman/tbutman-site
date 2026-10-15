// /tilde and /pt/tilde: the product page for Tilde, the open-source Android NFC business-card app,
// and the Tilde Card, its printable card. Written for people who might use it, not for hiring
// managers (the case study at /work/tilde covers the engineering). Source: github.com/tbutman/tilde
// and github.com/tbutman/tilde-card. The copy describes Tilde 1.3. Images in public/tilde/ are still
// Tilde 1.2 screenshots until the 1.3 set replaces them (week plan, wave 2; each alt text describes
// the image it sits with, so they change together), plus the card's renders, with the made-up
// person Jane Doe; /pt/tilde shows the Portuguese app where a Portuguese screenshot exists.
//
// The Portuguese is European Portuguese (pt-PT) and uses the informal "tu", for people Thomas
// meets in person. It uses the app's own Portuguese names (Partilhar, Conhecidos, Definições…), and
// the app is in English and European Portuguese, which the FAQ says.
//
// The download button links straight to the newest release's APK, looked up when the site builds
// (scripts/tilde-release.mjs); `releases` is the fallback when that lookup fails. Steps, notes
// and answers can use **bold** and [links](url) (see src/components/RichText.tsx).
import type { Video } from '../components/ProductVideo'
import type { Locale } from '../i18n'

export const releases = 'https://github.com/tbutman/tilde/releases/latest'
const repo = 'https://github.com/tbutman/tilde'
const installGuide = `${repo}#install`
const updatesGuide = `${repo}#updates`
const printing = 'https://github.com/tbutman/tilde-card/blob/main/PRINTING.md'
const cardRepo = 'https://github.com/tbutman/tilde-card'
const email = 'hello@taptilde.com'
const issues = `${repo}/issues`

type Screenshot = { src: string; alt: string }

const en = {
  name: 'Tilde',
  // The sample Tilde Card's QR code opens taptilde.com, which redirects here: this strip greets those
  // visitors. The wording matches the launch video, so keep it as is.
  sampleStrip: { question: 'Scanned a Tilde Card?', link: 'Make your own', href: '#card' },
  status: 'free · open source · no account · android',
  headline: ['Your business card,', 'on your phone.'],
  lede: 'Tap phones to share your contact card, your website or your WhatsApp, or let them scan the code on your screen. Free and open source, with no account and no internet: your details stay on your phone until you share them.',
  download: { label: 'download for android', fallbackHref: releases },
  release: { version: 'version', minAndroid: 'android 8 or newer' },
  printCard: { label: 'print a tilde card', href: '#card' },
  requirements:
    'Dark or light, in English or Portuguese. Tapping needs NFC, the contactless feature most Android phones have; the QR code works with any phone.',
  heroCardAlt: 'A render of a black Tilde Card for Jane Doe: ~/janedoe, Jane Doe and taptilde.com on the left, a QR code on the right, and an NFC tap mark.',
  // The Tilde Card video (tilde-media, the /tilde hero video of launch plan 7a).
  video: {
    webm: '/tilde/video/tilde-card-16x9.webm',
    mp4: '/tilde/video/tilde-card-16x9.mp4',
    poster: '/tilde/video/tilde-card-16x9.jpg',
    label: 'A 26-second video: a phone taps a Tilde Card and opens its link, the card is printed in four colors, scanned, and an NFC sticker goes inside.',
  } as Video,
  heroPhone: {
    src: '/tilde/share.webp',
    alt: 'Tilde’s Share screen: Jane Doe’s Web Summit card, the QR code for her contact card, and chips to switch between her website, contact card and LinkedIn',
  },

  installHeading: 'install in a minute',
  installSteps: [
    'Tap **download for android** on your Android phone. If your browser warns about the file, tap **Download anyway**.',
    'Open the file. Android asks to let your browser install apps: tap **Settings**, turn on **Allow from this source**, and go back.',
    'Tap **Install**. If Google Play Protect (Android’s built-in app check) doesn’t recognize the developer, choose **Install anyway**: Tilde isn’t in the Play Store yet.',
  ],
  installNote: `No account, no developer mode. Every release is built from the public code and signed with the same key. [Full install guide →](${installGuide})`,

  cardsHeading: 'a card for every room',
  cardsBody: [
    'Keep a card for work, one for personal life and one for a side project or an event, each with its own name, photo, links, color and event. Swipe your card on the Share screen to switch before you tap, and set them all up on the **Cards** tab. Only you see the labels.',
    'Put your code on your home screen with the **Tilde QR code** widget, for sharing by scan in a second. It shows your ~/handle and what the code shares.',
  ],
  cardsPhones: [
    { src: '/tilde/cards.webp', alt: 'Switching cards: Jane Doe’s Work and Web Summit cards' },
    { src: '/tilde/widget.webp', alt: 'The Tilde QR code widget on a home screen, showing the code for Jane Doe’s Work card' },
  ] as Screenshot[],

  modesHeading: 'one tap, the right details',
  modesIntro:
    'Swipe the option card at the bottom of the Share screen to change what the next tap shares, depending on who you’re talking to, or tap it to see every option. Codes for your contact card, WhatsApp and Wi-Fi wait until you tap **Show code**, so nobody nearby can scan your number unasked.',
  modesPhone: {
    src: '/tilde/picker.webp',
    alt: 'Choosing what a tap shares: starred website, contact card and LinkedIn, then WhatsApp, a Dribbble portfolio link and guest Wi-Fi',
  },
  modes: [
    {
      title: 'Contact card',
      body: 'Your name, title, company, phone numbers, email, website and social links, all at once and ready to save to their contacts. It’s the standard format every phone’s contacts app understands, and you choose which details each card’s contact card leaves off.',
    },
    {
      title: 'A link',
      body: 'Your website, LinkedIn, GitHub, Instagram, X, Facebook, MakerWorld or any link you like, as many as you want, each with its own display text if you like. Links to your own site can carry the name of the event you’re at, and it can clear itself at the end of the day.',
    },
    {
      title: 'WhatsApp',
      body: 'Opens a chat with you, with a short greeting already typed so they can say hello in one tap.',
    },
    {
      title: 'Wi-Fi',
      body: 'Joins your guest network or your phone’s hotspot without anyone reading out a password. Fill either one from its QR code instead of typing.',
    },
  ],

  stepsHeading: 'how it works',
  steps: [
    {
      title: 'Fill in your card',
      body: 'Name, job title, company, email, phone and links, plus a photo if you like. It all stays on your phone.',
    },
    {
      title: 'Hold the phones together',
      body: 'Back to back for a second or two. Their phone doesn’t need any app: it reads yours the way it reads a contactless card or sticker. Or they scan the code on your screen.',
    },
    {
      title: 'Remember who you met',
      body: 'Every tap lands in your Met list, day by day, with the time and the event. When someone taps their Tilde to yours, their contact card lands there too, even with Tilde closed. Add a note while it’s fresh (Tilde can ask after each tap), export the list, or have old entries delete themselves after 3, 6 or 12 months.',
    },
  ],

  freeHeading: 'free, and yours',
  freeFacts: [
    { value: '0', label: 'accounts, sign-ups or subscriptions' },
    { value: '0', label: 'internet access: it can’t send your details anywhere' },
    { value: 'MIT', label: 'open-source license: read, change and share the code' },
  ],
  freeBody:
    'No ads, no analytics and no cloud backup. Your cards, photos and Met list stay on your phone until you share them. Choose what each card gives away: leave your phone number off an event card, for example. **Delete all data** removes everything in one tap, as uninstalling would.',
  privacyLink: { label: 'privacy, in detail', to: '/tilde/privacy' },
  metPhone: {
    src: '/tilde/met-light.webp',
    alt: 'Tilde’s Met list in the light theme: five people Jane shared with, with notes, dates, card and event',
  },

  cardHeading: 'the tilde card (optional)',
  cardBody: [
    'Tilde works on its own, but if you have a 3D printer there’s a free Tilde Card to go with it. A QR code on the front opens your website, and an optional NFC sticker inside lets people tap it too.',
    'Type in your name, links and colors, choose a back (a terminal window, a plain one or none), and print it on a multi-color printer. By default it prints in two pieces with no pause, and the sticker goes between them; a one-piece build pauses halfway to put it in. Tilde can write your link or your whole contact card onto its NFC sticker, and lock it if you want it never to change.',
  ],
  cardFrontAlt: 'The Tilde Card, front',
  backs: [
    { src: '/tilde/back-terminal.webp', caption: 'terminal back', alt: 'Terminal-style back: $ whoami, name, title and email' },
    { src: '/tilde/back-plain.webp', caption: 'plain back', alt: 'Plain back: name, title and email' },
  ],
  cardPage: { label: 'the tilde card, in detail', to: '/tilde/card' },
  cardLinks: [
    { label: 'how to print it', href: printing },
    { label: 'model on github', href: cardRepo },
  ],
  cardNote: 'Coming soon: customize it in your browser on MakerWorld.',

  faqHeading: 'questions',
  faq: [
    {
      q: 'Does the other person need Tilde?',
      a: 'No. Their phone reads yours the way it reads a contactless card or sticker, and anyone can scan the QR code with their camera.',
    },
    {
      q: 'Does it work with iPhones?',
      a: 'Yes. iPhones read Tilde with a tap, like any NFC sticker. If you share your contact card, a tapping iPhone opens a page that shows it, with a Save contact button; that needs an internet connection. Scanning the code on your screen saves the contact without one.',
    },
    {
      q: 'Why only Android?',
      a: 'Android lets apps make the phone act like a contactless card; iPhones don’t allow it. They can still read Tilde, though.',
    },
    {
      q: 'Which languages is it in?',
      a: 'English and European Portuguese. It follows your phone’s language, or choose in Settings → Language, from the gear on the Cards tab.',
    },
    {
      q: 'Do I have to open Tilde to share?',
      a: 'By default, yes: Tilde only answers taps while it’s on screen, so nothing goes out from your pocket. Switch on **Settings → Sharing → Answer taps when Tilde is closed** (from the gear on the Cards tab) and it answers whenever your phone is unlocked, never from the lock screen. If another app on your phone also answers taps (X does), Android asks which one to use each time, then needs a second tap, so opening Tilde first is quicker.',
    },
    {
      q: 'What if I change phones?',
      a: 'Save a backup to a file (**Settings → Backup and restore**, from the gear on the Cards tab), move it to your new phone however you like, and restore it there. Tilde has no cloud and no account, so the file is yours; it isn’t encrypted, so keep it somewhere private. A backup from Tilde 1.2 can’t be restored in 1.3.',
    },
    {
      q: 'Updating from 1.2?',
      a: 'Tilde 1.3 starts fresh: it stores cards differently and doesn’t read 1.2’s cards or backups. Before you update, note what’s on your cards; afterwards, set them up again.',
    },
    {
      q: 'Is it really free?',
      a: 'Yes. No price, no paid tier, no account and no ads. The code is public under the MIT license, so anyone can check what it does.',
    },
    {
      q: 'What happens to my details?',
      a: 'They stay on your phone. Tilde has no internet permission, no account and no analytics, and nothing leaves your phone until you share it. [Read the privacy page →](/tilde/privacy)',
    },
    {
      q: 'How do I get help?',
      a: `Email [${email}](mailto:${email}) with a question, a bug or an idea, or open an issue on [GitHub](${issues}).`,
    },
    {
      q: 'How do I install it without the Play Store?',
      a: `No developer mode needed: follow the three steps under **install in a minute** near the top of this page, or the [full install guide](${installGuide}). For automatic updates, the free Obtainium app can check for new versions for you ([how](${updatesGuide})).`,
    },
  ],

  ctaText: 'Tilde is free and open source.',
  // The product's printed and marketed address, which redirects here.
  address: { label: 'the short address to share:', value: 'taptilde.com' },
  sourceLink: { label: 'source on github', href: repo },
  caseStudyLink: { label: 'how i built it', to: '/work/tilde' },
}

export type TildeText = typeof en

const pt: TildeText = {
  name: 'Tilde',
  sampleStrip: { question: 'Leste um cartão Tilde?', link: 'Faz o teu', href: '#card' },
  status: 'grátis · código aberto · sem conta · android',
  headline: ['O teu cartão de visita,', 'no teu telemóvel.'],
  lede: 'Encosta os telemóveis para partilhar o teu cartão de contacto, o teu site ou o teu WhatsApp, ou deixa que leiam o código no teu ecrã. Grátis e de código aberto, sem conta e sem internet: os teus dados ficam no teu telemóvel até os partilhares.',
  download: { label: 'descarregar para android', fallbackHref: releases },
  release: { version: 'versão', minAndroid: 'android 8 ou mais recente' },
  printCard: { label: 'imprimir um cartão tilde', href: '#card' },
  requirements:
    'Tema escuro ou claro, em português ou inglês. Encostar requer NFC, a tecnologia contactless que a maioria dos telemóveis Android tem; o código QR funciona com qualquer telemóvel.',
  heroCardAlt: 'Uma imagem 3D de um cartão Tilde preto para Jane Doe: ~/janedoe, Jane Doe e taptilde.com à esquerda, um código QR à direita e uma marca NFC para encostar.',
  video: {
    webm: '/tilde/video/tilde-card-pt-16x9.webm',
    mp4: '/tilde/video/tilde-card-pt-16x9.mp4',
    poster: '/tilde/video/tilde-card-pt-16x9.jpg',
    label: 'Um vídeo de 26 segundos: um telemóvel encosta a um cartão Tilde e abre a ligação, o cartão é impresso em quatro cores, lido com a câmara, e um autocolante NFC é posto lá dentro.',
  },
  heroPhone: {
    src: '/tilde/share-pt.webp',
    alt: 'O ecrã Partilhar da Tilde: o cartão Web Summit de Jane Doe, o código QR do cartão de contacto dela e botões para mudar entre o site, o cartão de contacto e o LinkedIn',
  },

  installHeading: 'instalar num minuto',
  installSteps: [
    'No teu telemóvel Android, toca em **descarregar para android**. Se o browser te avisar sobre o ficheiro, toca em **Transferir mesmo assim**.',
    'Abre o ficheiro. O Android pede-te para deixares o browser instalar apps: toca em **Definições**, ativa **Permitir desta fonte** e volta atrás.',
    'Toca em **Instalar**. Se o Google Play Protect (a verificação de apps do próprio Android) não reconhecer o programador, escolhe **Instalar mesmo assim**: a Tilde ainda não está na Play Store.',
  ],
  installNote: `Sem conta e sem opções de programador. Cada versão é compilada a partir do código público e assinada com a mesma chave. [Guia completo (em inglês) →](${installGuide})`,

  cardsHeading: 'um cartão para cada ocasião',
  cardsBody: [
    'Tem um cartão para o trabalho, outro para a vida pessoal e outro para um projeto ou um evento, cada um com o seu nome, fotografia, ligações, cor e evento. Desliza o cartão no ecrã Partilhar para mudar antes de encostares, e prepara-os todos no separador **Cartões**. Só tu vês os nomes que lhes dás.',
    'Põe o teu código no ecrã principal com o widget **Código QR da Tilde**, para alguém o ler num segundo. Mostra o teu ~/handle e o que o código partilha.',
  ],
  // No Portuguese screenshot of the card switcher: the widget shows the card and its code, not UI text.
  cardsPhones: [
    { src: '/tilde/widget.webp', alt: 'O widget Código QR da Tilde num ecrã principal, com o código do cartão Trabalho de Jane Doe' },
  ],

  modesHeading: 'um toque, os contactos certos',
  modesIntro:
    'Desliza o cartão de opções no fundo do ecrã Partilhar para mudar o que o próximo toque partilha, conforme a pessoa com quem estás a falar, ou toca nele para veres todas as opções. Os códigos do teu cartão de contacto, do WhatsApp e do Wi-Fi esperam que toques em **Mostrar código**, para ninguém por perto ler o teu número sem pedires.',
  modesPhone: {
    src: '/tilde/picker-pt.webp',
    alt: 'A escolher o que um toque partilha: site, cartão de contacto e LinkedIn com estrela, depois WhatsApp, uma ligação para um portefólio no Dribbble e Wi-Fi para convidados',
  },
  modes: [
    {
      title: 'Cartão de contacto',
      body: 'O teu nome, cargo, empresa, números de telefone, email, site e redes sociais, tudo de uma vez e pronto a guardar nos contactos. É o formato padrão que a app de contactos de qualquer telemóvel entende, e escolhes o que o cartão de contacto de cada cartão deixa de fora.',
    },
    {
      title: 'Uma ligação',
      body: 'O teu site, LinkedIn, GitHub, Instagram, X, Facebook, MakerWorld ou qualquer ligação que quiseres, quantas quiseres, cada uma com o seu próprio texto, se quiseres. As ligações para o teu próprio site podem levar o nome do evento em que estás, que se pode apagar sozinho no fim do dia.',
    },
    {
      title: 'WhatsApp',
      body: 'Abre uma conversa contigo, com uma saudação curta já escrita, para te dizerem olá com um toque.',
    },
    {
      title: 'Wi-Fi',
      body: 'Liga-se à tua rede de convidados ou ao hotspot do teu telemóvel sem ninguém ditar a palavra-passe. Preenche qualquer uma a partir do código QR, em vez de escrever.',
    },
  ],

  stepsHeading: 'como funciona',
  steps: [
    {
      title: 'Preenche o teu cartão',
      body: 'Nome, cargo, empresa, email, telefone e ligações, e uma fotografia se quiseres. Fica tudo no teu telemóvel.',
    },
    {
      title: 'Encosta os telemóveis',
      body: 'Costas com costas, durante um ou dois segundos. O telemóvel da outra pessoa não precisa de nenhuma app: lê o teu como lê um cartão ou um autocolante contactless. Ou lê o código no teu ecrã.',
    },
    {
      title: 'Lembra-te de quem conheceste',
      body: 'Cada toque fica na tua lista Conhecidos, dia a dia, com a hora e o evento. Quando alguém encosta a Tilde dele à tua, o cartão de contacto dessa pessoa também fica lá, mesmo com a Tilde fechada. Acrescenta uma nota enquanto está fresco (a Tilde pode perguntar depois de cada toque), exporta a lista ou deixa que as entradas antigas se apaguem sozinhas ao fim de 3, 6 ou 12 meses.',
    },
  ],

  freeHeading: 'grátis, e teu',
  freeFacts: [
    { value: '0', label: 'contas, registos ou subscrições' },
    { value: '0', label: 'acesso à internet: não consegue enviar os teus dados para lado nenhum' },
    { value: 'MIT', label: 'licença de código aberto: lê, altera e partilha o código' },
  ],
  freeBody:
    'Sem anúncios, sem estatísticas e sem cópias de segurança na nuvem. Os teus cartões, as tuas fotografias e a lista Conhecidos ficam no teu telemóvel até os partilhares. Escolhe o que cada cartão revela: deixa o teu número de fora de um cartão para eventos, por exemplo. **Apagar todos os dados** apaga tudo com um toque, como se desinstalasses a app.',
  privacyLink: { label: 'a privacidade, em detalhe', to: '/pt/tilde/privacy' },
  metPhone: {
    src: '/tilde/met-pt.webp',
    alt: 'A lista Conhecidos da Tilde: cinco pessoas com quem Jane partilhou, com notas, datas, cartão e evento',
  },

  cardHeading: 'o cartão tilde (opcional)',
  cardBody: [
    'A Tilde funciona sozinha, mas, se tiveres uma impressora 3D, há um cartão Tilde grátis para a acompanhar. Um código QR na frente abre o teu site, e um autocolante NFC opcional lá dentro permite que também o encostem.',
    'Escreve o teu nome, as tuas ligações e as cores, escolhe um verso (uma janela de terminal, um simples ou nenhum) e imprime-o numa impressora multicolor. Por predefinição, imprime-se em duas peças, sem pausa, e o autocolante vai entre elas; a versão numa só peça faz uma pausa a meio para o pores lá dentro. A Tilde pode gravar a tua ligação ou o teu cartão de contacto completo no autocolante NFC, e bloqueá-lo se quiseres que nunca mude.',
  ],
  cardFrontAlt: 'O cartão Tilde, frente',
  backs: [
    { src: '/tilde/back-terminal.webp', caption: 'verso terminal', alt: 'Verso estilo terminal: $ whoami, nome, cargo e email' },
    { src: '/tilde/back-plain.webp', caption: 'verso simples', alt: 'Verso simples: nome, cargo e email' },
  ],
  cardPage: { label: 'o cartão tilde, em detalhe', to: '/pt/tilde/card' },
  cardLinks: [
    { label: 'como imprimir (em inglês)', href: printing },
    { label: 'modelo no github', href: cardRepo },
  ],
  cardNote: 'Em breve: personaliza-o no browser, no MakerWorld.',

  faqHeading: 'perguntas',
  faq: [
    {
      q: 'A outra pessoa precisa da Tilde?',
      a: 'Não. O telemóvel dela lê o teu como lê um cartão ou um autocolante contactless, e qualquer pessoa pode ler o código QR com a câmara.',
    },
    {
      q: 'Funciona com iPhones?',
      a: 'Sim. Os iPhones leem a Tilde com um toque, como qualquer autocolante NFC. Se partilhares o teu cartão de contacto, um iPhone que encoste abre uma página que o mostra, com um botão Guardar contacto; isso precisa de ligação à internet. Ler o código no teu ecrã guarda o contacto sem ela.',
    },
    {
      q: 'Porquê só Android?',
      a: 'O Android permite que as apps ponham o telemóvel a funcionar como um cartão contactless; os iPhones não o permitem. Mas conseguem ler a Tilde na mesma.',
    },
    {
      q: 'A app está em português?',
      a: 'Sim, em português de Portugal. Se o teu telemóvel estiver em português, a Tilde abre em português; também podes escolher em Definições → Idioma, na roda dentada do separador Cartões.',
    },
    {
      q: 'Tenho de abrir a Tilde para partilhar?',
      a: 'Por defeito, sim: a Tilde só responde a toques enquanto está no ecrã, por isso nada sai do teu bolso. Liga **Definições → Partilha → Responder a toques com a Tilde fechada** (na roda dentada do separador Cartões) e passa a responder sempre que o telemóvel estiver desbloqueado, nunca a partir do ecrã de bloqueio. Se outra app no teu telemóvel também responder a toques (o X responde), o Android pergunta qual usar de cada vez e depois é preciso encostar outra vez, por isso abrir a Tilde primeiro é mais rápido.',
    },
    {
      q: 'E se mudar de telemóvel?',
      a: 'Guarda uma cópia de segurança num ficheiro (**Definições → Cópia de segurança e restauro**, na roda dentada do separador Cartões), passa-o para o telemóvel novo como preferires e restaura-a lá. A Tilde não tem nuvem nem conta, por isso o ficheiro é teu; não é encriptado, por isso guarda-o num sítio privado. Uma cópia de segurança da Tilde 1.2 não pode ser restaurada na 1.3.',
    },
    {
      q: 'Vais atualizar a partir da 1.2?',
      a: 'A Tilde 1.3 começa do zero: guarda os cartões de outra forma e não lê os cartões nem as cópias de segurança da 1.2. Antes de atualizares, aponta o que tens nos teus cartões; depois, volta a criá-los.',
    },
    {
      q: 'É mesmo grátis?',
      a: 'Sim. Sem preço, sem plano pago, sem conta e sem anúncios. O código é público, com licença MIT, por isso qualquer pessoa pode verificar o que faz.',
    },
    {
      q: 'O que acontece aos meus dados?',
      a: 'Ficam no teu telemóvel. A Tilde não tem permissão de acesso à internet, nem conta, nem estatísticas, e nada sai do teu telemóvel até o partilhares. [Lê a página de privacidade →](/pt/tilde/privacy)',
    },
    {
      q: 'Como peço ajuda?',
      a: `Envia um email para [${email}](mailto:${email}) com uma pergunta, um erro ou uma ideia, ou escreve nas [issues do GitHub](${issues}).`,
    },
    {
      q: 'Como a instalo sem a Play Store?',
      a: `Não precisas das opções de programador: segue os três passos em **instalar num minuto**, no topo desta página, ou o [guia completo (em inglês)](${installGuide}). Para receberes atualizações automaticamente, a app gratuita Obtainium pode procurar novas versões por ti ([como, em inglês](${updatesGuide})).`,
    },
  ],

  ctaText: 'A Tilde é grátis e de código aberto.',
  address: { label: 'o endereço curto para partilhar:', value: 'taptilde.com' },
  sourceLink: { label: 'código no github', href: repo },
  caseStudyLink: { label: 'como a construí (em inglês)', to: '/work/tilde' },
}

export const tildeText: Record<Locale, TildeText> = { en, pt }

/** The English text, for meta tags and the link-preview card. */
export const tilde = en
