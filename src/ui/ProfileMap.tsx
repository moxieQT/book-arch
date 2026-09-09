import { useBookStore } from '../store/useBookStore'
import { toRoman } from '../numerology/normalize'

export function ProfileMap() {
  const profile = useBookStore((s) => s.profile)
  const scores = useBookStore((s) => s.scores)
  const goToSpread = useBookStore((s) => s.goToSpread)
  const isAnimating = useBookStore((s) => s.isAnimating)

  if (!profile) return null

  const getScore = (posId: string) => {
    const list = scores[posId]
    return list && list.length > 0 ? list[list.length - 1].score : null
  }

  // Сбор позиций по смысловым блокам
  const corePositions = [
    { id: 'soul', chIdx: 1, pos: profile.positions.soul },
    { id: 'personality', chIdx: 2, pos: profile.positions.personality },
    { id: 'gift', chIdx: 3, pos: profile.positions.gift },
    { id: 'destiny', chIdx: 4, pos: profile.positions.destiny },
  ]

  const shadowPositions = [
    { id: 'shadow', chIdx: 5, pos: profile.positions.shadow },
    { id: 'deep_shadow', chIdx: 6, pos: profile.positions.deep_shadow },
    { id: 'shadow_guardian', chIdx: 7, pos: profile.positions.shadow_guardian },
  ]

  const integrationPositions = [
    { id: 'higher_vector', chIdx: 8, pos: profile.positions.higher_vector },
    { id: 'divine_guide', chIdx: 9, pos: profile.positions.divine_guide },
    { id: 'integration', chIdx: 10, pos: profile.positions.integration },
  ]

  const ancestralPositions = [
    { id: 'ancestral_male_spiritual', chIdx: 11, pos: profile.positions.ancestral_male_spiritual },
    { id: 'ancestral_male_material', chIdx: 11, pos: profile.positions.ancestral_male_material },
    { id: 'ancestral_male_integral', chIdx: 11, pos: profile.positions.ancestral_male_integral },
    { id: 'ancestral_female_spiritual', chIdx: 12, pos: profile.positions.ancestral_female_spiritual },
    { id: 'ancestral_female_material', chIdx: 12, pos: profile.positions.ancestral_female_material },
    { id: 'ancestral_female_integral', chIdx: 12, pos: profile.positions.ancestral_female_integral },
  ]

  const allAssessed = Object.keys(scores).filter((k) => (scores[k]?.length ?? 0) > 0)
  const assessedCount = allAssessed.length

  const renderCard = (item: { id: string; chIdx: number; pos: any }) => {
    const sc = getScore(item.id)
    return (
      <button
        key={item.id}
        className="map-card"
        onClick={() => goToSpread(item.chIdx)}
        disabled={isAnimating}
        title="Перейти к главе книги"
      >
        <div className="map-card-top">
          <span className="map-card-pos">{item.pos.positionDef.shortLabel}</span>
          <span className="map-card-roman">{toRoman(item.pos.arcanaId)}</span>
        </div>
        <div className="map-card-name">{item.pos.arcana.name}</div>
        <div className="map-card-score">
          {sc !== null ? (
            <div className={`score-badge score-${sc}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < sc ? 'dot active' : 'dot'}>
                  ✦
                </span>
              ))}
              <span className="score-val">{sc}/5</span>
            </div>
          ) : (
            <span className="unrated-tag">Не оценено</span>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="profile-map-view">
      <div className="map-header">
        <div className="eyebrow-tag">СИНТЕЗ · КАРТА ТЕКУЩЕГО СОСТОЯНИЯ</div>
        <h3>Ваш Живой Архетипический Профиль</h3>
        <p className="map-desc">
          Это не рейтинг «насколько вы совершенны», а зеркало текущего проживания энергий.
          Здесь видно, какие грани Арканов уже стали осознанной опорой (4–5★), а где сохраняется напряжение или теневой ресурс для интеграции (1–3★).
        </p>
        <div className="map-stats-bar">
          <span className="stat-pill">
            Оценено аспектов: <strong>{assessedCount} из 16</strong>
          </span>
          <span className="stat-hint">Кликните на любую карточку, чтобы открыть её главу в книге</span>
        </div>
      </div>

      <div className="map-section">
        <h4 className="section-title">
          <span className="sec-icon">✦</span> БАЗОВЫЕ КОДЫ (СВЕТ И ДАРЫ)
        </h4>
        <div className="map-grid">{corePositions.map(renderCard)}</div>
      </div>

      <div className="map-section">
        <h4 className="section-title">
          <span className="sec-icon">☾</span> ТЕНЕВОЙ ПЛАСТ И ЗАЩИТА
        </h4>
        <div className="map-grid">{shadowPositions.map(renderCard)}</div>
      </div>

      <div className="map-section">
        <h4 className="section-title">
          <span className="sec-icon">☀</span> ВЕКТОР ИНТЕГРАЦИИ И ВЫСШИЙ ВЕКТОР
        </h4>
        <div className="map-grid">{integrationPositions.map(renderCard)}</div>
      </div>

      <div className="map-section">
        <h4 className="section-title">
          <span className="sec-icon"> genealog </span> РОДОВАЯ ПАМЯТЬ (МУЖСКАЯ И ЖЕНСКАЯ ВЕТВИ)
        </h4>
        <div className="map-grid ancestral-grid">{ancestralPositions.map(renderCard)}</div>
      </div>

      <div className="map-footer-quote">
        «Тень не уничтожается — она признается, находит свою истинную функцию и становится вашей высшей силой.»
      </div>
    </div>
  )
}
