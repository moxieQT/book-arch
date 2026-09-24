import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import {
  drawCoverOntoCanvas,
  drawPageLeftOntoCanvas,
  drawPageRightOntoCanvas,
  makeGildedEdgesTexture,
} from '../three/luxuryTextures'
import { calculateArchetypes } from '../numerology/calculate'
import { buildChapters } from '../numerology/chapters'

/**
 * Витринная 3D-книга для лендинга. Лёгкая отдельная сцена (без интерактива
 * приложения): прокрутка задаёт progress 0…1, по нему книга поворачивается,
 * раскрывается посередине и перелистывает два листа с настоящими страницами.
 */

// Геометрия книги (в единицах сцены), пропорции как у книги в приложении
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
const seg = (p: number, a: number, b: number) => easeInOut(clamp01((p - a) / (b - a)))

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

export class BookShowcase {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
  private holder = new THREE.Group()
  private book = new THREE.Group()
  private chunk = new THREE.Group()
  private spine!: THREE.Mesh
  private leaves: PageLeaf[] = []
  private aura!: THREE.Mesh
  private dust!: THREE.Points
  private dustSpeed = new Float32Array(0)
  private disposables: { dispose: () => void }[] = []
  private layout: Layout = { closedX: 0, closedY: 0, openY: 0, closedScale: 1, openScale: 1 }
  private progress = 0
  private pointer = new THREE.Vector2()
  private pointerSmooth = new THREE.Vector2()
  private raf = 0
  private active = false
  private timer = new THREE.Timer()
  private resizeObserver: ResizeObserver
  private isMobile = false
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.08
    this.renderer.setClearColor(0x000000, 0)

