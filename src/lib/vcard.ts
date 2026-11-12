import { hello } from '../content/hello'
import { profile } from '../content/profile'

// The /hello page's "save contact" file, written to dist/ by scripts/prerender.mjs from the same
// content as the page. vCard 3.0 is the version iOS and Android contacts apps both import. Links
// carry itemN.X-ABLabel labels, which Apple and Google Contacts both read. The WhatsApp number is
// the one phone number (Thomas): saved as a mobile, WhatsApp lists the contact; no address.
//
// It holds what the page offers (Thomas): each of VCARD_ITEMS that ?contact=, ?social= and ?links=
// leave showing (scripts/hello-share.mjs). The build writes one file per combination,
// vcard/<mask>.vcf (bit i for VCARD_ITEMS[i], three hex digits), and the page asks for its own as
// /thomas-butman.vcf?v=<mask>, which nginx serves from there (deploy/nginx.conf).

/** What a contact card can hold, each a data-hello-item key on /hello. The order sets the mask's bits. */
export const VCARD_ITEMS = ['email', 'whatsapp', 'site', 'instagram', 'x', 'linkedin', 'github', 'resume', 'book'] as const

/** The mask for the items a card holds, as /thomas-butman.vcf?v= and the file's name take it. */
export const vcardMask = (has: (item: (typeof VCARD_ITEMS)[number]) => boolean) =>
  VCARD_ITEMS.reduce((mask, item, bit) => (has(item) ? mask | (1 << bit) : mask), 0).toString(16).padStart(3, '0')

export function contactCard(siteUrl: string, mask = vcardMask(() => true)) {
  const bits = parseInt(mask, 16)
  const has = (item: (typeof VCARD_ITEMS)[number]) => (bits & (1 << VCARD_ITEMS.indexOf(item))) !== 0
  const [given, ...rest] = profile.name.split(' ')
  const github = profile.links.find((link) => link.label === 'GitHub')
  const links = [
    has('site') && { label: 'Website', href: `${siteUrl}/` },
    has('whatsapp') && profile.whatsapp && { label: 'WhatsApp', href: `https://wa.me/${profile.whatsapp}` },
    ...hello.socials.filter((link) => has(link.label.toLowerCase() as (typeof VCARD_ITEMS)[number])),
    has('github') && github,
    has('resume') && { label: 'Résumé', href: `${siteUrl}/resume` },
    has('book') && { label: 'Intro call', href: profile.bookingUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link))
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escape(rest.join(' '))};${escape(given)};;;`,
    `FN:${escape(profile.name)}`,
    `TITLE:${escape(profile.role)}`,
    ...(has('email') ? [`EMAIL;TYPE=INTERNET:${profile.email}`] : []),
    ...(has('whatsapp') && profile.whatsapp ? [`TEL;TYPE=CELL:+${profile.whatsapp}`] : []),
    ...links.flatMap((link, index) => [`item${index + 1}.URL:${link.href}`, `item${index + 1}.X-ABLabel:${escape(link.label)}`]),
    'END:VCARD',
  ]
  return { file: hello.vcardPath.slice(1), body: lines.map(fold).join('\r\n') + '\r\n' }
}

/** Every file the build writes: the default card (what /hello shows by default) and every combination. */
export function contactCards(siteUrl: string, shownByDefault: (item: string) => boolean) {
  const all = Array.from({ length: 2 ** VCARD_ITEMS.length }, (_, bits) => bits.toString(16).padStart(3, '0'))
  return [contactCard(siteUrl, vcardMask(shownByDefault)), ...all.map((mask) => ({ file: `vcard/${mask}.vcf`, body: contactCard(siteUrl, mask).body }))]
}

function escape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n')
}

// Lines longer than 75 octets continue on the next line after a space (RFC 2425).
function fold(line: string) {
  const parts: string[] = []
  let rest = line
  while (new TextEncoder().encode(rest).length > 75) {
    let cut = 75
    while (new TextEncoder().encode(rest.slice(0, cut)).length > 75) cut--
    parts.push(rest.slice(0, cut))
    rest = ' ' + rest.slice(cut)
  }
  parts.push(rest)
  return parts.join('\r\n')
}
