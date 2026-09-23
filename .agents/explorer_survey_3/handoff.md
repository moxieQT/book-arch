# 3D Book & Seamless Transition Technical Investigation Report (R3)

## Summary
- **Module**: Interactive 3D Book «Архетипы и Тени» & Transition Architecture
- **Target Requirement**: R3 (Seamless transition to interactive 3D book with top return bar «← К практикам Алины» and state preservation via `#book` hash support)
- **Status**: Functioning baseline with critical state preservation gaps, history stack pollution, and UX polish opportunities.

---

## 1. Observation

### 1.1 Architecture & Rendering Engine of the 3D Book
1. **Framework & Stack**:
   - The 3D engine is built on **pure Three.js v0.185.1** (not React Three Fiber) wrapped in a custom React canvas component.
   - Core files:
     - `src/App.tsx`: Manages view switching between `'portal'` and `'book'`, listens to `hashchange`.
     - `src/components/BookNavbarOverlay.tsx`: Floating top navigation bar rendered when in 3D book view.
     - `src/three/BookStage.tsx`: React lifecycle coordinator connecting Zustand store to `BookScene`.
     - `src/three/bookScene.ts` (1,135 lines): Scene setup, camera rig, lights, 3D book geometry, page curl physics, raycasting.
     - `src/three/luxuryTextures.ts` (1,454 lines): Procedural 2D HTML5 canvas texture generation.
     - `src/three/bookLayout.ts` (196 lines): Interactive coordinate bounding boxes and click-hit zones.
     - `src/three/bookPalette.ts` (40 lines): Color palette (French luxury aesthetic: ivory, gold, wine, graphite).
     - `src/store/useBookStore.ts` (191 lines): Zustand store tracking stage, spread, scores, birth date, and tab states.
     - `src/numerology/*`: Calculation algorithms, archetypes database (`alineExtractedData.ts`, 828 KB), and chapter builders.

2. **Procedural Canvas Texture Engine**:
   - In `src/three/luxuryTextures.ts:8-9`:
     ```ts
     export const CANVAS_W = 1400
     export const CANVAS_H = 1880
     ```
   - Total generated canvases in `BookScene.buildBook()` (`src/three/bookScene.ts:707-764`):
     - Leaf 0: Cover canvas + Chapter 1 Left canvas = 2 canvases
     - Leaves 1..12: Front canvas + Back canvas = 24 canvases
     - Static Last Leaf (Leaf 13): Front canvas + Endpaper back canvas = 2 canvases
     - Total = 28 canvases (each 1400 × 1880 px).
   - Texture Memory footprint in VRAM:
     $1400 \times 1880 \times 4\text{ bytes} \approx 10.53\text{ MB per canvas} \times 28 \approx 294.8\text{ MB}$.
   - No external GLTF/GLB models or bitmap images (PNG/JPG) are loaded from disk; all graphics are procedurally generated via CanvasRenderingContext2D.

3. **Vertex-Level Page Curling Physics**:
   - `src/three/bookScene.ts:947-981` (`applyPageCurl`):
     - Page geometry: `PlaneGeometry(BOOK_W, BOOK_D, 32, 18)` (627 vertices).
     - Individual vertices are deformed along a sinusoidal wave with angle offset (`CURL_EXTRA_ANGLE = 0.85`), diagonal sweep (`DIAGONAL_SWEEP = 0.4`), and micro-ripples (`RIPPLE_AMPLITUDE = 0.01`).
     - Normal vectors recomputed each frame: `mesh.geometry.computeVertexNormals()`.
     - Turn duration: `TURN_DURATION = 820` ms.

4. **Lighting & Shadows**:
   - `src/three/bookScene.ts:157-177`:
     - Directional Key Light with `PCFSoftShadowMap` and $2048 \times 2048$ shadow map resolution.
     - Atmospheric warm point light ($1.15$ intensity with harmonic flicker simulation).
     - Floating gold dust particles (`THREE.Points`, 50 particles).

