# Test Infrastructure: 4-Tier Automated Verification Architecture

**Project**: Master Alina Energy Healing Portal & Living Grimoire 3D Folio («Архетипы и Тени») — Prototype 1  
**Author**: E2E Test Writer (M-TEST)  
**Integrity Mode**: Development / Strict Local Git Sandbox  
**Standard**: 4-Tier Opaque-Box Quality Assurance Methodology  

---

## 1. Executive Summary & Purpose

This document establishes the authoritative test infrastructure, verification methodology, and complete 40-feature test matrix for Prototype 1 («Астральный Астролябий и Живой Гримуар»). 

The test infrastructure enforces a strict **4-tier verification methodology**:
1. **Tier 1: Category-Partition Feature Coverage**: Systematic decomposition of all 40 features into functional equivalence classes with $\ge 5$ explicit assertions per feature ($40 \times 5 = 200$ tests).
2. **Tier 2: Boundary Value Analysis (BVA)**: Probing extreme numerical boundaries, string lengths, ReDoS resistance, zero-division, floating-point rounding precision, and viewport edge cases (50 tests).
3. **Tier 3: Pairwise Combinatorial Interaction**: Verification of cross-module interface contracts, state machine transitions, event dispatch, and data synchronization across subsystems (12 tests).
4. **Tier 4: Real-World Workload Scenarios**: End-to-end execution of full user journeys from entry through onboarding, calculation, booking, and legal compliance (6 scenarios).

Every test derives its expected output from authoritative requirements in `/Users/mcv/Documents/book/.agents/ORIGINAL_REQUEST.md` (all 5 versions) and interface contracts in `/Users/mcv/Documents/book/PROJECT.md`.

---

## 2. 4-Tier Verification Methodology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TIER 4: Real-World Scenarios                         │
│  - Full Customer Workflows (S1–S6): Navigator -> Pricing -> Maria -> Book   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ builds upon
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    TIER 3: Pairwise Cross-Feature Tests                     │
│  - Module Interactions (C1–C12): Canvas ↔ DOM, Audio ↔ Scroll, State ↔ Store│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ builds upon
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                 TIER 2: Boundary Value Analysis (BVA)                       │
│  - Corner Cases (B1–B10): Numerical Clamps, ReDoS, Max/Min, URL Escaping   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ builds upon
┌──────────────────────────────────────▼──────────────────────────────────────┐
│            TIER 1: Category-Partition Feature Coverage (F1–F40)             │
│  - 40 Features in PROJECT.md × 5 focused tests = 200 verifiable assertions  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Category-Partition Feature Coverage
Features are partitioned into twelve functional domains:
1. **3D & Continuous Stage**: Continuous Canvas, Kinetic Scroll Controller, 3-Ring PBR Gimbal Astrolabe, Optical Crystal Cauchy Dispersion, 15,000 Ether Particles Cloud, Prismatic Caustic Ground Projection, 4 Transformation Scroll Phases.
2. **Design System & Lighting**: French Light Luxury Palette (`#F4EFE6`, `#C6A76B`, `#5C192E`, `#201C24`), Studio PMREM Lighting, Selective Bloom Postprocessing.
3. **Performance & VRAM**: Hybrid Vector DOM Rendering, VRAM Optimization (<40 MB), 60 FPS Framerate Budget & Mobile LOD.
4. **Generative Audio**: Sacred 432 Hz Soundscape, Kinetic Scroll Cutoff Modulation, Procedural Page Turn Synthesis, Audio Toggle & LocalStorage State.
5. **Pricing & Sessions**: 16 Individual Sessions Catalog, 27-Tariff Variable Selector, Online Format Surcharge (+3 000 ₽), Twin Flames 20% Discount Rule, Magic Diagnostics & Ritual Separation.
6. **Group Programs**: 7 Author Directions Presentation, 3D Book Grimoire Service Card, Service Details Modal (`ServiceModal`).
7. **Manager Operations**: Manager Maria Booking Routing (@maria_anima, +7 915 214 9560), Alina Endorsement Quote, Cyrillic Query Parameter Encoding.
8. **Client Onboarding**: 14-Chip Client Query Navigator, 36-Question Curated Tarot Bank.
9. **Legal Compliance (РФ)**: Russian Federation Legal Risk Engine (14 rules, 38-FZ, 323-FZ, 159 UK RF), Interactive Legal Risk Checker UI, Statutory 18+ Non-Medical Footer Disclaimer.
10. **Numerology & Living Grimoire**: 13 Personal Arcana Chapters Calculation, 5 Multidimensional Reading Layer Tabs, 5-Star Self-Assessment Rating System, Non-Linear 820ms Page Curl Animation.
11. **Navigation & Overlays**: Floating Navigation Bar (`BookNavbarOverlay`), Hash Routing (`#book` vs `#`) & Pixel-Perfect Scroll Restoration.
12. **Quality Gates & Governance**: Oxlint Static Analysis, TypeScript & Rolldown Production Build, Strict Local Git Sandbox (`origin.pushurl = DISABLED`).

