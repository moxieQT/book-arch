import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { updateScrollVelocity } from '../audio/soundscape'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Единые кривые движения лендинга: «шёлковое» замедление в конце
gsap.defaults({ ease: 'expo.out', duration: 1.2 })

export { gsap, ScrollTrigger, SplitText }

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

let lenis: Lenis | null = null
let tick: ((time: number) => void) | null = null

/** Плавная инерционная прокрутка Lenis, синхронизированная с ScrollTrigger */
export function startSmoothScroll(): Lenis | null {
  if (lenis || prefersReducedMotion()) return lenis

  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.3 })
  lenis.on('scroll', (e: Lenis) => {
    ScrollTrigger.update()
    // скорость Lenis в пикселях за кадр → «открытость» фильтра звукового дрона (0…3)
    updateScrollVelocity(Math.min(3, Math.abs(e.velocity) / 25))
  })

  tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function stopSmoothScroll() {
  if (tick) gsap.ticker.remove(tick)
  tick = null
  lenis?.destroy()
  lenis = null
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.classList.toggle('lx-locked', locked)
}

/** Прокрутка к секции или элементу с кинематографичным замедлением */
export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) })
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Пересчитать позиции всех триггеров после изменения высоты страницы */
export function refreshScroll() {
  requestAnimationFrame(() => {
    lenis?.resize()
    ScrollTrigger.refresh()
  })
}
