import { useEffect, useRef } from 'react'

/**
 * Живая меркаба для заставки: звёздный тетраэдр в перспективе.
 * Два тетраэдра вращаются навстречу друг другу, грани светятся как кристалл,
 * по рёбрам бегут импульсы энергии, вокруг — наклонённое кольцо поля.
 * Рисуется на обычном 2D-холсте — появляется сразу, до загрузки 3D-сцены.
 */

type V3 = [number, number, number]

const TILT = 0.36
const R_BASE = (2 * Math.SQRT2) / 3
const UP: V3[] = [
  [0, 1, 0],
  ...[-90, 30, 150].map((deg) => {
    const a = (deg * Math.PI) / 180
    return [Math.cos(a) * R_BASE, -1 / 3, Math.sin(a) * R_BASE] as V3
  }),
]
const DOWN: V3[] = UP.map(([x, y, z]) => [-x, -y, -z])
const EDGES = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]]
const FACES = [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]]
const LIGHT: V3 = (() => {
  const l: V3 = [-0.45, 0.65, 0.62]
  const n = Math.hypot(...l)
  return [l[0] / n, l[1] / n, l[2] / n]
})()

// Палитры: ночью — светящееся золото, днём — чернила старого золота на кости
const PALETTES = {
  dark: { DEEP: [150, 108, 52], GOLD: [236, 190, 112], LIGHT_GOLD: [255, 236, 196], AMBER: [255, 196, 110], WINE: [190, 70, 110] },
  light: { DEEP: [150, 120, 70], GOLD: [150, 112, 56], LIGHT_GOLD: [96, 66, 26], AMBER: [196, 128, 30], WINE: [140, 50, 80] },
}

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)

function rotate([x, y, z]: V3, yaw: number, tilt: number, roll: number): V3 {
  // Ry(yaw) → Rx(tilt) → Rz(roll)
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const x1 = x * cy + z * sy
  const z1 = -x * sy + z * cy
  const cx = Math.cos(tilt)
  const sx = Math.sin(tilt)
  const y2 = y * cx - z1 * sx
  const z2 = y * sx + z1 * cx
  const cr = Math.cos(roll)
  const sr = Math.sin(roll)
  return [x1 * cr - y2 * sr, x1 * sr + y2 * cr, z2]
}

