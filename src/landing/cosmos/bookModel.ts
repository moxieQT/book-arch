import * as THREE from 'three'
import {
  drawCoverOntoCanvas,
  drawPageLeftOntoCanvas,
  drawPageRightOntoCanvas,
  makeGildedEdgesTexture,
} from '../../three/luxuryTextures'
import { calculateArchetypes } from '../../numerology/calculate'
import { buildChapters } from '../../numerology/chapters'

/**
 * Модель витринной книги: геометрия, настоящие страницы приложения и поза по
 * прогрессу 0…1 (поворот → раскрытие посередине → два перелистывания → финал).
 * Без рендерера — её встраивает и общая сцена «Космос», и запасная витрина.
 * Поза рассчитана на камеру в BOOK_VIEW_DISTANCE перед книгой.
 */

export const BOOK_VIEW_DISTANCE = 10

const PAGE_W = 2.17
const PAGE_D = 2.95
const COVER_W = 2.26
const COVER_D = 3.08
const COVER_T = 0.045
const BLOCK_T = 0.34
const HALF_T = BLOCK_T / 2
const RIGHT_TOP = COVER_T + HALF_T
const AXIS_Y = RIGHT_TOP + 0.008
const LEAF_GAP = 0.0025
/** Высота закрытой книги: задняя крышка + блок + передняя крышка */
const CLOSED_H = AXIS_Y + HALF_T + COVER_T
const SEGMENTS = 48

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
/** Нормированный участок прогресса [a, b] → 0…1 с мягкими краями */
export const seg = (p: number, a: number, b: number) => easeInOut(clamp01((p - a) / (b - a)))

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()))

interface Layout {
  closedX: number
  closedY: number
  openY: number
  closedScale: number
  openScale: number
}

interface PageLeaf {
  pivot: THREE.Group
  geo: THREE.PlaneGeometry
  restRightY: number
  restLeftY: number
}

type PageSet = Record<'cover' | 'ch1L' | 'ch1R' | 'ch2L' | 'ch2R' | 'ch3L' | 'ch3R', HTMLCanvasElement>

export class BookModel {
  /** Корень модели: ставится в сцену там, куда смотрит камера */
  readonly root = new THREE.Group()
  ready = false

  private holder = new THREE.Group()
  private book = new THREE.Group()
  private chunk = new THREE.Group()
  private spine: THREE.Mesh | null = null
  private leaves: PageLeaf[] = []
  private disposables: { dispose: () => void }[] = []
  private layout: Layout = { closedX: 0, closedY: 0, openY: 0, closedScale: 1, openScale: 1 }
  private anisotropy: number

  constructor(anisotropy: number) {
    this.anisotropy = anisotropy
    this.holder.rotation.order = 'YXZ'
    this.holder.add(this.book)
    this.root.add(this.holder)
  }

  /** Рисует страницы (нужны шрифты) и собирает книгу */
  async load(isMobile: boolean) {
    const fonts = ['400 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '700 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"']
    await Promise.race([Promise.all(fonts.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 3000))])

    const profile = calculateArchetypes(new Date(1994, 3, 2))
    const chapters = buildChapters(profile)
    const target = isMobile ? 760 : 1180

    const make = async (draw: (cv: HTMLCanvasElement) => void) => {
      const full = document.createElement('canvas')
      draw(full)
      const small = document.createElement('canvas')
      small.width = target
      small.height = Math.round((full.height / full.width) * target)
      const ctx = small.getContext('2d')!
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(full, 0, 0, small.width, small.height)
      full.width = full.height = 0
      await nextFrame()
      return small
    }

    const pages: PageSet = {
      cover: await make((cv) => drawCoverOntoCanvas(cv, 'presentation')),
      ch1L: await make((cv) => drawPageLeftOntoCanvas(cv, chapters[0], 1, null)),
      ch1R: await make((cv) => drawPageRightOntoCanvas(cv, chapters[0], 1, 'essence', false, {}, profile, 0)),
      ch2L: await make((cv) => drawPageLeftOntoCanvas(cv, chapters[1], 2, null)),
      ch2R: await make((cv) => drawPageRightOntoCanvas(cv, chapters[1], 2, 'shadow', false, {}, profile, 0)),
      ch3L: await make((cv) => drawPageLeftOntoCanvas(cv, chapters[2], 3, null)),
      ch3R: await make((cv) => drawPageRightOntoCanvas(cv, chapters[2], 3, 'archetypes', false, {}, profile, 0)),
    }
    this.build(pages)
    this.ready = true
  }

