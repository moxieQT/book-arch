# Dispatch: E2E Test Writer (M-TEST)

## Mission
Design and implement the comprehensive E2E test infrastructure and opaque-box test suite for Prototype 1 («Астральный Астролябий и Живой Гримуар»), derived strictly from user requirements and `PROJECT.md § Feature Inventory`. Publish `TEST_INFRA.md` and `TEST_READY.md` upon completion.

## Inputs
- Authoritative User Request: `/Users/mcv/Documents/book/.agents/ORIGINAL_REQUEST.md` (read this first!)
- Project Plan & Feature Inventory: `/Users/mcv/Documents/book/PROJECT.md`
- Spec Miner Report: `/Users/mcv/Documents/book/.agents/spec_miner_survey_3/handoff.md`
- Existing Test Files: `/Users/mcv/Documents/book/tests/e2e-portal-test.mjs`, `/Users/mcv/Documents/book/tests/prototype1-astrolabe-test.mjs`, `/Users/mcv/Documents/book/tests/challenger_stress_test.mjs`

## Exclusively Owned Files
- `/Users/mcv/Documents/book/TEST_INFRA.md`
- `/Users/mcv/Documents/book/TEST_READY.md`
- `/Users/mcv/Documents/book/tests/e2e-portal-test.mjs`
- Any new test files under `/Users/mcv/Documents/book/tests/`
DO NOT modify any implementation files under `src/`!

## Mandatory Guidelines
1. Build upon the 4-tier methodology (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial Testing, Real-World Workload Testing).
2. Ensure full test coverage for all 40 features in `PROJECT.md § Feature Inventory`.
3. Include tests for:
   - Continuous Canvas WebGL existence & persistence (no unmounting)
   - Kinetic scroll controller properties (normalized range [0.0, 1.0], velocity)
   - Astrolabe PBR rings (`metalness: 0.96, roughness: 0.12, anisotropy: 0.85`)
   - Optical crystal physical dispersion (`transmission: 0.98, ior: 1.54, dispersion: 0.06`) and Cauchy GLSL tokens
   - 15,000 ether particles with GPU Curl noise and mobile LOD scaling
   - 4 scroll transformation phases (0-25%, 25-60%, 60-85%, 85-100%)
   - French Light Luxury palette tokens (`#F4EFE6`, `#C6A76B`, `#5C192E`, `#201C24`) and elimination of dark backgrounds
   - VRAM budget threshold (< 40 MB)
   - 432 Hz generative spatial soundscape with scroll velocity filter modulation and header toggle with localStorage
   - Full preservation of 16 individual sessions, 7 group practices, Manager Maria contact URLs (@maria_anima, +7 915 214 9560), RF LegalRiskChecker (14 rules, score 0-100), and 13 arcana chapters.
4. Publish `TEST_INFRA.md` with methodology, feature mapping, and runner command.
5. Publish `TEST_READY.md` summarizing the test suite coverage and execution command.
6. Verify tests run cleanly with Node.js and report results in `handoff.md`.

## 2026-09-23T19:18:00Z
<USER_REQUEST>
You are the E2E Test Writer (M-TEST).
Your working directory is: /Users/mcv/Documents/book/.agents/test_writer_mtest
Read your dispatch instructions at: /Users/mcv/Documents/book/.agents/test_writer_mtest/DISPATCH.md
Read the authoritative user request at: /Users/mcv/Documents/book/.agents/ORIGINAL_REQUEST.md (read this first!).
Read PROJECT.md at /Users/mcv/Documents/book/PROJECT.md and the Spec Miner inventory at /Users/mcv/Documents/book/.agents/spec_miner_survey_3/handoff.md.

Exclusively owned files:
- /Users/mcv/Documents/book/TEST_INFRA.md
- /Users/mcv/Documents/book/TEST_READY.md
- /Users/mcv/Documents/book/tests/e2e-portal-test.mjs
- Any new test files under /Users/mcv/Documents/book/tests/
DO NOT modify any implementation code under src/!

Tasks:
1. Design and write TEST_INFRA.md using the 4-tier methodology (Category-Partition, BVA, Pairwise, Workload Scenarios) covering all 40 features in PROJECT.md.
2. Upgrade/expand tests/e2e-portal-test.mjs and related suites so that all 40 features are verified across Tiers 1-4 with >=5 tests per feature.
3. Validate Continuous Canvas persistence, kinetic scroll progress [0.0, 1.0], Three.js 0.185.1 PBR ring properties, dispersion, 15,000 particles, 4 scroll phases, French Light Luxury palette, VRAM <40 MB, 432 Hz audio, 16 sessions, 7 programs, Maria contacts, LegalRiskChecker, 13 arcana chapters.
4. Execute the tests and confirm passing results.
5. Publish TEST_READY.md at project root with summary and execution command.
6. Write your comprehensive handoff report to /Users/mcv/Documents/book/.agents/test_writer_mtest/handoff.md and notify via send_message.
</USER_REQUEST>
