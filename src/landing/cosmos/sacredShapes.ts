/**
 * Фигуры священной геометрии — линии в единичном круге (радиус ≈ 1).
 * Модуль без three.js: его используют и иконки интерфейса, и 3D-поле.
 *
 * Каждая фигура — набор ломаных; для метаморфоз любая фигура переводится
 * в ровно N коротких отрезков (sampleFigure), поэтому отрезок i одной фигуры
 * всегда может «перетечь» в отрезок i другой.
 *
 * Объёмные фигуры (меркаба, векторное равновесие) задаются в 3D и живут
 * во вращении: у меркабы два тетраэдра крутятся навстречу друг другу.
 */

type P3 = [number, number, number]

interface Poly {
  pts: P3[]
  closed: boolean
  /** Кривые получают больше отрезков — окружности остаются гладкими */
  curved?: boolean
  /** Часть фигуры со своим вращением (0/1) — два тетраэдра меркабы */
  part?: 0 | 1
}

/** flat — вращается по кругу; upright — у фигуры есть верх и низ, только покачивается */
export type FigureKind = 'flat' | 'upright' | 'merkaba' | 'solid'

export interface Figure {
  id: FigureId
  kind: FigureKind
  polys: Poly[]
}

export type FigureId =
  | 'merkaba'
  | 'seed'
  | 'flower'
  | 'egg'
  | 'fruit'
  | 'metatron'
  | 'vesica'
  | 'germ'
  | 'tree'
  | 'tetra64'
  | 'equilibrium'

const TAU = Math.PI * 2
const SQ3 = Math.sqrt(3)

// ---------------------------------------------------------------------------
// Примитивы
// ---------------------------------------------------------------------------

function circle(cx: number, cy: number, r: number, n = 192): Poly {
  const pts: P3[] = []
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * TAU
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0])
  }
  return { pts, closed: true, curved: true }
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 96): Poly {
  const pts: P3[] = []
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0])
  }
  return { pts, closed: false, curved: true }
}

function line(a: P3, b: P3, part?: 0 | 1): Poly {
  return { pts: [a, b], closed: false, part }
}

/** Разрезает кривую, оставляя куски внутри области */
function clip(poly: Poly, inside: (x: number, y: number) => boolean, steps = 2): Poly[] {
  const src = poly.closed ? [...poly.pts, poly.pts[0]] : poly.pts
  // уплотняем, чтобы граница резалась точно
  const dense: P3[] = []
  for (let i = 0; i < src.length - 1; i++) {
    const [a, b] = [src[i], src[i + 1]]
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      dense.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t])
    }
  }
  dense.push(src[src.length - 1])
  const out: Poly[] = []
  let run: P3[] = []
  for (const p of dense) {
    if (inside(p[0], p[1])) run.push(p)
    else {
      if (run.length > 1) out.push({ pts: run, closed: false, curved: poly.curved })
      run = []
    }
  }
  if (run.length > 1) out.push({ pts: run, closed: false, curved: poly.curved })
  return out
}

/** Точки гексагональной решётки с шагом d в пределах «колец» ≤ rings */
function hexLattice(d: number, rings: number): { p: [number, number]; ring: number }[] {
  const out: { p: [number, number]; ring: number }[] = []
  for (let a = -rings; a <= rings; a++) {
    for (let b = -rings; b <= rings; b++) {
      const ring = Math.max(Math.abs(a), Math.abs(b), Math.abs(a + b))
      if (ring > rings) continue
      // ось «колонны» вертикальна — как у Цветка Жизни на рисунке
      out.push({ p: [(b * SQ3 * d) / 2, a * d + (b * d) / 2], ring })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Фигуры
// ---------------------------------------------------------------------------

/** Звёздный тетраэдр: вершина верхнего тетраэдра вверх, одна вершина основания — назад */
function merkaba(): Figure {
  const r = (2 * Math.SQRT2) / 3
  const base = [-90, 30, 150].map((deg) => {
    const a = (deg * Math.PI) / 180
    return [Math.cos(a) * r, -1 / 3, Math.sin(a) * r] as P3
  })
  const up: P3[] = [[0, 1, 0], ...base]
  const down = up.map((p) => [-p[0], -p[1], -p[2]] as P3)
  const polys: Poly[] = []
  const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]]
  for (const [i, j] of edges) polys.push(line(up[i], up[j], 0), line(down[i], down[j], 1))
  return { id: 'merkaba', kind: 'merkaba', polys }
}

function seed(): Figure {
  const r = 0.5
  const polys = [circle(0, 0, r)]
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + (i / 6) * TAU
    polys.push(circle(Math.cos(a) * r, Math.sin(a) * r, r))
  }
  polys.push(circle(0, 0, 1, 256))
  return { id: 'seed', kind: 'flat', polys }
}

