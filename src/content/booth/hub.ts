// /tilde's booth section (the hub: taptilde.com, for anyone without a tap): the whole booth, and a way
// into each station. English only for Web Summit. Copy: tilde-review/site-content/hub.md (docs).
// Draft scaffold until it's ported.
import { cards } from './cards'
import { fobs } from './fobs'
import type { Station } from './types'
import { uses } from './uses'

export const hub = {
  draft: true,
  heading: 'the booth',
  body: 'Each box on the Tilde booth table opens a page: tap its lid, or pick one here.',
  image: 'hub/booth',
  stations: [
    { station: cards, title: 'Cards', body: 'Every card theme, front and back, and how to print one.' },
    { station: fobs, title: 'Fobs', body: 'Coins and tags for your keys, and every icon.' },
    { station: uses, title: 'Use cases', body: 'Eight ready-made tags, and what each does on an iPhone and on Android.' },
  ] satisfies { station: Station; title: string; body: string }[],
}
