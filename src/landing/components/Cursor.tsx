import { useEffect, useRef, useState } from 'react'
import { gsap } from '../motion'

/**
 * Золотой курсор: точка следует за мышью мгновенно, кольцо — с инерцией.
 * Над элементами с data-cursor кольцо раскрывается и показывает подпись.
 * Только для точных указателей (мышь/трекпад), на тач-экранах не монтируется.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches
  )

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return
    document.documentElement.classList.add('lx-has-cursor')
    // центр курсора — в точке указателя (xPercent складывается с x)
    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50 })

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3' })

    let current: Element | null = null
    const onMove = (e: PointerEvent) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      const target = (e.target as Element | null)?.closest('[data-cursor], a, button, input, label') ?? null
      if (target !== current) {
        current = target
        ring.current?.classList.toggle('is-hover', !!target)
        setLabel(target?.getAttribute('data-cursor') ?? '')
      }
    }
    const onLeave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 })
    const onEnter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 })

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    return () => {
      document.documentElement.classList.remove('lx-has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div className="lx-cursor-ring" ref={ring} aria-hidden="true">
        <span className={`lx-cursor-ring__label ${label ? 'is-visible' : ''}`}>{label}</span>
      </div>
      <div className="lx-cursor-dot" ref={dot} aria-hidden="true" />
    </>
  )
}
