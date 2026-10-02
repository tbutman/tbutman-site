export type Project = {
  slug: string
  title: string
  kind: string
  year: string
  summary: string
  stack: string[]
  repo?: string
  problem: string
  built: string[]
}

// Draft copy, written from each project's README. The case-study bodies still
// need Thomas's own account of the decisions and trade-offs.
export const projects: Project[] = [
  {
    slug: 'smart-shopping',
    title: 'Smart Shopping',
    kind: 'Full stack',
    year: '2026',
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
    summary:
      'An ESP32 parking camera with a mobile dashboard, signed over-the-air updates and HTTPS end to end.',
    stack: ['C++', 'ESP32-S3', 'Embedded web UI', 'OTA'],
    repo: 'https://github.com/tbutman/spot-watch',
    problem:
      'I wanted to check on a parked car from my phone without sending video through a third-party cloud.',
    built: [
      'Firmware that streams live video to two viewers, pans the camera with a servo and saves full-resolution photos to microSD.',
      'A mobile-first dashboard, gallery and settings UI served straight from the device.',
      'Signed, password-protected firmware updates over Wi-Fi with automatic rollback.',
      'CA-validated HTTPS for every page, API call and video stream, plus automatic recovery for Wi-Fi, camera and storage.',
    ],
  },
  {
    slug: 'chat-translator',
    title: 'Chat Translator',
    kind: 'AI integration',
    year: '2025',
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
    slug: 'pepalert',
    title: 'PepAlert',
    kind: 'Data pipeline',
    year: '2026',
    summary:
      'A pipeline that turns messy price lists and lab reports from many vendors into one comparable dataset.',
    stack: ['Next.js', 'Drizzle', 'SQLite', 'Claude API', 'Stripe'],
    problem:
      'Every vendor names, sizes and prices the same product differently, so nothing can be compared until it is normalized.',
    built: [
      'An ingestion pipeline that reads vendor posts and documents and maps each vendor code onto a canonical product.',
      'Append-only price observations, which give price history for free.',
      'A review queue for anything the pipeline cannot map with confidence.',
      'An invite-only dashboard with role-based access.',
    ],
  },
]

export function findProject(slug: string | undefined) {
  return projects.find((project) => project.slug === slug)
}
