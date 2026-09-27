import * as THREE from 'three'
import { MERKABA_TILT, type FigureKind } from './sacredShapes'

export * from './sacredShapes'

// ---------------------------------------------------------------------------
// Вращение фигур во времени
// ---------------------------------------------------------------------------

const m4 = new THREE.Matrix4()
const q = new THREE.Quaternion()
const e = new THREE.Euler()
/** Кубооктаэдр повёрнут осью третьего порядка к зрителю — виден шестиугольник */
const ALIGN_111 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 1, 1).normalize(), new THREE.Vector3(0, 0, 1))

/**
 * Матрицы вращения двух частей фигуры; t — время с момента, когда фигура
 * начала собираться (в t = 0 она стоит в «гербовой» позе).
 * spin — направление вращения (±1), чтобы соседние фигуры кружились по-разному.
 */
export function figureRotation(kind: FigureKind, t: number, spin: number, out0: THREE.Matrix3, out1: THREE.Matrix3) {
  if (kind === 'merkaba') {
    // тетраэдры вращаются навстречу друг другу — «живая» меркаба
    const w = 0.32
    const wob = 0.05 * Math.sin(t * 0.31)
    const tilt = MERKABA_TILT + 0.05 * Math.sin(t * 0.23)
    e.set(tilt, t * w, wob, 'XYZ')
    out0.setFromMatrix4(m4.makeRotationFromEuler(e))
    e.set(tilt, -t * w, wob, 'XYZ')
    out1.setFromMatrix4(m4.makeRotationFromEuler(e))
    return
  }
  if (kind === 'solid') {
    e.set(0.5 * Math.sin(t * 0.17), 0.6 * Math.sin(t * 0.13), t * 0.08 * spin, 'XYZ')
    q.setFromEuler(e).multiply(ALIGN_111)
    out0.setFromMatrix4(m4.makeRotationFromQuaternion(q))
    out1.copy(out0)
    return
  }
  // плоские фигуры: медленное вращение и лёгкое покачивание — псевдо-3D
  const turn = kind === 'upright' ? 0.04 * Math.sin(t * 0.13) : t * 0.035 * spin
  e.set(0.16 * Math.sin(t * 0.19), 0.2 * Math.sin(t * 0.15), turn, 'XYZ')
  out0.setFromMatrix4(m4.makeRotationFromEuler(e))
  out1.copy(out0)
}
