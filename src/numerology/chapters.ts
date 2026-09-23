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
    subtitle: 'Кто я внутри, если убрать социальные роли и ожидания',
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
    subtitle: 'Как я проявляюсь во внешнем мире и взаимодействую с людьми',
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
    subtitle: 'Что мне дано особенно естественно и через что я создаю ценность',
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
    subtitle: 'В какую зрелость меня приглашает вырасти моя собственная жизнь',
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
    subtitle: 'Какую часть собственной силы я чаще всего не признаю в себе',
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
    subtitle: 'Бессознательный сценарий и автоматическая защита перед кризисом',
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
    subtitle: 'Какая внутренняя система включается прямо перед большим расширением',
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
    subtitle: 'Как выглядит внутренняя природа, когда она взрослеет и соединяется с путем',
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
    subtitle: 'Внутренний ориентир и способ слышать себя после интеграции глубины',
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
    subtitle: 'Что рождается, когда я перестаю делить себя на Свет и Тень',
    bigRoman: toRoman(pos.integration.arcanaId),
    bigArcanaName: pos.integration.arcana.name,
    primaryArcanaId: pos.integration.arcanaId,
    content: integContent,
  })

  // 11. МУЖСКОЙ РОД (V0.7: Ресурс F, Тень H, Новая норма Tm)
  const maleSpiritual = getArcanaPositionContent('ancestral_male_spiritual', pos.ancestral_male_spiritual.arcanaId)
  const maleMaterial = getArcanaPositionContent('ancestral_male_material', pos.ancestral_male_material.arcanaId)
  const maleIntegral = getArcanaPositionContent('ancestral_male_integral', pos.ancestral_male_integral.arcanaId)
  chapters.push({
    id: 'ancestral_male',
    index: 10,
    kind: 'ancestral',
    title: 'Мужской Род',
    subtitle: 'Ресурс линии отцов, повторяющийся сценарий и новая норма силы',
    bigRoman: toRoman(pos.ancestral_male_integral.arcanaId),
    bigArcanaName: pos.ancestral_male_integral.arcana.name,
    primaryArcanaId: pos.ancestral_male_integral.arcanaId,
    ancestralLines: {
      spiritual: maleSpiritual,
      material: maleMaterial,
      integral: maleIntegral,
    },
  })

  // 12. ЖЕНСКИЙ РОД (V0.7: Ресурс I, Тень G, Новая норма Tf)
  const femaleSpiritual = getArcanaPositionContent('ancestral_female_spiritual', pos.ancestral_female_spiritual.arcanaId)
  const femaleMaterial = getArcanaPositionContent('ancestral_female_material', pos.ancestral_female_material.arcanaId)
  const femaleIntegral = getArcanaPositionContent('ancestral_female_integral', pos.ancestral_female_integral.arcanaId)
  chapters.push({
    id: 'ancestral_female',
    index: 11,
    kind: 'ancestral',
    title: 'Женский Род',
    subtitle: 'Ресурс матерей, освобождение от родового сценария и новая норма любви',
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
    subtitle: 'Персональная карта 16 арканических энергий и ключевых связей души',
    bigRoman: '✦',
    bigArcanaName: 'Синтез',
  })

  return chapters
}