### 1.2 Transition & Routing Mechanics
1. **Hash Initialization & Event Listener**:
   - `src/App.tsx:16-18`:
     ```tsx
     const [viewMode, setViewMode] = useState<ViewMode>(() => {
       return typeof window !== 'undefined' && window.location.hash === '#book' ? 'book' : 'portal'
     })
     ```
   - `src/App.tsx:20-31`:
     ```tsx
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
     ```

2. **Opening the 3D Book**:
   - `src/App.tsx:33-36`:
     ```tsx
     const openBook = () => {
       window.location.hash = 'book'
       setViewMode('book')
     }
     ```
   - Triggered by:
     - Header CTA button (`src/components/PortalHeader.tsx:46`)
     - Hero section button (`src/components/HeroSection.tsx:41`)
     - Main Book Banner CTA & interactive mockup card (`src/components/BookBanner.tsx:52, 64`)
     - Services grid book card (`src/components/ServicesGrid.tsx:62, 95`)
     - Service details modal (`src/components/ServiceModal.tsx:92`)
     - Portal footer links (`src/components/PortalFooter.tsx:44`)

3. **Returning to Portal**:
   - `src/App.tsx:38-43`:
     ```tsx
     const backToPortal = () => {
       if (window.location.hash === '#book') {
         window.history.pushState(null, '', window.location.pathname)
       }
       setViewMode('portal')
     }
     ```
   - Triggered by button in `src/components/BookNavbarOverlay.tsx:18-26`:
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

### 1.3 State Preservation & Re-entry Behavior
1. **Unmounting Portal Component Tree**:
   - `src/App.tsx:52-81`:
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
   - When switching to `'book'`, `<div className="portal-layout">` is completely unmounted.
   - When returning to `'portal'`, `window.scrollY` resets to 0 (top of page). All local component states in `PricingSection` (`activeBlock`, `selectedOptions`, `showTarotBank`) and `ServicesGrid` reset to defaults.

2. **Unmounting & Recreating WebGL Scene**:
   - When switching from book to portal, `BookStage` unmounts and executes `scene.dispose()` (`src/three/BookStage.tsx:38-45`).
   - When reopening the book, `BookStage` mounts afresh:
     - `BookScene` constructor runs, creating a new WebGLRenderer and allocating memory.
     - `scene.buildBook(placeholder)` runs on mount (`BookStage.tsx:35`).
     - Immediately after, Effect 2 (`BookStage.tsx:49-53`) triggers `scene.buildBook(chapters)`, causing a duplicate 28-canvas repaint.
     - In Effect 6 (`BookStage.tsx:83-118`), `appliedCount.current` starts at 0 while `useBookStore.getState().currentSpread` is e.g. 5. The effect executes sequential `turnNext()` animations:
       $5 \text{ pages} \times 820\text{ ms} = 4.1\text{ seconds}$ of uninterruptible flipping animation before reaching the target chapter.

3. **`draftDate` Desynchronization Bug**:
   - In `src/three/bookScene.ts:113`:
     ```ts
     private draftDate = { day: 2, month: 4, year: 1994 }
     ```
   - `BookScene` does not read `useBookStore.getState().birthDate` in its constructor or in `buildBook()`.
   - When a returning user with saved date (e.g., 15.08.1989 in `archetypes_birthdate_v03`) opens the book:
     - The top navbar overlay displays: `Код готов: 15.08.1989` (`BookNavbarOverlay.tsx:40`).
     - But the 3D book cover renders `02 . 04 . 1994` (`drawCoverOntoCanvas(..., this.draftDate)`).
     - Clicking "ОТКРЫТЬ ВРАТА" (`bookScene.ts:348`) overwrites the user's saved date with 1994-04-02.

4. **Missing Font Loading Synchronization**:
   - `src/three/luxuryTextures.ts` sets `ctx.font = '... "Cormorant Garamond", Georgia, serif'` across 50+ canvas drawing calls.
   - There is no `document.fonts.ready` check prior to canvas rendering. If network latency delays the webfont, canvases freeze glyphs in Georgia/Times fallback.

