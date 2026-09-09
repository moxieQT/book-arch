import type { ArchetypesProfile } from './calculate'
import { getArcanaPositionContent, type ArcanaPositionContent } from './contentDatabase'
import { toRoman } from './normalize'

export type ChapterKind = 'single' | 'ancestral' | 'summary'

export interface Chapter {
  id: string
  index: number
  kind: ChapterKind
  positionId?: string
  title: string
  subtitle: string
  bigRoman: string
  bigArcanaName: string
  primaryArcanaId?: number
  content?: ArcanaPositionContent
  ancestralLines?: {
    spiritual: ArcanaPositionContent
    material: ArcanaPositionContent
    integral: ArcanaPositionContent
  }
}

export function buildChapters(profile: ArchetypesProfile): Chapter[] {
  const chapters: Chapter[] = []
  const pos = profile.positions

  // 1. ДУША
  const soulContent = getArcanaPositionContent('soul', pos.soul.arcanaId)
  chapters.push({
    id: 'soul',
    index: 0,
    kind: 'single',
    positionId: 'soul',
    title: 'Код Души',
    subtitle: 'Внутренняя природа, сущностный принцип и подлинное «Я»',
    bigRoman: toRoman(pos.soul.arcanaId),
    bigArcanaName: pos.soul.arcana.name,
    primaryArcanaId: pos.soul.arcanaId,
    content: soulContent,
  })

  // 2. ЛИЧНОСТЬ
  const persContent = getArcanaPositionContent('personality', pos.personality.arcanaId)
  chapters.push({
    id: 'personality',
    index: 1,
    kind: 'single',
    positionId: 'personality',
    title: 'Код Личности',
    subtitle: 'Внешнее проявление, социальный интерфейс и первое впечатление',
    bigRoman: toRoman(pos.personality.arcanaId),
    bigArcanaName: pos.personality.arcana.name,
    primaryArcanaId: pos.personality.arcanaId,
    content: persContent,
  })

  // 3. ВРОЖДЕННЫЙ ДАР
  const giftContent = getArcanaPositionContent('gift', pos.gift.arcanaId)
  chapters.push({
    id: 'gift',
    index: 2,
    kind: 'single',
    positionId: 'gift',
    title: 'Врождённый Дар',
    subtitle: 'Врождённый ресурс и канал проведения вашей истинной силы',
    bigRoman: toRoman(pos.gift.arcanaId),
    bigArcanaName: pos.gift.arcana.name,
    primaryArcanaId: pos.gift.arcanaId,
    content: giftContent,
  })

  // 4. ПРЕДНАЗНАЧЕНИЕ
  const destContent = getArcanaPositionContent('destiny', pos.destiny.arcanaId)
  chapters.push({
    id: 'destiny',
    index: 3,
    kind: 'single',
    positionId: 'destiny',
    title: 'Вектор Предназначения',
    subtitle: 'Главная энергия эволюции, к которой вас непрерывно ведёт жизнь',
    bigRoman: toRoman(pos.destiny.arcanaId),
    bigArcanaName: pos.destiny.arcana.name,
    primaryArcanaId: pos.destiny.arcanaId,
    content: destContent,
  })

  // 5. ТЕНЬ
  const shadowContent = getArcanaPositionContent('shadow', pos.shadow.arcanaId)
  chapters.push({
    id: 'shadow',
    index: 4,
    kind: 'single',
    positionId: 'shadow',
    title: 'Твоя Тень',
    subtitle: 'Вытесненная сила, требующая признания и интеграции',
    bigRoman: toRoman(pos.shadow.arcanaId),
    bigArcanaName: pos.shadow.arcana.name,
    primaryArcanaId: pos.shadow.arcanaId,
    content: shadowContent,
  })

  // 6. ГЛУБИННАЯ ТЕНЬ
  const deepShadowContent = getArcanaPositionContent('deep_shadow', pos.deep_shadow.arcanaId)
  chapters.push({
    id: 'deep_shadow',
    index: 5,
    kind: 'single',
    positionId: 'deep_shadow',
    title: 'Глубинная Тень',
    subtitle: 'Бессознательный слой: скрытые программы, страхи и повторяющиеся сценарии',
    bigRoman: toRoman(pos.deep_shadow.arcanaId),
    bigArcanaName: pos.deep_shadow.arcana.name,
    primaryArcanaId: pos.deep_shadow.arcanaId,
    content: deepShadowContent,
  })

  // 7. ТЕНЕВОЙ СТРАЖ
  const guardianContent = getArcanaPositionContent('shadow_guardian', pos.shadow_guardian.arcanaId)
  chapters.push({
    id: 'shadow_guardian',
    index: 6,
    kind: 'single',
    positionId: 'shadow_guardian',
    title: 'Теневой Страж',
    subtitle: 'Защитный механизм: что бережет ваша Тень и какова функция брони',
    bigRoman: toRoman(pos.shadow_guardian.arcanaId),
    bigArcanaName: pos.shadow_guardian.arcana.name,
    primaryArcanaId: pos.shadow_guardian.arcanaId,
    content: guardianContent,
  })

  // 8. ВЫСШИЙ ВЕКТОР ДУШИ
  const vectorContent = getArcanaPositionContent('higher_vector', pos.higher_vector.arcanaId)
  chapters.push({
    id: 'higher_vector',
    index: 7,
    kind: 'single',
    positionId: 'higher_vector',
    title: 'Высший Вектор Души',
    subtitle: 'Направление расширения за пределами автоматических защит',
    bigRoman: toRoman(pos.higher_vector.arcanaId),
    bigArcanaName: pos.higher_vector.arcana.name,
    primaryArcanaId: pos.higher_vector.arcanaId,
    content: vectorContent,
  })

  // 9. БОЖЕСТВЕННЫЙ ПРОВОДНИК
  const guideContent = getArcanaPositionContent('divine_guide', pos.divine_guide.arcanaId)
  chapters.push({
    id: 'divine_guide',
    index: 8,
    kind: 'single',
    positionId: 'divine_guide',
    title: 'Божественный Проводник',
    subtitle: 'Союз врожденного Дара и сокровища Глубинной Тени',
    bigRoman: toRoman(pos.divine_guide.arcanaId),
    bigArcanaName: pos.divine_guide.arcana.name,
    primaryArcanaId: pos.divine_guide.arcanaId,
    content: guideContent,
  })

  // 10. ТОЧКА ИНТЕГРАЦИИ
  const integContent = getArcanaPositionContent('integration', pos.integration.arcanaId)
  chapters.push({
    id: 'integration',
    index: 9,
    kind: 'single',
    positionId: 'integration',
    title: 'Точка Интеграции',
    subtitle: 'Священное соединение Света и Тени: точка зрелой целостности',
    bigRoman: toRoman(pos.integration.arcanaId),
    bigArcanaName: pos.integration.arcana.name,
    primaryArcanaId: pos.integration.arcanaId,
    content: integContent,
  })

  // 11. МУЖСКОЙ РОД (3 расчета в одном красивом развороте)
  const maleSpiritual = getArcanaPositionContent('ancestral_male_spiritual', pos.ancestral_male_spiritual.arcanaId)
  const maleMaterial = getArcanaPositionContent('ancestral_male_material', pos.ancestral_male_material.arcanaId)
  const maleIntegral = getArcanaPositionContent('ancestral_male_integral', pos.ancestral_male_integral.arcanaId)
  chapters.push({
    id: 'ancestral_male',
    index: 10,
    kind: 'ancestral',
    title: 'Мужской Род',
    subtitle: 'Духовная и материальная линии отцов. Сила, опора и завершение старых ран',
    bigRoman: toRoman(pos.ancestral_male_integral.arcanaId),
    bigArcanaName: pos.ancestral_male_integral.arcana.name,
    primaryArcanaId: pos.ancestral_male_integral.arcanaId,
    ancestralLines: {
      spiritual: maleSpiritual,
      material: maleMaterial,
      integral: maleIntegral,
    },
  })

  // 12. ЖЕНСКИЙ РОД (3 расчета в одном красивом развороте)
  const femaleSpiritual = getArcanaPositionContent('ancestral_female_spiritual', pos.ancestral_female_spiritual.arcanaId)
  const femaleMaterial = getArcanaPositionContent('ancestral_female_material', pos.ancestral_female_material.arcanaId)
  const femaleIntegral = getArcanaPositionContent('ancestral_female_integral', pos.ancestral_female_integral.arcanaId)
  chapters.push({
    id: 'ancestral_female',
    index: 11,
    kind: 'ancestral',
    title: 'Женский Род',
    subtitle: 'Чувственный мир матерей. Сакральная интуиция, изобилие и новая норма любви',
    bigRoman: toRoman(pos.ancestral_female_integral.arcanaId),
    bigArcanaName: pos.ancestral_female_integral.arcana.name,
    primaryArcanaId: pos.ancestral_female_integral.arcanaId,
    ancestralLines: {
      spiritual: femaleSpiritual,
      material: femaleMaterial,
      integral: femaleIntegral,
    },
  })

  // 13. КАРТА ТЕКУЩЕГО СОСТОЯНИЯ (Итоговый профиль)
  chapters.push({
    id: 'profile_map',
    index: 12,
    kind: 'summary',
    title: 'Карта Состояния',
    subtitle: 'Ваш живой архетипический профиль: точки силы, зоны внимания и динамика интеграции',
    bigRoman: '✦',
    bigArcanaName: 'Синтез',
  })

  return chapters
}
