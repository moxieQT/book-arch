# CHALLENGER 2 REPORT: 3D Transition & State Machine Stress Testing

**Verdict**: `REQUEST_CHANGES`  
**Overall Risk Assessment**: MEDIUM-HIGH (State Machine Race Condition Defect in Scroll Restoration)  
**Date**: 2026-09-23T17:55:00Z  
**Agent**: Challenger 2 (Empirical Challenger: 3D Transition & State Machine Stress Tester)

---

## 1. Observation

### Command Executions & Direct Results

1. **Production Build (`npm run build`)**:
   - Command: `npm run build`
   - Result: Exit Code 0.
   - Vite 8.2.2 + Rolldown generated chunks:
     - `dist/assets/index-B1QRMkC8.js` (213.89 kB)
     - `dist/assets/three-B5k_3QYM.js` (525.79 kB)
     - `dist/assets/react-vendor-cAWO-Tbh.js` (190.18 kB)
     - `dist/assets/arcana-texts-CeR5-hs4.js` (808.24 kB)
     - `dist/assets/index-Blmvq2oJ.css` (36.12 kB)

2. **Existing E2E Test Suite (`node tests/e2e-portal-test.mjs`)**:
   - Command: `node tests/e2e-portal-test.mjs`
   - Result: Exit Code 0 (115 / 115 assertions passed).
   - Identified known legacy contract escalation `BUG-M1-01` in `ServiceModal.tsx`.

3. **Empirical Headless Chrome Stress Suite (`node tests/stress-3d-transitions.mjs`)**:
   - Environment: Real Google Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` v152.0.7977.85) controlled via Chrome DevTools Protocol (CDP) over native WebSocket.
   - Total Assertions: 19 assertions across 5 stress suites.
   - Passed: 16 assertions.
   - **Failed**: 3 assertions (Suite 3: Scroll Restoration Accuracy).

   **Verbatim Error Log**:
   ```text
   ▶ SUITE 3: Scroll Restoration Accuracy
     ✗ [SUITE 3] 3.1: Scroll to 2500px -> transition to #book -> click return -> verify scroll restored to 2500px
       AssertionError [ERR_ASSERTION]: Scroll position was NOT restored to 2500px! Expected ~2500, got 0
       at file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:529:12
     ✗ [SUITE 3] 3.2: Scroll to 4200px (Pricing section) -> #book -> return -> verify scroll restored to 4200px
       AssertionError [ERR_ASSERTION]: Scroll position at 4200px was NOT restored! Expected ~4200, got 0
       at file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:551:12
     ✗ [SUITE 3] 3.3: Scroll position preserved in sessionStorage (alina_portal_scroll_y)
       AssertionError [ERR_ASSERTION]: sessionStorage should preserve 4200, found: 0
       at file:///Users/mcv/Documents/book/tests/stress-3d-transitions.mjs:561:12
   ```

4. **Code Observations in `src/App.tsx`**:
   - Lines 26-36:
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
   - Lines 39-45:
     ```tsx
     const openBook = () => {
       saveScrollPosition()
       if (window.location.hash !== '#book') {
         window.location.hash = 'book'
       }
       setViewMode('book')
     }
     ```
   - Lines 56-67:
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
   - Lines 120-123:
     ```tsx
     <div
       className="portal-layout"
       style={viewMode === 'book' ? { display: 'none' } : undefined}
       aria-hidden={viewMode === 'book'}
     >
     ```

5. **Resource and Canvas Stability Metrics**:
   - Initial JS Heap: 11.59 MB
   - Final JS Heap after 25 rapid mount/unmount cycles: 13.12 MB (Delta: +1.53 MB)
   - Active WebGL context limit: WebGL context remained 100% valid; no `webglcontextlost` events triggered.
   - `window.__bookScene` safely removed upon unmount.
   - Zero console errors or unhandled rejections during Suites 1, 2, 4, and 5.

---

## 2. Logic Chain

1. **Step 1 (User Initiates Transition)**:
   - When the user is at `window.scrollY = 2500` and clicks «Книга Кодов (3D)», `openBook()` executes.
   - At line 40 of `src/App.tsx`, `openBook()` calls `saveScrollPosition()`. At this moment, `window.scrollY` is 2500. `scrollPosRef.current` is set to 2500 and `sessionStorage.setItem('alina_portal_scroll_y', '2500')`.
   - Line 42 sets `window.location.hash = 'book'`.
   - Line 44 sets `setViewMode('book')`.

2. **Step 2 (DOM Collapse to `display: none`)**:
   - Setting `setViewMode('book')` triggers an immediate React re-render.
   - In `App.tsx` (line 121), `<div className="portal-layout" style={{ display: 'none' }}>` is applied.
   - Because the entire portal DOM container (height > 11,000px) is set to `display: 'none'`, the browser document collapses to the height of the viewport/stage.
   - Consequently, the browser layout engine immediately clamps `window.scrollY` from 2500 down to `0`.

3. **Step 3 (Asynchronous Hashchange Event Fires)**:
   - Asynchronously, the browser event loop delivers the queued `hashchange` event triggered by `window.location.hash = 'book'` in Step 1.
   - The event handler `handleHashChange` (lines 56–67) executes.
   - `window.location.hash === '#book'` is `true`.
   - Line 58 calls `saveScrollPosition()`.

4. **Step 4 (Clobbering of Saved State)**:
   - Inside `saveScrollPosition()` (line 28), it reads `const y = window.scrollY || document.documentElement.scrollTop || 0`.
   - Because `.portal-layout` is already hidden, `window.scrollY` is `0`.
   - Line 29 assigns `scrollPosRef.current = 0`.
   - Line 31 calls `sessionStorage.setItem('alina_portal_scroll_y', '0')`.
   - **The previously saved scroll position (2500) is irrevocably overwritten with 0**.

5. **Step 5 (Return to Portal Fails to Restore Scroll)**:
   - When the user clicks «← К практикам Алины» (`backToPortal`), `setViewMode('portal')` is called.
   - `useLayoutEffect` (lines 85–99) checks:
     `const savedY = scrollPosRef.current || Number(sessionStorage.getItem(PORTAL_SCROLL_STORAGE_KEY) || '0')`.
   - Because both `scrollPosRef.current` and `sessionStorage` were overwritten with 0, `savedY` is 0.
   - The condition `if (savedY > 0)` evaluates to `false`.
   - The browser remains at scroll position 0. The user is dumped at the top of the hero section instead of being returned to their previous browsing position (2500px).

---

## 3. Caveats

1. The defect occurs specifically when transitioning via programmatic interaction (`openBook()`) where `setViewMode('book')` and `window.location.hash = 'book'` are invoked together, resulting in `hashchange` firing after `display: 'none'` is rendered.
2. Pure cold navigation to `/#book` on initial page load is unaffected by this race condition because there is no prior portal scroll position to preserve.
3. No other state machine regressions were detected:
   - Hash toggling is resilient (40 programmatic toggles + 15 UI cycles did not crash or desync).
   - Browser forward/back history traverses cleanly without losing view mode synchronization.
   - `Escape` key handling works reliably both for `#book` exit and modal closing.
   - WebGL context disposal in `BookScene.ts` and `BookStage.tsx` is completely leak-free over 25 rapid cycles (+1.53 MB heap delta).

