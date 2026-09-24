import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../motion'
import { ArcanaWheel } from './Ornaments'

/**
 * Заставка: колесо арканов прорисовывается золотой линией, счётчик
 * ждёт загрузки шрифтов, затем занавес уходит вверх и открывает пролог.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(false)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const finish = () => {
      setGone(true)
      onDone()
    }

    if (prefersReducedMotion()) {
      finish()
      return
    }

    const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))])
    const count = { v: 0 }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, onComplete: finish })
      tl.to(el.querySelectorAll('.lx-draw'), { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.04 }, 0)
        .from('.lx-preloader__name span', { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0.2)
        .to(count, {
          v: 100,
          duration: 1.4,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(3, '0')
          },
        }, 0.1)
        .addLabel('reveal')
        .to('.lx-preloader__inner', { opacity: 0, y: -30, duration: 0.6, ease: 'power2.in' }, 'reveal')
        .to(el, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 'reveal+=0.25')

      // Занавес поднимается только когда шрифты готовы — иначе заголовки «прыгнут»
      tl.play()
      tl.addPause('reveal', () => {
        fontsReady.then(() => tl.play())
      })
    }, el)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null

  return (
    <div className="lx-preloader" ref={root} aria-hidden="true">
      <div className="lx-preloader__inner">
        <ArcanaWheel className="lx-preloader__wheel" />
        <div className="lx-preloader__name">
          {'Алина'.split('').map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </div>
        <span className="lx-preloader__count" ref={counter}>
          000
        </span>
      </div>
    </div>
  )
}
