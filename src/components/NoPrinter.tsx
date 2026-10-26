import RichText from './RichText'

// "No 3D printer?" answered where making one comes up (visitor round 2, item 16): no sales, and no
// "we" (item 13).
export const NO_PRINTER = '**No 3D printer?** Ask a friend or a makerspace (most have one), or pick one up at the Tilde booth at Web Summit, Lisbon, November 9–12.'

export default function NoPrinter() {
  return (
    <p className="no-printer">
      <RichText text={NO_PRINTER} />
    </p>
  )
}
