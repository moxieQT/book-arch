# Handoff Report: Explorer M1-1 (Contacts & Modal Fix Specialist)

## 1. Observation

### 1.1 Project Baseline Status
- Command `npm run lint` was executed:
  ```
  > book@0.0.0 lint
  > oxlint
  Found 0 warnings and 0 errors.
  Finished in 25ms on 32 files with 116 rules using 12 threads.
  ```
- Command `npm run build` was executed:
  ```
  > book@0.0.0 build
  > tsc -b && vite build
  ✓ 49 modules transformed.
  dist/assets/index-DZziOk-Z.js 202.44 kB │ gzip: 55.62 kB
  ✓ built in 160ms
  ```
- Current codebase builds with 0 errors and 0 lint warnings.

### 1.2 Inspection of `src/components/ServiceModal.tsx`
Line 100–108 contains the current booking action:
```tsx
100:               <a
101:                 href={`https://t.me/share/url?url=&text=${encodeURIComponent(`Здравствуйте, Алина! Хочу узнать подробнее и записаться на: ${service.title}`)}`}
102:                 target="_blank"
103:                 rel="noopener noreferrer"
104:                 className="portal-btn portal-btn--primary portal-btn--lg"
105:               >
106:                 <span>Записаться / Узнать детали</span>
107:                 <span className="portal-btn__arrow">→</span>
108:               </a>
```
**Defects Identified**:
1. Uses `https://t.me/share/url?url=&text=...` (a generic Telegram share dialog meant to broadcast a URL to multiple contacts), rather than opening a direct private chat with manager Maria (`https://t.me/maria_anima`).
2. Addressed directly to Alina (`Здравствуйте, Алина!`), violating the project mandate: all booking and client communications must route through manager Maria.
3. No WhatsApp booking option is provided (`https://wa.me/79152149560`).
4. Alina's endorsement quote regarding manager Maria is completely missing from the modal.
5. Does not import or utilize `MANAGER_INFO`.

### 1.3 Inspection of `src/data/alinaPricing.ts`
Lines 49–55 contain the current manager structure:
```ts
49: export const MANAGER_INFO = {
50:   name: 'Мария',
51:   telegramHandle: 'maria_anima',
52:   telegramUrl: 'https://t.me/maria_anima',
53:   phone: '+7 915 214 9560',
54:   whatsappUrl: 'https://wa.me/79152149560'
55: }
```
**Defects Identified**:
1. Missing `role`: `'Менеджер мастера Алины'`.
2. Missing `telegram`: `'@maria_anima'`.
3. Missing `quote`: Alina's exact endorsement text from `ORIGINAL_REQUEST.md`.
4. Lacks standardized URL generator helper functions for pre-filled booking links.

### 1.4 Inspection of `src/components/PortalFooter.tsx`
Lines 74–100 currently have hardcoded URLs and contacts:
```tsx
74:           <div className="portal-footer__nav-group">
75:             <div className="portal-footer__heading">Запись и менеджер</div>
76:             <p className="portal-footer__contact-desc">
77:               Все записи на индивидуальные сессии и консультации ведёт менеджер <strong>Мария</strong> (@maria_anima):
78:             </p>
79:             <div className="portal-footer__manager-btns">
80:               <a
81:                 href="https://t.me/maria_anima"
82:                 target="_blank"
83:                 rel="noopener noreferrer"
84:                 className="portal-btn portal-btn--gold portal-btn--sm portal-footer__contact-btn"
85:               >
86:                 <span>Telegram @maria_anima</span>
87:                 <span className="portal-btn__arrow">→</span>
88:               </a>
89:               <a
90:                 href="https://wa.me/79152149560"
91:                 target="_blank"
92:                 rel="noopener noreferrer"
93:                 className="portal-btn portal-btn--ghost portal-btn--sm portal-footer__contact-btn"
94:                 style={{ marginTop: '8px' }}
95:               >
96:                 <span>WhatsApp +7 915 214 9560</span>
97:                 <span className="portal-btn__arrow">→</span>
98:               </a>
99:             </div>
100:           </div>
```
**Defects Identified**:
1. Does not import `MANAGER_INFO` from `../data/alinaPricing`.
2. Lacks pre-filled text in query parameters (`?text=...`).

---

## 2. Logic Chain

1. **Centralization Source of Truth (`alinaPricing.ts`)**:
   - `MANAGER_INFO` must be enriched with Alina's exact endorsement quote:
     > «Мария — моя правая рука во всех рабочих вопросах, поэтому смело описывайте ей свою ситуацию, задавайте вопросы и общайтесь с ней так же, как если бы вы писали напрямую мне. Мы вместе подберём для вас подходящий формат работы и идеальное время для консультации».
   - Existing keys (`telegramHandle`, `telegramUrl`, `phone`, `whatsappUrl`) must remain untouched to prevent regressions in `PricingSection.tsx` (lines 73, 82, 88, 91, 97, 146, 276, 314).
   - Adding `role`, `telegram`, `quote`, and helper functions `createTelegramBookingUrl(message)` and `createWhatsappBookingUrl(message)` establishes a standardized contract for all components.

