import * as THREE from 'three'
import type { Chapter } from '../numerology/chapters'
import {
  drawCoverOntoCanvas,
  drawPageLeftOntoCanvas,
  drawPageRightOntoCanvas,
  drawEndpaperOntoCanvas,
  makeGildedEdgesTexture,
} from './luxuryTextures'
import {
  CANVAS_W,
  CANVAS_H,
  COVER_LAYOUT,
  READING_TABS,
  STAR_RATING_LAYOUT,
  NAV_LAYOUT,
  isInside,
} from './bookLayout'
import { useBookStore, type ReadingLayerTab } from '../store/useBookStore'

const BOOK_W = 2.2
const BOOK_D = 3.0
const BOOK_THICKNESS = 0.19
const STACK_STEP = 0.012
const SEGX = 32
const SEGZ = 18
const TURN_DURATION = 820
// Свободный край листа не поворачивается синхронно с корешком, а слегка
// "забегает вперёд" по углу поворота — из-за этого лист закручивается в
// подобие свитка вместо жёсткого поворота двери на одной оси.
const CURL_EXTRA_ANGLE = 0.85
const DIAGONAL_SWEEP = 0.4
const RIPPLE_AMPLITUDE = 0.01

interface LeafTextures {
  frontCanvas?: HTMLCanvasElement
  frontTexture?: THREE.CanvasTexture
  backCanvas?: HTMLCanvasElement
  backTexture?: THREE.CanvasTexture
}

interface Leaf {
  pivot: THREE.Group
  mesh: THREE.Mesh
  backMesh?: THREE.Mesh
  restY: number
  textures: LeafTextures
  chapterIdx?: number
}

export type CamState = 'cover' | 'cover_input' | 'reading_spread' | 'reading_left' | 'reading_right'
export type ReadingView = 'spread' | 'left' | 'right'
type TurnDirection = 'next' | 'prev'

interface TurnAnim {
  leaf: Leaf
  direction: TurnDirection
  start: number
  onDone?: (ok: boolean) => void
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export class BookScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private stage: HTMLElement
  private bookRoot = new THREE.Group()
  private turnable: Leaf[] = []
  private staticLastPage: Leaf | null = null
  private turnsCount = 0
  private leftStackCounter = 0
  private anim: TurnAnim | null = null

  // Реалистичный 3D массив книги (золоченый срез, корешок, переплет)
  private bookBlockRight: THREE.Mesh | null = null
  private bookBlockLeft: THREE.Mesh | null = null
  private bottomCoverBoard: THREE.Mesh | null = null
  private spineMesh: THREE.Mesh | null = null
  private ground: THREE.Mesh | null = null
  private ribMeshes: THREE.Mesh[] = []

  // Реестр постоянных ресурсов для чистого WebGL dispose
  private staticDisposables: {
    geometries: THREE.BufferGeometry[]
    materials: THREE.Material[]
    textures: THREE.Texture[]
  } = {
    geometries: [],
    materials: [],
    textures: [],
  }

  private camState: CamState = 'cover'
  private readingView: ReadingView = 'spread'
  private openTimer: number | null = null

  private clock = new THREE.Clock()
  private raf = 0
  private warmLight: THREE.PointLight
  private dust: THREE.Points
  private dustSpeed: Float32Array
  private currentLook: THREE.Vector3
  private disposed = false
  private resizeObserver: ResizeObserver

  private chapters: Chapter[] = []
  // Сколько листов занимает активная вкладка правой страницы каждой главы
  private tabPageCounts: number[] = []
  private draftDate = { day: 2, month: 4, year: 1994 }
  private raycaster = new THREE.Raycaster()
  private mouseVec = new THREE.Vector2()

  private targets: Record<CamState, { pos: THREE.Vector3; look: THREE.Vector3 }> = {
    cover: {
      pos: new THREE.Vector3(BOOK_W / 2, 4.4, 3.4),
      look: new THREE.Vector3(BOOK_W / 2, 0.12, 0.28),
    },
    cover_input: {
      pos: new THREE.Vector3(BOOK_W / 2, 4.3, 0.05),
      look: new THREE.Vector3(BOOK_W / 2, 0.08, 0.05),
    },
    reading_spread: {
      pos: new THREE.Vector3(0, 4.5, 0.02),
      look: new THREE.Vector3(0, 0, 0.02),
    },
    reading_left: {
      pos: new THREE.Vector3(-1.1, 4.02, 0.02),
      look: new THREE.Vector3(-1.1, 0, 0.02),
    },
    reading_right: {
      pos: new THREE.Vector3(1.1, 4.02, 0.02),
      look: new THREE.Vector3(1.1, 0, 0.02),
    },
  }

