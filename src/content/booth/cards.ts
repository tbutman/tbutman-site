// /tilde/card's showcase (taptilde.com/card): the cards-only box's station, before the page's print
// guide (content/tildeCard.ts). English only for Web Summit; /pt/tilde/card stays the print guide.
// Copy: tilde-review/site-content/cards.md (docs). Draft scaffold until it's ported: the lineup is
// the brief's (the card set, draft 2).
import type { Station } from './types'

export const cards: Station = {
  path: '/tilde/card',
  page: 'card',
  draft: true,
  shortLink: 'taptilde.com/card',
  status: 'free · open source · 3d-printable',
  name: 'Tilde Card',
  headline: ['A business card', 'people can tap.'],
  opening:
    'A Tilde Card is a printed business card with an NFC sticker inside and a QR code on the front. Tap it or scan it, and it opens your details on the other phone.',
  hero: { image: 'card/station', ratio: 'photo' },
  lineupLink: 'see every card',
  conceptHeading: 'how it works',
  concept: ['A tap or a scan opens your details. The other phone needs no app.', 'Free and open source: print it yourself, or take one at the booth.'],
  lineup: [
    {
      id: 'themes',
      heading: 'the themes',
      body: ['Classic Dark and Light, the tap card, solid black and white, Retro, Mystery, Signal, USA Light and Dark, Brasil and Portugal.'],
      gallery: { slot: 'themes', size: 'medium', ratio: 'card', expects: 'each theme’s front and back' },
    },
    {
      id: 'backs',
      heading: 'other backs',
      gallery: { slot: 'backs', size: 'medium', ratio: 'card', expects: 'the alternate backs (tap backs, Code backs)' },
    },
    {
      id: 'builds',
      heading: 'two-piece or solid',
      gallery: { slot: 'builds', size: 'medium', ratio: 'photo', expects: 'the two-piece and the solid card' },
    },
    {
      id: 'holders',
      heading: 'holders',
      gallery: { slot: 'holders', size: 'medium', ratio: 'photo', expects: 'cards in the 3- and 5-card pocket cases and the cards-only box' },
    },
    {
      id: 'tap-or-scan',
      heading: 'tapped or scanned',
      points: ['**Tapped:** the NFC sticker inside opens your details.', '**Scanned:** the QR code on the front opens your link.'],
    },
  ],
  getHeading: 'get one',
  get: [
    { title: 'Print your own', body: 'Customize it on MakerWorld, or print it from the model on GitHub.', link: { label: 'how to print it', href: '#print' } },
    { title: 'Write it with Tilde', body: 'Tilde for Android writes your contact card to the sticker.', link: { label: 'get the app', href: '/tilde' } },
    { title: 'Take one at the booth', body: 'At Web Summit, ask at the Tilde booth.' },
  ],
  crossHeading: 'more at the booth',
  cross: [
    { to: '/tilde/fobs', title: 'Fobs and icons', body: 'The same idea on your keys: every fob, theme and icon.' },
    { to: '/tilde/uses', title: 'What a tag can do', body: 'Eight ready-made tags: family, Wi-Fi, a lost item and more.' },
  ],
}