---

## 4. Conclusion & Verdict

**Verdict**: `REQUEST_CHANGES`

Objective 1 explicitly mandated:
> *"Verify scroll restoration: simulate scroll position at 2500px, transition to `#book`, click «← К практикам Алины», verify scroll position is restored to 2500px."*

This requirement failed verification due to `BUG-M3-01`.

### Recommended Actionable Mitigation

In `src/App.tsx`:
1. Prevent `saveScrollPosition()` from overwriting a valid saved scroll position with `0` when `.portal-layout` is hidden:
   ```tsx
   const saveScrollPosition = () => {
     if (typeof window !== 'undefined') {
       const y = window.scrollY || document.documentElement.scrollTop || 0
       if (y > 0) {
         scrollPosRef.current = y
         try {
           sessionStorage.setItem(PORTAL_SCROLL_STORAGE_KEY, String(y))
         } catch {
           // ignore storage errors
         }
       }
     }
   }
   ```
2. In `handleHashChange`, track the current view mode with a ref (`viewModeRef.current`), and only call `saveScrollPosition()` if transitioning FROM portal (`viewModeRef.current === 'portal'`):
   ```tsx
   const viewModeRef = useRef<ViewMode>(viewMode)
   useEffect(() => {
     viewModeRef.current = viewMode
   }, [viewMode])

   useEffect(() => {
     const handleHashChange = () => {
       if (window.location.hash === '#book') {
         if (viewModeRef.current === 'portal') {
           saveScrollPosition()
         }
         setViewMode('book')
       } else {
         setViewMode('portal')
       }
     }

     window.addEventListener('hashchange', handleHashChange)
     return () => window.removeEventListener('hashchange', handleHashChange)
   }, [])
   ```

---

## 5. Verification Method

To independently reproduce and verify this defect:

1. **Run the production build**:
   ```bash
   npm run build
   ```
2. **Execute the empirical 3D transition stress test suite**:
   ```bash
   node tests/stress-3d-transitions.mjs
   ```
3. **Inspect test output**:
   - Observe failure in `SUITE 3: Scroll Restoration Accuracy`:
     `AssertionError [ERR_ASSERTION]: Scroll position was NOT restored to 2500px! Expected ~2500, got 0`
4. **Invalidation condition**:
   - Applying the proposed mitigation in `src/App.tsx`, rebuilding (`npm run build`), and re-running `node tests/stress-3d-transitions.mjs` will result in 19 / 19 passed assertions (Exit Code 0).
