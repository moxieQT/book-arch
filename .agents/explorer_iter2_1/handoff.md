# HANDOFF REPORT: Scroll Restoration Race Condition Analysis & Patch Specification (BUG-M3-01)

**Role**: Explorer Iteration 2 - 1 (Scroll Restoration & Lifecycle Specialist)  
**Date**: 2026-09-23T18:02:00Z  
**Target File**: `src/App.tsx`  
**Working Directory**: `/Users/mcv/Documents/book/.agents/explorer_iter2_1`  
**Patch Artifact**: `/Users/mcv/Documents/book/.agents/explorer_iter2_1/app-scroll-fix.patch`  

---

## 1. Observation

### 1.1 Direct Tool Execution & Error Reproduction
- **Command**:
  ```bash
  npm run build && node tests/stress-3d-transitions.mjs
  ```
- **Result**:
  Exit code 1 with 3 failing assertions in Suite 3:
  ```text
  ▶ SUITE 3: Scroll Restoration Accuracy
    ✗ [SUITE 3] 3.1: Scroll to 2500px -> transition to #book -> click return -> verify scroll restored to 2500px
      AssertionError [ERR_ASSERTION]: Scroll position was NOT restored to 2500px! Expected ~2500, got 0
      at file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:529:12
      at async recordTest (file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:61:5)
      at async main (file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:483:3)
    ✗ [SUITE 3] 3.2: Scroll to 4200px (Pricing section) -> #book -> return -> verify scroll restored to 4200px
      AssertionError [ERR_ASSERTION]: Scroll position at 4200px was NOT restored! Expected ~4200, got 0
      at file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:551:12
      at async recordTest (file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:61:5)
      at async main (file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:535:3)
    ✗ [SUITE 3] 3.3: Scroll position preserved in sessionStorage (alina_portal_scroll_y)
      AssertionError [ERR_ASSERTION]: sessionStorage should preserve 4200, found: 0
      at file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:561:12
      at async recordTest (file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:61:5)
      at async main (file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:557:3)
  ```

### 1.2 Verbatim Code in `src/App.tsx`
- **Lines 26–36 (`saveScrollPosition`)**:
  ```tsx
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
  ```
- **Lines 39–45 (`openBook`)**:
  ```tsx
  const openBook = () => {
    saveScrollPosition()
    if (window.location.hash !== '#book') {
      window.location.hash = 'book'
    }
    setViewMode('book')
  }
  ```
- **Lines 55–67 (`handleHashChange` listener)**:
  ```tsx
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
  ```
- **Lines 85–99 (`useLayoutEffect` scroll restoration)**:
  ```tsx
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
  ```
- **Lines 119–123 (`portal-layout` visibility toggle)**:
  ```tsx
  <div
    className="portal-layout"
    style={viewMode === 'book' ? { display: 'none' } : undefined}
    aria-hidden={viewMode === 'book'}
  >
  ```

---

## 2. Logic Chain

1. **User Interaction & Initial Invocation**:
   When the user is browsing the portal at scroll offset `y = 2500` and clicks any CTA button (`.portal-header__cta` or `.book-banner__btn`), `openBook()` executes synchronously.
   - Line 40 calls `saveScrollPosition()`. At this moment, `.portal-layout` is rendered and fully visible (`style.display !== 'none'`). `window.scrollY` equals `2500`.
   - `scrollPosRef.current` is set to `2500` and `sessionStorage.setItem('alina_portal_scroll_y', '2500')`.
   - Line 42 sets `window.location.hash = 'book'`. According to the HTML5 specification, changing `location.hash` schedules an asynchronous `hashchange` task in the browser's event queue.
   - Line 44 calls `setViewMode('book')`.

2. **DOM Collapse & Viewport Scroll Reset**:
   React batches and renders the state update `viewMode = 'book'`.
   - At line 121, `<div className="portal-layout" style={{ display: 'none' }}>` takes effect.
   - Setting `display: none` removes the >10,000px portal container from the CSS formatting structure. The document scrollable height collapses down to the viewport/stage height (`100vh`).
   - The browser's layout engine automatically clamps `window.scrollY` from `2500` down to `0` (since `scrollY` cannot exceed `scrollHeight - clientHeight`).

3. **Asynchronous Hashchange Event Trigger**:
   The browser event loop reaches the queued `hashchange` macrotask.
   - The global event listener `handleHashChange` (lines 56–67) fires.
   - Condition `if (window.location.hash === '#book')` evaluates to `true`.
   - Line 58 invokes `saveScrollPosition()` a **second time**.

4. **State Clobbering**:
   Inside this second invocation of `saveScrollPosition()`:
   - It reads `const y = window.scrollY || document.documentElement.scrollTop || 0`.
   - Because `.portal-layout` is already hidden (`display: none`), `window.scrollY` is now `0`.
   - Line 29 assigns `scrollPosRef.current = 0`.
   - Line 31 calls `sessionStorage.setItem('alina_portal_scroll_y', '0')`.
   - The previously preserved `2500` is overwritten with `0`.

5. **Restoration Failure**:
   When the user clicks «← К практикам Алины» (`backToPortal()`):
   - `setViewMode('portal')` is called.
   - React updates the DOM to display `.portal-layout`.
   - `useLayoutEffect` (lines 85–99) checks:
     `const savedY = scrollPosRef.current || Number(sessionStorage.getItem(PORTAL_SCROLL_STORAGE_KEY) || '0')`.
   - Because both `scrollPosRef.current` and `sessionStorage` were overwritten with `0`, `savedY` is `0`.
   - The guard `if (savedY > 0)` evaluates to `false`.
   - The window remains at the top (`0`), failing test assertions 3.1, 3.2, and 3.3.

