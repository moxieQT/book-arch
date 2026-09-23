# BRIEFING — 2026-09-23T18:01:30Z

## Mission
Analyze why saveScrollPosition() clobbers saved scroll offset with 0 during hash change in App.tsx and formulate exact patch for BUG-M3-01.

## 🔒 My Identity
- Archetype: explorer
- Roles: Scroll Restoration & Lifecycle Specialist
- Working directory: /Users/mcv/Documents/book/.agents/explorer_iter2_1
- Original parent: c770c026-d28f-442a-9135-04b3e7c34258
- Milestone: Milestone 3 Fix (BUG-M3-01)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- STRICT LOCAL GIT ONLY: NEVER run git push or publish to remote
- Mandatory reading: /Users/mcv/Documents/book/ORIGINAL_REQUEST.md

## Current Parent
- Conversation ID: c770c026-d28f-442a-9135-04b3e7c34258
- Updated: 2026-09-23T18:01:30Z

## Investigation State
- **Explored paths**: `src/App.tsx`, `tests/stress-3d-transitions.mjs`, `tests/e2e-portal-test.mjs`, `.agents/challenger_2/handoff.md`, `ORIGINAL_REQUEST.md`.
- **Key findings**:
  1. Root cause verified empirically: When transitioning to `#book`, `openBook()` sets `window.location.hash = 'book'` and `setViewMode('book')`. React applies `display: 'none'` to `.portal-layout`, collapsing scroll height to viewport height and clamping `window.scrollY` to 0.
  2. The browser asynchronously delivers the `hashchange` event. `handleHashChange` in `App.tsx` fires and unconditionally invokes `saveScrollPosition()` a second time while `.portal-layout` is hidden, capturing `window.scrollY === 0` and overwriting `scrollPosRef.current` and `sessionStorage.getItem('alina_portal_scroll_y')` with 0.
  3. Upon returning to the portal (`backToPortal`), `useLayoutEffect` reads the clobbered value (0) and fails to restore the user's scroll offset.
  4. Proposed a dual-layer defense: (a) track view mode synchronously via `viewModeRef` so `handleHashChange` only triggers `saveScrollPosition()` when transitioning FROM portal (`viewModeRef.current === 'portal'`), and (b) guard inside `saveScrollPosition()` against reading/saving scroll offsets when `.portal-layout` is hidden (`display: none`) or when in `'book'` mode.
- **Unexplored areas**: None. Root cause, mechanics, edge cases, and verification steps fully analyzed.

## Key Decisions Made
- Confirmed that `saveScrollPosition()` must not use a naive `if (y > 0)` check alone because legitimate returns to `y = 0` (top of page) would become "sticky" and retain stale non-zero offsets from earlier sessions. Instead, DOM visibility (`portalEl.style.display !== 'none'`) and state machine ref (`viewModeRef.current === 'portal'`) must be checked.
- Prepared `.patch` file: `app-scroll-fix.patch`.

## Artifact Index
- DISPATCH.md — Initial dispatch log
- BRIEFING.md — Persistent context
- progress.md — Liveness heartbeat
- app-scroll-fix.patch — Proposed unified diff for src/App.tsx
- handoff.md — Final investigation report
