# BRIEFING — 2026-09-23T17:31:00Z

## Mission
Analyze and design exact code changes for 3D Book transition, scroll restoration, clean hash navigation, Escape key handler, birthdate cover sync, and font loading texture synchronization.

## 🔒 My Identity
- Archetype: explorer
- Roles: [investigation, synthesis]
- Working directory: /Users/mcv/Documents/book/.agents/explorer_m1_3
- Original parent: c770c026-d28f-442a-9135-04b3e7c34258
- Milestone: M1 - 3D Book Transition & State Hardening

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- STRICT LOCAL GIT ONLY: NEVER run git push
- Exact proposal with before/after snippets and verification plan

## Current Parent
- Conversation ID: c770c026-d28f-442a-9135-04b3e7c34258
- Updated: 2026-09-23T17:31:00Z

## Investigation State
- **Explored paths**:
  - `src/App.tsx`: ViewMode switcher, hash listener, scroll state loss, pushState history trapping.
  - `src/components/BookNavbarOverlay.tsx`: Return button «← К практикам Алины», display badges.
  - `src/three/BookStage.tsx`: Mount lifecycle, uncoordinated dual buildBook calls, race conditions without fonts.ready.
  - `src/three/bookScene.ts`: Hardcoded `draftDate = {day: 2, month: 4, year: 1994}`, lack of store/localStorage sync, lack of instant `jumpToSpread`.
  - `src/three/luxuryTextures.ts`: Procedural canvas generation with Cormorant Garamond font dependencies.
  - `src/store/useBookStore.ts`: `DATE_STORAGE_KEY` vs `alina_matrix_birthdate` support.
  - `index.html`: Google Fonts webfont loading link.
- **Key findings**:
  1. Portal unmounting destroys `window.scrollY` and component states in `PricingSection`.
  2. `window.history.pushState` when returning from `#book` causes history ping-pong and drops query params.
  3. No `Escape` key handler exists for returning to portal.
  4. `BookScene.draftDate` is hardcoded to 1994-04-02 and ignores `useBookStore.getState().birthDate` and `alina_matrix_birthdate`. Clicking "Открыть Врата" overwrites user date.
  5. Canvas textures draw before `document.fonts.ready`, baking fallback serif glyphs into 28 WebGL textures.
  6. On mount, `BookStage` performs dual `buildBook` repainting (56 canvas draws) and slow sequential flips.
- **Unexplored areas**: None for M1-3 scope.

## Key Decisions Made
- Designed non-destructive portal layout retention (`display: 'none'` + `aria-hidden`) combined with `scrollPosRef` and `sessionStorage` fallback.
- Designed clean history replacement (`replaceState(null, '', pathname + search)`) on return to portal.
- Designed `Escape` key event listener in `App.tsx` and keyboard navigation.
- Designed dual-key birthdate synchronization (`alina_matrix_birthdate` and `archetypes_birthdate_v03`) with flexible parser.
- Designed `document.fonts.ready` synchronization with timeout fallback in `BookStage.tsx` and `BookScene.syncDraftDateFromStore()`.

## Artifact Index
- DISPATCH.md — Recorded dispatch instructions
- BRIEFING.md — Situational awareness and state
- progress.md — Liveness heartbeat and step tracking
- handoff.md — Final 5-component report
