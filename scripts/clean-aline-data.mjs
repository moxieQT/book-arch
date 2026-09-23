// Одноразовая чистка текстов, извлечённых из PDF: колонтитулы, маркеры списков, пробелы.
// Запуск: node scripts/clean-aline-data.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = new URL('../src/numerology/data/alineExtractedData.ts', import.meta.url)
let src = readFileSync(FILE, 'utf8')

const ROMAN = '[IVXL]+'
const NAME = '[А-ЯЁ][а-яё]+(?: [А-ЯЁа-яё]+)?'
const FOOTERS = [
  // АРХЕТИПЫ И ТЕНИ • рабочий черновик I Маг — Код Души Стр. 2
  new RegExp(`АРХЕТИПЫ И ТЕНИ • рабочий черновик ${ROMAN} ${NAME} — Код Души Стр\\. \\d+`, 'g'),
  // Архетипы и Тени · II Жрица · черновик • 3
  new RegExp(`Архетипы и Тени · ${ROMAN} ${NAME} · черновик [•·] \\d+`, 'g'),
  // III Императрица · Код Души · черновик · 3
  new RegExp(`${ROMAN} ${NAME} · Код Души · черновик · \\d+`, 'g'),
  // Черновик • IV Император • Код Души
  new RegExp(`Черновик • ${ROMAN} ${NAME} • Код Души`, 'g'),
  // Архетипы и Тени — внутренний черновик 2
  /Архетипы и Тени — внутренний черновик \d+/g,
  // Архетипы и Тени — черновик · V Иерофант · стр. 2
  new RegExp(`Архетипы и Тени — черновик · ${ROMAN} ${NAME} · стр\\. \\d+`, 'g'),
  // XVI Башня — черновой внутренний документ • стр. 2
  new RegExp(`${ROMAN} ${NAME} — черновой внутренний документ • стр\\. \\d+`, 'g'),
  // АРХЕТИПЫ И ТЕНИ · X КОЛЕСО ФОРТУНЫ · 9
  new RegExp(`АРХЕТИПЫ И ТЕНИ · ${ROMAN} [А-ЯЁ ]+? · \\d+`, 'g'),
  // XV Дьявол · черновой внутренний документ · 2
  new RegExp(`${ROMAN} ${NAME} · черновой внутренний документ · \\d+`, 'g'),
]

let removed = 0
for (const re of FOOTERS) {
  src = src.replace(re, () => {
    removed++
    return ' '
  })
}

// Маркер списка из шрифта Symbol (U+F0B7) -> обычная точка списка
const bullets = (src.match(//g) ?? []).length
src = src.replace(//g, '•')

// Схлопываем двойные пробелы внутри текста (не трогая отступы) и пробелы у краёв строк
src = src.replace(/(\S)[ \t]{2,}(?=\S)/g, '$1 ')
src = src.replace(/(: "|^\s+") +/gm, '$1')
src = src.replace(/ +(",?)$/gm, '$1')

// Заголовок следующего раздела, прилипший к концу поля: «… вокруг. ГДЕ МОЖЕТ НАЧАТЬСЯ ИСКАЖЕНИЕ"»
let tails = 0
src = src.replace(/([.!?»…:;]) (?:[А-ЯЁIVX—\-«»?,]+ ){1,8}[А-ЯЁ?»]{2,}"/g, (_m, p) => {
  tails++
  return `${p}"`
})

writeFileSync(FILE, src)
console.log(`хвостовых заголовков удалено: ${tails}`)
console.log(`колонтитулов удалено: ${removed}, маркеров заменено: ${bullets}`)
