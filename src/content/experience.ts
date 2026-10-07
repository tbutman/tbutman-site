export type Role = {
  company: string
  title: string
  location: string
  start: string
  end: string
  summary: string
  bullets: string[]
  stack?: string[]
}

/** "2024" for a role that started and ended in the same year, otherwise "2019 – 2024". */
export function roleDates(role: Pick<Role, 'start' | 'end'>, separator = ' – ') {
  return role.start === role.end ? role.start : `${role.start}${separator}${role.end}`
}

// Scale figures are deliberately approximate: Thomas can't share exact metrics.
// After moving to Lisbon, Thomas continued with DigitalPay as a contractor from 2024 until about
// September 2025 (Thomas, 4 October 2026).
export const experience: Role[] = [
  {
    company: 'PepAlert',
    title: 'Founder & Engineer',
    location: 'Lisbon (remote)',
    start: '2026',
    end: 'Now',
    summary: 'Designed, built and run a live price- and lab-testing comparison product.',
    bullets: [
      'Built PepAlert end to end on my own, from first commit to a deployed product with sign-in and alerts in under a week: an ingestion pipeline that uses the Claude API to extract prices and lab results, with uncertain items sent to a review queue.',
      'Built a pricing engine and multi-vendor order optimizer; shipped alerts, Telegram and Discord bots, and paid tiers with Stripe; tested model choices against real data before switching.',
    ],
    stack: ['Next.js', 'TypeScript', 'SQLite', 'Drizzle', 'Claude API', 'Stripe'],
  },
  {
    company: 'Career break',
    title: 'Relocation and family',
    location: 'Lisbon',
    start: '2025',
    end: '2026',
    summary: 'Started a family in Lisbon; built Chatlingo, Smart Shopping and hardware projects.',
    bullets: [],
  },
  {
    company: 'DigitalPay',
    title: 'Contract Software Engineer',
    location: 'Remote from Lisbon',
    start: '2024',
    end: '2025',
    summary: 'Continued as a contractor after moving to Lisbon: ACH payment flows and single sign-on.',
    bullets: [
      'Built an ACH payment flow that collects recipient bank and address details, as composable, embeddable React components that can be extended to new payment networks.',
      'Added single sign-on with social and enterprise identity providers alongside the existing password login.',
    ],
    stack: ['React', 'Okta/Auth0', 'Google Places API', 'Storybook'],
  },
  {
    company: 'DigitalPay',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    start: '2019',
    end: '2024',
    summary:
      'Sole frontend owner; rewrote the payout portal that carried a payout to about a million recipients.',
    bullets: [
      'Owned frontend development for all core applications: customer-facing payment products, internal tools and sales demos, used by millions of recipients across 250+ payment options and processing hundreds of millions of dollars in payments.',
      'When the business pivoted from one-off government and airline payments to class-action settlement payouts, rewrote the consumer payout portal on my own initiative over five to six months of nights and weekends, demoing a working version before proposing it and piloting it alongside v1. A payout to about a million recipients then ran smoothly on v2.',
      'Made the portal configuration-driven: customer defaults with per-program, per-network, per-status and per-amount overrides stored in the database. Launching a program went from days of often-buggy work to ready to test within a morning.',
      'Contained an unrelated backend failure at that launch through configuration alone: disabled the affected payment option and showed recipients a notice with the expected fix time, with no deploy.',
      'Modeled the UI as a state machine mirroring backend payment statuses, and designed the API and configuration schema in lockstep with the CTO, who later rewrote the backend along the same lines.',
      'Originated many of the features I shipped, demoing them before they were requested and anticipating the payment methods and per-program customization that new settlements would need.',
      'Remained the sole frontend engineer as the team shrank from 22 people to 6, maintaining the core applications and shipping their frontend features.',
    ],
    stack: ['React', 'AWS', 'Storybook', 'Webpack'],
  },
  {
    company: 'Sipree',
    title: 'Software Engineer',
    location: 'San Francisco, CA',
    start: '2016',
    end: '2019',
    summary: 'Built the recipient payment portal and the admin console behind it.',
    bullets: [
      'Led development of the recipient portal, a payment flow whose layout, networks and steps are driven by JSON config from a REST API.',
      'Worked directly with the sales team to build configurable product demos, including image recognition with AWS Rekognition and Lambda.',
    ],
    stack: ['React', 'Redux', 'AWS Lambda', 'API Gateway', 'Material-UI'],
  },
  {
    company: 'Allergan',
    title: 'Study Management Associate',
    location: 'Irvine, CA',
    start: '2007',
    end: '2015',
    summary: 'Clinical operations, where I taught myself to automate the work.',
    bullets: [
      'Automated bulk document imports with scripting, raising throughput from about 100 documents a day to 2,300.',
    ],
  },
]

export const education = [
  { school: 'MakerSquare', detail: 'Software engineering immersive', year: '2015' },
  { school: 'Irvine Valley College', detail: 'Computer science coursework', year: '2014' },
  { school: 'National University', detail: 'BA, Interdisciplinary Studies, while working full time', year: '2012' },
]

export const skills = [
  { area: 'Frontend', items: 'TypeScript, React, Next.js, Redux, Tailwind CSS, Storybook, Vite, Webpack, accessibility' },
  { area: 'Backend', items: 'Node.js, Express, Fastify, REST APIs, Python/Flask, OAuth and SSO' },
  { area: 'Data', items: 'PostgreSQL, SQLite, Drizzle ORM, DynamoDB, MongoDB' },
  { area: 'Infrastructure and testing', items: 'AWS (Lambda, S3, API Gateway), Docker, CI, Vitest, Playwright, Mocha' },
  { area: 'AI', items: 'Claude Code, Codex, Anthropic and OpenAI APIs, Whisper' },
  { area: 'Embedded', items: 'C++, ESP32, Arduino, OTA updates' },
  { area: 'Languages', items: 'English (native), Portuguese (A2, taking classes in Lisbon)' },
]
