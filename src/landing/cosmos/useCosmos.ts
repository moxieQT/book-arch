import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '../motion'
import type { Cosmos } from './Cosmos'

/** «Космос» запускается, если есть WebGL2 и не включено «уменьшить движение» */
export function canUseCosmos(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

// Границы участков маршрута камеры: где начинается каждая глава и переходы между ними
const ANCHOR_PROBES: [string, string][] = [
  ['#philosophy', 'top top'], // 1: конец пролога — начало туннеля
  ['#paths', 'top top'], // 2: мандала путей
  ['#folio', 'top bottom'], // 3: нырок к книге
  ['#folio', 'top top'], // 4: книга (глава закреплена)
  ['#codes', 'top bottom'], // 5: подъём к Древу
  ['#codes', 'top top'], // 6: коды
  ['#sessions', 'top top'], // 7: сессии
  ['#contact', 'top top'], // 8: финал
]

interface Deferred {
  promise: Promise<void>
  resolve: () => void
}

function deferred(): Deferred {
  let resolve = () => {}
  const promise = new Promise<void>((r) => (resolve = r))
  return { promise, resolve }
}

/**
 * Создаёт сцену на холсте и связывает её маршрут с главами страницы.
 * Возвращает обещание готовности — заставка ждёт его, чтобы меркаба начала
 * собираться ровно в момент, когда поднимается занавес.
 */
export function useCosmos(
  canvas: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
  introReady: boolean,
  skipIntro: boolean,
  theme: 'light' | 'dark'
) {
  const cosmos = useRef<Cosmos | null>(null)
  const [ready] = useState(deferred)
  const anchors = useRef<number[]>([])
  const themeRef = useRef(theme)

  useEffect(() => {
    themeRef.current = theme
    cosmos.current?.setTheme(theme)
  }, [theme])

  // Якоря считаем после того, как главы создали свои закрепления (pin)
  useLayoutEffect(() => {
    if (!enabled) return
    const probes = ANCHOR_PROBES.map(([trigger, start]) => ScrollTrigger.create({ trigger, start, refreshPriority: -10 }))
    const compute = () => {
      const a = [0, ...probes.map((p) => p.start), ScrollTrigger.maxScroll(window)]
      for (let i = 1; i < a.length; i++) a[i] = Math.max(a[i], a[i - 1] + 1)
      anchors.current = a
      cosmos.current?.setAnchors(a)
    }
    ScrollTrigger.addEventListener('refresh', compute)
    compute()
    return () => {
      ScrollTrigger.removeEventListener('refresh', compute)
      probes.forEach((p) => p.kill())
      document.documentElement.classList.remove('lx-night')
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      ready.resolve()
      return
    }
    let disposed = false
    let instance: Cosmos | null = null

    import('./Cosmos')
      .then(async ({ Cosmos }) => {
        if (disposed || !canvas.current) return
        instance = new Cosmos(canvas.current)
        instance.setTheme(themeRef.current)
        // ночь сцены перекрашивает и текст главы «Книга»
        instance.onNight = (n) => document.documentElement.classList.toggle('lx-night', n > 0.5)
        await instance.init()
        if (disposed) {
          instance.dispose()
          return
        }
        instance.setAnchors(anchors.current)
        if (skipIntro) instance.setIntro(1)
        instance.start()
        cosmos.current = instance
        // для отладки в dev-режиме: window.__cosmos
        if (import.meta.env.DEV) (window as unknown as { __cosmos?: Cosmos }).__cosmos = instance
      })
      .catch((err) => console.warn('3D-сцена не запустилась', err))
      .finally(() => ready.resolve())

    const onMove = (e: PointerEvent) => {
      cosmos.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      disposed = true
      window.removeEventListener('pointermove', onMove)
      if (cosmos.current === instance) cosmos.current = null
      instance?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // Облако пыли собирается в меркабу — одновременно с появлением заголовка пролога
  useEffect(() => {
    if (!enabled || !introReady || skipIntro) return
    const st = { p: 0.001 }
    const tween = gsap.to(st, {
      p: 1,
      duration: 3.4,
      ease: 'power2.inOut',
      onUpdate: () => cosmos.current?.setIntro(st.p),
    })
    return () => {
      tween.kill()
      cosmos.current?.setIntro(1)
    }
  }, [enabled, introReady, skipIntro])

  return ready.promise
}
