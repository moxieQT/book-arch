# Handoff Report: Pricing, Navigator, Regulations & Aesthetic Polish (M1-2)

**Author:** Explorer M1-2 (Pricing, Navigator & Regulations Specialist)  
**Date:** 2026-09-23T17:30:00Z  
**Target Milestone:** M2 (Pricing, Navigator, Regulations & Aesthetic Polish)  
**Parent Agent:** Orchestrator (`c770c026-d28f-442a-9135-04b3e7c34258`)

---

## 1. Observation

### 1.1. Codebase Baseline & Status
- **Repository Health:**
  - `npm run lint` (`oxlint`): 0 errors, 0 warnings across 32 files.
  - `npm run build` (`tsc -b && vite build`): Exit code 0, 5 chunks emitted in 167ms.
- **Git Restrictions:**
  - `remote.origin.pushurl = DISABLED`, pre-push hook active. Investigation was 100% read-only.

### 1.2. Pricing Component (`src/components/PricingSection.tsx`)
- Currently renders:
  - Header with tag, title, and subtitle (lines 57–66).
  - Manager card with Maria's contacts (@maria_anima, +7 915 214 9560) (lines 69–101).
  - Client query navigator chips (lines 104–123).
  - 3 block tabs (`taro-matrix`, `soul-archetypes`, `energy-ritual`) (lines 126–138).
  - Pricing grid rendering 16 session cards with options, pills, and booking CTA to Telegram (lines 142–240).
  - Tarot questions bank modal (36 questions: 27 relationships + 9 money) (lines 243–308).
  - Note at bottom (lines 310–319).
- **Missing Elements Identified:**
  1. *Medical Disclaimer:* No prominent medical/psychosomatic disclaimer banner exists within `PricingSection.tsx`. (Only a legal disclaimer exists in `PortalFooter.tsx` lines 104–116).
  2. *Live Online Format Surcharge:* No explicit visual badge for «Живой онлайн-формат (+3 000 ₽ к записи)» on dual-format session cards.
  3. *Twin Flame 20% Discount Callout:* Currently rendered only as plain text inside `session.bonus` without distinct visual emphasis, tariff comparison, or dedicated badges.

### 1.3. Pricing Data Model (`src/data/alinaPricing.ts`)
- All 16 individual sessions match `ORIGINAL_REQUEST.md` and `alina_skills.md` with 100% price accuracy.
- Dual-format sessions where online is exactly +3 000 ₽:
  1. `soul-journey` (Путешествие Души): 45m rec (15 000 ₽) vs 45m online (18 000 ₽); 60m rec (19 999 ₽) vs 60m online (22 999 ₽).
  2. `energy-alignment` (Энергетическое выравнивание): 35–40m rec (12 000 ₽) vs online (15 000 ₽).
  3. `quantum-cleansing` (Квантовое очищение + наполнение): 45–60m rec (12 000 ₽) vs online (15 000 ₽).
  4. `energy-complex` (Комплекс): ≈1.5h rec (22 000 ₽) vs online (25 000 ₽).
- Cross-session 20% discount applies to:
  - `twin-flames-consultation`: grants 20% discount on energy alignment for 14 days + free guide «11.11 — Код Единства».
  - `energy-alignment`: discounted price is 9 600 ₽ (rec, down from 12 000 ₽) and 12 000 ₽ (online, down from 15 000 ₽).
- `CLIENT_QUERY_NAVIGATOR`: Currently has 12 items. `ORIGINAL_REQUEST.md` (line 90) and `PROJECT.md` Feature 3 specify 14 customer states. Missing 2 states: «Подозрение на магию» (`magic-diagnosis-ritual`) and «Глубинный страх / Регрессия» (`regression-session`).

### 1.4. Legal Compliance Review
- Verified `docs/LEGAL_COMPLIANCE_RF.md`, `src/data/legalRules.ts`, `src/components/LegalRiskChecker.tsx`, and `src/components/PortalFooter.tsx`.
- Compliance engine correctly audits:
  - ФЗ № 323-ФЗ (medical treatment triggers).
  - ФЗ № 38-ФЗ (advertising regulations & tarot bills).
  - ст. 159 УК РФ (fraud prevention / no guaranteed future / no love spell claims).
  - ЗоЗПП (consumer protection).
- Minor styling enhancement: `.legal-modal` uses `#2AABEE` border instead of luxury `#C6A76B` gold border.

