/**
 * Функция суммы цифр числа
 */
export function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split('')
    .reduce((acc, d) => acc + Number(d), 0)
}

/**
 * Главное правило свёртки системы:
 * В системе 22 Старших Аркана, поэтому числа от 1 до 22 НЕ сворачиваются.
 * Только если число > 22, рекурсивно складываются его цифры до диапазона 1–22.
 * Например: 22 -> 22, 23 -> 5, 29 -> 11, 38 -> 11.
 */
export function normalizeArcana(n: number): number {
  let val = Math.abs(Math.floor(n))
  if (val === 0) return 22 // 22 (Шут) в традиции 22 Арканов
  while (val > 22) {
    val = digitSum(val)
  }
  return val
}

/**
 * Перевод номера Аркана в римскую цифру (I - XXII)
 */
const ROMAN_NUMERALS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
  13: 'XIII',
  14: 'XIV',
  15: 'XV',
  16: 'XVI',
  17: 'XVII',
  18: 'XVIII',
  19: 'XIX',
  20: 'XX',
  21: 'XXI',
  22: 'XXII',
}

export function toRoman(n: number): string {
  return ROMAN_NUMERALS[n] ?? String(n)
}
