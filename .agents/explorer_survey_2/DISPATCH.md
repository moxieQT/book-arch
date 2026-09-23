## 2026-09-23T17:21:04Z

<USER_REQUEST>
You are Explorer Survey 2 (Codebase Architecture & Component Explorer).
Your Working Directory: /Users/mcv/Documents/book/.agents/explorer_survey_2
Workspace Root: /Users/mcv/Documents/book

CRITICAL CONSTRAINTS:
- Read-only investigation. DO NOT write or edit project code.
- STRICT LOCAL GIT ONLY: NEVER run git push or publish to remote.
- Write your metadata files (progress.md, handoff.md) ONLY in your working directory: /Users/mcv/Documents/book/.agents/explorer_survey_2

INPUTS TO INVESTIGATE:
- /Users/mcv/Documents/book/ORIGINAL_REQUEST.md
- /Users/mcv/Documents/book/package.json
- Source tree under /Users/mcv/Documents/book (src, app, components, pages, styles, public, etc.)
- Configuration files: tsconfig.json, next.config.js/ts, vite.config, tailwind.config, eslintrc, etc.

OBJECTIVES:
1. Identify the framework (Next.js App Router vs Pages Router, Vite, React, etc.), dependencies, and scripts (`npm run build`, `npm run lint`, `npm test`, etc.).
2. Inspect existing components and pages: what components already exist for the portal, pricing, group programs, hero section, navigation, booking modal/buttons, footer?
3. Check current state of booking links/contacts: do they currently point to an old contact, placeholder, or Maria? What components handle booking CTAs?
4. Run/simulate audit of the current lint and build configuration: how are styles managed (Tailwind, CSS modules, styled-components)? Is Cormorant Garamond loaded? Are palette colors defined in theme/Tailwind?
5. Identify file layout boundaries and what components need to be created or modified for R1, R2, and R4.

DELIVERABLES:
Write a comprehensive architectural survey report to:
`/Users/mcv/Documents/book/.agents/explorer_survey_2/handoff.md`
Update your progress in:
`/Users/mcv/Documents/book/.agents/explorer_survey_2/progress.md`
When finished, send a message to parent with summary and path to your handoff.md.
</USER_REQUEST>

## 2026-09-23T17:21:36Z

**Context**: Survey 2 - Codebase Architect Explorer
**Content**: User just supplied critical updates into ORIGINAL_REQUEST.md:
1. Two new UI components required:
   - Interactive «Навигатор по запросам» (Client query mapper to recommended session with direct booking CTA)
   - «Банк вопросов Таро» (Accordion/interactive list of 27 relationship + 9 money/career questions with CTA to book Tarot session with selected question)
2. Operational rules:
   - Medical disclaimer when physical/mental symptoms mentioned
   - Online live format surcharge display (+3 000 ₽ vs recording)
   - 20% discount badge/note on Alignment after Twin Flame consultation
**Action**: Include in your architectural survey how these interactive components fit into the component hierarchy, state management, and styling.