---

## 2. Logic Chain

1. **Regulatory Requirement & Customer Safety:**
   - Per `ORIGINAL_REQUEST.md` (line 93) and `alina_skills.md` (principle 5): *«При выраженных физических или психических симптомах клиенту строго рекомендуется обращение к профильным медицинским специалистам»*.
   - Placing an elegant Medical Disclaimer banner in `PricingSection.tsx` directly before the pricing tabs and grid establishes immediate trust, upholds Alina's ethical philosophy, and safeguards against regulatory scrutiny under ФЗ № 323-ФЗ and ФЗ № 38-ФЗ.
2. **Transparent Pricing for Live Online Sessions (+3 000 ₽):**
   - In 4 core practices (`soul-journey`, `energy-alignment`, `quantum-cleansing`, `energy-complex`), Alina offers personal online presence for an additional 3 000 ₽ over personal audio/video recording.
   - Highlighting this with a dedicated badge (`pricing-card__online-badge`) and mini-tags on the selector pills (`pricing-pill__online-tag`) eliminates client confusion and clarifies the value proposition.
3. **Cross-Selling & Client Retention (Twin Flame 20% Privilege):**
   - The 20% discount on energy alignment within 14 days of a Twin Flame consultation is a major conversion hook.
   - By creating a specialized dual-card callout (`pricing-card__special-callout`) on both `twin-flames-consultation` and `energy-alignment` with concrete price calculations (9 600 ₽ / 12 000 ₽) and booking instructions for Maria, clients immediately see their concrete savings.
4. **Complete 14-State Client Navigator:**
   - Expanding `CLIENT_QUERY_NAVIGATOR` from 12 to 14 entries fulfills Feature 3 in `PROJECT.md`, enabling quick routing for "magic diagnosis" (with note "чистку заранее не продавать") and "past-life regression".
5. **Aesthetic Consistency (R4 Luxury Art-Book):**
   - All newly proposed components utilize the established CSS tokens: `#F4EFE6` (ivory background), `#C6A76B` (gold border/glow), `#5C192E` (imperial wine velvet), `#201C24` (deep ink typography), and `Cormorant Garamond` serif font with delicate borders and double-line debossing.

---

## 3. Caveats

- **Scope Boundary:** This proposal provides exact code implementations ready for Milestone 2. In accordance with read-only rules, no source files were directly modified during M1.
- **WhatsApp vs Telegram:** All individual session booking links currently target manager Maria via Telegram (`tgBookingUrl`). A secondary WhatsApp link can be added if requested, though the primary Telegram CTA is fully functional and pre-populates session name and selected tariff.
- **Dynamic Pricing State:** Option selection is stored locally per session in `PricingSection.tsx` state (`selectedOptions`). Discount calculation display is informational; the final booking price is confirmed by manager Maria upon receiving the message.

---

## 4. Conclusion & Concrete Implementation Proposal

### Proposal A: Data Layer Updates (`src/data/alinaPricing.ts`)

#### 1. Interface Extension:
```ts
export interface SpecialDiscount {
  badge: string
  title: string
  description: string
  discountedOptions?: { label: string; discountedPrice: string; originalPrice: string }[]
  subtext?: string
  actionHint?: string
}

export interface IndividualSession {
  id: string
  title: string
  subtitle: string
  blockId: 'taro-matrix' | 'soul-archetypes' | 'energy-ritual'
  blockTitle: string
  description: string
  options: PricingOption[]
  bonus?: string
  note?: string
  isFeatured?: boolean
  queryTags?: string[]
  onlineUpgradeNote?: string // Added
  specialDiscount?: SpecialDiscount // Added
}
```

