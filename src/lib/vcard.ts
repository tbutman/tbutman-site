import { hello } from '../content/hello'
import { profile } from '../content/profile'

// The /hello page's "save contact" file, written to dist/ by scripts/prerender.mjs from the same
// content as the page. vCard 3.0 is the version iOS and Android contacts apps both import. Links
// carry itemN.X-ABLabel labels, which Apple and Google Contacts both read. No phone number or
// address, matching the rest of the site.
export function contactCard(siteUrl: string) {
  const [given, ...rest] = profile.name.split(' ')
  const links = [{ label: 'Website', href: `${siteUrl}/` }, ...hello.socials]
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escape(rest.join(' '))};${escape(given)};;;`,
    `FN:${escape(profile.name)}`,
    `TITLE:${escape(profile.role)}`,
    `EMAIL;TYPE=INTERNET:${profile.email}`,
    ...links.flatMap((link, index) => [`item${index + 1}.URL:${link.href}`, `item${index + 1}.X-ABLabel:${escape(link.label)}`]),
    'END:VCARD',
  ]
  return { file: hello.vcardPath.slice(1), body: lines.map(fold).join('\r\n') + '\r\n' }
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
