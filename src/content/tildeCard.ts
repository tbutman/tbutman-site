// /tilde/card and /pt/tilde/card: the Tilde Card, the free 3D-printable business card that goes with
// Tilde. For makers deciding whether to print one; the full steps stay in tilde-card's PRINTING.md,
// which this page links to. Every number is from the brand kit's claims sheet
// (tilde-media/brand/CLAIMS.md) and PRINTING.md: keep them in step.
//
// Draft (final plan S12): the two-piece card, MakerWorld's default build, and the keyrings, from
// tilde-card's docs/TWO-PIECE.md and docs/KEYRING.md. Before it ships:
// - the two MakerWorld links replace their placeholders, or go back to null to hide the buttons;
// - Bambu Studio's two-piece print times replace the [TBD]s;
// - docs/TWO-PIECE.md is on tilde-card's main, since the FAQ links to it;
// - real photos of the card and keyrings, from media.
// CI fails the build while a placeholder is on a page (scripts/prerender.mjs).
import type { Locale } from '../i18n'

const cardRepo = 'https://github.com/tbutman/tilde-card'
const printing = `${cardRepo}/blob/main/PRINTING.md`
const twoPiece = `${cardRepo}/blob/main/docs/TWO-PIECE.md`
const email = 'hello@taptilde.com'
// The two MakerWorld listings: the card (model 3417288, private until Thomas publishes it) and the
// keyrings (not uploaded yet). Until a listing is public its buttons stay off, and the pages link
// GitHub (Thomas, October 26, finish-line plan §7); then its URL goes here and the null below goes.
const makerWorldCard = null as string | null
const makerWorldKeyring = null as string | null
const listing = (label: string, href: string | null): Link | null => (href ? { label, href } : null)

type Link = { label: string; href: string }