2. **Resolution of `ServiceModal.tsx` Line 101**:
   - Import `MANAGER_INFO` from `../data/alinaPricing`.
   - When viewing a practice (`!service.isBook`), the footer must display:
     - A dedicated manager notice block showcasing Maria's badge, title, handle, and Alina's verbatim quote.
     - A primary booking button for Telegram:
       `https://t.me/maria_anima?text=${encodeURIComponent('Здравствуйте, Мария! Хочу узнать подробнее и записаться к Алине на направление: «' + service.title + '»')}`
     - A secondary booking button for WhatsApp:
       `https://wa.me/79152149560?text=${encodeURIComponent('Здравствуйте, Мария! Хочу узнать подробнее и записаться к Алине на направление: «' + service.title + '»')}`
     - Close button "Вернуться к списку".
   - The 3D Book action (`service.isBook === true`) remains dedicated to `onOpenBook()`.

3. **Alignment of `PortalFooter.tsx`**:
   - Import `MANAGER_INFO` from `../data/alinaPricing`.
   - Replace hardcoded handles with `MANAGER_INFO.name`, `MANAGER_INFO.telegram`, `MANAGER_INFO.phone`.
   - Add pre-filled URI-encoded query parameter `?text=...` to both Telegram and WhatsApp links:
     `Здравствуйте, Мария! Хочу проконсультироваться по сессиям и практикам мастера Алины.`

4. **Visual Styling (`src/App.css`)**:
   - Add luxury-styled CSS classes `.portal-modal__booking`, `.portal-modal__manager-notice`, `.portal-modal__manager-header`, `.portal-modal__manager-badge`, `.portal-modal__manager-name`, `.portal-modal__manager-quote` matching the `#C6A76B` (gold), `#5C192E` (wine), and `#201C24` (ink) palette.

---

## 3. Caveats

1. **Other Telegram links**:
   - `PricingSection.tsx` already uses `MANAGER_INFO.telegramHandle` for session booking (line 146) and Tarot questions (line 276). Those are verified working and do not require modification in M1.
2. **Book Modal Differentiation**:
   - When `service.isBook === true` (Card 08: 3D Book), the modal displays the 3D Book launcher button. The manager booking CTA only applies to the 7 group practice directions (`!service.isBook`).
3. **No git push**:
   - Strictly local execution. No remote push commands permitted.

---

## 4. Conclusion & Proposed Code Changes

The following exact file changes are proposed for implementation:

### 4.1 Changes to `src/data/alinaPricing.ts`
**Location**: Replace lines 49–55 with:
```ts
export const MANAGER_INFO = {
  name: 'Мария',
  role: 'Менеджер мастера Алины',
  telegram: '@maria_anima',
  telegramHandle: 'maria_anima',
  telegramUrl: 'https://t.me/maria_anima',
  phone: '+7 915 214 9560',
  whatsappNumber: '79152149560',
  whatsappUrl: 'https://wa.me/79152149560',
  quote:
    '«Мария — моя правая рука во всех рабочих вопросах, поэтому смело описывайте ей свою ситуацию, задавайте вопросы и общайтесь с ней так же, как если бы вы писали напрямую мне. Мы вместе подберём для вас подходящий формат работы и идеальное время для консультации»'
}

export function createTelegramBookingUrl(message: string): string {
  return `${MANAGER_INFO.telegramUrl}?text=${encodeURIComponent(message)}`
}

export function createWhatsappBookingUrl(message: string): string {
  return `${MANAGER_INFO.whatsappUrl}?text=${encodeURIComponent(message)}`
}
```

### 4.2 Changes to `src/components/ServiceModal.tsx`
**Location 1**: Line 1–3, import `MANAGER_INFO`:
```tsx
import { useEffect } from 'react'
import type { AlinaService } from '../data/alinaServices'
import { MANAGER_INFO } from '../data/alinaPricing'
```