  /** Раскладка под видимую область на расстоянии BOOK_VIEW_DISTANCE */
  setLayout(visW: number, visH: number, isMobile: boolean) {
    const spreadW = PAGE_W * 2 + 0.1
    this.layout = isMobile
      ? {
          closedX: 0,
          closedY: visH * 0.1,
          openY: visH * 0.1,
          closedScale: Math.min(1, (visW * 0.66) / COVER_W, (visH * 0.44) / COVER_D),
          openScale: Math.min(1, (visW * 0.94) / spreadW),
        }
      : {
          closedX: visW * 0.19,
          closedY: 0,
          openY: visH * 0.05,
          closedScale: Math.min(1.05, (visH * 0.6) / COVER_D),
          // разворот вместе с поднятым при перелистывании листом должен помещаться над подписями
          openScale: Math.min(1.05, (visW * 0.52) / spreadW, (visH * 0.46) / (PAGE_D * 0.72)),
        }
  }

  /** Поза книги по прогрессу главы и лёгкий отклик на указатель */
  update(p: number, time: number, pointer: { x: number; y: number }) {
    const L = this.layout
    const settle = seg(p, 0.02, 0.26)
    const open = seg(p, 0.14, 0.36)
    const outro = seg(p, 0.84, 1)
    const floatW = 1 - settle

    // Из «презентации» (стоит лицом к зрителю, развёрнута) — в разворот для чтения
    this.holder.rotation.x = lerp(Math.PI / 2 - 0.16, Math.PI / 2 - 0.72, settle) - outro * 0.12 + pointer.y * 0.05
    this.holder.rotation.y = lerp(-0.52, 0, settle) + pointer.x * 0.08 + Math.sin(time * 0.5) * 0.04 * floatW
    this.holder.rotation.z = lerp(0.07, 0, settle)
    this.holder.position.x = lerp(L.closedX, 0, settle)
    this.holder.position.y = lerp(L.closedY, L.openY, settle) + Math.sin(time * 0.8) * 0.05 * floatW
    this.holder.scale.setScalar(lerp(L.closedScale, L.openScale, settle) * (1 - outro * 0.06))

    // Закрытая книга центрируется по себе, раскрытая — по корешку
    this.book.position.x = -(PAGE_W / 2) * (1 - open)
    this.book.position.y = -lerp(CLOSED_H, AXIS_Y, open) / 2
    this.chunk.rotation.z = open * Math.PI

    if (!this.spine) return
    // При раскрытии корешок уходит под разворот, а не торчит между страницами
    this.spine.scale.y = lerp(1, AXIS_Y / CLOSED_H, open)
    this.spine.position.y = lerp(CLOSED_H / 2, AXIS_Y / 2, open)

    const turns = [seg(p, 0.42, 0.57), seg(p, 0.62, 0.77)]
    this.leaves.forEach((leaf, i) => {
      const t = turns[i]
      this.bendLeaf(leaf, t * Math.PI)
      leaf.pivot.position.y = lerp(leaf.restRightY, leaf.restLeftY, t) + Math.sin(t * Math.PI) * 0.03
    })
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose())
    this.disposables = []
  }

  // ---------------------------------------------------------------------------

  private texture(cv: HTMLCanvasElement, mirrored = false) {
    const t = new THREE.CanvasTexture(cv)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = this.anisotropy
    if (mirrored) {
      // Оборот листа: смотрим с изнанки, поэтому картинку отражаем по горизонтали
      t.wrapS = THREE.RepeatWrapping
      t.repeat.x = -1
      t.offset.x = 1
    }
    this.disposables.push(t)
    return t
  }

  private material(params: THREE.MeshStandardMaterialParameters) {
    const m = new THREE.MeshStandardMaterial(params)
    this.disposables.push(m)
    return m
  }

  /** Плоскость страницы в локальных координатах листа: корешок в x=0, лист лежит вдоль +x */
  private pageGeometry(w: number, d: number, segments = 1) {
    const g = new THREE.PlaneGeometry(w, d, segments, 1)
    g.rotateX(-Math.PI / 2)
    g.translate(w / 2, 0, 0)
    this.disposables.push(g)
    return g
  }

  private build(tex: PageSet) {
    const gilded = makeGildedEdgesTexture()
    this.disposables.push(gilded)
    const gold = this.material({ map: gilded, metalness: 0.78, roughness: 0.3 })
    const paper = this.material({ color: 0xf6efe2, roughness: 0.92 })
    const board = this.material({ color: 0xe9dcc4, roughness: 0.66, metalness: 0.02 })
    const leather = this.material({ color: 0x4f1427, roughness: 0.55, metalness: 0.06 })
    const page = (cv: HTMLCanvasElement) => this.material({ map: this.texture(cv), roughness: 0.86 })
    const pageBack = (cv: HTMLCanvasElement) => this.material({ map: this.texture(cv, true), roughness: 0.86, side: THREE.BackSide })

    const blockGeo = new THREE.BoxGeometry(PAGE_W, HALF_T, PAGE_D)
    const coverGeo = new THREE.BoxGeometry(COVER_W, COVER_T, COVER_D)
    this.disposables.push(blockGeo, coverGeo)
    // Порядок граней BoxGeometry: +x, -x, +y, -y, +z, -z — золочёный обрез снаружи
    const blockMats = [gold, paper, paper, paper, gold, gold]

    // Неподвижная часть: задняя крышка, правая половина блока, страница 3-го разворота
    const back = new THREE.Mesh(coverGeo, board)
    back.position.set(COVER_W / 2 - 0.03, COVER_T / 2, 0)
    const rightBlock = new THREE.Mesh(blockGeo, blockMats)
    rightBlock.position.set(PAGE_W / 2, COVER_T + HALF_T / 2, 0)
    const rightPage = new THREE.Mesh(this.pageGeometry(PAGE_W, PAGE_D), page(tex.ch3R))
    rightPage.position.y = RIGHT_TOP + 0.0006
    this.book.add(back, rightBlock, rightPage)

    // Корешок: полуцилиндр винной кожи по левому краю
    const spineR = CLOSED_H / 2 + 0.004
    const spineGeo = new THREE.CylinderGeometry(spineR, spineR, COVER_D, 32, 1, false, Math.PI, Math.PI)
    spineGeo.rotateX(Math.PI / 2)
    this.disposables.push(spineGeo)
    this.spine = new THREE.Mesh(spineGeo, leather)
    this.spine.scale.x = 0.34
    this.spine.position.set(-0.012, CLOSED_H / 2, 0)
    this.book.add(this.spine)

    // «Ком» — обложка вместе с половиной блока: так книга раскрывается посередине
    const chunkBlock = new THREE.Mesh(blockGeo, blockMats)
    chunkBlock.position.set(PAGE_W / 2, HALF_T / 2, 0)
    const front = new THREE.Mesh(coverGeo, board)
    front.position.set(COVER_W / 2 - 0.03, HALF_T + COVER_T / 2, 0)
    const coverFace = new THREE.Mesh(this.pageGeometry(COVER_W - 0.006, COVER_D - 0.006), page(tex.cover))
    coverFace.position.set(-0.027, HALF_T + COVER_T + 0.0008, 0)
    const leftFace = new THREE.Mesh(this.pageGeometry(PAGE_W, PAGE_D), pageBack(tex.ch1L))
    leftFace.position.y = -0.0008
    this.chunk.add(chunkBlock, front, coverFace, leftFace)
    this.chunk.position.y = AXIS_Y
    this.book.add(this.chunk)

    // Два тонких листа, которые перелистываются с изгибом
    const pairs: [HTMLCanvasElement, HTMLCanvasElement][] = [
      [tex.ch1R, tex.ch2L],
      [tex.ch2R, tex.ch3L],
    ]
    pairs.forEach(([frontCv, backCv], i) => {
      const geo = this.pageGeometry(PAGE_W - 0.01, PAGE_D - 0.01, SEGMENTS)
      const pivot = new THREE.Group()
      const f = new THREE.Mesh(geo, page(frontCv))
      const b = new THREE.Mesh(geo, pageBack(backCv))
      f.frustumCulled = b.frustumCulled = false
      pivot.add(f, b)
      const restRightY = RIGHT_TOP + LEAF_GAP * (pairs.length - i)
      const restLeftY = AXIS_Y + LEAF_GAP * (i + 1)
      pivot.position.y = restRightY
      this.book.add(pivot)
      this.leaves.push({ pivot, geo, restRightY, restLeftY })
    })
  }

  /** Изгиб листа: угол нарастает к внешнему краю, длина листа сохраняется */
  private bendLeaf(leaf: PageLeaf, theta: number) {
    const pos = leaf.geo.attributes.position as THREE.BufferAttribute
    const w = PAGE_W - 0.01
    const ds = w / SEGMENTS
    const curl = 0.95 * Math.sin(theta)
    let x = 0
    let y = 0
    const xs = new Float32Array(SEGMENTS + 1)
    const ys = new Float32Array(SEGMENTS + 1)
    for (let i = 1; i <= SEGMENTS; i++) {
      const s = (i - 0.5) / SEGMENTS
      const phi = theta + curl * Math.pow(s, 1.7)
      x += Math.cos(phi) * ds
      y += Math.sin(phi) * ds
      xs[i] = x
      ys[i] = y
    }
    // PlaneGeometry: две строки вершин по (SEGMENTS + 1), z у них постоянен
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i <= SEGMENTS; i++) {
        const idx = row * (SEGMENTS + 1) + i
        pos.setX(idx, xs[i])
        pos.setY(idx, ys[i])
      }
    }
    pos.needsUpdate = true
    leaf.geo.computeVertexNormals()
  }
}
