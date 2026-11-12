import { type ReactNode, useSyncExternalStore } from 'react'

// "Get the app" is a dead end on an iPhone or an iPad (visitor round 2, item 6): there it becomes a
// line saying what that phone does without an app. Read from the browser only (the server's snapshot
// is null), so the prerendered page is the same for everyone and hydrates cleanly; Android and
// desktops keep the button.

const appleDevice = (): 'iPhone' | 'iPad' | null => {
  const ua = navigator.userAgent
  if (/iPhone|iPod/.test(ua)) return 'iPhone'
  // iPadOS asks for the desktop site: a Mac with a touch screen is an iPad.
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iPad'
  return null
}
const subscribe = () => () => {}

/** The children, or on an iPhone or iPad, what it does instead of the Android app (or the given note). */
export default function NotOnIPhone({ children, note }: { children: ReactNode; note?: ReactNode }) {
  const device = useSyncExternalStore(subscribe, appleDevice, () => null)
  if (!device) return children
  if (note) return note
  return (
    <span className="iphone-app-note">
      Your {device} reads tags with no app · the app is Android only
    </span>
  )
}
