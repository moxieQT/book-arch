# Project: Prototype 1 («Астральный Астролябий и Живой Гримуар»)

## Architecture
Continuous Canvas WebGL architecture combining a fixed Three.js 0.185.1 background stage (`position: fixed; inset: 0; z-index: 0`) with smooth transparent DOM overlay (`z-index: 10`) driven by a kinetic scroll progress controller (`scrollProgress ∈ [0.0, 1.0]`).
The 3D stage features a 3-ring golden Astrolabe with sacred engravings in Cardan suspension, an optical crystal icosahedron with physical dispersion, 15,000 GPU curl noise particles, and a 4-phase transformation that folds the astrolabe into a living grimoire.
Hybrid rendering projects sharp vector DOM typography over the 3D book to reduce VRAM from 295 MB to < 40 MB, illuminated by procedural PMREM studio daylight in strict French Light Luxury aesthetic with a 432 Hz generative spatial soundscape.

```
                    ┌────────────────────────────────────────────────────────┐
                    │                      User Window                       │
                    └───────────────────────────┬────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
┌─────────────────────────────────┐                       ┌─────────────────────────────────┐
│     DOM Layer (z-index: 10)     │                       │  WebGL Canvas (z-index: 0, fixed)│
│ - PortalHeader (Sound & Audit)  │                       │ - Three.js 0.185.1 Scene Graph  │
│ - HeroSection (Phase 1: 0-25%)  │                       │ - PMREM Procedural HDR Softbox  │
│ - ServicesGrid (Phase 2: 25-60%)│ ──scrollProgress────► │ - 3-Ring Gimbal Astrolabe (PBR) │
│ - PricingSection(Phase 3: 60-85%)│      [0.0, 1.0]       │ - Central Dispersion Crystal    │
│ - 3D Book Mode (Phase 4: 85-100%)│                       │ - 15,000 GPU Curl Particles     │
│ - Hybrid DOM Retina Book HUD    │                       │ - Living Grimoire Folio Mesh    │
│ - LegalRiskChecker & Modals     │                       │ - Selective Bloom (0.92 thres)  │
└─────────────────────────────────┘                       └─────────────────────────────────┘
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Web Audio API (432 Hz)  │
                                  │ - Fundamental 432 Hz Drone│
                                  │ - Cutoff Scroll Modulation│
                                  │ - Page Rustle Synthesis   │
                                  └───────────────────────────┘
```