### Tier 2: Boundary Value Analysis (BVA)
BVA targets the critical limits where software failures typically occur:
- **Price Bounds**: Minimum 5 555 ₽, maximum 222 000 ₽, zero/negative price rejection.
- **Mathematical Accuracy**: 20% discount on 12 000 ₽ is exactly 2 400 ₽ (net 9 600 ₽); on 15 000 ₽ is exactly 3 000 ₽ (net 12 000 ₽); online surcharge is exactly +3 000 ₽ with zero floating point residue.
- **URL Percent-Encoding**: Strict handling of Cyrillic text, French quotes (`« »`), punctuation, line breaks (`\n\n` -> `%0A%0A`), phone digits formatting (`79152149560`), handle format without `@`.
- **String & Text Lengths**: Questions $\ge 15$ chars ending in `?`, Navigator chips between 10 and 45 chars, descriptions $\ge 2$ paragraphs.
- **Audio Frequency Clamping**: BiquadFilter cutoff clamped between 650 Hz and 2200 Hz.
- **Scroll Progress**: Kinetic controller clamps scroll to $[0.0, 1.0]$.
- **ReDoS Stress**: Legal audit passes 100,000+ char strings in $<100$ ms without catastrophic backtracking.
- **Score Bounds**: Legal compliance scores clamped strictly in $[0, 100]$.

### Tier 3: Pairwise Cross-Feature Combinations
Pairwise testing verifies that combinations of independent features interact without collision:
- **C1**: Navigator chip click $\rightarrow$ Pricing Tab switch $\rightarrow$ Element scroll highlighting.
- **C2**: Session Option selection $\rightarrow$ Telegram CTA link generation with selected tariff and price.
- **C3**: Tarot Question selection $\rightarrow$ Maria Telegram booking URL generation.
- **C4**: Portal view $\rightarrow$ `#book` hash entry $\rightarrow$ BookNavbarOverlay return button $\rightarrow$ Portal view restoration.
- **C5**: Group Program card click $\rightarrow$ `ServiceModal` vs 3D Book card click $\rightarrow$ `#book` mode.
- **C6**: `ServiceModal` booking CTA contracts and Manager Maria contact routing.
- **C7**: Twin Flames consultation card cross-referencing Energy Alignment 20% discount.
- **C8**: LegalRiskChecker modal triggered from both PortalHeader and PortalFooter buttons.
- **C9**: Safe replacement application in LegalRiskChecker correcting stop words and increasing compliance score.
- **C10**: Footer statutory disclaimer harmonizing with session-level medical referral guidelines.
- **C11**: Kinetic scroll progress updating Astrolabe phase and Audio cutoff frequency concurrently.
- **C12**: Continuous Canvas WebGL stage persistence maintaining memory stability across navigation.

### Tier 4: Real-World Workload Scenarios
End-to-end customer workflows simulating real client interactions:
- **S1**: Relationship Clarity Journey (Navigator chip -> Tarot session card -> Question bank selection -> Maria Telegram booking).
- **S2**: Health & Somatic Inquiry Journey (Navigator exhaustion chip -> Soul Journey session -> Statutory non-medical disclaimer check).
- **S3**: Twin Flames to Energy Alignment Discount Journey (Twin Flames 60 min -> 14-day discount notice -> Energy Alignment discounted booking).
- **S4**: Living Grimoire 3D Exploration & Return Journey (Header 3D Book button -> `#book` view -> Chapter spread navigation -> Return button -> Scroll position restored).
- **S5**: Advertising Copy Legal Audit & Safe Remediation Journey (Copywriter pastes risky ad copy -> 14 rules audit -> Suggested replacements applied -> Score reaches $\ge 85$).
- **S6**: Kinetic Scroll & Audio Sensory Journey (User scrolls portal -> Astrolabe progresses through 4 phases -> 432 Hz drone modulates filter -> Audio toggle state persisted).