function flower(): Figure {
  const r = 1 / 3
  const polys: Poly[] = []
  const inside = (x: number, y: number) => x * x + y * y <= 1.0001
  for (const { p, ring } of hexLattice(r, 3)) {
    const c = circle(p[0], p[1], r, 160)
    if (ring <= 2) polys.push(c)
    else polys.push(...clip(c, inside))
  }
  polys.push(circle(0, 0, 1, 256), circle(0, 0, 1.045, 256))
  return { id: 'flower', kind: 'flat', polys }
}

function egg(): Figure {
  const r = 1 / 3
  const polys = [circle(0, 0, r)]
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + (i / 6) * TAU
    polys.push(circle(Math.cos(a) * 2 * r, Math.sin(a) * 2 * r, r))
  }
  return { id: 'egg', kind: 'flat', polys }
}

const FRUIT_R = 0.2
function fruitCenters(): [number, number][] {
  const c: [number, number][] = [[0, 0]]
  for (const k of [2, 4]) {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 2 + (i / 6) * TAU
      c.push([Math.cos(a) * k * FRUIT_R, Math.sin(a) * k * FRUIT_R])
    }
  }
  return c
}

function fruit(): Figure {
  return { id: 'fruit', kind: 'flat', polys: fruitCenters().map(([x, y]) => circle(x, y, FRUIT_R, 128)) }
}

function metatron(): Figure {
  const c = fruitCenters()
  const polys = c.map(([x, y]) => circle(x, y, FRUIT_R, 128))
  for (let i = 0; i < c.length; i++) {
    for (let j = i + 1; j < c.length; j++) polys.push(line([c[i][0], c[i][1], 0], [c[j][0], c[j][1], 0]))
  }
  return { id: 'metatron', kind: 'flat', polys }
}

function vesica(): Figure {
  return {
    id: 'vesica',
    kind: 'flat',
    polys: [circle(0, 0, 1, 256), circle(0, 0.38, 0.62), circle(0, -0.38, 0.62), circle(0, 0, 0.24, 128)],
  }
}

/** Зародыш жизни: шесть лепестков-дуг внутри круга */
function germ(): Figure {
  const polys = [circle(0, 0, 1, 256)]
  for (let k = 0; k < 6; k++) {
    const t = Math.PI / 2 + (k / 6) * TAU
    polys.push(arc(Math.cos(t), Math.sin(t), 1, t + (2 * Math.PI) / 3, t + (4 * Math.PI) / 3))
  }
  polys.push(circle(0, 0, 0.12, 64))
  return { id: 'germ', kind: 'flat', polys }
}

/** Древо Жизни: десять сфирот и 22 пути — по одному на Старший Аркан */
function tree(): Figure {
  const k = 1 / 2.3
  const x = (SQ3 / 2) * k
  const S: Record<string, [number, number]> = {
    K: [0, 2 * k],
    Ch: [x, 1.5 * k],
    B: [-x, 1.5 * k],
    Che: [x, 0.5 * k],
    G: [-x, 0.5 * k],
    T: [0, 0],
    N: [x, -0.5 * k],
    H: [-x, -0.5 * k],
    Y: [0, -k],
    M: [0, -2 * k],
  }
  const paths = [
    'K-Ch', 'K-B', 'K-T', 'Ch-B', 'Ch-T', 'Ch-Che', 'B-T', 'B-G', 'Che-G', 'Che-T', 'Che-N',
    'G-T', 'G-H', 'T-N', 'T-Y', 'T-H', 'N-H', 'N-Y', 'N-M', 'H-Y', 'H-M', 'Y-M',
  ]
  const rr = 0.115
  const polys: Poly[] = Object.values(S).map(([cx, cy]) => circle(cx, cy, rr, 96))
  for (const p of paths) {
    const [a, b] = p.split('-').map((id) => S[id])
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    const ux = dx / len
    const uy = dy / len
    polys.push(line([a[0] + ux * rr, a[1] + uy * rr, 0], [b[0] - ux * rr, b[1] - uy * rr, 0]))
  }
  polys.push(circle(0, 0, 1, 256))
  return { id: 'tree', kind: 'upright', polys }
}

