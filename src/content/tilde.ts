// /tilde: the product page for Tilde, the open-source Android NFC business-card app, and its
// printable card. Written for people who might use it, not for hiring managers (the case study at
// /work/tilde covers the engineering). Source: github.com/tbutman/tilde and
// github.com/tbutman/tilde-card. Images in public/tilde/ come from those repos' screenshots and
// renders, with the made-up person Jane Doe.

const releases = 'https://github.com/tbutman/tilde/releases'

export const tilde = {
  name: 'Tilde',
  status: 'free · open source · android',
  headline: ['Your business card,', 'on your phone.'],
  lede: 'Tap phones to share your contact card, your website or your WhatsApp, or let them scan the code on your screen. Switch what you share with one tap. Free, open source, and nothing to sign up for.',
  download: { label: 'download for android', href: releases },
  printCard: { label: 'print the card', href: '#card' },
  requirements: 'Android 8 or newer · tapping needs NFC; the QR code works with any phone',

  modesHeading: 'one tap, the right details',
  modesIntro:
    'Tap the line under the QR code to switch what the next tap shares, depending on who you’re talking to.',
  modes: [
    {
      title: 'Contact card',
      body: 'Your name, title, phone numbers, email, website and social links, all at once and ready to save to their contacts. It’s a vCard, the standard every phone’s contacts app understands.',
    },
    {
      title: 'A link',
      body: 'Your website, LinkedIn, GitHub, Instagram, X or any link you like. Links to your own site can carry the name of the event you’re at.',
    },
    {
      title: 'WhatsApp',
      body: 'Opens a chat with you, with a short greeting already typed so they can say hello in one tap.',
    },
    {
      title: 'Guest Wi-Fi',
      body: 'Joins your network without anyone reading out a password.',
    },
  ],

  stepsHeading: 'how it works',
  steps: [
    {
      title: 'Fill in your card',
      body: 'Name, job, email, phone and links, plus a photo if you like. It all stays on your phone.',
    },
    {
      title: 'Hold the phones together',
      body: 'Back to back for a second or two. Their phone doesn’t need any app: it reads yours like an NFC tag. Or they scan the code on your screen.',
    },
    {
      title: 'Remember who you met',
      body: 'Every tap lands in your Met list with the time and the event. Add a note while it’s fresh, and export the list later.',
    },
  ],

  freeHeading: 'free, and yours',
  freeFacts: [
    { value: '0', label: 'accounts, sign-ups or subscriptions' },
    { value: '0', label: 'internet access: it can’t send your details anywhere' },
    { value: 'MIT', label: 'open-source licence: read, change and share the code' },
  ],
  freeBody:
    'No ads, no analytics and no cloud backup. Your profile, photo and Met list stay on your phone until you share them, and uninstalling Tilde removes everything.',

  cardHeading: 'the printable card',
  cardBody: [
    'Tilde works on its own, but if you have a 3D printer there’s a free card to go with it. A QR code on the front opens your website, and an optional NFC tag sealed inside lets people tap it too.',
    'Type in your name, links and colours, choose a back (a terminal window, a plain one or none), and print it in one go on a multi-colour printer. Tilde can write your link or your whole contact card onto its tag.',
  ],
  cardLinks: [
    { label: 'how to print it', href: 'https://github.com/tbutman/tilde-card/blob/main/PRINTING.md' },
    { label: 'model on github', href: 'https://github.com/tbutman/tilde-card' },
  ],
  cardNote: 'Coming soon: customise it in your browser on MakerWorld.',

  faqHeading: 'questions',
  faq: [
    {
      q: 'Does the other person need Tilde?',
      a: 'No. Their phone reads yours the way it reads any NFC tag or card, and anyone can scan the QR code with their camera.',
    },
    {
      q: 'Does it work with iPhones?',
      a: 'iPhones read Tilde, but they only act on links from a tap. If you share your contact card, a tapping iPhone opens your website instead, and scanning the code on your screen saves the contact.',
    },
    {
      q: 'Why only Android?',
      a: 'Tilde makes your phone act as an NFC tag. Android lets apps do that; iOS doesn’t. iPhones can still read it.',
    },
    {
      q: 'Is it really free?',
      a: 'Yes. No price, no paid tier, no account and no ads. The code is public under the MIT licence, so anyone can check what it does.',
    },
    {
      q: 'How do I install it without the Play Store?',
      a: 'Download the file ending in .apk from the releases page on your phone and open it; Android asks you to allow the install once. For automatic updates, add the GitHub page to the free Obtainium app.',
    },
  ],

  sourceLink: { label: 'source on github', href: 'https://github.com/tbutman/tilde' },
  caseStudyLink: { label: 'how i built it', to: '/work/tilde' },
}