---

## 3. Comprehensive 40-Feature Test Matrix

| # | Feature Name | Milestone | Primary Source | Inputs | Expected Output | Test IDs in `tests/e2e-portal-test.mjs` |
|---|--------------|:---------:|----------------|--------|-----------------|:---------------------------------------:|
| 1 | Continuous Background Canvas | M1 | `src/App.tsx`, `src/three/BookStage.tsx` | View mode toggle, window resize | Fixed canvas (`inset: 0`), transparent DOM (`z-index: 10`), single persistent mount | `F1.1`–`F1.5` |
| 2 | Kinetic Scroll Controller | M1 | `src/three/bookScene.ts` | Window scroll delta, touch events | Clamped `scrollProgress ∈ [0.0, 1.0]`, velocity vector, spring damping | `F2.1`–`F2.5` |
| 3 | Astral Astrolabe Gimbal Rings | M2 | `src/three/astralAstrolabe.ts` | Time clock, pointer coordinates | 4 golden rings, 22k gold PBR (`metalness: 0.91`, `roughness: 0.19`), gimbal rotation | `F3.1`–`F3.5` |
| 4 | Optical Crystal Cauchy Dispersion | M2 | `src/three/astralAstrolabe.ts` | Light pos, camera pos, uniforms | Faceted icosahedron, Cauchy GLSL (`uDispersion: 1.25`, `etaR/G/B`), rainbow split | `F4.1`–`F4.5` |
| 5 | 15,000 Ether Particles Cloud | M2 | `src/three/astralAstrolabe.ts` | Simulation delta, particle buffer | Buffer geometry with 3-coord positions, 6-color dispersion palette, swirl | `F5.1`–`F5.5` |
| 6 | Prismatic Caustic Ground Projection | M2 | `src/three/astralAstrolabe.ts` | Time, light angle | 12-ray solar dispersion GLSL plane, travertine projection (`color: 0xe8dfd0`) | `F6.1`–`F6.5` |
| 7 | 4 Transformation Scroll Phases | M2 | `src/three/astralAstrolabe.ts` | `scrollProgress` | 4 camera and stage modes (`cover`, `cover_input`, `reading_spread`, etc.) | `F7.1`–`F7.5` |
| 8 | French Light Luxury Palette | M3 | `src/App.css`, `src/three/bookPalette.ts` | CSS custom properties, palette | Ivory `#F4EFE6`, gold `#C6A76B`, wine `#5C192E`, graphite `#201C24`, no dark backgrounds | `F8.1`–`F8.5` |
| 9 | Studio PMREM Lighting | M3 | `src/three/bookScene.ts` | Scene lights configuration | Hemisphere light (`0xfffbf4`/`0xd8cebe`), keylight (`0xfff7ec`), candle 2200K (`0xffaa42`) | `F9.1`–`F9.5` |
| 10 | Selective Bloom Postprocessing | M3 | `src/three/bookScene.ts` | Three.js postprocessing pass | Bloom threshold 0.92, selective illumination of gold/crystal, tone mapping exposure 1.12 | `F10.1`–`F10.5` |
| 11 | Hybrid Rendering Architecture | M3 | `src/App.tsx`, `src/components/BookNavbarOverlay.tsx` | Viewport dimensions | Crisp vector DOM typography on Retina over 3D canvas stage, coordinates sync | `F11.1`–`F11.5` |
| 12 | VRAM Optimization (<40 MB) | M3 | `src/three/bookScene.ts` | Geometry / Texture creation | Textures disposed on spread flip (`disposeLeaf`), memory budget $< 40$ MB | `F12.1`–`F12.5` |
| 13 | 60 FPS Performance & Mobile LOD | M3 | `src/three/bookScene.ts` | Device DPR, window dimensions | DPR clamped to $\le 2$, RAF animation loop, smooth lerp damping factor 0.055–0.065 | `F13.1`–`F13.5` |
| 14 | 432 Hz Generative Soundscape | M1 | `src/audio/soundscape.ts` | AudioContext startup | Fundamental 432 Hz drone, 864 Hz octave, 216 Hz sub-harmonic, exponential ramp | `F14.1`–`F14.5` |
| 15 | Scroll Cutoff Filter Modulation | M1 | `src/audio/soundscape.ts` | Scroll velocity float | Lowpass filter cutoff modulated dynamically between 650 Hz and 2200 Hz | `F15.1`–`F15.5` |
| 16 | Page Turn Rustle Synthesis | M1 | `src/audio/soundscape.ts` | Page turn event | 180 ms pink-filtered noise buffer, 1400 Hz bandpass filter, linear attack / exp decay | `F16.1`–`F16.5` |
| 17 | Audio Toggle & LocalStorage | M1 | `src/audio/soundscape.ts`, `PortalHeader.tsx` | Toggle click | Persisted in `localStorage('alina_soundscape_enabled')`, audio badge indicator | `F17.1`–`F17.5` |
| 18 | 16 Individual Sessions Catalog | M4 | `src/data/alinaPricing.ts` | `INDIVIDUAL_SESSIONS` | Exactly 16 sessions across 3 blocks (5 / 6 / 5), unique IDs, complete descriptions | `F18.1`–`F18.5` |
| 19 | Variable Tariff Selector | M4 | `src/data/alinaPricing.ts`, `PricingSection.tsx` | Option index selection | 27 tariff options, instant price calculation, formatted price string with ₽ | `F19.1`–`F19.5` |
| 20 | Online Format Surcharge (+3 000 ₽) | M4 | `src/data/alinaPricing.ts` | Tariff options | Exactly +3 000 ₽ surcharge for online vs recording across all 4 dual-format sessions | `F20.1`–`F20.5` |
| 21 | Twin Flames 20% Discount | M4 | `src/data/alinaPricing.ts` | Tariff calculation | 20% discount on Energy Alignment within 14 days (12 000 -> 9 600 ₽, 15 000 -> 12 000 ₽) | `F21.1`–`F21.5` |
| 22 | Magic Diagnosis & Clean Separation | M4 | `src/data/alinaPricing.ts` | Option selection | Diagnostics (8 000 ₽) strictly separate from Big Cleansing (от 28 000 ₽), not sold upfront | `F22.1`–`F22.5` |
| 23 | 7 Author Group Programs | M4 | `src/data/alinaServices.ts` | `ALINA_SERVICES` | 7 group practices + 1 book, numbers 01–08, badges, syllabi, bullets, outcomes | `F23.1`–`F23.5` |
| 24 | 3D Book Grimoire Service Card | M4 | `src/data/alinaServices.ts`, `ServicesGrid.tsx` | Service card click | 8th service card marked `isBook: true`, routes to `#book` directly | `F24.1`–`F24.5` |
| 25 | Service Modal (`ServiceModal`) | M4 | `src/components/ServiceModal.tsx` | Service card click | Modal with description, bullets, outcomes, Maria booking links, Escape handler | `F25.1`–`F25.5` |
| 26 | Manager Maria Booking Routing | M4 | `src/data/alinaPricing.ts`, `PortalFooter.tsx` | Booking clicks | @maria_anima (`https://t.me/maria_anima`), +7 915 214 9560 (`https://wa.me/...`) | `F26.1`–`F26.5` |
| 27 | Client Query Navigator (14 Chips) | M4 | `src/data/alinaPricing.ts`, `HeroSection.tsx` | Chip click | 14 query chips mapping client states to valid sessions with hints and emojis | `F27.1`–`F27.5` |
| 28 | Tarot Questions Bank (36 Questions) | M4 | `src/data/alinaPricing.ts`, `PricingSection.tsx`| Question selection | Exactly 36 unique questions (27 relationship + 9 money), clipboard copy, Telegram CTA | `F28.1`–`F28.5` |
| 29 | RF Legal Risk Engine | M4 | `src/data/legalRules.ts` | Russian promotional copy | 14 rules (38-FZ, 323-FZ, 159 UK RF), stop-word detection, score 0–100, ReDoS safety | `F29.1`–`F29.5` |
| 30 | Interactive Legal Risk Checker UI | M4 | `src/components/LegalRiskChecker.tsx` | User text input | Interactive audit modal, score meter, matched rules list, safe replacement buttons | `F30.1`–`F30.5` |
| 31 | Statutory Footer Disclaimer | M4 | `src/components/PortalFooter.tsx` | Page render | 18+ requirement, non-medical declaration, consultative legal character | `F31.1`–`F31.5` |
| 32 | 13 Personal Arcana Chapters | M4 | `src/numerology/chapters.ts` | Birthdate `Date` | 13 chapters calculated from birthdate (Soul, Personality, Gift, Destiny, Shadow, etc.) | `F32.1`–`F32.5` |
| 33 | 5 Reading Layer Tabs | M4 | `src/store/useBookStore.ts` | Tab selection | 5 tabs: essence, shadow, life, archetypes, integration with multi-page pagination | `F33.1`–`F33.5` |
| 34 | Star Rating Assessment System | M4 | `src/store/useBookStore.ts`, `luxuryTextures.ts`| Star click | 1–5 star rating per chapter, persisted in `useBookStore.scores`, 3D score update | `F34.1`–`F34.5` |
| 35 | Page Curl Animation | M2 | `src/three/bookScene.ts` | Page turn request | Non-linear geometric curling mesh, `TURN_DURATION = 820ms`, `CURL_EXTRA_ANGLE = 0.85` | `F35.1`–`F35.5` |
| 36 | Floating Navigation Bar | M4 | `src/components/BookNavbarOverlay.tsx` | Mode `#book` | Prototype 1 badge, chapter title/spread indicator, «← К практикам Алины» return CTA | `F36.1`–`F36.5` |
| 37 | Hash Navigation & Scroll Return | M1 | `src/App.tsx` | `#book` vs `#` | URL hash synchronizer, `sessionStorage` scroll Y restoration with RAF, popstate | `F37.1`–`F37.5` |
| 38 | Oxlint Linting Suite | M-TEST | `package.json` | Project source files | `npm run lint` finishes with 0 warnings and 0 errors | `F38.1`–`F38.5` |
| 39 | TypeScript & Rolldown Production Build | M-FINAL| `package.json`, `vite.config.ts` | Full repository | `npm run build` exits code 0, generates chunks in `dist/` with PWA manifest | `F39.1`–`F39.5` |
| 40 | Strict Local Git Sandbox | M-FINAL| `AGENTS.md`, `GEMINI.md`, `.git/config`| Git commands | `origin.pushurl = DISABLED`, `.git/hooks/pre-push` aborts any push attempt | `F40.1`–`F40.5` |