/** 64 тетраэдра: треугольная решётка внутри гексаграммы */
function tetra64(): Figure {
  const up: [number, number][] = [[0, 1], [-SQ3 / 2, -0.5], [SQ3 / 2, -0.5]]
  const down = up.map(([x, y]) => [-x, -y] as [number, number])
  const inTri = (t: [number, number][], x: number, y: number) => {
    const s = (a: [number, number], b: [number, number]) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])
    const d1 = s(t[0], t[1])
    const d2 = s(t[1], t[2])
    const d3 = s(t[2], t[0])
    const e = -1e-4
    return (d1 >= e && d2 >= e && d3 >= e) || (d1 <= -e && d2 <= -e && d3 <= -e)
  }
  const inside = (x: number, y: number) => inTri(up, x, y) || inTri(down, x, y)
  const polys: Poly[] = []
  // три семейства линий решётки (0°, 60°, 120°) с шагом 1/4 по нормали
  for (const deg of [0, 60, 120, 90, 30, 150]) {
    const a = (deg * Math.PI) / 180
    const dir: [number, number] = [Math.cos(a), Math.sin(a)]
    const nrm: [number, number] = [-dir[1], dir[0]]
    const lattice = deg % 60 === 0
    const offsets = lattice ? [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1] : [0]
    for (const c of offsets) {
      const pts: P3[] = []
      for (let i = 0; i <= 240; i++) {
        const t = -1.2 + (2.4 * i) / 240
        pts.push([nrm[0] * c + dir[0] * t, nrm[1] * c + dir[1] * t, 0])
      }
      polys.push(...clip({ pts, closed: false }, inside, 1))
    }
  }
  return { id: 'tetra64', kind: 'flat', polys }
}

/** Векторное равновесие (кубооктаэдр): 24 ребра и 12 векторов из центра */
function equilibrium(): Figure {
  const v: P3[] = []
  const s = Math.SQRT1_2
  for (const a of [-1, 1]) {
    for (const b of [-1, 1]) {
      v.push([a * s, b * s, 0], [a * s, 0, b * s], [0, a * s, b * s])
    }
  }
  const polys: Poly[] = []
  for (let i = 0; i < v.length; i++) {
    for (let j = i + 1; j < v.length; j++) {
      const d = Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1], v[i][2] - v[j][2])
      if (Math.abs(d - 1) < 1e-3) polys.push(line(v[i], v[j]))
    }
    polys.push(line([0, 0, 0], v[i]))
  }
  return { id: 'equilibrium', kind: 'solid', polys }
}

const BUILDERS: Record<FigureId, () => Figure> = {
  merkaba,
  seed,
  flower,
  egg,
  fruit,
  metatron,
  vesica,
  germ,
  tree,
  tetra64,
  equilibrium,
}

/** Русские имена фигур — подписи в интерфейсе */
export const FIGURE_NAMES: Record<FigureId, string> = {
  merkaba: 'Меркаба',
  seed: 'Семя Жизни',
  flower: 'Цветок Жизни',
  egg: 'Яйцо Жизни',
  fruit: 'Плод Жизни',
  metatron: 'Куб Метатрона',
  vesica: 'Весика Пискис',
  germ: 'Зародыш Жизни',
  tree: 'Древо Жизни',
  tetra64: '64 Тетраэдра',
  equilibrium: 'Векторное равновесие',
}

const figCache = new Map<FigureId, Figure>()
export function getFigure(id: FigureId): Figure {
  let f = figCache.get(id)
  if (!f) {
    f = BUILDERS[id]()
    figCache.set(id, f)
  }
  return f
}

// ---------------------------------------------------------------------------
// Порядок прорисовки: «световое перо»
// ---------------------------------------------------------------------------

/**
 * У каждой точки фигуры есть «время прорисовки» dp ∈ [0, 1]: линии ближе
 * к центру начинают раньше, каждая линия ведётся пером от начала к концу.
 * По dp синхронизированы все три слоя: линии выгорают и прорисовываются,
 * а частицы срываются с места и прилетают ровно к кончику пера.
 */
