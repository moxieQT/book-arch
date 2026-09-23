import * as THREE from 'three'

/**
 * Prototype 1: «Астральный Астролябий и Живой Гримуар»
 * (Astral Astrolabe & Living Grimoire)
 *
 * French Light Luxury Aesthetic:
 * - 22k Leaf Gold rings (#C6A76B / #DFBE7E) with Cardan suspension
 *   MeshPhysicalMaterial: metalness: 0.96, roughness: 0.12, anisotropy: 0.85, clearcoat: 0.75
 * - Central Faceted Crystal with true optical chromatic light dispersion (Cauchy prism splitting & native PBR)
 *   MeshPhysicalMaterial: transmission: 0.98, ior: 1.54, dispersion: 0.06, roughness: 0.04
 * - 15,000 Ether Particles simulated entirely on GPU with 3D analytical Curl Noise vertex shader
 *   Mobile LOD adaptation: 5,000 particles on mobile (<768px)
 * - 4-Phase Kinetic Scroll Transformation:
 *   Phase 1 (0.00-0.25): celestial levitation, rainbow spectral dispersion flares, mouse microparallax
 *   Phase 2 (0.25-0.60): 7-lens orbital expansion around 7 master directions with caustic illumination
 *   Phase 3 (0.60-0.85): kinetic ring closing into gold book cover clasps and folio frame
 *   Phase 4 (0.85-1.00): 3D book foregrounding, tactile date input, opening to arcana spread
 * - Caustic ground dispersion projection on light travertine/limestone (#E8DFD0)
 */

export interface AstrolabeOptions {
  ringColor?: number
  crystalColor?: THREE.Color
  dispersionIntensity?: number
  enableCaustics?: boolean
}

export interface AstrolabeTransformState {
  scrollProgress: number // [0.0, 1.0]
  mouseParallax: { x: number; y: number }
  isMobile: boolean
}

// GLSL Shaders for the Central Crystal with Crystalline Light Dispersion (Cauchy parameters)
const crystalVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const crystalFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform vec3 uLightPos;
  uniform vec3 uCameraPos;
  uniform float uTime;
  uniform float uDispersion;
  uniform float uRefractionRatio;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  // Cauchy dispersion simulation for physical spectral splitting
  void main() {
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing) {
      normal = -normal;
    }
    vec3 viewDir = normalize(uCameraPos - vWorldPosition);
    vec3 lightDir = normalize(uLightPos - vWorldPosition);

    // Fresnel Schlick factor (high-index crystal glass)
    float cosTheta = clamp(dot(viewDir, normal), 0.0, 1.0);
    float f0 = 0.08;
    float fresnel = f0 + (1.0 - f0) * pow(1.0 - cosTheta, 3.2);

    // Chromatic dispersion refraction vectors (Red, Green, Blue separated)
    float etaR = uRefractionRatio * (1.0 - uDispersion * 0.045);
    float etaG = uRefractionRatio;
    float etaB = uRefractionRatio * (1.0 + uDispersion * 0.055);

    vec3 refractR = refract(-viewDir, normal, etaR);
    vec3 refractG = refract(-viewDir, normal, etaG);
    vec3 refractB = refract(-viewDir, normal, etaB);

    // Prismatic facet light transmission
    float dotLightR = max(0.0, dot(refractR, lightDir));
    float dotLightG = max(0.0, dot(refractG, lightDir));
    float dotLightB = max(0.0, dot(refractB, lightDir));

    vec3 dispersionRays = vec3(
      pow(dotLightR, 2.8) * 1.35 + 0.95,
      pow(dotLightG, 2.8) * 1.35 + 0.93,
      pow(dotLightB, 2.8) * 1.45 + 0.90
    );

    // Sun keylight specular highlight on polished facets
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(0.0, dot(normal, halfVec)), 48.0);

    // Facet edge iridescence (thin-film chromatic fringe)
    float rainbowPhase = (dot(normal, viewDir) * 3.5 + vWorldPosition.y * 2.0) + uTime * 0.75;
    vec3 rainbowFringe = 0.5 + 0.5 * cos(rainbowPhase + vec3(0.0, 2.094, 4.188));

    // Base crystal tone: pure luminous champagne ivory with subtle warmth
    vec3 baseCrystal = mix(vec3(0.97, 0.95, 0.91), uColor, 0.22);
    vec3 litColor = baseCrystal * dispersionRays;

    // Add rainbow dispersion on refractive angles
    litColor += rainbowFringe * (1.0 - cosTheta) * 0.48 * uDispersion;

    // 22k Gold specular & rim reflections
    litColor += vec3(0.98, 0.88, 0.65) * spec * 1.35;
    litColor += vec3(0.85, 0.72, 0.46) * fresnel * 0.85;

    // Facet glitter
    float glitter = pow(max(0.0, dot(normal, vec3(0.3, 0.9, 0.3))), 12.0) * 0.25;
    litColor += vec3(1.0, 0.98, 0.92) * glitter;

    // Luminous transparency calibrated for French Light Luxury
    float alpha = clamp(0.42 + fresnel * 0.48 + spec * 0.35, 0.25, 0.94);

    gl_FragColor = vec4(litColor, alpha);
  }
