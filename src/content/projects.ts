export type Project = {
  slug: string
  title: string
  kind: string
  year: string
  summary: string
  stack: string[]
  repo?: string
  live?: string
  /** Further links shown with the source link, such as a second repository. */
  links?: { label: string; href: string }[]
  /** A page on this site for using the product, linked from the home page's project card. */
  product?: { label: string; to: string }
  /** Screenshots shown after the story, each a phone-shaped 450×1000 image. */
  screens?: { src: string; alt: string; caption: string }[]
  status?: string
  /** What the work was mine versus other people's. */
  scope?: string
  problem: string
  /** Narrative sections shown between the problem and the architecture. */
  story?: { heading: string; body: string[] }[]
  built: string[]
  outcomes?: string[]
  /** A closing note on what I would do next or differently. */
  reflection?: string
}

// Personal projects are drafted from each project's README; DigitalPay is from Thomas's own
// account. All case-study copy gets a final pass with Thomas once the site settles.
export const projects: Project[] = [
  {
    slug: 'digitalpay-payouts',
    title: 'DigitalPay payouts',
    kind: 'Professional · fintech',
    year: '2019–2024',
    status: 'Production · millions of recipients',
    summary:
      'A rewrite of the consumer payout portal into a configuration-driven state machine. It carried a payout to about a million recipients, and launching a new program went from days of often-buggy work to ready to test within a morning.',
    stack: ['React', 'Context/Hooks', 'Storybook', 'JSON configuration', 'AWS'],
    scope:
      'I owned the consumer payout portal from its first version and rewrote it end to end. The payments backend was built by the company’s CTO, who was also its principal engineer.',
    problem:
      'DigitalPay started out serving a few large government and airline customers: one-off payments, created on the fly, for a monthly fee. Then the business pivoted to class-action settlement payouts, earning a commission on volume. Settlement administrators run many programs each, and every program could need different payment methods, often chosen by the customer or the judge on the case, plus its own copy and branding. I had written most of the first version of the payout portal early in my career, on the old assumptions, with core logic hard-coded. Adding per-program customization after the fact was slow and risky: every new program meant days of changes and a deploy, and testing a single screen meant walking a test payment through one specific network. Our first big payout, to about a million recipients, was coming, and I did not trust v1 with it.',
    story: [
      {
        heading: 'building it before pitching it',
        body: [
          'I started the rewrite on my own, on nights and weekends, designing it to be composable from the first line and then rebuilding every v1 feature on the new architecture. It took five to six months of spare time, fitted around sprint work, from the first line to feature-complete, and it ended up with more features than v1 and far less fragile code.',
          'By the time I proposed it, it was largely built and I could demo it.',
          'We kept every existing program running on v1 and piloted v2 on the next new program, so live payouts were never at risk during the switch.',
        ],
      },
      {
        heading: 'thinking like the product owner',
        body: [
          'That rewrite was not a one-off. Many of the features I shipped at DigitalPay were my own ideas, which I demoed before anyone asked for them, so the team could decide on something real instead of a description.',
          'I spent more time inside the payment flows than anyone, so I was usually the first to see the gaps, and to spot where the design would fail when a future program arrived with new requirements. The layered configuration came from that habit of designing for the programs we had not signed yet.',
        ],
      },
      {
        heading: 'configuration in layers',
        body: [
          'Each customer has one base configuration for branding, copy and defaults. Programs override it, and overrides can go further, per payment network, payment status or amount. The resolved configuration becomes the props passed to each component, so it is always clear why a screen looks the way it does.',
          'The portal itself is a state machine whose states mirror the backend’s payment statuses, with composable views and flows for dozens of payout methods: ACH and PayPal, direct to bank, paper checks with address collection and normalization, rewards programs and gift cards.',
        ],
      },
      {
        heading: 'designing with the backend',
        body: [
          'I worked in lockstep with the CTO, who wrote the backend. The backend stayed the source of truth for business logic, and my job was to handle every state it could produce; together we designed the API, the config schema and even the property names, which let us move very quickly.',
          'After the frontend shipped, he rewrote the backend as a v2 of its own, partly inspired by the frontend rewrite.',
        ],
      },
      {
        heading: 'launch day',
        body: [
          'The payout to about a million recipients ran on v2. At launch, an unrelated backend bug broke one payment option. Because everything was configuration, we disabled that option and added a notice on page load with the expected fix time, telling recipients to choose another payment method or check back later. No deploy, no hot-fix under pressure, and the rest of the payout carried on.',
          'Each program sent email from its own domain, so notification emails went out gradually to warm those domains up rather than all at once.',
        ],
      },
    ],
    built: [
      'A ground-up rewrite of the consumer payout portal as composable payment flows driven by layered JSON configuration stored in the database.',
      'Configurable copy, payment language, branding to each customer’s spec, payment flows, available payment options, notifications and error messaging, with overrides per program, payment network, payment status and amount.',
      'Incident controls in configuration: disable a payment network during an outage and show recipients a page-load notice with the expected fix time, with no code change.',
      'Scripts that generate every user notification template from a program’s configuration and load it into the production database.',
      'Storybook previews of every component and state, driven by the same configuration props as production.',
    ],
    outcomes: [
      'The payout to about a million recipients ran smoothly on v2, including a backend incident at launch that was contained through configuration alone.',
      'Launching a program became a new row in the programs table with its configuration in a column: ready to test within a morning, instead of days of often-buggy work.',
      'Onboarding a new customer went from days to minutes or hours, limited mainly by collecting logos and custom language and provisioning their portal URL.',
      'Product managers and customer representatives could finally see every screen in every payment state. They described what they wanted, and it translated directly into configuration.',
      'Fewer code changes to test and deploy, and a stable, predictable product for recipients in the middle of live payouts.',
    ],
    reflection:
      'Engineers still edited the JSON by hand. Storybook already showed exactly what any configuration would render, so the natural next step would have been a constrained visual editor that let product and support staff launch programs themselves.',
  },
  {
    slug: 'pepalert',
    title: 'PepAlert',
    kind: 'Product',
    year: '2026',
    status: 'Live · early access',
    live: 'https://pepalert.com',
    summary:
      'A live price-comparison product for research peptides. It tracks pricing, stock and independent lab-test results across hundreds of vendor channels, with alerts, an order optimizer and chat bots.',
    stack: ['Next.js', 'TypeScript', 'SQLite', 'Drizzle', 'Claude API', 'Stripe'],
    problem:
      'Research-peptide buyers were scanning dozens of Telegram channels, doing price-per-mg maths in spreadsheets and hunting through pinned messages for lab reports, because every vendor names, sizes and prices the same product differently and test results are scattered.',
    built: [
      'An ingestion pipeline that watches vendor channels, uses the Claude API to extract prices and lab-report results from posts, images and PDFs, and maps every vendor code to a canonical product. Anything uncertain goes to a review queue instead of being guessed.',
      'A normalization and pricing engine that compares true cost per mg, including shipping, free-shipping thresholds and promotions. As of October 2026 the catalog covers 270+ products from 23+ vendors.',
      'A multi-vendor order optimizer that plans the cheapest order, the fastest delivery or the fewest shipments.',
      'Alerts by email and Telegram, plus Telegram and Discord bots for price lookups, order drafting and notes.',
      'Lab-report results (purity, net content, endotoxin) shown per batch, with who ordered the test and which lab ran it, so buyers can favour independent third-party testing.',
      'Google and Telegram sign-in, free and paid tiers with Stripe, and first-party analytics with no third-party scripts.',
      'Runs on a single self-hosted box with SQLite, chosen for cost and simplicity at early-access scale.',
    ],
  },
  {
    slug: 'tilde',
    title: 'Tilde',
    kind: 'Open source · Android + hardware',
    year: '2026',
    status: 'Open source · v1.2',
    live: 'https://tbutman.com/tilde',
    repo: 'https://github.com/tbutman/tilde',
    links: [{ label: 'card source on github', href: 'https://github.com/tbutman/tilde-card' }],
    product: { label: 'get the app', to: '/tilde' },
    summary:
      'A free, open-source Android app that turns a phone into an NFC business card, and the Tilde card, a 3D-printable business card to go with it. Tap phones or scan the code to share a full contact card, a website or WhatsApp, switching between them in one tap, with no account, nothing to install on the other phone and no internet permission on mine.',
    stack: ['Kotlin', 'Android NFC', 'Material 3', 'GitHub Actions', 'OpenSCAD', 'Python'],
    scope:
      'Mine end to end: the product, the Android app and its NFC protocol layer, the Tilde card’s model and its automated checks, releases and documentation. I built it with AI coding agents, using the process on the how-i-work page, and tested it on real phones and real prints.',
    problem:
      'Paper business cards get lost, and digital-card apps usually share a link to the vendor’s own servers and want an account on at least one side. I wanted something that works with any phone, needs nothing on the other person’s side, and keeps my details on my phone until I share them.',
    story: [
      {
        heading: 'two halves of one idea',
        body: [
          'It started as a printed card for events: a QR code on the front and an NFC sticker sealed inside, both opening my site’s /hello page. Then I wanted the same thing when the card was in a drawer.',
          'Android lets an app answer NFC readers as if it were a tag, so the phone itself can be the card. An iPhone reads it the way it reads any NFC sticker, with no app installed. Tilde can also write your link onto the Tilde card’s NFC sticker, so the app and the card work as a pair.',
        ],
      },
      {
        heading: 'speaking the protocol',
        body: [
          'Under the interface, Tilde answers as an NFC Forum Type 4 Tag: it handles the reader’s commands one by one, from selecting the NDEF application to serving long messages in chunks. That whole exchange runs in unit tests on the JVM, so protocol changes are checked without a phone.',
          'Testing on real phones shaped the product. iPhones only act on links from a tap, so the contact card goes out as a vCard followed by my website: Android offers to save the contact, an iPhone opens the site, and the QR code on screen saves the contact on either. The Share screen says which options need a scan on an iPhone.',
        ],
      },
      {
        heading: 'private by construction',
        body: [
          'Tilde has no internet permission, so it cannot send anything anywhere. My cards, their photos and the list of people I have met stay on the phone unless I choose to send them, and the app opts out of cloud backup; moving phones is a backup file I keep. A photo only goes out with a contact card I send, and only if I switch that on. Taps are answered only while Tilde is on screen, unless I choose otherwise, and never from the lock screen. There are no analytics and no account.',
          'Nothing personal is in the source. My own details reach my debug builds from a file git ignores, release builds never include it, and I checked the first release APK for my phone numbers before publishing it.',
        ],
      },
      {
        heading: 'a 3D model that checks itself',
        body: [
          'The card is a parametric OpenSCAD model in four colors of PLA, printed face-down because the first sample showed the plate side comes out flat and matte. The printer pauses halfway, the NFC sticker goes in, and the rest of the card seals it.',
          'Every build rasterizes the exported model, decodes the QR code and checks every letter stroke and gap against what the nozzle can print, before anything reaches the printer. To let anyone customize the card on MakerWorld, which runs a single OpenSCAD file with no scripts, I wrote a QR encoder in OpenSCAD from the ISO standard; a test compares it with a reference library module for module across every size and mask the card uses.',
        ],
      },
      {
        heading: 'shipping it like a product',
        body: [
          'Both halves are public under the MIT license, with documentation written for non-technical people: how to install the app, which stickers to buy and how to print the card. Every push runs the tests and lint in CI. A version tag builds a signed, shrunk release and publishes it on GitHub, where the Obtainium app picks up updates.',
          'Using 1.0 every day shaped 1.1: a four-step welcome with a live preview of the card, saved links with a quick-switch row, and Send for people who aren’t in the room. Changes are tried on my phone as a separate debug app that installs next to the release; a pre-release then updates the real app through Obtainium, so the signed upgrade is tested before anyone else gets it.',
          'Planning for events shaped 1.2. People present themselves differently to a recruiter, a friend and a meetup, so a card became one of several identities, each with its own name, photo, links and color, switched with a swipe. I wrote up what belongs to a card (the identity, what it shares) and what stays global (the Met list, the event name, guest Wi-Fi) in a spec before any code. 1.2 also added backup to a file instead of a cloud, a choice of what each card’s contact card leaves out, a light theme, a home-screen widget and a Portuguese interface.',
          'Several identities in one app is where products like Blinq and Popl put their value, with the identities on their servers. Tilde keeps them on the phone.',
        ],
      },
    ],
    screens: [
      { src: '/tilde/share.webp', caption: 'share', alt: 'Tilde’s Share screen: Jane Doe’s Web Summit card, the QR code for her contact card, and chips to switch between her website, contact card and LinkedIn' },
      { src: '/tilde/cards.webp', caption: 'switching cards', alt: 'Switching cards: Jane Doe’s Work and Web Summit cards, with New card and Manage cards' },
      { src: '/tilde/write.webp', caption: 'write a sticker', alt: 'Write a sticker: the contact card chosen, with the warning that anyone who taps the sticker gets the phone number and email' },
    ],
    built: [
      'An Android app in Kotlin that emulates an NFC Forum Type 4 Tag with Host Card Emulation, serving links, vCards and Wi-Fi credentials as NDEF records.',
      'Sharing that switches in one tap or a swipe: a full contact card (vCard), a website or profile link, saved links, a WhatsApp chat or guest Wi-Fi, with Send and Copy for sharing at a distance. Plus receive and write modes: read other NFC stickers, cards and phones, or write a link or contact card onto an NFC sticker or a Tilde card.',
      'A Met list of everyone a tap reached, with notes, event names and CSV export; a four-step welcome with a live card preview and country-aware phone numbers; a profile photo with an in-app cropper; and a Quick Settings tile.',
      'Several cards, each a complete identity with its own choice of what its contact card includes; backup and restore through a file; a light theme; the Tilde QR code home-screen widget; and the whole app in English and European Portuguese.',
      'Unit tests for the tag protocol, NDEF records, vCards, saved links and the Met log, plus CI and tag-triggered, signed GitHub releases (R8 keeps the APK under 2 MB).',
      'A parametric OpenSCAD card in four colors: QR code only or with an NFC sticker sealed inside (thin or thick), three back styles, 0.2 mm and 0.4 mm nozzle versions, and text that shrinks to fit using the font’s own metrics.',
      'A QR encoder written in OpenSCAD and a build pipeline that decodes the QR code and measures strokes and gaps on the exported model before printing.',
    ],
    outcomes: [
      'Two releases two days apart: 1.1 installs over 1.0 and keeps the card, which I tested by updating through Obtainium from a pre-release before anyone else got it.',
      'Two permissions, NFC and vibration, and no internet permission.',
      'Tested on an Android phone with an iPhone reading it, from the first beta.',
    ],
    reflection:
      'What I’d do differently: test phone-to-phone with a second Android phone before 1.0. Next: phone-to-phone taps between two Android phones, the customizable card on MakerWorld, and the Play Store.',
  },
  {
    slug: 'chatlingo',
    title: 'Chatlingo',
    kind: 'AI integration',
    year: '2025',
    status: 'Working prototype · not currently deployed',
    summary:
      'Upload a WhatsApp export and read it in your language, with voice notes transcribed and translated in place.',
    stack: ['React', 'Express', 'Postgres', 'Whisper', 'Drizzle'],
    problem:
      'Group chats in a language you only half speak are hard to follow, and voice notes are worse.',
    built: [
      'An upload pipeline that parses WhatsApp text and zip exports, including photos and audio.',
      'Language detection and translation for mixed-language conversations.',
      'Voice-note transcription with Whisper, with FFmpeg handling audio conversion.',
      'A chat-style reader with audio playback, and export back to WhatsApp format.',
    ],
  },
  {
    slug: 'smart-shopping',
    title: 'Smart Shopping',
    kind: 'Full stack',
    year: '2026',
    status: 'Working v1 · runs locally',
    summary:
      'A barcode-driven household shopping system: one authoritative backend, offline-first device clients and a full hardware simulator.',
    stack: ['TypeScript', 'Fastify', 'SQLite', 'React', 'Playwright'],
    problem:
      'A shared shopping list falls apart when several people and several devices update it at once, and some of those devices are offline.',
    built: [
      'A modular-monolith API in Fastify and SQLite that is the single source of truth, with transactional events and per-user attribution.',
      'Independent clients for a phone, a handheld scanner, a base station and a printer, each with a durable offline queue.',
      'A browser Device Lab that simulates the hardware, so the whole system runs and is tested without any physical device.',
      'Unit, integration and end-to-end suites in Vitest and Playwright.',
    ],
  },
  {
    slug: 'spot-watch',
    title: 'Spot-Watch',
    kind: 'Embedded',
    year: '2026',
    status: 'Personal hardware build · local network only',
    summary:
      'An ESP32 parking camera with a mobile dashboard, signed over-the-air updates and HTTPS end to end.',
    stack: ['C++', 'ESP32-S3', 'Embedded web UI', 'OTA'],
    problem:
      'I wanted to check on a parked car from my phone without sending video through a third-party cloud.',
    built: [
      'Firmware that streams live video to two viewers, pans the camera with a servo and saves full-resolution photos to microSD.',
      'A mobile-first dashboard, gallery and settings UI served straight from the device.',
      'Signed, password-protected firmware updates over Wi-Fi with automatic rollback.',
      'CA-validated HTTPS for every page, API call and video stream, plus automatic recovery for Wi-Fi, camera and storage.',
    ],
  },
]

export function findProject(slug: string | undefined) {
  return projects.find((project) => project.slug === slug)
}
