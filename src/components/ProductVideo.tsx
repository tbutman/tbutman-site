import { useEffect, useRef } from 'react'

export type Video = { webm: string; mp4: string; poster: string; label: string }

// The Tilde Card video (from tilde-media): muted, looping, inline. It loads nothing until it nears
// the screen: its poster (105 kB) once it's within a screen's height, the video itself (3 MB) when
// it's about to show, and it pauses again when scrolled away. On /tilde/card it sits far down the
// page, and a phone on conference data shouldn't fetch what it may never see. React doesn't write
// `muted` into the prerendered HTML, so the effect mutes it. With "reduce motion" on, it stays on
// its poster with controls, for the visitor to play.
export default function ProductVideo({ video, className }: { video: Video; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.muted = true
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        element.poster = video.poster
        near.disconnect()
      },
      { rootMargin: '100% 0px' },
    )
    near.observe(element)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.controls = true
      return () => near.disconnect()
    }
    const visible = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return element.pause()
        // A browser that refuses (data saver, low power) keeps the poster.
        void element.play().catch(() => (element.controls = true))
      },
      { rootMargin: '200px 0px' },
    )
    visible.observe(element)
    return () => {
      near.disconnect()
      visible.disconnect()
    }
  }, [video.poster])
  return (
    <video ref={ref} className={className} aria-label={video.label} width={1920} height={1080} muted loop playsInline preload="none">
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  )
}