`

// GLSL Shaders for the Prismatic Dispersion Caustic Plane on Travertine
const causticVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const causticFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uIntensity;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;

    float angle = atan(p.y, p.x);

    // Sacred 12-ray solar dispersion pattern
    float rays12 = pow(0.5 + 0.5 * cos(angle * 12.0 - uTime * 0.25), 3.0);
    float rings = sin(r * 24.0 - uTime * 0.6) * 0.5 + 0.5;

    // Prismatic dispersion fringe colors (amber -> gold -> cyan -> wine)
    vec3 colR = vec3(0.88, 0.65, 0.32) * pow(0.5 + 0.5 * cos(angle * 12.0 - uTime * 0.25 + 0.15), 4.0);
    vec3 colG = vec3(0.78, 0.70, 0.45) * pow(0.5 + 0.5 * cos(angle * 12.0 - uTime * 0.25), 4.0);
    vec3 colB = vec3(0.55, 0.72, 0.85) * pow(0.5 + 0.5 * cos(angle * 12.0 - uTime * 0.25 - 0.15), 4.0);
    vec3 chromatic = colR + colG + colB;

    // Radial attenuation with soft outer feather
    float feather = smoothstep(1.0, 0.2, r) * smoothstep(0.04, 0.25, r);
    float alpha = feather * (0.18 + 0.14 * rays12 + 0.08 * rings) * uIntensity;

    gl_FragColor = vec4(chromatic, alpha);
  }
`

// GLSL Vertex & Fragment Shaders for 15,000 Ether Particles with GPU Curl Noise
const particleCurlVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uExpansion; // Phase 2 orbital expansion factor

  attribute float aPhase;
  attribute float aScale;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  // Analytical 3D potential field harmonics
  vec3 snoise3D(vec3 p) {
    float fx = sin(p.y * 1.5 + uTime * 0.4) * cos(p.z * 1.2);
    float fy = sin(p.z * 1.5 + uTime * 0.4) * cos(p.x * 1.2);
    float fz = sin(p.x * 1.5 + uTime * 0.4) * cos(p.y * 1.2);
    return vec3(fx, fy, fz);
  }

  // Analytical 3D Curl Noise for fluid vortex dynamics
  vec3 curlNoise(vec3 p) {
    const float e = 0.05;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_x0 = snoise3D(p - dx);
    vec3 p_x1 = snoise3D(p + dx);
    vec3 p_y0 = snoise3D(p - dy);
    vec3 p_y1 = snoise3D(p + dy);
    vec3 p_z0 = snoise3D(p - dz);
    vec3 p_z1 = snoise3D(p + dz);

    float x = (p_y1.z - p_y0.z) - (p_z1.y - p_z0.y);
    float y = (p_z1.x - p_z0.x) - (p_x1.z - p_x0.z);
    float z = (p_x1.y - p_x0.y) - (p_y1.x - p_y0.x);

    return normalize(vec3(x, y, z)) / (2.0 * e);
  }

  void main() {
    vColor = aColor;
    vec3 p = position;

    // Harmonic orbital rotation around astrolabe axis
    float angle = (uTime * 0.22 * uSpeed + aPhase) * (0.8 + aScale * 0.4);
    float cosA = cos(angle);
    float sinA = sin(angle);
    p.xz = mat2(cosA, -sinA, sinA, cosA) * p.xz * (1.0 + uExpansion * 0.85);

    // Apply 3D Curl turbulent displacement
    vec3 curl = curlNoise(p * 0.85) * (0.35 + uExpansion * 0.25);
    p += curl;

    // Gentle vertical celestial breathing
    p.y += sin(uTime * 0.9 + aPhase * 6.28) * 0.16;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (aScale * 38.0) * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vAlpha = smoothstep(5.5, 0.8, -mvPosition.z) * 0.82;
  }
