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
  problem: string
  built: string[]
}

// Draft copy, written from each project's README. The case-study bodies still
// need Thomas's own account of the decisions and trade-offs.
export const projects: Project[] = [
  {
    slug: 'pepalert',
    title: 'PepAlert',
    kind: 'Product',
    year: '2026',
    status: 'Live · early access',
    live: 'https://pepalert.com',
    summary:
      'A live price-comparison product that tracks pricing, stock and lab reports across hundreds of vendor channels, with alerts, an order optimizer and chat bots.',
    stack: ['Next.js', 'TypeScript', 'SQLite', 'Drizzle', 'Claude API', 'Stripe'],
    problem:
      'Buyers were scanning dozens of Telegram channels and doing price-per-mg maths in spreadsheets, because every vendor names, sizes and prices the same product differently.',
    built: [
      'An ingestion pipeline that watches vendor channels, uses the Claude API to extract prices and lab-report results from posts, images and PDFs, and maps every vendor code to a canonical product. Anything uncertain goes to a review queue instead of being guessed.',
      'A normalization and pricing engine that compares true cost per mg, including shipping, free-shipping thresholds and promotions. As of October 2026 the catalog covers 270+ products from 23+ vendors.',
      'A multi-vendor order optimizer that plans the cheapest order, the fastest delivery or the fewest shipments.',
      'Alerts by email and Telegram, plus Telegram and Discord bots for price lookups, order drafting and notes.',
      'Google and Telegram sign-in, free and paid tiers, and first-party analytics with no third-party scripts.',
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
