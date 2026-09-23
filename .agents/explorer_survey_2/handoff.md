# Codebase Architecture & Component Explorer Survey (Survey 2)

**Report Date**: 2026-09-23T17:26:00Z  
**Author**: Explorer Survey 2 (Codebase Architecture & Component Explorer)  
**Target Audience**: Parent Orchestrator / Implementers  
**Workspace Root**: `/Users/mcv/Documents/book`  

---

## 1. Observation

### 1.1 Project Type, Framework & Dependencies
- **Build tool & Framework**: Single-Page Application (SPA) powered by **Vite 8.2.2** and **React 19.2.8** (`package.json:12-28`). It is **NOT** a Next.js application (neither App Router nor Pages Router exists).
- **Bundler engine**: Vite 8 with **Rolldown** bundler (`vite.config.ts:35-51`), configured with code splitting groups for `three`, `react-vendor`, and `arcana-texts`.
- **Key libraries**:
  - `react`: `^19.2.8`, `react-dom`: `^19.2.8`
  - `three`: `^0.185.1` (3D interactive book canvas)
  - `zustand`: `^5.0.15` (global book reading state and local storage persistence)
  - `vite-plugin-pwa`: `^1.3.0` (service worker and PWA manifest)
  - `oxlint`: `^1.79.0` (fast static linter)
  - `typescript`: `~6.0.2`
- **Scripts in `package.json:6-11`**:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  }
  ```
- **Tool executions**:
  - `npm run lint`: Exited 0 with 0 errors and 0 warnings on 30 files in 7ms.
  - `npm run build`: Exited 0 (`tsc -b && vite build`), generating `dist/` in 163ms with 5 code-split asset chunks.

### 1.2 Styling & Typography (R4 Luxury Art-Book Aesthetic)
- **Styling Architecture**: Custom CSS with native CSS Custom Properties. **Tailwind CSS is NOT used** (no `tailwind.config.*`, no PostCSS plugin). No CSS Modules or CSS-in-JS.
- **Palette tokens** (`src/App.css:1-25`, `src/three/bookPalette.ts:7-69`):
  - Ivory / Слоновая кость: `--bg: #F4EFE6`, `#FAF6EE`, `#EDE7DB`
  - Gold / Сусальное золото: `--gold: #C6A76B`, `--gold-hover: #D8B97D`, `--gold-dark: #9F824A`, `--gold-glow: rgba(198, 167, 107, 0.28)`
  - Wine / Винный бархат: `--wine: #5C192E`, `--wine-hover: #75203B`, `--wine-glow: rgba(92, 25, 46, 0.15)`
  - Ink / Глубокий графит: `--ink: #201C24`, `--ink-secondary: #524B57`, `--ink-light: #7E7785`
- **Typography**:
  - Google Fonts link in `index.html:10`:
    `<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />`
  - Applied to `body` in `src/index.css:30`: `font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;`
  - Referenced as `var(--font-serif)` across `src/App.css`.

### 1.3 Component Inventory & Layout
The application structure is located under `src/`:
```
src/
├── main.tsx                         # DOM entry point & PWA registration
├── App.tsx                          # Top-level view mode switcher ('portal' vs 'book')
├── App.css                          # Complete luxury art-book CSS (1861 lines)
├── index.css                        # CSS reset & base serif typography
├── components/
│   ├── PortalHeader.tsx             # Sticky header with monogram, anchor nav & 3D book CTA
│   ├── HeroSection.tsx              # Hero with metrics, luxury badge & dual CTA buttons
│   ├── BookBanner.tsx               # Spotlight banner for 3D book with leather mockup
│   ├── ServicesGrid.tsx             # 7 author directions + 1 3D book card with category filters
│   ├── ServiceModal.tsx             # Detailed program modal with quotes, bullets, outcomes & CTA
│   ├── PricingSection.tsx           # Individual sessions: 3 blocks, 16 sessions, query navigator, tarot bank
│   ├── ApproachSection.tsx          # 4 pillars of Alina's method
│   ├── PortalFooter.tsx             # Luxury footer with links, quote & manager Maria contacts
│   ├── BookNavbarOverlay.tsx        # Top floating navbar when inside 3D book mode
│   └── ErrorBoundary.tsx            # Error boundary component
├── data/
│   ├── alinaPricing.ts              # MANAGER_INFO, PRICING_BLOCKS (3), INDIVIDUAL_SESSIONS (16), CLIENT_QUERY_NAVIGATOR (12), TAROT_QUESTIONS (27+9)
│   └── alinaServices.ts             # ALINA_SERVICES (7 group programs + 1 3D book definition)
├── store/
│   └── useBookStore.ts              # Zustand store for 3D book reading state & localStorage
├── three/                           # Three.js 3D book engine (BookStage, bookScene, luxuryTextures, etc.)
└── numerology/                      # 16-code calculations, arcana texts, and chapter data
```

