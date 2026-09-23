import { ALINE_ARCANA_DATA } from './data/alineExtractedData'

export interface ArchetypeFigure {
  id: string
  name: string
  tradition: string
  type: 'high' | 'shadow' | 'threshold'
  aspect: string
  description: string
  status: 'approved' | 'candidate' | 'mandatory'
  story?: string
  keyPhrase?: string
}

export interface ArcanaPantheon {
  arcanaId: number
  highFigures: ArchetypeFigure[]
  shadowFigures: ArchetypeFigure[]
}

function buildPantheonData(): Record<number, ArcanaPantheon> {
  const result: Record<number, ArcanaPantheon> = {}
  for (let i = 1; i <= 22; i++) {
    const raw = ALINE_ARCANA_DATA[i]?.pantheon
    const highFigures: ArchetypeFigure[] = (raw?.highFigures ?? []).map((f, idx) => ({
      id: `${i}-high-${idx + 1}`,
      name: f.name,
      tradition: f.tradition || 'Мифологическая традиция',
      type: 'high',
      aspect: f.aspect,
      description: f.story || f.aspect,
      status: 'approved',
      story: f.story,
      keyPhrase: f.keyPhrase,
    }))
    const shadowFigures: ArchetypeFigure[] = (raw?.shadowFigures ?? []).map((f, idx) => ({
      id: `${i}-shadow-${idx + 1}`,
      name: f.name,
      tradition: f.tradition || 'Мифологическая традиция',
      type: 'shadow',
      aspect: f.aspect,
      description: f.story || f.aspect,
      status: 'approved',
      story: f.story,
      keyPhrase: f.keyPhrase,
    }))
    result[i] = {
      arcanaId: i,
      highFigures,
      shadowFigures,
    }
  }
  return result
}

export const PANTHEON_DATA: Record<number, ArcanaPantheon> = buildPantheonData()

export function getPantheonForArcana(arcanaId: number): ArcanaPantheon {
  return (
    PANTHEON_DATA[arcanaId] ?? {
      arcanaId,
      highFigures: [],
      shadowFigures: [],
    }
  )
}
