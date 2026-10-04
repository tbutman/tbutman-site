export type Project = {
  slug: string
  title: string
  kind: string
  year: string
  summary: string
  stack: string[]
  repo?: string
  live?: string
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
