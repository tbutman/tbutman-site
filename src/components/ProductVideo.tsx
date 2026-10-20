import { useEffect, useRef } from 'react'

export type Video = { webm: string; mp4: string; poster: string; label: string }

// The Tilde Card video (from tilde-media): muted, looping, inline. It loads nothing but its poster
// until it nears the screen, then plays, and pauses again when scrolled away: on /tilde/card it sits
// far down the page, and a phone on conference data shouldn't fetch 3 MB it may never see. React
// doesn't write `muted` into the prerendered HTML, so the effect mutes it. With "reduce motion" on,
// it stays on its poster with controls, for the visitor to play.
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return element.pause()
        // A browser that refuses (data saver, low power) keeps the poster.
        void element.play().catch(() => (element.controls = true))
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
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
      preload="none"
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  )
}
