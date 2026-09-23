import { useState } from 'react'
import {
  PRICING_BLOCKS,
  INDIVIDUAL_SESSIONS,
  MANAGER_INFO,
  CLIENT_QUERY_NAVIGATOR,
  TAROT_QUESTIONS,
  type IndividualSession,
  type PricingOption
} from '../data/alinaPricing'

export function PricingSection() {
  const [activeBlock, setActiveBlock] = useState<string>('taro-matrix')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({})
  const [showTarotBank, setShowTarotBank] = useState<boolean>(false)
  const [tarotCategory, setTarotCategory] = useState<'relationships' | 'money'>('relationships')
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null)
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null)

  const handleSelectOption = (sessionId: string, optionIndex: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [sessionId]: optionIndex
    }))
  }

  const getSelectedOption = (session: IndividualSession): PricingOption => {
    const idx = selectedOptions[session.id] ?? 0
    return session.options[idx] || session.options[0]
  }

  const handleQueryClick = (targetSessionId: string) => {
    const session = INDIVIDUAL_SESSIONS.find((s) => s.id === targetSessionId)
    if (session) {
      setActiveBlock(session.blockId)
      setActiveHighlightId(targetSessionId)
      setTimeout(() => {
        const el = document.getElementById(`session-${targetSessionId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
    }
  }

  const handleCopyQuestion = (text: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedQuestion(text)
    setTimeout(() => setCopiedQuestion(null), 2500)
  }

  const filteredSessions = INDIVIDUAL_SESSIONS.filter((s) => s.blockId === activeBlock)

  return (
    <section className="pricing-section" id="pricing">
      <div className="portal-container">
        <div className="pricing-section__header">
          <div className="pricing-section__tag">ИНДИВИДУАЛЬНЫЕ СЕССИИ · ПРАЙС</div>
          <h2 className="pricing-section__title">
            Глубинная Индивидуальная Работа <br />
            <span>Тело • Энергия • Душа • Реализация</span>
          </h2>
          <p className="pricing-section__subtitle">
            Работа с состоянием, отношениями, внутренними программами, родовыми сценариями,
            ресурсом и истинным путём вашей Души.
          </p>

          {/* Карточка менеджера Марии */}
          <div className="manager-card">
            <div className="manager-card__avatar">🕊️</div>
            <div className="manager-card__content">
              <div className="manager-card__title">
                Запись через менеджера Марию <strong>@{MANAGER_INFO.telegramHandle}</strong>
              </div>
              <p className="manager-card__desc">
                Мария — правая рука Алины во всех рабочих вопросах. Смело описывайте ей свою
                ситуацию, задавайте вопросы и советуйтесь. Мы вместе подберём подходящий формат
                работы и удобное время для консультации.
              </p>
              <div className="manager-card__links">
                <a
                  href={MANAGER_INFO.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="manager-card__btn manager-card__btn--tg"
                >
                  <span>Написать в Telegram</span>
                  <span className="manager-card__handle">@{MANAGER_INFO.telegramHandle}</span>
                </a>
                <a
                  href={MANAGER_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="manager-card__btn manager-card__btn--wa"
                >
                  <span>Написать в WhatsApp</span>
                  <span className="manager-card__handle">{MANAGER_INFO.phone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Интерактивный навигатор по запросам */}
          <div className="query-navigator">
            <div className="query-navigator__title">
              <span className="query-navigator__icon">🧭</span>
              <span>Быстрый подбор сессии по вашему запросу:</span>
            </div>
            <div className="query-navigator__chips">
              {CLIENT_QUERY_NAVIGATOR.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="query-chip"
                  onClick={() => handleQueryClick(item.targetSessionId)}
                  title={item.hint}
                >
                  <span className="query-chip__icon">{item.icon}</span>
                  <span className="query-chip__label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Регламент безопасности и этика мастера: Медицинский дисклеймер */}
          <div className="pricing-disclaimer-card" role="note" aria-label="Медицинский дисклеймер и правила безопасности">
            <div className="pricing-disclaimer-card__header">
              <div className="pricing-disclaimer-card__badge">
                <span className="pricing-disclaimer-card__icon">🌿</span>
                <span>Этика практик и регламент безопасности</span>
              </div>
              <span className="pricing-disclaimer-card__law-note">ФЗ № 323-ФЗ · 18+</span>
            </div>
            <div className="pricing-disclaimer-card__body">
              <p className="pricing-disclaimer-card__main-text">
                <strong>При выраженных физических или психосоматических симптомах мы настоятельно рекомендуем обратиться к профильному врачу.</strong>{' '}
                Авторские энергетические сессии, медитации, ченнелинг и разборы Алины направлены на гармонизацию психоэмоционального состояния, глубокую внутреннюю сонастройку и исследование архетипов сознания. Они носят духовно-познавательный характер, не являются медицинскими услугами и не заменяют врачебную диагностику и лечение.
              </p>
              <div className="pricing-disclaimer-card__chips">
                <span className="pricing-disclaimer-chip">✦ Бережное и экологичное ведение</span>
                <span className="pricing-disclaimer-chip">✦ Без навязывания догм и зависимости</span>
                <span className="pricing-disclaimer-chip">✦ Строго конфиденциально</span>
              </div>
            </div>
          </div>

          {/* Переключатель 3 блоков */}
          <div className="pricing-blocks-tabs">
            {PRICING_BLOCKS.map((block) => (
              <button
                key={block.id}
                type="button"
                className={`pricing-block-tab ${activeBlock === block.id ? 'pricing-block-tab--active' : ''}`}
                onClick={() => setActiveBlock(block.id)}
              >
                <span className="pricing-block-tab__icon">{block.icon}</span>
                <span className="pricing-block-tab__title">{block.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Сетка сессий выбранного блока */}
        <div className="pricing-grid">
          {filteredSessions.map((session) => {
            const currentOption = getSelectedOption(session)
            const isHighlighted = activeHighlightId === session.id
            const tgBookingUrl = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(
              `Здравствуйте, Мария! Хочу записаться к Алине на сессию: «${session.title}» (тариф: ${currentOption.label} — ${currentOption.price})`
            )}`

            return (
              <div
                key={session.id}
                id={`session-${session.id}`}
                className={`pricing-card ${session.isFeatured ? 'pricing-card--featured' : ''} ${
                  isHighlighted ? 'pricing-card--highlighted' : ''
                }`}
              >
                {session.isFeatured && (
                  <div className="pricing-card__featured-badge">Рекомендуемый комплекс ✦</div>
                )}

                <div className="pricing-card__header">
                  <h3 className="pricing-card__title">{session.title}</h3>
                  <p className="pricing-card__subtitle">{session.subtitle}</p>
                </div>

                <p className="pricing-card__desc">{session.description}</p>

                {/* Бейдж живого онлайн-формата */}
                {session.onlineUpgradeNote && (
                  <div className="pricing-card__online-badge">
                    <span className="pricing-card__online-badge-icon">🎙️</span>
                    <div className="pricing-card__online-badge-text">
                      <span className="pricing-card__online-badge-tag">Доступен живой онлайн:</span>
                      <span>{session.onlineUpgradeNote}</span>
                    </div>
                  </div>
                )}

                {/* Специальная привилегия / скидка 20% */}
                {session.specialDiscount && (
                  <div
                    className={`pricing-card__special-callout ${
                      session.id === 'twin-flames-consultation'
                        ? 'pricing-card__special-callout--wine'
                        : 'pricing-card__special-callout--gold'
                    }`}
                  >
                    <div className="pricing-card__special-header">
                      <span className="pricing-card__special-icon">
                        {session.id === 'twin-flames-consultation' ? '🔥' : '✨'}
                      </span>
                      <span className="pricing-card__special-title">{session.specialDiscount.title}</span>
                      <span className="pricing-card__special-pill">{session.specialDiscount.badge}</span>
                    </div>

                    <p className="pricing-card__special-desc">
                      {session.specialDiscount.description}
                    </p>

                    {session.specialDiscount.discountedOptions && (
                      <div className="pricing-card__special-prices-grid">
                        {session.specialDiscount.discountedOptions.map((dOpt) => (
                          <div key={dOpt.label} className="pricing-card__special-price-item">
                            <span className="pricing-card__special-price-label">{dOpt.label}:</span>
                            <span className="pricing-card__special-price-val">
                              <strong>{dOpt.discountedPrice}</strong>
                              <span className="pricing-card__special-price-orig">({dOpt.originalPrice})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {session.specialDiscount.subtext && (
                      <div className="pricing-card__special-sub">{session.specialDiscount.subtext}</div>
                    )}
                    {session.specialDiscount.actionHint && (
                      <div className="pricing-card__special-hint">{session.specialDiscount.actionHint}</div>
                    )}
                  </div>
                )}

                {session.bonus && (
                  <div className="pricing-card__bonus">
                    <span className="pricing-card__bonus-icon">🎁</span>
                    <span>{session.bonus}</span>
                  </div>
                )}

                {session.note && (
                  <div className="pricing-card__note">
                    <span className="pricing-card__note-icon">ℹ️</span>
                    <span>{session.note}</span>
                  </div>
                )}

                {/* Если это сессия Таро — кнопка открытия банка вопросов */}
                {session.id === 'taro-session' && (
                  <div className="pricing-card__bank-prompt">
                    <button
                      type="button"
                      className="portal-btn portal-btn--ghost portal-btn--sm"
                      onClick={() => setShowTarotBank(!showTarotBank)}
                    >
                      <span>{showTarotBank ? '▲ Скрыть готовые вопросы' : '▼ Смотреть банк вопросов для Таро (36 шт.)'}</span>
                    </button>
                  </div>
                )}

                {/* Выбор тарифов / опций */}
                {session.options.length > 1 && (
                  <div className="pricing-card__options">
                    <div className="pricing-card__options-label">Выберите формат:</div>
                    <div className="pricing-card__pills">
                      {session.options.map((opt, idx) => {
                        const isSelected = (selectedOptions[session.id] ?? 0) === idx
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            className={`pricing-pill ${isSelected ? 'pricing-pill--selected' : ''}`}
                            onClick={() => handleSelectOption(session.id, idx)}
                          >
                            <span className="pricing-pill__label-wrap">
                              <span>{opt.label}</span>
                              {opt.label.toLowerCase().includes('онлайн') && session.onlineUpgradeNote && (
                                <span className="pricing-pill__online-tag">Живой онлайн</span>
                              )}
                            </span>
                            <span className="pricing-pill__price">{opt.price}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="pricing-card__footer">
                  <div className="pricing-card__price-box">
                    <span className="pricing-card__price-label">
                      {session.options.length > 1 ? currentOption.label : 'Стоимость сессии'}
                    </span>
                    <span className="pricing-card__price-value">{currentOption.price}</span>
                  </div>

                  <a
                    href={tgBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portal-btn portal-btn--gold pricing-card__btn"
                  >
                    <span>Записаться у Марии</span>
                    <span className="portal-btn__arrow">→</span>
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* Раскрывающийся Банк Вопросов для Таро */}
        {showTarotBank && (
          <div className="tarot-bank-modal" id="tarot-questions-bank">
            <div className="tarot-bank-modal__header">
              <div className="tarot-bank-modal__tag">БАНК ВОПРОСОВ ДЛЯ ТАРО</div>
              <h3 className="tarot-bank-modal__title">Готовые глубокие вопросы для сессии</h3>
              <p className="tarot-bank-modal__subtitle">
                Выберите вопрос, нажмите «Скопировать» или сразу перешлите его Марии при записи.
              </p>

              <div className="tarot-bank-tabs">
                <button
                  type="button"
                  className={`tarot-bank-tab ${tarotCategory === 'relationships' ? 'tarot-bank-tab--active' : ''}`}
                  onClick={() => setTarotCategory('relationships')}
                >
                  <span>Отношения и чувства (27)</span>
                </button>
                <button
                  type="button"
                  className={`tarot-bank-tab ${tarotCategory === 'money' ? 'tarot-bank-tab--active' : ''}`}
                  onClick={() => setTarotCategory('money')}
                >
                  <span>Деньги и реализация (9)</span>
                </button>
              </div>
            </div>

            <div className="tarot-bank-list">
              {(tarotCategory === 'relationships'
                ? TAROT_QUESTIONS.relationships
                : TAROT_QUESTIONS.moneyAndRealization
              ).map((q, idx) => {
                const isCopied = copiedQuestion === q
                const sendTgUrl = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(
                  `Здравствуйте, Мария! Хочу задать на сессии Таро следующий вопрос:\n\n«${q}»`
                )}`

                return (
                  <div key={q} className="tarot-bank-item">
                    <span className="tarot-bank-item__num">{idx + 1}.</span>
                    <span className="tarot-bank-item__text">{q}</span>
                    <div className="tarot-bank-item__actions">
                      <button
                        type="button"
                        className="tarot-bank-item__copy-btn"
                        onClick={() => handleCopyQuestion(q)}
                        title="Скопировать вопрос"
                      >
                        {isCopied ? 'Скопировано ✓' : 'Копировать'}
                      </button>
                      <a
                        href={sendTgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tarot-bank-item__send-btn"
                        title="Отправить Марии в Telegram"
                      >
                        В Telegram →
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="pricing-section__note">
          <p>
            ✦ Курсы и обучающие программы публикуются отдельно по мере открытия новых наборов.
            Если вам нужна помощь с выбором сессии,{' '}
            <a href={MANAGER_INFO.telegramUrl} target="_blank" rel="noopener noreferrer">
              напишите менеджеру Марии в Telegram
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
