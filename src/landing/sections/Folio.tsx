import { useEffect, useRef, useState } from 'react'
import type { BookShowcase } from '../bookShowcase'
import { FOLIO_STEPS } from '../content'
import { SacredIcon } from '../components/Ornaments'
import { gsap, scrollToTarget } from '../motion'
import { useGsap } from '../useGsap'

interface FolioProps {
  onOpenBook: () => void
  /** Книгу рисует общая сцена «Космос»; иначе — своя запасная витрина */
  cosmos: boolean
}

/**
 * Глава «Книга» под знаком Цветка Жизни. Секция закреплена на ~5 экранов:
 * пока она стоит, фолиант в 3D-сцене вылетает, раскрывается и листается.
 * Здесь — только подписи шагов и кнопки.
 */
export function Folio({ onOpenBook, cosmos }: FolioProps) {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(-1)

  // Запасная витрина (нет WebGL2 или «уменьшить движение»): статичный разворот
  useEffect(() => {
    if (cosmos) return
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
        instance.setProgress(0.5)
        await instance.init()
        if (!cancelled) setReady(true)
      },
      { rootMargin: '100% 0px' }
    )
    io.observe(el)
    return () => {
      cancelled = true
      io.disconnect()
      instance?.dispose()
    }
  }, [cosmos])

  useGsap(root, ({ motion }, el) => {
    if (!motion) {
      setStep(FOLIO_STEPS.length)
      return
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'lx-folio-pin',
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
    tl.to('.lx-folio__intro', { opacity: 0, x: -40, duration: 0.08 }, 0.12).to({}, { duration: 1 }, 0)

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
        {!cosmos && (
          <>
            <div className="lx-folio__halo" aria-hidden="true" />
            <canvas className={`lx-folio__canvas ${ready ? 'is-ready' : ''}`} ref={canvas} aria-label="Трёхмерная книга «Архетипы и Тени»" role="img" />
          </>
        )}

        <div className="lx-folio__intro">
          <p className="lx-eyebrow lx-chapter-mark">
            <SacredIcon id="flower" className="lx-chapter-mark__icon" draw /> Книга
          </p>
          <h2 className="lx-h2">
            Книга, которая
            <br />
            <em>написана о вас</em>
          </h2>
          <p className="lx-lead">
            «Архетипы и Тени» — живой фолиант по авторской системе Alina Tarot Energy. По дате рождения он раскрывает
            шестнадцать ваших кодов: Душу, Дар, Предназначение, Тень и Родовую формулу.
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
            <span>Рассчитать мои коды</span>
          </button>
          <button type="button" className="lx-link" onClick={onOpenBook} data-cursor="Книга">
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
