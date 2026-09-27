import { useBookStore } from '../store/useBookStore'

interface BookNavbarOverlayProps {
  onBackToPortal: () => void
}

export function BookNavbarOverlay({ onBackToPortal }: BookNavbarOverlayProps) {
  const stage = useBookStore((s) => s.stage)
  const currentSpread = useBookStore((s) => s.currentSpread)
  const chapters = useBookStore((s) => s.chapters)
  const birthDate = useBookStore((s) => s.birthDate)

  const currentChapter = currentSpread > 0 && chapters[currentSpread - 1] ? chapters[currentSpread - 1] : null

  return (
    <div className="book-navbar-overlay">
      <div className="book-navbar-overlay__left">
        <button
          type="button"
          className="portal-btn portal-btn--gold-outline portal-btn--sm book-navbar-overlay__back-btn"
          onClick={onBackToPortal}
          title="Вернуться на сайт Alina Tarot Energy (Esc)"
          aria-keyshortcuts="Escape"
        >
          <span className="portal-btn__arrow">←</span>
          <span>На сайт Alina Tarot Energy</span>
        </button>
      </div>

      <div className="book-navbar-overlay__center">
        <span className="book-navbar-overlay__title">
          ✦ АРХЕТИПЫ И ТЕНИ ✦
        </span>
        <span className="book-navbar-overlay__badge">
          Книга персональных кодов
        </span>
        {stage === 'reading' && currentChapter && (
          <span className="book-navbar-overlay__spread">
            Глава {currentSpread} из {chapters.length}: {currentChapter.title} ({currentChapter.bigArcanaName})
          </span>
        )}
        {stage === 'cover' && birthDate && (
          <span className="book-navbar-overlay__spread">
            Код готов: {birthDate.toLocaleDateString('ru-RU')}
          </span>
        )}
      </div>

      <div className="book-navbar-overlay__right">
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          onClick={onBackToPortal}
        >
          <span>Главная</span>
        </button>
      </div>
    </div>
  )
}