#### 2. Session Data Enhancements:
```ts
// 1. In 'twin-flames-consultation':
specialDiscount: {
  badge: '-20% на выравнивание',
  title: 'Привилегия после консультации БП',
  description: 'Скидка 20% на энергетическое выравнивание в течение 14 дней после консультации:',
  discountedOptions: [
    { label: 'Запись 35–40 мин', discountedPrice: '9 600 ₽', originalPrice: '12 000 ₽' },
    { label: 'Онлайн 35–40 мин', discountedPrice: '12 000 ₽', originalPrice: '15 000 ₽' }
  ],
  subtext: 'Включает бесплатный авторский гайд и аудиопрактику «11.11 — Код Единства»'
},

// 2. In 'soul-journey':
onlineUpgradeNote: 'Живой онлайн-формат (+3 000 ₽ к записи): 45 мин — 18 000 ₽ / 60 мин — 22 999 ₽',

// 3. In 'energy-alignment':
onlineUpgradeNote: 'Живой онлайн-формат (+3 000 ₽ к записи): 35–40 мин — 15 000 ₽',
specialDiscount: {
  badge: 'Скидка 20% по коду БП',
  title: 'Специальная цена после консультации БП',
  description: 'Скидка 20% на энергетическое выравнивание в течение 14 дней после консультации БП:',
  discountedOptions: [
    { label: 'Запись 35–40 мин', discountedPrice: '9 600 ₽', originalPrice: '12 000 ₽' },
    { label: 'Онлайн 35–40 мин', discountedPrice: '12 000 ₽', originalPrice: '15 000 ₽' }
  ],
  actionHint: 'Сообщите дату прохождения консультации БП менеджеру Марии при записи'
},

// 4. In 'quantum-cleansing':
onlineUpgradeNote: 'Живой онлайн-формат (+3 000 ₽ к записи): 45–60 мин — 15 000 ₽',

// 5. In 'energy-complex':
onlineUpgradeNote: 'Живой онлайн-формат (+3 000 ₽ к записи): ≈ 1,5 часа — 25 000 ₽',
```

#### 3. Complete 14-State Client Navigator (`CLIENT_QUERY_NAVIGATOR`):
Add the two missing entries:
```ts
  {
    label: 'Глубинный страх и регрессия',
    icon: '⏳',
    targetSessionId: 'regression-session',
    hint: 'Живое онлайн-погружение в память прошлых воплощений и возврат утраченного ресурса'
  },
  {
    label: 'Подозрение на магию',
    icon: '🛡️',
    targetSessionId: 'magic-diagnosis-ritual',
    hint: 'Объективное сканирование поля без предвзятости (чистку заранее не продавать)'
  }
```

---

### Proposal B: Component Additions (`src/components/PricingSection.tsx`)

#### 1. Medical Disclaimer Banner (inserted after `query-navigator` and before `pricing-blocks-tabs`):
```tsx
{/* Регламент безопасности и этика мастера: Медицинский дисклеймер */}
<div className="pricing-disclaimer-card" role="note" aria-label="Медицинский дисклеймер и правила безопасности">
  <div className="pricing-disclaimer-card__header">
    <div className="pricing-disclaimer-card__badge">
      <span className="pricing-disclaimer-card__icon">🌿</span>
      <span>Этика практик и регламент безопасности</span>
    </div>
    <span className="pricing-disclaimer-card__law-note">ФЗ № 323-ФЗ · 18+</span>
  </div>
  <div className="pricing-disclaimer-card__body">
    <p className="pricing-disclaimer-card__main-text">
      <strong>При выраженных физических или психосоматических симптомах мы настоятельно рекомендуем обратиться к профильному врачу.</strong>{' '}
      Авторские энергетические сессии, медитации, ченнелинг и разборы Алины направлены на гармонизацию психоэмоционального состояния, глубокую внутреннюю сонастройку и исследование архетипов сознания. Они носят духовно-познавательный характер, не являются медицинскими услугами и не заменяют врачебную диагностику и лечение.
    </p>
    <div className="pricing-disclaimer-card__chips">
      <span className="pricing-disclaimer-chip">✦ Бережное и экологичное ведение</span>
      <span className="pricing-disclaimer-chip">✦ Без навязывания догм и зависимости</span>
      <span className="pricing-disclaimer-chip">✦ Строго конфиденциально</span>
    </div>
  </div>
</div>
```

#### 2. Online Format Badge & Pill Tag (inside `filteredSessions.map`):
```tsx
{/* Бейдж живого онлайн-формата */}
{session.onlineUpgradeNote && (
  <div className="pricing-card__online-badge">
    <span className="pricing-card__online-badge-icon">🎙️</span>
    <div className="pricing-card__online-badge-text">
      <span className="pricing-card__online-badge-tag">Доступен живой онлайн:</span>
      <span>{session.onlineUpgradeNote}</span>
    </div>
  </div>
)}
```
And inside option pill rendering:
```tsx
<button
  key={opt.label}
  type="button"
  className={`pricing-pill ${isSelected ? 'pricing-pill--selected' : ''}`}
  onClick={() => handleSelectOption(session.id, idx)}
>
  <span className="pricing-pill__label-wrap">
    <span>{opt.label}</span>
    {opt.label.toLowerCase().includes('онлайн') && session.onlineUpgradeNote && (
      <span className="pricing-pill__online-tag">Живой онлайн</span>
    )}
  </span>
  <span className="pricing-pill__price">{opt.price}</span>
</button>
```

