import * as THREE from 'three'
import {
  cloudParticles,
  figureLines,
  figureParticles,
  figureRotation,
  getFigure,
  type FigureId,
  type FigureKind,
} from './sacredGeometry'

/**
 * «Поле» священной геометрии — сердце лендинга.
 *
 * Всё состояние поля — чистая функция от прокрутки: фигура «откуда», фигура
 * «куда», прогресс перетекания T ∈ [0, 1] и фаза вращения. Экран стоит —
 * стоит и поле; листаете назад — метаморфоза отматывается назад.
 *
 * Два слоя одной хореографии:
 *   1. Световое перо — линии. Уходящая фигура выгорает волной от центра
 *      (кромка горит), новая прорисовывается пером, кончик пера сияет.
 *   2. Пыль — десятки тысяч частиц. Пылинка срывается с линии ровно тогда,
 *      когда её касается кромка выгорания, течёт вихрем как плазма и
 *      прилетает туда и тогда, где проходит кончик пера новой фигуры.
 *
 * Тема: в тёмной свет складывается (additive), в светлой — ложится чернилами
 * старого золота (обычное смешивание).
 */

// Расписание (одинаковое для линий и пыли)
const RELEASE0 = 0.02
const RELEASE_SPAN = 0.46
const ARRIVE0 = 0.44
const ARRIVE_SPAN = 0.54

const CHOREO = /* glsl */ `
  const float RELEASE0 = ${RELEASE0.toFixed(3)};
  const float RELEASE_SPAN = ${RELEASE_SPAN.toFixed(3)};
  const float ARRIVE0 = ${ARRIVE0.toFixed(3)};
  const float ARRIVE_SPAN = ${ARRIVE_SPAN.toFixed(3)};
`

const NOISE = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  vec3 snoise3(vec3 x) {
    return vec3(snoise(x), snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)), snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4)));
  }
`

const PARTICLE_VERT = /* glsl */ `
  attribute vec2 aRef;
  attribute vec2 aSeed;
  uniform sampler2D tFrom;
  uniform sampler2D tTo;
  uniform mat3 uRotF0;
  uniform mat3 uRotF1;
  uniform mat3 uRotT0;
  uniform mat3 uRotT1;
  uniform float uT;
  uniform float uPhase;
  uniform float uSwirl;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform float uGain;
  uniform vec3 uGold;
  uniform vec3 uRose;
  uniform vec3 uIris;
  uniform vec3 uHot;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSoft;
  ${CHOREO}
  ${NOISE}

  mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  vec3 placeOf(vec4 d, mat3 r0, mat3 r1) { return (d.w > 1.5 ? r1 : r0) * d.xyz; }
  float dpOf(vec4 d) { return d.w > 1.5 ? d.w - 2.0 : d.w; }

  void main() {
    vec4 f = texture2D(tFrom, aRef);
    vec4 t = texture2D(tTo, aRef);
    float s = aSeed.x;
    float release = RELEASE0 + dpOf(f) * RELEASE_SPAN + s * 0.02;
    float arrive = min(ARRIVE0 + dpOf(t) * ARRIVE_SPAN + s * 0.02, 0.995);
    vec3 A = placeOf(f, uRotF0, uRotF1);
    vec3 B = placeOf(t, uRotT0, uRotT1);

    // полёт — детерминированная функция прогресса: вихрь, дыхание, плазменная турбулентность
    float k = clamp((uT - release) / max(arrive - release, 0.02), 0.0, 1.0);
    float e = k * k * (3.0 - 2.0 * k);
    float env = sin(3.14159265 * k);
    vec3 p = mix(A, B, e);
    p.xy = rot2(env * uSwirl * (0.45 + s)) * p.xy;
    p.xy *= 1.0 + env * (0.1 + 0.28 * aSeed.y);
    p += env * 0.26 * snoise3(p * 1.25 + vec3(s * 17.0, aSeed.y * 9.0, uT * 1.6));
    p.z += env * (s - 0.5) * 1.1;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float spark = step(0.985, s);
    float bloom = env * (1.0 - spark);
    vSoft = bloom;
    // мерцание зависит от прокрутки, а не от времени: экран стоит — стоит и пыль
    float tw = 0.55 + 0.45 * sin(uPhase * (2.0 + s * 5.0) + s * 71.0);
    gl_PointSize = uSize * uPixelRatio * (0.6 + s * 0.7 + spark * 1.6) * (1.0 + bloom * 4.0) * (10.0 / max(1.0, -mv.z));

    float hue = fract(s * 7.13);
    vec3 plasma = hue < 0.62 ? uGold : (hue < 0.84 ? uRose : uIris);
    vColor = mix(mix(uGold, plasma, bloom), uHot, spark * (0.4 + env * 0.6));
    vAlpha = (0.5 + 0.5 * tw) * mix(1.0, 0.14, bloom) * (1.0 + spark * env * 1.5) * uOpacity * uGain;
  }
