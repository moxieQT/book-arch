# BRIEFING — 2026-09-23T17:21:15Z

## Mission
Investigate codebase architecture, dependencies, framework, components, styling, booking CTAs, and file layout boundaries for requirements R1, R2, and R4.

## 🔒 My Identity
- Archetype: explorer
- Roles: codebase architecture and component explorer
- Working directory: /Users/mcv/Documents/book/.agents/explorer_survey_2
- Original parent: c770c026-d28f-442a-9135-04b3e7c34258
- Milestone: codebase architecture survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify project code
- STRICT LOCAL GIT ONLY: NEVER run git push or publish to remote
- Write metadata files ONLY in /Users/mcv/Documents/book/.agents/explorer_survey_2

## Current Parent
- Conversation ID: c770c026-d28f-442a-9135-04b3e7c34258
- Updated: not yet

## Investigation State
- **Explored paths**: package.json, vite.config.ts, tsconfig.json, index.html, src/App.tsx, src/App.css, src/index.css, src/components/*, src/data/*, src/store/useBookStore.ts, src/three/*, alina_skills.md, docs/alina_skills.md
- **Key findings**:
  1. Vite 8 + React 19 SPA with Rolldown bundler; NOT Next.js.
  2. Styling uses pure CSS with CSS custom variables (no Tailwind). Cormorant Garamond loaded via Google Fonts.
  3. All 16 individual sessions (3 blocks) and 7 group programs + 3D book card are implemented in data files and rendered.
  4. Maria's booking links are active in PricingSection and PortalFooter, but ServiceModal has an outdated generic link.
  5. Interactive query navigator and tarot question bank exist in PricingSection. Medical disclaimer and surcharge badges need inclusion.
  6. `npm run lint` and `npm run build` both pass with 0 errors.
- **Unexplored areas**: None for survey scope.

## Key Decisions Made
- Confirmed SPA architecture and hash routing (`#book`) for seamless 3D book integration.
- Documented precise gap in ServiceModal booking CTA and missing medical disclaimer for the implementation phase.

## Artifact Index
- /Users/mcv/Documents/book/.agents/explorer_survey_2/DISPATCH.md — incoming dispatch records
- /Users/mcv/Documents/book/.agents/explorer_survey_2/BRIEFING.md — persistent working memory
- /Users/mcv/Documents/book/.agents/explorer_survey_2/progress.md — liveness heartbeat
- /Users/mcv/Documents/book/.agents/explorer_survey_2/handoff.md — final survey report

