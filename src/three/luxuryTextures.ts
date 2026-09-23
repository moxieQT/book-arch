import * as THREE from 'three'
import type { Chapter } from '../numerology/chapters'
import type { ReadingLayerTab, UserScoreRecord } from '../store/useBookStore'
import type { ArchetypesProfile } from '../numerology/calculate'
import type { ArcanaPositionContent } from '../numerology/contentDatabase'
import { LUXURY_PALETTE } from './bookPalette'
import {
  CANVAS_W,
  CANVAS_H,
  COVER_LAYOUT,
  READING_TABS,
  NAV_LAYOUT,
  STAR_RATING_LAYOUT,
} from './bookLayout'
export { CANVAS_W, CANVAS_H }

export const RATING_HINTS: Record<number, string> = {
  1: 'Пока с трудом узнаю или чувствую блок',
  2: 'Смутно отзывается, есть сопротивление',
  3: 'Периодически замечаю в поведении',
  4: 'Ясно проживаю, сила активна в жизни',
  5: 'Глубоко интегрировано, зрелый контакт',
}

export function toRoman(num: number): string {
  const lookup: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1,
  }
  let roman = ''
  let n = num
  for (const i in lookup) {
    while (n >= lookup[i]) {
      roman += i
      n -= lookup[i]
    }
  }
  return roman || String(num)
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

export function createGoldGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): CanvasGradient {
  const g = ctx.createLinearGradient(x1, y1, x2, y2)
  g.addColorStop(0.0, LUXURY_PALETTE.gold.deep)
  g.addColorStop(0.2, LUXURY_PALETTE.gold.primary)
  g.addColorStop(0.45, LUXURY_PALETTE.gold.light)
  g.addColorStop(0.65, LUXURY_PALETTE.gold.bright)
  g.addColorStop(0.85, LUXURY_PALETTE.gold.primary)
  g.addColorStop(1.0, LUXURY_PALETTE.gold.dark)
  return g
}

export function applyPaperTexture(ctx: CanvasRenderingContext2D, isCover = false, spineSide: 'left' | 'right' | 'none' = 'none') {
  const cx = CANVAS_W / 2
  const cy = CANVAS_H / 2
  const g = ctx.createRadialGradient(cx, cy, 180, cx, cy, 1100)

  if (isCover) {
    g.addColorStop(0, LUXURY_PALETTE.cover.base)
    g.addColorStop(0.7, '#ECE4D7')
    g.addColorStop(1, LUXURY_PALETTE.cover.embossDark)
  } else {
    g.addColorStop(0, LUXURY_PALETTE.paper.highlight)
    g.addColorStop(0.6, LUXURY_PALETTE.paper.primary)
    g.addColorStop(1, LUXURY_PALETTE.paper.shade)
  }

  ctx.fillStyle = g
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.save()
  ctx.lineWidth = 0.5
  ctx.strokeStyle = isCover ? 'rgba(180, 160, 140, 0.04)' : 'rgba(120, 100, 80, 0.028)'
  for (let y = 12; y < CANVAS_H; y += 14) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CANVAS_W, y)
    ctx.stroke()
  }
  ctx.restore()

  if (spineSide === 'left') {
    const spineGrad = ctx.createLinearGradient(0, 0, 120, 0)
    spineGrad.addColorStop(0, 'rgba(60, 45, 35, 0.16)')
    spineGrad.addColorStop(0.4, 'rgba(60, 45, 35, 0.05)')
    spineGrad.addColorStop(1, 'rgba(60, 45, 35, 0)')
    ctx.fillStyle = spineGrad
    ctx.fillRect(0, 0, 120, CANVAS_H)
  } else if (spineSide === 'right') {
    const spineGrad = ctx.createLinearGradient(CANVAS_W - 120, 0, CANVAS_W, 0)
    spineGrad.addColorStop(0, 'rgba(60, 45, 35, 0)')
    spineGrad.addColorStop(0.6, 'rgba(60, 45, 35, 0.05)')
    spineGrad.addColorStop(1, 'rgba(60, 45, 35, 0.16)')
    ctx.fillStyle = spineGrad
    ctx.fillRect(CANVAS_W - 120, 0, 120, CANVAS_H)
  }
}

export function drawCornerFlourish(ctx: CanvasRenderingContext2D, x: number, y: number, scaleX: number, scaleY: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scaleX, scaleY)

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(50, 0)
  ctx.bezierCurveTo(40, 15, 30, 25, 25, 25)
  ctx.bezierCurveTo(25, 30, 15, 40, 0, 50)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(18, 18, 5, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(32, 10, 3, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(10, 32, 3, 0, Math.PI * 2)
  ctx.stroke()

  ctx.restore()
}

export function drawSacredGeometry(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.save()
  const goldGrad = createGoldGradient(ctx, cx - radius, cy - radius, cx + radius, cy + radius)
  ctx.strokeStyle = goldGrad

  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, radius - 24, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    const isMajor = i % 2 === 0
    const isCardinal = i % 6 === 0
    const rIn = radius - (isCardinal ? 32 : isMajor ? 24 : 14)
    const rOut = radius

    ctx.lineWidth = isCardinal ? 2.5 : isMajor ? 1.5 : 0.8
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn)
    ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut)
    ctx.stroke()
  }

  const innerR = radius - 44
  ctx.lineWidth = 1.2
  for (let i = 0; i < 4; i++) {
    const angleOffset = (i * Math.PI) / 4
    ctx.beginPath()
    for (let p = 0; p < 3; p++) {
      const a = angleOffset + (p * 2 * Math.PI) / 3
      const px = cx + Math.cos(a) * innerR
      const py = cy + Math.sin(a) * innerR
      if (p === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.stroke()
  }

  ctx.lineWidth = 1.4
  const vpOffset = innerR * 0.42
  ctx.beginPath()
  ctx.arc(cx - vpOffset, cy, innerR * 0.85, -Math.PI / 3, Math.PI / 3)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + vpOffset, cy, innerR * 0.85, (2 * Math.PI) / 3, (4 * Math.PI) / 3)
  ctx.stroke()

  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 32, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = LUXURY_PALETTE.wine.primary
  ctx.beginPath()
  ctx.arc(cx, cy, 14, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = LUXURY_PALETTE.gold.light
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function wrapEditorialText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  if (!text) return 0
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []

  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' '
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim())
      line = words[i] + ' '
    } else {
      line = test
    }
  }
  lines.push(line.trim())

  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight)
  })

  return lines.length
}