const en = {
  status: 'free · open source · 3d-printable',
  name: 'Tilde Card',
  headline: ['Print your own', 'business card.'],
  lede: 'Your name and link on the front, a QR code that opens your link, and a back you choose. It prints in two pieces on a multi-color printer, with no pause, and an optional NFC sticker goes between them so people can tap it too.',
  heroAlt: 'A render of a black Tilde Card for Jane Doe: ~/janedoe, Jane Doe and taptilde.com on the left, a QR code on the right, and an NFC tap mark.',
  links: {
    guide: { label: 'how to print it', href: printing },
    source: { label: 'model on github', href: cardRepo },
    makerWorld: listing('customize it on makerworld', makerWorldCard),
  },

  needHeading: 'what you need',
  need: [
    '**A printer that prints several colors in a single print,** such as a Bambu Lab printer with an AMS or AMS lite. The card changes color too often to do it by hand.',
    '**PLA in black, white and orange,** plus gray for the window bar on the terminal-style back (or use white or orange there instead).',
    '**A 0.4 mm nozzle,** the one most printers come with, or a 0.2 mm nozzle for the sharpest small text.',
    '**A textured PEI plate** (recommended): the front comes out matte, so the QR code doesn’t reflect light.',
    '**Optional, for a card people can tap:** a round NTAG215 NFC sticker for each card, 22–25 mm across and 25.5 mm at most. They cost about $0.25 to $0.65 each (prices as listed in October 2026).',
    '**Optional, to make it permanent:** superglue gel (not the thin kind). Without glue, it holds, and opens again to swap the sticker.',
  ],

  stepsHeading: 'make it yours',
  steps: [
    {
      title: 'Put in your details',
      body: 'Click Customize on MakerWorld and type your name, your link (up to 53 characters), the three lines on the back and your colors. Choose your nozzle, and whether the card has an NFC sticker. Long names shrink to fit.',
    },
    {
      title: 'Write the sticker first',
      body: 'With Tilde on Android (Cards → Write a sticker), or the free NFC Tools app on iPhone or Android, put your link or your whole contact card on the sticker before it goes in the card, so a faulty one only costs you the sticker.',
    },
    {
      title: 'Print both pieces',
      body: 'Open the 3MF in Bambu Studio (not the STL, which loses the colors) and choose the Tilde Card process from the guide. Both pieces print face down, side by side, so both faces come out smooth and matte, with no pause.',
    },
    {
      title: 'Put it together',
      body: 'Stick the sticker into the front piece’s pocket, put the back piece in with its text the same way up as the front’s, and press along the edges until it clicks in flush. Unglued, it opens at a corner with a fingernail, so you can swap the sticker. For the most durable card, glue it with a few dots of superglue gel.',
    },
    {
      title: 'Scan it and tap it',
      body: 'The QR code opens your link in any phone’s camera. With a sticker, any phone with NFC opens it from a tap, with no app.',
    },
  ],

  timeHeading: 'how long it takes',
  times: [
    { value: '[TBD]', label: 'per card on a 0.4 mm nozzle (Bambu Studio’s estimate for the two-piece sample card)' },
    { value: '[TBD]', label: 'per card on a 0.2 mm nozzle, for the sharpest text' },
    { value: '[TBD]', label: 'cards fit on an A1 mini’s plate, and take barely longer than one' },
  ],
  timeBody:
    'Most of the time is color changes. The two-piece card has all its colors in its first few layers and prints the rest in black, so it’s much quicker than the one-piece card, which changes colors over more layers and stops halfway for the sticker. Color changes happen once per layer for the whole plate, so a full plate takes barely longer than one card. A plain back or no back is quicker still.',

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
    'Unglued, the two-piece card opens to swap the sticker. You rarely need to: a phone rewrites the sticker through the plastic.',
  ],

  keyringsHeading: 'keyrings',
  keyringsBody:
    'Two small companions to the card, made the same way: two pieces printed face down in color, with no pause, and the same NFC sticker inside. Neither needs glue, so the sticker can be swapped.',
  keyrings: [
    '**The QR tag:** a small rectangle with a QR code on the front for a short link, such as your website, and a sticker inside so phones can tap it too. The tag grows with the link: up to 17 characters makes a 28.8 × 35.3 mm tag, up to 53 a 35 × 41.5 mm one. A contact card is far too much for a code this small. The key ring goes through both pieces and holds them together.',
    '**The round fob:** a 32 mm disc for NFC only, with no QR code. Its back twists on with a quarter turn and locks, and turns open again to swap the sticker: by hand, or with its small printed key on a premium fob. A phone rewrites the sticker through the plastic, so you rarely need to.',
    '**Tell a set apart** with an icon (tap waves, Wi-Fi, a link, a phone, an envelope, a person or ~/) and a short label, inlaid in a second color or engraved.',
  ],
  keyringsLink: listing('keyrings on makerworld', makerWorldKeyring),

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
      a: `Yes. The model is open source under the MIT license, with no payment, and the card links straight to your own website. [See the code on GitHub](${cardRepo}).`,
    },
    {
      q: 'Can I print it in one piece?',
      a: 'Yes: on MakerWorld, choose Build: Solid. It prints as one piece, with a pause at the layer that closes the sticker’s pocket (layer 6 on a 0.4 mm nozzle) to press the sticker in. It takes about 53 minutes on a 0.4 mm nozzle and 4 hours on a 0.2 mm one. A card with no sticker always prints in one piece.',
    },
    {
      q: 'Can I make it without MakerWorld?',
      a: `Yes. Open the model in OpenSCAD’s Customizer (free), as the [guide](${printing}) shows; that makes the one-piece card. The two-piece files come from a script in the same repository ([TWO-PIECE.md](${twoPiece})).`,
    },
    {
      q: 'Can I use my own text or logo on the back?',
      a: 'Yes: choose no back, then add your text or logo in your slicer, with its text and color-painting tools.',
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
  lede: 'O teu nome e a tua ligação na frente, um código QR que abre a tua ligação e um verso à tua escolha. Imprime-se em duas peças numa impressora multicolor, sem pausa, e entre elas vai um autocolante NFC opcional, para que também o possam encostar.',
  heroAlt: 'Uma imagem 3D de um cartão Tilde preto para Jane Doe: ~/janedoe, Jane Doe e taptilde.com à esquerda, um código QR à direita e uma marca NFC para encostar.',
  links: {
    guide: { label: 'como imprimir (em inglês)', href: printing },
    source: { label: 'modelo no github', href: cardRepo },
    makerWorld: listing('personalizar no makerworld', makerWorldCard),
  },

  needHeading: 'o que precisas',
  need: [
    '**Uma impressora que imprima várias cores de uma só vez,** como uma Bambu Lab com AMS ou AMS lite. O cartão muda de cor vezes demais para o fazeres à mão.',
    '**PLA preto, branco e laranja,** e cinzento para a barra da janela no verso estilo terminal (ou usa branco ou laranja aí).',
    '**Um bico de 0,4 mm,** o que vem com a maioria das impressoras, ou um bico de 0,2 mm para o texto pequeno mais nítido.',
    '**Uma placa PEI texturada** (recomendada): a frente fica mate, para o código QR não refletir a luz.',
    '**Opcional, para um cartão que se possa encostar:** um autocolante NFC redondo NTAG215 por cartão, com 22–25 mm de diâmetro e 25,5 mm no máximo. Custam cerca de 0,25 a 0,65 dólares cada (preços de outubro de 2026).',
    '**Opcional, para o tornar permanente:** cola instantânea em gel (não a líquida). Sem cola, segura-se, e volta a abrir-se para trocares o autocolante.',
  ],

  stepsHeading: 'faz o teu',
  steps: [
    {
      title: 'Põe os teus dados',
      body: 'Clica em Customize no MakerWorld e escreve o teu nome, a tua ligação (até 53 carateres), as três linhas do verso e as tuas cores. Escolhe o bico e se o cartão leva um autocolante NFC. Os nomes compridos encolhem para caber.',
    },
    {
      title: 'Grava primeiro o autocolante',
      body: 'Com a Tilde no Android (Cartões → Gravar um autocolante), ou com a app grátis NFC Tools no iPhone ou no Android, põe a tua ligação ou o teu cartão de contacto completo no autocolante antes de ele entrar no cartão: assim, um autocolante com defeito só te custa o autocolante.',
    },
    {
      title: 'Imprime as duas peças',
      body: 'Abre o 3MF no Bambu Studio (não o STL, que perde as cores) e escolhe o processo Tilde Card do guia. As duas peças imprimem-se viradas para baixo, lado a lado, por isso as duas faces saem lisas e mate, sem pausa.',
    },
    {
      title: 'Monta-o',
      body: 'Põe o autocolante no encaixe da peça da frente, com o lado que cola para baixo, coloca a peça de trás com o texto virado para o mesmo lado que o da frente e pressiona ao longo das bordas até encaixar com um clique, rente. Sem cola, abre-se num canto com a unha, para trocares o autocolante. Para o cartão mais resistente, cola-o com uns pontos de cola instantânea em gel.',
    },
    {
      title: 'Lê-o e encosta-o',
      body: 'O código QR abre a tua ligação com a câmara de qualquer telemóvel. Com autocolante, qualquer telemóvel com NFC a abre com um toque, sem app.',
    },
  ],

  timeHeading: 'quanto tempo demora',
  times: [
    { value: '[TBD]', label: 'por cartão num bico de 0,4 mm (estimativa do Bambu Studio para o cartão de exemplo em duas peças)' },
    { value: '[TBD]', label: 'por cartão num bico de 0,2 mm, para o texto mais nítido' },
    { value: '[TBD]', label: 'cartões cabem na placa de uma A1 mini, e demoram pouco mais do que um' },
  ],
  timeBody:
    'Quase todo o tempo vai nas mudanças de cor. O cartão em duas peças tem todas as cores nas primeiras camadas e imprime o resto a preto, por isso é muito mais rápido do que o cartão numa só peça, que muda de cor em mais camadas e para a meio para o autocolante. As mudanças de cor acontecem uma vez por camada para a placa inteira, por isso uma placa cheia demora pouco mais do que um cartão. Um verso simples, ou sem verso, ainda é mais rápido.',

  backsHeading: 'três versos',
  backsBody:
    'Uma janela de terminal, com um comando como $ whoami e as tuas três linhas; um verso simples só com as tuas linhas; ou nenhum, preto liso, o mais rápido de imprimir, onde podes pôr o teu próprio texto ou logótipo no slicer.',
  backs: [
    { src: '/tilde/back-terminal.webp', caption: 'verso terminal', alt: 'Verso estilo terminal: $ whoami, nome, cargo e email' },
    { src: '/tilde/back-plain.webp', caption: 'verso simples', alt: 'Verso simples: nome, cargo e email' },
  ],

  stickerHeading: 'o autocolante nfc',
  sticker: [
    'Os **autocolantes finos** (0,10–0,20 mm, como os wet inlays) dão um cartão de 1,8 mm; os **grossos** (0,20–0,40 mm, a maioria dos autocolantes de papel), um de 2,0 mm. Se o anúncio não disser, mede um com um paquímetro, ou escolhe os grossos: os finos também cabem. Discos NFC rígidos e etiquetas anti-metal com mais de 0,40 mm não cabem.',
    'Um autocolante NTAG215 guarda 504 bytes: chega para a tua ligação ou para o teu cartão de contacto completo. O NTAG216 também funciona.',
    'Bloquear o autocolante é opcional e permanente: depois ninguém o pode alterar, nem tu. Bloqueia-o só quando o cartão pronto funcionar; podes fazê-lo através do cartão.',
    'Sem cola, o cartão em duas peças abre-se para trocares o autocolante. Raramente é preciso: um telemóvel regrava o autocolante através do plástico.',
  ],

  keyringsHeading: 'porta-chaves',
  keyringsBody:
    'Dois pequenos companheiros do cartão, feitos da mesma forma: duas peças impressas viradas para baixo, a cores, sem pausa, com o mesmo autocolante NFC lá dentro. Nenhum precisa de cola, por isso o autocolante pode ser trocado.',
  keyrings: [
    '**A etiqueta QR:** um pequeno retângulo com um código QR na frente, para uma ligação curta como o teu site, e um autocolante lá dentro para que também a possam encostar. A etiqueta cresce com a ligação: até 17 carateres dá uma etiqueta de 28,8 × 35,3 mm, até 53 uma de 35 × 41,5 mm. Um cartão de contacto é demasiado para um código tão pequeno. A argola passa pelas duas peças e mantém-nas juntas.',
    '**O porta-chaves redondo:** um disco de 32 mm só para NFC, sem código QR. A tampa encaixa com um quarto de volta e fica trancada, e volta a abrir-se para trocares o autocolante: à mão, ou com a pequena chave impressa, no porta-chaves premium. Um telemóvel regrava o autocolante através do plástico, por isso raramente é preciso.',
    '**Distingue um conjunto** com um ícone (ondas de toque, Wi-Fi, uma ligação, um telemóvel, um envelope, uma pessoa ou ~/) e um nome curto, embutidos noutra cor ou gravados.',
  ],
  keyringsLink: listing('porta-chaves no makerworld', makerWorldKeyring),

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
      a: `Sim. O modelo é de código aberto, com licença MIT, sem pagamento, e o cartão abre diretamente o teu próprio site. [Vê o código no GitHub](${cardRepo}).`,
    },
    {
      q: 'Posso imprimi-lo numa só peça?',
      a: 'Sim: no MakerWorld, escolhe Build: Solid. Imprime-se numa só peça, com uma pausa na camada que fecha o encaixe do autocolante (a camada 6 num bico de 0,4 mm) para o pressionares lá dentro. Demora cerca de 53 minutos num bico de 0,4 mm e 4 horas num de 0,2 mm. Um cartão sem autocolante imprime-se sempre numa só peça.',
    },
    {
      q: 'Posso fazê-lo sem o MakerWorld?',
      a: `Sim. Abre o modelo no Customizer do OpenSCAD (grátis), como mostra o [guia](${printing}) (em inglês); assim fazes o cartão numa só peça. Os ficheiros das duas peças vêm de um script no mesmo repositório ([TWO-PIECE.md](${twoPiece}), em inglês).`,
    },
    {
      q: 'Posso pôr o meu texto ou logótipo no verso?',
      a: 'Sim: escolhe sem verso e acrescenta o teu texto ou logótipo no slicer, com as ferramentas de texto e de pintura de cor.',
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