interface PolyInfo {
  pts: P3[]
  cum: number[]
  length: number
  delay: number
  part: number
  curved: boolean
}

const infoCache = new Map<FigureId, PolyInfo[]>()

function polyInfo(id: FigureId): PolyInfo[] {
  const hit = infoCache.get(id)
  if (hit) return hit
  const fig = getFigure(id)
  const raw = fig.polys.map((poly) => {
    const pts = poly.closed ? [...poly.pts, poly.pts[0]] : poly.pts
    const cum = [0]
    let cx = 0
    let cy = 0
    let cz = 0
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]
      const b = pts[i]
      cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))
    }
    for (const p of pts) {
      cx += p[0]
      cy += p[1]
      cz += p[2]
    }
    const n = pts.length
    return { pts, cum, length: cum[cum.length - 1], dist: Math.hypot(cx / n, cy / n, cz / n), part: poly.part ?? 0, curved: !!poly.curved }
  })
  // задержка — по удалённости от центра, одинаковые кольца стартуют вместе
  const dists = [...new Set(raw.map((r) => Math.round(r.dist * 50) / 50))].sort((a, b) => a - b)
  const info = raw.map((r) => {
    const rank = dists.indexOf(Math.round(r.dist * 50) / 50)
    return { pts: r.pts, cum: r.cum, length: r.length, delay: dists.length > 1 ? rank / (dists.length - 1) : 0, part: r.part, curved: r.curved }
  })
  infoCache.set(id, info)
  return info
}

const DELAY_SHARE = 0.42

function pointAt(poly: PolyInfo, l: number): P3 {
  const { pts, cum } = poly
  let lo = 1
  let hi = cum.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cum[mid] < l) lo = mid + 1
    else hi = mid
  }
  const i = Math.max(1, lo)
  const t = (l - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1])
  const a = pts[i - 1]
  const b = pts[i]
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function drawParam(poly: PolyInfo, s: number) {
  return poly.delay * DELAY_SHARE + s * (1 - DELAY_SHARE)
}

/** Распределяет count по линиям пропорционально длине (кривым — с запасом) */
function allocate(info: PolyInfo[], count: number, min: number) {
  const w = info.map((p) => p.length * (p.curved ? 1.5 : 1))
  const W = w.reduce((a, b) => a + b, 0)
  const counts = w.map((x) => Math.max(min, Math.floor((count * x) / W)))
  let diff = count - counts.reduce((a, b) => a + b, 0)
  const order = w.map((_, i) => i).sort((a, b) => w[b] - w[a])
  for (let k = 0; diff !== 0 && k < 1e6; k = (k + 1) % order.length) {
    const i = order[k]
    if (diff > 0) {
      counts[i]++
      diff--
    } else if (counts[i] > min) {
      counts[i]--
      diff++
    }
  }
  return counts
}

// ---------------------------------------------------------------------------
// Линии: отрезки для светового пера
// ---------------------------------------------------------------------------

export interface FigureLines {
  /** N × (x0 y0 z0 x1 y1 z1) */
  seg: Float32Array
  /** Время прорисовки начала и конца отрезка */
  dp: Float32Array
  part: Float32Array
  count: number
}

const linesCache = new Map<string, FigureLines>()

export function figureLines(id: FigureId, N: number): FigureLines {
  const key = `${id}:${N}`
  const hit = linesCache.get(key)
  if (hit) return hit
  const info = polyInfo(id)
  const counts = allocate(info, N, 3)
  const seg: number[] = []
  const dp: number[] = []
  const part: number[] = []
  info.forEach((poly, pi) => {
    const n = counts[pi]
    let prev = pointAt(poly, 0)
    for (let j = 1; j <= n; j++) {
      const next = pointAt(poly, (poly.length * j) / n)
      seg.push(...prev, ...next)
      dp.push(drawParam(poly, (j - 1) / n), drawParam(poly, j / n))
      part.push(poly.part)
      prev = next
    }
  })
  const out = { seg: new Float32Array(seg), dp: new Float32Array(dp), part: new Float32Array(part), count: part.length }
  linesCache.set(key, out)
  return out
}

// ---------------------------------------------------------------------------
// Частицы: точки на линиях фигуры
// ---------------------------------------------------------------------------

