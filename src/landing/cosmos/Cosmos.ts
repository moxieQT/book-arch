import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { PATH_SYMBOLS, PATHS } from '../content'
import { BOOK_VIEW_DISTANCE, BookModel, seg } from './bookModel'
import { LineFigure, SacredField, type FieldTheme } from './SacredField'
import type { FigureId } from './sacredGeometry'

/**
 * «Космос» — одна сквозная 3D-сцена под всем лендингом. Камера летит по
 * маршруту, привязанному к главам; всё движение — только от прокрутки.
 *
 *   I   Пролог     — большая меркаба за заголовком, камера влетает в её центр
 *   II  Философия  — туннель из семи врат, каждые врата — свой символ
 *   III Пути       — облёт Семени Жизни, лежащего полом; на семи узлах — символы путей
 *   ↓   нырок      — вниз, в ночь, к книге; за ней прорисовывается Цветок Жизни
 *   IV  Книга      — камера замирает перед книгой, книга раскрывается и листается
 *   ↑   подъём     — рассвет, над книгой к Древу Жизни (22 пути — 22 аркана)
 *   V   Коды       — Древо медленно разворачивается
 *   VI  Сессии     — тихий дрейф сквозь пыль
 *   VII Запись     — Метатрон перетекает в меркабу: круг замыкается
 *
 * Положение на маршруте u = номер участка + доля внутри него; границы участков
 * (якоря) — позиции прокрутки, их считает лендинг по ScrollTrigger.
 */

const TAU = Math.PI * 2
const FOV = 32

// Точки маршрута
const C_PATHS = new THREE.Vector3(0, -1.5, -46)
const C_BOOK = new THREE.Vector3(0, -12, -78)
const C_DIAL = new THREE.Vector3(0, -2, -104)
const C_FINALE = new THREE.Vector3(0, 0, -150)
const GATE_Z = (i: number) => -7 - i * 4.3
const ORBIT_R = 11
const ORBIT_H = 3.8
const ORBIT_SWEEP = TAU * (6 / 7)
const HERO_R = 4.2
const MANDALA_R = ORBIT_R * 0.55

/** Символы семи врат туннеля — от простого к сложному */
const GATES: FigureId[] = ['egg', 'seed', 'vesica', 'germ', 'fruit', 'tetra64', 'metatron']

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeIn = (t: number) => t * t * t
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z)

function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number, out: THREE.Vector3) {
  const u = 1 - t
  return out.set(
    u * u * a.x + 2 * u * t * b.x + t * t * c.x,
    u * u * a.y + 2 * u * t * b.y + t * t * c.y,
    u * u * a.z + 2 * u * t * b.z + t * t * c.z
  )
}

const NEBULA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`

const NEBULA_FRAG = /* glsl */ `
  uniform float uPhase;
  uniform float uLight;
  uniform vec2 uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uAspect;
    // туманность дрейфует только вместе с прокруткой
    float t = uPhase * 0.08;
    p.y -= uPhase * 0.05;
    vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
    float f = fbm(p * 1.5 + 2.4 * q + vec2(1.7, 9.2) + t * 1.4);
    float cloud = smoothstep(0.42, 0.92, f);
    float wine = smoothstep(0.55, 1.05, f * length(q) * 1.45);
    float veins = smoothstep(0.64, 0.76, f) * (1.0 - smoothstep(0.76, 0.9, f));

    // ночь: глубокая тьма, лиловые массы, винные ядра
    vec3 night = vec3(0.008, 0.005, 0.013);
    night += vec3(0.023, 0.014, 0.1) * cloud * 0.9;
    night += vec3(0.05, 0.007, 0.02) * wine * 1.1;
    night += vec3(0.78, 0.4, 0.1) * veins * 0.04;
    night *= 1.0 - 0.45 * dot(p * 0.85, p * 0.85);

    // день: слоновая кость, тёплая бумага, розово-лиловые облака
    vec3 day = vec3(0.905, 0.855, 0.785);
    day = mix(day, vec3(0.87, 0.8, 0.7), cloud * 0.32);
    day = mix(day, vec3(0.87, 0.76, 0.76), wine * 0.24);
    day = mix(day, vec3(0.82, 0.8, 0.88), smoothstep(0.3, 0.8, q.y) * 0.14);
    day *= 1.0 - 0.1 * dot(p * 0.8, p * 0.8);

    gl_FragColor = vec4(mix(night, day, uLight), 1.0);
    #include <colorspace_fragment>
  }
