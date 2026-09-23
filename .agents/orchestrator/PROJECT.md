# Project: Alina Energy Healing Web Portal & 3D Book

## Architecture
- **Framework & Engine**: Vite 8.2.2 + React 19.2.8 SPA with custom Rolldown chunk splitting (`three`, `react-vendor`, `arcana-texts`).
- **Routing & State**: URL Hash routing (`#` / empty for portal, `#book` for 3D Book). Zustand (`src/store/bookStore.ts`) for reading progress and active spread.
- **3D Graphics Engine**: Pure Three.js (`src/components/book3d/engine/BookScene.ts`), custom vertex curling shaders, procedural high-res canvas textures (1400x1880).
- **Styling & Design System (R4)**: Luxury Art-Book aesthetic in `src/App.css` and `src/index.css` using CSS custom properties:
  - Ivory background: `#F4EFE6`
  - Gold accent: `#C6A76B`
  - Imperial wine: `#5C192E`
  - Deep graphite / ink: `#201C24`
  - Sacred geometry gold dividers and vignettes, deboss effects, Cormorant Garamond typography.
- **Booking Flow**: All booking CTAs route to manager Maria (@maria_anima, +7 915 214 9560) via Telegram and WhatsApp with prefilled messages and Alina's endorsement quote.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Full 16-Session Price List (R1) | 3 blocks: Таро/Отношения/Матрица, Душа/Архетипы/Женская сила, Энергетика/Ритуалы/Сопровождение with exact tariffs and prices | M2 | ORIGINAL_REQUEST §R1 |
| 2 | Catalog of 7 Group Author Directions (R2) | Complete 7 programs with formats, badges, quotes, modal details, matching alina_skills.md | M2 | ORIGINAL_REQUEST §R2 |
| 3 | Interactive «Навигатор по запросам» | Dynamic selector mapping 14 user states to recommended sessions with direct booking CTA | M2 | Follow-up 17:21 |
| 4 | «Банк вопросов Таро» | Accordion/list with 36 ready questions (27 relationships + 9 money) with direct booking CTA | M2 | Follow-up 17:21 |
| 5 | Operational & Safety Rules UI | Medical disclaimer block, online format surcharge badge (+3 000 ₽), 20% Twin Flame alignment discount | M2 | Follow-up 17:21 |
| 6 | Manager Maria Booking Link Fixes | Fix `ServiceModal.tsx` CTA from t.me/share to Maria direct Telegram/WhatsApp, centralize `MANAGER_INFO` | M1 | Survey 1 & 2 findings |
| 7 | Seamless 3D Book Transition (R3) | `#book` hash routing, top return bar «← К практикам Алины», scroll restoration, clean history, keyboard shortcuts | M3 | ORIGINAL_REQUEST §R3 |
| 8 | 3D Book Asset & Font Hardening (R3) | Font load readiness (`document.fonts.ready`), cover date sync with localStorage birthDate | M3 | Survey 3 findings |
| 9 | Luxury Art-Book Aesthetic (R4) | Responsive layout, gold vignettes, dividers, palette #F4EFE6, #C6A76B, #5C192E, #201C24, Cormorant Garamond | M2, M3 | ORIGINAL_REQUEST §R4 |
| 10 | Legal Compliance (RF) | LegalRiskChecker, dictionary stop-words replacement, 18+ medical disclaimer in footer, audit button | M2 | Follow-up 17:28 |
| 11 | Quality Gate Verification | `npm run lint` with 0 errors, `npm run build` with 0 errors, all acceptance criteria verified | M4 | ORIGINAL_REQUEST Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Manager Booking Contact Fixes | Fix `ServiceModal.tsx` booking CTA to direct to Maria (@maria_anima / +7 915 214 9560) with prefilled text and WhatsApp option, sync with `alinaPricing.ts` | none | IN_PROGRESS |
| M2 | Pricing, Navigator, Regulations & Aesthetic Polish | Add Medical Disclaimer, online surcharge badge (+3 000 ₽), 20% Twin Flame discount badge, verify 16 sessions and 36 Tarot questions, ensure R4 styling | M1 | PLANNED |
| M3 | 3D Book Transition & State Hardening | Enhance `App.tsx` and `BookNavbarOverlay.tsx`: scroll position preservation, history state, cover date sync, font synchronization, Esc key return | M1 | PLANNED |
| M4 | Comprehensive E2E Testing & Acceptance Gate | End-to-end tests for all 10 inventoried features, build/lint checks, final verification | M1, M2, M3 | PLANNED |

## Interface Contracts
### `src/data/alinaPricing.ts` ↔ `src/components/ServiceModal.tsx`
- `MANAGER_INFO`:
  ```ts
  export const MANAGER_INFO = {
    name: 'Мария',
    role: 'Менеджер мастера Алины',
    telegram: '@maria_anima',
    telegramUrl: 'https://t.me/maria_anima',
    phone: '+7 915 214 9560',
    whatsappUrl: 'https://wa.me/79152149560',
    quote: '«Мария — моя правая рука во всех рабочих вопросах, поэтому смело описывайте ей свою ситуацию...»'
  };
  ```
- `ServiceModal.tsx` imports and uses `MANAGER_INFO` to render direct Telegram and WhatsApp booking buttons with pre-filled encoded text.

### `src/App.tsx` ↔ `src/components/book3d/BookNavbarOverlay.tsx`
- State preservation: When switching from portal to `#book`, `window.scrollY` is saved to memory/sessionStorage. When returning from `#book` via «← К практикам Алины», history hash is cleared and scroll position is restored smoothly.

## Code Layout
- `src/data/alinaPricing.ts`: Sessions data, tariffs, manager info, navigator mapping, Tarot questions.
- `src/data/alinaServices.ts`: 7 group programs + 3D book data.
- `src/components/PricingSection.tsx`: Pricing tables, navigator, Tarot bank, manager card, disclaimer.
- `src/components/ServiceModal.tsx`: Service detail modal with booking buttons.
- `src/components/PortalHeader.tsx` & `PortalFooter.tsx`: Header & footer with navigation and contacts.
- `src/components/book3d/BookNavbarOverlay.tsx`: Return bar «← К практикам Алины».
- `src/App.tsx`: Top-level view switcher and hash listener.
- `src/App.css` & `src/index.css`: Luxury aesthetic styling, tokens, and typography.
