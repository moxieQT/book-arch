import { digitSum, normalizeArcana, toRoman } from './normalize'
import { getArcana, type ArcanaDef } from './arcanaData'
import { POSITIONS_REGISTRY, type PositionDef } from './positions'

export interface CalculatedPosition {
  positionId: string
  positionDef: PositionDef
  rawValue: number
  arcanaId: number
  roman: string
  arcana: ArcanaDef
}

export interface ArchetypesProfile {
  birthDate: Date
  day: number
  month: number
  year: number

  // Базовые коды
  codeA: { raw: number; value: number } // Душа
  codeB: { raw: number; value: number } // Личность
  codeC: { raw: number; value: number } // Дар
  codeD: { raw: number; value: number } // Предназначение

  // 16 расчётных позиций
  positions: Record<string, CalculatedPosition>
}

export function calculateArchetypes(birthDate: Date): ArchetypesProfile {
  const day = birthDate.getDate()
  const month = birthDate.getMonth() + 1
  const year = birthDate.getFullYear()

  // A. Код Души: день рождения (если <= 22, сохраняется; если > 22, складываем цифры)
  const codeARaw = day
  const codeAVal = day <= 22 ? day : digitSum(day)

  // B. Код Личности: месяц рождения (1-12)
  const codeBRaw = month
  const codeBVal = month

  // C. Дар: сумма цифр года рождения, нормализованная до 1-22
  const codeCRaw = digitSum(year)
  const codeCVal = normalizeArcana(codeCRaw)

  // D. Предназначение: A + B + C (сумма базовых кодов, нормализованная до 1-22)
  const codeDRaw = codeAVal + codeBVal + codeCVal
  const codeDVal = normalizeArcana(codeDRaw)

  // 10 основных расчётных позиций
  const pSoulRaw = codeAVal
  const pSoul = normalizeArcana(pSoulRaw)

  const pPersRaw = codeBVal
  const pPers = normalizeArcana(pPersRaw)

  const pGiftRaw = codeCVal
  const pGift = normalizeArcana(pGiftRaw)

  const pDestRaw = codeDVal
  const pDest = normalizeArcana(pDestRaw)

  const pShadowRaw = codeAVal + codeCVal
  const pShadow = normalizeArcana(pShadowRaw)

  const pDeepShadowRaw = codeBVal + codeDVal
  const pDeepShadow = normalizeArcana(pDeepShadowRaw)

  const pGuardianRaw = pShadow + pDeepShadow
  const pGuardian = normalizeArcana(pGuardianRaw)

  const pHigherVectorRaw = codeAVal + codeDVal
  const pHigherVector = normalizeArcana(pHigherVectorRaw)

  // Вариант C для Божественного Проводника: C + Глубинная Тень
  const pGuideRaw = codeCVal + pDeepShadow
  const pGuide = normalizeArcana(pGuideRaw)

  const pIntegrationRaw = pGuardian + pGuide
  const pIntegration = normalizeArcana(pIntegrationRaw)

  // 6 позиций родовой системы
  const pMaleSpiritualRaw = codeAVal + codeBVal
  const pMaleSpiritual = normalizeArcana(pMaleSpiritualRaw)

  const pMaleMaterialRaw = codeCVal + codeDVal
  const pMaleMaterial = normalizeArcana(pMaleMaterialRaw)

  const pFemaleSpiritualRaw = codeBVal + codeCVal
  const pFemaleSpiritual = normalizeArcana(pFemaleSpiritualRaw)

  const pFemaleMaterialRaw = codeDVal + codeAVal
  const pFemaleMaterial = normalizeArcana(pFemaleMaterialRaw)

  const pMaleIntegralRaw = pMaleSpiritual + pMaleMaterial
  const pMaleIntegral = normalizeArcana(pMaleIntegralRaw)

  const pFemaleIntegralRaw = pFemaleSpiritual + pFemaleMaterial
  const pFemaleIntegral = normalizeArcana(pFemaleIntegralRaw)

  const rawMap: Record<string, { raw: number; arcanaId: number }> = {
    soul: { raw: pSoulRaw, arcanaId: pSoul },
    personality: { raw: pPersRaw, arcanaId: pPers },
    gift: { raw: pGiftRaw, arcanaId: pGift },
    destiny: { raw: pDestRaw, arcanaId: pDest },
    shadow: { raw: pShadowRaw, arcanaId: pShadow },
    deep_shadow: { raw: pDeepShadowRaw, arcanaId: pDeepShadow },
    shadow_guardian: { raw: pGuardianRaw, arcanaId: pGuardian },
    higher_vector: { raw: pHigherVectorRaw, arcanaId: pHigherVector },
    divine_guide: { raw: pGuideRaw, arcanaId: pGuide },
    integration: { raw: pIntegrationRaw, arcanaId: pIntegration },

    ancestral_male_spiritual: { raw: pMaleSpiritualRaw, arcanaId: pMaleSpiritual },
    ancestral_male_material: { raw: pMaleMaterialRaw, arcanaId: pMaleMaterial },
    ancestral_male_integral: { raw: pMaleIntegralRaw, arcanaId: pMaleIntegral },

    ancestral_female_spiritual: { raw: pFemaleSpiritualRaw, arcanaId: pFemaleSpiritual },
    ancestral_female_material: { raw: pFemaleMaterialRaw, arcanaId: pFemaleMaterial },
    ancestral_female_integral: { raw: pFemaleIntegralRaw, arcanaId: pFemaleIntegral },
  }

  const positions: Record<string, CalculatedPosition> = {}

  for (const [key, def] of Object.entries(POSITIONS_REGISTRY)) {
    const val = rawMap[key] ?? { raw: 1, arcanaId: 1 }
    positions[key] = {
      positionId: key,
      positionDef: def,
      rawValue: val.raw,
      arcanaId: val.arcanaId,
      roman: toRoman(val.arcanaId),
      arcana: getArcana(val.arcanaId),
    }
  }

  return {
    birthDate,
    day,
    month,
    year,
    codeA: { raw: codeARaw, value: codeAVal },
    codeB: { raw: codeBRaw, value: codeBVal },
    codeC: { raw: codeCRaw, value: codeCVal },
    codeD: { raw: codeDRaw, value: codeDVal },
    positions,
  }
}

