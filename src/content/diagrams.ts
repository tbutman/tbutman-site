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
  /** An optional label is drawn at the middle of the arrow. */
  edges: [from: string, to: string, label?: string][]
}

// System diagrams for the case studies, drawn from each project's README and spec, plus the
// /hello page's own request path (kept to the level of detail the footer already gives).
export const diagrams: Record<string, Diagram> = {
  hello: {
    title: 'How this page reached you',
    columns: ['in your hand', 'the edge', 'my home in lisbon', 'this page'],
    rows: 1,
    nodes: [
      { id: 'phone', label: 'Your phone', detail: 'via NFC or QR code', col: 0, row: 0 },
      { id: 'cloudflare', label: 'Cloudflare', detail: 'TLS · tunnel to home', col: 1, row: 0 },
      { id: 'server', label: 'Home server', detail: 'Lenovo M920q · Proxmox', col: 2, row: 0 },
      { id: 'nginx', label: 'nginx', detail: 'in Docker · static HTML', col: 3, row: 0, highlight: true },
    ],
    edges: [
      ['phone', 'cloudflare'],
      ['cloudflare', 'server'],
      ['server', 'nginx'],
    ],
  },
  'hello-pt': {
    title: 'Como esta página chegou até ti',
    columns: ['na tua mão', 'na internet', 'a minha casa em lisboa', 'esta página'],
    rows: 1,
    nodes: [
      { id: 'phone', label: 'O teu telemóvel', detail: 'por NFC ou código QR', col: 0, row: 0 },
      { id: 'cloudflare', label: 'Cloudflare', detail: 'TLS · túnel até casa', col: 1, row: 0 },
      { id: 'server', label: 'Servidor em casa', detail: 'Lenovo M920q · Proxmox', col: 2, row: 0 },
      { id: 'nginx', label: 'nginx', detail: 'em Docker · HTML estático', col: 3, row: 0, highlight: true },
    ],
    edges: [
      ['phone', 'cloudflare'],
      ['cloudflare', 'server'],
      ['server', 'nginx'],
    ],
  },
  'digitalpay-payouts': {
    title: 'DigitalPay payout portal architecture',
    columns: ['configuration (database)', 'portal (mine)', 'payments backend'],
    rows: 3,
    nodes: [
      { id: 'customer', label: 'Customer config', detail: 'brand · copy · defaults', col: 0, row: 0 },
      { id: 'program', label: 'Program overrides', detail: 'per program', col: 0, row: 1 },
      { id: 'rules', label: 'Rule overrides', detail: 'network · status · amount', col: 0, row: 2 },
      { id: 'resolver', label: 'Resolved config', detail: 'becomes component props', col: 1, row: 0 },
      { id: 'machine', label: 'Flow state machine', detail: 'mirrors payment statuses', col: 1, row: 1, highlight: true },
      { id: 'views', label: 'Composable views', detail: 'previewed in Storybook', col: 1, row: 2 },
      { id: 'api', label: 'Payments API', detail: 'source of truth', col: 2, row: 1 },
      { id: 'networks', label: 'Payout methods', detail: 'ACH · check · cards …', col: 2, row: 2 },
    ],
    edges: [
      ['customer', 'resolver'],
      ['program', 'resolver'],
      ['rules', 'resolver'],
      ['resolver', 'machine'],
      ['machine', 'views'],
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
  tilde: {
    title: 'Tilde: the app and the card',
    columns: ['source', 'what they tap', 'their phone'],
    rows: 2,
    nodes: [
      { id: 'app', label: 'Tilde app', detail: 'cards stay on the phone', col: 0, row: 0, highlight: true },
      { id: 'model', label: 'Tilde card model', detail: 'OpenSCAD · QR encoder', col: 0, row: 1 },
      { id: 'hce', label: 'Type 4 tag (HCE)', detail: 'link · vCard · Wi-Fi', col: 1, row: 0 },
      { id: 'card', label: 'Tilde card', detail: 'QR code · NFC sticker', col: 1, row: 1 },
      { id: 'phone', label: 'Their phone', detail: 'tap or scan · no app', col: 2, row: 0.5 },
    ],
    edges: [
      ['app', 'hce'],
      ['app', 'card', 'write a sticker'],
      ['model', 'card'],
      ['hce', 'phone'],
      ['card', 'phone'],
    ],
  },
}