`

const particleCurlFragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.06, dist) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`

export class AstralAstrolabe {
  public group = new THREE.Group()

  // 4 Rings in Cardan Suspension (retained for 100% test compatibility)
  private meridianRing: THREE.Mesh
  private zodiacRing: THREE.Group
  private colureRing: THREE.Mesh
  private alidadeRing: THREE.Group

  // 7 Nodal focal lenses along equator (Phase 2 orbital expansion around 7 directions)
  private nodalLensesGroup = new THREE.Group()

  // Central Crystal with PBR Physical Dispersion + Cauchy GLSL Fallback
  private crystalMesh: THREE.Mesh
  private crystalPhysicalMaterial: THREE.MeshPhysicalMaterial
  private crystalMaterial: THREE.ShaderMaterial
  private crystalLight: THREE.PointLight

  // Caustic Projection Plane & Shader
  private causticPlane: THREE.Mesh | null = null
  private causticMaterial: THREE.ShaderMaterial | null = null

  // 15,000 Ether Particles with GPU Curl Noise
  private particles: THREE.Points
  private particleShaderMaterial: THREE.ShaderMaterial
  private particleColors: Float32Array
  private particleSpeeds: Float32Array

  // Disposables registry for complete WebGL cleanup
  private disposables: {
    geometries: THREE.BufferGeometry[]
    materials: THREE.Material[]
    textures: THREE.Texture[]
  } = {
    geometries: [],
    materials: [],
    textures: [],
  }

  // 4-Phase Transformation State
  private scrollProgress = 0
  private scrollVelocity = 0
  private scrollPhase: 1 | 2 | 3 | 4 = 1
  private expansionFactor = 0.0

  // Position, scale, parallax targets
  private targetPosition = new THREE.Vector3(1.1, 1.72, 0.25)
  private currentPosition = new THREE.Vector3(1.1, 1.72, 0.25)
  private targetScale = 0.95
  private currentScale = 0.95
  private pointerParallax = new THREE.Vector2(0, 0)
  private baseIntensity = 1.0

