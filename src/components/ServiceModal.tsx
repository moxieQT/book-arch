import { useEffect } from 'react'
import type { AlinaService } from '../data/alinaServices'
import { MANAGER_INFO } from '../data/alinaPricing'

interface ServiceModalProps {
  service: AlinaService | null
  onClose: () => void
  onOpenBook: () => void
}

export function ServiceModal({ service, onClose, onOpenBook }: ServiceModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!service) return null

  return (
    <div className="portal-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="portal-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="portal-modal__close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ✕
        </button>

        <div className="portal-modal__header">
          <div className="portal-modal__meta">
            <span className="portal-modal__number">{service.number}</span>
            <span className="portal-modal__category">{service.categoryLabel}</span>
            <span className="portal-modal__badge">{service.badge}</span>
          </div>

          <h2 className="portal-modal__title">{service.title}</h2>
          <p className="portal-modal__subtitle">{service.subtitle}</p>
        </div>

        {service.quote && (
          <blockquote className="portal-modal__quote">
            {service.quote}
          </blockquote>
        )}

        <div className="portal-modal__body">
          <div className="portal-modal__section">
            <h3 className="portal-modal__heading">О программе и сути работы</h3>
            {service.fullDescription.map((paragraph) => (
              <p key={paragraph} className="portal-modal__paragraph">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="portal-modal__section">
            <h3 className="portal-modal__heading">Ключевые элементы программы</h3>
            <ul className="portal-modal__list">
              {service.bullets.map((bullet) => (
                <li key={bullet}>
                  <span className="portal-modal__bullet-icon">✦</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="portal-modal__section portal-modal__section--results">
            <h3 className="portal-modal__heading">Результаты и трансформация</h3>
            <ul className="portal-modal__list">
              {service.outcomes.map((outcome) => (
                <li key={outcome}>
                  <span className="portal-modal__bullet-icon">✓</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="portal-modal__footer">
          {service.isBook ? (
            <button
              type="button"
              className="portal-btn portal-btn--gold portal-btn--lg"
              onClick={() => {
                onClose()
                onOpenBook()
              }}
            >
              <span className="portal-btn__icon">📖</span>
              <span>Открыть интерактивную 3D-Книгу</span>
            </button>
          ) : (
            <div className="portal-modal__booking">
              <div className="portal-modal__manager-notice">
                <div className="portal-modal__manager-header">
                  <span className="portal-modal__manager-badge">Менеджер мастера</span>
                  <span className="portal-modal__manager-name">
                    {MANAGER_INFO.name} ({MANAGER_INFO.telegram}) {/* Direct booking via manager Maria (@maria_anima) */}
                  </span>
                </div>
                <blockquote className="portal-modal__manager-quote">
                  {MANAGER_INFO.quote}
                </blockquote>
              </div>

              <div className="portal-modal__actions">
                <a
                  href={`${MANAGER_INFO.telegramUrl}?text=${encodeURIComponent(
                    `Здравствуйте, Мария! Хочу узнать подробнее и записаться к Алине на направление: «${service.title}»`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-btn portal-btn--primary portal-btn--lg"
                >
                  <span>Написать Марии в Telegram</span>
                  <span className="portal-btn__arrow">→</span>
                </a>
                <a
                  href={`${MANAGER_INFO.whatsappUrl}?text=${encodeURIComponent(
                    `Здравствуйте, Мария! Хочу узнать подробнее и записаться к Алине на направление: «${service.title}»`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-btn portal-btn--gold-outline portal-btn--lg"
                >
                  <span>Написать в WhatsApp</span>
                  <span className="portal-btn__arrow">→</span>
                </a>
                <button
                  type="button"
                  className="portal-btn portal-btn--ghost"
                  onClick={onClose}
                >
                  Вернуться к списку
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