`

const DUST_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uPhase;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.x += sin(uPhase * 0.9 + aSeed * 6.2831) * 0.35;
    p.y += cos(uPhase * 0.7 + aSeed * 12.566) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (34.0 / max(0.5, -mv.z));
    vTwinkle = 0.45 + 0.55 * sin(uPhase * (2.0 + aSeed * 4.0) + aSeed * 40.0);
  }
`

const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(uColor, a * vTwinkle * uOpacity);
    #include <colorspace_fragment>
  }
`

const DAY_GOLD = new THREE.Color('#9a7a44')
const NIGHT_GOLD = new THREE.Color('#ecd39a')

interface Node {
  lines: LineFigure
  pos: THREE.Vector3
}

export class Cosmos {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400)
  private disposables: { dispose: () => void }[] = []

  private field!: SacredField
  private nebula!: THREE.ShaderMaterial
  private dustMat!: THREE.ShaderMaterial
  private streaks!: THREE.LineSegments
  private streakHeads = new Float32Array(0)
  private streakMat!: THREE.LineBasicMaterial
  private gates: LineFigure[] = []
  private mandala = new THREE.Group()
  private mandalaFloor!: LineFigure
  private nodes: Node[] = []
  private halo!: LineFigure
  private dial!: LineFigure
  private identity = new THREE.Matrix3()
  private parentQ = new THREE.Quaternion()

  private book: BookModel
  private bookRoot = new THREE.Group()
  private bookLoading = false

  private anchors: number[] = []
  private u = 0
  private introP = 0
  private theme: FieldTheme = 'light'
  private pointer = new THREE.Vector2()
  private pointerSmooth = new THREE.Vector2()
  private prevCam = v3()
  private camVelocity = v3()
  private timer = new THREE.Timer()
  private raf = 0
  private running = false
  private isMobile = false
  private tmp = { pos: v3(), look: v3(), a: v3(), b: v3(), c: v3() }
  private color = new THREE.Color()
  private lastSig = ''
  private dirty = true

  /** Ночь 0…1 — лендинг перекрашивает под неё текст главы «Книга» */
  onNight: ((night: number) => void) | null = null
  private lastNight = -1

  constructor(canvas: HTMLCanvasElement) {
    this.isMobile = window.innerWidth < 900
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 1.5))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05

    // Свет нужен только книге
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environment = env
    this.scene.environmentIntensity = 0.55
    this.disposables.push(env, pmrem)
    const key = new THREE.DirectionalLight(0xfff0d8, 1.7)
    key.position.copy(C_BOOK).add(v3(-3, 4, 7))
    key.target.position.copy(C_BOOK)
    const gold = new THREE.PointLight(0xffc873, 18, 14, 2)
    gold.position.copy(C_BOOK).add(v3(3.2, 1.6, 3.4))
    this.scene.add(key, key.target, gold, new THREE.AmbientLight(0xfff4e6, 0.35))

    this.book = new BookModel(this.renderer.capabilities.getMaxAnisotropy())
    this.bookRoot.position.copy(C_BOOK)
    this.bookRoot.add(this.book.root)
    this.scene.add(this.bookRoot)

    this.resize = this.resize.bind(this)
    window.addEventListener('resize', this.resize)
  }

  async init() {
    const quad = new THREE.PlaneGeometry(2, 2)
    this.disposables.push(quad)
    this.nebula = new THREE.ShaderMaterial({
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      depthWrite: false,
      uniforms: { uPhase: { value: 0 }, uLight: { value: 1 }, uAspect: { value: new THREE.Vector2(1, 1) } },
    })
    const nebula = new THREE.Mesh(quad, this.nebula)
    nebula.frustumCulled = false
    nebula.renderOrder = -10
    this.scene.add(nebula)
    this.disposables.push(this.nebula)

    const mobile = this.isMobile
    // I. Меркаба пролога (и финала) — живое поле с метаморфозой
    this.field = new SacredField({
      texSize: mobile ? 104 : 140,
      lineSegments: mobile ? 1500 : 2400,
      lineWidth: mobile ? 2.6 : 3,
      pointSize: mobile ? 1.6 : 1.45,
    })
    this.scene.add(this.field.group)

    this.buildGates()
    this.buildMandala()

    // IV. Ореол за книгой — огромный Цветок Жизни
    this.halo = this.field.createLines('flower', mobile ? 2200 : 3200)
    this.halo.mesh.position.copy(C_BOOK).add(v3(0, 0, -7))
    this.halo.mesh.scale.setScalar(10)
    this.scene.add(this.halo.mesh)

    // V. Древо Жизни для главы «Коды»
    this.dial = this.field.createLines('tree', 1600)
    this.dial.mesh.position.copy(C_DIAL)
    this.dial.mesh.scale.setScalar(6)
    this.scene.add(this.dial.mesh)

    this.buildDust()
    this.buildStreaks()
    this.setTheme(this.theme)
    this.resize()
    this.field.prewarm(['merkaba', 'metatron'])
    this.update(0)
    this.renderer.compile(this.scene, this.camera)
    this.render()
  }

  // ---------------------------------------------------------------------------
  // Публичное управление
  // ---------------------------------------------------------------------------

  /** Границы участков маршрута в пикселях прокрутки (10 значений) */
  setAnchors(anchors: number[]) {
    this.anchors = anchors
    this.dirty = true
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y)
  }

  /** Сборка меркабы из облака пыли при загрузке: 0 → 1 */
  setIntro(p: number) {
    this.introP = p
  }

  setTheme(theme: FieldTheme) {
    this.theme = theme
    this.dirty = true
    this.lastNight = -1
    this.field?.setTheme(theme)
    if (this.dustMat) this.dustMat.blending = theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending
    if (this.dustMat) this.dustMat.needsUpdate = true
  }

  start() {
    if (this.running) return
    this.running = true
    this.timer.reset()
    this.loop()
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  dispose() {
    this.stop()
    window.removeEventListener('resize', this.resize)
    this.book.dispose()
    this.field?.dispose()
    this.disposables.forEach((d) => d.dispose())
    this.renderer.dispose()
  }

  // ---------------------------------------------------------------------------
  // Построение
  // ---------------------------------------------------------------------------

  /** Семь врат туннеля: каждые — свой символ, прорисовываются на подлёте */
  private buildGates() {
    GATES.forEach((id, i) => {
      const g = this.field.createLines(id, this.isMobile ? 1100 : 1700)
      g.mesh.position.z = GATE_Z(i)
      g.mesh.scale.setScalar(4.4 - i * 0.06)
      g.mesh.rotation.z = i * 0.37
      this.scene.add(g.mesh)
      this.gates.push(g)
    })
  }

  /** Мандала путей: Семя Жизни лежит «полом», на семи узлах — символы путей */
  private buildMandala() {
    this.mandalaFloor = this.field.createLines('seed', this.isMobile ? 1600 : 2400)
    this.mandalaFloor.mesh.rotation.x = -Math.PI / 2
    this.mandalaFloor.mesh.scale.setScalar(MANDALA_R)
    this.mandala.add(this.mandalaFloor.mesh)
    PATHS.forEach((p, i) => {
      const a = Math.PI / 2 - (i / PATHS.length) * TAU
      const pos = v3(Math.cos(a) * MANDALA_R, 0, -Math.sin(a) * MANDALA_R)
      const lines = this.field.createLines(PATH_SYMBOLS[p.id] ?? 'seed', 900)
      lines.mesh.position.copy(pos).add(v3(0, 0.9, 0))
      lines.mesh.scale.setScalar(0.85)
      this.mandala.add(lines.mesh)
      this.nodes.push({ lines, pos })
    })
    this.mandala.position.copy(C_PATHS)
    this.scene.add(this.mandala)
  }

  /** Золотая пыль вдоль всего маршрута */
  private buildDust() {
    const N = this.isMobile ? 1400 : 3000
    const pos = new Float32Array(N * 3)
    const size = new Float32Array(N)
    const seed = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const a = Math.random() * TAU
      const r = 1.5 + Math.pow(Math.random(), 0.7) * 16
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = Math.sin(a) * r * 0.8 - 4
      pos[i * 3 + 2] = 22 - Math.random() * 190
      size[i] = 0.4 + Math.random() * 1.3
      seed[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    this.dustMat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uPhase: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: DAY_GOLD.clone() },
        uOpacity: { value: 0.8 },
      },
    })
    this.disposables.push(geo, this.dustMat)
    const dust = new THREE.Points(geo, this.dustMat)
    dust.frustumCulled = false
    this.scene.add(dust)
  }

  /** Кометы: хвост вытягивается по скорости камеры — видны только в полёте */
  private buildStreaks() {
    const N = this.isMobile ? 90 : 200
    this.streakHeads = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const a = Math.random() * TAU
      const r = 2 + Math.random() * 10
      this.streakHeads[i * 3] = Math.cos(a) * r
      this.streakHeads[i * 3 + 1] = Math.sin(a) * r * 0.8 - 3
      this.streakHeads[i * 3 + 2] = 18 - Math.random() * 180
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 6), 3))
    this.streakMat = new THREE.LineBasicMaterial({ color: DAY_GOLD, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    this.disposables.push(geo, this.streakMat)
    this.streaks = new THREE.LineSegments(geo, this.streakMat)
    this.streaks.frustumCulled = false
    this.scene.add(this.streaks)
  }

  private updateStreaks(speed: number, color: THREE.Color, dim: number) {
    const attr = this.streaks.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const H = this.streakHeads
    const k = Math.min(3.5, speed * 0.09)
    const s = speed || 1
    const vx = (this.camVelocity.x / s) * k
    const vy = (this.camVelocity.y / s) * k
    const vz = (this.camVelocity.z / s) * k
    for (let i = 0; i < H.length / 3; i++) {
      arr[i * 6] = H[i * 3]
      arr[i * 6 + 1] = H[i * 3 + 1]
      arr[i * 6 + 2] = H[i * 3 + 2]
      arr[i * 6 + 3] = H[i * 3] - vx
      arr[i * 6 + 4] = H[i * 3 + 1] - vy
      arr[i * 6 + 5] = H[i * 3 + 2] - vz
    }
    attr.needsUpdate = true
    this.streakMat.color.copy(color)
    this.streakMat.opacity = clamp01((speed - 2) / 14) * 0.6 * Math.max(dim, 0.4)
  }

  // ---------------------------------------------------------------------------
  // Маршрут камеры
  // ---------------------------------------------------------------------------

  private scrollToU(y: number) {
    const A = this.anchors
    if (A.length < 2) return 0
    for (let i = 0; i < A.length - 1; i++) {
      if (y < A[i + 1] || i === A.length - 2) {
        const span = Math.max(1, A[i + 1] - A[i])
        return i + clamp01((y - A[i]) / span)
      }
    }
    return A.length - 1
  }

  private orbitPoint(a: number, out: THREE.Vector3) {
    return out.set(C_PATHS.x + Math.sin(a) * ORBIT_R, C_PATHS.y + ORBIT_H, C_PATHS.z + Math.cos(a) * ORBIT_R)
  }

  /** Поза камеры для точки маршрута: позиция, цель взгляда, крен, яркость, ночь */
  private pose(u: number): { roll: number; dim: number; night: number } {
    const { pos, look, a, b, c } = this.tmp
    const i = Math.min(8, Math.floor(u))
    const t = clamp01(u - i)
    let roll = 0
    let dim = 1
    let night = 0

    switch (i) {
      case 0: {
        // Пролог: медленно, затем всё быстрее — сквозь центр меркабы
        const e = easeIn(t)
        pos.set(0, 0, lerp(15, -5, e))
        look.set(0, 0, lerp(0, -22, easeInOut(t)))
        roll = Math.sin(t * Math.PI) * 0.18
        break
      }
      case 1: {
        // Философия: полёт по туннелю врат со спиралью
        const z = lerp(-5, -34, t)
        const env = Math.sin(t * Math.PI)
        pos.set(Math.sin(t * TAU * 1.5) * 1.3 * env, Math.cos(t * TAU * 1.5) * 0.9 * env, z)
        look.set(pos.x * 0.3, pos.y * 0.3, z - 12)
        roll = Math.sin(t * TAU) * 0.3
        dim = this.isMobile ? 0.45 : 0.7
        break
      }
      case 2: {
        // Пути: выход из туннеля и облёт мандалы вместе с картами
        const approach = seg(t, 0, 0.14)
        const orbit = clamp01((t - 0.12) / 0.88)
        this.orbitPoint(orbit * ORBIT_SWEEP, a)
        pos.set(0, 0, -34).lerp(a, approach)
        look.set(0, 0, -46).lerp(C_PATHS, approach)
        dim = this.isMobile ? 0.6 : 1
        break
      }
      case 3: {
        // Нырок: вниз, в ночь, к книге
        const e = easeInOut(t)
        this.orbitPoint(ORBIT_SWEEP, a)
        b.set(-2, -7, -56)
        c.copy(C_BOOK).add(v3(0, 0, BOOK_VIEW_DISTANCE))
        bezier(a, b, c, e, pos)
        look.copy(C_PATHS).lerp(C_BOOK, easeInOut(clamp01(t * 1.3)))
        roll = Math.sin(t * Math.PI) * -0.22
        night = seg(t, 0.15, 0.75)
        break
      }
      case 4: {
        // Книга: камера замирает, книга раскрывается
        pos.copy(C_BOOK).add(v3(0, 0, BOOK_VIEW_DISTANCE))
        look.copy(C_BOOK)
        night = 1
        break
      }
      case 5: {
        // Подъём над книгой к Древу — рассвет
        const e = easeInOut(t)
        a.copy(C_BOOK).add(v3(0, 0, BOOK_VIEW_DISTANCE))
        b.set(0, -3.5, -74)
        c.copy(C_DIAL).add(v3(0, 0, 12))
        bezier(a, b, c, e, pos)
        look.copy(C_BOOK).lerp(C_DIAL, easeInOut(clamp01(t * 1.25)))
        roll = Math.sin(t * Math.PI) * 0.2
        night = 1 - seg(t, 0.2, 0.8)
        dim = lerp(1, 0.75, t)
        break
      }
      case 6: {
        // Коды: неспешный дрейф перед Древом
        a.copy(C_DIAL).add(v3(0, 0, 12))
        pos.copy(a).add(v3(Math.sin(t * Math.PI) * 1.2, t * 0.8, -t * 3))
        look.copy(C_DIAL)
        dim = this.isMobile ? 0.4 : 0.75
        break
      }
      case 7: {
        // Сессии: сквозь Древо — долгий тихий полёт
        a.copy(C_DIAL).add(v3(0, 0.8, 9))
        c.set(0, 0, C_FINALE.z + 22)
        pos.copy(a).lerp(c, easeInOut(t))
        look.set(0, lerp(C_DIAL.y, 0, t), pos.z - 20)
        roll = Math.sin(t * TAU) * 0.12
        dim = lerp(0.55, 0.3, seg(t, 0, 0.2))
        break
      }
      default: {
        // Запись: круг замыкается
        pos.set(0, 0, lerp(C_FINALE.z + 22, C_FINALE.z + 15, easeInOut(t)))
        look.copy(C_FINALE)
        dim = lerp(0.3, 0.95, seg(t, 0, 0.6))
      }
    }
    return { roll, dim, night }
  }

  // ---------------------------------------------------------------------------
  // Кадр
  // ---------------------------------------------------------------------------

  private loop = (now?: number) => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.loop)
    this.timer.update(now)
    const dt = Math.min(this.timer.getDelta(), 0.05)
    // в покое кадр не перерисовываем: всё зависит только от прокрутки и указателя
    const target = this.scrollToU(window.scrollY)
    const sig = [target.toFixed(5), this.introP, this.pointer.x, this.pointer.y, this.theme, this.book.ready].join('|')
    const settling = Math.abs(target - this.u) > 1e-4 || this.pointerSmooth.distanceTo(this.pointer) > 1e-3
    if (sig === this.lastSig && !settling && !this.dirty) return
    this.lastSig = sig
    this.dirty = false
    this.update(dt)
    this.render()
  }

  private setLines(l: LineFigure, draw: number, opacity: number) {
    const u = l.material.uniforms
    u.uDraw.value = lerp(-0.05, 1.05, clamp01(draw))
    u.uErase.value = -1
    u.uOpacity.value = opacity
    l.mesh.visible = draw > 0.001 && opacity > 0.001
    if (!l.mesh.visible) return
    u.uRot0.value.copy(this.identity)
    u.uRot1.value.copy(this.identity)
  }

  private update(dt: number) {
    const target = this.scrollToU(window.scrollY)
    // Lenis уже сглаживает прокрутку; здесь лишь убираем ступеньки при рывках
    this.u = dt === 0 ? target : this.u + (target - this.u) * (1 - Math.pow(0.0005, dt))
    const u = this.u
    const phase = u * 2.2
    this.pointerSmooth.lerp(this.pointer, 1 - Math.pow(0.03, dt || 1))

    const { roll, dim, night } = this.pose(u)
    const { pos, look } = this.tmp
    pos.x += this.pointerSmooth.x * 0.35
    pos.y -= this.pointerSmooth.y * 0.25
    this.camera.position.copy(pos)
    this.camera.up.set(Math.sin(roll), Math.cos(roll), 0)
    this.camera.lookAt(look)
    if (dt > 0) {
      this.tmp.c.copy(pos).sub(this.prevCam).divideScalar(dt)
      this.camVelocity.lerp(this.tmp.c, 0.18)
    }
    this.prevCam.copy(pos)

    // Ночь: в светлой теме глава «Книга» уходит во тьму, потом рассвет
    const light = this.theme === 'light'
    const n = light ? night : 1
    this.field.setNight(light ? night : 0)
    this.nebula.uniforms.uLight.value = light ? 1 - night : 0
    this.nebula.uniforms.uPhase.value = phase
    if (Math.abs(night - this.lastNight) > 0.002) {
      this.lastNight = night
      this.onNight?.(light ? night : 0)
    }
    const color = this.color.copy(DAY_GOLD).lerp(NIGHT_GOLD, n)
    this.dustMat.uniforms.uPhase.value = phase
    this.dustMat.uniforms.uColor.value.copy(color)
    this.dustMat.uniforms.uOpacity.value = lerp(0.32, 0.8, n) * Math.max(dim, 0.5)
    this.updateStreaks(this.camVelocity.length(), color, dim)

    // I / VII. Меркаба: в прологе — у начала пути, в финале — Метатрон перетекает в неё
    const intro = clamp01(this.introP)
    const finale = u > 6.6
    const g = this.field.group
    const heroR = this.isMobile ? HERO_R * 0.78 : HERO_R
    if (finale) {
      g.position.copy(C_FINALE)
      g.rotation.set(0, 0, 0)
      g.scale.setScalar(heroR)
      this.field.apply({ from: 'metatron', to: 'merkaba', t: seg(u, 7.0, 8.5), phase, opacity: dim * 0.7 })
    } else {
      g.position.set(0, 0, 0)
      g.rotation.set(0, 0, -clamp01(u) * 0.9)
      g.scale.setScalar(heroR)
      // пролетев сквозь меркабу, не тащим её за собой
      const heroO = (light ? 0.55 : 0.5) * (this.isMobile ? 0.75 : 1) * (1 - smooth(0.62, 0.95, u))
      const introFade = this.introP > 0 ? 0.3 + 0.7 * Math.min(1, intro * 1.5) : 0
      this.field.apply({
        from: intro < 1 ? 'cloud' : 'merkaba',
        to: 'merkaba',
        t: intro < 1 ? intro : 0,
        phase,
        opacity: heroO * dim * introFade,
      })
    }
    g.visible = finale || u < 1

    // II. Врата: прорисовываются на подлёте, вращаются навстречу друг другу
    // видны только ближайшие врата: проявляются из глубины и гаснут, пролетая мимо
    const gatesVisible = u > 0.25 && u < 2.4
    const camZ = this.camera.position.z
    this.gates.forEach((gate, i) => {
      const ahead = camZ - GATE_Z(i)
      const depth = smooth(-0.5, 2.5, ahead) * (1 - smooth(9, 16, ahead))
      const draw = gatesVisible ? clamp01((u - 0.3 - i * 0.07) / 0.35) : 0
      this.setLines(gate, draw, dim * depth * (light ? 0.42 : 0.5))
      gate.mesh.rotation.z = i * 0.37 + (u - 1) * (i % 2 ? 0.6 : -0.6)
    })

    // III. Мандала: Семя Жизни и символы путей; активный узел крупнее
    const mandalaVisible = u > 1.2 && u < 3.6
    this.mandala.visible = mandalaVisible
    if (mandalaVisible) {
      this.setLines(this.mandalaFloor, seg(u, 1.3, 2.15), dim * 0.55)
      this.mandala.rotation.y = u * 0.12
      const orbit = clamp01((u - 2 - 0.12) / 0.88)
      const active = orbit * 6
      this.nodes.forEach((node, i) => {
        const k = Math.max(0, 1 - Math.abs(active - i))
        this.setLines(node.lines, seg(u, 1.7 + i * 0.03, 2.2), dim * (0.35 + 0.5 * k))
        node.lines.mesh.scale.setScalar(0.8 + k * 0.45)
        // символ всегда смотрит на камеру
        this.mandala.updateMatrixWorld()
        this.mandala.getWorldQuaternion(this.parentQ).invert()
        node.lines.mesh.quaternion.copy(this.camera.quaternion).premultiply(this.parentQ)
      })
    }

    // IV. Книга и ореол
    const bookZone = u > 2.4 && u < 6.4
    this.bookRoot.visible = bookZone && this.book.ready
    const haloDim = lerp(1, 0.35, seg(u, 4.1, 4.3)) + seg(u, 4.9, 5.2) * 0.65
    if (bookZone) {
      this.setLines(this.halo, seg(u, 2.7, 3.9), dim * haloDim * 0.5)
      this.halo.mesh.rotation.z = -u * 0.08
      if (this.book.ready) this.book.update(clamp01(u - 4), phase, this.pointerSmooth)
    } else {
      this.halo.mesh.visible = false
    }
    if (u > 1.4 && !this.bookLoading) this.loadBook()

    // V. Древо Жизни: прорисовывается на подъёме и медленно разворачивается
    const dialVisible = u > 4.5 && u < 8
    if (dialVisible) {
      this.setLines(this.dial, seg(u, 4.6, 5.6), dim * 0.55)
      this.dial.mesh.rotation.set(0, (u - 6) * 0.35, 0)
    } else {
      this.dial.mesh.visible = false
    }
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }

  private async loadBook() {
    this.bookLoading = true
    try {
      await this.book.load(this.isMobile)
      this.resize()
    } catch (err) {
      console.warn('Книга для сцены не загрузилась', err)
    }
  }

  resize() {
    this.dirty = true
    const w = window.innerWidth
    const h = window.innerHeight
    this.isMobile = w < 900
    this.renderer.setSize(w, h, false)
    const pr = this.renderer.getPixelRatio()
    this.camera.aspect = w / h
    // на узком экране отодвигаем кадр, чтобы фигура помещалась по ширине
    this.camera.fov = this.camera.aspect < 0.8 ? FOV * 1.35 : FOV
    this.camera.updateProjectionMatrix()
    this.field?.setResolution(w * pr, h * pr, pr)
    if (this.nebula) this.nebula.uniforms.uAspect.value.set(w / Math.min(w, h), h / Math.min(w, h))
    if (this.dustMat) this.dustMat.uniforms.uPixelRatio.value = pr
    const visH = 2 * BOOK_VIEW_DISTANCE * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    this.book.setLayout(visH * this.camera.aspect, visH, this.isMobile)
  }
}