### 1.4 State of Booking Links and Manager Contacts
- **Configured Manager**: `MANAGER_INFO` in `src/data/alinaPricing.ts:49-55`:
  - `name: 'Мария'`
  - `telegramHandle: 'maria_anima'`
  - `telegramUrl: 'https://t.me/maria_anima'`
  - `phone: '+7 915 214 9560'`
  - `whatsappUrl: 'https://wa.me/79152149560'`
- **Component Booking Behaviors**:
  - `PricingSection.tsx:146-148`:
    `const tgBookingUrl = 'https://t.me/' + MANAGER_INFO.telegramHandle + '?text=' + encodeURIComponent('Здравствуйте, Мария! Хочу записаться к Алине на сессию: «' + session.title + '» (тариф: ' + currentOption.label + ' — ' + currentOption.price + ')')` — **Accurate**.
  - `PricingSection.tsx:276-278`:
    `const sendTgUrl = 'https://t.me/' + MANAGER_INFO.telegramHandle + '?text=' + encodeURIComponent('Здравствуйте, Мария! Хочу задать на сессии Таро следующий вопрос:\n\n«' + q + '»')` — **Accurate**.
  - `PortalFooter.tsx:66-84`: Hardcoded links to `https://t.me/maria_anima` and `https://wa.me/79152149560` — **Correct contact, but not imported from `MANAGER_INFO`**.
  - `ServiceModal.tsx:101`:
    `href={'https://t.me/share/url?url=&text=' + encodeURIComponent('Здравствуйте, Алина! Хочу узнать подробнее и записаться на: ' + service.title)}` — **DEFECT FOUND**: Does not route to Maria `@maria_anima`, addresses Alina, and lacks WhatsApp option.

### 1.5 Interactive Components & Operational Rules Audit
- **Interactive «Навигатор по запросам» (`query-navigator`)**:
  - Located in `src/components/PricingSection.tsx:104-123`.
  - Driven by `CLIENT_QUERY_NAVIGATOR` (12 query types).
  - Clicking a query chip sets `activeBlock`, highlights the target session card with a wine border (`pricing-card--highlighted`), and smoothly scrolls to it.
- **«Банк вопросов Таро» (`tarot-bank-modal`)**:
  - Located in `src/components/PricingSection.tsx:243-308`.
  - Accordion toggle on the Tarot card with tabs for «Отношения и чувства (27)» and «Деньги и реализация (9)».
  - Features clipboard copy with visual confirmation (`Скопировано ✓`) and one-click pre-filled Telegram link to Maria.
- **Operational Rules State**:
  - *Medical Disclaimer*: Currently **absent** from the UI. (`alina_skills.md` principle 5 states: "При выраженных физических или психических симптомах клиенту строго рекомендуется обращение к профильным медицинским специалистам").
  - *Online Live Format Surcharge (+3 000 ₽)*: Applied mathematically across 4 dual-format sessions (Soul Journey, Energy Alignment, Quantum Cleansing, Complex), but lacks an explicit badge explaining "+3 000 ₽ за живой онлайн-формат".
  - *20% Discount Badge on Alignment after Twin Flame Consultation*: Stated as text in `bonus` fields, but no dedicated highlight badge on `energy-alignment`.

---

## 2. Logic Chain