// ---------------------------------------------------------
// Классическая нумерологическая система (для режима книги)
// ---------------------------------------------------------

export interface ReducedNumber {
  /** финальное число: 1-9 либо мастер-число 11/22/33 */
  value: number
  /** сумма до первой редукции */
  raw: number
  /** все промежуточные суммы, включая raw и value */
  steps: number[]
  isMaster: boolean
}

const MASTER_NUMBERS = [11, 22, 33]

export function reduce(n: number, keepMaster = true): ReducedNumber {
  const raw = n
  const steps = [n]
  let cur = n
  while (cur > 9) {
    if (keepMaster && MASTER_NUMBERS.includes(cur)) break
    cur = digitSum(cur)
    steps.push(cur)
  }
  return { value: cur, raw, steps, isMaster: MASTER_NUMBERS.includes(cur) }
}

export interface PinnacleInfo {
  number: ReducedNumber
  ageFrom: number
  ageTo: number | null
}

export interface NumerologyProfile {
  birthDate: Date
  day: number
  month: number
  year: number
  lifePath: ReducedNumber
  dayNumber: ReducedNumber
  attitude: ReducedNumber
  maturity: ReducedNumber
  personalYear: ReducedNumber
  karmicDebts: number[]
  karmicLessons: number[]
  dominant: number
  challenges: [ReducedNumber, ReducedNumber, ReducedNumber, ReducedNumber]
  pinnacles: [PinnacleInfo, PinnacleInfo, PinnacleInfo, PinnacleInfo]
}

function absReduce(a: number, b: number): ReducedNumber {
  return reduce(Math.abs(a - b))
}

function sumReduce(a: number, b: number): ReducedNumber {
  return reduce(a + b)
}

export function calculateNumerology(birthDate: Date, today: Date = new Date()): NumerologyProfile {
  const day = birthDate.getDate()
  const month = birthDate.getMonth() + 1
  const year = birthDate.getFullYear()

  const dayDigits = digitSum(day)
  const monthDigits = digitSum(month)
  const yearDigits = digitSum(year)

  const lifePathRaw = dayDigits + monthDigits + yearDigits
  const lifePath = reduce(lifePathRaw)

  const dayNumber = reduce(day)
  const attitudeRaw = dayDigits + monthDigits
  const attitude = reduce(attitudeRaw)
  const maturity = reduce(lifePath.value + attitude.value)

  const personalYearRaw = dayDigits + monthDigits + digitSum(today.getFullYear())
  const personalYear = reduce(personalYearRaw)

  const karmicDebts = [13, 14, 16, 19].filter((k) => k === lifePathRaw || k === attitudeRaw)

  const dateDigits = `${day}${month}${year}`
    .split('')
    .map(Number)
    .filter((d) => d !== 0)
  const present = new Set(dateDigits)
  const karmicLessons = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !present.has(d))

  const freq = new Map<number, number>()
  dateDigits.forEach((d) => freq.set(d, (freq.get(d) ?? 0) + 1))
  let dominant = dateDigits[0] ?? 1
  let maxCount = 0
  for (let d = 1; d <= 9; d++) {
    const count = freq.get(d) ?? 0
    if (count > maxCount) {
      maxCount = count
      dominant = d
    }
  }

  const rDay = reduce(dayDigits).value
  const rMonth = reduce(monthDigits).value
  const rYear = reduce(yearDigits).value
  const c1 = absReduce(rMonth, rDay)
  const c2 = absReduce(rYear, rDay)
  const c3 = absReduce(c1.value, c2.value)
  const c4 = absReduce(rMonth, rYear)
  const challenges: NumerologyProfile['challenges'] = [c1, c2, c3, c4]

  const p1 = sumReduce(monthDigits, dayDigits)
  const p2 = sumReduce(dayDigits, yearDigits)
  const p4 = sumReduce(monthDigits, yearDigits)
  const p3 = sumReduce(p1.value, p2.value)

  const lifePathAgeBase = lifePath.value > 9 ? digitSum(lifePath.value) : lifePath.value
  const end1 = 36 - lifePathAgeBase
  const end2 = end1 + 9
  const end3 = end2 + 9
  const pinnacles: NumerologyProfile['pinnacles'] = [
    { number: p1, ageFrom: 0, ageTo: end1 },
    { number: p2, ageFrom: end1, ageTo: end2 },
    { number: p3, ageFrom: end2, ageTo: end3 },
    { number: p4, ageFrom: end3, ageTo: null },
  ]

  return {
    birthDate,
    day,
    month,
    year,
    lifePath,
    dayNumber,
    attitude,
    maturity,
    personalYear,
    karmicDebts,
    karmicLessons,
    dominant,
    challenges,
    pinnacles,
  }
}
