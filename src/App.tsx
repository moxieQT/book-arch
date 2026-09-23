import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { ContinuousStage } from './three/ContinuousStage'
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
  const viewModeRef = useRef<ViewMode>(viewMode)

  useEffect(() => {
    viewModeRef.current = viewMode
  }, [viewMode])

  // Сохранение позиции скролла портала перед переходом в режим 3D-книги
  const saveScrollPosition = () => {
    if (typeof window !== 'undefined') {
      const portalEl = document.querySelector<HTMLElement>('.portal-layout')
      if (portalEl && portalEl.style.display === 'none') {
        return
      }
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
    viewModeRef.current = 'book'
    if (window.location.hash !== '#book') {
      window.location.hash = 'book'
    }
    setViewMode('book')
  }

  const backToPortal = () => {
    if (window.location.hash === '#book') {
      window.history.pushState(null, '', window.location.pathname)
    }
    viewModeRef.current = 'portal'
    setViewMode('portal')
  }

  // Слушатель хэша в URL (навигация назад/вперед в браузере и прямые ссылки)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#book') {
        if (viewModeRef.current === 'portal') {
          saveScrollPosition()
        }
        viewModeRef.current = 'book'
        setViewMode('book')
      } else {
        viewModeRef.current = 'portal'
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
      {/* 1. Persistent Continuous WebGL Canvas Stage (never unmounted) */}
      <ContinuousStage viewMode={viewMode} />

      {/* 2. 3D Book Fullscreen Navigation HUD */}
      {viewMode === 'book' && (
        <div className="app app--fullscreen" style={{ position: 'relative', zIndex: 10 }}>
          <BookNavbarOverlay onBackToPortal={backToPortal} />
        </div>
      )}

      {/* 3. Portal DOM Layout (z-index: 10, transparent background) */}
      <div
        className="portal-layout"
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'transparent',
          display: viewMode === 'book' ? 'none' : undefined,
        }}
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
