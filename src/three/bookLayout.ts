import type { ReadingLayerTab } from '../store/useBookStore'

export const CANVAS_W = 1400
export const CANVAS_H = 1880

export interface RectBounds {
  x1: number
  x2: number
  y1: number
  y2: number
}

export function isInside(x: number, y: number, bounds: RectBounds): boolean {
  return x >= bounds.x1 && x <= bounds.x2 && y >= bounds.y1 && y <= bounds.y2
}

// ---------------------------------------------------------------------------
// 1. ОБЛОЖКА: КАРТУШ И КНОПКИ ВВОДА ДАТЫ
// ---------------------------------------------------------------------------

const CART_W = 960
const CART_H_INPUT = 280
const CART_H_PRES = 200
const CART_X = (CANVAS_W - CART_W) / 2 // 220
const CART_Y = 1340

export const COVER_LAYOUT = {
  cartouche: {
    x: CART_X,
    y: CART_Y,
    w: CART_W,
    hInput: CART_H_INPUT,
    hPres: CART_H_PRES,
  },
  // Кнопки шага даты
  dayMinus: {
    draw: { x: CART_X + 90, y: CART_Y + 68, w: 52, h: 50 },
    hit: { x1: CART_X + 60, x2: CART_X + 160, y1: CART_Y + 50, y2: CART_Y + 130 },
  },
  dayText: { x: CART_X + 180, y: CART_Y + 105 },
  dayPlus: {
    draw: { x: CART_X + 225, y: CART_Y + 68, w: 52, h: 50 },
    hit: { x1: CART_X + 195, x2: CART_X + 295, y1: CART_Y + 50, y2: CART_Y + 130 },
  },

  monthMinus: {
    draw: { x: CART_X + 330, y: CART_Y + 68, w: 52, h: 50 },
    hit: { x1: CART_X + 300, x2: CART_X + 400, y1: CART_Y + 50, y2: CART_Y + 130 },
  },
  monthText: { x: CART_X + 420, y: CART_Y + 105 },
  monthPlus: {
    draw: { x: CART_X + 465, y: CART_Y + 68, w: 52, h: 50 },
    hit: { x1: CART_X + 435, x2: CART_X + 535, y1: CART_Y + 50, y2: CART_Y + 130 },
  },

  yearMinus: {
    draw: { x: CART_X + 570, y: CART_Y + 68, w: 52, h: 50 },
    hit: { x1: CART_X + 540, x2: CART_X + 640, y1: CART_Y + 50, y2: CART_Y + 130 },
  },
  yearText: { x: CART_X + 675, y: CART_Y + 105 },
  yearPlus: {
    draw: { x: CART_X + 735, y: CART_Y + 68, w: 52, h: 50 },
    hit: { x1: CART_X + 705, x2: CART_X + 805, y1: CART_Y + 50, y2: CART_Y + 130 },
  },

  // Кнопка эталона «✦ 02.04.1994 (Эталон v0.3) ✦»
  presetButton: {
    draw: { x: CART_X + 110, y: CART_Y + 160, w: 355, h: 54 },
    hit: { x1: CART_X + 90, x2: CART_X + 475, y1: CART_Y + 145, y2: CART_Y + 225 },
  },

  // Кнопка «✦ ОТКРЫТЬ ВРАТА ✦»
  openButton: {
    draw: { x: CART_X + 495, y: CART_Y + 160, w: 355, h: 54 },
    hit: { x1: CART_X + 480, x2: CART_X + 865, y1: CART_Y + 145, y2: CART_Y + 225 },
  },

  // Ссылка возврата к презентации
  returnLink: {
    draw: { x: CANVAS_W / 2, y: CART_Y + 250 },
    hit: { x1: CANVAS_W / 2 - 250, x2: CANVAS_W / 2 + 250, y1: CART_Y + 220, y2: CART_Y + 275 },
  },
}

// ---------------------------------------------------------------------------
// 2. ВЕРХНИЕ ВКЛАДКИ РАЗВОРОТА (ПРАВАЯ СТРАНИЦА: ГЛАВЫ 1-10)
// ---------------------------------------------------------------------------

export interface TabDef {
  key: ReadingLayerTab
  label: string
  draw: { x: number; y: number; w: number; h: number }
  hit: RectBounds
}

