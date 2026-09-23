import { useState } from 'react'
import { soundscape } from '../audio/soundscape'

interface PortalHeaderProps {
  onOpenBook: () => void
  onOpenLegal?: () => void
}

export function PortalHeader({ onOpenBook, onOpenLegal }: PortalHeaderProps) {
  const [isAudioActive, setIsAudioActive] = useState(() => soundscape.getIsEnabled())

  const toggleSound = () => {
    const active = soundscape.toggle()
    setIsAudioActive(active)
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="portal-header">
      <div className="portal-header__container">
        <a href="#top" className="portal-header__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="portal-header__monogram">✦</span>
          <div className="portal-header__titles">
            <span className="portal-header__name">АЛИНА</span>
            <span className="portal-header__role">Энергетолог · Проводник</span>
          </div>
        </a>

        <nav className="portal-header__nav">
          <button type="button" className="portal-header__link" onClick={() => scrollTo('practices')}>
            Практики и группы
          </button>
          <button type="button" className="portal-header__link" onClick={() => scrollTo('pricing')}>
            Прайс и сессии
          </button>
          <button type="button" className="portal-header__link" onClick={() => scrollTo('book-section')}>
            3D-Книга
          </button>
          <button type="button" className="portal-header__link" onClick={() => scrollTo('approach')}>
            О методе
          </button>
          <button type="button" className="portal-header__link" onClick={() => scrollTo('contact')}>
            Контакты
          </button>
        </nav>

        <div className="portal-header__actions">
          <button
            type="button"
            className="portal-btn portal-btn--ghost portal-btn--sm"
            onClick={toggleSound}
            title={isAudioActive ? 'Выключить саундскейп (432 Гц)' : 'Включить медитативный саундскейп (432 Гц)'}
          >
            <span>{isAudioActive ? '🔊 432 Гц' : '🔈 432 Гц'}</span>
          </button>

          {onOpenLegal && (
            <button
              type="button"
              className="portal-btn portal-btn--ghost portal-btn--sm"
              onClick={onOpenLegal}
              title="Проверить текст на юридические риски (РФ)"
            >
              <span>🛡️ Юр. агент (РФ)</span>
            </button>
          )}

          <button
            type="button"
            className="portal-btn portal-btn--gold portal-header__cta"
            onClick={onOpenBook}
            title="Открыть интерактивную 3D-книгу Архетипов"
          >
            <span className="portal-btn__icon">📖</span>
            <span>Книга Кодов (3D)</span>
          </button>
        </div>
      </div>
    </header>
  )
}
