interface BookBannerProps {
  onOpenBook: () => void
}

export function BookBanner({ onOpenBook }: BookBannerProps) {
  return (
    <section className="book-banner-section" id="book-section">
      <div className="portal-container">
        <div className="book-banner">
          <div className="book-banner__decor-corner book-banner__decor-corner--tl">✦</div>
          <div className="book-banner__decor-corner book-banner__decor-corner--tr">✦</div>
          <div className="book-banner__decor-corner book-banner__decor-corner--bl">✦</div>
          <div className="book-banner__decor-corner book-banner__decor-corner--br">✦</div>

          <div className="book-banner__content">
            <div className="book-banner__tag">ЦИФРОВОЙ АРТЕФАКТ · THREE.JS LUXURY FOLIO</div>
            <h2 className="book-banner__title">
              Интерактивная 3D-Книга <br />
              <span>«Архетипы и Тени»</span>
            </h2>
            <p className="book-banner__description">
              Топография сознания на стыке юнгианской алхимии и французской нумерологической традиции.
              Введите дату своего рождения прямо на обложке старинного кожаного фолианта, чтобы
              рассчитать Священный Тетрактис, Теневой Узел и родовую формулу трансформации.
            </p>

            <div className="book-banner__features">
              <div className="book-banner__feature">
                <span className="book-banner__feature-icon">❖</span>
                <div>
                  <strong>16 Арканов Сознания:</strong> Код Души, Код Личности, Дар и Земное Предназначение
                </div>
              </div>
              <div className="book-banner__feature">
                <span className="book-banner__feature-icon">❖</span>
                <div>
                  <strong>Алхимия Тени:</strong> Теневая Ловушка, Глубинная Тень и Страж Порога
                </div>
              </div>
              <div className="book-banner__feature">
                <span className="book-banner__feature-icon">❖</span>
                <div>
                  <strong>Родовая Матрица:</strong> Мужская и женская линии рода, скрытый ресурс предков
                </div>
              </div>
            </div>

            <div className="book-banner__cta-wrapper">
              <button
                type="button"
                className="portal-btn portal-btn--gold portal-btn--xl book-banner__button"
                onClick={onOpenBook}
              >
                <span className="portal-btn__icon">📖</span>
                <span>Открыть 3D-Книгу Архетипов</span>
                <span className="portal-btn__arrow">→</span>
              </button>
              <div className="book-banner__hint">
                Интерактивное перелистывание страниц · Работает в браузере в 3D
              </div>
            </div>
          </div>

          <div className="book-banner__visual" onClick={onOpenBook} role="button" tabIndex={0}>
            <div className="book-mockup">
              <div className="book-mockup__cover">
                <div className="book-mockup__border">
                  <div className="book-mockup__emblem">✦</div>
                  <div className="book-mockup__title">АРХЕТИПЫ И ТЕНИ</div>
                  <div className="book-mockup__author">КНИГА ПЕРСОНАЛЬНЫХ КОДОВ</div>
                  <div className="book-mockup__seal">ALINA · V0.7</div>
                </div>
              </div>
              <div className="book-mockup__pages" />
              <div className="book-mockup__glow" />
            </div>
            <div className="book-banner__click-prompt">Нажмите, чтобы открыть фолиант</div>
          </div>
        </div>
      </div>
    </section>
  )
}
