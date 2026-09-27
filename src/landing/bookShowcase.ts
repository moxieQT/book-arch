import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { BOOK_VIEW_DISTANCE, BookModel } from './cosmos/bookModel'

/**
 * Запасная витрина книги со своим холстом — для случаев, когда общая сцена
 * «Космос» не запускается (нет WebGL2 или включено «уменьшить движение»).
 */
export class BookShowcase {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
  private model: BookModel
  private disposables: { dispose: () => void }[] = []
  private progress = 0
  private resizeObserver: ResizeObserver
  private isMobile = false
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.08
    this.renderer.setClearColor(0x000000, 0)

    this.camera.position.set(0, 0, BOOK_VIEW_DISTANCE)
    this.camera.lookAt(0, 0, 0)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environment = env
    this.scene.environmentIntensity = 0.55
    this.disposables.push(env, pmrem)

    const key = new THREE.DirectionalLight(0xfff0d8, 1.7)
    key.position.set(-3, 4, 7)
    const gold = new THREE.PointLight(0xffc873, 18, 14, 2)
    gold.position.set(3.2, 1.6, 3.4)
    this.scene.add(key, gold, new THREE.AmbientLight(0xfff4e6, 0.35))

    this.model = new BookModel(this.renderer.capabilities.getMaxAnisotropy())
    this.scene.add(this.model.root)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas.parentElement ?? canvas)
    this.resize()
  }

  async init() {
    await this.model.load(this.isMobile)
    this.render()
  }

  setProgress(p: number) {
    this.progress = Math.min(1, Math.max(0, p))
    this.render()
  }

  private render() {
    this.model.update(this.progress, 0, { x: 0, y: 0 })
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
    const visH = 2 * BOOK_VIEW_DISTANCE * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    this.model.setLayout(visH * this.camera.aspect, visH, this.isMobile)
    this.render()
  }

  dispose() {
    this.resizeObserver.disconnect()
    this.model.dispose()
    this.disposables.forEach((d) => d.dispose())
    this.renderer.dispose()
  }
}