#### 3. Special Discount Callout (Twin Flame 20% Privilege):
```tsx
{session.specialDiscount && (
  <div
    className={`pricing-card__special-callout ${
      session.id === 'twin-flames-consultation'
        ? 'pricing-card__special-callout--wine'
        : 'pricing-card__special-callout--gold'
    }`}
  >
    <div className="pricing-card__special-header">
      <span className="pricing-card__special-icon">
        {session.id === 'twin-flames-consultation' ? '🔥' : '✨'}
      </span>
      <span className="pricing-card__special-title">{session.specialDiscount.title}</span>
      <span className="pricing-card__special-pill">{session.specialDiscount.badge}</span>
    </div>

    <p className="pricing-card__special-desc">
      {session.specialDiscount.description}
    </p>

    {session.specialDiscount.discountedOptions && (
      <div className="pricing-card__special-prices-grid">
        {session.specialDiscount.discountedOptions.map((dOpt) => (
          <div key={dOpt.label} className="pricing-card__special-price-item">
            <span className="pricing-card__special-price-label">{dOpt.label}:</span>
            <span className="pricing-card__special-price-val">
              <strong>{dOpt.discountedPrice}</strong>
              <span className="pricing-card__special-price-orig">({dOpt.originalPrice})</span>
            </span>
          </div>
        ))}
      </div>
    )}

    {session.specialDiscount.subtext && (
      <div className="pricing-card__special-sub">{session.specialDiscount.subtext}</div>
    )}
    {session.specialDiscount.actionHint && (
      <div className="pricing-card__special-hint">{session.specialDiscount.actionHint}</div>
    )}
  </div>
)}
```

---

### Proposal C: CSS Stylesheet Additions (`src/App.css`)