  constructor(canvas: HTMLCanvasElement, stage: HTMLElement) {
    this.stage = stage
    this.scene.fog = new THREE.FogExp2(0xe6dfd2, 0.032)

    this.camera = new THREE.PerspectiveCamera(42, stage.clientWidth / Math.max(1, stage.clientHeight), 0.1, 50)
    this.camera.position.copy(this.targets.cover.pos)
    this.currentLook = this.targets.cover.look.clone()

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(stage.clientWidth, stage.clientHeight)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.12

    this.scene.add(new THREE.HemisphereLight(0xfffbf4, 0xd8cebe, 0.78))

    const keyLight = new THREE.DirectionalLight(0xfff7ec, 1.45)
    keyLight.position.set(2.4, 5.0, 2.6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.bias = -0.0001
    keyLight.shadow.radius = 3.5
    keyLight.shadow.camera.left = -3.8
    keyLight.shadow.camera.right = 3.8
    keyLight.shadow.camera.top = 3.8
    keyLight.shadow.camera.bottom = -3.8
    this.scene.add(keyLight)

    this.warmLight = new THREE.PointLight(0xffaa42, 1.15, 12, 2)
    this.warmLight.position.set(0.8, 2.4, 1.4)
    this.scene.add(this.warmLight)

    const rimLight = new THREE.PointLight(0xead8b5, 0.45, 12, 2)
    rimLight.position.set(-1.6, 1.6, -1.8)
    this.scene.add(rimLight)

    const groundGeo = new THREE.PlaneGeometry(14, 14)
    groundGeo.rotateX(-Math.PI / 2)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe8dfd0, roughness: 0.94, metalness: 0.02 })
    this.ground = new THREE.Mesh(groundGeo, groundMat)
    this.ground.position.y = -0.05
    this.ground.receiveShadow = true
    this.scene.add(this.ground)
    this.staticDisposables.geometries.push(groundGeo)
    this.staticDisposables.materials.push(groundMat)

    const DUST_N = 50
    const dustGeo = new THREE.BufferGeometry()
    const dustPos = new Float32Array(DUST_N * 3)
    this.dustSpeed = new Float32Array(DUST_N)
    for (let i = 0; i < DUST_N; i++) {
      dustPos[i * 3 + 0] = (Math.random() - 0.5) * 6
      dustPos[i * 3 + 1] = Math.random() * 3
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 4
      this.dustSpeed[i] = 0.05 + Math.random() * 0.08
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    const dustMat = new THREE.PointsMaterial({ color: 0xc6a76b, size: 0.02, transparent: true, opacity: 0.5, sizeAttenuation: true })
    this.dust = new THREE.Points(dustGeo, dustMat)
    this.scene.add(this.dust)
    this.staticDisposables.geometries.push(dustGeo)
    this.staticDisposables.materials.push(dustMat)

    this.scene.add(this.bookRoot)

    // Создаем трехмерный массив книги: золоченый срез страниц, корешок с ребрами и нижняя крышка
    this.createBookRigidBody()

    this.onResize()
    this.camera.position.copy(this.targets.cover.pos)
    this.currentLook = this.targets.cover.look.clone()

    this.stage.addEventListener('pointermove', this.onPointerMove)
    this.stage.addEventListener('pointerdown', this.onPointerDown)
    this.resizeObserver = new ResizeObserver(() => this.onResize())
    this.resizeObserver.observe(stage)

    this.animate()
  }

  private onPointerMove = (e: PointerEvent) => {
    const r = this.stage.getBoundingClientRect()
    this.mouseVec.x = ((e.clientX - r.left) / r.width) * 2 - 1
    this.mouseVec.y = -(((e.clientY - r.top) / r.height) * 2 - 1)

    const hit = this.performRaycast()
    if (hit) {
      this.stage.style.cursor = hit.cursor
    } else {
      this.stage.style.cursor = 'default'
    }
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.anim) return
    const r = this.stage.getBoundingClientRect()
    this.mouseVec.x = ((e.clientX - r.left) / r.width) * 2 - 1
    this.mouseVec.y = -(((e.clientY - r.top) / r.height) * 2 - 1)