5. **Missing Keyboard & Mobile Gestures**:
   - No `keydown` listener for `Escape` (return to portal) or `ArrowLeft`/`ArrowRight` (page turning).
   - No touch swipe detection on mobile devices; interactions rely solely on raycasting 3D meshes where hit targets measure ~14-28 CSS pixels on mobile screens.

---

## 2. Logic Chain

```
[Observation 1.2.3: App.tsx:38-43 uses pushState(null, '', pathname)]
  │
  ├─► When returning to portal, a new history record is pushed rather than popping '#book'.
  │   History becomes: [/] -> [/#book] -> [/].
  │   User pressing browser Back button returns to [/#book] rather than exiting the application.
  │
  └─► Query string is dropped: window.location.pathname ignores window.location.search (e.g. ?utm_source=...).

[Observation 1.3.1: App.tsx unmounts <portal-layout> when viewMode === 'book']
  │
  ├─► Portal DOM tree is destroyed.
  │   Browser window scroll position is lost and resets to (0, 0).
  │   User reading PricingSection (Y = ~2200px) who opens the book and returns is dropped at HeroSection.
  │
  └─► Portal component states (selected tariff, active tab in pricing) are lost on return.

[Observation 1.3.2: BookStage unmounts BookScene on exit and rebuilds on re-entry]
  │
  ├─► All 28 canvases (294 MB VRAM) are disposed and re-rendered from scratch upon re-opening.
  │
  ├─► appliedCount.current resets to 0 while currentSpread in store remains at N.
  │   Effect 6 runs turnNext in a while-loop.
  │   User must sit through N * 820ms of page animations every time they re-enter the book.
  │
  └─► No jumpToSpread() method exists to immediately position pages without animation.

[Observation 1.3.3: bookScene.ts:113 hardcodes draftDate = {day: 2, month: 4, year: 1994}]
  │
  ├─► User's persisted birthDate from localStorage is ignored by BookScene.draftDate.
  │
  └─► Cover texture displays default 02.04.1994, conflicting with top navbar display and risking data overwrite.

[Observation 1.3.4: No document.fonts.ready check before 2D canvas draw]
  │
  └─► Under slow network conditions on cold load of /#book, textures render with system serif fallback.
```

---

## 3. Caveats
1. **WebGL Context Retention**:
   - Keeping `BookStage` mounted in the background via CSS (`display: none` or `visibility: hidden`) preserves the 3D book spread instantly. However, keeping 294 MB VRAM allocated and running an unthrottled `requestAnimationFrame` loop would drain battery and memory on low-end mobile devices unless RAF is explicitly paused (`scene.pause()` / `scene.resume()`).
2. **Mobile Device Pixel Ratio**:
   - `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` prevents excessive render buffer overhead on 3x screens.
3. **PWA Manifest Metadata**:
   - In `vite.config.ts:12-18`, the PWA manifest contains legacy dark theme colors (`#0a0a16`) and title "Книга Чисел", whereas the portal uses French luxury ivory (`#F4EFE6`) and title "Архетипы и Тени".

---

## 4. Conclusion & Actionable Recommendations

### 4.1 Assessment Summary
The core 3D book engine is visually stunning, technologically sophisticated, and compiles without errors. However, to satisfy R3 ("Seamless transition to interactive 3D book 'Архетипы и Тени' with top return bar '← К практикам Алины' and state preservation (#book hash support), 3D book opens without errors"), the following items require attention:

### 4.2 Required Technical Enhancements

1. **State Preservation of Portal View**:
   - Instead of unmounting `<div className="portal-layout">`, keep it in the DOM and toggle visibility via CSS or overlay layering, OR record `savedScrollY.current = window.scrollY` before transitioning to `'book'` and restore it via `window.scrollTo({ top: savedScrollY.current, behavior: 'instant' })` on returning.
   - Retain component state in `PricingSection`.

