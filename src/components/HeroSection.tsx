interface HeroSectionProps {
  onOpenBook: () => void
  onExplorePractices: () => void
}

export function HeroSection({ onOpenBook, onExplorePractices }: HeroSectionProps) {
  return (
    <section className="hero-section" id="top">
      <div className="hero-section__bg-glow" />

      <div className="portal-container hero-section__content">
        <div className="hero-section__badge">
          <span className="hero-section__badge-dot">✦</span>
          <span>Пространство трансформации сознания и энергии</span>
        </div>

        <h1 className="hero-section__title">
          Возвращение к своей силе, <br />
          <em>голосу</em> и чистому потоку
        </h1>

        <p className="hero-section__description">
          Я помогаю открывать прямой канал связи со своей Высшей сутью, исцелять тело чистыми
          звуковыми частотами, выходить из созависимости и переходить в абсолютную духовную
          автономию — без догм, страха и зависимости от внешних мастеров.
        </p>

        <div className="hero-section__actions">
          <button
            type="button"
            className="portal-btn portal-btn--primary portal-btn--lg"
            onClick={onExplorePractices}
          >
            <span>Исследовать практики и группы</span>
            <span className="portal-btn__arrow">↓</span>
          </button>

          <button
            type="button"
            className="portal-btn portal-btn--gold-outline portal-btn--lg"
            onClick={onOpenBook}
          >
            <span className="portal-btn__icon">📖</span>
            <span>Погрузиться в 3D-Книгу Архетипов</span>
          </button>
        </div>

        <div className="hero-section__stats">
          <div className="hero-stat">
            <span className="hero-stat__number">10</span>
            <span className="hero-stat__label">звуковых сессий чистого голоса</span>
          </div>
          <div className="hero-stat__divider">✦</div>
          <div className="hero-stat">
            <span className="hero-stat__number">6</span>
            <span className="hero-stat__label">выпущенных потоков ченнелинга</span>
          </div>
          <div className="hero-stat__divider">✦</div>
          <div className="hero-stat">
            <span className="hero-stat__number">16</span>
            <span className="hero-stat__label">персональных кодов в 3D-книге</span>
          </div>
          <div className="hero-stat__divider">✦</div>
          <div className="hero-stat">
            <span className="hero-stat__number">10</span>
            <span className="hero-stat__label">мастеров в проекте «Эволюция»</span>
          </div>
        </div>
      </div>
    </section>
  )
}
