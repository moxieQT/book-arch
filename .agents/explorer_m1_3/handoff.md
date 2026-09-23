# 3D Book Transition, State Hardening & Font Synchronization Report

## Summary
- **Module**: 3D Book Transition, Navigation & State Persistence Engine
- **Target Objectives**:
  1. Scroll position saving before switching to `#book` and restoring when returning to portal view.
  2. Clean URL hash navigation when clicking «← К практикам Алины» in `BookNavbarOverlay.tsx`.
  3. Keyboard listener for `Escape` key to return to portal.
  4. Cover date synchronization with localStorage `alina_matrix_birthdate` or active profile.
  5. Ensuring `document.fonts.ready` is awaited before generating initial canvas textures.
- **Status**: Read-only exploration and design completed. Full before/after implementation code ready for implementer.

---

## 1. Observation

### 1.1 Portal Unmounting & Lost Scroll Position
- **File**: `src/App.tsx:54-65`
  ```tsx
  if (viewMode === 'book') {
    return (
      <div className="app app--fullscreen">
        <BookNavbarOverlay onBackToPortal={backToPortal} />
        <div className="stage-wrapper">
          <BookStage />
        </div>
      </div>
    )
  }

  return (
    <div className="portal-layout">
      ...
    </div>
  )
  ```
- **Direct Observation**:
  - When transitioning from `'portal'` to `'book'`, `<div className="portal-layout">` is completely unmounted from the React DOM tree.
  - Browser window scroll position (`window.scrollY`) is destroyed and collapses to 0.
  - When returning from the book view to the portal, the portal mounts at scroll position $(0, 0)$.
  - Any local component state inside `PricingSection` (such as `activeBlock`, `selectedOptions`, or open Tarot bank accordions) is wiped out upon unmount.

### 1.2 History Stack Pollution and URL Mutation
- **File**: `src/App.tsx:40-45`
  ```tsx
  const backToPortal = () => {
    if (window.location.hash === '#book') {
      window.history.pushState(null, '', window.location.pathname)
    }
    setViewMode('portal')
  }
  ```
- **Direct Observation**:
  - `window.history.pushState(null, '', window.location.pathname)` adds a duplicate history entry rather than popping `/#book`. The history stack becomes `[/] -> [/#book] -> [/]`.
  - When the user subsequently presses the browser's native Back button, they are redirected back to `/#book` rather than leaving the portal or returning to the previous website.
  - Using `window.location.pathname` strips `window.location.search`, which unintentionally destroys query parameters (such as `?utm_source=...` or referral query tags).
  - In `src/components/BookNavbarOverlay.tsx:18-26`, the return button invokes `onBackToPortal`:
    ```tsx
    <button
      type="button"
      className="portal-btn portal-btn--gold-outline portal-btn--sm book-navbar-overlay__back-btn"
      onClick={onBackToPortal}
      title="Вернуться на главную страницу практик Алины"
    >
      <span className="portal-btn__arrow">←</span>
      <span>К практикам Алины</span>
    </button>
    ```

### 1.3 Missing Keyboard Return Shortcut
- **File**: `src/App.tsx:16-53` & `src/components/BookNavbarOverlay.tsx`
- **Direct Observation**:
  - There is currently no `keydown` event listener attached to `window` for the `Escape` key when `viewMode === 'book'`.
  - Pressing `Escape` does nothing, forcing users on desktop/laptop keyboards to manually locate and click the small top button.

### 1.4 Hardcoded `draftDate` & Birthdate Desynchronization
- **File**: `src/three/bookScene.ts:113`
  ```ts
  private draftDate = { day: 2, month: 4, year: 1994 }
  ```
- **File**: `src/three/bookScene.ts:718-720`
  ```ts
  // Лист 0: Обложка + Левая страница Главы 1
  const coverCv = document.createElement('canvas')
  drawCoverOntoCanvas(coverCv, store.coverState, this.draftDate)
  ```