2. **State Preservation of Book Spread & Immediate Resumption**:
   - Add a `jumpToSpread(targetSpread: number)` method in `BookScene`:
     - Sets `this.turnsCount = targetSpread`, `this.leftStackCounter = targetSpread`.
     - Positions leaves $0 \dots \text{targetSpread}-1$ to `rotation.z = Math.PI` and $y = i \times \text{STACK\_STEP}$.
     - Updates book blocks and sets camera to `reading_left` or `reading_spread`.
     - In `BookStage.tsx`, if mounting with `currentSpread > 0`, call `scene.jumpToSpread(currentSpread)` and set `appliedCount.current = currentSpread`, bypassing sequential 820ms turn loops.

3. **Synchronize `draftDate` with `birthDate`**:
   - In `BookScene.constructor` and `buildBook()`:
     ```ts
     const savedBirthDate = useBookStore.getState().birthDate
     if (savedBirthDate) {
       this.draftDate = {
         day: savedBirthDate.getDate(),
         month: savedBirthDate.getMonth() + 1,
         year: savedBirthDate.getFullYear()
       }
     }
     ```
   - Ensures the 3D cover matches the user's stored birth date immediately.

4. **Refined Navigation & Clean History Stack**:
   - In `backToPortal()`:
     - Check if there is history to unwind: if `#book` was reached via internal navigation, use `window.history.back()` or `window.history.replaceState(null, '', window.location.pathname + window.location.search)` instead of `pushState`.
     - Retain URL search parameters (`window.location.search`).

5. **Font Loading Synchronization**:
   - In `BookStage.tsx`, ensure `document.fonts?.ready` resolves before drawing the initial book canvases, or re-render cover and visible spreads when fonts load (`document.fonts.ready.then(...)`).

6. **Refined Loading & Transition Polish**:
   - Add a subtle luxury golden loader / fade transition while canvases and WebGL initialize, preventing an abrupt jump from blank canvas to 3D scene.
   - Add `keydown` support: `Escape` triggers `backToPortal()`, `ArrowLeft`/`ArrowRight` triggers page flipping.
   - Add touch swipe support for mobile devices.

---

## 5. Verification Method

### 5.1 Independent Build and Lint Verification
Run the standard validation commands in the terminal:
```bash
# 1. Verify TypeScript and production Vite build
npm run build

# Expected output:
# ✓ 47 modules transformed.
# ✓ built in ~160ms (code 0)

# 2. Verify code standards and linting
npm run lint

# Expected output:
# Found 0 warnings and 0 errors. (code 0)
```

### 5.2 Transition & Routing Verification Scenarios
1. **Direct Link Test**:
   - Navigate to `http://localhost:5173/#book`.
   - Verify: 3D book opens immediately in fullscreen mode without console errors. Top navbar is visible with `← К практикам Алины`.
2. **Top Return Bar Test**:
   - Click `← К практикам Алины`.
   - Verify: URL hash changes away from `#book`. Portal view renders.
3. **Browser Back/Forward Test**:
   - From portal, click "Открыть 3D-Книгу". URL becomes `/#book`.
   - Click browser Back button in browser toolbar.
   - Verify: Portal view restores smoothly.
   - Click browser Forward button.
   - Verify: 3D book view re-opens.
4. **State Preservation Test**:
   - Open book, enter birth date `15.08.1989`, click "Открыть Врата", flip to Chapter 3 (Врожденный Дар).
   - Click `← К практикам Алины`.
   - Verify portal scroll position and active elements.
   - Click "Открыть 3D-Книгу" again.
   - Verify: 3D book remembers the birth date on the cover and resumes reading without resetting or desynchronizing.

### 5.3 Invalidation Conditions
- Any occurrence of WebGL shader compilation errors or missing canvas context in browser console.
- Inability to return to portal via the top return bar.
- Browser back button getting trapped in an infinite `/#book` loop due to `pushState`.
- Failure of `npm run build` or `npm run lint`.