```css
/* ==========================================================================
   Pricing Medical Disclaimer Banner (R4 Luxury Art-Book)
   ========================================================================== */
.pricing-disclaimer-card {
  background: linear-gradient(135deg, rgba(255, 253, 248, 0.96) 0%, rgba(246, 239, 226, 0.92) 100%);
  border: 1px solid var(--gold);
  border-radius: 12px;
  padding: 24px 30px;
  margin: 0 auto 38px;
  max-width: 960px;
  text-align: left;
  box-shadow: 0 4px 20px rgba(198, 167, 107, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
}

.pricing-disclaimer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--gold) 0%, var(--wine) 100%);
}

.pricing-disclaimer-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.pricing-disclaimer-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-serif);
  font-size: 0.88rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--wine);
  font-weight: 700;
}

.pricing-disclaimer-card__icon {
  font-size: 1.2rem;
  line-height: 1;
}

.pricing-disclaimer-card__law-note {
  font-size: 0.82rem;
  color: var(--gold-dark);
  font-weight: 600;
  letter-spacing: 0.06em;
}

.pricing-disclaimer-card__main-text {
  font-size: 1.02rem;
  line-height: 1.6;
  color: var(--ink);
  margin: 0 0 16px;
}

.pricing-disclaimer-card__main-text strong {
  color: var(--wine);
  font-weight: 600;
}

.pricing-disclaimer-card__chips {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pricing-disclaimer-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(198, 167, 107, 0.12);
  border: 1px solid rgba(198, 167, 107, 0.35);
  border-radius: 14px;
  font-family: var(--font-serif);
  font-size: 0.88rem;
  color: #48361B;
  letter-spacing: 0.02em;
}

/* ==========================================================================
   Live Online Format Badges (+3 000 ₽)
   ========================================================================== */
.pricing-card__online-badge {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(198, 167, 107, 0.1);
  border: 1px dashed var(--gold);
  border-radius: 8px;
  margin-bottom: 14px;
  font-size: 0.92rem;
  line-height: 1.45;
  color: #3E3220;
}

.pricing-card__online-badge-icon {
  font-size: 1.15rem;
  color: var(--gold-dark);
  flex-shrink: 0;
  margin-top: 1px;
}

.pricing-card__online-badge-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pricing-card__online-badge-tag {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wine);
}

.pricing-pill__label-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pricing-pill__online-tag {
  font-size: 0.74rem;
  padding: 1px 6px;
  background: var(--wine);
  color: #FAF6EE;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

/* ==========================================================================
   Twin Flame 20% Special Privilege Callout
   ========================================================================== */
.pricing-card__special-callout {
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
  position: relative;
  box-shadow: 0 2px 10px rgba(92, 25, 46, 0.06);
}

.pricing-card__special-callout--wine {
  background: linear-gradient(135deg, rgba(92, 25, 46, 0.07) 0%, rgba(198, 167, 107, 0.12) 100%);
  border: 1px solid rgba(92, 25, 46, 0.35);
}

.pricing-card__special-callout--gold {
  background: linear-gradient(135deg, rgba(198, 167, 107, 0.14) 0%, rgba(255, 253, 248, 0.9) 100%);
  border: 1px solid var(--gold);
}

.pricing-card__special-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pricing-card__special-icon {
  font-size: 1.15rem;
  line-height: 1;
}

.pricing-card__special-title {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--wine);
  letter-spacing: 0.02em;
  flex: 1;
}

.pricing-card__special-pill {
  font-family: var(--font-serif);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 2px 8px;
  background: var(--wine);
  color: #FAF6EE;
  border-radius: 10px;
  letter-spacing: 0.04em;
  box-shadow: 0 2px 6px var(--wine-glow);
}

.pricing-card__special-desc {
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--ink);
  margin: 0 0 10px;
}

.pricing-card__special-prices-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.pricing-card__special-price-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.88rem;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
}

.pricing-card__special-price-label {
  color: var(--ink-secondary);
}

.pricing-card__special-price-val strong {
  color: var(--gold-dark);
  font-weight: 700;
  margin-right: 4px;
}

.pricing-card__special-price-orig {
  color: var(--ink-light);
  text-decoration: line-through;
  font-size: 0.85em;
}

.pricing-card__special-sub,
.pricing-card__special-hint {
  font-size: 0.84rem;
  color: var(--ink-secondary);
  font-style: italic;
  line-height: 1.4;
  padding-top: 6px;
  border-top: 1px dashed rgba(198, 167, 107, 0.35);
}

/* Legal Risk Checker Modal Luxury Palette Harmonization */
.legal-modal {
  border-color: var(--gold) !important;
  box-shadow: 0 16px 48px rgba(32, 28, 36, 0.2), 0 0 0 1px var(--gold-muted);
}
```

---

## 5. Verification Method

To verify these changes upon implementation in Milestone 2:

1. **Static Analysis & Compilation:**
   ```bash
   npm run lint
   npm run build
   ```
   Both commands must exit with code 0 without any TypeScript or bundling warnings.

2. **Visual & Interaction Checklist:**
   - [ ] Navigate to `#pricing`: Medical Disclaimer card appears prominently above the 3 block tabs with gold border, wine heading, and regulatory note.
   - [ ] Verify online surcharge badges:
     - On «Путешествие Души» card: online note is visible, and clicking online pills reflects the +3 000 ₽ difference.
     - On «Энергетическое выравнивание», «Квантовое очищение», «Комплекс» cards: online note and badge appear.
   - [ ] Verify Twin Flame 20% discount callouts:
     - On «Консультация Близнецовые пламена» card: special banner with -20% badge and guide mention is visible.
     - On «Энергетическое выравнивание» card: special banner with exact prices (9 600 ₽ / 12 000 ₽) and prompt to mention date to Maria is displayed.
   - [ ] Verify 14 Navigator chips: All 14 chips scroll to the matching session card upon click.
   - [ ] Verify Legal Risk Checker modal: opens cleanly from header and footer, uses gold border styling, audits test phrases with accurate score and stop-word replacements.

3. **Invalidation Conditions:**
   - Any price change deviating from `ORIGINAL_REQUEST.md` (e.g. 5 555 ₽, 8 888 ₽, 13 369 ₽, 18 000 ₽, 29 999 ₽, 222 000 ₽).
   - Any hardcoded medical claim violating ФЗ № 323-ФЗ or ФЗ № 38-ФЗ without appropriate disclaimers.