function drawPageFrame(ctx: CanvasRenderingContext2D, margin: number) {
  const goldGrad = createGoldGradient(ctx, margin, margin, CANVAS_W - margin, 400)
  ctx.save()
  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 2.4
  ctx.strokeRect(margin, margin, CANVAS_W - margin * 2, CANVAS_H - margin * 2)

  ctx.lineWidth = 1.0
  ctx.strokeStyle = 'rgba(198, 167, 107, 0.45)'
  ctx.strokeRect(margin + 16, margin + 16, CANVAS_W - (margin + 16) * 2, CANVAS_H - (margin + 16) * 2)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 1.8
  drawCornerFlourish(ctx, margin + 22, margin + 22, 0.85, 0.85)
  drawCornerFlourish(ctx, CANVAS_W - margin - 22, margin + 22, -0.85, 0.85)
  drawCornerFlourish(ctx, margin + 22, CANVAS_H - margin - 22, 0.85, -0.85)
  drawCornerFlourish(ctx, CANVAS_W - margin - 22, CANVAS_H - margin - 22, -0.85, -0.85)
  ctx.restore()
}

export function drawPillButton(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  isWine = false,
  fontSize = 24
) {
  ctx.save()
  const r = 8
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()

  if (isWine) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h)
    g.addColorStop(0, '#6E1B35')
    g.addColorStop(1, '#450D20')
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = '#D4AF37'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.fillStyle = '#FFFFFF'
  } else {
    ctx.fillStyle = 'rgba(255, 253, 248, 0.95)'
    ctx.fill()
    ctx.strokeStyle = '#A88755'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#450D20'
  }

  ctx.textAlign = 'center'
  ctx.font = `700 ${fontSize}px "Cormorant Garamond", Georgia, serif`
  ctx.letterSpacing = '1px'
  ctx.fillText(text, x + w / 2, y + h / 2 + fontSize * 0.35)
  ctx.restore()
}

// ---------------------------------------------------------------------------
// 1. ОБЛОЖКА КНИГИ (COVER)
// ---------------------------------------------------------------------------

export function drawCoverOntoCanvas(
  cv: HTMLCanvasElement,
  coverState: 'presentation' | 'input',
  draftDate = { day: 2, month: 4, year: 1994 }
) {
  cv.width = CANVAS_W
  cv.height = CANVAS_H
  const ctx = cv.getContext('2d')!

  applyPaperTexture(ctx, true)

  const margin = 80
  const goldGrad = createGoldGradient(ctx, margin, margin, CANVAS_W - margin, CANVAS_H - margin)

  ctx.save()
  ctx.shadowColor = 'rgba(70, 50, 35, 0.35)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 4

  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 6
  ctx.strokeRect(margin, margin, CANVAS_W - margin * 2, CANVAS_H - margin * 2)

  ctx.lineWidth = 1.5
  ctx.strokeRect(margin + 24, margin + 24, CANVAS_W - (margin + 24) * 2, CANVAS_H - (margin + 24) * 2)
  ctx.restore()

  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 2
  drawCornerFlourish(ctx, margin + 30, margin + 30, 1, 1)
  drawCornerFlourish(ctx, CANVAS_W - margin - 30, margin + 30, -1, 1)
  drawCornerFlourish(ctx, margin + 30, CANVAS_H - margin - 30, 1, -1)
  drawCornerFlourish(ctx, CANVAS_W - margin - 30, CANVAS_H - margin - 30, -1, -1)

  ctx.textAlign = 'center'
  ctx.fillStyle = LUXURY_PALETTE.ink.secondary
  ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
  ctx.letterSpacing = '8px'
  ctx.fillText('LIBER ARCHETYPORUM ET UMBRARUM', CANVAS_W / 2, 220)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = LUXURY_PALETTE.gold.primary
  ctx.beginPath()
  ctx.moveTo(CANVAS_W / 2, 258)
  ctx.lineTo(CANVAS_W / 2 + 10, 268)
  ctx.lineTo(CANVAS_W / 2, 278)
  ctx.lineTo(CANVAS_W / 2 - 10, 268)
  ctx.fill()

  ctx.save()
  ctx.shadowColor = 'rgba(40, 20, 10, 0.45)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 4
  const titleGrad = ctx.createLinearGradient(CANVAS_W / 2 - 400, 300, CANVAS_W / 2 + 400, 420)
  titleGrad.addColorStop(0, '#B38024')
  titleGrad.addColorStop(0.35, '#E5C478')
  titleGrad.addColorStop(0.7, '#9C6E1B')
  titleGrad.addColorStop(1, '#D4AF37')
  ctx.fillStyle = titleGrad
  ctx.font = '700 106px "Cormorant Garamond", Georgia, serif'
  ctx.letterSpacing = '8px'
  ctx.fillText('АРХЕТИПЫ И ТЕНИ', CANVAS_W / 2, 380)
  ctx.restore()

  ctx.fillStyle = LUXURY_PALETTE.wine.primary
  ctx.font = 'italic 700 42px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('Книга Души и Чисел Судьбы', CANVAS_W / 2, 452)

  drawSacredGeometry(ctx, CANVAS_W / 2, 920, 275)

  const cart = COVER_LAYOUT.cartouche
  const cartW = cart.w
  const cartH = coverState === 'input' ? cart.hInput : cart.hPres
  const cartX = cart.x
  const cartY = cart.y

  ctx.save()
  ctx.fillStyle = 'rgba(255, 253, 248, 0.92)'
  ctx.fillRect(cartX, cartY, cartW, cartH)

  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 2.5
  ctx.strokeRect(cartX, cartY, cartW, cartH)
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(198, 167, 107, 0.5)'
  ctx.strokeRect(cartX + 6, cartY + 6, cartW - 12, cartH - 12)

  ctx.fillStyle = LUXURY_PALETTE.wine.primary
  ctx.font = '700 30px "Cormorant Garamond", Georgia, serif'
  ctx.letterSpacing = '4px'
  ctx.fillText('✦  ОДИННАДЦАТЬ ВРАТ СОКРОВЕННОГО ЗНАНИЯ  ✦', CANVAS_W / 2, cartY + 48)
  ctx.letterSpacing = '0px'

  if (coverState === 'presentation') {
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = 'italic 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Священные ключи души, тени и родовой памяти', CANVAS_W / 2, cartY + 100)

    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 24px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '1px'
    ctx.fillText('— прикоснитесь к книге, чтобы ввести дату рождения —', CANVAS_W / 2, cartY + 154)
    ctx.letterSpacing = '0px'
  } else {
    const dStr = pad2(draftDate.day)
    const mStr = pad2(draftDate.month)
    const yStr = String(draftDate.year)

    // День
    const dm = COVER_LAYOUT.dayMinus.draw
    drawPillButton(ctx, '‹', dm.x, dm.y, dm.w, dm.h, false, 28)
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 42px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(dStr, COVER_LAYOUT.dayText.x, COVER_LAYOUT.dayText.y)
    const dp = COVER_LAYOUT.dayPlus.draw
    drawPillButton(ctx, '›', dp.x, dp.y, dp.w, dp.h, false, 28)
    ctx.font = 'italic 18px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = LUXURY_PALETTE.ink.secondary
    ctx.fillText('День', COVER_LAYOUT.dayText.x, COVER_LAYOUT.dayText.y + 29)

    ctx.fillStyle = LUXURY_PALETTE.gold.primary
    ctx.font = '700 32px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('·', cartX + 300, cartY + 105)

    // Месяц
    const mm = COVER_LAYOUT.monthMinus.draw
    drawPillButton(ctx, '‹', mm.x, mm.y, mm.w, mm.h, false, 28)
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 42px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(mStr, COVER_LAYOUT.monthText.x, COVER_LAYOUT.monthText.y)
    const mp = COVER_LAYOUT.monthPlus.draw
    drawPillButton(ctx, '›', mp.x, mp.y, mp.w, mp.h, false, 28)
    ctx.font = 'italic 18px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = LUXURY_PALETTE.ink.secondary
    ctx.fillText('Месяц', COVER_LAYOUT.monthText.x, COVER_LAYOUT.monthText.y + 29)

    ctx.fillStyle = LUXURY_PALETTE.gold.primary
    ctx.font = '700 32px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('·', cartX + 540, cartY + 105)

    // Год
    const ym = COVER_LAYOUT.yearMinus.draw
    drawPillButton(ctx, '‹', ym.x, ym.y, ym.w, ym.h, false, 28)
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 42px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(yStr, COVER_LAYOUT.yearText.x, COVER_LAYOUT.yearText.y)
    const yp = COVER_LAYOUT.yearPlus.draw
    drawPillButton(ctx, '›', yp.x, yp.y, yp.w, yp.h, false, 28)
    ctx.font = 'italic 18px "Cormorant Garamond", Georgia, serif'
    ctx.fillStyle = LUXURY_PALETTE.ink.secondary
    ctx.fillText('Год', COVER_LAYOUT.yearText.x, COVER_LAYOUT.yearText.y + 29)

    // Кнопка эталона
    const pb = COVER_LAYOUT.presetButton.draw
    drawPillButton(ctx, '✦  02.04.1994 (Эталон v0.3)  ✦', pb.x, pb.y, pb.w, pb.h, false, 20)

    // Кнопка открытия
    const ob = COVER_LAYOUT.openButton.draw
    drawPillButton(ctx, '✦  ОТКРЫТЬ ВРАТА  ✦', ob.x, ob.y, ob.w, ob.h, true, 24)

    // Возврат
    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = 'italic 20px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('— ✕ вернуться к наклону обложки —', COVER_LAYOUT.returnLink.draw.x, COVER_LAYOUT.returnLink.draw.y)
  }
  ctx.restore()

  ctx.fillStyle = LUXURY_PALETTE.gold.deep
  ctx.font = '600 22px "Cormorant Garamond", Georgia, serif'
  ctx.letterSpacing = '6px'
  ctx.fillText('EDITIONIS PRIVATAE • MMXXVI', CANVAS_W / 2, 1690)
  ctx.letterSpacing = '0px'
}

