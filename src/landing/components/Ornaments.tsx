import { useEffect, useMemo, useRef } from 'react'
import { figureSvgPath, type FigureId } from '../cosmos/sacredShapes'

/**
 * Символ священной геометрии — те же фигуры, что собирает 3D-поле,
 * только в SVG. С draw линия прорисовывается световым пером, когда
 * символ впервые появляется на экране.
 */
export function SacredIcon({
  id,
  size,
  className = '',
  draw = false,
  title,
}: {
  id: FigureId
  size?: number
  className?: string
  /** Прорисовка при первом появлении на экране */
  draw?: boolean
  title?: string
}) {
  const d = useMemo(() => figureSvgPath(id), [id])
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = svg.current
    if (!draw || !el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.classList.add('is-drawn')
        io.disconnect()
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [draw])

  return (
    <svg
      ref={svg}
      className={`lx-sacred ${draw ? 'lx-sacred--draw' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="-112 -112 224 224"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path className="lx-sacred__glow" d={d} pathLength={1} />
      <path className="lx-sacred__line" d={d} pathLength={1} />
    </svg>
  )
}

/** Меркаба — знак Алины: гексаграмма звёздного тетраэдра с внутренним тетраэдром */
const MERKABA_PATH =
  'M0 -210 L-181 104 L181 104 Z M-181 -104 L181 -104 L0 210 Z M0 -210 V0 M0 -102 L-90 52 L90 52 Z M-181 104 L0 0 L181 104'

export function MerkabaMark({ size = 18, strokeWidth = 1.1 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="-230 -230 460 460" aria-hidden="true" className="lx-merkamark">
      <path
        d={MERKABA_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