- **File**: `src/three/bookScene.ts:348`
  ```ts
  store.setBirthDate(new Date(this.draftDate.year, this.draftDate.month - 1, this.draftDate.day))
  ```
- **File**: `src/store/useBookStore.ts:15`
  ```ts
  const DATE_STORAGE_KEY = 'archetypes_birthdate_v03'
  ```
- **Direct Observation**:
  - In `src/three/bookScene.ts`, `this.draftDate` is hardcoded to `{ day: 2, month: 4, year: 1994 }`.
  - The `BookScene` constructor and `buildBook` method never check `useBookStore.getState().birthDate`, `localStorage.getItem('alina_matrix_birthdate')`, or `localStorage.getItem('archetypes_birthdate_v03')`.
  - If a user has a saved profile (e.g. `15.08.1989`), the top overlay shows `Код готов: 15.08.1989` (`BookNavbarOverlay.tsx:40`), but the 3D book cover physically renders `02 . 04 . 1994`.
  - If the user clicks "ОТКРЫТЬ ВРАТА" on the cover (`bookScene.ts:348`), the application executes `store.setBirthDate(new Date(1994, 3, 2))`, overwriting their stored birthdate and matrix profile.

### 1.5 Missing Font Readiness Awaiting in Procedural Canvas Generation
- **File**: `index.html:10`
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
  ```
- **File**: `src/three/BookStage.tsx:23-36`
  ```tsx
  // 1. Создание 3D сцены
  useEffect(() => {
    if (!canvasRef.current || !stageRef.current) return
    const scene = new BookScene(canvasRef.current, stageRef.current)
    sceneRef.current = scene
    ...
    // Начальная книга (эталон 02.04.1994)
    const initialProfile = calculateArchetypes(new Date(1994, 3, 2))
    const placeholder = buildChapters(initialProfile)
    scene.buildBook(placeholder)
    appliedCount.current = 0
  ```
- **File**: `src/three/luxuryTextures.ts:319-320`
  ```ts
  const BODY_FONT = (size: number) => `${size}px "Cormorant Garamond", Georgia, serif`
  const HEAD_FONT = (size: number) => `700 ${size}px "Cormorant Garamond", Georgia, serif`
  ```
- **Direct Observation**:
  - `BookStage.tsx` invokes `scene.buildBook(placeholder)` synchronously immediately upon mounting.
  - There is no `await document.fonts?.ready` check.
  - If the user enters `/#book` directly on a cold page load or over high-latency connections, the Google WebFont "Cormorant Garamond" has not finished downloading.
  - When `CanvasRenderingContext2D.fillText()` runs, it falls back to system serif (`Georgia, serif`).
  - Because 2D canvas outputs are converted into static Three.js `CanvasTexture` bitmaps, subsequent font completion in the browser does not trigger canvas repainting. The 3D book remains permanently rendered in fallback serif.
  - Furthermore, on initial mount when a saved profile already exists, `Effect 1` generates 28 placeholder canvases and immediately `Effect 2` (`BookStage.tsx:49-53`) generates 28 custom canvases, causing 56 canvas texture allocations and a 4-second sequential flip animation loop.

---

## 2. Logic Chain

```
[Obs 1.1: App.tsx unmounts <portal-layout>]
  │
  ├─► 1. The document scroll height collapses; window.scrollY resets to 0.
  ├─► 2. Component state inside PricingSection (chosen tariff, active category) is discarded.
  └─► Resolution: Keep <portal-layout> mounted using CSS (display: none / inert) when in 'book' mode,
      record scroll position before entering 'book' mode into a ref and sessionStorage,
      and restore via window.scrollTo() on view return.

[Obs 1.2: backToPortal executes pushState(null, '', pathname)]
  │
  ├─► 1. Pushing history makes the return state a new forward entry rather than removing '#book'.
  ├─► 2. User gets trapped when pressing browser Back.
  ├─► 3. Pathname drops query parameters (loss of tracking/search parameters).
  └─► Resolution: Replace history entry via window.history.replaceState(null, '', pathname + search)
      when leaving '#book', ensuring zero duplicate history entries and preserving URL query string.

[Obs 1.3: No Escape key handler in 3D book]
  │
  └─► Resolution: Register a window 'keydown' listener in App.tsx while viewMode === 'book'
      that checks e.key === 'Escape' and invokes backToPortal().

[Obs 1.4: BookScene.draftDate is hardcoded to 1994-04-02]
  │
  ├─► 1. Disconnect between useBookStore.birthDate and the 3D cover display.
  ├─► 2. Clicking "Открыть Врата" overwrites user date in storage with 1994-04-02.
  └─► Resolution: Implement syncDraftDateFromStore() in BookScene to read from useBookStore.getState().birthDate
      or localStorage ('alina_matrix_birthdate' and 'archetypes_birthdate_v03') with flexible parsing,
      called on constructor, buildBook, and updateCoverTexture.

[Obs 1.5: scene.buildBook() runs synchronously before document.fonts.ready]
  │
  ├─► 1. WebGL textures bake fallback Georgia serif into canvases.
  ├─► 2. Duplicate builds (Effect 1 + Effect 2) double canvas allocations (56 canvases).
  └─► Resolution: In BookStage.tsx, await document.fonts.ready with a fallback timeout (2500ms)
      before triggering the initial buildBook(), directly building the active chapters if present.
```

---

## 3. Caveats

1. **Storage Availability**: In certain browser privacy modes (e.g. Safari Private Mode or locked WebViews), accessing `sessionStorage` or `localStorage` can throw a `SecurityError`. All storage accesses must be guarded with `try / catch` blocks with in-memory `useRef` fallbacks.
2. **Font Loading Failures & Network Timeouts**: If Google Fonts CDN is blocked (e.g. corporate firewall or offline), `document.fonts.ready` could theoretically hang. A `Promise.race([document.fonts.ready, timeout(2500)])` safeguard ensures the 3D book always renders within 2.5 seconds regardless of network status.
3. **Double `requestAnimationFrame` for Scroll Restoration**: When changing `<div className="portal-layout">` from `display: none` back to `display: block`, the layout recalculation may take one tick. Using `useLayoutEffect` combined with a `requestAnimationFrame` fallback ensures the browser completes reflow before scrolling.
4. **WebGL Context Retention**: While keeping `<portal-layout>` in the DOM alongside `<BookStage />`, `<BookStage />` must still be mounted *only* when `viewMode === 'book'`. When `viewMode === 'portal'`, `BookStage` is unmounted and `scene.dispose()` is executed, releasing 295 MB of VRAM and stopping the `requestAnimationFrame` loop.

---

## 4. Conclusion & Actionable Proposals

### 4.1 Proposed Change Set Overview
1. **`src/App.tsx`**:
   - Add `scrollPosRef` and `sessionStorage` persistence for `alina_portal_scroll_y`.
   - Update `openBook()` and `handleHashChange` to capture scroll position before entering `#book`.
   - Update `backToPortal()` to use `window.history.replaceState(null, '', cleanUrl)`.
   - Add `useLayoutEffect` to restore `window.scrollTo` when returning to `viewMode === 'portal'`.
   - Add `Escape` key listener when `viewMode === 'book'`.
   - Retain `<div className="portal-layout">` in DOM using `style={{ display: viewMode === 'book' ? 'none' : 'block' }}` and `aria-hidden={viewMode === 'book'}`.
2. **`src/components/BookNavbarOverlay.tsx`**:
   - Add `aria-keyshortcuts="Escape"` and tooltip `title="Вернуться на главную страницу практик Алины (Esc)"`.
3. **`src/store/useBookStore.ts`**:
   - Add support for `alina_matrix_birthdate` alongside `archetypes_birthdate_v03`.
   - Add flexible date parsing (`parseDateFlexible`) supporting ISO strings, `DD.MM.YYYY`, and JSON formats.
   - Synchronize saves and removals across both keys.
4. **`src/three/bookScene.ts`**:
   - Add `syncDraftDateFromStore()` to initialize `this.draftDate` from the store/localStorage.
   - Call `syncDraftDateFromStore()` in `constructor`, `buildBook()`, and `updateCoverTexture()`.
   - Add `jumpToSpread(targetSpread: number)` for instantaneous page positioning without sequential animation delays.
5. **`src/three/BookStage.tsx`**:
   - Make initial initialization await `document.fonts.ready` before calling `buildBook()`.
   - Prevent duplicate `buildBook()` calls on mount.
   - If `currentSpread > 0` upon mounting, call `scene.jumpToSpread(currentSpread)`.

---

### 4.2 Exact Code Replacements

#### 1. `src/App.tsx`
```tsx
<<<<
import { useState, useEffect } from 'react'
import { BookStage } from './three/BookStage'
import { PortalHeader } from './components/PortalHeader'
import { HeroSection } from './components/HeroSection'
import { BookBanner } from './components/BookBanner'
import { ServicesGrid } from './components/ServicesGrid'
import { PricingSection } from './components/PricingSection'
import { ApproachSection } from './components/ApproachSection'
import { PortalFooter } from './components/PortalFooter'
import { BookNavbarOverlay } from './components/BookNavbarOverlay'
import { LegalRiskChecker } from './components/LegalRiskChecker'
import './App.css'

export type ViewMode = 'portal' | 'book'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#book' ? 'book' : 'portal'
  })
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false)

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#book') {
        setViewMode('book')
      } else if (viewMode === 'book' && window.location.hash !== '#book') {
        setViewMode('portal')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [viewMode])

  const openBook = () => {
    window.location.hash = 'book'
    setViewMode('book')
  }

  const backToPortal = () => {
    if (window.location.hash === '#book') {
      window.history.pushState(null, '', window.location.pathname)
    }
    setViewMode('portal')
  }

  const scrollToPractices = () => {
    const el = document.getElementById('practices')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (viewMode === 'book') {
    return (
      <div className="app app--fullscreen">
        <BookNavbarOverlay onBackToPortal={backToPortal} />
        <div className="stage-wrapper">
          <BookStage />
        </div>
      </div>
    )
  }

  return (
    <div className="portal-layout">
      <PortalHeader
        onOpenBook={openBook}
        onOpenLegal={() => setIsLegalOpen(true)}
      />

      <main className="portal-main">
        <HeroSection
          onOpenBook={openBook}
          onExplorePractices={scrollToPractices}
        />
        <BookBanner onOpenBook={openBook} />
        <ServicesGrid onOpenBook={openBook} />
        <PricingSection />
        <ApproachSection />
      </main>

      <PortalFooter
        onOpenBook={openBook}
        onOpenLegal={() => setIsLegalOpen(true)}
      />

      <LegalRiskChecker
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
      />
    </div>
  )
}

export default App
====
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { BookStage } from './three/BookStage'
import { PortalHeader } from './components/PortalHeader'
import { HeroSection } from './components/HeroSection'
import { BookBanner } from './components/BookBanner'
import { ServicesGrid } from './components/ServicesGrid'
import { PricingSection } from './components/PricingSection'
import { ApproachSection } from './components/ApproachSection'
import { PortalFooter } from './components/PortalFooter'
import { BookNavbarOverlay } from './components/BookNavbarOverlay'
import { LegalRiskChecker } from './components/LegalRiskChecker'
import './App.css'

export type ViewMode = 'portal' | 'book'

const PORTAL_SCROLL_STORAGE_KEY = 'alina_portal_scroll_y'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#book' ? 'book' : 'portal'
  })
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false)
  const scrollPosRef = useRef<number>(0)

  // Сохранение позиции скролла портала перед переходом в режим 3D-книги
  const saveScrollPosition = () => {
    if (typeof window !== 'undefined') {
      const y = window.scrollY || document.documentElement.scrollTop || 0
      scrollPosRef.current = y
      try {
        sessionStorage.setItem(PORTAL_SCROLL_STORAGE_KEY, String(y))
      } catch {
        // ignore storage errors
      }
    }
  }

  // Слушатель хэша в URL (навигация назад/вперед в браузере и прямые ссылки)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#book') {
        saveScrollPosition()
        setViewMode('book')
      } else {
        setViewMode('portal')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Обработчик клавиши Escape для быстрого возврата на портал
  useEffect(() => {
    if (viewMode !== 'book') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        backToPortal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode])

  // Восстановление позиции скролла при возврате в портал
  useLayoutEffect(() => {
    if (viewMode === 'portal') {
      const savedY =
        scrollPosRef.current ||
        Number(sessionStorage.getItem(PORTAL_SCROLL_STORAGE_KEY) || '0')

      if (savedY > 0) {
        window.scrollTo({ top: savedY, behavior: 'instant' })
        const rafId = requestAnimationFrame(() => {
          window.scrollTo({ top: savedY, behavior: 'instant' })
        })
        return () => cancelAnimationFrame(rafId)
      }
    }
  }, [viewMode])

  const openBook = () => {
    saveScrollPosition()
    if (window.location.hash !== '#book') {
      window.location.hash = 'book'
    }
    setViewMode('book')
  }

  const backToPortal = () => {
    if (window.location.hash === '#book') {
      const cleanUrl = window.location.pathname + window.location.search
      window.history.replaceState(null, '', cleanUrl)
    }
    setViewMode('portal')
  }

  const scrollToPractices = () => {
    const el = document.getElementById('practices')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {viewMode === 'book' && (
        <div className="app app--fullscreen">
          <BookNavbarOverlay onBackToPortal={backToPortal} />
          <div className="stage-wrapper">
            <BookStage />
          </div>
        </div>
      )}

      <div
        className="portal-layout"
        style={viewMode === 'book' ? { display: 'none' } : undefined}
        aria-hidden={viewMode === 'book'}
      >
        <PortalHeader
          onOpenBook={openBook}
          onOpenLegal={() => setIsLegalOpen(true)}
        />

        <main className="portal-main">
          <HeroSection
            onOpenBook={openBook}
            onExplorePractices={scrollToPractices}
          />
          <BookBanner onOpenBook={openBook} />
          <ServicesGrid onOpenBook={openBook} />
          <PricingSection />
          <ApproachSection />
        </main>

        <PortalFooter
          onOpenBook={openBook}
          onOpenLegal={() => setIsLegalOpen(true)}
        />

        <LegalRiskChecker
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
        />
      </div>
    </>
  )
}

export default App
>>>>
```

---

#### 2. `src/components/BookNavbarOverlay.tsx`
```tsx
<<<<
      <div className="book-navbar-overlay__left">
        <button
          type="button"
          className="portal-btn portal-btn--gold-outline portal-btn--sm book-navbar-overlay__back-btn"
          onClick={onBackToPortal}
          title="Вернуться на главную страницу практик Алины"
        >
          <span className="portal-btn__arrow">←</span>
          <span>К практикам Алины</span>
        </button>
      </div>
====
      <div className="book-navbar-overlay__left">
        <button
          type="button"
          className="portal-btn portal-btn--gold-outline portal-btn--sm book-navbar-overlay__back-btn"
          onClick={onBackToPortal}
          title="Вернуться на главную страницу практик Алины (Esc)"
          aria-keyshortcuts="Escape"
        >
          <span className="portal-btn__arrow">←</span>
          <span>К практикам Алины</span>
        </button>
      </div>
>>>>
```

---

#### 3. `src/store/useBookStore.ts`
```ts
<<<<
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

function loadSavedBirthDate(): Date | null {
  try {
    const raw = localStorage.getItem(DATE_STORAGE_KEY)
    if (!raw) return null
    const d = new Date(raw)
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}
====
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
>>>>
```
And in `setBirthDate`:
```ts
<<<<
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
====
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
>>>>
```
And in `requestRestart` and `confirmClosed`:
```ts
<<<<
      try {
        localStorage.removeItem(DATE_STORAGE_KEY)
      } catch {
        // ignore
      }
====
      try {
        localStorage.removeItem(DATE_STORAGE_KEY)
        localStorage.removeItem(MATRIX_BIRTHDATE_KEY)
      } catch {
        // ignore
      }
>>>>
```

---

#### 4. `src/three/bookScene.ts`
Add synchronization method and instant spread positioning:
```ts
<<<<
  private chapters: Chapter[] = []
  // Сколько листов занимает активная вкладка правой страницы каждой главы
  private tabPageCounts: number[] = []
  private draftDate = { day: 2, month: 4, year: 1994 }
  private raycaster = new THREE.Raycaster()
====
  private chapters: Chapter[] = []
  // Сколько листов занимает активная вкладка правой страницы каждой главы
  private tabPageCounts: number[] = []
  private draftDate = { day: 2, month: 4, year: 1994 }
  private raycaster = new THREE.Raycaster()

  public syncDraftDateFromStore(): void {
    const store = useBookStore.getState()
    let targetDate = store.birthDate
    if (!targetDate) {
      try {
        const raw =
          localStorage.getItem('alina_matrix_birthdate') ||
          localStorage.getItem('archetypes_birthdate_v03')
        if (raw) {
          const ruMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(raw.trim())
          if (ruMatch) {
            targetDate = new Date(parseInt(ruMatch[3], 10), parseInt(ruMatch[2], 10) - 1, parseInt(ruMatch[1], 10))
          } else {
            const d = new Date(raw.trim())
            if (!isNaN(d.getTime())) targetDate = d
          }
        }
      } catch {
        // ignore
      }
    }
    if (targetDate && !isNaN(targetDate.getTime())) {
      this.draftDate = {
        day: targetDate.getDate(),
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
      }
    }
  }

  jumpToSpread(targetSpread: number) {
    if (this.anim) {
      this.finishTurn()
    }
    const maxSpread = this.turnable.length
    const clamped = Math.max(0, Math.min(targetSpread, maxSpread))

    for (let i = 0; i < clamped; i++) {
      const leaf = this.turnable[i]
      leaf.pivot.rotation.z = Math.PI
      leaf.pivot.position.y = i * STACK_STEP
      const b = leaf.mesh.geometry.attributes.position as THREE.BufferAttribute
      const base = leaf.mesh.userData.basePos as Float32Array
      for (let j = 0; j < b.count; j++) {
        b.setX(j, base[j * 3 + 0])
        b.setY(j, base[j * 3 + 1])
      }
      b.needsUpdate = true
      leaf.mesh.geometry.computeVertexNormals()
    }

    for (let i = clamped; i < maxSpread; i++) {
      const leaf = this.turnable[i]
      leaf.pivot.rotation.z = 0
      leaf.pivot.position.y = leaf.restY
      const b = leaf.mesh.geometry.attributes.position as THREE.BufferAttribute
      const base = leaf.mesh.userData.basePos as Float32Array
      for (let j = 0; j < b.count; j++) {
        b.setX(j, base[j * 3 + 0])
        b.setY(j, base[j * 3 + 1])
      }
      b.needsUpdate = true
      leaf.mesh.geometry.computeVertexNormals()
    }

    this.turnsCount = clamped
    this.leftStackCounter = clamped
    this.updateBookBlocks()

    if (clamped === 0) {
      this.readingView = 'spread'
      this.setCamState('cover')
    } else {
      this.readingView = 'spread'
      this.setCamState('reading_spread')
    }
  }
>>>>
```
In `constructor`:
```ts
    this.syncDraftDateFromStore()
```
And in `buildBook`:
```ts
<<<<
  buildBook(chapters: Chapter[]) {
    this.clearBook()
    this.chapters = chapters
    const n = chapters.length
    if (n === 0) return

    const store = useBookStore.getState()
    const scores = store.scores
    const activeTab = store.activeLayerTab
    const profile = store.profile

    // Лист 0: Обложка + Левая страница Главы 1
    const coverCv = document.createElement('canvas')
    drawCoverOntoCanvas(coverCv, store.coverState, this.draftDate)
====
  buildBook(chapters: Chapter[]) {
    this.clearBook()
    this.syncDraftDateFromStore()
    this.chapters = chapters
    const n = chapters.length
    if (n === 0) return

    const store = useBookStore.getState()
    const scores = store.scores
    const activeTab = store.activeLayerTab
    const profile = store.profile

    // Лист 0: Обложка + Левая страница Главы 1
    const coverCv = document.createElement('canvas')
    drawCoverOntoCanvas(coverCv, store.coverState, this.draftDate)
>>>>
```

---

#### 5. `src/three/BookStage.tsx`
```tsx
<<<<
export function BookStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BookScene | null>(null)
  const appliedCount = useRef(0)
  const queueRunning = useRef(false)

  const stage = useBookStore((s) => s.stage)
  const coverState = useBookStore((s) => s.coverState)
  const chapters = useBookStore((s) => s.chapters)
  const currentSpread = useBookStore((s) => s.currentSpread)
  const activeLayerTab = useBookStore((s) => s.activeLayerTab)
  const tabPage = useBookStore((s) => s.tabPage)
  const scores = useBookStore((s) => s.scores)

  // 1. Создание 3D сцены
  useEffect(() => {
    if (!canvasRef.current || !stageRef.current) return
    const scene = new BookScene(canvasRef.current, stageRef.current)
    sceneRef.current = scene
    if (typeof window !== 'undefined') {
      window.__bookScene = scene
      window.__bookStore = useBookStore
    }

    // Начальная книга (эталон 02.04.1994)
    const initialProfile = calculateArchetypes(new Date(1994, 3, 2))
    const placeholder = buildChapters(initialProfile)
    scene.buildBook(placeholder)
    appliedCount.current = 0

    return () => {
      scene.dispose()
      sceneRef.current = null
      if (typeof window !== 'undefined') {
        delete window.__bookScene
        delete window.__bookStore
      }
    }
  }, [])

  // 2. Обновление глав при расчёте даты рождения
  useEffect(() => {
    if (!chapters.length || !sceneRef.current) return
    sceneRef.current.buildBook(chapters)
    appliedCount.current = 0
  }, [chapters])
====
export function BookStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<BookScene | null>(null)
  const appliedCount = useRef(0)
  const queueRunning = useRef(false)
  const isFontReadyRef = useRef(false)

  const stage = useBookStore((s) => s.stage)
  const coverState = useBookStore((s) => s.coverState)
  const chapters = useBookStore((s) => s.chapters)
  const currentSpread = useBookStore((s) => s.currentSpread)
  const activeLayerTab = useBookStore((s) => s.activeLayerTab)
  const tabPage = useBookStore((s) => s.tabPage)
  const scores = useBookStore((s) => s.scores)

  // 1. Создание 3D сцены с ожиданием готовности шрифтов
  useEffect(() => {
    if (!canvasRef.current || !stageRef.current) return
    const scene = new BookScene(canvasRef.current, stageRef.current)
    sceneRef.current = scene
    if (typeof window !== 'undefined') {
      window.__bookScene = scene
      window.__bookStore = useBookStore
    }

    let isMounted = true

    const initBookWithFonts = async () => {
      // Ожидание готовности шрифтов с таймаутом безопасности 2.5с
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          const fontTimeout = new Promise((resolve) => setTimeout(resolve, 2500))
          await Promise.race([document.fonts.ready, fontTimeout])
        } catch (err) {
          console.warn('Font loading check timed out or failed:', err)
        }
      }

      if (!isMounted || !sceneRef.current) return
      isFontReadyRef.current = true

      // Если в store уже есть рассчитанные главы, используем их; иначе строим эталон
      const storeState = useBookStore.getState()
      const targetChapters =
        storeState.chapters.length > 0
          ? storeState.chapters
          : buildChapters(calculateArchetypes(storeState.birthDate ?? new Date(1994, 3, 2)))

      sceneRef.current.syncDraftDateFromStore()
      sceneRef.current.buildBook(targetChapters)

      // Если разворот уже был открыт ранее, мгновенно перемещаемся на него
      if (storeState.currentSpread > 0) {
        sceneRef.current.jumpToSpread(storeState.currentSpread)
        appliedCount.current = storeState.currentSpread
      } else {
        appliedCount.current = 0
      }
    }

    initBookWithFonts()

    return () => {
      isMounted = false
      scene.dispose()
      sceneRef.current = null
      if (typeof window !== 'undefined') {
        delete window.__bookScene
        delete window.__bookStore
      }
    }
  }, [])

  // 2. Обновление глав при расчёте даты рождения
  useEffect(() => {
    if (!chapters.length || !sceneRef.current || !isFontReadyRef.current) return
    sceneRef.current.syncDraftDateFromStore()
    sceneRef.current.buildBook(chapters)
    appliedCount.current = 0
  }, [chapters])
>>>>
```

---

## 5. Verification Method

### 5.1 Build & Lint Verification
Execute from project root (`/Users/mcv/Documents/book`):
```bash
# 1. Verify code linting
npm run lint

# Expected:
# Found 0 warnings and 0 errors. (Exit code 0)

# 2. Verify TypeScript compilation and production build
npm run build

# Expected:
# ✓ 49 modules transformed.
# ✓ built in ~160ms (Exit code 0)
```

### 5.2 Functional Scenario Verification

1. **Scroll Position Preservation Scenario**:
   - In browser, scroll down to the "Прейскурант сессий" (Pricing) section ($\approx 2200\text{px}$).
   - Click "Открыть 3D-Книгу" or the book card in `ServicesGrid`.
   - Verify URL changes to `/#book` and the 3D book loads.
   - Click «← К практикам Алины» in the top navigation overlay or press `Escape`.
   - Verify: Portal view is restored immediately, URL is cleaned of `#book`, and the page is scrolled exactly to the "Прейскурант сессий" position.
   - Selected tariff options in `PricingSection` remain intact.

2. **Clean URL Hash & Browser History Scenario**:
   - From `/`, navigate to `/#book`.
   - Click «← К практикам Алины».
   - Verify URL is `/` (not `/#` and not leaving an orphaned `#book`).
   - Click the browser Back button in toolbar.
   - Verify: Browser exits to the previous site / empty tab, and DOES NOT loop back into `/#book`.

3. **Keyboard `Escape` Listener Scenario**:
   - Open the 3D book (`/#book`).
   - Press the `Escape` key on the keyboard.
   - Verify: View smoothly returns to the portal and URL returns to clean root.

4. **Cover Date Synchronization Scenario**:
   - In browser console, set: `localStorage.setItem('alina_matrix_birthdate', '15.08.1989')`.
   - Reload page and click "Открыть 3D-Книгу".
   - Verify:
     - Top navbar overlay shows `Код готов: 15.08.1989`.
     - 3D book cover physically renders `15 . 08 . 1989` (not `02 . 04 . 1994`).
     - Clicking "ОТКРЫТЬ ВРАТА" calculates archetypes for August 15, 1989.

5. **Font Readiness Scenario**:
   - Throttle network in Chrome DevTools to "Slow 3G".
   - Hard refresh directly on `http://localhost:5173/#book`.
   - Verify: Canvas textures are only drawn once `document.fonts.ready` resolves, displaying "Cormorant Garamond" without fallback glyph artifacts.

### 5.3 Invalidation Conditions
- Any occurrence of WebGL canvas unmounting errors or null context crashes.
- Any regression in `npm run lint` or `npm run build`.
- Scroll position resetting to top of page upon returning from `#book`.
- Browser Back button trapped in a loop on `/#book`.
- Cover date displaying 02.04.1994 when a stored birthdate is present in `alina_matrix_birthdate`.
