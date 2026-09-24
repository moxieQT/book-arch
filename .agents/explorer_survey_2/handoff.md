# Codebase Architecture, Aesthetic & Functional Survey Report (Explorer 2)

**Report Date**: 2026-09-23T19:15:00Z  
**Author**: Explorer 2 (Portal UI, Aesthetic & Functional Integrity)  
**Target Audience**: Parent Orchestrator / Multi-Agent Implementation Team  
**Workspace Root**: `/Users/mcv/Documents/book`  

---

## 1. Observation

### 1.1 UI Component Tree, Data Architecture & Styling Foundation
- **Build Engine & Framework**: Single-Page Application (SPA) driven by **Vite 8.2.2** with **Rolldown bundler** and **React 19.2.8** (`package.json:12-28`, `vite.config.ts:35-51`). It is NOT Next.js.
- **Styling Architecture**: Custom CSS via CSS Custom Properties. **Tailwind CSS is NOT used** (no `tailwind.config.*`, no PostCSS).
- **Core CSS files**:
  - `src/index.css` (34 lines): Enforces `color-scheme: light;`, resets box sizing, binds `Cormorant Garamond` serif typography, sets base background `#F4EFE6` and text color `#201C24`.
  - `src/App.css` (2464 lines): Master design system containing all tokens, portal layout, cards, buttons, modals, and 3D stage styling.
- **Component Inventory under `src/components/`**:
  1. `PortalHeader.tsx` (88 lines): Sticky navigation with monogram `✦`, anchor links (`#practices`, `#pricing`, `#book-section`, `#approach`, `#contact`), Web Audio API toggle button (`🔊 432 Гц` / `🔈 432 Гц`), legal checker modal trigger (`🛡️ Юр. агент (РФ)`), and 3D book CTA button (`📖 Книга Кодов (3D)`).
  2. `HeroSection.tsx` (73 lines): Headline with italicized serif emphasis, value proposition, dual CTAs, and four key metrics (10 sound sessions, 6 channeling streams, 16 book codes, 10 Evolution masters).
  3. `BookBanner.tsx` (84 lines): Luxury banner spotlighting Prototype 1 («Астральный Астролябий и Живой Гримуар»), leather folio mockup, features list, and direct CTA to open 3D book.
  4. `ServicesGrid.tsx` (128 lines): Category tabs (`all`, `sound`, `consciousness`, `mastery`, `relationships`), rendering cards for all 7 author practices + 1 3D book card. Triggers `ServiceModal` or `onOpenBook`.
  5. `ServiceModal.tsx` (151 lines): Deep dive into selected practice with quotes, paragraphs, bullets, outcomes, manager Maria notice, and direct Telegram/WhatsApp booking links.
  6. `PricingSection.tsx` (406 lines): Master pricing section with:
     - Top Manager Maria contact card with Telegram (`@maria_anima`) and WhatsApp (`+7 915 214 9560`).
     - 14-chip interactive Client Query Navigator (`CLIENT_QUERY_NAVIGATOR`) with smooth scroll and card highlight.
     - Regulatory Medical Disclaimer card (`ФЗ № 323-ФЗ · 18+`).
     - 3-block tab switcher (`taro-matrix`, `soul-archetypes`, `energy-ritual`).
     - 16 session cards with interactive option pills, dynamic price display, online surcharge notices (`+3 000 ₽`), special discount callouts (-20% on alignment after Twin Flames), and prefilled Telegram booking links.
     - Expandable 36-question Tarot Question Bank (27 relationship questions + 9 money questions) with clipboard copy and direct Telegram forwarding.
  7. `ApproachSection.tsx` (52 lines): 4 Roman-numeral philosophical pillars of Alina's method.
  8. `PortalFooter.tsx` (121 lines): Brand statement, navigation links, digital artifact links, Maria contact CTAs, and statutory RF legal disclaimer (18+, non-medical).
  9. `BookNavbarOverlay.tsx` (95 lines): Top floating glassmorphic navbar when inside 3D book mode with return button (`← К практикам Алины`), chapter progress indicator, and controls.
  10. `LegalRiskChecker.tsx` (189 lines): Interactive RF legal risk audit tool powered by `src/data/legalRules.ts` with real-time scoring (0-100), stop-word detection, safe replacement suggestions, and mandatory statutory disclaimer generator.

