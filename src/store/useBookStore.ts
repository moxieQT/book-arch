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
}

export const useBookStore = create<BookState>((set, get) => {
  const initialScores = loadSavedScores()

  return {
    stage: 'cover',
    coverState: 'presentation',
    birthDate: null,
    profile: null,
    chapters: [],
    currentSpread: 0,
    isAnimating: false,
    restarting: false,
    scores: initialScores,
    activeLayerTab: 'essence',

    setBirthDate: (date) => {
      const profile = calculateArchetypes(date)
      const chapters = buildChapters(profile)
      try {
        localStorage.setItem(DATE_STORAGE_KEY, date.toISOString())
      } catch {
        // ignore
      }
      set({ birthDate: date, profile, chapters })
    },

    openBook: () => {
      const { birthDate, chapters, isAnimating } = get()
      if (!birthDate || isAnimating) return
      set({ currentSpread: Math.min(1, chapters.length) })
    },

    nextSpread: () => {
      const { currentSpread, chapters, isAnimating } = get()
      if (isAnimating || currentSpread >= chapters.length) return
      set({ currentSpread: currentSpread + 1 })
    },

    prevSpread: () => {
      const { currentSpread, isAnimating } = get()
      if (isAnimating || currentSpread <= 0) return
      set({ currentSpread: currentSpread - 1 })
    },

    goToSpread: (idx: number) => {
      const { chapters, isAnimating } = get()
      if (isAnimating || idx < 0 || idx > chapters.length) return
      set({ currentSpread: idx })
    },

    requestRestart: () => {
      const { currentSpread, isAnimating } = get()
      if (isAnimating) return
      if (currentSpread === 0) {
        set({ birthDate: null, profile: null, chapters: [], stage: 'cover' })
        return
      }
      set({ restarting: true, currentSpread: 0 })
    },

    setAnimating: (v) => set({ isAnimating: v }),

    confirmOpened: () => set({ stage: 'reading' }),

    confirmClosed: () => {
      const { restarting } = get()
      if (restarting) {
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

    setActiveLayerTab: (tab) => set({ activeLayerTab: tab }),
  }
})

if (typeof window !== 'undefined') {
  ;(window as any).__bookStore = useBookStore
}

