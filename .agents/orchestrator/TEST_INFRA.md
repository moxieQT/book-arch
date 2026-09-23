# E2E Test Infra: Alina Energy Healing Web Portal & 3D Book

## Test Philosophy
- Opaque-box, requirement-driven verification derived directly from `ORIGINAL_REQUEST.md` and user updates.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinations + Real-World Workload Testing.
- Strict isolation: tests run against built artifacts or DOM test harnesses without modifying source code.

## Feature Inventory & Test Mapping
| # | Feature | Source | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Scenario) |
|---|---------|--------|:----------------:|:-----------------:|:---------------------:|:-----------------:|
| 1 | 16 Individual Sessions & Pricing | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | 7 Group Directions & alina_skills.md | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 3 | «Навигатор по запросам» | Follow-up 17:21 | 5 | 5 | ✓ | ✓ |
| 4 | «Банк вопросов Таро» (36 Qs) | Follow-up 17:21 | 5 | 5 | ✓ | ✓ |
| 5 | Operational & Safety Rules (Doctor, +3k, 20% BP) | Follow-up 17:21 | 5 | 5 | ✓ | ✓ |
| 6 | Manager Maria Contacts & CTAs | ORIGINAL_REQUEST Constraints | 5 | 5 | ✓ | ✓ |
| 7 | 3D Book Transition & Return Bar | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 8 | 3D Book State & Hash Handling | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 9 | Luxury Art-Book Aesthetics & Palette | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 10 | Legal Compliance & Disclaimers | Follow-up 17:28 | 5 | 5 | ✓ | ✓ |
| 11| Lint & Build Zero Errors | Acceptance Criteria | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner**: Node.js automated test script (`node tests/e2e-portal-test.mjs` or Playwright / Vitest / custom verification runner).
- **Pass/Fail Semantics**: All test assertions must pass with exit code 0.
- **Directory Layout**:
  - `tests/` directory at workspace root for test scripts and verification suites.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Expected Outcome |
|---|----------|--------------------|------------------|
| 1 | User seeks relationship clarity: navigates to Tarot or Twin Flames, selects question from Bank, clicks booking CTA | F1, F3, F4, F6 | Maria Telegram link generated with correct encoded question and session name |
| 2 | User enters with physical symptoms: opens Navigator, selects physical exhaustion or symptoms | F3, F5, F6 | Medical disclaimer clearly visible, advises consulting specialized doctor |
| 3 | User switches between Portal and 3D Book: clicks Book Banner -> `#book` loads, interacts with book, clicks «← К практикам Алины» | F7, F8, F9 | Seamless transition, scroll position preserved, no WebGL crashes, URL hash updated |
| 4 | User inspects group programs: opens modal for "Вокальная терапия" and "Таро 5D" | F2, F6, F9 | Full description, badges, and Maria booking buttons with prefilled text |
| 5 | Mobile visitor tests responsive layout & aesthetics | F9, F10 | Palette colors (#F4EFE6, #C6A76B, #5C192E, #201C24) and fonts render without horizontal overflow |

## Coverage Thresholds
- Tier 1: ≥5 per feature (50 tests total)
- Tier 2: ≥5 boundary/corner tests per feature (50 tests total)
- Tier 3: Pairwise combination tests (≥10 major interaction pairs)
- Tier 4: ≥5 realistic application scenarios
- **Total Minimum**: ≥115 automated assertions / test cases