### 1.2 Existing Palette vs French Light Luxury Requirements
- **Tokens in `src/App.css:1-25` and `src/three/bookPalette.ts:7-69`**:
  - Warm Ivory / Linen: `--bg: #F4EFE6`, `#FAF6EE`, `#EDE7DB`, `#F8F5EE`, `#F3EDE2`
  - 22k Gold Leaf: `--gold: #C6A76B`, `--gold-hover: #D8B97D`, `--gold-dark: #9F824A`, `--gold-glow: rgba(198, 167, 107, 0.28)`
  - Imperial Burgundy: `--wine: #5C192E`, `--wine-hover: #75203B`, `--wine-glow: rgba(92, 25, 46, 0.15)`
  - Deep Ink Anthracite: `--ink: #201C24`, `--ink-secondary: #524B57`, `--ink-light: #7E7785`
  - Travertine / Limestone ground: `0xE8DFD0` (ground plane), `0xE6DFD2` (atmospheric fog)
- **Gloomy Dark Backgrounds Identified (Aesthetic Inconsistencies)**:
  1. `src/App.css:867`: `.portal-footer` has `background: #1C1820; color: #FAF6EE;`.
     - *Observation*: The footer is styled with a pitch-dark anthracite background (`#1C1820`). While the text is ivory, this creates a heavy dark visual termination at the bottom of the page, violating the R2 requirement: *"Исключить любые мрачные темные фоны; свет теплый дневной"*.
  2. `src/App.css:491-496`: `.book-mockup` has `background: #3B0D1B; border-left: 10px solid #2A0913; box-shadow: -6px 10px 30px rgba(32, 28, 36, 0.35), inset 0 0 40px rgba(0, 0, 0, 0.5);`.
     - *Observation*: The book mockup in `BookBanner.tsx` uses a dark wine leather binding with black shadows (`rgba(0, 0, 0, 0.5)`), whereas the French Light Luxury 3D book cover is defined as light ivory buckram/vellum (`LUXURY_PALETTE.cover.base = '#F3EDE2'`).
  3. `src/App.css:975`: `.portal-modal-overlay` has `background: rgba(28, 24, 32, 0.75);`.
     - *Observation*: The modal backdrop is a heavy dark veil rather than a luminous light glassmorphic blur (`rgba(244, 239, 230, 0.65)` with `backdrop-filter: blur(12px)`).
  4. `src/App.css:33`: `.portal-layout` has `background-color: var(--bg);` (opaque `#F4EFE6`).
     - *Observation*: If a fixed continuous 3D canvas is placed behind `.portal-layout`, this opaque background property completely blocks the WebGL canvas from being visible.

### 1.3 7 Practices, 16 Sessions, Maria Links, and LegalRiskChecker
- **7 Author Practices (`src/data/alinaServices.ts:19-241`)**:
  - `vocal-sound-therapy`: 10 pure voice sessions without spoken words.
  - `taro-5d`: 5D channel reading from the info-field.
  - `feminine-body-practices`: Pelvic floor, lower diaphragm, deep breath.
  - `channeling-mastery`: 6 completed streams, levels I & II, spiritual autonomy.
  - `master-evolution`: 10-master incubator (2 weeks prep + 2 months practice).
  - `relationships-and-self`: Overcoming codependency, ancestral lineage, karma.
  - `feminine-tantra`: Tantric channels, sexual energy, masculine/feminine balance.
  - Plus item `08` (`archetypes-book`): 3D Luxury Art-Book entry point.
- **16 Individual Sessions (`src/data/alinaPricing.ts:218-466`)**:
  - Block 1 (`taro-matrix`): Tarot (5/10 questions, video 30/60 min: 5 555 ₽ – 14 999 ₽), Twin Flames (8 888 ₽ / 13 369 ₽ + guide 11.11 + 20% discount on alignment), Destiny Matrix (14 999 ₽), Ancestral Healing (18 000 ₽), Matrix + Healing Complex (29 999 ₽).
  - Block 2 (`soul-archetypes`): Akashic Records (18 000 ₽), Regression (21 000 ₽), Soul Journey (15 000 ₽ / 18 000 ₽ / 19 999 ₽ / 22 999 ₽), Shadow Integration (6 666 ₽), Light + Shadow (9 999 ₽), Empress (19 999 ₽).
  - Block 3 (`energy-ritual`): Energy Alignment (12 000 ₽ / 15 000 ₽), Quantum Cleansing (12 000 ₽ / 15 000 ₽), Energy Complex (22 000 ₽ / 25 000 ₽), Magic Diagnosis + Ritual (8 000 ₽ / from 28 000 ₽), Personal Mentorship (222 000 ₽).
  - All 4 dual-format sessions feature the explicit online surcharge note (+3 000 ₽ for live online vs recording).
  - 20% discount after Twin Flames is modeled with exact discounted prices: 9 600 ₽ (recording) and 12 000 ₽ (online).