/**
 * RGBA на частицу: xyz — место на линии (с лёгким «ореолом» вокруг),
 * w — время прорисовки dp + 2 × номер части (для раздельного вращения).
 * Порядок частиц перемешан детерминированно, чтобы частица i разных
 * фигур оказывалась в случайном месте — поток получается богаче.
 */
export function figureParticles(id: FigureId, count: number): Float32Array {
  const info = polyInfo(id)
  const counts = allocate(info, count, 1)
  const out = new Float32Array(count * 4)
  const rnd = mulberry(hashString(id))
  let k = 0
  info.forEach((poly, pi) => {
    const n = counts[pi]
    for (let j = 0; j < n; j++) {
      const s = (j + rnd()) / n
      const p = pointAt(poly, s * poly.length)
      // ореол: большинство частиц на линии, часть — облачком вокруг
      const halo = rnd() < 0.78 ? 0.004 : 0.035
      const g = gauss(rnd)
      out[k * 4] = p[0] + g[0] * halo
      out[k * 4 + 1] = p[1] + g[1] * halo
      out[k * 4 + 2] = p[2] + g[2] * halo
      out[k * 4 + 3] = drawParam(poly, s) + poly.part * 2
      k++
    }
  })
  // детерминированное перемешивание (Фишер — Йейтс)
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    for (let c = 0; c < 4; c++) {
      const t = out[i * 4 + c]
      out[i * 4 + c] = out[j * 4 + c]
      out[j * 4 + c] = t
    }
  }
  return out
}

/** Облако, из которого фигура рождается при загрузке */
export function cloudParticles(count: number): Float32Array {
  const out = new Float32Array(count * 4)
  const rnd = mulberry(7)
  for (let i = 0; i < count; i++) {
    const a = rnd() * TAU
    const r = 1.1 + Math.pow(rnd(), 0.8) * 1.3
    out[i * 4] = Math.cos(a) * r
    out[i * 4 + 1] = Math.sin(a) * r
    out[i * 4 + 2] = (rnd() - 0.5) * 2.5
    out[i * 4 + 3] = rnd() * 0.2
  }
  return out
}

function hashString(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rnd: () => number): P3 {
  const g = () => {
    const u = Math.max(1e-6, rnd())
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rnd())
  }
  return [g(), g(), g()]
}

// ---------------------------------------------------------------------------
// SVG: те же фигуры для иконок интерфейса
// ---------------------------------------------------------------------------

const svgCache = new Map<FigureId, string>()

/** Поворот «гербовой» позы (как у 3D-поля в момент t = 0), без three.js */
function restMatrix(kind: FigureKind): number[] {
  if (kind === 'merkaba') {
    const c = Math.cos(MERKABA_TILT)
    const s = Math.sin(MERKABA_TILT)
    return [1, 0, 0, 0, c, -s, 0, s, c]
  }
  if (kind === 'solid') {
    // ось (1,1,1) — к зрителю: формула Родрига
    const k = [1 / Math.SQRT2, -1 / Math.SQRT2, 0]
    const c = 1 / Math.sqrt(3)
    const s = Math.sqrt(2 / 3)
    const t = 1 - c
    const [x, y, z] = k
    return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c]
  }
  return [1, 0, 0, 0, 1, 0, 0, 0, 1]
}

/** Путь SVG фигуры в «гербовой» позе, координаты в круге радиуса 100 */
export function figureSvgPath(id: FigureId): string {
  const hit = svgCache.get(id)
  if (hit) return hit
  const fig = getFigure(id)
  const m = restMatrix(fig.kind)
  let d = ''
  for (const poly of fig.polys) {
    const src = poly.closed ? [...poly.pts, poly.pts[0]] : poly.pts
    const stride = poly.curved ? Math.max(1, Math.floor(src.length / 72)) : 1
    const pts = src.filter((_, i) => i % stride === 0 || i === src.length - 1)
    pts.forEach((p, i) => {
      const x = m[0] * p[0] + m[1] * p[1] + m[2] * p[2]
      const y = m[3] * p[0] + m[4] * p[1] + m[5] * p[2]
      d += `${i === 0 ? 'M' : 'L'}${(x * 100).toFixed(1)} ${(-y * 100).toFixed(1)}`
    })
  }
  svgCache.set(id, d)
  return d
}

/** Меркаба чуть «сверху» — как в знаке */
export const MERKABA_TILT = 0.36
