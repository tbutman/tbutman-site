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

// Scale figures are deliberately approximate: Thomas can't share exact metrics.
export const experience: Role[] = [
  {
    company: 'Freelance',
    title: 'Software Engineer',
    location: 'Remote',
    start: '2025',
    end: 'Now',
    summary: 'ACH payment flows and single sign-on for a payments client.',
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
    end: '2025',
    summary:
      'Sole frontend owner for payment products used by millions of recipients.',
    bullets: [
      'Owned frontend development for all core applications: customer-facing payment products, internal tools and sales demos, used by millions of recipients and processing hundreds of millions of dollars in payments.',
      'Remained the sole frontend engineer as the team shrank from 22 people to 6, maintaining every application and shipping all new features.',
      'Shipped payout experiences that let recipients choose from more than 250 payment options, including direct-to-bank, digital debit card, wallet balance and gift cards.',
      'Built a shared component library used across company applications, with per-customer theming.',
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
      'Built an admin console for managing program configuration, users, roles and cash-flow reporting across environments.',
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
      'Bridged technical and clinical teams across the US, UK, Australia and Japan.',
      'Completed a BA and computer science coursework (4.0 GPA) while working full time.',
    ],
  },
]

export const education = [
  { school: 'MakerSquare', detail: 'Software engineering immersive', year: '2015' },
  { school: 'Irvine Valley College', detail: 'Computer science, 4.0 GPA', year: '2014' },
  { school: 'National University', detail: 'BA, Interdisciplinary Studies', year: '2012' },
]

export const skills = [
  { area: 'Frontend', items: 'TypeScript, React, Next.js, Redux, Tailwind CSS, Storybook, Vite, Webpack, accessibility' },
  { area: 'Backend', items: 'Node.js, Express, Fastify, REST APIs, Python/Flask, OAuth and SSO' },
  { area: 'Data', items: 'PostgreSQL, SQLite, Drizzle ORM, DynamoDB, MongoDB' },
  { area: 'Infrastructure and testing', items: 'AWS (Lambda, S3, API Gateway), Docker, CI, Vitest, Playwright, Mocha' },
  { area: 'AI', items: 'Claude Code, Codex, Anthropic and OpenAI APIs, Whisper' },
  { area: 'Embedded', items: 'C++, ESP32, Arduino, OTA updates' },
]
