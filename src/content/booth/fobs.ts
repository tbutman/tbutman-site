// /tilde/fobs: the fob storage box's station (taptilde.com/fobs), with the icon library as #icons.
// Copy: tilde-review/site-content/fobs.md (docs). Draft scaffold until it's ported: the facts here are
// from tilde-review/decisions.md (October 20: fob themes and plate library).
import type { Station } from './types'

export const fobs: Station = {
  path: '/tilde/fobs',
  page: 'fobs',
  draft: true,
  shortLink: 'taptilde.com/fobs',
  status: 'free · open source · 3d-printable',
  name: 'Tilde Fobs',
  headline: ['Your details,', 'on your keys.'],
  opening:
    'A Tilde fob is a small coin or tag for your keyring. Tap it with a phone, or scan its code, and it opens what you put on it: your contact card, a link, your Wi-Fi.',
  hero: { image: 'fobs/station', ratio: 'photo' },
  lineupLink: 'see every fob',
  conceptHeading: 'how it works',
  concept: [
    'A tap or a scan opens your details. The other phone needs no app.',
    'Tilde, the app, writes the NFC sticker inside; any NFC app can too.',
    'The fobs are free and open source: print your own, or take one at the booth.',
  ],
  lineup: [
    {
      id: 'types',
      heading: 'coins and tags',
      body: [
        'Base and premium, as a round coin or a tag, in the three standard themes: tilde (orange on black), dark (khaki on black) and light (black on khaki).',
      ],
      gallery: { slot: 'types', size: 'medium', ratio: 'square', expects: 'each fob type (base/premium × coin/tag) in each standard theme' },
    },
    {
      id: 'special',
      heading: 'special editions',
      gallery: { slot: 'special', size: 'medium', ratio: 'square', expects: 'the special fobs (the orange pocket-case fobs)' },
    },
    {
      id: 'sides',
      heading: 'two sides',
      body: ['A tag carries its code on the front and an icon on the back.'],
      gallery: { slot: 'sides', size: 'medium', ratio: 'square', expects: 'a tag front (code) and back (icon)' },
    },
    {
      id: 'keychain',
      heading: 'the demo keychain',
      gallery: { slot: 'keychain', size: 'wide', ratio: 'wide', expects: 'the demo keychain, fanned out' },
    },
    {
      id: 'storage',
      heading: 'the storage box',
      gallery: { slot: 'storage', size: 'medium', ratio: 'photo', expects: 'the fob storage box, open and closed' },
    },
    {
      id: 'icons',
      heading: 'the icon library',
      body: ['Every icon the model has, by name, with what it’s good for. Pick one in the model’s Icon list.'],
      gallery: { slot: 'icons', size: 'small', ratio: 'square', expects: 'one image per built icon, with its name and use, from the model' },
    },
  ],
  getHeading: 'get one',
  get: [
    { title: 'Print your own', body: 'The keyring model is free on MakerWorld and GitHub.', link: { label: 'how to print one', href: '/tilde/card#keyrings-heading' } },
    {
      title: 'Write it with Tilde',
      body: 'Tilde for Android writes your card, a link or your Wi-Fi to the sticker.',
      link: { label: 'get the app', href: '/tilde' },
    },
    { title: 'Take one at the booth', body: 'At Web Summit, ask at the Tilde booth.' },
  ],
  crossHeading: 'more at the booth',
  cross: [
    { to: '/tilde/uses', title: 'What a tag can do', body: 'Eight ready-made tags: family, Wi-Fi, a lost item and more.' },
    { to: '/tilde/card', title: 'The cards', body: 'Every card theme, front and back, and how to print one.' },
  ],
}
