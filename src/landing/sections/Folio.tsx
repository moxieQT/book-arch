import { useEffect, useRef, useState } from 'react'
import type { BookShowcase } from '../bookShowcase'
import { FOLIO_STEPS } from '../content'
import { gsap, ScrollTrigger, scrollToTarget } from '../motion'
import { useGsap } from '../useGsap'

interface FolioProps {
  onOpenBook: () => void
}

/**
 * Глава IV: тёмная сцена «Тени», в которой парит настоящая книга.
 * Секция закреплена на ~5 экранов; прогресс прокрутки ведёт 3D-сцену
 * и по очереди проявляет подписи шагов.
 */
export function Folio({ onOpenBook }: FolioProps) {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const showcase = useRef<BookShowcase | null>(null)
  const progress = useRef(0)
  const inView = useRef(false)
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(-1)

  // Three.js и тексты книги подгружаются, только когда глава приближается к экрану
  useEffect(() => {
    const el = root.current
    if (!el || !canvas.current) return
    let cancelled = false
    let instance: BookShowcase | null = null

    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || instance) return
        io.disconnect()
        const { BookShowcase } = await import('../bookShowcase')
        if (cancelled || !canvas.current) return
        instance = new BookShowcase(canvas.current)
        showcase.current = instance
        instance.setProgress(progress.current)
        await instance.init()
        if (cancelled) return
        instance.setActive(inView.current)
        setReady(true)
        ScrollTrigger.refresh()
      },
      { rootMargin: '150% 0px' }
    )
    io.observe(el)

    const onMove = (e: PointerEvent) => {
      showcase.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      cancelled = true
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      instance?.dispose()
      showcase.current = null
    }
  }, [])

  useGsap(root, ({ motion }, el) => {
    // Рендер-цикл работает только пока глава на экране
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        inView.current = self.isActive
        showcase.current?.setActive(self.isActive)
      },
    })

    if (!motion) {
      progress.current = 0.5
      showcase.current?.setProgress(0.5)
      setStep(FOLIO_STEPS.length)
      return
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=460%',
        pin: true,
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress
          // Шаги синхронизированы с событиями 3D: раскрытие, два перелистывания, финал
          const next = p < 0.16 ? -1 : p < 0.4 ? 0 : p < 0.6 ? 1 : p < 0.8 ? 2 : p < 0.9 ? 3 : 4
          setStep((prev) => (prev === next ? prev : next))
        },
      },
    })
    tl.eventCallback('onUpdate', () => {
      progress.current = tl.progress()
      showcase.current?.setProgress(tl.progress())
    })

    tl.to('.lx-folio__intro', { opacity: 0, x: -40, duration: 0.08 }, 0.12)
      .fromTo('.lx-folio__halo', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 }, 0)
      .to({}, { duration: 1 }, 0)

    // Появление названия главы при входе в тень
    gsap.from('.lx-folio__intro > *', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 1.4,
      scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none reverse' },
    })
  })

  return (
    <section id="folio" className="lx-folio" ref={root} data-theme="dark">
      <div className="lx-folio__stage">
        <div className="lx-folio__halo" aria-hidden="true" />
        <canvas className={`lx-folio__canvas ${ready ? 'is-ready' : ''}`} ref={canvas} aria-label="Трёхмерная книга «Архетипы и Тени»" role="img" />
        {!ready && <span className="lx-folio__loading" aria-hidden="true" />}

        <div className="lx-folio__intro">
          <p className="lx-eyebrow lx-chapter-mark">
            <span className="lx-chapter-mark__roman">IV</span> Книга
          </p>
          <h2 className="lx-h2">
            Книга, которая
            <br />
            <em>написана о вас</em>
          </h2>
          <p className="lx-lead">
            «Архетипы и Тени» — живой фолиант по авторской системе Алины. По дате рождения он раскрывает шестнадцать
            ваших кодов: Душу, Дар, Предназначение, Тень и Родовую формулу.
          </p>
        </div>

        <ol
          className={`lx-folio__steps ${step >= 0 ? 'is-started' : ''} ${step >= FOLIO_STEPS.length ? 'is-done' : ''}`}
          aria-label="Что внутри книги"
        >
          {FOLIO_STEPS.map((s, i) => (
            <li key={s.title} className={`lx-folio__step ${step === i ? 'is-active' : ''} ${step > i ? 'is-past' : ''}`}>
              <span className="lx-folio__step-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="lx-folio__step-title">{s.title}</span>
              <span className="lx-folio__step-text">{s.text}</span>
            </li>
          ))}
        </ol>

        <div className={`lx-folio__final ${step >= FOLIO_STEPS.length ? 'is-active' : ''}`}>
          <button type="button" className="lx-btn lx-btn--gold" onClick={() => scrollToTarget('#codes')} data-cursor="Рассчитать">
            Рассчитать мои коды
          </button>
          <button type="button" className="lx-link lx-link--light" onClick={onOpenBook} data-cursor="Книга">
            Открыть книгу сейчас <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="lx-folio__dots" aria-hidden="true">
          {FOLIO_STEPS.map((s, i) => (
            <i key={s.title} className={step >= i ? 'is-on' : ''} />
          ))}
        </div>
      </div>
    </section>
  )
}