// ---------------------------------------------------------------------------
// 2. ФОРЗАЦ (ENDPAPER)
// ---------------------------------------------------------------------------

export function drawEndpaperOntoCanvas(cv: HTMLCanvasElement) {
  cv.width = CANVAS_W
  cv.height = CANVAS_H
  const ctx = cv.getContext('2d')!
  applyPaperTexture(ctx, false)

  const margin = 90
  drawPageFrame(ctx, margin)
  drawSacredGeometry(ctx, CANVAS_W / 2, CANVAS_H / 2, 220)

  ctx.textAlign = 'center'
  ctx.fillStyle = LUXURY_PALETTE.gold.deep
  ctx.font = 'italic 28px "Cormorant Garamond", Georgia, serif'
  ctx.letterSpacing = '5px'
  ctx.fillText('LIBER ARCANORUM', CANVAS_W / 2, CANVAS_H / 2 + 300)
  ctx.letterSpacing = '0px'
}

// ---------------------------------------------------------------------------
// 3. ЛЕВАЯ СТРАНИЦА РАЗВОРОТА (LEFT PAGE: Архетип, Суть, Шкала 1-5, Навигация)
// ---------------------------------------------------------------------------

export function drawPageLeftOntoCanvas(
  cv: HTMLCanvasElement,
  chapter: Chapter,
  spreadIdx: number,
  score: number | null
) {
  cv.width = CANVAS_W
  cv.height = CANVAS_H
  const ctx = cv.getContext('2d')!

  applyPaperTexture(ctx, false, 'right')

  const margin = 90
  drawPageFrame(ctx, margin)

  // Верхний колонтитул
  ctx.textAlign = 'left'
  ctx.fillStyle = LUXURY_PALETTE.gold.deep
  ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
  ctx.letterSpacing = '3px'
  ctx.fillText(`ГЛАВА ${spreadIdx} ИЗ 13`, margin + 35, margin + 48)

  ctx.textAlign = 'right'
  ctx.fillStyle = LUXURY_PALETTE.wine.primary
  ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(chapter.bigArcanaName.toUpperCase(), CANVAS_W - margin - 35, margin + 48)
  ctx.letterSpacing = '0px'

  const goldGrad = createGoldGradient(ctx, margin + 30, margin + 70, CANVAS_W - margin - 30, margin + 70)
  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(margin + 35, margin + 70)
  ctx.lineTo(CANVAS_W - margin - 35, margin + 70)
  ctx.stroke()

  if (chapter.kind === 'summary') {
    ctx.textAlign = 'center'
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 84px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('✦', CANVAS_W / 2, 330)

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '700 64px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Карта Профиля', CANVAS_W / 2, 415)

    ctx.fillStyle = LUXURY_PALETTE.ink.secondary
    ctx.font = 'italic 32px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Интегральный узор 16 арканических позиций', CANVAS_W / 2, 475)

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(
      ctx,
      '«Познание тени — начало света. Вы завершили раскрытие двенадцати врат личной и родовой памяти. Теперь перед вами целостная картина вашей души».',
      CANVAS_W / 2 - 450,
      570,
      900,
      50
    )

    ctx.save()
    ctx.globalAlpha = 0.08
    drawSacredGeometry(ctx, CANVAS_W / 2, 1020, 240)
    ctx.restore()

    const rb = NAV_LAYOUT.restartButton.draw
    drawPillButton(ctx, '↺  Закрыть книгу и начать заново', rb.x, rb.y, rb.w, rb.h, false, 26)
  } else if (chapter.kind === 'ancestral' && chapter.ancestralLines) {
    const lines = chapter.ancestralLines
    ctx.textAlign = 'center'
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 115px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(chapter.bigRoman, CANVAS_W / 2, 275)

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '700 60px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(chapter.title, CANVAS_W / 2, 350)

    ctx.fillStyle = LUXURY_PALETTE.ink.secondary
    ctx.font = 'italic 30px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(chapter.subtitle, CANVAS_W / 2, 400)

    const bY = 460
    ctx.fillStyle = 'rgba(198, 167, 107, 0.08)'
    ctx.fillRect(margin + 40, bY, CANVAS_W - (margin + 40) * 2, 380)
    ctx.strokeStyle = LUXURY_PALETTE.gold.primary
    ctx.lineWidth = 2
    ctx.strokeRect(margin + 40, bY, CANVAS_W - (margin + 40) * 2, 380)

    ctx.textAlign = 'left'
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText(`РЕСУРС РОДА · СИЛА ПРЕДКОВ (${lines.spiritual.roman})`, margin + 65, bY + 48)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '700 40px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(lines.spiritual.arcanaTitle, margin + 65, bY + 100)

    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Переданная сила и опора:', margin + 65, bY + 155)
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '32px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, lines.spiritual.resource, margin + 65, bY + 192, CANVAS_W - (margin + 40) * 2 - 50, 44)

    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Теневая грань ресурса:', margin + 65, bY + 280)
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '32px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, lines.spiritual.shadow, margin + 65, bY + 316, CANVAS_W - (margin + 40) * 2 - 50, 44)

    drawRatingWidget(ctx, score, margin, 1220, 'Принятие ресурса этой линии рода:')
  } else {
    ctx.textAlign = 'center'
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 130px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(chapter.bigRoman, CANVAS_W / 2, 270)

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '700 66px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(chapter.title, CANVAS_W / 2, 350)

    ctx.fillStyle = LUXURY_PALETTE.ink.secondary
    ctx.font = 'italic 32px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(chapter.subtitle, CANVAS_W / 2, 402)

    const qX = margin + 40
    const qY = 460
    const qW = CANVAS_W - (margin + 40) * 2
    ctx.save()
    ctx.strokeStyle = LUXURY_PALETTE.gold.primary
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(qX, qY)
    ctx.lineTo(qX, qY + 280)
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = 'italic 38px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, chapter.content?.coreEssence ?? '', qX + 40, qY + 45, qW - 55, 54)
    ctx.restore()

    ctx.save()
    ctx.globalAlpha = 0.07
    drawSacredGeometry(ctx, CANVAS_W / 2, 980, 220)
    ctx.restore()

    drawRatingWidget(ctx, score, margin, 1220, 'Насколько ты проживаешь этот аспект в себе?')
  }

  // Навигационные кнопки внизу левой страницы
  const backLabel = spreadIdx === 1 ? '‹  Обложка' : '‹  Назад'
  const nb = NAV_LAYOUT.backButton.draw
  const nn = NAV_LAYOUT.nextButton.draw
  drawPillButton(ctx, backLabel, nb.x, nb.y, nb.w, nb.h, false, 26)

  // Кнопка Далее на левой странице: ведёт на правую страницу разворота
  drawPillButton(ctx, 'Далее  ›', nn.x, nn.y, nn.w, nn.h, true, 26)

  ctx.textAlign = 'center'
  ctx.fillStyle = LUXURY_PALETTE.ink.muted
  ctx.font = 'italic 26px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(`—  ${spreadIdx * 2 - 1}  —`, CANVAS_W / 2, 1680)
}

