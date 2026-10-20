// The booth pages' frame: what the site adds to docs' copy. Each page's address, short link and hero
// (the closed box the visitor just tapped), and where each of docs' [image: …] lines takes its renders
// from in design's export (presskit/site-renders.json), matched by how the line starts. A line with
// no match shows a placeholder, which CI won't build. Decisions: tilde-review/booth-site-decisions.md.
import cardsCopy from './copy/cards.json'
import fobsCopy from './copy/fobs.json'
import hubCopy from './copy/hub.json'
import usesCopy from './copy/uses.json'
import type { BoothCopy, Placement } from './types'

export type BoothPage = {
  page: 'cards' | 'fobs' | 'uses'
  path: string
  shortLink: string
  status: string
  name: string
  /** The hero's two lines, from docs' opening ("here's every design"). */
  headline: [string, string]
  /** The station's closed box, as the visitor saw it on the table. */
  hero: string
  copy: BoothCopy
  images: [string, Placement][]
}

/**
 * A gate's fallback that docs' notes give but its page copy doesn't have yet, applied here until docs
 * writes it in: [the text as docs wrote it, the text the page shows]. The build stops if the first
 * isn't in the copy, so an edit can't outlive the line it changes. Logged in booth-site-decisions.md.
 */
function withEdits(copy: BoothCopy, edits: [string, string][]): BoothCopy {
  for (const [from] of edits) {
    if (!copy.blocks.some((block) => 'text' in block && block.text.includes(from))) throw new Error(`booth copy: "${from}" isn't in docs' copy any more`)
  }
  const edit = (text: string) => edits.reduce((out, [from, to]) => out.replace(from, to), text)
  return { ...copy, blocks: copy.blocks.map((block) => (block.type === 'p' ? { ...block, text: edit(block.text) } : block)) }
}

const tag = (id: string): Placement => ({ ids: [id], layout: 'tag', ratio: 'square' })

export const cardsPage: BoothPage = {
  page: 'cards',
  path: '/tilde/card',
  shortLink: 'taptilde.com/card',
  status: 'free · open source · 3d-printable',
  name: 'Tilde Card',
  headline: ['Every design,', 'front and back.'],
  hero: 'station-cards-closed',
  // Docs' fallback for [depends on the card release] (cards.md's notes): Mystery's front and the tap
  // card's Blank front aren't in the public model yet.
  copy: withEdits(cardsCopy as BoothCopy, [
    ['Each design is a front and its default back.', 'Each design is a front and its default back (two need the next release).'],
  ]),
  images: [
    // The card agent's box with the real cards; design's station-cards-open is the empty box (design 17).
    ['the cards-only box, open', { ids: ['holder-cards-only-box'], layout: 'wide', ratio: 'photo' }],
    ['per design', { slot: 'themes', layout: 'pairs', ratio: 'card' }],
    ['one card in each front style', { slot: 'fronts', layout: 'small', ratio: 'card' }],
    ['the alternate backs', { slot: ['backs', 'alternate-backs'], layout: 'small', ratio: 'card' }],
    ['a two-piece card', { slot: ['builds', 'construction'], layout: 'grid', ratio: 'photo' }],
    // The pocket cases only: the cards-only box is the lineup's picture already (checker, third pass, Could 1).
    ['the 3-card pocket case', { ids: ['holder-pocket-3', 'holder-pocket-5'], layout: 'grid', ratio: 'photo' }],
  ],
}

export const fobsPage: BoothPage = {
  page: 'fobs',
  path: '/tilde/fobs',
  shortLink: 'taptilde.com/fobs',
  status: 'nfc · qr · 3d-printable',
  name: 'Tilde Fobs',
  headline: ['Every shape,', 'color and icon.'],
  hero: 'station-fobs-closed',
  copy: fobsCopy as BoothCopy,
  images: [
    ['the fob storage box, open', { ids: ['station-fobs-open'], layout: 'wide', ratio: 'photo' }],
    [
      'per fob type',
      {
        ids: ['fob-base-coin-tilde', 'fob-base-tag-tilde', 'fob-premium-coin-tilde', 'fob-premium-tag-tilde', 'fob-tag-front', 'fob-tag-back'],
        layout: 'small',
        ratio: 'square',
      },
    ],
    // "in each standard theme" until docs' October 20 fixes, "in each color set" since.
    ['each fob type in each', { slot: 'types', layout: 'small', ratio: 'square' }],
    ['the orange pocket case fobs', { slot: 'special', layout: 'small', ratio: 'square' }],
    // Closed only: the lineup opens with the open box (checker, third pass, S1).
    ['the storage box, closed and open', { ids: ['station-fobs-closed'], layout: 'grid', ratio: 'photo' }],
    ['one image per built icon', { slot: 'icons', layout: 'icons', ratio: 'square' }],
  ],
}

export const usesPage: BoothPage = {
  page: 'uses',
  path: '/tilde/uses',
  shortLink: 'taptilde.com/uses',
  status: 'nfc · android · iphone',
  name: 'Tilde Tags',
  headline: ['One tag,', 'one job.'],
  hero: 'station-uses-closed',
  copy: usesCopy as BoothCopy,
  images: [
    ['the two giveaway boxes, open', { ids: ['station-uses-open'], layout: 'wide', ratio: 'photo' }],
    ['the home tag', tag('use-family')],
    ['the contact card tag', tag('use-contact-card')],
    ['the link tag', tag('use-link')],
    ['the chat tag', tag('use-whatsapp')],
    ['the Wi-Fi password tag', tag('use-guest-wifi')],
    ['the handset tag', tag('use-share-number')],
    ['the found it? tag', tag('use-lost-item')],
    ['the booking tag', tag('use-book-meeting')],
    ['the demo keychain, fanned out', { ids: ['fob-demo-keychain'], layout: 'wide', ratio: 'wide' }],
  ],
}

/** /tilde's booth section: docs' hub copy, the whole table, and a picture for each station. */
export const hubSection = {
  copy: hubCopy as BoothCopy,
  table: 'booth-table-open',
  /** The pictures in docs' "See everything" table, by how each cell's [image: …] starts. */
  images: [
    ['a card’s front', 'card-classic-dark-front'],
    ["a card's front", 'card-classic-dark-front'],
    ['a coin and a tag', 'fob-premium-tag-tilde'],
    ['a stack of booth tags', 'station-uses-open'],
  ] as [string, string][],
  stations: [cardsPage, fobsPage, usesPage],
}

export const placementFor = (page: BoothPage, marker: string): Placement | null => page.images.find(([start]) => marker.startsWith(start))?.[1] ?? null
