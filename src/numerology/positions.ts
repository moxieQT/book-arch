export type PositionGroup = 'core' | 'shadow' | 'integration' | 'ancestral_male' | 'ancestral_female'

export interface PositionDef {
  id: string
  numOrder: number
  name: string
  shortLabel: string
  group: PositionGroup
  formulaDesc: string
  subheading: string
  meaningPrompt: string
}

export const POSITIONS_REGISTRY: Record<string, PositionDef> = {
  soul: {
    id: 'soul',
    numOrder: 1,
    name: 'Код Души',
    shortLabel: 'Душа',
    group: 'core',
    formulaDesc: 'День рождения (A)',
    subheading: 'Внутренняя природа, сущностный принцип и подлинное «Я»',
    meaningPrompt: 'Показывает то, какой принцип лежит в основе вашего существа вне социальных масок.',
  },
  personality: {
    id: 'personality',
    numOrder: 2,
    name: 'Код Личности',
    shortLabel: 'Личность',
    group: 'core',
    formulaDesc: 'Месяц рождения (B)',
    subheading: 'Внешний интерфейс, способ взаимодействия с миром',
    meaningPrompt: 'Каким вас считывают окружающие и как вы проявляетесь в социальных ролях.',
  },
  gift: {
    id: 'gift',
    numOrder: 3,
    name: 'Врождённый Дар',
    shortLabel: 'Дар',
    group: 'core',
    formulaDesc: 'Сумма цифр года (C)',
    subheading: 'Врождённый ресурс и канал проведения силы',
    meaningPrompt: 'То, что вам уже дано от рождения и через что проще всего реализовывать потенциал.',
  },
  destiny: {
    id: 'destiny',
    numOrder: 4,
    name: 'Вектор Предназначения',
    shortLabel: 'Предназначение',
    group: 'core',
    formulaDesc: 'Душа + Личность + Дар (A + B + C)',
    subheading: 'Главный вектор эволюции и духовного пути',
    meaningPrompt: 'Энергия, к которой вас непрерывно ведёт и разворачивает собственный жизненный опыт.',
  },
  shadow: {
    id: 'shadow',
    numOrder: 5,
    name: 'Тень',
    shortLabel: 'Тень',
    group: 'shadow',
    formulaDesc: 'Душа + Дар (A + C)',
    subheading: 'Вытесненная сила, требующая признания',
    meaningPrompt: 'Качество, которое вы можете отрицать, подавлять или проецировать на других, но в котором спрятан колоссальный ресурс.',
  },
  deep_shadow: {
    id: 'deep_shadow',
    numOrder: 6,
    name: 'Глубинная Тень',
    shortLabel: 'Глубинная Тень',
    group: 'shadow',
    formulaDesc: 'Личность + Предназначение (B + D)',
    subheading: 'Бессознательные программы и сценарии',
    meaningPrompt: 'Глубокий скрытый слой страхов и автоматических реакций, формирующий повторяющиеся сюжеты.',
  },
  shadow_guardian: {
    id: 'shadow_guardian',
    numOrder: 7,
    name: 'Теневой Страж',
    shortLabel: 'Страж',
    group: 'shadow',
    formulaDesc: 'Тень + Глубинная Тень',
    subheading: 'Защитный механизм и страж уязвимости',
    meaningPrompt: 'Сила, которая когда-то встала на защиту вашего сердца. Понять: от чего защищает и какой ресурс бережет.',
  },
  higher_vector: {
    id: 'higher_vector',
    numOrder: 8,
    name: 'Высший Вектор Души',
    shortLabel: 'Высший Вектор',
    group: 'integration',
    formulaDesc: 'Душа + Предназначение (A + D)',
    subheading: 'Направление духовного расширения',
    meaningPrompt: 'Куда вы растете, когда выходите из круга автоматических защит и сценариев выживания.',
  },
  divine_guide: {
    id: 'divine_guide',
    numOrder: 9,
    name: 'Божественный Проводник',
    shortLabel: 'Проводник',
    group: 'integration',
    formulaDesc: 'Дар + Глубинная Тень (C + Гл.Тень)',
    subheading: 'Мост между Даром и сокровищем Тени',
    meaningPrompt: 'Архетипическая энергия инициации, открывающая следующий уровень силы именно через интеграцию непринятого.',
  },
  integration: {
    id: 'integration',
    numOrder: 10,
    name: 'Точка Интеграции',
    shortLabel: 'Интеграция',
    group: 'integration',
    formulaDesc: 'Страж + Божественный Проводник',
    subheading: 'Священный союз Света и Тени',
    meaningPrompt: 'Точка целостности, где вы перестаете бороться с собой и начинаете осознанно дирижировать своей силой.',
  },

  // Родовая система V0.7 (Мужской род: F + H + Tm)
  ancestral_male_spiritual: {
    id: 'ancestral_male_spiritual',
    numOrder: 11,
    name: 'Ресурс Мужского Рода (F)',
    shortLabel: 'М-Ресурс',
    group: 'ancestral_male',
    formulaDesc: 'A + M',
    subheading: 'Сила, способ действия, опора и талант предков',
    meaningPrompt: 'Что мужская линия передает как силу, способ действия, опору, талант или потенциально доступный ресурс.',
  },
  ancestral_male_material: {
    id: 'ancestral_male_material',
    numOrder: 12,
    name: 'Тень Мужского Рода (H)',
    shortLabel: 'М-Сценарий',
    group: 'ancestral_male',
    formulaDesc: 'C + D',
    subheading: 'Повторяющийся сценарий и напряжение мужской линии',
    meaningPrompt: 'Какой паттерн мужской линии может повторяться: в силе, ответственности, деньгах, близости или безопасности.',
  },
  ancestral_male_integral: {
    id: 'ancestral_male_integral',
    numOrder: 13,
    name: 'Новая Норма Мужской Линии (Tm)',
    shortLabel: 'М-Трансформация',
    group: 'ancestral_male',
    formulaDesc: 'H + E',
    subheading: 'Трансформация сценария через личный выбор',
    meaningPrompt: 'Какой способ проживания сценария вы можете перестать повторять в своей жизни и в какую новую форму перевести эту энергию.',
  },

  // Родовая система V0.7 (Женский род: I + G + Tf)
  ancestral_female_spiritual: {
    id: 'ancestral_female_spiritual',
    numOrder: 14,
    name: 'Ресурс Женского Рода (I)',
    shortLabel: 'Ж-Ресурс',
    group: 'ancestral_female',
    formulaDesc: 'M + C',
    subheading: 'Внутренняя сила, интуиция, способность получать и создавать',
    meaningPrompt: 'Что женская линия передает как внутреннюю силу, чувственность, ценности, интуицию и связь с телом.',
  },
  ancestral_female_material: {
    id: 'ancestral_female_material',
    numOrder: 15,
    name: 'Тень Женского Рода (G)',
    shortLabel: 'Ж-Сценарий',
    group: 'ancestral_female',
    formulaDesc: 'A + D',
    subheading: 'Повторяющийся сценарий и напряжение женской линии',
    meaningPrompt: 'Какой устойчивый паттерн может передаваться через женскую линию: в отношениях, теле, материнстве, деньгах или проявлении.',
  },
  ancestral_female_integral: {
    id: 'ancestral_female_integral',
    numOrder: 16,
    name: 'Новая Норма Женской Линии (Tf)',
    shortLabel: 'Ж-Трансформация',
    group: 'ancestral_female',
    formulaDesc: 'G + E',
    subheading: 'Трансформация сценария через личный выбор',
    meaningPrompt: 'Личный способ перестать воспроизводить старый паттерн матерей и построить другую норму в собственной жизни.',
  },
}