`

const PARTICLE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSoft;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float a = exp(-dot(d, d) * mix(26.0, 11.0, vSoft)) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor, clamp(a, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`

const LINE_VERT = /* glsl */ `
  attribute vec3 aP0;
  attribute vec3 aP1;
  attribute vec2 aDp;
  attribute float aPart;
  uniform mat3 uRot0;
  uniform mat3 uRot1;
  uniform float uScale;
  uniform float uDraw;
  uniform float uErase;
  uniform vec2 uResolution;
  uniform float uWidth;
  varying float vAcross;
  varying float vDp;
  varying float vTip;
  varying float vBurn;
  varying vec3 vLocal;

  void main() {
    // видимая часть отрезка: от кромки выгорания до кончика пера
    float span = max(aDp.y - aDp.x, 1e-5);
    float a = clamp((uErase - aDp.x) / span, 0.0, 1.0);
    float b = clamp((uDraw - aDp.x) / span, 0.0, 1.0);
    if (b <= a + 1e-4) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    mat3 R = aPart > 0.5 ? uRot1 : uRot0;
    vec3 p0 = R * mix(aP0, aP1, a) * uScale;
    vec3 p1 = R * mix(aP0, aP1, b) * uScale;
    vec4 c0 = projectionMatrix * modelViewMatrix * vec4(p0, 1.0);
    vec4 c1 = projectionMatrix * modelViewMatrix * vec4(p1, 1.0);
    vec2 s0 = c0.xy / c0.w * uResolution;
    vec2 s1 = c1.xy / c1.w * uResolution;
    vec2 d = s1 - s0;
    float len = length(d);
    vec2 dir = len > 1e-4 ? d / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float isEnd = position.y;
    vec4 c = isEnd > 0.5 ? c1 : c0;
    float dpHere = mix(aDp.x, aDp.y, isEnd > 0.5 ? b : a);
    vTip = exp(-max(0.0, uDraw - dpHere) * 38.0) * step(uDraw, 1.0);
    vBurn = exp(-max(0.0, dpHere - uErase) * 30.0) * step(0.0, uErase);
    float w = uWidth * (1.0 + vTip * 0.7 + vBurn * 0.5);
    c.xy += nrm * position.x * w / uResolution * c.w;
    gl_Position = c;
    vAcross = position.x;
    vDp = dpHere;
    vLocal = (isEnd > 0.5 ? p1 : p0) / uScale;
  }
`

const LINE_FRAG = /* glsl */ `
  uniform float uPhase;
  uniform float uOpacity;
  uniform float uCoreFrac;
  uniform float uHalo;
  uniform vec3 uGold;
  uniform vec3 uCore;
  uniform vec3 uRose;
  uniform vec3 uIris;
  uniform vec3 uHot;
  varying float vAcross;
  varying float vDp;
  varying float vTip;
  varying float vBurn;
  varying vec3 vLocal;

  void main() {
    float x = abs(vAcross);
    float cf = uCoreFrac / (1.0 + vTip * 0.7 + vBurn * 0.5);
    float core = 1.0 - smoothstep(cf * 0.6, cf * 1.6, x);
    float halo = exp(-x * x * 6.0) * (1.0 - x) * uHalo;
    float ang = atan(vLocal.y, vLocal.x);
    float r = length(vLocal.xy);
    // перелив по линиям — его «двигает» прокрутка
    float iri = pow(0.5 + 0.5 * sin(ang * 2.0 - uPhase * 1.3 + r * 4.0), 6.0);
    float iri2 = pow(0.5 + 0.5 * sin(-ang * 3.0 - uPhase * 0.9 + r * 2.5 + 1.7), 8.0);
    vec3 glow = mix(uGold, uRose, iri * 0.5);
    glow = mix(glow, uIris, iri2 * 0.45);
    float pulse = smoothstep(0.93, 1.0, fract(vDp * 3.0 - uPhase * 0.6));
    float heat = max(vTip, vBurn * 0.8);
    vec3 coreCol = mix(mix(uCore, glow, 0.25), uHot, heat);
    float ca = core * (0.8 + pulse * 0.2 + heat * 0.4);
    float ha = halo * (0.9 + pulse + heat * 2.0);
    float a = clamp(ca + ha, 0.0, 1.0);
    vec3 col = (coreCol * ca + mix(glow, uHot, heat) * ha) / max(ca + ha, 1e-4);
    gl_FragColor = vec4(col, a * uOpacity);
    #include <colorspace_fragment>
  }
`