- **Manager Maria Contact Routing**:
  - Single Source of Truth in `src/data/alinaPricing.ts:60-71`:
    - `name: 'Мария'`, `telegram: '@maria_anima'`, `telegramUrl: 'https://t.me/maria_anima'`, `phone: '+7 915 214 9560'`, `whatsappUrl: 'https://wa.me/79152149560'`.
  - Accurately integrated across `PricingSection.tsx`, `ServiceModal.tsx`, and `PortalFooter.tsx`.
- **LegalRiskChecker & Statutory RF Compliance**:
  - Engine in `src/data/legalRules.ts` with 7 regex rules across `medical_law` (ФЗ № 323-ФЗ), `advertising_law` (ФЗ «О рекламе» № 38-ФЗ), `fraud_prevention` (ст. 159 УК РФ), and `consumer_rights` (ЗоЗПП).
  - Interactive UI modal `LegalRiskChecker.tsx` triggered from header and footer.
  - Statutory disclaimers embedded in `PricingSection.tsx:126-145` and `PortalFooter.tsx:104-116`.

### 1.4 Spatial Generative Soundscape (Web Audio API)
- Implemented in `src/audio/soundscape.ts` (186 lines):
  - 432 Hz fundamental drone (`oscFund`, gain 0.12).
  - 864 Hz octave harmonic (`oscOctave`, gain 0.045).
  - 216 Hz sub-harmonic resonance (`oscSub`, gain 0.06).
  - Biquad low-pass filter (base 750 Hz, Q 1.2).
  - Master gain with smooth exponential ramps (`0.0001 <-> 0.25`).
  - Persistence: `alina_soundscape_enabled` in `localStorage`.
  - Tactile parchment rustle: `playPageTurn()` generates 180ms pink-filtered noise through a bandpass filter (1400 Hz) with attack/decay envelope. Integrated in `BookStage.tsx:134`.
  - Filter cutoff modulation: `updateScrollCutoff(velocity)` is defined at `soundscape.ts:130-135`, dynamically modulating cutoff frequency between 650 Hz and 2200 Hz.
  - *Observation / Defect*: `soundscape.updateScrollCutoff(velocity)` is currently NOT called by any scroll handler in the application!

### 1.5 Kinetic Scroll Integration & Continuous Canvas DOM Overlay
- **Current Architecture**:
  - `src/App.tsx:123-166`: Currently renders `<BookStage />` inside `<div className="app app--fullscreen">` strictly when `viewMode === 'book'`. When `viewMode === 'portal'`, the 3D scene is unmounted and destroyed via `scene.dispose()`.
  - When switching between modes, scroll position is manually saved to and restored from `sessionStorage` (`alina_portal_scroll_y`).
  - *Observation*: There is currently NO continuous WebGL canvas fixed behind the portal layout, and NO kinetic scroll controller feeding normalized `scrollProgress ∈ [0.0, 1.0]` exists in `src/App.tsx`.
- **Existing Astrolabe Module (`src/three/astralAstrolabe.ts:160-538`)**:
  - Contains 4 rings in 22k gold (`MeshPhysicalMaterial`), faceted crystal with custom GLSL Cauchy dispersion shader, caustic ground projection, and 70 particles.
  - Currently exposes `setStageMode('cover' | 'cover_input' | 'reading_spread' | ...)` for book stages, but lacks a method to drive the 4-phase transformation from continuous scroll progress `[0.0, 1.0]`.

