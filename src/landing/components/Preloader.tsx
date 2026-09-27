import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../motion'
import { MerkabaLoader } from './MerkabaLoader'

/**
 * Заставка: живая меркаба — знак Алины — вырастает из вершин и вращается,
 * счётчик ждёт шрифты и 3D-сцену, затем меркаба вспыхивает, занавес уходит
 * вверх, а в прологе та же меркаба собирается из облака энергии.
 */
export function Preloader({
  onDone,
  waitFor,
  theme = 'light',
}: {
  onDone: () => void
  waitFor?: Promise<unknown>
  theme?: 'light' | 'dark'
}) {
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

    // Ждём шрифты и 3D-сцену, но не дольше 6 секунд — медленная сеть не должна держать занавес
    const fontsReady = Promise.race([
      Promise.all([document.fonts?.ready ?? Promise.resolve(), waitFor ?? Promise.resolve()]),
      new Promise((r) => setTimeout(r, 6000)),
    ])
    const count = { v: 0 }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, onComplete: finish })
      tl.from('.lx-preloader__merkaba', { scale: 0.6, opacity: 0, duration: 1.8, ease: 'expo.out' }, 0)
        .from('.lx-preloader__name span', { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0.2)
        .from('.lx-preloader__sub', { opacity: 0, letterSpacing: '1.2em', duration: 1.4, ease: 'expo.out' }, 0.5)
        .to(count, {
          v: 100,
          duration: 2.2,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (counter.current) counter.current.textContent = String(Math.round(count.v)).padStart(3, '0')
          },
        }, 0.1)
        .addLabel('reveal')
        .to('.lx-preloader__merkaba', { scale: 1.35, duration: 0.9, ease: 'power2.in' }, 'reveal')
        .to('.lx-preloader__inner', { opacity: 0, y: -30, duration: 0.7, ease: 'power2.in' }, 'reveal+=0.1')
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
        <MerkabaLoader className="lx-preloader__merkaba" theme={theme} />
        <div className="lx-preloader__name">
          {'Alina'.split('').map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </div>
        <span className="lx-preloader__sub">Tarot · Energy</span>
        <span className="lx-preloader__count" ref={counter}>
          000
        </span>
      </div>
    </div>
  )
}
