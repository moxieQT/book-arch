## 2026-09-23T17:57:52Z
You are Explorer Iteration 2 - 1 (Scroll Restoration & Lifecycle Specialist).
Your Working Directory: /Users/mcv/Documents/book/.agents/explorer_iter2_1
Workspace Root: /Users/mcv/Documents/book

CRITICAL CONSTRAINTS:
- Read-only exploration. DO NOT modify project code directly.
- STRICT LOCAL GIT ONLY: NEVER run git push or publish to remote.
- Mandatory reading: /Users/mcv/Documents/book/ORIGINAL_REQUEST.md

FAILURE REPORT TO INVESTIGATE:
- /Users/mcv/Documents/book/.agents/challenger_2/handoff.md (Details on BUG-M3-01)
- /Users/mcv/Documents/book/tests/stress-3d-transitions.mjs
- /Users/mcv/Documents/book/src/App.tsx

OBJECTIVES:
1. Analyze why `saveScrollPosition()` in `src/App.tsx` gets invoked a second time during hash change when `.portal-layout` is already hidden (`display: none`), clobbering the saved scroll offset with 0.
2. Formulate the exact, minimal, robust patch for `src/App.tsx` to fix `BUG-M3-01`.
3. Provide line-by-line before/after code blocks and verification steps.
Write handoff report to:
`/Users/mcv/Documents/book/.agents/explorer_iter2_1/handoff.md`
Send message to parent when completed.
