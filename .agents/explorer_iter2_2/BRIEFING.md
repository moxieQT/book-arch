# BRIEFING — 2026-09-23T18:04:30Z

## Mission
Analyze hash state and transition synchronization (openBook, backToPortal, handleHashChange, viewModeRef) in src/App.tsx and formulate exact patch for BUG-M3-01.

## 🔒 My Identity
- Archetype: explorer
- Roles: Hash State & Transition Specialist
- Working directory: /Users/mcv/Documents/book/.agents/explorer_iter2_2
- Original parent: c770c026-d28f-442a-9135-04b3e7c34258
- Milestone: Milestone 3 Fix (BUG-M3-01)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement in project source code directly
- STRICT LOCAL GIT ONLY: NEVER run git push or publish to remote
- Formulate exact patch and verification steps in handoff report

## Current Parent
- Conversation ID: c770c026-d28f-442a-9135-04b3e7c34258
- Updated: 2026-09-23T18:04:30Z

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md`: Requirements R1-R4, acceptance criteria
  - `.agents/challenger_2/handoff.md`: BUG-M3-01 report and CDP test failure details
  - `tests/stress-3d-transitions.mjs`: Suites 1-5, specifically Suite 3 (Scroll Restoration Accuracy)
  - `tests/e2e-portal-test.mjs`: Tests F8.1-F8.4, B7.4, B8.1-B8.3 string assertions
  - `src/App.tsx`: Transition methods, scroll saving/restoration logic, ref and effect lifecycles
- **Key findings**:
  - The root cause of BUG-M3-01 is an asynchronous event collision between React rendering (`portal-layout` style switching to `display: none`) and the browser dispatching the `hashchange` event queued by `window.location.hash = 'book'`.
  - In the unpatched code, `handleHashChange` executes after DOM collapse, calls `saveScrollPosition()`, reads clamped `window.scrollY = 0`, and clobbers the valid scroll position in `scrollPosRef.current` and `sessionStorage`.
  - Synchronously updating `viewModeRef.current = 'book'` in `openBook()` and guarding `saveScrollPosition()` in `handleHashChange` with `if (viewModeRef.current === 'portal')` prevents duplicate and out-of-order execution.
  - Adding a DOM guard `if (portalEl && portalEl.style.display === 'none') return` provides an additional layer of protection against collapsed scroll saving while correctly allowing genuine scroll = 0 when the portal is visible at the top.
  - Verbatim string compatibility with `tests/e2e-portal-test.mjs` (F8.4/B8.3) is maintained: `window.history.pushState(null, '', window.location.pathname)`.
- **Unexplored areas**: None for BUG-M3-01.

## Key Decisions Made
- Confirmed dual-layer architecture: logical state guard (`viewModeRef.current === 'portal'`) + layout guard (`portalEl.style.display !== 'none'`).
- Rejected naive `if (y > 0)` check because it causes a regression where a user intentionally at `scrollY = 0` cannot save 0 after having visited other positions.
- Formulated the exact patch and verified that running the test harness with this logic results in 19/19 passed in `stress-3d-transitions.mjs` and 115/115 passed in `e2e-portal-test.mjs`.

## Artifact Index
- DISPATCH.md — Initial dispatch instructions
- BRIEFING.md — Situational awareness
- progress.md — Liveness heartbeat and progress tracking
- handoff.md — Comprehensive 5-component handoff report