/** Неподвижная фигура из светящихся линий: врата, мандала, ореол, древо */
export class LineFigure {
  readonly mesh: THREE.Mesh
  readonly material: THREE.ShaderMaterial
  private geo: THREE.InstancedBufferGeometry

  constructor(id: FigureId, segments: number, shared: Record<string, THREE.IUniform>) {
    const L = figureLines(id, segments)
    const geo = new THREE.InstancedBufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, -1, 1, 0, 1, 1, 0], 3))
    geo.setIndex([0, 1, 2, 2, 1, 3])
    const p0 = new Float32Array(L.count * 3)
    const p1 = new Float32Array(L.count * 3)
    for (let i = 0; i < L.count; i++) {
      p0.set(L.seg.subarray(i * 6, i * 6 + 3), i * 3)
      p1.set(L.seg.subarray(i * 6 + 3, i * 6 + 6), i * 3)
    }
    geo.setAttribute('aP0', new THREE.InstancedBufferAttribute(p0, 3))
    geo.setAttribute('aP1', new THREE.InstancedBufferAttribute(p1, 3))
    geo.setAttribute('aDp', new THREE.InstancedBufferAttribute(L.dp, 2))
    geo.setAttribute('aPart', new THREE.InstancedBufferAttribute(L.part, 1))
    geo.instanceCount = L.count
    this.geo = geo
    this.material = new THREE.ShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        ...shared,
        uRot0: { value: new THREE.Matrix3() },
        uRot1: { value: new THREE.Matrix3() },
        uDraw: { value: 2 },
        uErase: { value: -1 },
        uOpacity: { value: 1 },
      },
    })
    this.mesh = new THREE.Mesh(geo, this.material)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 3
    this.mesh.visible = false
  }

  dispose() {
    this.geo.dispose()
    this.material.dispose()
  }
}

export type FieldTheme = 'light' | 'dark'

const PALETTES: Record<FieldTheme, Record<'gold' | 'core' | 'rose' | 'iris' | 'hot', THREE.Color>> = {
  dark: {
    gold: new THREE.Color('#e0a94f'),
    core: new THREE.Color('#ffe2a6'),
    rose: new THREE.Color('#ff8fb0'),
    iris: new THREE.Color('#a996ff'),
    hot: new THREE.Color('#fff6e4'),
  },
  // на слоновой кости — чернила старого золота, винные и лиловые прожилки
  light: {
    gold: new THREE.Color('#a37a3c'),
    core: new THREE.Color('#6b4b1f'),
    rose: new THREE.Color('#9c3558'),
    iris: new THREE.Color('#5d4b93'),
    hot: new THREE.Color('#c77f16'),
  },
}

export interface SacredFieldOptions {
  /** Сторона «текстуры» частиц: частиц = size² */
  texSize: number
  /** Отрезков в линиях одной фигуры */
  lineSegments: number
  lineWidth: number
  pointSize: number
}

export interface FieldState {
  from: FigureId | 'cloud'
  to: FigureId
  /** Прогресс перетекания 0…1 */
  t: number
  /** Фаза вращения и перелива (от прокрутки) */
  phase: number
  opacity: number
}

export class SacredField {
  readonly group = new THREE.Group()

