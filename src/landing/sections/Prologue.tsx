import { useEffect, useRef } from 'react'
import { SacredIcon } from '../components/Ornaments'
import { gsap, scrollToTarget } from '../motion'
import { useGsap } from '../useGsap'

interface PrologueProps {
  ready: boolean
  onOpenBook: () => void
  cosmos: boolean
}

export function Prologue({ ready, onOpenBook, cosmos }: PrologueProps) {
  const root = useRef<HTMLElement>(null)
  const intro = useRef<gsap.core.Timeline | null>(null)

  useGsap(root, ({ motion }, el) => {
    if (!motion) return

    // Вступление: строки заголовка поднимаются из-под маски, по словам проходит свет
    const tl = gsap.timeline({ paused: true })
    tl.from('.lx-hero__title .lx-line > span', { yPercent: 118, rotate: 2.5, duration: 1.7, stagger: 0.13 }, 0.35)
      .from('.lx-hero__eyebrow', { opacity: 0, y: 16, duration: 1.2 }, 0.2)
      .from('.lx-hero__lead, .lx-hero__cta', { opacity: 0, y: 26, duration: 1.4, stagger: 0.12 }, 1)
      .from('.lx-hero__foot', { opacity: 0, duration: 1.6 }, 1.4)
    intro.current = tl

    // Прокрутка: текст уходит вверх и растворяется, фигура остаётся жить в поле
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=80%', scrub: 1, pin: true } })
      .to('.lx-hero__inner', { yPercent: -16, opacity: 0, ease: 'power1.in' }, 0)
      .to('.lx-hero__chrome', { opacity: 0, ease: 'none' }, 0)
  })

  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])

  return (
    <section id="prologue" className="lx-hero" ref={root}>
      {!cosmos && <HeroStill />}

      <div className="lx-hero__inner">
        <p className="lx-eyebrow lx-hero__eyebrow">
          <span>Alina Tarot Energy</span>
          <i aria-hidden="true" />
          <span>проводник к себе</span>
        </p>
        <h1 className="lx-hero__title">
          <span className="lx-line"><span>Вернуться</span></span>
          <span className="lx-line"><span>к своей <em className="lx-gild">силе,</em></span></span>
          <span className="lx-line"><span>голосу и потоку</span></span>
        </h1>
        <p className="lx-hero__lead">
          Таро, ченнелинг, звучание голоса и работа с Тенью — чтобы слышать своё сердце и однажды идти дальше без
          проводников.
        </p>
        <div className="lx-hero__cta">
          <button type="button" className="lx-btn lx-btn--gold" onClick={() => scrollToTarget('#paths')} data-cursor="Пути">
            <span>Выбрать свой путь</span>
          </button>
          <button type="button" className="lx-link" onClick={onOpenBook} data-cursor="Книга">
            Открыть книгу «Архетипы и Тени»
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="lx-hero__chrome">

        <div className="lx-hero__foot" aria-hidden="true">
          <span>Таро 5D · Ченнелинг · Голос · Род</span>
          <span className="lx-scrollcue">
            Листайте
            <i />
          </span>
        </div>
      </div>
    </section>
  )
}

/** Без WebGL: статичная меркаба */
function HeroStill() {
  return (
    <div className="lx-hero__still" aria-hidden="true">
      <SacredIcon id="merkaba" />
    </div>
  )
}