export function MerkabaLoader({ className = '', theme = 'light' }: { className?: string; theme?: 'light' | 'dark' }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx) return
    const { DEEP, GOLD, LIGHT_GOLD, AMBER, WINE } = PALETTES[theme]
    const glowOp = theme === 'dark' ? 'lighter' : 'source-over'
    const haloK = theme === 'dark' ? 1 : 0.55
    let raf = 0
    let start = 0
    let size = 0
    let dpr = 1

    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = cv.clientWidth
      cv.width = cv.height = Math.round(size * dpr)
    }
    fit()
    window.addEventListener('resize', fit)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!start) start = now
      const t = (now - start) / 1000
      const S = size
      const c = S / 2
      const R = S * 0.36
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, S, S)
      // свет складывается, как в 3D-сцене
      ctx.globalCompositeOperation = glowOp

      const draw = ease(t / 1.7)
      const alive = clamp01((t - 1.2) / 0.8)
      const yaw = t * 0.75 + (1 - draw) * 1.6
      const tilt = TILT + 0.06 * Math.sin(t * 0.9)
      const roll = 0.05 * Math.sin(t * 0.6)
      const breath = 1 + 0.018 * Math.sin(t * 1.6)
      const D = 4.2

      const project = (p: V3) => {
        const k = (D / (D - p[2])) * breath
        return { x: c + p[0] * R * k, y: c - p[1] * R * k, z: p[2] }
      }
      const up = UP.map((p) => rotate(p, yaw, tilt, roll))
      const down = DOWN.map((p) => rotate(p, -yaw, tilt, roll))

      // Кольца поля: внешний круг и наклонённая орбита вокруг меркабы
      ctx.lineWidth = 0.7
      ctx.strokeStyle = rgba(GOLD, 0.35 * draw)
      ctx.beginPath()
      ctx.arc(c, c, R * 1.3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * draw)
      ctx.stroke()
      ctx.setLineDash([2, 5])
      ctx.lineDashOffset = -t * 12
      ctx.strokeStyle = rgba(GOLD, 0.45 * draw)
      ctx.beginPath()
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2
        const p = project(rotate([Math.cos(a) * 1.22, 0, Math.sin(a) * 1.22], t * 0.4, tilt, roll))
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Грани-кристаллы: от дальних к ближним
      const faces: { pts: ReturnType<typeof project>[]; z: number; lit: number; tone: number }[] = []
      ;[up, down].forEach((verts, part) => {
        FACES.forEach(([a, b, d]) => {
          const [A, B, C] = [verts[a], verts[b], verts[d]]
          const u: V3 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]]
          const v: V3 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]]
          let n: V3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
          const len = Math.hypot(...n) || 1
          n = [n[0] / len, n[1] / len, n[2] / len]
          // нормаль наружу: от центра тетраэдра
          const cz = (A[0] + B[0] + C[0]) * n[0] + (A[1] + B[1] + C[1]) * n[1] + (A[2] + B[2] + C[2]) * n[2]
          if (cz < 0) n = [-n[0], -n[1], -n[2]]
          const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2])
          faces.push({ pts: [A, B, C].map(project), z: (A[2] + B[2] + C[2]) / 3, lit, tone: part })
        })
      })
      faces.sort((p, q) => p.z - q.z)
      for (const f of faces) {
        const [a, b, d] = f.pts
        const g = ctx.createLinearGradient(a.x, a.y, (b.x + d.x) / 2, (b.y + d.y) / 2)
        const base = f.tone ? mix(GOLD, WINE, 0.18) : GOLD
        g.addColorStop(0, rgba(LIGHT_GOLD, (0.02 + 0.09 * f.lit) * alive))
        g.addColorStop(1, rgba(base, (0.01 + 0.04 * f.lit) * alive))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.lineTo(d.x, d.y)
        ctx.closePath()
        ctx.fill()
      }

      // Рёбра: ближние — толще и ярче; при появлении растут из вершин
      const edges: { a: ReturnType<typeof project>; b: ReturnType<typeof project>; z: number; i: number }[] = []
      ;[up, down].forEach((verts, part) => {
        EDGES.forEach(([i, j], k) => {
          const a = project(verts[i])
          const b = project(verts[j])
          edges.push({ a, b, z: (a.z + b.z) / 2, i: part * 6 + k })
        })
      })
      edges.sort((p, q) => p.z - q.z)
      ctx.lineCap = 'round'
      for (const e of edges) {
        const depth = clamp01((e.z + 1) / 2)
        const grow = ease(draw * 1.8 - (e.i % 6) * 0.13)
        if (grow <= 0) continue
        const bx = e.a.x + (e.b.x - e.a.x) * grow
        const by = e.a.y + (e.b.y - e.a.y) * grow
        // ореол и сердцевина ребра
        ctx.strokeStyle = rgba(GOLD, (0.07 + 0.08 * depth) * haloK)
        ctx.lineWidth = 7 + 4 * depth
        ctx.beginPath()
        ctx.moveTo(e.a.x, e.a.y)
        ctx.lineTo(bx, by)
        ctx.stroke()
        ctx.strokeStyle = rgba(mix(DEEP, LIGHT_GOLD, depth), 0.4 + 0.6 * depth)
        ctx.lineWidth = 0.9 + 0.9 * depth
        ctx.beginPath()
        ctx.moveTo(e.a.x, e.a.y)
        ctx.lineTo(bx, by)
        ctx.stroke()

        // импульс энергии бежит по ребру
        if (alive > 0) {
          const p = (t * 0.55 + e.i * 0.377) % 1
          const px = e.a.x + (e.b.x - e.a.x) * p
          const py = e.a.y + (e.b.y - e.a.y) * p
          const r = 7 + 5 * depth
          const glow = ctx.createRadialGradient(px, py, 0, px, py, r)
          glow.addColorStop(0, rgba(AMBER, 0.8 * alive * (0.4 + 0.6 * depth)))
          glow.addColorStop(0.25, rgba(AMBER, 0.25 * alive))
          glow.addColorStop(1, rgba(AMBER, 0))
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Вершины и сердце
      ;[...up, ...down].map(project).forEach((p) => {
        const depth = clamp01((p.z + 1) / 2)
        ctx.fillStyle = rgba(mix(DEEP, AMBER, depth), (0.4 + 0.6 * depth) * draw)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.2 + 1.3 * depth, 0, Math.PI * 2)
        ctx.fill()
      })
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2)
      const core = ctx.createRadialGradient(c, c, 0, c, c, R * 0.55)
      core.addColorStop(0, rgba(AMBER, (0.12 + 0.1 * pulse) * alive))
      core.addColorStop(1, rgba(LIGHT_GOLD, 0))
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(c, c, R * 0.55, 0, Math.PI * 2)
      ctx.fill()
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
    }
  }, [theme])

  return <canvas ref={canvas} className={`lx-merkaba ${className}`} aria-hidden="true" />
}
