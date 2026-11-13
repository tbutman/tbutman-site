import { useRef } from 'react'
import { helloShared, helloText } from '../content/hello'
import type { Locale } from '../i18n'

/**
 * Thomas's photo on /hello (Thomas): a small avatar beside ~/tbutman (src/components/SiteHeader.tsx),
 * which opens the same circle larger, up to 280 px: enough to recognize him by, not the whole photo.
 * Every copy is resized from the original with its metadata, location included, left out.
 */
export default function HelloPhoto({ locale }: { locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { avatar, large } = helloShared.photo
  const text = helloText[locale].photo

  return (
    <>
      <button type="button" className="hello-photo" aria-label={text.open} onClick={() => dialog.current?.showModal()}>
        <img src={avatar.src} alt="" width={avatar.width} height={avatar.width} />
      </button>
      {/* A tap anywhere closes it, as do the close button, Escape and the back gesture; the browser
          then returns focus to the avatar. */}
      <dialog ref={dialog} className="photo-dialog" aria-label={text.alt} onClick={() => dialog.current?.close()}>
        <img src={large.src} alt={text.alt} width={large.width} height={large.width} loading="lazy" />
        <button type="button" className="photo-close" autoFocus>
          {text.close}
        </button>
      </dialog>
    </>
  )
}
