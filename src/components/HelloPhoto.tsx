import { useRef } from 'react'
import { helloShared, helloText } from '../content/hello'
import type { Locale } from '../i18n'

/**
 * Thomas's photo on /hello (Thomas): a circle, which opens the whole photo. The intro shows it large
 * on desktop; on a phone it's the small avatar beside ~/tbutman (src/components/SiteHeader.tsx).
 * Every copy is resized from the original with its metadata, location included, left out.
 */
export default function HelloPhoto({ locale, variant }: { locale: Locale; variant: 'hero' | 'avatar' }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { photo } = helloShared
  const text = helloText[locale].photo
  const size = variant === 'hero' ? photo.circle : photo.avatar

  return (
    <>
      <button type="button" className={`hello-photo hello-photo-${variant}`} aria-label={text.open} onClick={() => dialog.current?.showModal()}>
        <img src={size.src} alt="" width={size.width} height={size.width} />
      </button>
      {/* A tap anywhere closes it, as do Escape and the back gesture (the browser's own for a dialog). */}
      <dialog ref={dialog} className="photo-dialog" aria-label={text.alt} onClick={() => dialog.current?.close()}>
        <img src={photo.full.src} alt={text.alt} width={photo.full.width} height={photo.full.height} loading="lazy" />
      </dialog>
    </>
  )
}
