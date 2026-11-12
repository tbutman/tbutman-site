// Where a /hello visitor came from, read from the link's ?from= value. Each card, keychain and
// phone link carries its own value, and these values stay fixed once printed. A link without one,
// or with a value that isn't listed here, gets the default page ('link'): plain /hello is also what
// the cards and app shared before the values existed.
//
// deploy/nginx.conf's $hello_arrival map makes the same choice, to serve the matching prerendered
// page; src/lib/arrival.test.mjs keeps the two in step. No imports, so the test can load this file.

// Thomas has two phones: the Android one runs Tilde, the iPhone shares the link its own way. Tilde
// can give a tap and its on-screen QR code different links (-nfc, -qr); plain phone-android is either.
/** The arrivals with a page of their own, as the build writes them (scripts/prerender.mjs). */
export const ARRIVALS = ['card-qr', 'card-nfc', 'key-qr', 'fob', 'phone', 'phone-android', 'phone-android-nfc', 'phone-android-qr', 'phone-iphone', 'qr', 'nfc'] as const

export type Arrival = 'link' | (typeof ARRIVALS)[number]

// The keychain's QR tag also has an NFC sticker inside; tapped, it's the same thing as the fob.
const ALIASES: Record<string, Arrival> = { 'key-nfc': 'fob' }

/** The arrival for a ?from= value: listed values as they are, qr-<name> and nfc-<name> by kind. */
export function arrivalOf(from: string | null): Arrival {
  if (!from) return 'link'
  if ((ARRIVALS as readonly string[]).includes(from)) return from as Arrival
  if (from in ALIASES) return ALIASES[from]
  const kind = /^(qr|nfc)-[a-z0-9-]+$/.exec(from)
  return kind ? (kind[1] as Arrival) : 'link'
}
