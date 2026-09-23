interface PortalFooterProps {
  onOpenBook: () => void
}

export function PortalFooter({ onOpenBook }: PortalFooterProps) {
  return (
    <footer className="portal-footer" id="contact">
      <div className="portal-container portal-footer__content">
        <div className="portal-footer__brand">
          <div className="portal-footer__logo">
            <span className="portal-footer__monogram">✦</span>
            <span className="portal-footer__title">АЛИНА · Энергетолог</span>
          </div>
          <p className="portal-footer__quote">
            «Человек учится больше доверять себе, слышать свою истинную вертикаль и не пользоваться помощью мастеров в дальнейшем»
          </p>
          <div className="portal-footer__copy">
            © {new Date().getFullYear()} Алина. Пространство трансформации, звука и сознания.
          </div>
        </div>

        <div className="portal-footer__nav-group">
          <div className="portal-footer__heading">Навигация</div>
          <ul className="portal-footer__links">
            <li>
              <a href="#practices">Практики и группы</a>
            </li>
            <li>
              <a href="#pricing">Индивидуальные сессии и прайс</a>
            </li>
            <li>
              <a href="#book-section">3D-Книга «Архетипы и Тени»</a>
            </li>
            <li>
              <a href="#approach">Философия метода</a>
            </li>
          </ul>
        </div>

        <div className="portal-footer__nav-group">
          <div className="portal-footer__heading">Цифровые артефакты</div>
          <ul className="portal-footer__links">
            <li>
              <button type="button" className="portal-footer__btn-link" onClick={onOpenBook}>
                Интерактивная 3D-Книга Кодов
              </button>
            </li>
            <li>
              <a href="#practices">10 Звуковых практик</a>
            </li>
            <li>
              <a href="#practices">Проект «Эволюция Мастера»</a>
            </li>
            <li>
              <a href="#pricing">Банк вопросов Таро</a>
            </li>
          </ul>
        </div>

        <div className="portal-footer__nav-group">
          <div className="portal-footer__heading">Запись и менеджер</div>
          <p className="portal-footer__contact-desc">
            Все записи на индивидуальные сессии и консультации ведёт менеджер <strong>Мария</strong> (@maria_anima):
          </p>
          <div className="portal-footer__manager-btns">
            <a
              href="https://t.me/maria_anima"
              target="_blank"
              rel="noopener noreferrer"
              className="portal-btn portal-btn--gold portal-btn--sm portal-footer__contact-btn"
            >
              <span>Telegram @maria_anima</span>
              <span className="portal-btn__arrow">→</span>
            </a>
            <a
              href="https://wa.me/79152149560"
              target="_blank"
              rel="noopener noreferrer"
              className="portal-btn portal-btn--ghost portal-btn--sm portal-footer__contact-btn"
              style={{ marginTop: '8px' }}
            >
              <span>WhatsApp +7 915 214 9560</span>
              <span className="portal-btn__arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
