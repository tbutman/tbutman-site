export type DiagramNode = {
  id: string
  label: string
  detail?: string
  col: number
  /** Row position; fractional values centre a node between rows. */
  row: number
  highlight?: boolean
}

export type Diagram = {
  title: string
  columns: string[]
  rows: number
  nodes: DiagramNode[]
  edges: [from: string, to: string][]
}

// System diagrams for the case studies, drawn from each project's README and spec.
export const diagrams: Record<string, Diagram> = {
  'digitalpay-payouts': {
    title: 'DigitalPay payout frontend architecture',
    columns: ['database', 'frontend (mine)', 'payments backend'],
    rows: 3,
    nodes: [
      { id: 'config', label: 'Program config', detail: 'per customer + program', col: 0, row: 1 },
      { id: 'runtime', label: 'Runtime config', detail: 'brand · copy · options', col: 1, row: 0 },
      { id: 'machine', label: 'Flow state machine', detail: 'mirrors payment statuses', col: 1, row: 1, highlight: true },
      { id: 'components', label: 'Composable flows', detail: 'Storybook components', col: 1, row: 2 },
      { id: 'api', label: 'Payments API', detail: 'payment statuses', col: 2, row: 1 },
      { id: 'networks', label: 'Payment networks', detail: 'bank · card · wallets', col: 2, row: 2 },
    ],
    edges: [
      ['config', 'runtime'],
      ['runtime', 'machine'],
      ['machine', 'components'],
      ['machine', 'api'],
      ['api', 'networks'],
    ],
  },
  'smart-shopping': {
    title: 'Smart Shopping architecture',
    columns: ['devices', 'api', 'domain', 'storage'],
    rows: 3,
    nodes: [
      { id: 'phone', label: 'Phone companion', detail: 'offline queue', col: 0, row: 0 },
      { id: 'scanner', label: 'Handheld scanner', detail: 'offline queue', col: 0, row: 1 },
      { id: 'printer', label: 'Base + printer', detail: 'offline queue', col: 0, row: 2 },
      { id: 'api', label: 'Fastify API', detail: 'REST · WebSocket events', col: 1, row: 1, highlight: true },
      { id: 'domain', label: 'Domain modules', detail: 'lists · purchases · review', col: 2, row: 0.5 },
      { id: 'catalog', label: 'Product lookup', detail: 'Open Food Facts', col: 2, row: 1.75 },
      { id: 'db', label: 'SQLite', detail: 'transactional events', col: 3, row: 1 },
    ],
    edges: [
      ['phone', 'api'],
      ['scanner', 'api'],
      ['printer', 'api'],
      ['api', 'domain'],
      ['api', 'catalog'],
      ['domain', 'db'],
    ],
  },
  'spot-watch': {
    title: 'Spot-Watch architecture',
    columns: ['clients', 'esp32-s3 firmware', 'hardware'],
    rows: 3,
    nodes: [
      { id: 'browser', label: 'Phone browser', detail: 'dashboard · gallery', col: 0, row: 1 },
      { id: 'remote', label: 'IR remote', detail: 'NEC presets', col: 0, row: 2 },
      { id: 'ota', label: 'OTA updater', detail: 'signed · rollback', col: 1, row: 0 },
      { id: 'web', label: 'HTTPS server', detail: 'API · MJPEG · TLS', col: 1, row: 1, highlight: true },
      { id: 'camera', label: 'Capture service', detail: 'stream · stills · recovery', col: 1, row: 2 },
      { id: 'sensor', label: 'OV3660 camera', col: 2, row: 0 },
      { id: 'servo', label: 'Servo pan', col: 2, row: 1 },
      { id: 'sd', label: 'microSD', detail: 'QXGA photos', col: 2, row: 2 },
    ],
    edges: [
      ['browser', 'web'],
      ['web', 'ota'],
      ['web', 'camera'],
      ['remote', 'camera'],
      ['camera', 'sensor'],
      ['camera', 'servo'],
      ['camera', 'sd'],
    ],
  },
  chatlingo: {
    title: 'Chatlingo architecture',
    columns: ['client', 'api', 'processing', 'storage'],
    rows: 3,
    nodes: [
      { id: 'web', label: 'React app', detail: 'upload · chat reader', col: 0, row: 1 },
      { id: 'api', label: 'Express API', detail: 'parse txt / zip exports', col: 1, row: 1, highlight: true },
      { id: 'ffmpeg', label: 'FFmpeg', detail: 'audio conversion', col: 2, row: 0 },
      { id: 'whisper', label: 'Whisper', detail: 'voice-note transcription', col: 2, row: 1 },
      { id: 'translate', label: 'Translation API', detail: 'detect · translate', col: 2, row: 2 },
      { id: 'db', label: 'Postgres', detail: 'Drizzle ORM', col: 3, row: 1 },
    ],
    edges: [
      ['web', 'api'],
      ['api', 'ffmpeg'],
      ['ffmpeg', 'whisper'],
      ['api', 'translate'],
      ['whisper', 'db'],
      ['translate', 'db'],
    ],
  },
  pepalert: {
    title: 'PepAlert architecture',
    columns: ['sources', 'intake', 'normalize', 'product'],
    rows: 3,
    nodes: [
      { id: 'telegram', label: 'Channel watcher', detail: 'vendor Telegram groups', col: 0, row: 0.5 },
      { id: 'manual', label: 'Manual drop', detail: 'paste · file · URL', col: 0, row: 1.75 },
      { id: 'intake', label: 'Intake API', detail: 'classify · extract', col: 1, row: 0.5, highlight: true },
      { id: 'claude', label: 'Claude API', detail: 'vision + text extraction', col: 1, row: 1.75 },
      { id: 'review', label: 'Review queue', detail: 'drafts · aliases', col: 2, row: 0 },
      { id: 'db', label: 'SQLite', detail: 'append-only prices', col: 2, row: 1 },
      { id: 'engine', label: 'Pricing engine', detail: '$/mg · order optimizer', col: 2, row: 2 },
      { id: 'web', label: 'Web app', detail: 'Next.js · paid tiers', col: 3, row: 0 },
      { id: 'alerts', label: 'Alerts', detail: 'email · Telegram', col: 3, row: 1 },
      { id: 'bots', label: 'Chat bots', detail: 'Telegram · Discord', col: 3, row: 2 },
    ],
    edges: [
      ['telegram', 'intake'],
      ['manual', 'intake'],
      ['intake', 'claude'],
      ['intake', 'review'],
      ['review', 'db'],
      ['db', 'engine'],
      ['engine', 'web'],
      ['engine', 'alerts'],
      ['engine', 'bots'],
    ],
  },
}
