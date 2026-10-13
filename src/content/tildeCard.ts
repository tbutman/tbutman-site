// /tilde/card and /pt/tilde/card: the Tilde Card, the free 3D-printable business card that goes with
// Tilde. For makers deciding whether to print one; the full steps stay in tilde-card's PRINTING.md,
// which this page links to. Every number is from the brand kit's claims sheet
// (tilde-media/brand/CLAIMS.md) and PRINTING.md: keep them in step.
//
// Still to come (week plan): the card video, real photos and the MakerWorld button. `makerWorld`
// stays null until the model is published, and the page then shows the button; until then the
// page names no date and says nothing is "coming soon".
import type { Locale } from '../i18n'

const cardRepo = 'https://github.com/tbutman/tilde-card'
const printing = `${cardRepo}/blob/main/PRINTING.md`
const email = 'hello@taptilde.com'

type Link = { label: string; href: string }

const en = {
  status: 'free · open source · 3d-printable',
  name: 'Tilde Card',
  headline: ['Print your own', 'business card.'],
  lede: 'Your name and link on the front, a QR code that opens your link, and a back you choose. It prints all at once on a multi-color printer, with an optional NFC sticker sealed inside so people can tap it too.',
  heroAlt: 'A render of a black Tilde Card for Jane Doe: ~/janedoe, Jane Doe and taptilde.com on the left, a QR code on the right, and an NFC tap mark.',
  links: {
    guide: { label: 'how to print it', href: printing },
    source: { label: 'model on github', href: cardRepo },
    makerWorld: null as Link | null,
  },

  needHeading: 'what you need',
  need: [
    '**A printer that prints several colors in a single print,** such as a Bambu Lab printer with an AMS or AMS lite. The card changes color too often to do it by hand.',
    '**PLA in black, white and orange,** plus gray for the window bar on the terminal-style back (or use white or orange there instead).',
    '**A 0.4 mm nozzle,** the one most printers come with, or a 0.2 mm nozzle for the sharpest small text.',
    '**A textured PEI plate** (recommended): the front comes out matte, so the QR code doesn’t reflect light.',
    '**Optional, for a card people can tap:** a round NTAG215 NFC sticker for each card, 22–25 mm across and 25.5 mm at most. They cost about $0.25 to $0.65 each (prices as listed in October 2026).',
  ],

  stepsHeading: 'make it yours',
  steps: [
    {
      title: 'Put in your details',
      body: 'Open the model in OpenSCAD’s Customizer (free) and type your name, your link (up to 53 characters), the three lines on the back and your colors. Choose your nozzle, and whether the card has an NFC sticker. Long names shrink to fit.',
    },
    {
      title: 'Write the sticker first',
      body: 'With Tilde on Android (Cards → Write a sticker), or the free NFC Tools app on iPhone or Android, put your link or your whole contact card on the sticker before it goes in the card, so a faulty one only costs you the sticker.',
    },
    {
      title: 'Print it face-down',
      body: 'The side on the plate comes out smoothest, so the files are already turned over. With a sticker, add a pause at the layer that closes the pocket (layer 6 on a 0.4 mm nozzle), press the sticker in flat, and resume.',
    },
    {
      title: 'Scan it and tap it',
      body: 'The QR code opens your link in any phone’s camera. With a sticker, any phone with NFC opens it from a tap, with no app.',
    },
  ],

  timeHeading: 'how long it takes',
  times: [
    { value: '~1 h', label: 'per card on a 0.4 mm nozzle (Bambu Studio estimates 53 minutes for the sample card)' },
    { value: '~4 h', label: 'per card on a 0.2 mm nozzle, for the sharpest text' },
    { value: '3', label: 'cards fit on an A1 mini’s plate, and take barely longer than one' },
  ],
  timeBody:
    'Most of the time is color changes, and they happen once per layer for the whole plate: two or three cards take barely longer than one. Printing a stack? Fill the plate. A plain back or no back is quicker still.',

  backsHeading: 'three backs',
  backsBody:
    'A terminal window, with a command such as $ whoami and your three lines; a plain back with just your lines; or none, plain black, the quickest to print, where you can add your own text or logo in your slicer.',
  backs: [
    { src: '/tilde/back-terminal.webp', caption: 'terminal back', alt: 'Terminal-style back: $ whoami, name, title and email' },
    { src: '/tilde/back-plain.webp', caption: 'plain back', alt: 'Plain back: name, title and email' },
  ],

  stickerHeading: 'the nfc sticker',
  sticker: [
    '**Thin stickers** (0.10–0.20 mm, such as wet inlays) make a 1.8 mm card; **thick stickers** (0.20–0.40 mm, most paper stickers) a 2.0 mm one. If the listing doesn’t say, measure one with calipers, or choose thick: thin stickers fit in it too. Hard discs and anti-metal tags over 0.40 mm don’t fit.',
    'An NTAG215 sticker holds 504 bytes: enough for your link or your whole contact card. NTAG216 works too.',
    'Locking the sticker is optional and permanent: nobody can change it then, you included. Lock it only once the finished card works; you can do it through the card.',
  ],

  faqHeading: 'questions',
  faq: [
    {
      q: 'Do I need the Tilde app?',
      a: 'No. Phones read the card on their own, and any NFC app can write the sticker. Tilde is the free Android app that goes with it, and it can write your whole contact card.',
    },
    {
      q: 'Which printers does it work with?',
      a: 'It’s printed and tested on a Bambu Lab A1 mini with an AMS lite, and the guide comes with A1 mini presets for Bambu Studio. Other printers that print several colors in a single print should work with the same settings, which the guide lists.',
    },
    {
      q: 'Is it really free?',
      a: `Yes. The model is open source under the MIT license, with no account, sign-up or payment, and the card links straight to your own website. [See the code on GitHub](${cardRepo}).`,
    },
    {
      q: 'Can I use my own text or logo on the back?',
      a: 'Yes: choose no back, then add your text or logo in your slicer. The back is the top face as it prints, so the text and color-painting tools work there.',
    },
    {
      q: 'Something went wrong with my print.',
      a: `The guide’s [troubleshooting section](${printing}#if-something-goes-wrong) covers gray whites, missing letters, a bump over the sticker and a card that doesn’t react. Still stuck? Email [${email}](mailto:${email}).`,
    },
  ],

  ctaText: 'The Tilde Card is free and open source.',
  appLink: { label: 'get the tilde app', to: '/tilde' },
}

