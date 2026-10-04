// /hello: where the printed business card's QR code and NFC tag point. Visitors arrive on a
// phone, usually right after meeting Thomas at an event. The card's own repo:
// ~/Documents/personal/business-card. Kept out of search and the sitemap (see src/meta.ts).
// The short bio comes from profile.ts so the facts stay in one place.
export const hello = {
  status: 'you tapped or scanned my card',
  headline: ['Hi, I’m Thomas.', 'Good to meet you.'],
  intro:
    'The card in your hand is one I designed, modelled in OpenSCAD and 3D-printed, with an NFC tag sealed inside it halfway through the print. This page is served from a small server in my home in Lisbon.',
  nextHeading: 'next steps',
  diagramHeading: 'how this page reached you',
  cardNote:
    'A script generates the QR code, and another decodes it from the exported 3D model before anything is printed.',
}