## Feature Inventory
Every feature identified during the survey phase is assigned to a milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Continuous Background Canvas | Fixed WebGL viewport (`position: fixed; inset: 0; z-index: 0`) behind DOM | M1 | Survey (R1) |
| 2 | Kinetic Scroll Controller | Spring-damped normalization of window scroll to `scrollProgress ∈ [0.0, 1.0]` | M1 | Survey (R1) |
| 3 | Astral Astrolabe Gimbal Rings | 3 gold rings with `metalness: 0.96, roughness: 0.12, anisotropy: 0.85` | M2 | Survey (R1) |
| 4 | Optical Crystal Cauchy Dispersion | Central icosahedron with `transmission: 0.98, ior: 1.54, dispersion: 0.06` & GLSL fallback | M2 | Survey (R1) |
| 5 | 15,000 Ether Particles Cloud | GPU Curl noise in vertex shader, 480 KB buffer, 60 FPS, mobile LOD (5k) | M2 | Survey (R1) |
| 6 | Prismatic Caustic Ground Projection | 12-ray solar dispersion caustic plane on travertine ground plane | M2 | Survey (R1) |
| 7 | 4 Transformation Scroll Phases | 0-25% hover, 25-60% orbital expansion, 60-85% clasp closure, 85-100% book entry | M2 | Survey (R1) |
| 8 | French Light Luxury Palette | Ivory `#F4EFE6`, parchment, travertine `#E8E1D5`, gold `#C6A76B`, burgundy `#5C192E` | M3 | Survey (R2) |
| 9 | Studio PMREM Lighting | Warm daylight illumination with procedural HDR softbox via `PMREMGenerator` | M3 | Survey (R2) |
| 10| Selective Bloom Postprocessing | Subtle bloom (threshold 0.92) highlighting crystal dispersion facets and gold leaf | M3 | Survey (R2) |
| 11| Hybrid Rendering Architecture | DOM projected vector text/tabs/cartouche for 100% Retina sharpness | M3 | Survey (R3) |
| 12| VRAM Optimization (<40 MB) | Eliminate 28 raster textures; single shared parchment + gold normal map | M3 | Survey (R3) |
| 13| 60 FPS Performance & Mobile LOD | Frame budget maintenance and adaptive particle LOD on mobile screens | M3 | Survey (R3) |
| 14| 432 Hz Generative Soundscape | Sacred 432 Hz fundamental drone with 864 Hz octave and 216 Hz sub-harmonic | M1 | Survey (R4) |
| 15| Scroll Cutoff Filter Modulation | Biquad filter frequency dynamically modulated by scroll velocity (650–2200 Hz) | M1 | Survey (R4) |
| 16| Page Turn Rustle Synthesis | Procedural pink-filtered noise burst with bandpass filtering for page turns | M1 | Survey (R4) |
| 17| Audio Toggle & LocalStorage | Header audio button with state persistence in `localStorage` | M1 | Survey (R4) |
| 18| 16 Individual Sessions Catalog | Complete price list across 3 blocks with exact pricing and descriptions | M4 | Survey (R1/R5) |
| 19| Variable Tariff Selector | Dynamic format switcher (recording, online, questions) with live price update | M4 | Survey (R1/R5) |
| 20| Online Format Surcharge (+3 000 ₽) | Exactly +3 000 ₽ surcharge for live online sessions across dual formats | M4 | Survey (R1/R5) |
| 21| Twin Flames 20% Discount | 20% discount on Energy Alignment within 14 days after Twin Flames | M4 | Survey (R1/R5) |
| 22| Magic Diagnosis & Clean Separation | Diagnostics (8 000 ₽) strictly decoupled from Big Cleansing (от 28 000 ₽) | M4 | Survey (R1/R5) |
| 23| 7 Author Group Programs | Full catalog of Alina's 7 group practices with detailed modal view | M4 | Survey (R2/R5) |
| 24| 3D Book Grimoire Service Card | 8th service entry marked `isBook: true` routing directly to 3D book (`#book`) | M4 | Survey (R2/R5) |
| 25| Service Modal (`ServiceModal`) | Rich modal with syllabus, outcomes, and Maria booking contacts | M4 | Survey (R2/R5) |
| 26| Manager Maria Booking Routing | Direct booking to Maria (@maria_anima, +7 915 214 9560) with percent-encoded text | M4 | Survey (R5) |
| 27| Client Query Navigator (14 Chips) | Interactive onboarding chips mapping customer queries to sessions | M4 | Survey (R5) |
| 28| Tarot Questions Bank (36 Questions) | 27 relationship + 9 money questions with clipboard copy & Telegram CTA | M4 | Survey (R5) |
| 29| RF Legal Risk Engine | 14-rule regulatory audit engine (38-FZ, 323-FZ, 159 UK RF) with ReDoS safety | M4 | Survey (R5) |
| 30| Interactive Legal Risk Checker UI | UI modal for copywriters to audit text and apply safe euphemisms | M4 | Survey (R5) |
| 31| Statutory Footer Disclaimer | 18+ consultative disclaimer stating practices do not replace medical care | M4 | Survey (R5) |
| 32| 13 Personal Arcana Chapters | Birthdate calculation of 13 personal chapters with full interpretations | M4 | Survey (R5) |
| 33| 5 Reading Layer Tabs | Tabs for Свет / Тень / Жизнь / Пантеон / Вопросы per arcana chapter | M4 | Survey (R5) |
| 34| Star Rating Assessment System | 5-star interactive rating for chapter integration level | M4 | Survey (R5) |
| 35| Page Curl Animation | Non-linear geometric curling mesh with 22k gold gilded edges | M2 | Survey (R1/R5) |
| 36| Floating Navigation Bar | Top overlay in 3D book mode with Prototype 1 badge and «← К практикам Алины» | M4 | Survey (R3/R5) |
| 37| Hash Navigation & Scroll Return | `#book` vs `#` hash routing with scroll position restored to exact pixels | M1 | Survey (R3/R5) |
| 38| Oxlint Linting Suite | 0 warnings, 0 errors quality gate | M-TEST | Survey (AC) |
| 39| TypeScript & Rolldown Production Build | `tsc -b && vite build` clean exit code 0 quality gate | M-FINAL| Survey (AC) |
| 40| Strict Local Git Sandbox | `origin.pushurl = DISABLED`, pre-push hook active | M-FINAL| Survey (AC) |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-TEST | E2E Test Track | Comprehensive opaque-box test suite (Tiers 1-4), TEST_INFRA.md, TEST_READY.md | none | IN_PROGRESS |
| M1 | Continuous Canvas & Kinetic Scroll | Persistent background WebGL canvas, kinetic scroll controller, audio scroll velocity modulation | none | IN_PROGRESS |
| M2 | 3D Astrolabe & 4 Scroll Phases | 3 PBR rings, crystal dispersion, 15k GPU curl particles, 4-phase transformation interpolation | M1 | PLANNED |
| M3 | French Light Luxury & VRAM Optimization | PMREM studio HDR lighting, selective bloom, eradication of dark elements, hybrid DOM projection (<40 MB) | M1, M2 | PLANNED |
| M4 | Functional Integrity & Integration | 16 sessions, 7 practices, Maria routing, LegalRiskChecker, 13 arcana, routing & modals | M1, M2, M3 | PLANNED |
| M-FINAL | Final Milestone & Hardening | Phase 1: 100% E2E test pass (Tiers 1-4); Phase 2: Adversarial coverage hardening (Tier 5) | M-TEST, M4 | PLANNED |

