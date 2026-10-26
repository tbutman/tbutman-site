// The booth pages' frame: what the site adds to docs' copy. Each page's address, short link and hero
// (the closed box the visitor just tapped), and where each of docs' [image: …] lines takes its renders
// from in design's export (presskit/site-renders.json), matched by how the line starts. A line with
// no match shows a placeholder, which CI won't build. Decisions: tilde-review/booth-site-decisions.md.
import appCopy from './copy/app.json'
import cardsCopy from './copy/cards.json'
import fobsCopy from './copy/fobs.json'
import hubCopy from './copy/hub.json'
import usesCopy from './copy/uses.json'
import type { BoothCopy, Placement, Ratio } from './types'

export type BoothPage = {
  page: 'cards' | 'fobs' | 'uses' | 'app'
  path: string
  shortLink: string
  status: string
  name: string
  /** Its name among the stations, as docs' hub table and the station links write it. */
  label: string
  /** The hero's two lines, in docs' words (Cards: its "Countless designs." and "Make your own"). */
  headline: [string, string]
  /** The station's closed box, as the visitor saw it on the table (the App page: the app's Share screen). */
  hero: string
  /** The hero's shape, if not a 4:3 render. */
  heroRatio?: Ratio
  /** The section the hero's first button leads to, by its id; else the one after "How it works". */
  lineup?: string
  copy: BoothCopy
  images: [string, Placement][]
}

// Thomas's review note (October 20): each design's alternate backs go in its row, after its front
// and default back. The backs carry no design field, so their export ids say which design: by
// prefix, to the designs' ids in the themes slot. The USA backs fit both USA cards. The build stops
// if a back matches no design (src/components/BoothRender.tsx).
const alternateBacks: Record<string, string[]> = {
  'card-back-dark-': ['card-classic-dark'],
  'card-back-light-': ['card-classic-light'],
  'card-back-tap-': ['card-tap-card'],
  'card-back-retro-': ['card-retro'],
  'card-back-signal-': ['card-signal'],
  'card-back-usa-': ['card-usa-light', 'card-usa-dark'],
  'card-back-brasil-': ['card-brasil'],
  'card-back-portugal-': ['card-portugal'],
}

const tag = (id: string): Placement => ({ ids: [id], layout: 'tag', ratio: 'square' })

export const cardsPage: BoothPage = {
  page: 'cards',
  label: 'Cards',
  path: '/tilde/card',
  shortLink: 'taptilde.com/card',
  status: 'free · open source · 3d-printable',
  name: 'Tilde Card',
  headline: ['Countless designs.', 'Make your own.'],
  hero: 'station-cards-closed',
  // Thomas's note (~10:45): lead with countless designs, so the button goes to docs' "Make your own".
  lineup: 'make-your-own',
  copy: cardsCopy as BoothCopy,
  images: [
    // The card agent's box with the real cards; design's station-cards-open is the empty box (design 17).
    ['the cards-only box, open', { ids: ['holder-cards-only-box'], layout: 'wide', ratio: 'photo' }],
    ['per design', { slot: 'themes', layout: 'sets', ratio: 'card', alternates: { slot: 'backs', designs: alternateBacks } }],
    ['one card in each front style', { slot: 'fronts', layout: 'small', ratio: 'card' }],
    // Shown in each design's row above (Thomas's review note), so not again here.
    ['the alternate backs', { layout: 'omit', ratio: 'card' }],
    ['a two-piece card', { slot: ['builds', 'construction'], layout: 'grid', ratio: 'photo' }],
    // The pocket cases only: the cards-only box is the lineup's picture already (checker, third pass, Could 1).
    ['the 3-card pocket case', { ids: ['holder-pocket-3', 'holder-pocket-5'], layout: 'grid', ratio: 'photo' }],
  ],
}

