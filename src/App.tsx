import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { BookStage } from './three/BookStage'
import { PortalHeader } from './components/PortalHeader'
import { HeroSection } from './components/HeroSection'
import { BookBanner } from './components/BookBanner'
import { ServicesGrid } from './components/ServicesGrid'
import { PricingSection } from './components/PricingSection'
import { ApproachSection } from './components/ApproachSection'
import { PortalFooter } from './components/PortalFooter'
import { BookNavbarOverlay } from './components/BookNavbarOverlay'
import { LegalRiskChecker } from './components/LegalRiskChecker'
import './App.css'

export type ViewMode = 'portal' | 'book'

const PORTAL_SCROLL_STORAGE_KEY = 'alina_portal_scroll_y'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#book' ? 'book' : 'portal'
  })
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false)
  const scrollPosRef = useRef<number>(0)

  // Сохранение позиции скролла портала перед переходом в режим 3D-книги
  const saveScrollPosition = () => {
    if (typeof window !== 'undefined') {
      const y = window.scrollY || document.documentElement.scrollTop || 0
      scrollPosRef.current = y
      try {
        sessionStorage.setItem(PORTAL_SCROLL_STORAGE_KEY, String(y))
      } catch {
        // ignore storage errors
      }
    }
  }

  // Навигация между порталом и 3D-книгой
  const openBook = () => {
    saveScrollPosition()
    if (window.location.hash !== '#book') {
      window.location.hash = 'book'
    }
    setViewMode('book')
  }

  const backToPortal = () => {
    if (window.location.hash === '#book') {
      window.history.pushState(null, '', window.location.pathname)
    }
    setViewMode('portal')
  }

  // Слушатель хэша в URL (навигация назад/вперед в браузере и прямые ссылки)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#book') {
        saveScrollPosition()
        setViewMode('book')
      } else {
        setViewMode('portal')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Обработчик клавиши Escape для быстрого возврата на портал
  useEffect(() => {
    if (viewMode !== 'book') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        backToPortal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode])

  // Восстановление позиции скролла при возврате в портал
  useLayoutEffect(() => {
    if (viewMode === 'portal') {
      const savedY =
        scrollPosRef.current ||
        Number(sessionStorage.getItem(PORTAL_SCROLL_STORAGE_KEY) || '0')

      if (savedY > 0) {
        window.scrollTo({ top: savedY, behavior: 'instant' })
        const rafId = requestAnimationFrame(() => {
          window.scrollTo({ top: savedY, behavior: 'instant' })
        })
        return () => cancelAnimationFrame(rafId)
      }
    }
  }, [viewMode])

  const scrollToPractices = () => {
    const el = document.getElementById('practices')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {viewMode === 'book' && (
        <div className="app app--fullscreen">
          <BookNavbarOverlay onBackToPortal={backToPortal} />
          <div className="stage-wrapper">
            <BookStage />
          </div>
        </div>
      )}

      <div
        className="portal-layout"
        style={viewMode === 'book' ? { display: 'none' } : undefined}
        aria-hidden={viewMode === 'book'}
      >
        <PortalHeader
          onOpenBook={openBook}
          onOpenLegal={() => setIsLegalOpen(true)}
        />

        <main className="portal-main">
          <HeroSection
            onOpenBook={openBook}
            onExplorePractices={scrollToPractices}
          />
          <BookBanner onOpenBook={openBook} />
          <ServicesGrid onOpenBook={openBook} />
          <PricingSection />
          <ApproachSection />
        </main>

        <PortalFooter
          onOpenBook={openBook}
          onOpenLegal={() => setIsLegalOpen(true)}
        />

        <LegalRiskChecker
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
        />
      </div>
    </>
  )
}

export default App
