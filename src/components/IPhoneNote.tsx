import RichText from './RichText'

// "On an iPhone" (visitor round 1, item 4): near the top of the hub and Use cases, since an iPhone
// user read "android" as "not for me". Thomas's line (finish-line plan §7), and how to write one.
export const IPHONE_NOTE = '**On an iPhone?** It reads every Tilde tag and code, with no app. To write a tag yourself, use the free NFC Tools app.'

export default function IPhoneNote() {
  return (
    <aside className="iphone-note panel" aria-label="On an iPhone">
      <p>
        <RichText text={IPHONE_NOTE} />
      </p>
    </aside>
  )
}