  private points: THREE.Points
  private pointMat: THREE.ShaderMaterial
  private targets = new Map<FigureId | 'cloud', THREE.DataTexture>()
  private lines = new Map<FigureId, LineFigure>()
  private lineShared: Record<string, THREE.IUniform>
  private opts: SacredFieldOptions
  private count: number
  private theme: FieldTheme = 'light'
  private rF0 = new THREE.Matrix3()
  private rF1 = new THREE.Matrix3()
  private rT0 = new THREE.Matrix3()
  private rT1 = new THREE.Matrix3()
  private energyValue = 0
  private extras: LineFigure[] = []

  constructor(opts: SacredFieldOptions) {
    this.opts = opts
    const size = opts.texSize
    this.count = size * size

    const ref = new Float32Array(this.count * 2)
    const seed = new Float32Array(this.count * 2)
    for (let i = 0; i < this.count; i++) {
      ref[i * 2] = ((i % size) + 0.5) / size
      ref[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size
      seed[i * 2] = Math.random()
      seed[i * 2 + 1] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.count * 3), 3))
    geo.setAttribute('aRef', new THREE.BufferAttribute(ref, 2))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 2))
    const pal = PALETTES.light
    this.pointMat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        tFrom: { value: this.targetTexture('cloud') },
        tTo: { value: this.targetTexture('cloud') },
        uRotF0: { value: this.rF0 },
        uRotF1: { value: this.rF1 },
        uRotT0: { value: this.rT0 },
        uRotT1: { value: this.rT1 },
        uT: { value: 0 },
        uPhase: { value: 0 },
        uSwirl: { value: 1.6 },
        uSize: { value: opts.pointSize },
        uPixelRatio: { value: 1 },
        uOpacity: { value: 0 },
        uGain: { value: 1 },
        uGold: { value: pal.gold.clone() },
        uRose: { value: pal.rose.clone() },
        uIris: { value: pal.iris.clone() },
        uHot: { value: pal.hot.clone() },
      },
    })
    this.points = new THREE.Points(geo, this.pointMat)
    this.points.frustumCulled = false
    this.points.renderOrder = 4
    this.group.add(this.points)

    this.lineShared = {
      uScale: { value: 1 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uWidth: { value: opts.lineWidth },
      uCoreFrac: { value: 0.22 },
      uHalo: { value: 0.5 },
      uPhase: { value: 0 },
      uGold: { value: pal.gold.clone() },
      uCore: { value: pal.core.clone() },
      uRose: { value: pal.rose.clone() },
      uIris: { value: pal.iris.clone() },
      uHot: { value: pal.hot.clone() },
    }
    this.setTheme('light')
  }

  private night = 0
  private mixed = {
    gold: new THREE.Color(),
    core: new THREE.Color(),
    rose: new THREE.Color(),
    iris: new THREE.Color(),
    hot: new THREE.Color(),
  }

  /** Ночь 0…1: в светлой теме сцена уходит в ночную палитру (глава «Книга») */
  setNight(n: number) {
    if (Math.abs(n - this.night) < 1e-4) return
    this.night = n
    this.setTheme(this.theme)
  }

  setTheme(theme: FieldTheme) {
    this.theme = theme
    const n = theme === 'dark' ? 0 : this.night
    const base = PALETTES[theme]
    const pal = this.mixed
    ;(['gold', 'core', 'rose', 'iris', 'hot'] as const).forEach((k) => pal[k].copy(base[k]).lerp(PALETTES.dark[k], n))
    const pu = this.pointMat.uniforms
    pu.uGold.value.copy(pal.gold)
    pu.uRose.value.copy(pal.rose)
    pu.uIris.value.copy(pal.iris)
    pu.uHot.value.copy(pal.hot)
    const lu = this.lineShared
    lu.uGold.value.copy(pal.gold)
    lu.uCore.value.copy(pal.core)
    lu.uRose.value.copy(pal.rose)
    lu.uIris.value.copy(pal.iris)
    lu.uHot.value.copy(pal.hot)
    const dk = theme === 'dark' ? 1 : n
    lu.uHalo.value = 0.34 + 0.21 * dk
    lu.uCoreFrac.value = 0.3 - 0.08 * dk
    pu.uGain.value = 1.9 - 0.9 * dk
    const blending = theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending
    ;[this.pointMat, ...[...this.lines.values(), ...this.extras].map((l) => l.material)].forEach((m) => {
      if (m.blending === blending) return
      m.blending = blending
      m.needsUpdate = true
    })
  }

  /**
   * Отдельная фигура из линий с общей темой и толщиной — для декораций сцены.
   * Прорисовка: material.uniforms.uDraw (−0.05 → 1.05), яркость — uOpacity.
   */
  createLines(id: FigureId, segments = this.opts.lineSegments) {
    const l = new LineFigure(id, segments, this.lineShared)
    l.material.blending = this.theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending
    l.mesh.visible = true
    this.extras.push(l)
    return l
  }

  setResolution(w: number, h: number, pixelRatio: number) {
    this.lineShared.uResolution.value.set(w / 2, h / 2)
    this.lineShared.uWidth.value = this.opts.lineWidth * pixelRatio
    this.pointMat.uniforms.uPixelRatio.value = pixelRatio
  }

  /** Энергия перетекания 0…1 — для света туманности */
  get energy() {
    return this.energyValue
  }

  /** Поставить поле в состояние, вычисленное из прокрутки */
  apply(state: FieldState, spinFrom = 1, spinTo = -1) {
    const T = Math.min(1, Math.max(0, state.t))
    const fromKind = this.kindOf(state.from)
    const toKind = this.kindOf(state.to)
    // вращение фигур — тоже функция прокрутки
    figureRotation(fromKind, state.phase, spinFrom, this.rF0, this.rF1)
    figureRotation(toKind, state.phase, spinTo, this.rT0, this.rT1)
    const pu = this.pointMat.uniforms
    pu.tFrom.value = this.targetTexture(state.from)
    pu.tTo.value = this.targetTexture(state.to)
    pu.uT.value = T
    pu.uPhase.value = state.phase
    pu.uOpacity.value = state.opacity
    pu.uSwirl.value = spinTo * 1.6
    this.lineShared.uPhase.value = state.phase
    this.energyValue = state.from === state.to ? 0 : Math.sin(Math.PI * T)

    this.lines.forEach((l) => (l.mesh.visible = false))
    const moving = state.from !== state.to && T > 0
    if (state.from !== 'cloud' && (T < 1 || state.from === state.to)) {
      const from = this.line(state.from)
      from.mesh.visible = true
      from.material.uniforms.uRot0.value.copy(this.rF0)
      from.material.uniforms.uRot1.value.copy(this.rF1)
      from.material.uniforms.uDraw.value = 2
      from.material.uniforms.uErase.value = moving ? (T - RELEASE0) / RELEASE_SPAN : -1
      from.material.uniforms.uOpacity.value = state.opacity
    }
    if (state.from !== state.to) {
      const to = this.line(state.to)
      to.mesh.visible = true
      to.material.uniforms.uRot0.value.copy(this.rT0)
      to.material.uniforms.uRot1.value.copy(this.rT1)
      to.material.uniforms.uDraw.value = T >= 1 ? 2 : (T - ARRIVE0) / ARRIVE_SPAN
      to.material.uniforms.uErase.value = -1
      to.material.uniforms.uOpacity.value = state.opacity
    }
  }

  /** Подготовить данные и шейдеры фигур заранее */
  prewarm(ids: FigureId[]) {
    ids.forEach((id) => {
      this.targetTexture(id)
      this.line(id)
    })
  }

  dispose() {
    this.points.geometry.dispose()
    this.pointMat.dispose()
    this.targets.forEach((t) => t.dispose())
    this.lines.forEach((l) => l.dispose())
    this.extras.forEach((l) => l.dispose())
  }

  private kindOf(id: FigureId | 'cloud'): FigureKind {
    return id === 'cloud' ? 'flat' : getFigure(id).kind
  }

  private targetTexture(id: FigureId | 'cloud') {
    let tex = this.targets.get(id)
    if (!tex) {
      const data = id === 'cloud' ? cloudParticles(this.count) : figureParticles(id, this.count)
      tex = new THREE.DataTexture(data, this.opts.texSize, this.opts.texSize, THREE.RGBAFormat, THREE.FloatType)
      tex.needsUpdate = true
      this.targets.set(id, tex)
    }
    return tex
  }

  private line(id: FigureId) {
    let l = this.lines.get(id)
    if (!l) {
      l = new LineFigure(id, this.opts.lineSegments, this.lineShared)
      l.material.blending = this.theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending
      this.lines.set(id, l)
      this.group.add(l.mesh)
    }
    return l
  }
}