function drawRatingWidget(
  ctx: CanvasRenderingContext2D,
  score: number | null,
  margin: number,
  y: number,
  label: string
) {
  const cardW = CANVAS_W - margin * 2 - 40
  const cardH = 270
  const cardX = (CANVAS_W - cardW) / 2
  const cardY = y

  ctx.save()
  // 1. Подложка карточки шкалы (светлый шелк с золотой рамкой)
  ctx.fillStyle = 'rgba(255, 253, 248, 0.94)'
  ctx.fillRect(cardX, cardY, cardW, cardH)

  const goldGrad = createGoldGradient(ctx, cardX, cardY, cardX + cardW, cardY + cardH)
  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 2.5
  ctx.strokeRect(cardX, cardY, cardW, cardH)

  ctx.strokeStyle = 'rgba(198, 167, 107, 0.4)'
  ctx.lineWidth = 1
  ctx.strokeRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12)

  // 2. Вопрос
  ctx.textAlign = 'center'
  ctx.fillStyle = LUXURY_PALETTE.ink.primary
  ctx.font = '700 34px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(label, CANVAS_W / 2, cardY + 48)

  // 3. Звезды 1-5
  const starY = cardY + 128

  for (let i = 1; i <= STAR_RATING_LAYOUT.starCount; i++) {
    const sX = STAR_RATING_LAYOUT.getStarCenter(i)
    const isFilled = score !== null && score >= i

    ctx.save()
    // Диск звезды
    ctx.beginPath()
    ctx.arc(sX, starY, 36, 0, Math.PI * 2)

    if (isFilled) {
      // Заполненный диск: глубокий винно-бордовый с золотым ободком
      ctx.fillStyle = LUXURY_PALETTE.wine.primary
      ctx.fill()
      ctx.strokeStyle = '#D4AF37'
      ctx.lineWidth = 3
      ctx.shadowColor = 'rgba(212, 175, 55, 0.75)'
      ctx.shadowBlur = 12
      ctx.stroke()

      // Символ звезды внутри (яркое теплое золото)
      ctx.fillStyle = '#FFEAA7'
      ctx.font = '50px "Cormorant Garamond", Georgia, serif'
      ctx.fillText('★', sX, starY + 16)
    } else {
      // Незаполненный диск: плотная плашка с четким темным ободком
      ctx.fillStyle = 'rgba(238, 230, 216, 0.95)'
      ctx.fill()
      ctx.strokeStyle = '#7D6A58'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Символ звезды внутри (высококонтрастный темно-бронзовый контур)
      ctx.fillStyle = '#6E5947'
      ctx.font = '48px "Cormorant Garamond", Georgia, serif'
      ctx.fillText('★', sX, starY + 15)
    }
    ctx.restore()

    // Цифра оценки под звездой
    ctx.save()
    ctx.textAlign = 'center'
    ctx.fillStyle = isFilled ? LUXURY_PALETTE.wine.primary : '#6E5947'
    ctx.font = '700 24px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(String(i), sX, starY + 68)
    ctx.restore()
  }

  // 4. Текстовая подсказка
  const hint = score ? RATING_HINTS[score] : 'Нажмите на звезду от 1 до 5'
  ctx.fillStyle = LUXURY_PALETTE.wine.primary
  ctx.font = 'italic 28px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(hint, CANVAS_W / 2, cardY + 242)

  ctx.restore()
}

