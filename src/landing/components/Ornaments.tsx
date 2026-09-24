import type { ReactNode } from 'react'
import { ROMANS } from '../content'

const TAU = Math.PI * 2
const ALL_ROMANS = [...ROMANS, 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII']

function polar(r: number, i: number, n: number, offset = -Math.PI / 2) {
  const a = offset + (i / n) * TAU
  return [r * Math.cos(a), r * Math.sin(a)] as const
}

/** Звёздный многоугольник {n/k}: одна непрерывная линия через n точек окружности */
function starPath(r: number, n: number, k: number, offset = -Math.PI / 2) {
  let d = ''
  for (let step = 0; step <= n; step++) {
    const [x, y] = polar(r, (step * k) % n, n, offset)
    d += `${step === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `
  }
  return d
}

function ticks(r1: number, r2: number, n: number) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const [x1, y1] = polar(r1, i, n)
    const [x2, y2] = polar(r2, i, n)
    d += `M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} `
  }
  return d
}

const WHEEL = {
  star22: starPath(292, 22, 7),
  star7: starPath(146, 7, 3),
  ticksMajor: ticks(372, 352, 22),
  ticksMinor: ticks(326, 318, 88),
}

/**
 * Колесо 22 Старших Арканов: кольцо с римскими номерами, звезда {22/7}
 * и гептаграмма семи путей в центре. Линии рисуются через pathLength=1,
 * поэтому анимация «прорисовки» — просто stroke-dashoffset 1 → 0.
 */
export function ArcanaWheel({ className = '' }: { className?: string }) {
  return (
    <svg className={`lx-wheel ${className}`} viewBox="-400 -400 800 800" aria-hidden="true">
      <defs>
        <linearGradient id="lx-gold-stroke" x1="0" y1="-1" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#E7CF96" />
          <stop offset="0.5" stopColor="#C6A76B" />
          <stop offset="1" stopColor="#8E7240" />
        </linearGradient>
      </defs>
      <g className="lx-wheel__rings" fill="none" stroke="url(#lx-gold-stroke)">
        <circle className="lx-draw" pathLength={1} r={384} strokeWidth={1.2} />
        <circle className="lx-draw" pathLength={1} r={372} strokeWidth={0.6} />
        <path className="lx-draw" pathLength={1} d={WHEEL.ticksMajor} strokeWidth={0.8} />
        <circle className="lx-draw" pathLength={1} r={326} strokeWidth={0.6} />
        <path className="lx-draw lx-wheel__minor" pathLength={1} d={WHEEL.ticksMinor} strokeWidth={0.5} />
      </g>
      <g className="lx-wheel__numerals">
        {ALL_ROMANS.map((r, i) => {
          const angle = (i / 22) * 360 + 360 / 44
          return (
            <text key={r} transform={`rotate(${angle}) translate(0 -337)`} textAnchor="middle" dominantBaseline="middle">
              {r}
            </text>
          )
        })}
      </g>
      <g className="lx-wheel__star" fill="none" stroke="url(#lx-gold-stroke)">
        <path className="lx-draw" pathLength={1} d={WHEEL.star22} strokeWidth={0.55} />
        <circle className="lx-wheel__dots" pathLength={1} r={292} strokeWidth={0.4} strokeDasharray="0.004 0.006" />
      </g>
      <g className="lx-wheel__core" fill="none" stroke="url(#lx-gold-stroke)">
        <circle className="lx-draw" pathLength={1} r={158} strokeWidth={0.7} />
        <path className="lx-draw" pathLength={1} d={WHEEL.star7} strokeWidth={0.8} />
        <circle className="lx-draw" pathLength={1} r={62} strokeWidth={0.7} />
        <path className="lx-draw" pathLength={1} d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z" strokeWidth={0.9} />
      </g>
    </svg>
  )
}

/** Четырёхлучевая звезда — монограмма бренда */
export function StarMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true" className="lx-starmark">
      <path d="M0 -12 L2.6 -2.6 L12 0 L2.6 2.6 L0 12 L-2.6 2.6 L-12 0 L-2.6 -2.6 Z" fill="currentColor" />
    </svg>
  )
}

const SIGILS: Record<string, ReactNode> = {
  // Звук голоса: волны, расходящиеся от центра
  'vocal-sound-therapy': (
    <>
      <circle cx="60" cy="60" r="6" />
      <path d="M44 44 A22 22 0 0 0 44 76 M76 44 A22 22 0 0 1 76 76" />
      <path d="M34 34 A36 36 0 0 0 34 86 M86 34 A36 36 0 0 1 86 86" />
      <path d="M24 24 A50 50 0 0 0 24 96 M96 24 A50 50 0 0 1 96 96" />
    </>
  ),
  // Таро: карта со звездой
  'taro-5d': (
    <>
      <rect x="34" y="16" width="52" height="88" rx="3" />
      <rect x="40" y="22" width="40" height="76" rx="1.5" />
      <path d="M60 42 L64 56 L78 60 L64 64 L60 78 L56 64 L42 60 L56 56 Z" />
    </>
  ),
  // Тело и дыхание: весика и линия диафрагмы
  'feminine-body-practices': (
    <>
      <circle cx="50" cy="60" r="26" />
      <circle cx="70" cy="60" r="26" />
      <path d="M22 60 H98" />
      <circle cx="60" cy="60" r="3" />
    </>
  ),
  // Ченнелинг: вертикаль и лучи
  'channeling-mastery': (
    <>
      <path d="M60 14 V106" />
      <circle cx="60" cy="34" r="12" />
      <path d="M60 34 L34 18 M60 34 L86 18 M60 34 L28 36 M60 34 L92 36" />
      <path d="M44 106 H76" />
    </>
  ),
  // Эволюция мастера: ступени к звезде
  'master-evolution': (
    <>
      <path d="M24 100 H96 M34 84 H86 M44 68 H76" />
      <path d="M60 18 L64 34 L80 38 L64 42 L60 58 L56 42 L40 38 L56 34 Z" />
    </>
  ),
  // Отношения: два сцепленных кольца
  'relationships-and-self': (
    <>
      <circle cx="46" cy="56" r="24" />
      <circle cx="74" cy="56" r="24" />
      <path d="M60 86 V104 M48 104 H72" />
    </>
  ),
  // Тантра: гексаграмма в круге
  'feminine-tantra': (
    <>
      <circle cx="60" cy="60" r="44" />
      <path d="M60 22 L93 79 H27 Z" />
      <path d="M60 98 L27 41 H93 Z" />
    </>
  ),
}

export function Sigil({ id, className = '' }: { id: string; className?: string }) {
  return (
    <svg className={`lx-sigil ${className}`} viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.1}>
      {SIGILS[id] ?? <circle cx="60" cy="60" r="40" />}
    </svg>
  )
}
