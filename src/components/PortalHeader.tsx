interface PortalHeaderProps {
  onOpenBook: () => void
}

export function PortalHeader({ onOpenBook }: PortalHeaderProps) {
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