// ---------------------------------------------------------------------------
// 4. ПРАВАЯ СТРАНИЦА РАЗВОРОТА (RIGHT PAGE: Вкладки, Текст, Далее)
// ---------------------------------------------------------------------------

export function drawPageRightOntoCanvas(
  cv: HTMLCanvasElement,
  chapter: Chapter,
  spreadIdx: number,
  activeTab: ReadingLayerTab,
  _isLast: boolean,
  scores: Record<string, UserScoreRecord[]> = {},
  profile?: ArchetypesProfile | null
) {
  cv.width = CANVAS_W
  cv.height = CANVAS_H
  const ctx = cv.getContext('2d')!

  applyPaperTexture(ctx, false, 'left')

  const margin = 90
  drawPageFrame(ctx, margin)

  if (chapter.kind === 'summary') {
    drawSummaryProfileGrid(ctx, margin, scores, profile)
    drawPillButton(ctx, '‹  Назад к Роду', margin + 40, 1580, 260, 60, false, 26)
    drawPillButton(ctx, 'Завершить чтение  ✦', CANVAS_W - margin - 310, 1580, 280, 60, true, 26)
  } else if (chapter.kind === 'ancestral' && chapter.ancestralLines) {
    const lines = chapter.ancestralLines
    ctx.textAlign = 'left'
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '3px'
    ctx.fillText('СЦЕНАРИЙ И НОВАЯ НОРМА РОДА', margin + 40, margin + 48)
    ctx.letterSpacing = '0px'

    const goldGrad = createGoldGradient(ctx, margin + 30, margin + 70, CANVAS_W - margin - 30, margin + 70)
    ctx.strokeStyle = goldGrad
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(margin + 35, margin + 70)
    ctx.lineTo(CANVAS_W - margin - 35, margin + 70)
    ctx.stroke()

    const b1Y = 190
    ctx.fillStyle = 'rgba(198, 167, 107, 0.08)'
    ctx.fillRect(margin + 40, b1Y, CANVAS_W - (margin + 40) * 2, 430)
    ctx.strokeStyle = LUXURY_PALETTE.gold.primary
    ctx.lineWidth = 2
    ctx.strokeRect(margin + 40, b1Y, CANVAS_W - (margin + 40) * 2, 430)

    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 26px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText(`ПОВТОРЯЮЩИЙСЯ СЦЕНАРИЙ · ТЕНЬ РОДА (${lines.material.roman})`, margin + 65, b1Y + 48)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '700 40px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(lines.material.arcanaTitle, margin + 65, b1Y + 100)

    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Родовой паттерн напряжения:', margin + 65, b1Y + 155)
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '32px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, lines.material.shadow, margin + 65, b1Y + 192, CANVAS_W - (margin + 40) * 2 - 50, 44)

    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Скрытый ресурс за сценарием:', margin + 65, b1Y + 290)
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '32px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, lines.material.resource, margin + 65, b1Y + 328, CANVAS_W - (margin + 40) * 2 - 50, 44)

    const b2Y = 670
    ctx.fillStyle = 'rgba(92, 25, 46, 0.06)'
    ctx.fillRect(margin + 40, b2Y, CANVAS_W - (margin + 40) * 2, 430)
    ctx.strokeStyle = LUXURY_PALETTE.wine.primary
    ctx.lineWidth = 2
    ctx.strokeRect(margin + 40, b2Y, CANVAS_W - (margin + 40) * 2, 430)

    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 26px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText(`ТРАНСФОРМАЦИЯ · НОВАЯ НОРМА (${lines.integral.roman})`, margin + 65, b2Y + 48)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '700 40px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(lines.integral.arcanaTitle, margin + 65, b2Y + 100)

    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Что можно перестать повторять:', margin + 65, b2Y + 155)
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '32px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, lines.integral.innerTask, margin + 65, b2Y + 192, CANVAS_W - (margin + 40) * 2 - 50, 44)

    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 28px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('Новая норма для себя и рода:', margin + 65, b2Y + 290)
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '32px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, lines.integral.integration, margin + 65, b2Y + 328, CANVAS_W - (margin + 40) * 2 - 50, 44)

    const nb = NAV_LAYOUT.backButton.draw
    const nn = NAV_LAYOUT.nextButton.draw
    drawPillButton(ctx, '‹  Назад', nb.x, nb.y, nb.w, nb.h, false, 26)
    const nextLabel = spreadIdx === 12 ? 'Карта Профиля  ›' : 'Далее  ›'
    drawPillButton(ctx, nextLabel, nn.x, nn.y, nn.w, nn.h, true, 26)
  } else {
    drawLayerTabs(ctx, margin, activeTab)

    const content = chapter.content
    if (content) {
      drawTabContent(ctx, margin, activeTab, content)
    }

    const nb = NAV_LAYOUT.backButton.draw
    const nn = NAV_LAYOUT.nextButton.draw
    drawPillButton(ctx, '‹  Назад', nb.x, nb.y, nb.w, nb.h, false, 26)
    drawPillButton(ctx, 'Далее  ›', nn.x, nn.y, nn.w, nn.h, true, 26)
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = LUXURY_PALETTE.ink.muted
  ctx.font = 'italic 26px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(`—  ${spreadIdx * 2}  —`, CANVAS_W / 2, 1680)
}

function drawLayerTabs(ctx: CanvasRenderingContext2D, margin: number, activeTab: ReadingLayerTab) {
  READING_TABS.forEach((tab) => {
    const isActive = tab.key === activeTab
    drawPillButton(ctx, tab.label, tab.draw.x, tab.draw.y, tab.draw.w, tab.draw.h, isActive, 24)
  })

  const goldGrad = createGoldGradient(ctx, margin + 30, margin + 102, CANVAS_W - margin - 30, margin + 102)
  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(margin + 35, margin + 102)
  ctx.lineTo(CANVAS_W - margin - 35, margin + 102)
  ctx.stroke()
}

function drawTabContent(
  ctx: CanvasRenderingContext2D,
  margin: number,
  tab: ReadingLayerTab,
  content: ArcanaPositionContent
) {
  const cX = margin + 45
  const cY = 240
  const cW = CANVAS_W - (margin + 45) * 2

  ctx.textAlign = 'left'

  if (tab === 'essence') {
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 36px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('ВРОЖДЕННЫЙ РЕСУРС И ДАР:', cX, cY)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '40px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, content.resource, cX, cY + 60, cW, 56)
  } else if (tab === 'shadow') {
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 36px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('ТЕНЕВАЯ ЛОВУШКА И МЕХАНИЗМ ЗАЩИТЫ:', cX, cY)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '38px "Cormorant Garamond", Georgia, serif'
    const lines1 = wrapEditorialText(ctx, content.shadow, cX, cY + 60, cW, 54)

    const nextY = cY + 90 + lines1 * 54
    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 36px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('ЗАДАЧА ТРАНСФОРМАЦИИ:', cX, nextY)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '38px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, content.innerTask, cX, nextY + 60, cW, 54)
  } else if (tab === 'life') {
    const rows = [
      { icon: '🕊', title: 'Отношения и Близость', text: content.lifeManifestations?.relationships },
      { icon: '⚖', title: 'Дела, Деньги и Воля', text: content.lifeManifestations?.careerAndMoney },
      { icon: '🌿', title: 'Тело и Состояние', text: content.lifeManifestations?.bodyAndSelf },
    ]

    let currY = cY
    rows.forEach((r) => {
      ctx.fillStyle = LUXURY_PALETTE.wine.primary
      ctx.font = '700 36px "Cormorant Garamond", Georgia, serif'
      ctx.fillText(`${r.icon}  ${r.title}`, cX, currY)

      ctx.fillStyle = LUXURY_PALETTE.ink.primary
      ctx.font = '34px "Cormorant Garamond", Georgia, serif'
      const lines = wrapEditorialText(ctx, r.text ?? '', cX + 12, currY + 48, cW - 12, 48)
      currY += 80 + lines * 48
    })
  } else if (tab === 'archetypes') {
    const cardH = 610
    ctx.fillStyle = 'rgba(198, 167, 107, 0.08)'
    ctx.fillRect(cX, cY, cW, cardH)
    ctx.strokeStyle = LUXURY_PALETTE.gold.primary
    ctx.lineWidth = 1.6
    ctx.strokeRect(cX, cY, cW, cardH)

    const hTrad = content.highArchetype?.tradition ? ` · ${content.highArchetype.tradition.toUpperCase()}` : ''
    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 22px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText(`ВЫСОКАЯ ОКТАВА · ЗРЕЛЫЙ АРХЕТИП${hTrad}`, cX + 30, cY + 44)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 44px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(content.highArchetype?.name ?? '', cX + 30, cY + 95)

    let storyStartY = cY + 145
    if (content.highArchetype?.keyPhrase) {
      ctx.fillStyle = LUXURY_PALETTE.gold.deep
      ctx.font = 'italic 26px "Cormorant Garamond", Georgia, serif'
      ctx.fillText(`«${content.highArchetype.keyPhrase}»`, cX + 30, cY + 138)
      storyStartY = cY + 185
    }

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '30px "Cormorant Garamond", Georgia, serif'
    const sLines = wrapEditorialText(ctx, content.highArchetype?.story || content.highArchetype?.aspect || '', cX + 30, storyStartY, cW - 60, 42)

    const aspectY = Math.max(storyStartY + sLines * 42 + 25, cY + 440)
    if (aspectY < cY + 540 && content.highArchetype?.aspect && content.highArchetype?.story) {
      ctx.fillStyle = LUXURY_PALETTE.wine.primary
      ctx.font = '700 20px "Cormorant Garamond", Georgia, serif'
      ctx.letterSpacing = '1px'
      ctx.fillText('СВЯЗЬ С АРКАНОМ:', cX + 30, aspectY)
      ctx.letterSpacing = '0px'

      ctx.fillStyle = LUXURY_PALETTE.ink.primary
      ctx.font = '28px "Cormorant Garamond", Georgia, serif'
      wrapEditorialText(ctx, content.highArchetype.aspect, cX + 30, aspectY + 34, cW - 60, 38)
    }

    const sY = cY + cardH + 40
    ctx.fillStyle = 'rgba(92, 25, 46, 0.06)'
    ctx.fillRect(cX, sY, cW, cardH)
    ctx.strokeStyle = LUXURY_PALETTE.wine.primary
    ctx.lineWidth = 1.6
    ctx.strokeRect(cX, sY, cW, cardH)

    const sTrad = content.shadowArchetype?.tradition ? ` · ${content.shadowArchetype.tradition.toUpperCase()}` : ''
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 22px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText(`ТЕНЕВОЙ АРХЕТИП · ВЫТЕСНЕННАЯ ГРАНЬ${sTrad}`, cX + 30, sY + 44)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '700 44px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(content.shadowArchetype?.name ?? '', cX + 30, sY + 95)

    let sStoryStartY = sY + 145
    if (content.shadowArchetype?.keyPhrase) {
      ctx.fillStyle = LUXURY_PALETTE.wine.primary
      ctx.font = 'italic 26px "Cormorant Garamond", Georgia, serif'
      ctx.fillText(`«${content.shadowArchetype.keyPhrase}»`, cX + 30, sY + 138)
      sStoryStartY = sY + 185
    }

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '30px "Cormorant Garamond", Georgia, serif'
    const ssLines = wrapEditorialText(ctx, content.shadowArchetype?.story || content.shadowArchetype?.aspect || '', cX + 30, sStoryStartY, cW - 60, 42)

    const sAspectY = Math.max(sStoryStartY + ssLines * 42 + 25, sY + 440)
    if (sAspectY < sY + 540 && content.shadowArchetype?.aspect && content.shadowArchetype?.story) {
      ctx.fillStyle = LUXURY_PALETTE.gold.deep
      ctx.font = '700 20px "Cormorant Garamond", Georgia, serif'
      ctx.letterSpacing = '1px'
      ctx.fillText('ТЕНЕВОЙ ПАТТЕРН:', cX + 30, sAspectY)
      ctx.letterSpacing = '0px'

      ctx.fillStyle = LUXURY_PALETTE.ink.primary
      ctx.font = '28px "Cormorant Garamond", Georgia, serif'
      wrapEditorialText(ctx, content.shadowArchetype.aspect, cX + 30, sAspectY + 34, cW - 60, 38)
    }
  } else if (tab === 'integration') {
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 36px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('ВОПРОСЫ ДЛЯ САМОНАБЛЮДЕНИЯ:', cX, cY)
    ctx.letterSpacing = '0px'

    let qY = cY + 60
    const questions: string[] = content.reflectionQuestions ?? []
    questions.forEach((q, i) => {
      ctx.fillStyle = LUXURY_PALETTE.gold.deep
      ctx.font = '700 34px "Cormorant Garamond", Georgia, serif'
      ctx.fillText(`${i + 1}.`, cX + 10, qY)

      ctx.fillStyle = LUXURY_PALETTE.ink.primary
      ctx.font = '34px "Cormorant Garamond", Georgia, serif'
      const l = wrapEditorialText(ctx, q, cX + 50, qY, cW - 50, 48)
      qY += 26 + l * 48
    })

    qY += 40
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 36px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('ВЕКТОР ИНТЕГРАЦИИ:', cX, qY)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '38px "Cormorant Garamond", Georgia, serif'
    wrapEditorialText(ctx, content.integration, cX, qY + 60, cW, 54)
  }
}

function drawSummaryProfileGrid(
  ctx: CanvasRenderingContext2D,
  margin: number,
  scores: Record<string, UserScoreRecord[]>,
  profile?: ArchetypesProfile | null
) {
  ctx.textAlign = 'left'
  ctx.fillStyle = LUXURY_PALETTE.wine.primary
  ctx.font = '700 24px "Cormorant Garamond", Georgia, serif'
  ctx.letterSpacing = '3px'
  ctx.fillText('СИСТЕМА АРХЕТИПОВ И ТЕНЕЙ · КАРТА ПРОФИЛЯ', margin + 40, margin + 48)
  ctx.letterSpacing = '0px'

  const goldGrad = createGoldGradient(ctx, margin + 30, margin + 70, CANVAS_W - margin - 30, margin + 70)
  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(margin + 35, margin + 70)
  ctx.lineTo(CANVAS_W - margin - 35, margin + 70)
  ctx.stroke()

  if (!profile) return

  const posList: { id: string; label: string; arcanaId: number; name: string }[] = [
    { id: 'soul', label: 'Душа', arcanaId: profile.positions.soul.arcanaId, name: profile.positions.soul.arcana.name },
    { id: 'personality', label: 'Личность', arcanaId: profile.positions.personality.arcanaId, name: profile.positions.personality.arcana.name },
    { id: 'gift', label: 'Дар', arcanaId: profile.positions.gift.arcanaId, name: profile.positions.gift.arcana.name },
    { id: 'destiny', label: 'Вектор', arcanaId: profile.positions.destiny.arcanaId, name: profile.positions.destiny.arcana.name },
    { id: 'shadow', label: 'Тень', arcanaId: profile.positions.shadow.arcanaId, name: profile.positions.shadow.arcana.name },
    { id: 'deep_shadow', label: 'Гл. Тень', arcanaId: profile.positions.deep_shadow.arcanaId, name: profile.positions.deep_shadow.arcana.name },
    { id: 'shadow_guardian', label: 'Страж', arcanaId: profile.positions.shadow_guardian.arcanaId, name: profile.positions.shadow_guardian.arcana.name },
    { id: 'higher_vector', label: 'Вектор Души', arcanaId: profile.positions.higher_vector.arcanaId, name: profile.positions.higher_vector.arcana.name },
    { id: 'divine_guide', label: 'Проводник', arcanaId: profile.positions.divine_guide.arcanaId, name: profile.positions.divine_guide.arcana.name },
    { id: 'integration', label: 'Интеграция', arcanaId: profile.positions.integration.arcanaId, name: profile.positions.integration.arcana.name },
    { id: 'ancestral_male_spiritual', label: 'М-Ресурс', arcanaId: profile.positions.ancestral_male_spiritual.arcanaId, name: profile.positions.ancestral_male_spiritual.arcana.name },
    { id: 'ancestral_male_material', label: 'М-Сценарий', arcanaId: profile.positions.ancestral_male_material.arcanaId, name: profile.positions.ancestral_male_material.arcana.name },
    { id: 'ancestral_male_integral', label: 'М-Норма', arcanaId: profile.positions.ancestral_male_integral.arcanaId, name: profile.positions.ancestral_male_integral.arcana.name },
    { id: 'ancestral_female_spiritual', label: 'Ж-Ресурс', arcanaId: profile.positions.ancestral_female_spiritual.arcanaId, name: profile.positions.ancestral_female_spiritual.arcana.name },
    { id: 'ancestral_female_material', label: 'Ж-Сценарий', arcanaId: profile.positions.ancestral_female_material.arcanaId, name: profile.positions.ancestral_female_material.arcana.name },
    { id: 'ancestral_female_integral', label: 'Ж-Норма', arcanaId: profile.positions.ancestral_female_integral.arcanaId, name: profile.positions.ancestral_female_integral.arcana.name },
  ]

  const gridCols = 4
  const startX = margin + 40
  const startY = 220
  const cardW = 270
  const cardH = 110
  const gapX = 35
  const gapY = 25

  posList.forEach((item, idx) => {
    const col = idx % gridCols
    const row = Math.floor(idx / gridCols)
    const x = startX + col * (cardW + gapX)
    const y = startY + row * (cardH + gapY)

    const list = scores[item.id]
    const sc = list && list.length > 0 ? list[list.length - 1].score : null

    ctx.save()
    ctx.fillStyle = 'rgba(198, 167, 107, 0.08)'
    ctx.fillRect(x, y, cardW, cardH)
    ctx.strokeStyle = 'rgba(198, 167, 107, 0.45)'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, cardW, cardH)

    ctx.textAlign = 'left'
    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 16px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '1px'
    ctx.fillText(item.label.toUpperCase(), x + 12, y + 26)
    ctx.letterSpacing = '0px'

    ctx.textAlign = 'right'
    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 20px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(toRoman(item.arcanaId), x + cardW - 12, y + 26)

    ctx.textAlign = 'left'
    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = '700 22px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(item.name, x + 12, y + 60)

    if (sc !== null) {
      for (let s = 1; s <= 5; s++) {
        ctx.fillStyle = s <= sc ? LUXURY_PALETTE.gold.primary : '#D8D0C0'
        ctx.font = '18px "Cormorant Garamond", Georgia, serif'
        ctx.fillText('✦', x + 12 + (s - 1) * 22, y + 94)
      }
      ctx.fillStyle = LUXURY_PALETTE.wine.primary
      ctx.font = '700 18px "Cormorant Garamond", Georgia, serif'
      ctx.fillText(`${sc}/5`, x + 135, y + 94)
    } else {
      ctx.fillStyle = LUXURY_PALETTE.ink.muted
      ctx.font = 'italic 17px "Cormorant Garamond", Georgia, serif'
      ctx.fillText('Не оценено', x + 12, y + 94)
    }
    ctx.restore()
  })

  // --- ВЕКТОРЫ СИНТЕЗА И АРХИТЕКТУРА ТРАНСФОРМАЦИИ ---
  const synY = 780
  ctx.textAlign = 'left'
  ctx.fillStyle = LUXURY_PALETTE.wine.primary
  ctx.font = '700 24px "Cormorant Garamond", Georgia, serif'
  ctx.letterSpacing = '2px'
  ctx.fillText('ВЕКТОРЫ СИНТЕЗА И СМЫСЛОВАЯ АРХИТЕКТУРА', startX, synY)
  ctx.letterSpacing = '0px'

  ctx.strokeStyle = goldGrad
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(startX, synY + 16)
  ctx.lineTo(CANVAS_W - margin - 35, synY + 16)
  ctx.stroke()

  const pathways = [
    {
      title: '1. ТЕНЕВОЙ УЗЕЛ · МЕХАНИЗМ ЗАЩИТЫ И БЕССОЗНАТЕЛЬНОГО',
      flow: `${toRoman(profile.positions.shadow.arcanaId)} ${profile.positions.shadow.arcana.name} (Тень)  ➔  ${toRoman(profile.positions.deep_shadow.arcanaId)} ${profile.positions.deep_shadow.arcana.name} (Гл. Тень)  ➔  ${toRoman(profile.positions.shadow_guardian.arcanaId)} ${profile.positions.shadow_guardian.arcana.name} (Страж)`,
      desc: 'От первичного автоматического паттерна — через ядерный вытесненный страх — к порогу уязвимости и истинной силе.',
    },
    {
      title: '2. ВЕКТОР РАСКРЫТИЯ · ЭВОЛЮЦИЯ СОЗНАНИЯ',
      flow: `${toRoman(profile.positions.soul.arcanaId)} ${profile.positions.soul.arcana.name} (Душа)  ➔  ${toRoman(profile.positions.destiny.arcanaId)} ${profile.positions.destiny.arcana.name} (Вектор)  ➔  ${toRoman(profile.positions.higher_vector.arcanaId)} ${profile.positions.higher_vector.arcana.name} (Высший Путь)`,
      desc: 'От врождённой сути Души — через земное предназначение и мастерство — к духовному маяку высшей октавы.',
    },
    {
      title: '3. ВЕРТИКАЛЬ ПРОВОДНИЧЕСТВА · РЕАЛИЗАЦИЯ И ДАР',
      flow: `${toRoman(profile.positions.gift.arcanaId)} ${profile.positions.gift.arcana.name} (Дар)  ➔  ${toRoman(profile.positions.divine_guide.arcanaId)} ${profile.positions.divine_guide.arcana.name} (Проводник)`,
      desc: 'От практического инструмента воплощения ценности — к чистому каналу служения и трансценденции.',
    },
    {
      title: '4. РОДОВАЯ ТРАНСФОРМАЦИЯ · МУЖСКАЯ И ЖЕНСКАЯ ВЕТВИ (V0.7)',
      flow: `М: ${toRoman(profile.positions.ancestral_male_spiritual.arcanaId)} Ресурс ➔ ${toRoman(profile.positions.ancestral_male_material.arcanaId)} Сценарий ➔ ${toRoman(profile.positions.ancestral_male_integral.arcanaId)} Новая Норма  |  Ж: ${toRoman(profile.positions.ancestral_female_spiritual.arcanaId)} Ресурс ➔ ${toRoman(profile.positions.ancestral_female_material.arcanaId)} Сценарий ➔ ${toRoman(profile.positions.ancestral_female_integral.arcanaId)} Новая Норма`,
      desc: 'Преобразование родовой памяти: признание ресурса предков, исцеление повторяющегося сценария и рождение новой нормы.',
    },
    {
      title: '5. ТОЧКА СБОРКИ · ИНТЕГРАЦИЯ ЛИЧНОСТИ',
      flow: `Ключевой Аркан: ${toRoman(profile.positions.integration.arcanaId)} · ${profile.positions.integration.arcana.name}`,
      desc: 'Алхимический союз Света и Тени: возвращение целостности, снятие дуальности и полное авторство своей судьбы.',
    },
  ]

  let curPathY = synY + 52
  pathways.forEach((p) => {
    ctx.fillStyle = LUXURY_PALETTE.gold.deep
    ctx.font = '700 20px "Cormorant Garamond", Georgia, serif'
    ctx.letterSpacing = '1px'
    ctx.fillText(p.title, startX, curPathY)
    ctx.letterSpacing = '0px'

    ctx.fillStyle = LUXURY_PALETTE.wine.primary
    ctx.font = '700 24px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(p.flow, startX + 10, curPathY + 34)

    ctx.fillStyle = LUXURY_PALETTE.ink.primary
    ctx.font = 'italic 21px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(p.desc, startX + 10, curPathY + 66)

    curPathY += 105
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = LUXURY_PALETTE.wine.primary
  ctx.font = 'italic 24px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('«Тень не уничтожается — она признается и становится высшей силой».', CANVAS_W / 2, 1490)
}

export function makeGildedEdgesTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 512
  const ctx = cv.getContext('2d')!

  // Базовый золотой градиент среза страниц
  const grad = ctx.createLinearGradient(0, 0, 512, 0)
  grad.addColorStop(0, '#B38024')
  grad.addColorStop(0.25, '#DDB868')
  grad.addColorStop(0.5, '#F3E2A8')
  grad.addColorStop(0.75, '#C69C3C')
  grad.addColorStop(1, '#8C6219')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // Тончайшие слои отдельных страниц бумаги (эффект многотомного фолианта)
  for (let y = 0; y < 512; y += 2) {
    const shade = (Math.sin(y * 0.8) + Math.cos(y * 2.3) + 2) / 4
    if (shade > 0.65) {
      ctx.fillStyle = 'rgba(255, 248, 220, 0.45)'
    } else if (shade < 0.35) {
      ctx.fillStyle = 'rgba(60, 40, 15, 0.55)'
    } else {
      ctx.fillStyle = 'rgba(198, 156, 60, 0.3)'
    }
    ctx.fillRect(0, y, 512, 1)
  }

  // Мягкие блики золотого тиснения
  const sheenGrad = ctx.createLinearGradient(0, 0, 512, 0)
  sheenGrad.addColorStop(0, 'rgba(0,0,0,0.15)')
  sheenGrad.addColorStop(0.3, 'rgba(255,255,230,0.3)')
  sheenGrad.addColorStop(0.6, 'rgba(255,215,0,0.15)')
  sheenGrad.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = sheenGrad
  ctx.fillRect(0, 0, 512, 512)

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 1)
  tex.generateMipmaps = true
  return tex
}

