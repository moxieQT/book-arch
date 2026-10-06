import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { canUseCosmos, useCosmos } from './cosmos/useCosmos'
import { Cursor } from './components/Cursor'
import { ChapterRail, Header } from './components/Header'
import { Preloader } from './components/Preloader'
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from './motion'
import { Codes } from './sections/Codes'
import { Contact } from './sections/Contact'
import { Folio } from './sections/Folio'
import { Paths } from './sections/Paths'
import { Philosophy } from './sections/Philosophy'
import { Prologue } from './sections/Prologue'
import { Sessions } from './sections/Sessions'
import './landing.css'

const THEME_KEY = 'lx-theme'

/** Светлая тема — по умолчанию; тёмную человек включает сам */
function readTheme(): 'light' | 'dark' {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/** Цвет адресной строки браузера следует за темой; светлый — по умолчанию, как в index.html и манифесте */
function setThemeColor(theme: 'light' | 'dark') {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#050307' : '#F4EFE6')
}

const LegalRiskChecker = lazy(() => import('../components/LegalRiskChecker').then((m) => ({ default: m.LegalRiskChecker })))

interface LandingProps {
  onOpenBook: () => void
  onOpenBookWithDate: (date: Date) => void
  /** Позиция прокрутки при возврате из книги: заставка не показывается */
  restoreScroll: number | null
}

export function Landing({ onOpenBook, onOpenBookWithDate, restoreScroll }: LandingProps) {
  const [ready, setReady] = useState(restoreScroll !== null)
  const [legalOpen, setLegalOpen] = useState(false)
  const cosmosCanvas = useRef<HTMLCanvasElement>(null)
  const [cosmos] = useState(canUseCosmos)
  const [theme, setTheme] = useState<'light' | 'dark'>(readTheme)
  const cosmosReady = useCosmos(cosmosCanvas, cosmos, ready, restoreScroll !== null, theme)

  // Тема живёт на <html>: её видят и выдвижные панели, вынесенные порталом в body
  useLayoutEffect(() => {
    document.documentElement.dataset.lxTheme = theme
    setThemeColor(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // приватный режим — тема просто не запомнится
    }
  }, [theme])

  // Книга всегда светлая: уходя с лендинга, возвращаем светлый цвет адресной строки
  useLayoutEffect(() => () => setThemeColor('light'), [])

  useLayoutEffect(() => {
    document.documentElement.classList.add('lx-root')
    startSmoothScroll()
    let settle: (() => void) | null = null
    if (restoreScroll !== null) {
      // нативно: Lenis игнорирует повторный переход к «своей» цели, даже если
      // ScrollTrigger уже сдвинул страницу, а нативную прокрутку он подхватывает сам
      const jump = () => window.scrollTo(0, restoreScroll)
      // Сначала пересчитываем закрепления (они меняют высоту страницы), затем прыгаем
      ScrollTrigger.refresh()
      jump()
      // Поздние пересчёты (шрифты, 3D-сцена) могут сдвинуть позицию — первые 1,5 с
      // возвращаем её обратно, пока человек сам не начал листать
      const onRefresh = () => requestAnimationFrame(jump)
      const stop = () => {
        ScrollTrigger.removeEventListener('refresh', onRefresh)
        window.removeEventListener('wheel', stop)
        window.removeEventListener('touchstart', stop)
        window.removeEventListener('keydown', stop)
        window.clearTimeout(timer)
      }
      const timer = window.setTimeout(stop, 1500)
      ScrollTrigger.addEventListener('refresh', onRefresh)
      window.addEventListener('wheel', stop, { passive: true })
      window.addEventListener('touchstart', stop, { passive: true })
      window.addEventListener('keydown', stop)
      requestAnimationFrame(jump)
      settle = stop
    } else {
      window.scrollTo(0, 0)
    }
    return () => {
      settle?.()
      stopSmoothScroll()
      document.documentElement.classList.remove('lx-root')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // После загрузки шрифтов раскладка может сдвинуться — пересчитываем триггеры
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <div className={`lx ${cosmos ? 'has-cosmos' : 'no-cosmos'}`}>
      <div className="lx-sky" aria-hidden="true">
        {cosmos && <canvas className="lx-cosmos" ref={cosmosCanvas} />}
        <div className="lx-sky__grain" />
      </div>

      {restoreScroll === null && <Preloader onDone={() => setReady(true)} waitFor={cosmosReady} theme={theme} />}
      <Cursor />
      <Header onOpenBook={onOpenBook} theme={theme} onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
      <ChapterRail />

      <main>
        <Prologue ready={ready} onOpenBook={onOpenBook} cosmos={cosmos} />
        <Philosophy />
        <Paths />
        <Folio onOpenBook={onOpenBook} cosmos={cosmos} />
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
