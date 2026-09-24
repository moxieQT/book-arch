import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Landing } from './landing/Landing'

export type ViewMode = 'portal' | 'book'

// 3D-книга (Three.js, тексты арканов) грузится отдельным чанком только по требованию
const BookMode = lazy(() => import('./book/BookMode'))

const isBookHash = () => typeof window !== 'undefined' && window.location.hash === '#book'

// Позиция прокрутки лендинга переживает и перезагрузку страницы внутри книги
const SCROLL_KEY = 'alina_portal_scroll_y'

function rememberScroll(y: number) {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(Math.round(y)))
  } catch {
    // приватный режим — обойдёмся памятью
  }
}

function recallScroll(): number {
  try {
    return Number(sessionStorage.getItem(SCROLL_KEY) || '0')
  } catch {
    return 0
  }
}

function BookLoader() {
  return (
    <div className="lx-book-loader" role="status" aria-label="Книга открывается">
      <span />
    </div>
  )
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => (isBookHash() ? 'book' : 'portal'))
  // Позиция прокрутки лендинга перед уходом в книгу — восстанавливаем при возврате
  const savedScroll = useRef<number | null>(null)
  const [restoreScroll, setRestoreScroll] = useState<number | null>(null)

  const enterBook = useCallback(() => {
    savedScroll.current = window.scrollY
    rememberScroll(window.scrollY)
    if (!isBookHash()) window.location.hash = 'book'
    setViewMode('book')
  }, [])

  const openBookWithDate = useCallback(
    async (date: Date) => {
      // Стор книги тянет тексты арканов (~800 КБ) — грузим его только по требованию
      const { useBookStore } = await import('./store/useBookStore')
      useBookStore.getState().setBirthDate(date)
      enterBook()
      // Книга сама перелистнёт обложку, когда сцена будет готова
      window.setTimeout(() => useBookStore.getState().openBook(), 900)
    },
    [enterBook]
  )

  const backToPortal = useCallback(() => {
    if (isBookHash()) window.history.pushState(null, '', window.location.pathname + window.location.search)
    setRestoreScroll(savedScroll.current ?? recallScroll())
    setViewMode('portal')
  }, [])

  // Навигация браузера «назад/вперёд» и прямые ссылки на #book
  useEffect(() => {
    const onHash = () => {
      if (isBookHash()) {
        setViewMode((m) => {
          if (m === 'portal') {
            savedScroll.current = window.scrollY
            rememberScroll(window.scrollY)
          }
          return 'book'
        })
      } else {
        setRestoreScroll(savedScroll.current ?? recallScroll())
        setViewMode('portal')
      }
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onHash)
    }
  }, [])

  // Esc в книге — возврат на сайт
  useEffect(() => {
    if (viewMode !== 'book') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        backToPortal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewMode, backToPortal])

  if (viewMode === 'book') {
    return (
      <Suspense fallback={<BookLoader />}>
        <BookMode onBack={backToPortal} />
      </Suspense>
    )
  }

  return <Landing onOpenBook={enterBook} onOpenBookWithDate={openBookWithDate} restoreScroll={restoreScroll} />
}

export default App