export type TildeCardText = typeof en

const pt: TildeCardText = {
  status: 'grátis · código aberto · para imprimir em 3d',
  name: 'Cartão Tilde',
  headline: ['Imprime o teu', 'cartão de visita.'],
  lede: 'O teu nome e a tua ligação na frente, um código QR que abre a tua ligação e um verso à tua escolha. Imprime-se de uma só vez numa impressora multicolor, com um autocolante NFC opcional selado lá dentro, para que também o possam encostar.',
  heroAlt: 'Uma imagem 3D de um cartão Tilde preto para Jane Doe: ~/janedoe, Jane Doe e taptilde.com à esquerda, um código QR à direita e uma marca NFC para encostar.',
  links: {
    guide: { label: 'como imprimir (em inglês)', href: printing },
    source: { label: 'modelo no github', href: cardRepo },
    makerWorld: null,
  },

  needHeading: 'o que precisas',
  need: [
    '**Uma impressora que imprima várias cores de uma só vez,** como uma Bambu Lab com AMS ou AMS lite. O cartão muda de cor vezes demais para o fazeres à mão.',
    '**PLA preto, branco e laranja,** e cinzento para a barra da janela no verso estilo terminal (ou usa branco ou laranja aí).',
    '**Um bico de 0,4 mm,** o que vem com a maioria das impressoras, ou um bico de 0,2 mm para o texto pequeno mais nítido.',
    '**Uma placa PEI texturada** (recomendada): a frente fica mate, para o código QR não refletir a luz.',
    '**Opcional, para um cartão que se possa encostar:** um autocolante NFC redondo NTAG215 por cartão, com 22–25 mm de diâmetro e 25,5 mm no máximo. Custam cerca de 0,25 a 0,65 dólares cada (preços de outubro de 2026).',
  ],

  stepsHeading: 'faz o teu',
  steps: [
    {
      title: 'Põe os teus dados',
      body: 'Abre o modelo no Customizer do OpenSCAD (grátis) e escreve o teu nome, a tua ligação (até 53 carateres), as três linhas do verso e as tuas cores. Escolhe o bico e se o cartão leva um autocolante NFC. Os nomes compridos encolhem para caber.',
    },
    {
      title: 'Grava primeiro o autocolante',
      body: 'Com a Tilde no Android (Cartões → Gravar um autocolante), ou com a app grátis NFC Tools no iPhone ou no Android, põe a tua ligação ou o teu cartão de contacto completo no autocolante antes de ele entrar no cartão: assim, um autocolante com defeito só te custa o autocolante.',
    },
    {
      title: 'Imprime-o virado para baixo',
      body: 'O lado que fica na placa sai mais liso, por isso os ficheiros já vêm virados. Com autocolante, acrescenta uma pausa na camada que fecha o encaixe (a camada 6 num bico de 0,4 mm), pressiona o autocolante bem plano e retoma.',
    },
    {
      title: 'Lê-o e encosta-o',
      body: 'O código QR abre a tua ligação com a câmara de qualquer telemóvel. Com autocolante, qualquer telemóvel com NFC a abre com um toque, sem app.',
    },
  ],

  timeHeading: 'quanto tempo demora',
  times: [
    { value: '~1 h', label: 'por cartão num bico de 0,4 mm (o Bambu Studio estima 53 minutos para o cartão de exemplo)' },
    { value: '~4 h', label: 'por cartão num bico de 0,2 mm, para o texto mais nítido' },
    { value: '3', label: 'cartões cabem na placa de uma A1 mini, e demoram pouco mais do que um' },
  ],
  timeBody:
    'Quase todo o tempo vai nas mudanças de cor, e acontecem uma vez por camada para a placa inteira: dois ou três cartões demoram pouco mais do que um. Vais imprimir vários? Enche a placa. Um verso simples, ou sem verso, ainda é mais rápido.',

  backsHeading: 'três versos',
  backsBody:
    'Uma janela de terminal, com um comando como $ whoami e as tuas três linhas; um verso simples só com as tuas linhas; ou nenhum, preto liso, o mais rápido de imprimir, onde podes pôr o teu próprio texto ou logótipo no slicer.',
  backs: [
    { src: '/tilde/back-terminal.webp', caption: 'verso terminal', alt: 'Verso estilo terminal: $ whoami, nome, cargo e email' },
    { src: '/tilde/back-plain.webp', caption: 'verso simples', alt: 'Verso simples: nome, cargo e email' },
  ],

  stickerHeading: 'o autocolante nfc',
  sticker: [
    'Os **autocolantes finos** (0,10–0,20 mm, como os wet inlays) dão um cartão de 1,8 mm; os **grossos** (0,20–0,40 mm, a maioria dos autocolantes de papel), um de 2,0 mm. Se o anúncio não disser, mede um com um paquímetro, ou escolhe os grossos: os finos também cabem. Discos rígidos e etiquetas anti-metal com mais de 0,40 mm não cabem.',
    'Um autocolante NTAG215 guarda 504 bytes: chega para a tua ligação ou para o teu cartão de contacto completo. O NTAG216 também funciona.',
    'Bloquear o autocolante é opcional e permanente: depois ninguém o pode alterar, nem tu. Bloqueia-o só quando o cartão pronto funcionar; podes fazê-lo através do cartão.',
  ],

  faqHeading: 'perguntas',
  faq: [
    {
      q: 'Preciso da app Tilde?',
      a: 'Não. Os telemóveis leem o cartão sozinhos, e qualquer app de NFC pode gravar o autocolante. A Tilde é a app grátis para Android que o acompanha, e pode gravar o teu cartão de contacto completo.',
    },
    {
      q: 'Com que impressoras funciona?',
      a: 'Foi impresso e testado numa Bambu Lab A1 mini com AMS lite, e o guia traz predefinições do Bambu Studio para a A1 mini. Outras impressoras que imprimam várias cores de uma só vez devem funcionar com as mesmas definições, que o guia indica.',
    },
    {
      q: 'É mesmo grátis?',
      a: `Sim. O modelo é de código aberto, com licença MIT, sem conta, registo ou pagamento, e o cartão abre diretamente o teu próprio site. [Vê o código no GitHub](${cardRepo}).`,
    },
    {
      q: 'Posso pôr o meu texto ou logótipo no verso?',
      a: 'Sim: escolhe sem verso e acrescenta o teu texto ou logótipo no slicer. O verso é a face de cima durante a impressão, por isso as ferramentas de texto e de pintura de cor funcionam aí.',
    },
    {
      q: 'Correu mal a impressão.',
      a: `A [secção de resolução de problemas](${printing}#if-something-goes-wrong) do guia (em inglês) cobre brancos acinzentados, letras em falta, um alto sobre o autocolante e um cartão que não reage. Continuas sem solução? Envia um email para [${email}](mailto:${email}).`,
    },
  ],

  ctaText: 'O cartão Tilde é grátis e de código aberto.',
  appLink: { label: 'obter a app tilde', to: '/pt/tilde' },
}

export const tildeCardText: Record<Locale, TildeCardText> = { en, pt }
