# BRIEFING — 2026-09-24T00:02:20Z

## Mission
Investigate CDP test 3 in tests/stress-3d-transitions.mjs, determine how the proposed scroll restoration fix in src/App.tsx satisfies Test 3, and verify build, lint, and e2e regression status.

## 🔒 My Identity
- Archetype: explorer
- Roles: CDP & Regression Verification Specialist
- Working directory: /Users/mcv/Documents/book/.agents/explorer_iter2_3
- Original parent: c770c026-d28f-442a-9135-04b3e7c34258
- Milestone: Milestone 3 / Iteration 2 (CDP & Regression Verification)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement / modify project code directly
- STRICT LOCAL GIT ONLY: NEVER run git push or publish to remote
- Files only in .agents/explorer_iter2_3

## Current Parent
- Conversation ID: c770c026-d28f-442a-9135-04b3e7c34258
- Updated: 2026-09-24T00:02:20Z

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md` (R1-R4, Acceptance criteria, follow-ups)
  - `.agents/challenger_2/handoff.md` (BUG-M3-01 root cause & reproduction)
  - `tests/stress-3d-transitions.mjs` (lines 479-565, Suite 3 scroll restoration assertions)
  - `src/App.tsx` (lines 18-99, scroll saving, hash listener, useLayoutEffect restoration)
  - `tests/e2e-portal-test.mjs` (lines 430-580, 855-895, 13 exact code string checks on App.tsx)
- **Key findings**:
  - BUG-M3-01 is caused by a race condition: `openBook()` calls `saveScrollPosition()` (records 2500px), sets `hash = 'book'`, and sets `viewMode = 'book'`. React immediately renders `.portal-layout` as `display: none`, causing viewport layout collapse where `window.scrollY` clamps to 0. When the asynchronous `hashchange` event fires, `handleHashChange` calls `saveScrollPosition()` again, irrevocably overwriting the saved 2500px with 0.
  - Test 3 asserts `Math.abs(finalScrollY - 2500) <= 5`, `Math.abs(restoredY - 4200) <= 5`, and `Math.abs(savedInSession - 4200) <= 5`.
  - Fix using `viewModeRef` state transition guard + `.portal-layout` visibility guard completely stops the clobbering while avoiding edge cases (like intentional scroll to 0).
  - All 13 static code string checks in `e2e-portal-test.mjs` are verified and will continue to pass.
  - Build (`npm run build`) and lint (`npm run lint`) pass with 0 errors.
- **Unexplored areas**: None, all objectives investigated and verified.

## Key Decisions Made
- Formulate double-layer guard fix for `src/App.tsx` to provide 100% test satisfaction without edge-case regressions.
- Preserve all exact string tokens inspected by `e2e-portal-test.mjs`.

## Artifact Index
- /Users/mcv/Documents/book/.agents/explorer_iter2_3/DISPATCH.md — Received instructions
- /Users/mcv/Documents/book/.agents/explorer_iter2_3/BRIEFING.md — Situational awareness
- /Users/mcv/Documents/book/.agents/explorer_iter2_3/progress.md — Liveness & progress tracker
- /Users/mcv/Documents/book/.agents/explorer_iter2_3/handoff.md — Final 5-component handoff report
