import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Cursor } from './components/Cursor'
import { ChapterRail, Header } from './components/Header'
import { Preloader } from './components/Preloader'
import { gsap, ScrollTrigger, startSmoothScroll, stopSmoothScroll } from './motion'
import { useGsap } from './useGsap'
import { Codes } from './sections/Codes'
import { Contact } from './sections/Contact'
import { Folio } from './sections/Folio'
import { Paths } from './sections/Paths'
import { Philosophy } from './sections/Philosophy'
import { Prologue } from './sections/Prologue'
import { Sessions } from './sections/Sessions'
import './landing.css'

const LegalRiskChecker = lazy(() => import('../components/LegalRiskChecker').then((m) => ({ default: m.LegalRiskChecker })))

interface LandingProps {
  onOpenBook: () => void
  onOpenBookWithDate: (date: Date) => void
  /** Позиция прокрутки при возврате из книги: заставка не показывается */
  restoreScroll: number | null
}

export function Landing({ onOpenBook, onOpenBookWithDate, restoreScroll }: LandingProps) {
  const root = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(restoreScroll !== null)
  const [legalOpen, setLegalOpen] = useState(false)

  useLayoutEffect(() => {
    document.documentElement.classList.add('lx-root')
    const lenis = startSmoothScroll()
    if (restoreScroll !== null) {
      // Сначала пересчитываем закрепления (они меняют высоту страницы), затем прыгаем
      ScrollTrigger.refresh()
      if (lenis) lenis.scrollTo(restoreScroll, { immediate: true, force: true })
      else window.scrollTo(0, restoreScroll)
    } else {
      window.scrollTo(0, 0)
    }
    return () => {
      stopSmoothScroll()
      document.documentElement.classList.remove('lx-root')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // После загрузки шрифтов раскладка может сдвинуться — пересчитываем триггеры
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  // Атмосфера страницы: свет → тень (глава «Книга») → рассвет (глава «Коды»)
  useGsap(root, (_c, el) => {
    const night = el.querySelector('.lx-atmo__night')
    gsap.set(night, { opacity: 0 })
    gsap.timeline({
      scrollTrigger: { trigger: '#folio', start: 'top 85%', end: 'top 15%', scrub: true },
    }).to(night, { opacity: 1, ease: 'none' })
    gsap.timeline({
      scrollTrigger: { trigger: '#codes', start: 'top 95%', end: 'top 35%', scrub: true },
    }).to(night, { opacity: 0, ease: 'none' })

    // Шапка и оглавление перекрашиваются над тёмной главой
    ScrollTrigger.create({
      trigger: '#folio',
      start: 'top 40px',
      end: 'bottom 40px',
      toggleClass: { targets: document.documentElement, className: 'lx-dark' },
    })
  })

  return (
    <div className="lx" ref={root}>
      <div className="lx-atmo" aria-hidden="true">
        <div className="lx-atmo__day" />
        <div className="lx-atmo__night" />
        <div className="lx-atmo__grain" />
      </div>

      {restoreScroll === null && <Preloader onDone={() => setReady(true)} />}
      <Cursor />
      <Header onOpenBook={onOpenBook} />
      <ChapterRail />

      <main>
        <Prologue ready={ready} onOpenBook={onOpenBook} />
        <Philosophy />
        <Paths />
        <Folio onOpenBook={onOpenBook} />
        <Codes onOpenBookWithDate={onOpenBookWithDate} />
        <Sessions />
      </main>
      <Contact onOpenBook={onOpenBook} onOpenLegal={() => setLegalOpen(true)} />

      {legalOpen && (
        <Suspense fallback={null}>
          <LegalRiskChecker isOpen={legalOpen} onClose={() => setLegalOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
