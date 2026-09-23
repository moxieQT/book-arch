import { useState } from 'react'
import { ALINA_SERVICES, type ServiceCategory, type AlinaService } from '../data/alinaServices'
import { ServiceModal } from './ServiceModal'

interface ServicesGridProps {
  onOpenBook: () => void
}

export function ServicesGrid({ onOpenBook }: ServicesGridProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all')
  const [selectedService, setSelectedService] = useState<AlinaService | null>(null)

  const categories: { key: ServiceCategory; label: string }[] = [
    { key: 'all', label: 'Все направления' },
    { key: 'sound', label: 'Тело и Звук' },
    { key: 'consciousness', label: 'Сознание и Инфополе' },
    { key: 'mastery', label: 'Мастерство' },
    { key: 'relationships', label: 'Отношения и Род' },
  ]

  const filteredServices = ALINA_SERVICES.filter((s) => {
    if (activeCategory === 'all') return true
    if (activeCategory === 'body') return s.category === 'body' || s.category === 'sound'
    return s.category === activeCategory
  })

  return (
    <section className="services-section" id="practices">
      <div className="portal-container">
        <div className="services-section__header">
          <div className="services-section__tag">АВТОРСКИЕ НАПРАВЛЕНИЯ И ГРУППЫ</div>
          <h2 className="services-section__title">
            Практики, Обучение <br />
            <span>и Пространства Трансформации</span>
          </h2>
          <p className="services-section__subtitle">
            Каждая программа — это живое поле сонастройки. От исцеления органов чистым голосом
            до глубокого ченнелинга, женской тантры и инкубатора для практикующих мастеров.
          </p>

          <div className="services-filter">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`services-filter__btn ${activeCategory === c.key ? 'services-filter__btn--active' : ''}`}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="services-grid">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`service-card ${service.isBook ? 'service-card--book' : ''}`}
              onClick={() => {
                if (service.isBook) {
                  onOpenBook()
                } else {
                  setSelectedService(service)
                }
              }}
            >
              <div className="service-card__top">
                <span className="service-card__number">{service.number}</span>
                <span className="service-card__badge">{service.badge}</span>
              </div>

              <div className="service-card__category">{service.categoryLabel}</div>
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__subtitle">{service.subtitle}</p>

              <p className="service-card__desc">{service.shortDescription}</p>

              <div className="service-card__bullets">
                {service.bullets.slice(0, 2).map((b) => (
                  <div key={b} className="service-card__bullet">
                    <span className="service-card__bullet-dot">✦</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="service-card__footer">
                {service.isBook ? (
                  <button
                    type="button"
                    className="portal-btn portal-btn--gold portal-btn--sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenBook()
                    }}
                  >
                    <span>Открыть 3D-Книгу</span>
                    <span className="portal-btn__arrow">→</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="service-card__link"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedService(service)
                    }}
                  >
                    <span>Подробнее о практике</span>
                    <span className="service-card__link-arrow">→</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onOpenBook={onOpenBook}
      />
    </section>
  )
}
