// /tilde/uses: the giveaway boxes' and the demo keychain's station (taptilde.com/uses). Copy:
// tilde-review/site-content/uses.md (docs). Draft scaffold until it's ported: the eight stacks are
// tilde-review/decisions.md's (October 20: the booth giveaway boxes), in box order.
import type { Station } from './types'

export const uses: Station = {
  path: '/tilde/uses',
  page: 'uses',
  draft: true,
  shortLink: 'taptilde.com/uses',
  status: 'free · open source · android',
  name: 'Tilde Tags',
  headline: ['One tap,', 'many uses.'],
  opening: 'Each tag in these boxes does one thing when a phone taps it. Take the one you’d use, and make your own in Tilde.',
  hero: { image: 'uses/station', ratio: 'photo' },
  lineupLink: 'see all eight',
  conceptHeading: 'how it works',
  concept: [
    'A tap or a scan opens what the tag holds. The other phone needs no app.',
    'You write the tag with Tilde for Android, and can write it again any time.',
  ],
  lineup: [
    {
      id: 'stacks',
      heading: 'the eight tags',
      items: [
        {
          key: 'family',
          title: 'Family',
          body: '“Call my family”: for a child who loses their phone. Anyone’s phone gets the parents’ numbers.',
          image: 'uses/stack-family',
        },
        { key: 'contact', title: 'Contact card', body: 'Share a contact between any iPhone and Android.', image: 'uses/stack-contact' },
        { key: 'link', title: 'Link', body: 'A personal site, LinkedIn or any link: a physical bookmark.', image: 'uses/stack-link' },
        { key: 'whatsapp', title: 'WhatsApp', body: 'Opens a ready-to-send message to you.', image: 'uses/stack-whatsapp' },
        {
          key: 'wifi',
          title: 'Guest Wi-Fi',
          body: 'Your guests join without typing the password.',
          facts: [
            { label: 'Android', value: 'Joins the network on a tap.' },
            { label: 'iPhone', value: 'Opens a page with the password to copy [depends on T-WF].' },
          ],
          image: 'uses/stack-wifi',
        },
        { key: 'number', title: 'Share your number', body: 'Opens your number to call or text, without saving a contact.', image: 'uses/stack-number' },
        { key: 'lost', title: 'Lost item', body: '“Found this? Call or text me”: for keys, bags and pets.', image: 'uses/stack-lost' },
        { key: 'meeting', title: 'Book a meeting', body: 'Opens your booking link.', image: 'uses/stack-meeting' },
      ],
    },
    {
      id: 'keychain',
      heading: 'the demo keychain',
      body: ['Flip through and tap any.'],
      gallery: { slot: 'keychain', size: 'wide', ratio: 'wide', expects: 'the demo keychain’s tags' },
    },
    {
      id: 'more',
      heading: 'more ideas',
      gallery: { slot: 'more', size: 'medium', ratio: 'square', expects: 'the wider list (USE-CASES): the bookmark ring and the demo keychain’s tags' },
    },
  ],
  getHeading: 'make one',
  get: [
    { title: 'Take a tag', body: 'Pick one from the boxes at the booth.' },
    { title: 'Write it with Tilde', body: 'Tilde for Android writes any of these to a tag.', link: { label: 'get the app', href: '/tilde' } },
    { title: 'Print more', body: 'The tags are free to print.', link: { label: 'the fobs and tags', href: '/tilde/fobs' } },
  ],
  crossHeading: 'more at the booth',
  cross: [
    { to: '/tilde/fobs', title: 'Fobs and icons', body: 'Every fob, theme and icon.' },
    { to: '/tilde/card', title: 'The cards', body: 'Every card theme, front and back, and how to print one.' },
  ],
}