export const fobsPage: BoothPage = {
  page: 'fobs',
  label: 'Fobs',
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
  label: 'Use cases',
  path: '/tilde/uses',
  shortLink: 'taptilde.com/uses',
  status: 'nfc · android · iphone',
  // Docs' name for the page, as on the hub's tile and the short link (checker, first pass, Could 10).
  name: 'Use cases',
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

// The App station (tilde-review/briefs/booth-kit.md, item 5): the app as a booth agent shows it to a
// new visitor, in docs' copy (site-content/app.md), with the app agent's screenshots
// (booth-kit/app-screens/, ids as screens.json gives them). Its hero is Tap phone to phone, ready
// (the coordinator: not the Share screen, whose code opens janedoe.com, a domain we don’t own); the headline
// is Thomas's two pitches.
const screens = (ids: string[]): Placement => ({ ids, layout: 'screens', ratio: 'phone' })
export const appPage: BoothPage = {
  page: 'app',
  label: 'App',
  path: '/tilde/app',
  shortLink: 'taptilde.com/app',
  status: 'android · free · open source',
  name: 'Tilde for Android',
  headline: ['Write your own fob.', 'Your phone is one.'],
  hero: 'app-09-tap-ready',
  heroRatio: 'phone',
  copy: appCopy as BoothCopy,
  images: [
    // "In the app": docs' four screens as one row, in docs' order, under the app agent's captions.
    ['the Share screen, with the option card', screens(['app-14-share-choose-option', 'app-06-cards-tab', 'app-07-write-sticker', 'app-10-met'])],
    ['the Cards tab', { layout: 'omit', ratio: 'phone' }],
    ['Write a sticker', { layout: 'omit', ratio: 'phone' }],
    ['the Met tab', { layout: 'omit', ratio: 'phone' }],
    // Lines asked of docs, for the shots the app agent took beyond docs' list (Sites 31 and 32).
    ['the welcome screens', screens(['app-02-welcome-1', 'app-03-welcome-card', 'app-04-welcome-contact', 'app-05-first-card-ready'])],
    ['writing a sticker', screens(['app-07-write-sticker', 'app-08-write-done'])],
    ['the templates', screens(['app-11-new-card-template', 'app-11b-templates', 'app-12-template-family', 'app-13-family-card-share'])],
    // Docs asks for a photo of two phones; until one exists, the app's Sent screen (Ready is the hero).
    ['two phones back to back', screens(['app-09b-tap-sent'])],
  ],
}

/** /tilde's booth section: docs' hub copy, the whole table, and a picture for each station. */
export const hubSection = {
  copy: hubCopy as BoothCopy,
  table: 'booth-table-open',
  /** The pictures in docs' "See everything" table, by how each cell's [image: …] starts; else the station's hero. */
  images: [
    ['a card’s front', 'card-classic-dark-front'],
    ["a card's front", 'card-classic-dark-front'],
    ['a coin and a tag', 'fob-premium-tag-tilde'],
    ['a stack of booth tags', 'station-uses-open'],
    ['the Share screen', 'app-09-tap-ready'],
  ] as [string, string][],
  stations: [cardsPage, fobsPage, usesPage, appPage],
}

export const placementFor = (page: BoothPage, marker: string): Placement | null => page.images.find(([start]) => marker.startsWith(start))?.[1] ?? null

/**
 * The tour (finish-line plan §3): the way Thomas walks a visitor round the table, hub → Cards → Fobs →
 * Around the home → Use cases → App → hub. Every page ends with the stop after it (NextStop). Around
 * the home has no page yet, so it goes to the hub's family tiles until it does (the coordinator,
 * October 26); its name is still Thomas's to settle.
 */
export type Stop = { key: string; label: string; path: string }
export const tour: Stop[] = [
  { key: 'hub', label: 'Tilde', path: '/tilde' },
  { key: 'cards', label: cardsPage.label, path: cardsPage.path },
  { key: 'fobs', label: fobsPage.label, path: fobsPage.path },
  { key: 'home', label: 'Around the home', path: '/tilde#booth' },
  { key: 'uses', label: usesPage.label, path: usesPage.path },
  { key: 'app', label: appPage.label, path: appPage.path },
]

/** The stop after `key`'s; after the last, the hub again. */
export const nextStop = (key: string): Stop => tour[(tour.findIndex((stop) => stop.key === key) + 1) % tour.length]
