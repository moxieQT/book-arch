import { create } from 'zustand'
import { calculateArchetypes, type ArchetypesProfile } from '../numerology/calculate'
import { buildChapters, type Chapter } from '../numerology/chapters'

export type BookStage = 'cover' | 'reading'
export type CoverState = 'presentation' | 'input'
export type ReadingLayerTab = 'essence' | 'shadow' | 'life' | 'archetypes' | 'integration'

export interface UserScoreRecord {
  score: number // 1 to 5
  timestamp: number
}

const SCORES_STORAGE_KEY = 'archetypes_scores_v03'
const DATE_STORAGE_KEY = 'archetypes_birthdate_v03'
const MATRIX_BIRTHDATE_KEY = 'alina_matrix_birthdate'

export function parseDateFlexible(raw: string | null): Date | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Поддержка JSON объекта { day: 15, month: 8, year: 1989 }
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (typeof parsed.day === 'number' && typeof parsed.month === 'number' && typeof parsed.year === 'number') {
        const d = new Date(parsed.year, parsed.month - 1, parsed.day)
        return isNaN(d.getTime()) ? null : d
      }
      if (parsed.birthdate) {
        return parseDateFlexible(String(parsed.birthdate))
      }
    } catch {
      // игнорируем ошибку парсинга JSON
    }
  }

  // Поддержка формата DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const ruMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(trimmed)
  if (ruMatch) {
    const day = parseInt(ruMatch[1], 10)
    const month = parseInt(ruMatch[2], 10) - 1
    const year = parseInt(ruMatch[3], 10)
    const d = new Date(year, month, day)
    return isNaN(d.getTime()) ? null : d
  }

  // Стандартный ISO / YYYY-MM-DD
  const d = new Date(trimmed)
  return isNaN(d.getTime()) ? null : d
}

function loadSavedScores(): Record<string, UserScoreRecord[]> {
  try {
    const raw = localStorage.getItem(SCORES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveScores(scores: Record<string, UserScoreRecord[]>) {
  try {
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(scores))
  } catch {
    // ignore
  }
}

function loadSavedBirthDate(): Date | null {
  try {
    const matrixRaw = localStorage.getItem(MATRIX_BIRTHDATE_KEY)
    const legacyRaw = localStorage.getItem(DATE_STORAGE_KEY)
    return parseDateFlexible(matrixRaw) || parseDateFlexible(legacyRaw)
  } catch {
    return null
  }
}

interface BookState {
  stage: BookStage
  coverState: CoverState
  birthDate: Date | null
  profile: ArchetypesProfile | null
  chapters: Chapter[]
  currentSpread: number
  isAnimating: boolean
  restarting: boolean
  scores: Record<string, UserScoreRecord[]>
  activeLayerTab: ReadingLayerTab
  // Страница внутри длинной вкладки (текст разбит на несколько листов)
  tabPage: number

  setBirthDate: (date: Date) => void
  openBook: () => void
  nextSpread: () => void
  prevSpread: () => void
  goToSpread: (idx: number) => void
  requestRestart: () => void
  setAnimating: (v: boolean) => void
  confirmOpened: () => void
  confirmClosed: () => void

  setCoverState: (state: CoverState) => void
  setScore: (positionId: string, score: number) => void
  getLatestScore: (positionId: string) => number | null
  setActiveLayerTab: (tab: ReadingLayerTab) => void
  setTabPage: (page: number) => void
}

export const useBookStore = create<BookState>((set, get) => {
  const initialScores = loadSavedScores()
  const savedDate = loadSavedBirthDate()
  const initialProfile = savedDate ? calculateArchetypes(savedDate) : null
  const initialChapters = initialProfile ? buildChapters(initialProfile) : []

  return {
    stage: 'cover',
    coverState: 'presentation',
    birthDate: savedDate,
    profile: initialProfile,
    chapters: initialChapters,
    currentSpread: 0,
    isAnimating: false,
    restarting: false,
    scores: initialScores,
    activeLayerTab: 'essence',
    tabPage: 0,

    setBirthDate: (date) => {
      const profile = calculateArchetypes(date)
      const chapters = buildChapters(profile)
      try {
        localStorage.setItem(DATE_STORAGE_KEY, date.toISOString())
        localStorage.setItem(MATRIX_BIRTHDATE_KEY, date.toISOString())
      } catch {
        // ignore
      }
      set({ birthDate: date, profile, chapters })
    },

    openBook: () => {
      const { birthDate, chapters, isAnimating } = get()
      if (!birthDate || isAnimating) return
      set({ currentSpread: Math.min(1, chapters.length), tabPage: 0 })
    },

    nextSpread: () => {
      const { currentSpread, chapters, isAnimating } = get()
      if (isAnimating || currentSpread >= chapters.length) return
      set({ currentSpread: currentSpread + 1, tabPage: 0 })
    },

    prevSpread: () => {
      const { currentSpread, isAnimating } = get()
      if (isAnimating || currentSpread <= 0) return
      set({ currentSpread: currentSpread - 1, tabPage: 0 })
    },

    goToSpread: (idx: number) => {
      const { chapters, isAnimating } = get()
      if (isAnimating || idx < 0 || idx > chapters.length) return
      set({ currentSpread: idx, tabPage: 0 })
    },

    requestRestart: () => {
      const { currentSpread, isAnimating } = get()
      if (isAnimating) return
      try {
        localStorage.removeItem(DATE_STORAGE_KEY)
        localStorage.removeItem(MATRIX_BIRTHDATE_KEY)
      } catch {
        // ignore
      }
      if (currentSpread === 0) {
        set({ birthDate: null, profile: null, chapters: [], stage: 'cover', coverState: 'presentation' })
        return
      }
      set({ restarting: true, currentSpread: 0 })
    },

    setAnimating: (v) => set({ isAnimating: v }),

    confirmOpened: () => set({ stage: 'reading' }),

    confirmClosed: () => {
      const { restarting } = get()
      if (restarting) {
        try {
          localStorage.removeItem(DATE_STORAGE_KEY)
          localStorage.removeItem(MATRIX_BIRTHDATE_KEY)
        } catch {
          // ignore
        }
        set({ birthDate: null, profile: null, chapters: [], stage: 'cover', restarting: false, coverState: 'presentation' })
      } else {
        set({ stage: 'cover' })
      }
    },

    setCoverState: (state) => set({ coverState: state }),

    setScore: (positionId, score) => {
      const { scores } = get()
      const existing = scores[positionId] ?? []
      const updatedList = [...existing, { score, timestamp: Date.now() }]
      const nextScores = { ...scores, [positionId]: updatedList }
      saveScores(nextScores)
      set({ scores: nextScores })
    },

    getLatestScore: (positionId) => {
      const { scores } = get()
      const list = scores[positionId]
      if (!list || list.length === 0) return null
      return list[list.length - 1].score
    },

    setActiveLayerTab: (tab) => set({ activeLayerTab: tab, tabPage: 0 }),

    setTabPage: (page) => set({ tabPage: Math.max(0, page) }),
  }
})

if (typeof window !== 'undefined') {
  window.__bookStore = useBookStore
}

