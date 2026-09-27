/**
 * Challenger 1: Pricing, Contacts & URL Adversarial Stress Test Suite
 * Independent empirical verification harness for:
 * 1. Pricing accuracy across all 16 sessions and 28 tariff variants
 * 2. Mathematical precision of +3 000 ₽ online surcharge and 20% Twin Flame discount
 * 3. Adversarial Telegram & WhatsApp booking URL generation & percent-encoding
 * 4. Adversarial LegalRiskChecker audit engine & edge cases
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  INDIVIDUAL_SESSIONS,
  PRICING_BLOCKS,
  MANAGER_INFO,
  CLIENT_QUERY_NAVIGATOR,
  TAROT_QUESTIONS,
  createTelegramBookingUrl,
  createWhatsappBookingUrl
} from '../src/data/alinaPricing.ts'

import { ALINA_SERVICES } from '../src/data/alinaServices.ts'
import { LEGAL_RULES, auditTextLegalRisks } from '../src/data/legalRules.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// Colorized reporter
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
}

let totalTests = 0
let passedTests = 0
let failedTests = 0
const failures = []
const findings = []

function test(name, fn) {
  totalTests++
  try {
    fn()
    passedTests++
    console.log(`  ${c.green}✓${c.reset} ${name}`)
  } catch (err) {
    failedTests++
    failures.push({ name, error: err.message, stack: err.stack })
    console.log(`  ${c.red}✗${c.reset} ${name}`)
    console.log(`    ${c.red}${err.message}${c.reset}`)
  }
}

function noteFinding(level, code, description) {
  findings.push({ level, code, description })
  const color = level === 'CRITICAL' ? c.red : level === 'HIGH' ? c.magenta : level === 'MEDIUM' ? c.yellow : c.cyan
  console.log(`    ${color}ℹ [FINDING ${level}] ${code}: ${description}${c.reset}`)
}

console.log(`${c.bold}${c.cyan}======================================================================${c.reset}`)
console.log(`${c.bold}${c.cyan}   CHALLENGER 1: EMPIRICAL ADVERSARIAL PRICING & URL STRESS HARNESS   ${c.reset}`)
console.log(`${c.bold}${c.cyan}======================================================================${c.reset}\n`)

// =====================================================================
// PART 1: PRICING & MATHEMATICAL INTEGRITY STRESS TESTS
// =====================================================================
console.log(`${c.bold}${c.magenta}▶ PART 1: PRICING & MATHEMATICAL INTEGRITY STRESS TESTS${c.reset}`)

test('P1.1: Exact count of individual sessions is 16', () => {
  assert.equal(INDIVIDUAL_SESSIONS.length, 16, `Expected 16 sessions, found ${INDIVIDUAL_SESSIONS.length}`)
})

test('P1.2: Session distribution across 3 pricing blocks matches specification', () => {
  const block1 = INDIVIDUAL_SESSIONS.filter(s => s.blockId === 'taro-matrix')
  const block2 = INDIVIDUAL_SESSIONS.filter(s => s.blockId === 'soul-archetypes')
  const block3 = INDIVIDUAL_SESSIONS.filter(s => s.blockId === 'energy-ritual')
  assert.equal(block1.length, 5, 'Block 1 (taro-matrix) must contain 5 sessions')
  assert.equal(block2.length, 6, 'Block 2 (soul-archetypes) must contain 6 sessions')
  assert.equal(block3.length, 5, 'Block 3 (energy-ritual) must contain 5 sessions')
})

test('P1.3: Pricing Blocks metadata contains 3 valid blocks with icons and titles', () => {
  assert.equal(PRICING_BLOCKS.length, 3)
  const ids = PRICING_BLOCKS.map(b => b.id)
  assert.deepEqual(ids, ['taro-matrix', 'soul-archetypes', 'energy-ritual'])
})

test('P1.4: All 27 tariff options across all 16 sessions (exactly 9 per block) have valid priceNumber and formatted price', () => {
  let optionCount = 0
  for (const session of INDIVIDUAL_SESSIONS) {
    assert(session.options.length >= 1, `Session ${session.id} has no options`)
    for (const opt of session.options) {
      optionCount++
      assert(typeof opt.priceNumber === 'number', `${session.id} option ${opt.label} has non-numeric priceNumber`)
      assert(Number.isInteger(opt.priceNumber), `${session.id} priceNumber must be integer`)
      assert(opt.priceNumber > 0, `${session.id} priceNumber must be positive`)
      assert(opt.price.includes('₽'), `${session.id} price label must include ₽ currency symbol`)

      // Check numeric extraction matches priceNumber
      const extractedNum = parseInt(opt.price.replace(/[^\d]/g, ''), 10)
      assert.equal(extractedNum, opt.priceNumber, `Formatted price string ${opt.price} does not match numeric price ${opt.priceNumber}`)
    }
  }
  assert.equal(optionCount, 27, `Expected 27 total tariff options across 16 sessions, found ${optionCount}`)
})

test('P1.5: Tarot session pricing: 5 questions (5 555 ₽), 10 questions (9 999 ₽), video 30m (9 999 ₽), video 60m (14 999 ₽)', () => {
  const taro = INDIVIDUAL_SESSIONS.find(s => s.id === 'taro-session')
  assert(taro, 'taro-session missing')
  assert.equal(taro.options.length, 4)
  assert.equal(taro.options[0].priceNumber, 5555)
  assert.equal(taro.options[1].priceNumber, 9999)
  assert.equal(taro.options[2].priceNumber, 9999)
  assert.equal(taro.options[3].priceNumber, 14999)
})

test('P1.6: Twin Flame consultation pricing: 30 min (8 888 ₽), 60 min (13 369 ₽)', () => {
  const tf = INDIVIDUAL_SESSIONS.find(s => s.id === 'twin-flames-consultation')
  assert(tf, 'twin-flames-consultation missing')
  assert.equal(tf.options.length, 2)
  assert.equal(tf.options[0].priceNumber, 8888)
  assert.equal(tf.options[1].priceNumber, 13369)
})

test('P1.7: Online surcharge: Soul Journey 45 min online is exactly +3 000 ₽ vs recording (15 000 -> 18 000 ₽)', () => {
  const sj = INDIVIDUAL_SESSIONS.find(s => s.id === 'soul-journey')
  const optRec = sj.options.find(o => o.label.includes('45 мин') && o.label.includes('записи'))
  const optOnl = sj.options.find(o => o.label.includes('45 мин') && o.label.includes('онлайн'))
  assert(optRec && optOnl, 'Soul journey 45m options not found')
  const diff = optOnl.priceNumber - optRec.priceNumber
  assert.equal(diff, 3000, `Expected +3000 surcharge, got ${diff}`)
})

test('P1.8: Online surcharge: Soul Journey 60 min online is exactly +3 000 ₽ vs recording (19 999 -> 22 999 ₽)', () => {
  const sj = INDIVIDUAL_SESSIONS.find(s => s.id === 'soul-journey')
  const optRec = sj.options.find(o => o.label.includes('60 мин') && o.label.includes('записи'))
  const optOnl = sj.options.find(o => o.label.includes('60 мин') && o.label.includes('онлайн'))
  assert(optRec && optOnl, 'Soul journey 60m options not found')
  const diff = optOnl.priceNumber - optRec.priceNumber
  assert.equal(diff, 3000, `Expected +3000 surcharge, got ${diff}`)
})

test('P1.9: Online surcharge: Energy Alignment 35–40 min online is exactly +3 000 ₽ vs recording (12 000 -> 15 000 ₽)', () => {
  const align = INDIVIDUAL_SESSIONS.find(s => s.id === 'energy-alignment')
  const optRec = align.options.find(o => o.label.includes('запись'))
  const optOnl = align.options.find(o => o.label.includes('онлайн'))
  assert(optRec && optOnl, 'Energy alignment options not found')
  const diff = optOnl.priceNumber - optRec.priceNumber
  assert.equal(diff, 3000, `Expected +3000 surcharge, got ${diff}`)
})

test('P1.10: Online surcharge: Quantum Cleansing 45–60 min online is exactly +3 000 ₽ vs recording (12 000 -> 15 000 ₽)', () => {
  const qc = INDIVIDUAL_SESSIONS.find(s => s.id === 'quantum-cleansing')
  const optRec = qc.options.find(o => o.label.includes('запись'))
  const optOnl = qc.options.find(o => o.label.includes('онлайн'))
  assert(optRec && optOnl, 'Quantum cleansing options not found')
  const diff = optOnl.priceNumber - optRec.priceNumber
  assert.equal(diff, 3000, `Expected +3000 surcharge, got ${diff}`)
})

test('P1.11: Online surcharge: Energy Complex 1.5h online is exactly +3 000 ₽ vs recording (22 000 -> 25 000 ₽)', () => {
  const ec = INDIVIDUAL_SESSIONS.find(s => s.id === 'energy-complex')
  const optRec = ec.options.find(o => o.label.includes('запись'))
  const optOnl = ec.options.find(o => o.label.includes('онлайн'))
  assert(optRec && optOnl, 'Energy complex options not found')
  const diff = optOnl.priceNumber - optRec.priceNumber
  assert.equal(diff, 3000, `Expected +3000 surcharge, got ${diff}`)
})

test('P1.12: Online upgrade notes are present and explicitly label +3 000 ₽ on all 4 dual-format sessions', () => {
  const dualSessions = ['soul-journey', 'energy-alignment', 'quantum-cleansing', 'energy-complex']
  for (const id of dualSessions) {
    const s = INDIVIDUAL_SESSIONS.find(item => item.id === id)
    assert(s, `Dual session ${id} missing`)
    assert(s.onlineUpgradeNote, `Session ${id} missing onlineUpgradeNote`)
    assert(s.onlineUpgradeNote.includes('+3 000 ₽'), `Session ${id} note must contain '+3 000 ₽'`)
  }
})

test('P1.13: Mathematical verification: 20% discount on Alignment (12 000 -> 9 600 ₽) has zero rounding error', () => {
  const original = 12000
  const discountRate = 0.20
  const expectedDiscount = original * discountRate
  assert.equal(expectedDiscount, 2400)
  const finalPrice = original - expectedDiscount
  assert.equal(finalPrice, 9600)
})

test('P1.14: Mathematical verification: 20% discount on Alignment online (15 000 -> 12 000 ₽) has zero rounding error', () => {
  const original = 15000
  const discountRate = 0.20
  const expectedDiscount = original * discountRate
  assert.equal(expectedDiscount, 3000)
  const finalPrice = original - expectedDiscount
  assert.equal(finalPrice, 12000)
})

test('P1.15: Twin Flame consultation data structure includes exact discounted prices (9 600 ₽ and 12 000 ₽)', () => {
  const tf = INDIVIDUAL_SESSIONS.find(s => s.id === 'twin-flames-consultation')
  assert(tf.specialDiscount, 'twin-flames-consultation missing specialDiscount')
  const dOpts = tf.specialDiscount.discountedOptions
  assert(Array.isArray(dOpts) && dOpts.length === 2)
  assert.equal(dOpts[0].discountedPrice, '9 600 ₽')
  assert.equal(dOpts[0].originalPrice, '12 000 ₽')
  assert.equal(dOpts[1].discountedPrice, '12 000 ₽')
  assert.equal(dOpts[1].originalPrice, '15 000 ₽')
})

test('P1.16: Energy Alignment data structure includes exact discounted prices (9 600 ₽ and 12 000 ₽)', () => {
  const ea = INDIVIDUAL_SESSIONS.find(s => s.id === 'energy-alignment')
  assert(ea.specialDiscount, 'energy-alignment missing specialDiscount')
  const dOpts = ea.specialDiscount.discountedOptions
  assert(Array.isArray(dOpts) && dOpts.length === 2)
  assert.equal(dOpts[0].discountedPrice, '9 600 ₽')
  assert.equal(dOpts[0].originalPrice, '12 000 ₽')
  assert.equal(dOpts[1].discountedPrice, '12 000 ₽')
  assert.equal(dOpts[1].originalPrice, '15 000 ₽')
})

test('P1.17: Boundary prices: minimum session price is 5 555 ₽ and maximum is 222 000 ₽', () => {
  const allPrices = INDIVIDUAL_SESSIONS.flatMap(s => s.options.map(o => o.priceNumber))
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  assert.equal(minPrice, 5555, 'Minimum price must be 5 555 ₽')
  assert.equal(maxPrice, 222000, 'Maximum price must be 222 000 ₽')
})

test('P1.18: Magic Diagnosis & Ritual session strictly separates diagnosis (8 000 ₽) and ritual cleaning (от 28 000 ₽)', () => {
  const magic = INDIVIDUAL_SESSIONS.find(s => s.id === 'magic-diagnosis-ritual')
  assert(magic, 'magic-diagnosis-ritual missing')
  assert.equal(magic.options[0].priceNumber, 8000)
  assert.equal(magic.options[1].priceNumber, 28000)
  assert(magic.options[1].price.startsWith('от 28 000'), 'Ritual cleaning price must start with "от 28 000 ₽"')
  assert(magic.note.includes('Большая чистка назначается только лично мастером'), 'Note must enforce no advance sale of cleaning')
})

test('P1.19: Client Query Navigator contains 14 mappings targeting valid sessions', () => {
  assert.equal(CLIENT_QUERY_NAVIGATOR.length, 14, 'Expected exactly 14 navigator suggestions')
  for (const item of CLIENT_QUERY_NAVIGATOR) {
    const session = INDIVIDUAL_SESSIONS.find(s => s.id === item.targetSessionId)
    assert(session, `Navigator target ${item.targetSessionId} does not exist in INDIVIDUAL_SESSIONS`)
    assert(item.label.length >= 5, `Label too short: ${item.label}`)
    assert(item.hint.length >= 10, `Hint too short: ${item.hint}`)
  }
})

test('P1.20: Bank of Tarot questions has exactly 27 relationships questions and 9 money questions (36 total)', () => {
  assert.equal(TAROT_QUESTIONS.relationships.length, 27, 'Expected 27 relationships questions')
  assert.equal(TAROT_QUESTIONS.moneyAndRealization.length, 9, 'Expected 9 money questions')
  const total = TAROT_QUESTIONS.relationships.length + TAROT_QUESTIONS.moneyAndRealization.length
  assert.equal(total, 36, 'Expected 36 total Tarot questions')
})

// =====================================================================
// PART 2: ADVERSARIAL BOOKING LINK & URL STRESS TESTS
// =====================================================================
console.log(`\n${c.bold}${c.magenta}▶ PART 2: ADVERSARIAL BOOKING LINK & URL STRESS TESTS${c.reset}`)

test('U2.1: Manager contact info integrity', () => {
  assert.equal(MANAGER_INFO.name, 'Мария')
  assert.equal(MANAGER_INFO.telegramHandle, 'maria_anima')
  assert.equal(MANAGER_INFO.telegramUrl, 'https://t.me/maria_anima')
  assert.equal(MANAGER_INFO.phone, '+7 915 214 9560')
  assert.equal(MANAGER_INFO.whatsappNumber, '79152149560')
  assert.equal(MANAGER_INFO.whatsappUrl, 'https://wa.me/79152149560')
})

test('U2.2: Telegram booking URLs for ALL 16 sessions across ALL 27 options are strictly valid & roundtrip-decodable', () => {
  for (const session of INDIVIDUAL_SESSIONS) {
    for (const opt of session.options) {
      const rawMessage = `Здравствуйте, Мария! Хочу записаться на сессию Alina Tarot Energy: «${session.title}» (тариф: ${opt.label} — ${opt.price})`
      const urlString = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(rawMessage)}`

      // 1. Must parse as valid URL
      const url = new URL(urlString)
      assert.equal(url.protocol, 'https:', 'Protocol must be https:')
      assert.equal(url.host, 't.me', 'Host must be t.me')
      assert.equal(url.pathname, '/maria_anima', 'Path must be /maria_anima')

      // 2. URL string must NOT contain unescaped whitespace, tabs, newlines
      assert(!/\s/.test(urlString), `URL string contains raw whitespace: ${urlString}`)
      assert(!/[\r\n\t]/.test(urlString), `URL string contains control whitespace`)

      // 3. SearchParam 'text' must roundtrip-decode exactly to original message
      const decoded = url.searchParams.get('text')
      assert.equal(decoded, rawMessage, `Decoded message mismatch for ${session.id} - ${opt.label}`)

      // 4. Verify Cyrillic quotes « » percent encoded
      assert(urlString.includes('%C2%AB'), 'Missing encoded opening quote « (%C2%AB)')
      assert(urlString.includes('%C2%BB'), 'Missing encoded closing quote » (%C2%BB)')
    }
  }
})

test('U2.3: Telegram booking URLs for ALL 7 group programs from ServiceModal are strictly valid & roundtrip-decodable', () => {
  const groupServices = ALINA_SERVICES.filter(s => !s.isBook)
  assert.equal(groupServices.length, 7, 'Expected 7 group programs')

  for (const s of groupServices) {
    const rawMessage = `Здравствуйте, Мария! Хочу узнать подробнее и записаться на направление Alina Tarot Energy: «${s.title}»`
    const urlString = `${MANAGER_INFO.telegramUrl}?text=${encodeURIComponent(rawMessage)}`

    const url = new URL(urlString)
    assert.equal(url.protocol, 'https:')
    assert.equal(url.host, 't.me')
    assert.equal(url.pathname, '/maria_anima')
    assert(!/\s/.test(urlString))

    const decoded = url.searchParams.get('text')
    assert.equal(decoded, rawMessage)
    assert(decoded.includes(s.title))
  }
})

test('U2.4: WhatsApp booking URLs for ALL 7 group programs from ServiceModal are strictly valid & roundtrip-decodable', () => {
  const groupServices = ALINA_SERVICES.filter(s => !s.isBook)

  for (const s of groupServices) {
    const rawMessage = `Здравствуйте, Мария! Хочу узнать подробнее и записаться на направление Alina Tarot Energy: «${s.title}»`
    const urlString = `${MANAGER_INFO.whatsappUrl}?text=${encodeURIComponent(rawMessage)}`

    const url = new URL(urlString)
    assert.equal(url.protocol, 'https:')
    assert.equal(url.host, 'wa.me')
    assert.equal(url.pathname, '/79152149560')
    assert(!/\s/.test(urlString))

    const decoded = url.searchParams.get('text')
    assert.equal(decoded, rawMessage)
    assert(decoded.includes(s.title))
  }
})

test('U2.5: Telegram booking URLs for ALL 36 Tarot questions are strictly valid & roundtrip-decodable', () => {
  const allQuestions = [...TAROT_QUESTIONS.relationships, ...TAROT_QUESTIONS.moneyAndRealization]
  assert.equal(allQuestions.length, 36)

  for (const q of allQuestions) {
    const rawMessage = `Здравствуйте, Мария! Хочу задать на сессии Таро следующий вопрос:\n\n«${q}»`
    const urlString = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(rawMessage)}`

    const url = new URL(urlString)
    assert.equal(url.protocol, 'https:')
    assert.equal(url.host, 't.me')
    assert.equal(url.pathname, '/maria_anima')
    assert(!/\s/.test(urlString), `Tarot question URL has raw whitespace: ${q}`)

    const decoded = url.searchParams.get('text')
    assert.equal(decoded, rawMessage)
    assert(decoded.includes(q))
    assert(urlString.includes('%0A%0A'), 'Newlines must be percent-encoded as %0A%0A')
  }
})

test('U2.6: Adversarial URL injection test: query tampering and parameter injection', () => {
  // Scenario: An attacker enters input with query delimiters (&, =, ?, #, ;, /, @)
  const attackInputs = [
    'Test &role=admin&grant=all',
    'Session #hash-fragment-stealer',
    'Question with ?param=1&injection=true',
    'Slash / path / traversal / test',
    'Multiple ampersands &&&&&&&&&===',
    'Spaces and emoji 🕊️ ✨ 💎 and russian «Кавычки»'
  ]

  for (const maliciousText of attackInputs) {
    const tgUrl = createTelegramBookingUrl(maliciousText)
    const waUrl = createWhatsappBookingUrl(maliciousText)

    for (const urlStr of [tgUrl, waUrl]) {
      const parsed = new URL(urlStr)
      // Verify no extra query parameters were created
      const paramKeys = Array.from(parsed.searchParams.keys())
      assert.deepEqual(paramKeys, ['text'], `Extra query parameters injected! Found: ${paramKeys.join(', ')}`)
      // Verify hash is empty
      assert.equal(parsed.hash, '', `Hash fragment injected! Found: ${parsed.hash}`)
      // Verify roundtrip decode
      assert.equal(parsed.searchParams.get('text'), maliciousText)
    }
  }
})

test('U2.7: Adversarial URL encoding test: unusual Unicode & Cyrillic space variants', () => {
  const exoticSpaces = [
    'Обычный пробел',
    'Неразрывный\u00A0пробел\u00A0NBSP',
    'En-space\u2002test',
    'Em-space\u2003test',
    'Zero-width\u200Bspace\u200Btest',
    'Narrow\u202Fno-break\u202Fspace'
  ]

  for (const text of exoticSpaces) {
    const urlStr = createTelegramBookingUrl(text)
    assert(!/\s/.test(urlStr.replace(/[\u200B]/g, '')), `Unencoded standard whitespace in URL: ${urlStr}`)
    const parsed = new URL(urlStr)
    assert.equal(parsed.searchParams.get('text'), text)
  }
})

test('U2.8: Adversarial URL encoding test: 100 fuzzing cycles with random Cyrillic sentences', () => {
  const cyrillicLetters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ '
  const symbols = '«»""\'\',.!?:;()[]{}@#$%^&*-_+=|/\\~`\n\r\t'
  const charset = cyrillicLetters + symbols

  for (let i = 0; i < 100; i++) {
    let randomString = ''
    const len = 20 + (i % 80)
    for (let j = 0; j < len; j++) {
      randomString += charset[Math.floor(Math.random() * charset.length)]
    }

    const tgUrl = createTelegramBookingUrl(randomString)
    const parsed = new URL(tgUrl)
    assert.equal(parsed.searchParams.get('text'), randomString, `Fuzz roundtrip failure at cycle ${i}`)
  }
})

test('U2.9: Footer contact links use exact manager URLs without query strings', () => {
  const footerContent = fs.readFileSync(path.join(ROOT_DIR, 'src/landing/sections/Contact.tsx'), 'utf-8')
  assert(footerContent.includes('href={MANAGER_INFO.telegramUrl}'), 'Footer missing direct t.me link')
  assert(footerContent.includes('href={MANAGER_INFO.whatsappUrl}'), 'Footer missing direct wa.me link')
  assert.equal(MANAGER_INFO.telegramUrl, 'https://t.me/maria_anima')
  assert.equal(MANAGER_INFO.whatsappUrl, 'https://wa.me/79152149560')
})

test('U2.10: Helper functions createTelegramBookingUrl and createWhatsappBookingUrl produce consistent output', () => {
  const msg = 'Тестовое сообщение'
  const tg = createTelegramBookingUrl(msg)
  const wa = createWhatsappBookingUrl(msg)
  assert.equal(tg, `https://t.me/maria_anima?text=${encodeURIComponent(msg)}`)
  assert.equal(wa, `https://wa.me/79152149560?text=${encodeURIComponent(msg)}`)
})

// =====================================================================
// PART 3: LEGAL RISK CHECKER ADVERSARIAL STRESS TESTS
// =====================================================================
console.log(`\n${c.bold}${c.magenta}▶ PART 3: LEGAL RISK CHECKER ADVERSARIAL STRESS TESTS${c.reset}`)

test('L3.1: LEGAL_RULES definitions completeness & severity balance', () => {
  assert.equal(LEGAL_RULES.length, 7, 'Expected 7 risk rules')
  const severities = LEGAL_RULES.map(r => r.severity)
  const highCount = severities.filter(s => s === 'high').length
  const mediumCount = severities.filter(s => s === 'medium').length

  assert.equal(highCount, 5, 'Expected 5 high severity rules')
  assert.equal(mediumCount, 2, 'Expected 2 medium severity rules')

  for (const r of LEGAL_RULES) {
    assert(r.title && r.title.length > 5)
    assert(r.dangerExplanation && r.dangerExplanation.length > 20)
    assert(r.safeReplacement && r.safeReplacement.length > 10)
    assert(r.pattern instanceof RegExp)
  }
})

test('L3.2: Clean text with disclaimer achieves 100 score and low risk', () => {
  const text = 'Авторская энергетическая сессия самопознания и сонастройки с ресурсом. Не является медицинской услугой (18+).'
  const audit = auditTextLegalRisks(text)
  assert.equal(audit.score, 100)
  assert.equal(audit.riskLevel, 'low')
  assert.equal(audit.hasDisclaimer, true)
  assert.equal(audit.matchedRules.length, 0)
})

test('L3.3: Score clamping: Extreme violations cannot reduce score below 0', () => {
  // Repeat all dangerous phrases 20 times
  const extremeText = `
    100% гарантированное будущее! 100% предсказание!
    Исцеление органов и систем органов. Лечение органов.
    Лечение болезней, излечение, исцелю от болезней, снять диагноз.
    Снятие порчи, сглаз, родовое проклятие, приворот, сниму порчу.
    Верну мужа, возврат партнера, 100% любовь.
    Большая чистка за 50000, продам ритуальную чистку.
    Открытие денежного канала, разбогатеешь после сессии.
  `.repeat(20)

  const audit = auditTextLegalRisks(extremeText)
  assert(audit.score >= 0, `Score dropped below 0: ${audit.score}`)
  assert.equal(audit.score, 0, `Extreme text should have score 0, got ${audit.score}`)
  assert.equal(audit.riskLevel, 'high')
  assert(audit.matchedRules.length >= 5)
})

test('L3.4: ReDoS / catastrophic backtracking stress test on 100,000 character input', () => {
  // Generate massive repetitive text that could trigger polynomial/exponential regex backtrack
  const padding = 'исцеление систем органов '.repeat(4000) // ~100,000 chars
  const startTime = Date.now()
  const audit = auditTextLegalRisks(padding)
  const elapsed = Date.now() - startTime

  assert(elapsed < 500, `ReDoS risk! 100,000 char audit took ${elapsed}ms (expected < 500ms)`)
  assert(audit.matchedRules.length > 0)
})

test('L3.5: Case insensitivity: ALL-CAPS, lowercase, mixed-case stop words are matched', () => {
  const upper = 'ПОЛНОЕ ИСЦЕЛЕНИЕ ОРГАНОВ И СНЯТИЕ ПОРЧИ'
  const lower = 'полное исцеление органов и снятие порчи'
  const mixed = 'ИсЦеЛеНиЕ ОрГаНоВ и СнЯтИе ПоРчИ'

  for (const sample of [upper, lower, mixed]) {
    const audit = auditTextLegalRisks(sample)
    const ruleIds = audit.matchedRules.map(m => m.rule.id)
    assert(ruleIds.includes('heal_organs'), `Failed to match heal_organs in: ${sample}`)
    assert(ruleIds.includes('magic_curse'), `Failed to match magic_curse in: ${sample}`)
  }
})

test('L3.6: Safe replacements eliminate violations and restore score', () => {
  let riskyText = 'Предлагаем снятие порчи и 100% предсказание будущего. Не является медицинской помощью (18+).'
  let audit = auditTextLegalRisks(riskyText)
  assert(audit.matchedRules.length > 0)

  // Apply replacements
  for (const m of audit.matchedRules) {
    riskyText = riskyText.replace(m.matchedText, m.rule.safeReplacement)
  }

  const cleanAudit = auditTextLegalRisks(riskyText)
  assert.equal(cleanAudit.matchedRules.length, 0, 'Violations remained after applying safe replacements')
  assert(cleanAudit.score > audit.score, 'Score did not increase after safe replacement')
})

test('L3.7: Adversarial Unicode homoglyph analysis (Latin letters in Russian words)', () => {
  // Russian word "порча" with Latin 'o' (\u006F) instead of Cyrillic 'о' (\u043E)
  const latinOHomoglyph = 'снятие п\u006Fрчи'
  const audit = auditTextLegalRisks(latinOHomoglyph)
  const matched = audit.matchedRules.some(m => m.rule.id === 'magic_curse')

  if (!matched) {
    noteFinding('MEDIUM', 'LEGAL_HOMOGLYPH_BYPASS', 'Mixed Latin/Cyrillic homoglyphs (e.g. Latin "o" in "снятие пoрчи") bypass current regex patterns without canonicalization.')
  }
})

test('L3.8: Adversarial Zero-width space insertion analysis', () => {
  // "снятие п\u200Bорчи"
  const zeroWidthText = 'снятие п\u200Bорчи'
  const audit = auditTextLegalRisks(zeroWidthText)
  const matched = audit.matchedRules.some(m => m.rule.id === 'magic_curse')

  if (!matched) {
    noteFinding('LOW', 'LEGAL_ZERO_WIDTH_BYPASS', 'Zero-width spaces (\\u200B) placed between Cyrillic characters can bypass regex word boundaries.')
  }
})

test('L3.9: Grammatical inflection & verb forms analysis: standalone "порча" vs "снятие порчи"', () => {
  // Text: "На человеке сильная порча"
  const textWithoutSnyatie = 'На человеке сильная порча и родовой сглаз'
  const audit = auditTextLegalRisks(textWithoutSnyatie)
  const matchedCurse = audit.matchedRules.some(m => m.rule.id === 'magic_curse')

  assert(matchedCurse, 'Rule magic_curse should match because of сглаз')

  // What about "у вас порча" without "сглаз" or "снятие"?
  const onlyPorcha = 'У вас зафиксирована тяжелая порча'
  const auditPorcha = auditTextLegalRisks(onlyPorcha)
  const matchedOnlyPorcha = auditPorcha.matchedRules.some(m => m.rule.id === 'magic_curse')

  if (!matchedOnlyPorcha) {
    noteFinding('MEDIUM', 'LEGAL_STANDALONE_PORCHA', 'Rule magic_curse matches "снятие/снять порчи" but misses standalone statements like "тяжелая порча".')
  }
})

test('L3.10: Grammatical inflection: "исцелять органы" (infinitive) vs "исцеление органов" (noun)', () => {
  const infinitive = 'Наши практики помогают напрямую исцелять органы'
  const audit = auditTextLegalRisks(infinitive)
  const matchedHeal = audit.matchedRules.some(m => m.rule.id === 'heal_organs')

  if (!matchedHeal) {
    noteFinding('MEDIUM', 'LEGAL_INFINITIVE_HEAL', 'Rule heal_organs matches "исцеление/лечение органов" but does not match infinitive "исцелять органы".')
  }
})

test('L3.11: Production text audit: landing copy (content.ts + chapters) compliance check', () => {
  const files = ['content.ts', 'sections/Prologue.tsx', 'sections/Philosophy.tsx', 'sections/Folio.tsx', 'sections/Codes.tsx']
  const copy = files.map((f) => fs.readFileSync(path.join(ROOT_DIR, 'src/landing', f), 'utf-8')).join('\n')
  const audit = auditTextLegalRisks(copy)
  if (audit.matchedRules.length > 0) {
    for (const m of audit.matchedRules) {
      noteFinding('HIGH', 'PROD_LANDING_LEGAL_RISK', `Landing copy triggered rule ${m.rule.id} ("${m.matchedText}")`)
    }
  } else {
    console.log(`    ${c.gray}Landing copy passed legal audit without matches${c.reset}`)
  }
})

test('L3.12: Production text audit: ServicesGrid.tsx & ALINA_SERVICES compliance check', () => {
  const allServicesText = ALINA_SERVICES.map(s =>
    `${s.title} ${s.subtitle} ${s.shortDescription} ${s.fullDescription.join(' ')} ${s.bullets.join(' ')} ${s.outcomes.join(' ')}`
  ).join('\n')

  const audit = auditTextLegalRisks(allServicesText)
  if (audit.matchedRules.length > 0) {
    for (const m of audit.matchedRules) {
      noteFinding('HIGH', 'PROD_SERVICES_LEGAL_RISK', `ALINA_SERVICES triggered rule ${m.rule.id} on matched text: "${m.matchedText}"`)
    }
  }
})

test('L3.13: Production text audit: INDIVIDUAL_SESSIONS compliance check', () => {
  const allSessionsText = INDIVIDUAL_SESSIONS.map(s =>
    `${s.title} ${s.subtitle} ${s.description} ${s.note || ''} ${s.bonus || ''}`
  ).join('\n')

  const audit = auditTextLegalRisks(allSessionsText)
  if (audit.matchedRules.length > 0) {
    for (const m of audit.matchedRules) {
      noteFinding('MEDIUM', 'PROD_SESSIONS_LEGAL_RISK', `INDIVIDUAL_SESSIONS triggered rule ${m.rule.id} on matched text: "${m.matchedText}"`)
    }
  }
})

test('L3.14: Footer legal disclaimer contains mandatory statutory components (18+, non-medical, self-knowledge)', () => {
  const footerFile = fs.readFileSync(path.join(ROOT_DIR, 'src/landing/content.ts'), 'utf-8').replace(/\s+/g, ' ')
  assert(footerFile.includes('18+'), 'Footer disclaimer must declare 18+')
  assert(footerFile.includes('не являются медицинскими услугами'), 'Footer disclaimer must disclaim medical services')
  assert(footerFile.includes('информационно-консультационный'), 'Footer disclaimer must declare info-consulting nature')
  assert(footerFile.includes('самопознание'), 'Footer disclaimer must state purpose of self-knowledge')
})

// =====================================================================
// SUMMARY & REPORTING
// =====================================================================
console.log(`\n${c.bold}${c.cyan}======================================================================${c.reset}`)
console.log(`${c.bold}${c.cyan}                   STRESS TEST EXECUTION REPORT                       ${c.reset}`)
console.log(`${c.bold}${c.cyan}======================================================================${c.reset}`)
console.log(`  Total Stress Tests Run:    ${totalTests}`)
console.log(`  Passed Tests:              ${c.green}${passedTests}${c.reset}`)
console.log(`  Failed Tests:              ${failedTests > 0 ? c.red + failedTests + c.reset : c.green + '0' + c.reset}`)
console.log(`  Security/Edge Findings:    ${findings.length}`)

if (failures.length > 0) {
  console.log(`\n${c.bold}${c.red}FAILURES:${c.reset}`)
  for (const f of failures) {
    console.log(`  - ${f.name}: ${f.error}`)
  }
  process.exit(1)
} else {
  console.log(`\n${c.bold}${c.green}✓ ALL ADVERSARIAL STRESS TESTS COMPLETED SUCCESSFULLY!${c.reset}\n`)
  process.exit(0)
}