### 1.6 Verification & Test Suites Output
- `npm run lint` (`oxlint`): 0 warnings, 0 errors across 38 files.
- `npm run build` (`tsc -b && vite build`): Exit code 0, 5 chunks emitted cleanly in 177ms.
- `node tests/prototype1-astrolabe-test.mjs && node tests/e2e-portal-test.mjs`: 115 / 115 assertions passed.
- `node tests/challenger_stress_test.mjs && node tests/stress-3d-transitions.mjs`: 44 / 44 stress tests passed, 19 / 19 3D transition tests passed.

---

## 2. Logic Chain

1. **Premise**: R1 demands a *"постоянный фоновый WebGL-холст (position: fixed; inset: 0), поверх которого плавно скроллится DOM-разметка портала"* and a *"кинетический скролл-контроллер, передающий нормализованный scrollProgress ∈ [0.0, 1.0]"*.
   - **Observation Reference**: `src/App.tsx:123-166` currently renders `BookStage` conditionally only when `viewMode === 'book'`. In portal mode, `BookStage` is not mounted.
   - **Deduction**: The canvas must be restructured into a persistent root-level component that stays mounted regardless of `viewMode`. When in portal mode, it sits at `position: fixed; inset: 0; z-index: 0; pointer-events: none;`. When in `#book` mode, pointer events are enabled on the canvas (`pointer-events: auto; z-index: 500;`).
2. **Premise**: In continuous canvas mode, DOM content scrolls over the 3D scene while remaining 100% sharp and readable on Retina displays.
   - **Observation Reference**: `src/App.css:33` sets `background-color: var(--bg);` on `.portal-layout`.
   - **Deduction**: An opaque background on `.portal-layout` hides the WebGL canvas. `.portal-layout` must have `background: transparent;`. Individual sections must use translucent ivory gradients (`rgba(244, 239, 230, 0.82)`) and cards with `backdrop-filter: blur(8px)` so that the golden astrolabe, caustic patterns, and ether particles are visible beneath the typography.
3. **Premise**: R2 mandates a *"строгая светлая люксовая эстетика (French Light Luxury)"* and the elimination of all gloomy dark backgrounds.
   - **Observation Reference**: `src/App.css:867` styles `.portal-footer` with `background: #1C1820;`, and `src/App.css:491` styles `.book-mockup` with `background: #3B0D1B;`.
   - **Deduction**: These dark elements break the French Light Luxury immersion. The footer must be converted to warm limestone/travertine (`#EDE7DB`) with 22k gold hairpins, and the book mockup should match the ivory/vellum binding (`#F3EDE2`).
4. **Premise**: R4 requires spatial soundscape modulation on scroll.
   - **Observation Reference**: `src/audio/soundscape.ts:130` implements `updateScrollCutoff(velocity)`, but grep shows zero invocations across `src/components` or `src/App.tsx`.
   - **Deduction**: The kinetic scroll controller in `App.tsx` must calculate scroll velocity on each frame (`v = (y - prevY) / dt`) and invoke `soundscape.updateScrollCutoff(v)`.
5. **Premise**: R1 specifies 4 scroll-driven transformation phases (0-25% floating, 25-60% expanding into 7-lens orbit, 60-85% converging into book binding, 85-100% book foreground).
   - **Observation Reference**: `src/three/astralAstrolabe.ts` only supports discrete book stage modes (`setStageMode`), but has no continuous progress interpolation method.
   - **Deduction**: `astralAstrolabe.ts` and `bookScene.ts` must implement `onScrollProgress(progress: number)` to interpolate ring expansion, rotation, camera tilt, and caustic intensity across the 4 phases.

---

## 3. Caveats

1. **Mobile WebGL Performance & Instanced Particles**: R1 mentions 15 000 particles with GPU Curl Noise. On mobile GPUs (iOS Safari / low-end Android), 15 000 full physical dispersion particles may impact battery and frame rate. A responsive LOD mechanism should reduce particle count to ~3 000 on mobile devices while maintaining 15 000 on desktop.
2. **Touch Scroll vs Kinetic Controller**: On iOS Safari, elastic momentum scroll ("rubber-banding") can produce `scrollProgress < 0.0` or `> 1.0`. The scroll controller must clamp progress strictly with `Math.max(0, Math.min(1, progress))`.
3. **Pointer Events Transparency**: During portal scrolling, mouse interactions must pass through to interactive DOM buttons (cards, options, booking CTAs), while still sending normalized mouse coordinates (`pointerParallax`) to the 3D scene for gyroscopic tilt.

