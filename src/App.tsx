import { useState, useEffect } from 'react'
import { BookStage } from './three/BookStage'
import { PortalHeader } from './components/PortalHeader'
import { HeroSection } from './components/HeroSection'
import { BookBanner } from './components/BookBanner'
import { ServicesGrid } from './components/ServicesGrid'
import { PricingSection } from './components/PricingSection'
import { ApproachSection } from './components/ApproachSection'
import { PortalFooter } from './components/PortalFooter'
import { BookNavbarOverlay } from './components/BookNavbarOverlay'
import './App.css'

export type ViewMode = 'portal' | 'book'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#book' ? 'book' : 'portal'
  })

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#book') {
        setViewMode('book')
      } else if (viewMode === 'book' && window.location.hash !== '#book') {
        setViewMode('portal')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [viewMode])

  const openBook = () => {
    window.location.hash = 'book'
    setViewMode('book')
  }

  const backToPortal = () => {
    if (window.location.hash === '#book') {
      window.history.pushState(null, '', window.location.pathname)
    }
    setViewMode('portal')
  }

  const scrollToPractices = () => {
    const el = document.getElementById('practices')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (viewMode === 'book') {
    return (
      <div className="app app--fullscreen">
        <BookNavbarOverlay onBackToPortal={backToPortal} />
        <div className="stage-wrapper">
          <BookStage />
        </div>
      </div>
    )
  }

  return (
    <div className="portal-layout">
      <PortalHeader onOpenBook={openBook} />

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

      <PortalFooter onOpenBook={openBook} />
    </div>
  )
}

export default App
