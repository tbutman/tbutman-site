import { useEffect, useRef } from 'react'

export type Video = { webm: string; mp4: string; poster: string; label: string }

// The Tilde Card video (from tilde-media): muted, looping, inline, starting once the page is
// interactive. React doesn't write `muted` into the prerendered HTML, so the browser wouldn't
// autoplay it before hydration anyway; this effect mutes it and starts it. With "reduce motion"
// on, it stays on its poster with controls, for the visitor to play.
export default function ProductVideo({ video, className }: { video: Video; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.muted = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.controls = true
      return
    }
    // A browser that refuses (data saver, low power) keeps the poster.
    void element.play().catch(() => (element.controls = true))
  }, [])
  return (
    <video
      ref={ref}
      className={className}
      aria-label={video.label}
      poster={video.poster}
      width={1920}
      height={1080}
      muted
      loop
      playsInline
      preload="metadata"
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  )
}
