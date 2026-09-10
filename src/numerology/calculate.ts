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