---

## 3. Caveats

1. **Why `if (y > 0)` Alone is Insufficient / Harmful**:
   An initial naive proposal might suggest adding `if (y > 0)` inside `saveScrollPosition()`. However:
   - If a user legitimately browses to the top of the portal (`scrollY === 0`) after previously visiting a lower section, opening the book with `if (y > 0)` would refuse to write `0`.
   - This causes "sticky scroll" where stale offsets (e.g., 4200) persist in `sessionStorage` and `scrollPosRef.current`, unexpectedly jumping the user down to 4200 when returning to the portal even though they entered from the top.
   - Therefore, the guard must check DOM visibility (`portalEl.style.display !== 'none'`) and current view mode (`viewModeRef.current === 'portal'`), NOT just `y > 0`.
2. **Cold Load on `/#book`**:
   Direct initial navigation to `/#book` does not have a prior portal scroll position; `scrollPosRef.current` starts at 0, which is intended.
3. **No Project Code Modifications**:
   Per read-only explorer constraints, no modifications to `src/App.tsx` were applied during this exploration turn. The changes are formulated below as an exact patch ready for implementation.

---

## 4. Conclusion & Exact Proposed Patch

To eliminate `BUG-M3-01` permanently and cleanly, implement a **dual-layer protection**:

1. **State Machine Tracking (`viewModeRef`)**:
   Introduce `viewModeRef = useRef<ViewMode>(viewMode)`. Keep `viewModeRef.current = viewMode` updated synchronously on every render and inside `openBook()` and `backToPortal()`.
   In `handleHashChange`, only call `saveScrollPosition()` if transitioning FROM portal (`viewModeRef.current === 'portal'`).
2. **Defensive Layout Guard in `saveScrollPosition`**:
   Check if `.portal-layout` is hidden (`style.display === 'none'`) or if `viewModeRef.current === 'book'`. If so, abort immediately without modifying `scrollPosRef.current` or `sessionStorage`.

### 4.1 Before vs. After Code Blocks (`src/App.tsx`)

#### Chunk 1: Lines 22–36
**BEFORE**:
```tsx
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
```

**AFTER**:
```tsx
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false)
  const scrollPosRef = useRef<number>(0)
  const viewModeRef = useRef<ViewMode>(viewMode)
  viewModeRef.current = viewMode

  // Сохранение позиции скролла портала перед переходом в режим 3D-книги
  const saveScrollPosition = () => {
    if (typeof window !== 'undefined') {
      // Защита: не сохранять скролл, если портал уже скрыт или режим не 'portal'
      const portalEl = document.querySelector('.portal-layout') as HTMLElement | null
      if (portalEl && portalEl.style.display === 'none') {
        return
      }
      if (viewModeRef.current === 'book') {
        return
      }
      const y = window.scrollY || document.documentElement.scrollTop || 0
      scrollPosRef.current = y
      try {
        sessionStorage.setItem(PORTAL_SCROLL_STORAGE_KEY, String(y))
      } catch {
        // ignore storage errors
      }
    }
  }
```

#### Chunk 2: Lines 38–67
**BEFORE**:
```tsx
  // Навигация между порталом и 3D-книгой
  const openBook = () => {
    saveScrollPosition()
    if (window.location.hash !== '#book') {
      window.location.hash = 'book'
    }
    setViewMode('book')
  }

  const backToPortal = () => {
    if (window.location.hash === '#book') {
      window.history.pushState(null, '', window.location.pathname)
    }
    setViewMode('portal')
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
```

**AFTER**:
```tsx
  // Навигация между порталом и 3D-книгой
  const openBook = () => {
    saveScrollPosition()
    viewModeRef.current = 'book'
    if (window.location.hash !== '#book') {
      window.location.hash = 'book'
    }
    setViewMode('book')
  }

  const backToPortal = () => {
    viewModeRef.current = 'portal'
    if (window.location.hash === '#book') {
      window.history.pushState(null, '', window.location.pathname)
    }
    setViewMode('portal')
  }

  // Слушатель хэша в URL (навигация назад/вперед в браузере и прямые ссылки)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#book') {
        if (viewModeRef.current === 'portal') {
          saveScrollPosition()
        }
        viewModeRef.current = 'book'
        setViewMode('book')
      } else {
        viewModeRef.current = 'portal'
        setViewMode('portal')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
```

---

## 5. Verification Method

Once the implementer applies the patch to `src/App.tsx`, verify using the following commands:

1. **Verify TypeScript Compilation & Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Code 0, clean build with zero TypeScript or Rollup errors.

2. **Verify Code Style & Linting**:
   ```bash
   npm run lint
   ```
   *Expected*: 0 warnings, 0 errors.

3. **Verify Empirical 3D Transition Stress Suite**:
   ```bash
   node tests/stress-3d-transitions.mjs
   ```
   *Expected*: 19 / 19 passed assertions (Exit code 0).
   Specifically:
   - Suite 3.1: Scroll to 2500px -> `#book` -> return -> scroll restored to 2500px (`✓`).
   - Suite 3.2: Scroll to 4200px -> `#book` -> return -> scroll restored to 4200px (`✓`).
   - Suite 3.3: `sessionStorage` preserves 4200 (`✓`).

4. **Verify General E2E Suite**:
   ```bash
   node tests/e2e-portal-test.mjs
   ```
   *Expected*: 115 / 115 passed assertions (Exit code 0).

5. **Invalidation Condition**:
   If `finalScrollY` or `sessionStorage` returns 0 after transitioning from a scrolled state, the patch was either not applied correctly or `viewModeRef.current` was not set synchronously prior to `window.location.hash = 'book'`.