**Location 2**: Replace lines 98–117 with:
```tsx
          {service.isBook ? (
            <button
              type="button"
              className="portal-btn portal-btn--gold portal-btn--lg"
              onClick={() => {
                onClose()
                onOpenBook()
              }}
            >
              <span className="portal-btn__icon">📖</span>
              <span>Открыть интерактивную 3D-Книгу</span>
            </button>
          ) : (
            <div className="portal-modal__booking">
              <div className="portal-modal__manager-notice">
                <div className="portal-modal__manager-header">
                  <span className="portal-modal__manager-badge">Менеджер мастера</span>
                  <span className="portal-modal__manager-name">
                    {MANAGER_INFO.name} ({MANAGER_INFO.telegram})
                  </span>
                </div>
                <blockquote className="portal-modal__manager-quote">
                  {MANAGER_INFO.quote}
                </blockquote>
              </div>

              <div className="portal-modal__actions">
                <a
                  href={`${MANAGER_INFO.telegramUrl}?text=${encodeURIComponent(
                    `Здравствуйте, Мария! Хочу узнать подробнее и записаться к Алине на направление: «${service.title}»`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-btn portal-btn--primary portal-btn--lg"
                >
                  <span>Написать Марии в Telegram</span>
                  <span className="portal-btn__arrow">→</span>
                </a>
                <a
                  href={`${MANAGER_INFO.whatsappUrl}?text=${encodeURIComponent(
                    `Здравствуйте, Мария! Хочу узнать подробнее и записаться к Алине на направление: «${service.title}»`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-btn portal-btn--gold-outline portal-btn--lg"
                >
                  <span>Написать в WhatsApp</span>
                  <span className="portal-btn__arrow">→</span>
                </a>
                <button
                  type="button"
                  className="portal-btn portal-btn--ghost"
                  onClick={onClose}
                >
                  Вернуться к списку
                </button>
              </div>
            </div>
          )}
```

### 4.3 Changes to `src/components/PortalFooter.tsx`
**Location 1**: Add import at line 1:
```tsx
import { MANAGER_INFO } from '../data/alinaPricing'
```

**Location 2**: Replace lines 74–100 with:
```tsx
          <div className="portal-footer__nav-group">
            <div className="portal-footer__heading">Запись и менеджер</div>
            <p className="portal-footer__contact-desc">
              Все записи на индивидуальные сессии и консультации ведёт менеджер <strong>{MANAGER_INFO.name}</strong> ({MANAGER_INFO.telegram}):
            </p>
            <div className="portal-footer__manager-btns">
              <a
                href={`${MANAGER_INFO.telegramUrl}?text=${encodeURIComponent(
                  'Здравствуйте, Мария! Хочу проконсультироваться по сессиям и практикам мастера Алины.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="portal-btn portal-btn--gold portal-btn--sm portal-footer__contact-btn"
              >
                <span>Telegram {MANAGER_INFO.telegram}</span>
                <span className="portal-btn__arrow">→</span>
              </a>
              <a
                href={`${MANAGER_INFO.whatsappUrl}?text=${encodeURIComponent(
                  'Здравствуйте, Мария! Хочу проконсультироваться по сессиям и практикам мастера Алины.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="portal-btn portal-btn--ghost portal-btn--sm portal-footer__contact-btn"
                style={{ marginTop: '8px' }}
              >
                <span>WhatsApp {MANAGER_INFO.phone}</span>
                <span className="portal-btn__arrow">→</span>
              </a>
            </div>
          </div>
```

### 4.4 Changes to `src/App.css`
Append modal booking styles after `.portal-modal__actions` (around line 1150):
```css
.portal-modal__booking {
  width: 100%;
}

.portal-modal__manager-notice {
  margin-bottom: 20px;
  padding: 16px 20px;
  background: rgba(198, 167, 107, 0.08);
  border-left: 3px solid var(--gold);
  border-radius: 0 8px 8px 0;
}

.portal-modal__manager-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.portal-modal__manager-badge {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(92, 25, 46, 0.1);
  color: var(--wine);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.portal-modal__manager-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
}

.portal-modal__manager-quote {
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.5;
  color: #423522;
  font-style: italic;
}
```

---

## 5. Verification Method

To independently verify these changes after implementation:

1. **Static Analysis & Linting**:
   ```bash
   npm run lint
   ```
   *Expected outcome*: 0 errors, 0 warnings.

2. **TypeScript Compilation & Build**:
   ```bash
   npm run build
   ```
   *Expected outcome*: Process exits with code 0. Chunks built in `dist/`.

3. **Link & URI Integrity Inspection**:
   - Inspect output links using grep or automated assertions:
     - Verify no occurrences of `t.me/share/url` remain in `src/`.
     - Verify `ServiceModal` generates:
       - Telegram URL starting with `https://t.me/maria_anima?text=`
       - WhatsApp URL starting with `https://wa.me/79152149560?text=`
       - Text contains encoded Russian message addressing Maria and quoting the service title.
     - Verify `PortalFooter` uses `MANAGER_INFO` and generates valid links with prefilled text.

4. **Invalidation Conditions**:
   - If any `t.me/share` URL remains anywhere in `src/`.
   - If Maria's Telegram handle is different from `maria_anima` or WhatsApp number differs from `79152149560`.
   - If Alina's quote about Maria is omitted from `ServiceModal`.
   - If `npm run build` or `npm run lint` fails.
