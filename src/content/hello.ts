// /hello: where the printed business card's QR code and NFC tag point, and what Thomas's phone
// shares through Tilde. Visitors arrive on a phone, usually right after meeting Thomas at an
// event. Both are open source: github.com/tbutman/tilde-card and github.com/tbutman/tilde. Kept out of search and the sitemap (see src/meta.ts).
// The short bio comes from profile.ts so the facts stay in one place. The social accounts appear
// only here: people meeting Thomas in person may want them, but the rest of the site is for hiring.
export const hello = {
  status: 'you tapped or scanned my card',
  headline: ['Hi, I’m Thomas.', 'Good to meet you.'],
  intro:
    'You got here from my business card or my phone. The card is one I designed and 3D-printed, with an NFC tag sealed inside it halfway through the print. The phone runs Tilde, an open-source Android app I wrote that makes it work like the card. This page is served from a small server in my home in Lisbon.',
  keepInTouchHeading: 'keep in touch',
  // Generated at build time by src/lib/vcard.ts; nginx serves it as text/vcard.
  vcardPath: '/thomas-butman.vcf',
  workHeading: 'work with me',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/t.butman/' },
    { label: 'X', href: 'https://x.com/tbutman' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/thomasbutman' },
  ],
  aboutHeading: 'about me',
  diagramHeading: 'how this page reached you',
  cardNote:
    'The 3D model generates its own QR code, and a script decodes it from the exported model before anything is printed.',
  projectLink: 'how the card and the app work →',
}
