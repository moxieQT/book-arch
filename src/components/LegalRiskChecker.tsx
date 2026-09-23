import { useState } from 'react'
import { auditTextLegalRisks, type AuditResult } from '../data/legalRules'

interface LegalRiskCheckerProps {
  isOpen: boolean
  onClose: () => void
}

export function LegalRiskChecker({ isOpen, onClose }: LegalRiskCheckerProps) {
  const [inputText, setInputText] = useState<string>(
    'Расклад Таро на отношения и деньги. Смотрим динамику связи, причины и скрытые ресурсы. Не является медицинским лечением или фиксированным предсказанием будущего (18+).'
  )
  const [copiedDisclaimer, setCopiedDisclaimer] = useState<boolean>(false)

  if (!isOpen) return null

  const audit: AuditResult = auditTextLegalRisks(inputText)

  const samplePresets = [
    {
      label: 'Безопасное описание Таро',
      text: 'Индивидуальная консультация Таро по вопросам отношений и профессиональной реализации. Исследуем вероятности и скрытые ресурсы в рамках авторского метода. Услуга носит информационно-консультационный характер и не заменяет медицинскую помощь (18+).'
    },
    {
      label: 'Опасный текст с рисками',
      text: '100% гарантированное предсказание будущего! Снятие порчи и сглаза, полное исцеление органов и открытие денежного канала за одну сессию.'
    },
    {
      label: 'Сессия Императрица',
      text: 'Продвинутая женская практика через дыхание, голос и чувственность. Работа с эмоциональным расслаблением и уверенностью в себе. Не является медицинской услугой (18+).'
    }
  ]

  const generalDisclaimer =
    'Уведомление и правовая оговорка: Все услуги и сессии носят исключительно информационно-консультационный, культурно-просветительский характер и направлены на самопознание и гармонизацию психоэмоционального состояния (18+). Они не являются медицинскими услугами, не заменяют диагностику, психотерапию или лечение у врачей. Авторские методы не содержат гарантий наступления фиксированных событий будущего.'

  const handleCopyDisclaimer = () => {
    navigator.clipboard?.writeText(generalDisclaimer)
    setCopiedDisclaimer(true)
    setTimeout(() => setCopiedDisclaimer(false), 2500)
  }

  const handleApplyReplacement = (original: string, replacement: string) => {
    setInputText((prev) => prev.replace(original, replacement))
  }

  return (
    <div className="portal-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="portal-modal legal-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px' }}
      >
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
            <span className="portal-modal__badge" style={{ background: '#E3F2FD', color: '#0D47A1' }}>
              Юридический агент РФ
            </span>
            <span className="portal-modal__category">Комплаенс & Риск-контроль</span>
          </div>

          <h2 className="portal-modal__title">
            Агент Юридических Рисков (РФ)
          </h2>
          <p className="portal-modal__subtitle">
            Проверка текстов услуг, рекламы и тарифов на соответствие ФЗ «О рекламе», ФЗ № 323-ФЗ,
            ст. 159 УК РФ и законопроектам Госдумы РФ об ограничении услуг тарологов.
          </p>
        </div>

        {/* Быстрые пресеты для тестирования */}
        <div className="legal-presets">
          <span className="legal-presets__label">Примеры для проверки:</span>
          {samplePresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="legal-preset-btn"
              onClick={() => setInputText(preset.text)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Поле ввода текста для аудита */}
        <div className="legal-input-box">
          <label htmlFor="legal-text-input" className="legal-input-label">
            Текст для проверки (описание сессии, пост, реклама):
          </label>
          <textarea
            id="legal-text-input"
            className="legal-textarea"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Вставьте сюда текст для мгновенного юридического аудита..."
          />
        </div>

        {/* Результат аудита */}
        <div className={`legal-score-banner legal-score-banner--${audit.riskLevel}`}>
          <div className="legal-score-banner__left">
            <div className="legal-score-circle">
              <span className="legal-score-num">{audit.score}</span>
              <span className="legal-score-denom">/100</span>
            </div>
            <div>
              <div className="legal-score-status">
                {audit.riskLevel === 'low' && '🟢 Безопасно для публикации в РФ'}
                {audit.riskLevel === 'medium' && '🟡 Умеренный риск — требует правок'}
                {audit.riskLevel === 'high' && '🔴 Высокий юридический риск'}
              </div>
              <div className="legal-score-subtext">
                {audit.hasDisclaimer
                  ? 'Правовая оговорка (дисклеймер) присутствует ✓'
                  : '⚠️ Внимание: отсутствует обязательный дисклеймер (18+, не медицина)'}
              </div>
            </div>
          </div>
        </div>

        {/* Список найденных нарушений */}
        {audit.matchedRules.length > 0 && (
          <div className="legal-violations">
            <h4 className="legal-violations__title">
              Обнаруженные зоны риска ({audit.matchedRules.length}):
            </h4>
            <div className="legal-violations__list">
              {audit.matchedRules.map((m, idx) => (
                <div key={m.rule.id + idx} className="legal-violation-card">
                  <div className="legal-violation-header">
                    <span className="legal-violation-tag">
                      {m.rule.category === 'medical_law' && 'ФЗ № 323-ФЗ (Медицина)'}
                      {m.rule.category === 'advertising_law' && 'ФЗ «О рекламе» / Законопроект'}
                      {m.rule.category === 'fraud_prevention' && 'ст. 159 УК РФ (Мошенничество)'}
                      {m.rule.category === 'consumer_rights' && 'Закон о защите прав потребителей'}
                    </span>
                    <span className="legal-violation-name">{m.rule.title}</span>
                  </div>

                  <p className="legal-violation-explain">{m.rule.dangerExplanation}</p>

                  <div className="legal-violation-replace">
                    <div className="legal-violation-found">
                      Найдено: <code>{m.matchedText}</code>
                    </div>
                    <button
                      type="button"
                      className="legal-replace-btn"
                      onClick={() => handleApplyReplacement(m.matchedText, m.rule.safeReplacement)}
                    >
                      Заменить на: «{m.rule.safeReplacement}»
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Генератор обязательного дисклеймера */}
        <div className="legal-disclaimer-box">
          <div className="legal-disclaimer-box__header">
            <h4>Обязательный юридический дисклеймер для сайта и договоров:</h4>
            <button
              type="button"
              className="portal-btn portal-btn--gold portal-btn--sm"
              onClick={handleCopyDisclaimer}
            >
              {copiedDisclaimer ? 'Скопировано ✓' : 'Копировать дисклеймер'}
            </button>
          </div>
          <p className="legal-disclaimer-box__text">{generalDisclaimer}</p>
        </div>
      </div>
    </div>
  )
}