1. **Architecture Model**: The project operates as an SPA where `App.tsx` controls switching between `#book` (full-screen 3D Three.js experience) and `#` (portal view). State is maintained continuously because `useBookStore` operates as a module singleton and syncs to `localStorage`. Hence, no page reload or state loss occurs when switching views (fulfills R3).
2. **Requirements Mapping (R1 & R2)**:
   - **R1 (16 Individual Sessions in 3 Blocks)**: All 16 sessions exist in `src/data/alinaPricing.ts` with exact prices and variable tariff options. `PricingSection.tsx` dynamically recalculates the price upon option selection.
   - **R2 (7 Group Programs + Knowledge Base)**: All 7 author programs exist in `src/data/alinaServices.ts` (alongside entry 08 for the 3D book) with category filtering and modal details. Both `alina_skills.md` and `docs/alina_skills.md` are synchronized and up-to-date.
3. **Styling Foundation (R4)**:
   - All aesthetic requirements (Cormorant Garamond, ivory `#F4EFE6`, gold `#C6A76B`, wine `#5C192E`, ink `#201C24`) are defined in `:root` and applied across all sections via `src/App.css`.
4. **Identified Deficiencies & Necessary Adjustments**:
   - `ServiceModal.tsx` must be updated to target manager Maria (`MANAGER_INFO.telegramUrl` / `MANAGER_INFO.whatsappUrl`) with the updated greeting format.
   - A dedicated Medical Disclaimer component/banner should be added to `PricingSection.tsx` to satisfy operational guidelines.
   - Visual badges for "+3 000 ₽ онлайн-формат" and "-20% после консультации БП" should be rendered on relevant session cards.
   - `PortalFooter.tsx` should import `MANAGER_INFO` for single-source-of-truth hygiene.

---

## 3. Caveats

- **No Caveats regarding build integrity**: The project builds cleanly with Vite and TypeScript (`npm run build` code 0), and passes `oxlint` with 0 warnings/errors.
- **Device testing**: While CSS contains media queries (`@media (max-width: 900px)` and `@media (max-width: 640px)`), real mobile device gestures for Three.js page-turn controls should be verified in a mobile viewport emulator.
- **Read-Only Scope**: In strict adherence to Explorer constraints, no project source code was modified during this survey.

---

## 4. Conclusion

The application architecture is well-structured, fast, modern, and aligned with the luxury art-book vision. It is built as a **Vite 8 + React 19 SPA** with custom CSS custom properties, Three.js 3D canvas rendering, and Zustand state management.

### Key Action Plan for Implementation:
1. **Fix `src/components/ServiceModal.tsx`**: Replace the old Telegram share link with Maria's direct link (`https://t.me/maria_anima?text=...`) and add WhatsApp CTA.
2. **Add Medical Disclaimer to `src/components/PricingSection.tsx`**: Add an elegant luxury disclaimer block:
   > *«Внимание: Энергетические и трансформационные практики не заменяют медицинскую или психотерапевтическую помощь. При выраженных физических или клинических симптомах рекомендуется обращение к профильному специалисту.»*
3. **Add Format Badges in `PricingSection.tsx`**:
   - Add a subtle badge `Живой онлайн-формат (+3 000 ₽ к записи)` for sessions with dual formats.
   - Add a highlighted badge `Скидка 20% после БП` on `energy-alignment`.
4. **Centralize Contact References**: Ensure `PortalFooter.tsx` imports and uses `MANAGER_INFO` from `alinaPricing.ts`.

---

## 5. Verification Method

To independently reproduce and verify all findings:

1. **Verify Lint & Build**:
   ```bash
   cd /Users/mcv/Documents/book
   npm run lint     # Expect 0 errors, 0 warnings
   npm run build    # Expect code 0, 5 chunks emitted in dist/
   ```
2. **Inspect Booking Link in `ServiceModal.tsx`**:
   ```bash
   # Check line 101 for t.me/share/url
   grep -n "t.me/share" src/components/ServiceModal.tsx
   ```
3. **Inspect Session Count & Pricing Integrity**:
   Verify that `src/data/alinaPricing.ts` exports 16 sessions distributed across the 3 blocks:
   - `taro-matrix`: 5 sessions
   - `soul-archetypes`: 6 sessions
   - `energy-ritual`: 5 sessions
4. **Verify Fonts and CSS Variables**:
   Inspect `index.html` lines 8-10 for Google Fonts `Cormorant Garamond` and `src/App.css` lines 1-25 for `:root` luxury color definitions.
