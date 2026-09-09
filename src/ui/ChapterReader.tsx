import { useState } from 'react'
import { useBookStore, type ReadingLayerTab } from '../store/useBookStore'
import { ProfileMap } from './ProfileMap'

const RATING_HINTS: Record<number, string> = {
  1: 'Пока с трудом узнаю или чувствую блок',
  2: 'Смутно отзывается, есть сопротивление',
  3: 'Периодически замечаю в поведении',
  4: 'Ясно проживаю, сила активна в жизни',
  5: 'Глубоко интегрировано, зрелый контакт',
}

export function ChapterReader() {
  const chapters = useBookStore((s) => s.chapters)
  const currentSpread = useBookStore((s) => s.currentSpread)
  const nextSpread = useBookStore((s) => s.nextSpread)
  const prevSpread = useBookStore((s) => s.prevSpread)
  const requestRestart = useBookStore((s) => s.requestRestart)
  const isAnimating = useBookStore((s) => s.isAnimating)

  const scores = useBookStore((s) => s.scores)
  const setScore = useBookStore((s) => s.setScore)

  const [activeTab, setActiveTab] = useState<ReadingLayerTab>('essence')
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const chapter = chapters[currentSpread - 1]
  if (!chapter) return null

  const isLast = currentSpread >= chapters.length
  const positionId = chapter.positionId ?? chapter.id
  const currentScoreList = scores[positionId]
  const currentScore = currentScoreList && currentScoreList.length > 0 ? currentScoreList[currentScoreList.length - 1].score : null

  // 13-я глава — Итоговая Карта Души и Теневого Баланса
  if (chapter.kind === 'summary') {
    return (
      <div className="book-spread-overlay fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Левая страница: Общие выводы и синтез */}
        <div className="book-page book-page-left">
          <div className="book-page-header">
            <span className="book-header-chapter">ГЛАВА 13 ИЗ 13</span>
            <span className="book-header-badge">ИТОГОВЫЙ СИНТЕЗ</span>
          </div>

          <div className="book-title-block">
            <div className="book-roman-numeral">✦</div>
            <h2 className="book-chapter-title">Карта Профиля</h2>
            <p className="book-chapter-subtitle">Интегральный узор 16 арканических позиций</p>
          </div>

          <div className="book-essence-quote">
            «Познание тени — начало света. Вы завершили раскрытие двенадцати врат личной и родовой памяти».
          </div>

          <div className="book-summary-actions">
            <button className="book-action-btn" onClick={requestRestart} disabled={isAnimating}>
              ↺ Закрыть книгу и начать заново
            </button>
          </div>

          <div className="book-page-footer">
            <button className="book-page-nav-btn" onClick={prevSpread} disabled={isAnimating}>
              ‹ Назад к Роду
            </button>
            <span className="book-folio">— 25 —</span>
          </div>
        </div>

        {/* Правая страница: Интерактивная матрица архетипов */}
        <div className="book-page book-page-right">
          <div className="book-page-header">
            <span className="book-header-chapter">СИСТЕМА АРХЕТИПОВ И ТЕНЕЙ</span>
          </div>

          <div className="book-summary-matrix-container">
            <ProfileMap />
          </div>

          <div className="book-page-footer">
            <span className="book-folio">— 26 —</span>
            <button className="book-page-nav-btn gold-action" onClick={requestRestart} disabled={isAnimating}>
              Завершить чтение ✦
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 11-12 главы — Родовые развороты (Мужской и Женский род)
  if (chapter.kind === 'ancestral' && chapter.ancestralLines) {
    const lines = chapter.ancestralLines
    return (
      <div className="book-spread-overlay fadeIn" onClick={(e) => e.stopPropagation()}>
        {/* Левая страница: Духовная ветка и оценка */}
        <div className="book-page book-page-left">
          <div className="book-page-header">
            <span className="book-header-chapter">ГЛАВА {currentSpread} ИЗ 13</span>
            <span className="book-header-badge">РОДОВОЙ КАНАЛ</span>
          </div>

          <div className="book-title-block">
            <div className="book-roman-numeral">{chapter.bigRoman}</div>
            <div className="book-arcana-name">{chapter.bigArcanaName}</div>
            <h2 className="book-chapter-title">{chapter.title}</h2>
            <p className="book-chapter-subtitle">{chapter.subtitle}</p>
          </div>

          <div className="book-ancestral-mini-card">
            <div className="card-top-tag">Духовная линия рода ({lines.spiritual.roman})</div>
            <h5>{lines.spiritual.arcanaTitle}</h5>
            <p><strong>Переданный дар:</strong> {lines.spiritual.resource}</p>
            <p className="sub-danger"><strong>Теневая ловушка:</strong> {lines.spiritual.shadow}</p>
          </div>

          {/* Шкала силы рода */}
          <div className="book-rating-widget">
            <div className="book-rating-label">Принятие силы этой родовой линии:</div>
            <div className="book-rating-stars">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`book-star-btn ${currentScore && currentScore >= val ? 'active' : ''} ${hoverRating && hoverRating >= val ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoverRating(val)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setScore(positionId, val)}
                >
                  ✦
                </button>
              ))}
            </div>
            <div className="book-rating-hint">
              {hoverRating ? RATING_HINTS[hoverRating] : currentScore ? RATING_HINTS[currentScore] : 'Отметьте от 1 до 5'}
            </div>
          </div>

          <div className="book-page-footer">
            <button className="book-page-nav-btn" onClick={prevSpread} disabled={isAnimating}>
              ‹ Назад
            </button>
            <span className="book-folio">— {currentSpread * 2 - 1} —</span>
          </div>
        </div>

        {/* Правая страница: Материальная и Интегральная линии */}
        <div className="book-page book-page-right">
          <div className="book-page-header">
            <span className="book-header-chapter">МАТЕРИЯ И ТРАНСФОРМАЦИЯ</span>
          </div>

          <div className="book-ancestral-mini-card">
            <div className="card-top-tag">Материальная опора рода ({lines.material.roman})</div>
            <h5>{lines.material.arcanaTitle}</h5>
            <p><strong>Опора и устойчивость:</strong> {lines.material.resource}</p>
            <p className="sub-danger"><strong>Родовое напряжение:</strong> {lines.material.shadow}</p>
          </div>

          <div className="book-ancestral-mini-card highlight-card">
            <div className="card-top-tag gold">Интегральный урок ({lines.integral.roman})</div>
            <h5>{lines.integral.arcanaTitle}</h5>
            <p><strong>Ваша миссия:</strong> {lines.integral.innerTask}</p>
            <p className="sub-gold"><strong>Исцеление:</strong> {lines.integral.integration}</p>
          </div>

          <div className="book-page-footer">
            <span className="book-folio">— {currentSpread * 2} —</span>
            <button className="book-page-nav-btn next-action" onClick={nextSpread} disabled={isAnimating}>
              {currentSpread === 12 ? 'Карта Профиля ›' : 'Далее ›'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 1-10 главы — Базовые архетипы души и тени
  const content = chapter.content
  if (!content) return null

  return (
    <div className="book-spread-overlay fadeIn" onClick={(e) => e.stopPropagation()}>
      {/* Левая страница разворота: Архетип, Суть и Самооценка */}
      <div className="book-page book-page-left">
        <div className="book-page-header">
          <span className="book-header-chapter">ГЛАВА {currentSpread} ИЗ 13</span>
          <span className="book-header-badge">{content.roman} · {content.arcanaTitle.split('·')[1]?.trim() || content.arcanaTitle}</span>
        </div>

        <div className="book-title-block">
          <div className="book-roman-numeral">{content.roman}</div>
          <div className="book-arcana-name">{content.arcanaTitle}</div>
          <h2 className="book-chapter-title">{chapter.title}</h2>
          <p className="book-chapter-subtitle">{chapter.subtitle}</p>
        </div>

        <div className="book-essence-quote">
          {content.coreEssence}
        </div>

        {/* Шкала самооценки 1-5 прямо на странице книги */}
        <div className="book-rating-widget">
          <div className="book-rating-label">
            Насколько ты сейчас проживаешь этот аспект в себе?
          </div>
          <div className="book-rating-stars">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                className={`book-star-btn ${currentScore && currentScore >= val ? 'active' : ''} ${hoverRating && hoverRating >= val ? 'hovered' : ''}`}
                onMouseEnter={() => setHoverRating(val)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setScore(positionId, val)}
                aria-label={`Оценка ${val} из 5`}
              >
                ✦
              </button>
            ))}
          </div>
          <div className="book-rating-hint">
            {hoverRating ? RATING_HINTS[hoverRating] : currentScore ? RATING_HINTS[currentScore] : 'Отметьте от 1 до 5 звёзд'}
          </div>
        </div>

        <div className="book-page-footer">
          <button className="book-page-nav-btn" onClick={prevSpread} disabled={isAnimating}>
            ‹ {currentSpread === 1 ? 'Обложка' : 'Назад'}
          </button>
          <span className="book-folio">— {currentSpread * 2 - 1} —</span>
        </div>
      </div>

      {/* Правая страница разворота: Вкладки слоев и подробный текст */}
      <div className="book-page book-page-right">
        {/* Вкладки прямо в шапке страницы */}
        <div className="book-layer-tabs">
          <button
            type="button"
            className={`book-tab ${activeTab === 'essence' ? 'active' : ''}`}
            onClick={() => setActiveTab('essence')}
          >
            ✦ Свет
          </button>
          <button
            type="button"
            className={`book-tab ${activeTab === 'shadow' ? 'active' : ''}`}
            onClick={() => setActiveTab('shadow')}
          >
            ☾ Тень
          </button>
          <button
            type="button"
            className={`book-tab ${activeTab === 'life' ? 'active' : ''}`}
            onClick={() => setActiveTab('life')}
          >
            ⚖ В Жизни
          </button>
          <button
            type="button"
            className={`book-tab ${activeTab === 'archetypes' ? 'active' : ''}`}
            onClick={() => setActiveTab('archetypes')}
          >
            🏛 Пантеон
          </button>
          <button
            type="button"
            className={`book-tab ${activeTab === 'integration' ? 'active' : ''}`}
            onClick={() => setActiveTab('integration')}
          >
            ☀ Вопросы
          </button>
        </div>

        {/* Читальная область страницы */}
        <div className="book-page-content-scroll">
          {activeTab === 'essence' && (
            <div className="book-tab-panel fadeIn">
              <div className="book-content-card gold-card">
                <span className="book-card-tag gold-tag">Врожденный Ресурс и Дар:</span>
                <p className="book-card-text">{content.resource}</p>
              </div>
            </div>
          )}

          {activeTab === 'shadow' && (
            <div className="book-tab-panel fadeIn">
              <div className="book-content-card wine-card">
                <span className="book-card-tag wine-tag">Теневая Ловушка & Защитный Механизм:</span>
                <p className="book-card-text">{content.shadow}</p>
              </div>
              <div className="book-content-card">
                <span className="book-card-tag">Задача Трансформации:</span>
                <p className="book-card-text">{content.innerTask}</p>
              </div>
            </div>
          )}

          {activeTab === 'life' && (
            <div className="book-tab-panel fadeIn">
              <div className="book-life-list">
                <div className="book-life-row">
                  <span className="life-row-icon">🕊</span>
                  <div>
                    <h6>Отношения и Близость</h6>
                    <p>{content.lifeManifestations.relationships}</p>
                  </div>
                </div>
                <div className="book-life-row">
                  <span className="life-row-icon">⚖</span>
                  <div>
                    <h6>Дела, Деньги и Воля</h6>
                    <p>{content.lifeManifestations.careerAndMoney}</p>
                  </div>
                </div>
                <div className="book-life-row">
                  <span className="life-row-icon">🌿</span>
                  <div>
                    <h6>Тело и Состояние</h6>
                    <p>{content.lifeManifestations.bodyAndSelf}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'archetypes' && (
            <div className="book-tab-panel fadeIn">
              <div className="book-archetypes-stack">
                <div className="book-archetype-box high-box">
                  <span className="arch-label gold-label">Высокая Октава · Зрелый Архетип</span>
                  <h5>{content.highArchetype.name}</h5>
                  <p>{content.highArchetype.aspect}</p>
                </div>
                <div className="book-archetype-box shadow-box">
                  <span className="arch-label wine-label">Теневой Архетип · Вытесненная Грань</span>
                  <h5>{content.shadowArchetype.name}</h5>
                  <p>{content.shadowArchetype.aspect}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integration' && (
            <div className="book-tab-panel fadeIn">
              <div className="book-questions-container">
                <h6 className="book-questions-title">Вопросы для Самонаблюдения:</h6>
                <ul className="book-questions-items">
                  {content.reflectionQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
              <div className="book-content-card gold-card">
                <span className="book-card-tag gold-tag">Вектор Интеграции:</span>
                <p className="book-card-text">{content.integration}</p>
              </div>
            </div>
          )}
        </div>

        <div className="book-page-footer">
          <span className="book-folio">— {currentSpread * 2} —</span>
          <button className="book-page-nav-btn next-action" onClick={nextSpread} disabled={isAnimating || isLast}>
            {currentSpread === 12 ? 'Карта Профиля ›' : 'Далее ›'}
          </button>
        </div>
      </div>
    </div>
  )
}