## Interface Contracts

### 1. Kinetic Scroll Controller ↔ Continuous Stage
- **Source**: `src/three/kineticScroll.ts`
- **Consumer**: `src/three/ContinuousStage.tsx`, `src/three/bookScene.ts`
- **Interface**:
  ```typescript
  export interface ScrollState {
    progress: number;   // normalized [0.0, 1.0]
    velocity: number;   // normalized scroll speed (points/sec)
    phase: 1 | 2 | 3 | 4; // active transformation phase
  }
  export type ScrollListener = (state: ScrollState) => void;
  ```

### 2. Audio Controller ↔ Kinetic Scroll
- **Source**: `src/three/kineticScroll.ts`
- **Consumer**: `src/audio/soundscape.ts`
- **Interface**:
  ```typescript
  export function updateScrollVelocity(velocity: number): void;
  // Modulates BiquadFilterNode frequency between 650 Hz and 2200 Hz
  ```

### 3. Astral Astrolabe Transformation ↔ Book Scene
- **Source**: `src/three/astralAstrolabe.ts`
- **Consumer**: `src/three/bookScene.ts`
- **Interface**:
  ```typescript
  export interface AstrolabeTransformState {
    scrollProgress: number; // [0.0, 1.0]
    mouseParallax: { x: number; y: number };
    isMobile: boolean;
  }
  public updateTransformation(state: AstrolabeTransformState): void;
  ```

### 4. Hybrid DOM Projection ↔ 3D Camera Projection
- **Source**: `src/three/bookScene.ts`
- **Consumer**: `src/components/BookDomOverlay.tsx`
- **Interface**:
  ```typescript
  export interface PageScreenCoordinates {
    leftPageCenter: { x: number; y: number; visible: boolean };
    rightPageCenter: { x: number; y: number; visible: boolean };
    bookScale: number;
  }
  ```

## Code Layout

- `src/App.tsx`: Root application orchestrator, persistent Continuous Canvas container, transparent `.portal-layout`.
- `src/three/ContinuousStage.tsx`: Persistent WebGL canvas wrapper mounting `BookScene` once without remounting.
- `src/three/kineticScroll.ts`: Spring-damped scroll progress controller and velocity calculator.
- `src/three/astralAstrolabe.ts`: 3-ring gimbal PBR astrolabe, Cauchy/physical dispersion crystal, 15,000 GPU curl noise particles, 4-phase interpolator.
- `src/three/bookScene.ts`: Integrated 3D world containing Astrolabe, procedural parchment Book, PMREM lighting, selective bloom, camera transitions.
- `src/three/bookPalette.ts`: French Light Luxury PBR and hex color definitions.
- `src/components/BookDomOverlay.tsx`: Vector DOM layer for chapter texts, tabs, star ratings, and date input.
- `src/components/`: Portal UI components (Header, Hero, ServicesGrid, ServiceModal, PricingSection, Approach, Footer, LegalRiskChecker, BookNavbarOverlay).
- `src/audio/soundscape.ts`: Web Audio API 432 Hz drone, filter cutoff modulation, procedural page rustle.
- `src/data/`: `alinaPricing.ts`, `alinaServices.ts`, `legalRules.ts`.
- `tests/`: `e2e-portal-test.mjs`, `prototype1-astrolabe-test.mjs`, `challenger_stress_test.mjs`, `stress-3d-transitions.mjs`.