---

## 4. Conclusion & Architectural Recommendations

The current codebase is in an exceptionally healthy state: all 7 author practices, 16 individual sessions, manager Maria links, LegalRiskChecker, and Web Audio API 432 Hz engine are fully implemented, verified, and passing 100% of lint, build, e2e, and adversarial stress tests.

To complete the 2026-09-23T19:01:02Z requirements (Continuous Canvas, French Light Luxury harmony, and Kinetic Scroll), the following concrete implementation roadmap is recommended:

### Architectural Roadmap:

1. **Continuous Canvas Restructuring (`src/App.tsx`, `src/three/BookStage.tsx`)**:
   - Keep `<BookStage />` persistently mounted in `src/App.tsx` within a fixed background wrapper:
     ```tsx
     <div className="continuous-stage-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: viewMode === 'book' ? 'auto' : 'none' }}>
       <BookStage isContinuousBackground={viewMode === 'portal'} scrollProgress={scrollProgress} />
     </div>
     ```
   - Avoid unmounting/remounting WebGL context upon navigating between portal and `#book`.
2. **Kinetic Scroll Controller Hook (`src/hooks/useKineticScroll.ts` or inside `App.tsx`)**:
   - Calculate normalized `scrollProgress = scrollY / (scrollHeight - innerHeight)` clamped to `[0.0, 1.0]`.
   - Calculate scroll velocity `velocity = (scrollY - lastScrollY) / dt`.
   - Call `soundscape.updateScrollCutoff(velocity)`.
   - Pass `scrollProgress` to `window.__bookScene.setScrollProgress(scrollProgress)`.
3. **Astrolabe 4-Phase Transformation (`src/three/astralAstrolabe.ts`)**:
   - Implement `setScrollProgress(p: number)` with the 4 distinct interpolation curves:
     - `0.00 – 0.25`: Hero hovering, crystal dispersion glitter, mouse parallax.
     - `0.25 – 0.60`: Cardinal rings expand into an orbital halo framing the 7 practices grid; caustic ground projection brightens.
     - `0.60 – 0.85`: Rings contract and align into the book clasp and gold corner mounts.
     - `0.85 – 1.00`: Book cover rotates into full presentation; transitions into the interactive folio.
4. **French Light Luxury Palette Refinement (`src/App.css`)**:
   - Change `.portal-footer` (`line 867`) from dark `#1C1820` to light luxury travertine:
     ```css
     .portal-footer {
       background: linear-gradient(180deg, #F4EFE6 0%, #EDE7DB 100%);
       color: var(--ink);
       border-top: 1px solid var(--border);
     }
     ```
   - Restyle `.book-mockup` (`line 491`) to ivory buckram (`#F3EDE2`) with 22k gold debossing.
   - Lighten `.portal-modal-overlay` (`line 975`) to frosted champagne glass: `background: rgba(244, 239, 230, 0.75); backdrop-filter: blur(12px);`.
   - Make `.portal-layout` (`line 33`) background transparent: `background-color: transparent;`.

---

## 5. Verification Method

To independently verify the observations and conclusions in this report:

1. **Verify Static Code Quality**:
   ```bash
   cd /Users/mcv/Documents/book
   npm run lint     # oxlint - must exit 0 with 0 errors
   npm run build    # tsc -b && vite build - must exit 0 and emit 5 chunks
   ```
2. **Execute Full Automated Test Suites**:
   ```bash
   node tests/prototype1-astrolabe-test.mjs && node tests/e2e-portal-test.mjs
   node tests/challenger_stress_test.mjs && node tests/stress-3d-transitions.mjs
   # Expect 100% pass across all assertions
   ```
3. **Verify Audio Scroll Gap**:
   ```bash
   grep -rn "updateScrollCutoff" src/
   # Observe that it is defined in src/audio/soundscape.ts:130 but not invoked anywhere else in src/
   ```
4. **Verify Dark Footer Background**:
   ```bash
   grep -n "background: #1C1820" src/App.css
   # Inspect line 867 (.portal-footer)
   ```
5. **Verify Discrete Canvas Mount in App.tsx**:
   ```bash
   grep -n "BookStage" src/App.tsx
   # Inspect lines 125-132: only rendered when viewMode === 'book'
   ```