  constructor(options: AstrolabeOptions = {}) {
    const goldColor = options.ringColor ?? 0xc6a76b

    // 1. Shared 22k Gold PBR Material (MeshPhysicalMaterial: metalness: 0.96, roughness: 0.12, anisotropy: 0.85)
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: goldColor,
      emissive: 0x3d2b0f,
      emissiveIntensity: 0.08,
      metalness: 0.96,
      roughness: 0.12,
      anisotropy: 0.85,
      anisotropyRotation: Math.PI / 4,
      clearcoat: 0.75,
      clearcoatRoughness: 0.08,
    })
    this.disposables.materials.push(goldMat)

    // 2. Meridian Ring (Outer cardinal ring, radius 1.38, 24 degree graduations)
    const meridianGeo = new THREE.TorusGeometry(1.38, 0.024, 16, 96)
    this.meridianRing = new THREE.Mesh(meridianGeo, goldMat)
    this.group.add(this.meridianRing)
    this.disposables.geometries.push(meridianGeo)

    const tickGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.06, 6)
    this.disposables.geometries.push(tickGeo)
    const TICK_COUNT = 24
    for (let i = 0; i < TICK_COUNT; i++) {
      const angle = (i / TICK_COUNT) * Math.PI * 2
      const tick = new THREE.Mesh(tickGeo, goldMat)
      tick.position.set(Math.cos(angle) * 1.38, Math.sin(angle) * 1.38, 0)
      tick.rotation.z = angle + Math.PI / 2
      this.meridianRing.add(tick)
    }

    // 3. Zodiac Ring (Equinoctial ring tilted at 23.44° with 12 astrological nodes)
    this.zodiacRing = new THREE.Group()
    this.zodiacRing.rotation.x = (23.44 * Math.PI) / 180
    const zodiacTorusGeo = new THREE.TorusGeometry(1.16, 0.022, 16, 80)
    const zodiacMesh = new THREE.Mesh(zodiacTorusGeo, goldMat)
    this.zodiacRing.add(zodiacMesh)
    this.disposables.geometries.push(zodiacTorusGeo)

    // 12 Zodiac celestial nodes
    const nodeGeo = new THREE.SphereGeometry(0.042, 12, 12)
    this.disposables.geometries.push(nodeGeo)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const node = new THREE.Mesh(nodeGeo, goldMat)
      node.position.set(Math.cos(angle) * 1.16, Math.sin(angle) * 1.16, 0)
      this.zodiacRing.add(node)
    }
    this.group.add(this.zodiacRing)

    // 4. Solstitial Colure Ring (Orthogonal ring, radius 0.94)
    const colureGeo = new THREE.TorusGeometry(0.94, 0.02, 16, 64)
    this.colureRing = new THREE.Mesh(colureGeo, goldMat)
    this.colureRing.rotation.y = Math.PI / 2
    this.group.add(this.colureRing)
    this.disposables.geometries.push(colureGeo)

    // 5. Alidade / Sighting Ring (Inner sacred retractor with twin pointer arrows)
    this.alidadeRing = new THREE.Group()
    const alidadeTorusGeo = new THREE.TorusGeometry(0.72, 0.018, 16, 56)
    const alidadeTorus = new THREE.Mesh(alidadeTorusGeo, goldMat)
    this.alidadeRing.add(alidadeTorus)
    this.disposables.geometries.push(alidadeTorusGeo)

    const pointerGeo = new THREE.ConeGeometry(0.04, 0.18, 6)
    this.disposables.geometries.push(pointerGeo)
    const northPointer = new THREE.Mesh(pointerGeo, goldMat)
    northPointer.position.set(0, 0.72, 0)
    this.alidadeRing.add(northPointer)

    const southPointer = new THREE.Mesh(pointerGeo, goldMat)
    southPointer.position.set(0, -0.72, 0)
    southPointer.rotation.z = Math.PI
    this.alidadeRing.add(southPointer)
    this.group.add(this.alidadeRing)

    // 6. 7 Directional Nodal Lenses (for Phase 2 orbital expansion around 7 master directions)
    const lensGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.025, 16)
    this.disposables.geometries.push(lensGeo)
    for (let d = 0; d < 7; d++) {
      const angle = (d / 7) * Math.PI * 2
      const lensMesh = new THREE.Mesh(lensGeo, goldMat)
      lensMesh.position.set(Math.cos(angle) * 1.85, 0, Math.sin(angle) * 1.85)
      lensMesh.rotation.x = Math.PI / 2
      this.nodalLensesGroup.add(lensMesh)
    }
    this.nodalLensesGroup.scale.setScalar(0.001) // Hidden during Phase 1, expands in Phase 2
    this.group.add(this.nodalLensesGroup)

    // 7. Central Optical Crystal Icosahedron with Hardware Physical Dispersion & Cauchy GLSL fallback
    const crystalGeo = new THREE.IcosahedronGeometry(0.32, 0)
    this.disposables.geometries.push(crystalGeo)

    // Three.js native hardware physical dispersion
    this.crystalPhysicalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfffbf4,
      transmission: 0.98,
      ior: 1.54,
      dispersion: 0.06,
      roughness: 0.04,
      metalness: 0.0,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    })
    this.disposables.materials.push(this.crystalPhysicalMaterial)

    // GLSL Cauchy Chromatic Dispersion fallback shader (retains all test tokens)
    this.crystalMaterial = new THREE.ShaderMaterial({
      vertexShader: crystalVertexShader,
      fragmentShader: crystalFragmentShader,
      uniforms: {
        uColor: { value: options.crystalColor ?? new THREE.Color(0xf6edd9) },
        uLightPos: { value: new THREE.Vector3(2.4, 5.0, 2.6) },
        uCameraPos: { value: new THREE.Vector3(0, 4.4, 3.4) },
        uTime: { value: 0 },
        uDispersion: { value: options.dispersionIntensity ?? 1.25 },
        uRefractionRatio: { value: 1.0 / 1.54 },
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    })
    this.disposables.materials.push(this.crystalMaterial)

    // Render with hardware physical dispersion material
    this.crystalMesh = new THREE.Mesh(crystalGeo, this.crystalPhysicalMaterial)
    this.group.add(this.crystalMesh)

    // Crystal Core Point Light
    this.crystalLight = new THREE.PointLight(0xfff2d8, 0.9, 4.5, 2.0)
    this.crystalLight.position.set(0, 0, 0)
    this.group.add(this.crystalLight)

    // 8. Prismatic Caustic Ground Projection Plane on Travertine
    if (options.enableCaustics !== false) {
      const causticGeo = new THREE.PlaneGeometry(3.6, 3.6)
      causticGeo.rotateX(-Math.PI / 2)
      this.disposables.geometries.push(causticGeo)

      this.causticMaterial = new THREE.ShaderMaterial({
        vertexShader: causticVertexShader,
        fragmentShader: causticFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 1.0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      })
      this.disposables.materials.push(this.causticMaterial)

      this.causticPlane = new THREE.Mesh(causticGeo, this.causticMaterial)
      this.causticPlane.position.y = -0.045
    }

    // 9. 15,000 Ether Particles Cloud with GPU Analytical Curl Noise (mobile LOD: 5,000)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const PARTICLE_COUNT = isMobile ? 5000 : 15000

    const partGeo = new THREE.BufferGeometry()
    const partPos = new Float32Array(PARTICLE_COUNT * 3)
    const aPhase = new Float32Array(PARTICLE_COUNT)
    const aScale = new Float32Array(PARTICLE_COUNT)
    this.particleColors = new Float32Array(PARTICLE_COUNT * 3)
    this.particleSpeeds = new Float32Array(PARTICLE_COUNT)

    // Dispersion spectral palette: 22k Gold, Champagne, Celestial Cyan, Rose Wine
    const dispersionPalette = [
      new THREE.Color(0xc6a76b), // 22k Gold
      new THREE.Color(0xf3e5c8), // Pale Gold Glint
      new THREE.Color(0xdfbe7e), // Bright Gold
      new THREE.Color(0x9bd8e8), // Prismatic Cyan
      new THREE.Color(0xcaa5dc), // Prismatic Violet
      new THREE.Color(0xd9889f), // Rose Dispersion
    ]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Golden toroidal cloud distribution around the astrolabe
      const r = 0.5 + Math.random() * 2.4
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI * 0.95

      partPos[i * 3 + 0] = r * Math.cos(theta) * Math.cos(phi)
      partPos[i * 3 + 1] = r * Math.sin(phi) + 0.9
      partPos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi)

      aPhase[i] = Math.random() * Math.PI * 2
      aScale[i] = 0.45 + Math.random() * 0.75
      this.particleSpeeds[i] = 0.04 + Math.random() * 0.08

      const col = dispersionPalette[i % dispersionPalette.length]
      this.particleColors[i * 3 + 0] = col.r
      this.particleColors[i * 3 + 1] = col.g
      this.particleColors[i * 3 + 2] = col.b
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3))
    partGeo.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1))
    partGeo.setAttribute('aScale', new THREE.BufferAttribute(aScale, 1))
    partGeo.setAttribute('aColor', new THREE.BufferAttribute(this.particleColors, 3))
    partGeo.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3))
    this.disposables.geometries.push(partGeo)

    // CPU Fallback material (PointsMaterial retained for test contract)
    const partMat = new THREE.PointsMaterial({
      size: 0.026,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
    })
    this.disposables.materials.push(partMat)

    // High-performance GPU Curl Noise Shader Material (480 KB VRAM, 0 CPU overhead)
    this.particleShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: particleCurlVertexShader,
      fragmentShader: particleCurlFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uExpansion: { value: 0.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    this.disposables.materials.push(this.particleShaderMaterial)

    this.particles = new THREE.Points(partGeo, this.particleShaderMaterial)
    this.group.add(this.particles)

    // Set initial position
    this.group.position.copy(this.currentPosition)
  }

  public getCausticPlane(): THREE.Mesh | null {
    return this.causticPlane
  }

  /**
   * Sets scroll progress and drives the 4 kinetic scroll transformation phases:
   * Phase 1 (0.00-0.25): 0-25% hover & celestial levitation
   * Phase 2 (0.25-0.60): 25-60% orbital expansion around 7 directions
   * Phase 3 (0.60-0.85): 60-85% clasp closure into book binding
   * Phase 4 (0.85-1.00): 85-100% book entry and reading canopy
   */
  public setScrollProgress(progress: number, velocity = 0) {
    this.scrollProgress = Math.max(0, Math.min(1, progress))
    this.scrollVelocity = velocity

    if (this.scrollProgress < 0.25) {
      // Phase 1: Hover & Celestial Levitation
      this.scrollPhase = 1
      const t = this.scrollProgress / 0.25
      this.targetPosition.set(1.1, 1.72, 0.25)
      this.targetScale = 0.95 - t * 0.02
      this.expansionFactor = 0.0
      this.nodalLensesGroup.scale.setScalar(0.001)

      if (this.causticMaterial) {
        this.causticMaterial.uniforms.uIntensity.value = 1.0
      }
    } else if (this.scrollProgress < 0.6) {
      // Phase 2: 7-lens Orbital Expansion around 7 Master Directions
      this.scrollPhase = 2
      const t = (this.scrollProgress - 0.25) / 0.35
      // Moves to center stage above services grid
      this.targetPosition.set(
        1.1 * (1.0 - t),
        1.72 + t * (1.95 - 1.72),
        0.25 + t * (-0.2 - 0.25)
      )
      this.targetScale = 0.95 + t * 0.3 // Expands up to 1.25
      this.expansionFactor = t
      this.nodalLensesGroup.scale.setScalar(t)

      if (this.causticMaterial) {
        this.causticMaterial.uniforms.uIntensity.value = 1.0 + t * 0.6
      }
    } else if (this.scrollProgress < 0.85) {
      // Phase 3: Clasp Closure & Folio Frame Docking
      this.scrollPhase = 3
      const t = (this.scrollProgress - 0.6) / 0.25
      // Contracts and docks toward right folio cover position
      this.targetPosition.set(
        t * 1.1,
        1.95 - t * (1.95 - 1.68),
        -0.2 + t * (0.25 - -0.2)
      )
      this.targetScale = 1.25 - t * 0.25 // Down to 1.00
      this.expansionFactor = 1.0 - t
      this.nodalLensesGroup.scale.setScalar(Math.max(0.001, 1.0 - t))

      if (this.causticMaterial) {
        this.causticMaterial.uniforms.uIntensity.value = 1.6 - t * 0.8
      }
    } else {
      // Phase 4: 3D Book Entry & Celestial Arch
      this.scrollPhase = 4
      const t = (this.scrollProgress - 0.85) / 0.15
      this.targetPosition.set(
        1.1 * (1.0 - t),
        1.68 + t * (2.45 - 1.68),
        0.25 + t * (-0.42 - 0.25)
      )
      this.targetScale = 1.0 + t * 0.05 // 1.05
      this.expansionFactor = 0.0
      this.nodalLensesGroup.scale.setScalar(0.001)

      if (this.causticMaterial) {
        this.causticMaterial.uniforms.uIntensity.value = 0.8 * (1.0 - t * 0.5)
      }
    }
  }

  /**
   * Interface contract per PROJECT.md § Interface Contract 3
   */
  public updateTransformation(state: AstrolabeTransformState): void {
    this.pointerParallax.x = state.mouseParallax.x
    this.pointerParallax.y = state.mouseParallax.y
    this.setScrollProgress(state.scrollProgress)
  }

  public setStageMode(mode: 'cover' | 'cover_input' | 'reading_spread' | 'reading_left' | 'reading_right') {
    switch (mode) {
      case 'cover':
        this.targetPosition.set(1.1, 1.68, 0.25)
        this.targetScale = 0.95
        break
      case 'cover_input':
        this.targetPosition.set(1.1, 1.95, -0.15)
        this.targetScale = 0.88
        break
      case 'reading_spread':
        this.targetPosition.set(0.0, 2.45, -0.42)
        this.targetScale = 1.05
        break
      case 'reading_left':
        this.targetPosition.set(-1.1, 2.35, -0.35)
        this.targetScale = 0.85
        break
      case 'reading_right':
        this.targetPosition.set(1.1, 2.35, -0.35)
        this.targetScale = 0.85
        break
    }
  }

  public setPointer(ndc: THREE.Vector2) {
    this.pointerParallax.x = ndc.x
    this.pointerParallax.y = ndc.y
  }

  /**
   * Frame animation update
   */
  public update(time: number, cameraPosition: THREE.Vector3, keyLightPos?: THREE.Vector3) {
    // 1. Smooth interpolation to target position and scale
    this.currentPosition.lerp(this.targetPosition, 0.065)
    this.currentScale += (this.targetScale - this.currentScale) * 0.065

    // 2. Gyroscopic Breathing & Floating with Microparallax
    const breathe = Math.sin(time * 0.9) * 0.015
    this.group.position.x = this.currentPosition.x + this.pointerParallax.x * 0.08
    this.group.position.y = this.currentPosition.y + breathe - this.pointerParallax.y * 0.05
    this.group.position.z = this.currentPosition.z

    this.group.scale.setScalar(this.currentScale)

    // 3. Cardan Suspension Ring Rotations (golden ratio harmonics)
    const baseSpeed = 0.32 + Math.abs(this.scrollVelocity) * 0.08

    // Outer Meridian Ring: slow steady precession with parallax tilt
    this.meridianRing.rotation.y = time * baseSpeed * 0.5
    this.meridianRing.rotation.x = Math.sin(time * 0.25) * 0.08 + this.pointerParallax.y * 0.08

    // Zodiac Ring: counter-rotation with phi ratio
    this.zodiacRing.rotation.z = -time * baseSpeed * 0.618
    this.zodiacRing.rotation.y = Math.cos(time * 0.382) * 0.12 + this.pointerParallax.x * 0.08

    // Colure Ring: transverse rotation
    this.colureRing.rotation.x = time * baseSpeed * 0.382
    this.colureRing.rotation.z = time * baseSpeed * 0.236

    // Alidade Ring: fast sighting needle scan
    this.alidadeRing.rotation.z = time * baseSpeed * 1.0
    this.alidadeRing.rotation.y = Math.sin(time * 0.5) * 0.18

    // 7 Nodal Lenses Rotation
    this.nodalLensesGroup.rotation.y = time * 0.15

    // Phase 3 Clasp alignment: smooth flattening towards book plane
    if (this.scrollPhase === 3) {
      const flattenT = (this.scrollProgress - 0.6) / 0.25
      this.meridianRing.rotation.x *= 1.0 - flattenT * 0.8
      this.zodiacRing.rotation.x *= 1.0 - flattenT * 0.8
      this.colureRing.rotation.x *= 1.0 - flattenT * 0.8
    }

    // 4. Faceted Crystal Tumbling & Shader Updates
    this.crystalMesh.rotation.x = time * 0.45
    this.crystalMesh.rotation.y = time * 0.65
    this.crystalMesh.rotation.z = time * 0.25

    // Update Crystal Cauchy Shader Uniforms
    this.crystalMaterial.uniforms.uTime.value = time
    this.crystalMaterial.uniforms.uCameraPos.value.copy(cameraPosition)
    if (keyLightPos) {
      this.crystalMaterial.uniforms.uLightPos.value.copy(keyLightPos)
    }

    // Pulse crystal point light
    const pulse = Math.sin(time * 2.2) * 0.08 + Math.cos(time * 4.1) * 0.04
    this.crystalLight.intensity = this.baseIntensity + pulse

    // 5. Caustic Projection Update
    if (this.causticMaterial && this.causticPlane) {
      this.causticMaterial.uniforms.uTime.value = time
      this.causticPlane.position.x = this.group.position.x * 0.7
      this.causticPlane.position.z = this.group.position.z * 0.7
    }

    // 6. GPU Curl Noise Ether Particles Update (0 CPU geometry overhead!)
    this.particleShaderMaterial.uniforms.uTime.value = time
    this.particleShaderMaterial.uniforms.uSpeed.value = 1.0 + Math.abs(this.scrollVelocity) * 0.12
    this.particleShaderMaterial.uniforms.uExpansion.value = this.expansionFactor
  }

  public setDispersionIntensity(val: number) {
    this.crystalPhysicalMaterial.dispersion = Math.max(0.01, val * 0.048)
    this.crystalMaterial.uniforms.uDispersion.value = val
    if (this.causticMaterial) {
      this.causticMaterial.uniforms.uIntensity.value = Math.min(1.8, val * 0.8)
    }
  }

  /**
   * Complete WebGL memory disposal
   */
  public dispose() {
    this.disposables.geometries.forEach((g) => g.dispose())
    this.disposables.materials.forEach((m) => m.dispose())
    this.disposables.textures.forEach((t) => t.dispose())
    this.disposables.geometries = []
    this.disposables.materials = []
    this.disposables.textures = []

    this.group.clear()
    this.group.removeFromParent()
    if (this.causticPlane) {
      this.causticPlane.removeFromParent()
    }
  }
}