const TAB_MARGIN = 90
export const READING_TABS: TabDef[] = [
  {
    key: 'essence',
    label: '✦ Свет',
    draw: { x: TAB_MARGIN + 35, y: TAB_MARGIN + 25, w: 185, h: 56 },
    hit: { x1: TAB_MARGIN + 15, x2: TAB_MARGIN + 230, y1: TAB_MARGIN + 10, y2: TAB_MARGIN + 90 },
  },
  {
    key: 'shadow',
    label: '☾ Тень',
    draw: { x: TAB_MARGIN + 235, y: TAB_MARGIN + 25, w: 185, h: 56 },
    hit: { x1: TAB_MARGIN + 230, x2: TAB_MARGIN + 430, y1: TAB_MARGIN + 10, y2: TAB_MARGIN + 90 },
  },
  {
    key: 'life',
    label: '⚖ В Жизни',
    draw: { x: TAB_MARGIN + 435, y: TAB_MARGIN + 25, w: 215, h: 56 },
    hit: { x1: TAB_MARGIN + 430, x2: TAB_MARGIN + 660, y1: TAB_MARGIN + 10, y2: TAB_MARGIN + 90 },
  },
  {
    key: 'archetypes',
    label: '🏛 Пантеон',
    draw: { x: TAB_MARGIN + 665, y: TAB_MARGIN + 25, w: 225, h: 56 },
    hit: { x1: TAB_MARGIN + 660, x2: TAB_MARGIN + 900, y1: TAB_MARGIN + 10, y2: TAB_MARGIN + 90 },
  },
  {
    key: 'integration',
    label: '☀ Вопросы',
    draw: { x: TAB_MARGIN + 905, y: TAB_MARGIN + 25, w: 225, h: 56 },
    hit: { x1: TAB_MARGIN + 900, x2: TAB_MARGIN + 1150, y1: TAB_MARGIN + 10, y2: TAB_MARGIN + 90 },
  },
]

// ---------------------------------------------------------------------------
// 3. ШКАЛА САМООЦЕНКИ (1-5 ЗВЁЗД НА ЛЕВОЙ СТРАНИЦЕ)
// ---------------------------------------------------------------------------

export const STAR_RATING_LAYOUT = {
  yZone: { y1: 1270, y2: 1470 },
  starStartX: CANVAS_W / 2 - 240, // 460
  starGap: 120,
  starCount: 5,
  getStarCenter(i: number) {
    return this.starStartX + (i - 1) * this.starGap
  },
  getStarHit(i: number): RectBounds {
    const cx = this.getStarCenter(i)
    return { x1: cx - 55, x2: cx + 55, y1: this.yZone.y1, y2: this.yZone.y2 }
  },
}

// ---------------------------------------------------------------------------
// 4. НИЖНИЕ КНОПКИ НАВИГАЦИИ СТРАНИЦ
// ---------------------------------------------------------------------------

const PAGE_MARGIN = 90
export const NAV_LAYOUT = {
  // Кнопка ‹ Назад (или ‹ Обложка) внизу слева
  backButton: {
    draw: { x: PAGE_MARGIN + 40, y: 1580, w: 240, h: 60 },
    hit: { x1: 40, x2: 450, y1: 1520, y2: 1700 },
  },
  // Кнопка Далее › (или Следующая глава) внизу справа
  nextButton: {
    draw: { x: CANVAS_W - PAGE_MARGIN - 260, y: 1580, w: 240, h: 60 },
    hit: { x1: CANVAS_W - 460, x2: CANVAS_W, y1: 1520, y2: 1700 },
  },
  // Глава 13: Закрыть книгу и начать заново
  restartButton: {
    draw: { x: CANVAS_W / 2 - 260, y: 1370, w: 520, h: 64 },
    hit: { x1: CANVAS_W / 2 - 280, x2: CANVAS_W / 2 + 280, y1: 1340, y2: 1470 },
  },
}

// ---------------------------------------------------------------------------
// 5. КАРТА МАТРИЦЫ В 13-Й ГЛАВЕ (СЕТКА КАРТОЧЕК)
// ---------------------------------------------------------------------------

export const MATRIX_LAYOUT = {
  gridTop: 270,
  gridHeight: 1180,
  margin: 90,
  getCardBounds(idx: number): RectBounds {
    const cW = CANVAS_W - (this.margin + 45) * 2 // 1130
    const colW = (cW - 30) / 2 // 550
    const cardH = 135
    const gapY = 22
    const col = idx % 2
    const row = Math.floor(idx / 2)
    const cardX = this.margin + 45 + col * (colW + 30)
    const cardY = this.gridTop + row * (cardH + gapY)
    return {
      x1: cardX,
      x2: cardX + colW,
      y1: cardY,
      y2: cardY + cardH,
    }
  },
}