    const hit = this.performRaycast()
    if (hit && hit.action) {
      hit.action()
    }
  }

  private performRaycast(): { cursor: string; action?: () => void } | null {
    this.raycaster.setFromCamera(this.mouseVec, this.camera)
    const store = useBookStore.getState()

    // 1. Книга закрыта (Обложка)
    if (this.turnsCount === 0 && this.turnable.length > 0) {
      const coverLeaf = this.turnable[0]
      const intersects = this.raycaster.intersectObject(coverLeaf.mesh)
      if (intersects.length === 0 || !intersects[0].uv) return null

      const uv = intersects[0].uv
      const x = uv.x * CANVAS_W
      const y = (1 - uv.y) * CANVAS_H

      if (store.coverState === 'presentation') {
        return {
          cursor: 'pointer',
          action: () => {
            store.setCoverState('input')
          },
        }
      }

      // Кнопка День ‹
      if (isInside(x, y, COVER_LAYOUT.dayMinus.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            this.draftDate.day = this.draftDate.day <= 1 ? 31 : this.draftDate.day - 1
            this.updateCoverTexture()
          },
        }
      }
      // Кнопка День ›
      if (isInside(x, y, COVER_LAYOUT.dayPlus.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            this.draftDate.day = this.draftDate.day >= 31 ? 1 : this.draftDate.day + 1
            this.updateCoverTexture()
          },
        }
      }
      // Кнопка Месяц ‹
      if (isInside(x, y, COVER_LAYOUT.monthMinus.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            this.draftDate.month = this.draftDate.month <= 1 ? 12 : this.draftDate.month - 1
            this.updateCoverTexture()
          },
        }
      }
      // Кнопка Месяц ›
      if (isInside(x, y, COVER_LAYOUT.monthPlus.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            this.draftDate.month = this.draftDate.month >= 12 ? 1 : this.draftDate.month + 1
            this.updateCoverTexture()
          },
        }
      }
      // Кнопка Год ‹
      if (isInside(x, y, COVER_LAYOUT.yearMinus.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            this.draftDate.year = Math.max(1920, this.draftDate.year - 1)
            this.updateCoverTexture()
          },
        }
      }
      // Кнопка Год ›
      if (isInside(x, y, COVER_LAYOUT.yearPlus.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            this.draftDate.year = Math.min(2026, this.draftDate.year + 1)
            this.updateCoverTexture()
          },
        }
      }
      // Кнопка эталона 02.04.1994
      if (isInside(x, y, COVER_LAYOUT.presetButton.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            this.draftDate = { day: 2, month: 4, year: 1994 }
            this.updateCoverTexture()
            store.setBirthDate(new Date(1994, 3, 2))
            store.openBook()
          },
        }
      }
      // Кнопка Открыть Врата
      if (isInside(x, y, COVER_LAYOUT.openButton.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            store.setBirthDate(new Date(this.draftDate.year, this.draftDate.month - 1, this.draftDate.day))
            store.openBook()
          },
        }
      }
      // Возврат к наклону обложки
      if (isInside(x, y, COVER_LAYOUT.returnLink.hit)) {
        return {
          cursor: 'pointer',
          action: () => {
            store.setCoverState('presentation')
          },
        }
      }

      return null
    }

    // 2. Книга открыта (Чтение разворота)
    if (this.turnsCount > 0) {
      const leftLeaf = this.turnable[this.turnsCount - 1]
      const rightLeaf = this.turnsCount < this.turnable.length ? this.turnable[this.turnsCount] : this.staticLastPage

      // Проверка левой страницы
      if (leftLeaf && leftLeaf.backMesh) {
        const leftIntersects = this.raycaster.intersectObject(leftLeaf.backMesh)
        if (leftIntersects.length > 0 && leftIntersects[0].uv) {
          const uv = leftIntersects[0].uv
          const x = (1 - uv.x) * CANVAS_W
          const y = (1 - uv.y) * CANVAS_H

          // Если фокус на правой странице или общий разворот, клик по левой странице мягко переводит фокус на неё
          if (this.camState === 'reading_right' || this.camState === 'reading_spread') {
            return {
              cursor: 'pointer',
              action: () => {
                this.readingView = 'left'
                this.setCamState('reading_left')
              },
            }
          }

          // Кнопка ‹ Назад / ‹ Обложка
          if (isInside(x, y, NAV_LAYOUT.backButton.hit)) {
            return {
              cursor: 'pointer',
              action: () => this.handleBackAction(),
            }
          }

          // Кнопка Далее › на левой странице (переход к правой странице разворота)
          if (isInside(x, y, NAV_LAYOUT.nextButton.hit)) {
            return {
              cursor: 'pointer',
              action: () => this.handleNextAction(),
            }
          }

          // 13-я глава: Закрыть книгу и начать заново
          if (this.turnsCount === 13 && isInside(x, y, NAV_LAYOUT.restartButton.hit)) {
            return {
              cursor: 'pointer',
              action: () => store.requestRestart(),
            }
          }

          // Шкала 1-5 звёзд
          if (y >= STAR_RATING_LAYOUT.yZone.y1 && y <= STAR_RATING_LAYOUT.yZone.y2) {
            for (let i = 1; i <= STAR_RATING_LAYOUT.starCount; i++) {
              if (isInside(x, y, STAR_RATING_LAYOUT.getStarHit(i))) {
                return {
                  cursor: 'pointer',
                  action: () => {
                    const ch = this.chapters[this.turnsCount - 1]
                    const posId = ch?.positionId ?? ch?.id
                    if (posId) {
                      store.setScore(posId, i)
                      this.updateLeftPageScore(this.turnsCount - 1, i)
                    }
                  },
                }
              }
            }
          }

          return null
        }
      }

      // Проверка правой страницы
      if (rightLeaf && rightLeaf.mesh) {
        const rightIntersects = this.raycaster.intersectObject(rightLeaf.mesh)
        if (rightIntersects.length > 0 && rightIntersects[0].uv) {
          const uv = rightIntersects[0].uv
          const x = uv.x * CANVAS_W
          const y = (1 - uv.y) * CANVAS_H

          // Если фокус на левой странице или общий разворот, клик по правой странице переводит фокус на неё
          if (this.camState === 'reading_left' || this.camState === 'reading_spread') {
            return {
              cursor: 'pointer',
              action: () => {
                this.readingView = 'right'
                this.setCamState('reading_right')
              },
            }
          }

          // Кнопка ‹ Назад на правой странице (возврат к левой странице)
          if (isInside(x, y, NAV_LAYOUT.backButton.hit)) {
            return {
              cursor: 'pointer',
              action: () => this.handleBackAction(),
            }
          }

          // Кнопка Далее › / Карта Профиля › / Завершить чтение
          if (isInside(x, y, NAV_LAYOUT.nextButton.hit)) {
            return {
              cursor: 'pointer',
              action: () => this.handleNextAction(),
            }
          }

          // Вкладки в шапке (1-10 главы)
          if (this.turnsCount <= 10) {
            for (const t of READING_TABS) {
              if (isInside(x, y, t.hit)) {
                return {
                  cursor: 'pointer',
                  action: () => {
                    store.setActiveLayerTab(t.key)
                    this.updateRightPageTab(this.turnsCount - 1, t.key)
                  },
                }
              }
            }
          }

          // 13-я глава: клик по карточке матрицы
          if (this.turnsCount === 13) {
            const gridCols = 4
            const startX = 90 + 40
            const startY = 220
            const cardW = 270
            const cardH = 110
            const gapX = 35
            const gapY = 25

            for (let idx = 0; idx < 16; idx++) {
              const col = idx % gridCols
              const row = Math.floor(idx / gridCols)
              const cX = startX + col * (cardW + gapX)
              const cY = startY + row * (cardH + gapY)

              if (x >= cX && x <= cX + cardW && y >= cY && y <= cY + cardH) {
                const targetChapter = idx < 10 ? idx + 1 : idx < 13 ? 11 : 12
                return {
                  cursor: 'pointer',
                  action: () => {
                    this.readingView = 'left'
                    this.setCamState('reading_left')
                    store.goToSpread(targetChapter)
                  },
                }
              }
            }
          }

          return null
        }
      }
    }

    return null
  }

  /**
   * Логика перехода «Далее»:
   * - С левой страницы -> на правую страницу (фокус камеры)
   * - С правой страницы -> переворот страницы и переход на левую страницу следующей главы
   */
  handleNextAction() {
    const store = useBookStore.getState()
    const pageCount = this.tabPageCounts[this.turnsCount - 1] ?? 1
    if (this.camState === 'reading_right' && store.tabPage < pageCount - 1) {
      // длинная вкладка: сначала дочитываем её следующий лист
      store.setTabPage(store.tabPage + 1)
      return
    }
    if (this.camState === 'reading_left') {
      this.readingView = 'right'
      this.setCamState('reading_right')
    } else {
      if (this.turnsCount >= this.chapters.length) {
        store.requestRestart()
      } else {
        this.readingView = 'left'
        this.setCamState('reading_left')
        store.nextSpread()
      }
    }
  }

  /**
   * Логика перехода «Назад»:
   * - С правой страницы -> возврат на левую страницу той же главы
   * - С левой страницы -> переворот назад на правую страницу предыдущей главы (или возврат на обложку)
   */
  handleBackAction() {
    const store = useBookStore.getState()
    if (this.camState === 'reading_right' && store.tabPage > 0) {
      store.setTabPage(store.tabPage - 1)
      return
    }
    if (this.camState === 'reading_right') {
      this.readingView = 'left'
      this.setCamState('reading_left')
    } else {
      if (this.turnsCount > 1) {
        this.readingView = 'right'
        this.setCamState('reading_right')
        store.prevSpread()
      } else {
        store.prevSpread()
      }
    }
  }

  private onResize() {
    if (this.disposed) return
    const w = this.stage.clientWidth
    const h = this.stage.clientHeight
    if (w === 0 || h === 0) return
    const aspect = w / h
    this.camera.aspect = aspect
    this.camera.fov = 42

    const halfFovRad = (42 / 2) * (Math.PI / 180)
    const tanHalf = Math.tan(halfFovRad)

    // Фокус чтения страницы: лист целиком в кадре с небольшим полем,
    // чтобы шапка («ГЛАВА 1 ИЗ 13») и кнопки внизу не обрезались.
    // Высота страницы BOOK_D = 3.0, ширина BOOK_W = 2.2
    const neededH = Math.max(3.1, 2.3 / aspect)
    const readDist = neededH / (2 * tanHalf)

    this.targets.reading_left.pos.set(-1.1, readDist, 0.02)
    this.targets.reading_left.look.set(-1.1, 0, 0.02)

    this.targets.reading_right.pos.set(1.1, readDist, 0.02)
    this.targets.reading_right.look.set(1.1, 0, 0.02)

    // Общий разворот обеих страниц (ширина 4.4, высота 3.0)
    const neededSpreadH = Math.max(3.25, 4.55 / aspect)
    const spreadDist = neededSpreadH / (2 * tanHalf)
    this.targets.reading_spread.pos.set(0, spreadDist, 0.02)
    this.targets.reading_spread.look.set(0, 0, 0.02)

    // Презентация закрытой книги: видна вся книга, нижний срез страниц, корешок и стол
    const neededCoverH = Math.max(4.2, 3.1 / aspect)
    const coverDist = Math.max(4.6, neededCoverH / (2 * tanHalf))
    this.targets.cover.pos.set(BOOK_W / 2, coverDist * 0.88, coverDist * 0.68)
    this.targets.cover.look.set(BOOK_W / 2, 0.12, 0.28)

    // Ввод даты на обложке:
    const coverInputDist = Math.max(4.3, Math.max(3.9, 2.7 / aspect) / (2 * tanHalf))
    this.targets.cover_input.pos.set(BOOK_W / 2, coverInputDist, 0.05)
    this.targets.cover_input.look.set(BOOK_W / 2, 0.08, 0.05)

    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  private makeLeafGeometry() {
    const geo = new THREE.PlaneGeometry(BOOK_W, BOOK_D, SEGX, SEGZ)
    geo.rotateX(-Math.PI / 2)
    geo.translate(BOOK_W / 2, 0, 0)
    return geo
  }

  private createLeafFromCanvases(
    frontCanvas?: HTMLCanvasElement,
    frontTexture?: THREE.CanvasTexture,
    backCanvas?: HTMLCanvasElement,
    backTexture?: THREE.CanvasTexture,
    yOffset = 0,
    chapterIdx?: number
  ): Leaf {
    const geo = this.makeLeafGeometry()
    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTexture,
      side: backTexture ? THREE.FrontSide : THREE.DoubleSide,
      roughness: 0.88,
      metalness: 0.05,
    })
    const mesh = new THREE.Mesh(geo, frontMat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData.basePos = (geo.attributes.position.array as Float32Array).slice()
    mesh.userData.rippleSeed = Math.random() * Math.PI * 2

    let backMesh: THREE.Mesh | undefined
    if (backTexture) {
      backTexture.wrapS = THREE.RepeatWrapping
      backTexture.repeat.x = -1
      backTexture.offset.x = 1
      const backMat = new THREE.MeshStandardMaterial({
        map: backTexture,
        side: THREE.BackSide,
        roughness: 0.88,
        metalness: 0.05,
      })
      backMesh = new THREE.Mesh(geo, backMat)
      backMesh.receiveShadow = true
      mesh.add(backMesh)
    }

    const pivot = new THREE.Group()
    pivot.position.y = yOffset
    pivot.add(mesh)
    this.bookRoot.add(pivot)
    return {
      pivot,
      mesh,
      backMesh,
      restY: yOffset,
      textures: { frontCanvas, frontTexture, backCanvas, backTexture },
      chapterIdx,
    }
  }

  private disposeLeaf(leaf: Leaf) {
    this.bookRoot.remove(leaf.pivot)
    leaf.mesh.geometry.dispose()
    const mat = leaf.mesh.material as THREE.MeshStandardMaterial
    mat.map?.dispose()
    mat.dispose()
    if (leaf.backMesh) {
      const backMat = leaf.backMesh.material as THREE.MeshStandardMaterial
      backMat.map?.dispose()
      backMat.dispose()
    }
  }

  private clearBook() {
    if (this.openTimer) {
      window.clearTimeout(this.openTimer)
      this.openTimer = null
    }
    this.turnable.forEach((l) => this.disposeLeaf(l))
    if (this.staticLastPage) this.disposeLeaf(this.staticLastPage)
    this.turnable = []
    this.staticLastPage = null
    this.turnsCount = 0
    this.leftStackCounter = 0
    this.anim = null
  }

  buildBook(chapters: Chapter[]) {
    this.clearBook()
    this.chapters = chapters
    const n = chapters.length
    if (n === 0) return

    const store = useBookStore.getState()
    const scores = store.scores
    const activeTab = store.activeLayerTab
    const profile = store.profile

    // Лист 0: Обложка + Левая страница Главы 1
    const coverCv = document.createElement('canvas')
    drawCoverOntoCanvas(coverCv, store.coverState, this.draftDate)
    const coverTex = new THREE.CanvasTexture(coverCv)
    coverTex.colorSpace = THREE.SRGBColorSpace

    const ch1LeftCv = document.createElement('canvas')
    const ch1Score = store.getLatestScore(chapters[0].positionId ?? chapters[0].id)
    drawPageLeftOntoCanvas(ch1LeftCv, chapters[0], 1, ch1Score)
    const ch1LeftTex = new THREE.CanvasTexture(ch1LeftCv)
    ch1LeftTex.colorSpace = THREE.SRGBColorSpace

    const coverLeaf = this.createLeafFromCanvases(coverCv, coverTex, ch1LeftCv, ch1LeftTex, STACK_STEP * (n + 2), 0)
    this.turnable.push(coverLeaf)

    // Листы 1 .. n-1
    for (let i = 0; i < n - 1; i++) {
      const frontCv = document.createElement('canvas')
      this.tabPageCounts[i] = drawPageRightOntoCanvas(frontCv, chapters[i], i + 1, activeTab, false, scores, profile)
      const frontTex = new THREE.CanvasTexture(frontCv)
      frontTex.colorSpace = THREE.SRGBColorSpace

      const backCv = document.createElement('canvas')
      const nextScore = store.getLatestScore(chapters[i + 1].positionId ?? chapters[i + 1].id)
      drawPageLeftOntoCanvas(backCv, chapters[i + 1], i + 2, nextScore)
      const backTex = new THREE.CanvasTexture(backCv)
      backTex.colorSpace = THREE.SRGBColorSpace

      const y = STACK_STEP * (n - i)
      const leaf = this.createLeafFromCanvases(frontCv, frontTex, backCv, backTex, y, i + 1)
      this.turnable.push(leaf)
    }

    // Лист n (staticLastPage)
    const lastFrontCv = document.createElement('canvas')
    this.tabPageCounts[n - 1] = drawPageRightOntoCanvas(lastFrontCv, chapters[n - 1], n, activeTab, true, scores, profile)
    const lastFrontTex = new THREE.CanvasTexture(lastFrontCv)
    lastFrontTex.colorSpace = THREE.SRGBColorSpace

    const lastBackCv = document.createElement('canvas')
    drawEndpaperOntoCanvas(lastBackCv)
    const lastBackTex = new THREE.CanvasTexture(lastBackCv)
    lastBackTex.colorSpace = THREE.SRGBColorSpace

    this.staticLastPage = this.createLeafFromCanvases(lastFrontCv, lastFrontTex, lastBackCv, lastBackTex, STACK_STEP, n)
    this.updateBookBlocks()
  }

  private createBookRigidBody() {
    const gildedTex = makeGildedEdgesTexture()
    this.staticDisposables.textures.push(gildedTex)

    // Материал среза страниц (золоченый срез книги с рельефными слоями)
    const gildedMat = new THREE.MeshStandardMaterial({
      map: gildedTex,
      roughness: 0.5,
      metalness: 0.32,
    })

    const innerPageMat = new THREE.MeshStandardMaterial({
      color: 0xe8dfcb,
      roughness: 0.92,
      metalness: 0.02,
    })

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x340e1c, // Сафьяновый бордовый переплет
      roughness: 0.65,
      metalness: 0.1,
    })

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.75,
    })

    const transparentMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })

    this.staticDisposables.materials.push(gildedMat, innerPageMat, leatherMat, goldTrimMat, transparentMat)

    // 1. Нижняя жесткая крышка переплета (Bottom Cover Board)
    const boardW = BOOK_W + 0.06
    const boardD = BOOK_D + 0.08
    const boardH = 0.025
    const boardGeo = new THREE.BoxGeometry(boardW, boardH, boardD)
    this.staticDisposables.geometries.push(boardGeo)
    this.bottomCoverBoard = new THREE.Mesh(boardGeo, leatherMat)
    this.bottomCoverBoard.position.set(boardW / 2 - 0.02, -boardH / 2, 0)
    this.bottomCoverBoard.castShadow = true
    this.bottomCoverBoard.receiveShadow = true
    this.bookRoot.add(this.bottomCoverBoard)

    // 2. Корешок книги (Rounded Leather Spine) вдоль оси Z при X = 0
    const spineRadius = BOOK_THICKNESS / 2 + 0.015
    const spineLength = BOOK_D + 0.08
    const spineGeo = new THREE.CylinderGeometry(spineRadius, spineRadius, spineLength, 24, 1, false, Math.PI / 2, Math.PI)
    spineGeo.rotateX(Math.PI / 2)
    this.staticDisposables.geometries.push(spineGeo)
    this.spineMesh = new THREE.Mesh(spineGeo, leatherMat)
    this.spineMesh.position.set(0, spineRadius - 0.015, 0)
    this.spineMesh.castShadow = true
    this.bookRoot.add(this.spineMesh)

    // 3. Золоченые ребра на корешке (бинтики фолианта)
    const ribGeo = new THREE.TorusGeometry(spineRadius + 0.003, 0.007, 12, 24, Math.PI)
    ribGeo.rotateY(Math.PI / 2)
    ribGeo.rotateZ(Math.PI / 2)
    this.staticDisposables.geometries.push(ribGeo)
    const ribPositions = [-1.1, -0.55, 0, 0.55, 1.1]
    ribPositions.forEach((z) => {
      const rib = new THREE.Mesh(ribGeo, goldTrimMat)
      rib.position.set(0, spineRadius - 0.015, z)
      this.bookRoot.add(rib)
      this.ribMeshes.push(rib)
    })

    // 4. Правый книжный блок страниц (толщина книги)
    const blockMaterials = [
      gildedMat,       // +X (fore-edge)
      innerPageMat,    // -X (spine side)
      transparentMat,  // +Y (верх - прозрачно, здесь лежат страницы!)
      transparentMat,  // -Y (низ)
      gildedMat,       // +Z (НИЖНИЙ СРЕЗ/КОРЕШОК - прямо перед глазами пользователя)
      gildedMat,       // -Z (верхний срез)
    ]

    const blockW = BOOK_W - 0.04
    const blockD = BOOK_D - 0.04
    const blockH = BOOK_THICKNESS
    const blockGeo = new THREE.BoxGeometry(blockW, blockH, blockD)
    blockGeo.translate(blockW / 2, blockH / 2, 0)
    this.staticDisposables.geometries.push(blockGeo)

    this.bookBlockRight = new THREE.Mesh(blockGeo, blockMaterials)
    this.bookBlockRight.position.set(0.02, 0, 0)
    this.bookBlockRight.castShadow = true
    this.bookBlockRight.receiveShadow = true
    this.bookRoot.add(this.bookBlockRight)

    // 5. Левый книжный блок (растет по мере перелистывания страниц)
    const leftBlockGeo = new THREE.BoxGeometry(blockW, blockH, blockD)
    leftBlockGeo.translate(-blockW / 2, blockH / 2, 0)
    this.staticDisposables.geometries.push(leftBlockGeo)
    const leftMaterials = [
      innerPageMat,    // +X (spine side)
      gildedMat,       // -X (left fore-edge)
      transparentMat,  // +Y (верх - прозрачно)
      transparentMat,  // -Y
      gildedMat,       // +Z (нижний срез)
      gildedMat,       // -Z (верхний срез)
    ]
    this.bookBlockLeft = new THREE.Mesh(leftBlockGeo, leftMaterials)
    this.bookBlockLeft.position.set(-0.02, 0, 0)
    this.bookBlockLeft.visible = false
    this.bookBlockLeft.castShadow = true
    this.bookBlockLeft.receiveShadow = true
    this.bookRoot.add(this.bookBlockLeft)
  }

  private updateBookBlocks() {
    if (!this.bookBlockRight || !this.bookBlockLeft) return
    const total = Math.max(1, this.chapters.length)
    const frac = this.turnsCount / total

    this.bookBlockLeft.visible = this.turnsCount > 0
    this.bookBlockRight.visible = this.turnsCount < total

    const rightScale = Math.max(0.015, 1 - frac)
    const leftScale = Math.max(0.015, frac)
    this.bookBlockRight.scale.y = rightScale
    this.bookBlockLeft.scale.y = leftScale
  }

  updateCoverTexture() {
    if (this.turnable.length === 0) return
    const coverLeaf = this.turnable[0]
    if (!coverLeaf.textures.frontCanvas || !coverLeaf.textures.frontTexture) return
    const store = useBookStore.getState()
    drawCoverOntoCanvas(coverLeaf.textures.frontCanvas, store.coverState, this.draftDate)
    coverLeaf.textures.frontTexture.needsUpdate = true
  }

  updateRightPageTab(spreadIdx: number, activeTab: ReadingLayerTab) {
    if (spreadIdx < 0 || spreadIdx >= this.chapters.length) return
    const chapter = this.chapters[spreadIdx]
    const leaf = spreadIdx < this.turnable.length - 1 ? this.turnable[spreadIdx + 1] : this.staticLastPage
    if (!leaf || !leaf.textures.frontCanvas || !leaf.textures.frontTexture) return

    const store = useBookStore.getState()
    this.tabPageCounts[spreadIdx] = drawPageRightOntoCanvas(
      leaf.textures.frontCanvas,
      chapter,
      spreadIdx + 1,
      activeTab,
      spreadIdx === this.chapters.length - 1,
      store.scores,
      store.profile,
      store.tabPage
    )
    leaf.textures.frontTexture.needsUpdate = true
  }

  updateLeftPageScore(spreadIdx: number, score: number) {
    if (spreadIdx < 0 || spreadIdx >= this.chapters.length) return
    const chapter = this.chapters[spreadIdx]
    const leaf = this.turnable[spreadIdx]
    if (!leaf || !leaf.textures.backCanvas || !leaf.textures.backTexture) return

    drawPageLeftOntoCanvas(leaf.textures.backCanvas, chapter, spreadIdx + 1, score)
    leaf.textures.backTexture.needsUpdate = true
  }

  /**
   * Настоящая страница не поворачивается как жёсткая дверь на одной оси —
   * у корешка она почти не двигается, а свободный край закручивается по
   * дуге большего радиуса и обгоняет общий угол поворота. Поэтому здесь
   * КАЖДАЯ вершина получает собственный угол поворота вокруг корешка
   * (в зависимости от того, как далеко она от него по x), а не общий
   * поворот pivot.rotation.z — тогда в поперечном сечении лист в момент
   * переворота выглядит как свиток/волна, а не как наклонённая плоская
   * карточка. Нормали пересчитываются на каждом кадре — без этого свет
   * не реагирует на изгиб, и даже правильно изогнутая геометрия всё равно
   * читается как плоский картон.
   */
  private applyPageCurl(mesh: THREE.Mesh, t: number) {
    const pos = mesh.geometry.attributes.position as THREE.BufferAttribute
    const base = mesh.userData.basePos as Float32Array
    const seed = (mesh.userData.rippleSeed as number) ?? 0
    const clampedT = THREE.MathUtils.clamp(t, 0, 1)
    // Изгиб живёт только в средней части поворота и полностью сходит на нет
    // ДО того, как лист долистает последние градусы. Если curl ещё не равен
    // нулю ровно в момент finishTurn() (который мгновенно ставит лист в
    // идеально плоское положение), получается видимый скачок-"доразгибание"
    // прямо в момент укладки листа на стопку. Поэтому окно [0.08, 0.88]
    // вместо полного [0, 1] — последние ~12% движения лист уже плоский и
    // просто докручивается по инерции, без разрыва.
    const curlLocalT = THREE.MathUtils.clamp((clampedT - 0.08) / (0.88 - 0.08), 0, 1)
    const bulge = Math.sin(Math.PI * curlLocalT) // 0 в начале/конце окна, 1 в середине

    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3 + 0]
      const bz = base[i * 3 + 2]
      const xFrac = THREE.MathUtils.clamp(bx / BOOK_W, 0, 1)
      const zFrac = THREE.MathUtils.clamp(bz / BOOK_D, -1, 1)

      // ближний к камере край листа сворачивается чуть охотнее дальнего —
      // отсюда лёгкая диагональная асимметрия волны, а не идеальная симметрия
      const diag = 1 + zFrac * DIAGONAL_SWEEP * 0.5
      const extra = CURL_EXTRA_ANGLE * bulge * xFrac * diag
      const angle = Math.PI * clampedT + extra

      const ripple = RIPPLE_AMPLITUDE * Math.sin(xFrac * Math.PI * 4 + seed) * bulge

      pos.setX(i, bx * Math.cos(angle))
      pos.setY(i, base[i * 3 + 1] + bx * Math.sin(angle) + ripple)
    }
    pos.needsUpdate = true
    mesh.geometry.computeVertexNormals()
  }

  private startTurn(direction: TurnDirection, onDone?: (ok: boolean) => void) {
    const idx = direction === 'next' ? this.turnsCount : this.turnsCount - 1
    if (this.anim || idx < 0 || idx >= this.turnable.length) {
      onDone?.(false)
      return
    }
    const leaf = this.turnable[idx]
    this.anim = { leaf, direction, start: performance.now(), onDone }
  }

  private finishTurn() {
    if (!this.anim) return
    const { leaf, direction, onDone } = this.anim
    if (direction === 'next') {
      leaf.pivot.rotation.z = Math.PI
      leaf.pivot.position.y = this.leftStackCounter * STACK_STEP
      this.leftStackCounter++
      this.turnsCount++

      // Если только что открыли книгу с обложки
      if (this.turnsCount === 1) {
        this.readingView = 'spread'
        this.setCamState('reading_spread')
        if (this.openTimer) window.clearTimeout(this.openTimer)
        // Через 1 секунду камера плавно едет на первую страницу для детального чтения
        this.openTimer = window.setTimeout(() => {
          if (this.turnsCount > 0 && !this.disposed) {
            this.readingView = 'left'
            this.setCamState('reading_left')
          }
        }, 1000)
      }
    } else {
      leaf.pivot.rotation.z = 0
      this.leftStackCounter--
      leaf.pivot.position.y = leaf.restY
      this.turnsCount--
      if (this.turnsCount === 0) {
        this.readingView = 'spread'
        this.setCamState('cover')
      }
    }
    this.updateBookBlocks()
    const b = leaf.mesh.geometry.attributes.position as THREE.BufferAttribute
    const base = leaf.mesh.userData.basePos as Float32Array
    // сбрасываем X и Y к исходной плоской форме — во время переворота
    // applyPageCurl двигает обе координаты, не только Y
    for (let i = 0; i < b.count; i++) {
      b.setX(i, base[i * 3 + 0])
      b.setY(i, base[i * 3 + 1])
    }
    b.needsUpdate = true
    leaf.mesh.geometry.computeVertexNormals()
    this.anim = null
    onDone?.(true)
  }

  turnNext(onDone?: (ok: boolean) => void) {
    this.startTurn('next', onDone)
  }

  turnPrev(onDone?: (ok: boolean) => void) {
    this.startTurn('prev', onDone)
  }

  get isAnimating() {
    return this.anim !== null
  }

  get turnCount() {
    return this.turnsCount
  }

  setCamState(state: CamState) {
    if (state !== 'reading_spread' && this.openTimer) {
      window.clearTimeout(this.openTimer)
      this.openTimer = null
    }
    this.camState = state
  }

  getReadingView(): ReadingView {
    return this.readingView
  }

  private animate = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.animate)

    const t = this.clock.getElapsedTime()

    // Книга устойчиво лежит на столе без покачивания
    this.bookRoot.position.set(0, 0, 0)
    const flicker = Math.sin(t * 3.1) * 0.045 + Math.sin(t * 7.7) * 0.028 + Math.sin(t * 19.3) * 0.015
    this.warmLight.intensity = 1.15 + flicker
    this.warmLight.position.x = 0.8 + Math.sin(t * 4.2) * 0.008
    this.warmLight.position.y = 2.4 + Math.cos(t * 5.7) * 0.006

    const dp = this.dust.geometry.attributes.position as THREE.BufferAttribute
    const arr = dp.array as Float32Array
    for (let i = 0; i < this.dustSpeed.length; i++) {
      let y = arr[i * 3 + 1] + this.dustSpeed[i] * 0.008
      if (y > 3.2) y = 0
      arr[i * 3 + 1] = y
    }
    dp.needsUpdate = true

    if (this.anim) {
      const raw = Math.min(1, (performance.now() - this.anim.start) / TURN_DURATION)
      const e = easeInOutCubic(raw)
      const turnProgress = this.anim.direction === 'next' ? e : 1 - e
      // весь поворот теперь считается по-вершинно в applyPageCurl — pivot
      // сам не крутится, иначе угол сложится с ним ещё раз
      this.anim.leaf.pivot.rotation.z = 0
      this.applyPageCurl(this.anim.leaf.mesh, turnProgress)
      if (raw >= 1) this.finishTurn()
    }

    const tgt = this.targets[this.camState]
    const wantPos = tgt.pos.clone()

    // 100% статичная камера: никакого плавания и смещения от движения курсора мыши
    this.camera.position.lerp(wantPos, 0.065)
    this.currentLook.lerp(tgt.look, 0.065)
    this.camera.lookAt(this.currentLook)

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    if (this.openTimer) {
      window.clearTimeout(this.openTimer)
      this.openTimer = null
    }
    this.stage.removeEventListener('pointermove', this.onPointerMove)
    this.stage.removeEventListener('pointerdown', this.onPointerDown)
    this.resizeObserver.disconnect()
    this.clearBook()

    // Очистка постоянных WebGL-буферов и материалов сцены
    this.staticDisposables.geometries.forEach((g) => g.dispose())
    this.staticDisposables.materials.forEach((m) => m.dispose())
    this.staticDisposables.textures.forEach((t) => t.dispose())
    this.staticDisposables.geometries = []
    this.staticDisposables.materials = []
    this.staticDisposables.textures = []

    this.renderer.dispose()
  }
}
