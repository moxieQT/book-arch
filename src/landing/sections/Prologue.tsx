import { useEffect, useRef } from 'react'
import { ArcanaWheel } from '../components/Ornaments'
import { gsap, scrollToTarget } from '../motion'
import { useGsap } from '../useGsap'

interface PrologueProps {
  ready: boolean
  onOpenBook: () => void
}

export function Prologue({ ready, onOpenBook }: PrologueProps) {
  const root = useRef<HTMLElement>(null)
  const intro = useRef<gsap.core.Timeline | null>(null)

  useGsap(root, ({ motion }, el) => {
    const wheel = el.querySelector('.lx-hero__wheel')
    if (!motion) {
      gsap.set(el.querySelectorAll('.lx-draw'), { strokeDashoffset: 0 })
      return
    }

    // Вступление: колесо прорисовывается, строки заголовка поднимаются из-под «маски»
    const tl = gsap.timeline({ paused: true })
    tl.to(el.querySelectorAll('.lx-draw'), { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', stagger: 0.05 }, 0)
      .from('.lx-wheel__numerals text', { opacity: 0, duration: 1.4, stagger: 0.03, ease: 'power1.out' }, 0.6)
      .from('.lx-hero__title .lx-line > span', { yPercent: 115, rotate: 2, duration: 1.6, stagger: 0.12 }, 0.2)
      .from('.lx-hero__eyebrow, .lx-hero__lead, .lx-hero__cta, .lx-hero__foot', { opacity: 0, y: 24, duration: 1.4, stagger: 0.1 }, 0.9)
    intro.current = tl

    // Медленное вечное вращение колеса
    gsap.to('.lx-wheel__star', { rotation: 360, svgOrigin: '0 0', duration: 240, repeat: -1, ease: 'none' })
    gsap.to('.lx-wheel__core', { rotation: -360, svgOrigin: '0 0', duration: 160, repeat: -1, ease: 'none' })

    // Прокрутка: мы «проходим сквозь» колесо — оно растёт, текст уходит вверх
    const scrollTl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top top', end: '+=90%', scrub: 1, pin: true },
    })
    scrollTl
      .to('.lx-hero__inner', { yPercent: -18, opacity: 0, ease: 'power1.in' }, 0)
      .to('.lx-hero__foot', { opacity: 0, ease: 'none' }, 0)
      .to(wheel, { scale: 2.4, rotation: 28, opacity: 0.35, ease: 'power1.in' }, 0)
      .to('.lx-hero__light', { scale: 1.6, opacity: 1, ease: 'none' }, 0)

    // Колесо слегка следует за мышью
    const px = gsap.quickTo(wheel, 'x', { duration: 1.8, ease: 'power3' })
    const py = gsap.quickTo(wheel, 'y', { duration: 1.8, ease: 'power3' })
    const onMove = (e: PointerEvent) => {
      px((e.clientX / window.innerWidth - 0.5) * -26)
      py((e.clientY / window.innerHeight - 0.5) * -26)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  })

  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])

  return (
    <section id="prologue" className="lx-hero" ref={root}>
      <div className="lx-hero__light" aria-hidden="true" />
      <div className="lx-hero__wheel">
        <ArcanaWheel />
      </div>

      <div className="lx-hero__inner">
        <p className="lx-eyebrow lx-hero__eyebrow">
          <span>Алина</span>
          <i aria-hidden="true" />
          <span>проводник к себе</span>
        </p>
        <h1 className="lx-hero__title">
          <span className="lx-line"><span>Вернуться</span></span>
          <span className="lx-line"><span>к своей <em>силе,</em></span></span>
          <span className="lx-line"><span>голосу и потоку</span></span>
        </h1>
        <p className="lx-hero__lead">
          Таро, ченнелинг, звучание голоса и работа с Тенью — чтобы слышать своё сердце и однажды идти дальше без
          проводников.
        </p>
        <div className="lx-hero__cta">
          <button type="button" className="lx-btn lx-btn--wine" onClick={() => scrollToTarget('#paths')}>
            Выбрать свой путь
          </button>
          <button type="button" className="lx-link" onClick={onOpenBook} data-cursor="Книга">
            Открыть книгу «Архетипы и Тени»
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="lx-hero__foot" aria-hidden="true">
        <span>Таро 5D · Ченнелинг · Голос · Род</span>
        <span className="lx-scrollcue">
          Листайте
          <i />
        </span>
      </div>
    </section>
  )
}