---

## 4. Test Execution Protocol

### 4.1. Core Automated Test Command
The complete test suite is self-contained and executes using Node.js:

```bash
# Execute primary E2E test suite (Tiers 1-4, >250 assertions)
node tests/e2e-portal-test.mjs
```

### 4.2. Specialized Test Suites
Additional automated suites in the repository verify domain-specific behaviors:

```bash
# Prototype 1 3D Astrolabe and Shaders Verification (11 assertions)
node tests/prototype1-astrolabe-test.mjs

# Challenger Adversarial Pricing, URL Fuzzing & ReDoS Stress Suite (44 assertions)
node tests/challenger_stress_test.mjs
```

### 4.3. Quality Gate Commands
Mandatory build, lint, and security checks:

```bash
# 1. Static code analysis (Oxlint)
npm run lint

# 2. Strict TypeScript typechecking & Rolldown production bundling
npm run build

# 3. Verify Strict Local Git Sandbox
git remote -v
```

---

## 5. Invalidation & Maintenance Protocol

The test suite will fail (exit code 1) and invalidate the build if:
1. Any of the 16 individual sessions, 27 tariffs, or 3 pricing blocks are modified, omitted, or miscalculated.
2. The online format surcharge deviates from exactly +3 000 ₽.
3. The Twin Flames 20% discount deviates from 9 600 ₽ (recording) or 12 000 ₽ (online).
4. Any booking CTA fails to target Manager Maria (`@maria_anima`, `+7 915 214 9560`).
5. Any dark background colors (`#000000`, `#0b0710`) are reintroduced into CSS or 3D stages.
6. The Russian legal risk engine fails ReDoS testing or produces scores outside $[0, 100]$.
7. The 3D Astrolabe lacks Cauchy dispersion tokens, 22k gold PBR materials, or WebGL disposal logic.
8. The 432 Hz soundscape oscillator frequencies (432 Hz, 864 Hz, 216 Hz) or filter bounds are altered.
9. Any remote push URL is configured in git (`origin.pushurl !== 'DISABLED'`).