    this.camera.position.set(0, 0, 10)
    this.camera.lookAt(0, 0, 0)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04).texture
    this.scene.environment = env
    this.scene.environmentIntensity = 0.55
    this.disposables.push(env, pmrem)
    room.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
    })

    const key = new THREE.DirectionalLight(0xfff0d8, 1.7)
    key.position.set(-3, 4, 7)
    const gold = new THREE.PointLight(0xffc873, 18, 14, 2)
    gold.position.set(3.2, 1.6, 3.4)
    const rim = new THREE.PointLight(0xb34a6a, 10, 12, 2)
    rim.position.set(-3.5, -1.5, -1.5)
    this.scene.add(key, gold, rim, new THREE.AmbientLight(0xfff4e6, 0.35))

    this.holder.rotation.order = 'YXZ'
    this.holder.add(this.book)
    this.scene.add(this.holder)

    this.createAtmosphere()

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas.parentElement ?? canvas)
    this.resize()
  }

  /** Рисует страницы (нужны шрифты) и собирает книгу. Вызывается один раз. */
  async init() {
    const fonts = ['400 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '700 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"']
    await Promise.race([Promise.all(fonts.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 3000))])

    const profile = calculateArchetypes(new Date(1994, 3, 2))
    const chapters = buildChapters(profile)
    const target = this.isMobile ? 760 : 1180

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

    const cover = await make((cv) => drawCoverOntoCanvas(cv, 'presentation'))
    const ch1L = await make((cv) => drawPageLeftOntoCanvas(cv, chapters[0], 1, null))
    const ch1R = await make((cv) => drawPageRightOntoCanvas(cv, chapters[0], 1, 'essence', false, {}, profile, 0))
    const ch2L = await make((cv) => drawPageLeftOntoCanvas(cv, chapters[1], 2, null))
    const ch2R = await make((cv) => drawPageRightOntoCanvas(cv, chapters[1], 2, 'shadow', false, {}, profile, 0))
    const ch3L = await make((cv) => drawPageLeftOntoCanvas(cv, chapters[2], 3, null))
    const ch3R = await make((cv) => drawPageRightOntoCanvas(cv, chapters[2], 3, 'archetypes', false, {}, profile, 0))

    this.buildBook({ cover, ch1L, ch1R, ch2L, ch2R, ch3L, ch3R })
    this.apply()
    this.render()
  }

  // ---------------------------------------------------------------------------

  private texture(cv: HTMLCanvasElement, mirrored = false) {
    const t = new THREE.CanvasTexture(cv)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
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

  private buildBook(tex: Record<'cover' | 'ch1L' | 'ch1R' | 'ch2L' | 'ch2R' | 'ch3L' | 'ch3R', HTMLCanvasElement>) {
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

  private createAtmosphere() {
    // Золотое сияние за книгой
    const glow = document.createElement('canvas')
    glow.width = glow.height = 256
    const g = glow.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(231, 199, 128, 0.55)')
    grad.addColorStop(0.35, 'rgba(198, 150, 80, 0.18)')
    grad.addColorStop(1, 'rgba(92, 25, 46, 0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    const glowTex = new THREE.CanvasTexture(glow)
    const auraGeo = new THREE.PlaneGeometry(1, 1)
    const auraMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    this.aura = new THREE.Mesh(auraGeo, auraMat)
    this.aura.position.z = -4
    this.aura.scale.setScalar(13)
    this.scene.add(this.aura)
    this.disposables.push(glowTex, auraGeo, auraMat)

    // Золотая пыль
    const N = 420
    const pos = new Float32Array(N * 3)
    this.dustSpeed = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
      this.dustSpeed[i] = 0.08 + Math.random() * 0.22
    }
    const dot = document.createElement('canvas')
    dot.width = dot.height = 64
    const d = dot.getContext('2d')!
    const dg = d.createRadialGradient(32, 32, 0, 32, 32, 32)
    dg.addColorStop(0, 'rgba(255, 236, 190, 1)')
    dg.addColorStop(0.3, 'rgba(231, 199, 128, 0.6)')
    dg.addColorStop(1, 'rgba(231, 199, 128, 0)')
    d.fillStyle = dg
    d.fillRect(0, 0, 64, 64)
    const dotTex = new THREE.CanvasTexture(dot)
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const dustMat = new THREE.PointsMaterial({
      map: dotTex,
      size: 0.07,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    this.dust = new THREE.Points(dustGeo, dustMat)
    this.scene.add(this.dust)
    this.disposables.push(dotTex, dustGeo, dustMat)
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

  // ---------------------------------------------------------------------------

  setProgress(p: number) {
    this.progress = clamp01(p)
    if (!this.active) {
      this.apply()
      this.render()
    }
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y)
  }

  setActive(active: boolean) {
    if (active === this.active) return
    this.active = active
    if (active) {
      this.timer.reset()
      this.loop()
    } else {
      cancelAnimationFrame(this.raf)
    }
  }

  private loop = (now?: number) => {
    if (!this.active) return
    this.raf = requestAnimationFrame(this.loop)
    this.timer.update(now)
    const dt = Math.min(this.timer.getDelta(), 0.05)
    this.pointerSmooth.lerp(this.pointer, 1 - Math.pow(0.02, dt))

    const arr = (this.dust.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array
    const t = this.timer.getElapsed()
    for (let i = 0; i < this.dustSpeed.length; i++) {
      let yy = arr[i * 3 + 1] + this.dustSpeed[i] * dt
      if (yy > 4.5) yy = -4.5
      arr[i * 3 + 1] = yy
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.0008
    }
    this.dust.geometry.attributes.position.needsUpdate = true

    this.apply(t)
    this.render()
  }

  /** Раскладывает книгу по текущему прогрессу прокрутки */
  private apply(time = 0) {
    const p = this.progress
    const L = this.layout
    const settle = seg(p, 0.02, 0.26)
    const open = seg(p, 0.14, 0.36)
    const outro = seg(p, 0.84, 1)
    const floatW = 1 - settle

    // Поза: из «презентации» (стоит лицом к зрителю, развёрнута) — в разворот для чтения
    this.holder.rotation.x = lerp(Math.PI / 2 - 0.16, Math.PI / 2 - 0.72, settle) - outro * 0.12 + this.pointerSmooth.y * 0.05
    this.holder.rotation.y = lerp(-0.52, 0, settle) + this.pointerSmooth.x * 0.08 + Math.sin(time * 0.5) * 0.04 * floatW
    this.holder.rotation.z = lerp(0.07, 0, settle)
    this.holder.position.x = lerp(L.closedX, 0, settle)
    this.holder.position.y = lerp(L.closedY, L.openY, settle) + Math.sin(time * 0.8) * 0.05 * floatW
    this.holder.scale.setScalar(lerp(L.closedScale, L.openScale, settle) * (1 - outro * 0.06))

    // Закрытая книга центрируется по себе, раскрытая — по корешку
    this.book.position.x = -(PAGE_W / 2) * (1 - open)
    this.book.position.y = -lerp(CLOSED_H, AXIS_Y, open) / 2

    this.chunk.rotation.z = open * Math.PI
    const glow = 0.75 + open * 0.25 + outro * 0.35
    this.aura.scale.setScalar(13 * glow)
    ;(this.aura.material as THREE.MeshBasicMaterial).opacity = 0.7 + outro * 0.3

    // Книга ещё не собрана (страницы рисуются асинхронно) — дальше нечего раскладывать
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

  private render() {
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    const host = this.canvas.parentElement ?? this.canvas
    const w = host.clientWidth
    const h = host.clientHeight
    if (!w || !h) return
    this.isMobile = w < 900
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()

    const visH = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const visW = visH * this.camera.aspect
    const spreadW = PAGE_W * 2 + 0.1

    this.layout = this.isMobile
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
    this.apply()
    this.render()
  }

  dispose() {
    this.setActive(false)
    this.timer.dispose()
    this.resizeObserver.disconnect()
    this.disposables.forEach((d) => d.dispose())
    this.disposables = []
    this.renderer.dispose()
  }
}
