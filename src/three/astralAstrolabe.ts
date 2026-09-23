import * as THREE from 'three'

/**
 * Prototype 1: «Астральный Астролябий и Живой Гримуар»
 * (Astral Astrolabe & Living Grimoire)
 *
 * French Light Luxury Aesthetic:
 * - 22k Leaf Gold rings (#C6A76B / #DFBE7E)
 * - Central Faceted Crystal with true optical chromatic light dispersion (Cauchy prism splitting)
 * - Sacred armillary / astrolabe celestial calibrations & zodiac nodes
 * - Caustic ground dispersion projection on light limestone/travertine (#E8DFD0)
 * - Prismatic light dispersion particles and gold flakes
 */

export interface AstrolabeOptions {
  ringColor?: number
  crystalColor?: THREE.Color
  dispersionIntensity?: number
  enableCaustics?: boolean
}

// GLSL Shaders for the Central Crystal with Crystalline Light Dispersion
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

export class AstralAstrolabe {
  public group = new THREE.Group()

  // Rings
  private meridianRing: THREE.Mesh
  private zodiacRing: THREE.Group
  private colureRing: THREE.Mesh
  private alidadeRing: THREE.Group

  // Crystal
  private crystalMesh: THREE.Mesh
  private crystalMaterial: THREE.ShaderMaterial
  private crystalLight: THREE.PointLight

  // Caustics & Particles
  private causticPlane: THREE.Mesh | null = null
  private causticMaterial: THREE.ShaderMaterial | null = null
  private particles: THREE.Points
  private particleColors: Float32Array
  private particleSpeeds: Float32Array

  // Disposables
  private disposables: {
    geometries: THREE.BufferGeometry[]
    materials: THREE.Material[]
    textures: THREE.Texture[]
  } = {
    geometries: [],
    materials: [],
    textures: [],
  }

  // Animation & Transform state
  private targetPosition = new THREE.Vector3(1.1, 1.72, 0.25)
  private currentPosition = new THREE.Vector3(1.1, 1.72, 0.25)
  private targetScale = 1.0
  private currentScale = 1.0
  private pointerParallax = new THREE.Vector2(0, 0)
  private baseIntensity = 1.0

  constructor(options: AstrolabeOptions = {}) {
    const goldColor = options.ringColor ?? 0xc6a76b

    // 1. Shared 22k Gold Material for Armillary Astrolabe Rings
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: goldColor,
      emissive: 0x4a3614,
      emissiveIntensity: 0.12,
      roughness: 0.19,
      metalness: 0.91,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    })
    this.disposables.materials.push(goldMat)

    // 2. Meridian Ring (Outer cardinal ring, radius 1.38)
    const meridianGeo = new THREE.TorusGeometry(1.38, 0.024, 16, 96)
    this.meridianRing = new THREE.Mesh(meridianGeo, goldMat)
    this.group.add(this.meridianRing)
    this.disposables.geometries.push(meridianGeo)

    // Meridian degree tick marks (subtle astronomical graduations)
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

    // 12 Zodiac celestial nodes (golden spheres with wine/gold accents)
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

    // 5. Alidade / Sighting Ring (Inner sacred retractor with pointer arrows)
    this.alidadeRing = new THREE.Group()
    const alidadeTorusGeo = new THREE.TorusGeometry(0.72, 0.018, 16, 56)
    const alidadeTorus = new THREE.Mesh(alidadeTorusGeo, goldMat)
    this.alidadeRing.add(alidadeTorus)
    this.disposables.geometries.push(alidadeTorusGeo)

    // Twin pointer arrows / filigree needles
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

    // 6. Central Crystal with Custom Light Dispersion Shader
    const crystalGeo = new THREE.IcosahedronGeometry(0.32, 0) // Crisp faceted crystal
    this.disposables.geometries.push(crystalGeo)

    this.crystalMaterial = new THREE.ShaderMaterial({
      vertexShader: crystalVertexShader,
      fragmentShader: crystalFragmentShader,
      uniforms: {
        uColor: { value: options.crystalColor ?? new THREE.Color(0xf6edd9) },
        uLightPos: { value: new THREE.Vector3(2.4, 5.0, 2.6) },
        uCameraPos: { value: new THREE.Vector3(0, 4.4, 3.4) },
        uTime: { value: 0 },
        uDispersion: { value: options.dispersionIntensity ?? 1.25 },
        uRefractionRatio: { value: 1.0 / 1.52 }, // High-density optical flint crystal
      },
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    })
    this.disposables.materials.push(this.crystalMaterial)

    this.crystalMesh = new THREE.Mesh(crystalGeo, this.crystalMaterial)
    this.group.add(this.crystalMesh)

    // Crystal Core Point Light (radiates warm golden daylight)
    this.crystalLight = new THREE.PointLight(0xfff2d8, 0.9, 4.5, 2.0)
    this.crystalLight.position.set(0, 0, 0)
    this.group.add(this.crystalLight)

    // 7. Prismatic Light Dispersion Caustic Plane
    if (options.enableCaustics !== false) {
      const causticGeo = new THREE.PlaneGeometry(3.2, 3.2)
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
      // Caustic plane stays in scene ground level
    }

    // 8. Crystalline Light Dispersion & Gold Dust Particles
    const PARTICLE_COUNT = 70
    const partGeo = new THREE.BufferGeometry()
    const partPos = new Float32Array(PARTICLE_COUNT * 3)
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
      partPos[i * 3 + 0] = (Math.random() - 0.5) * 3.6
      partPos[i * 3 + 1] = Math.random() * 2.8
      partPos[i * 3 + 2] = (Math.random() - 0.5) * 3.0
      this.particleSpeeds[i] = 0.04 + Math.random() * 0.08

      const col = dispersionPalette[i % dispersionPalette.length]
      this.particleColors[i * 3 + 0] = col.r
      this.particleColors[i * 3 + 1] = col.g
      this.particleColors[i * 3 + 2] = col.b
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3))
    partGeo.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3))
    this.disposables.geometries.push(partGeo)

    const partMat = new THREE.PointsMaterial({
      size: 0.026,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
    })
    this.disposables.materials.push(partMat)

    this.particles = new THREE.Points(partGeo, partMat)
    this.group.add(this.particles)

    // Initial transform
    this.group.position.copy(this.currentPosition)
  }

  /**
   * Returns the caustic projection mesh for adding to the root scene
   */
  public getCausticPlane(): THREE.Mesh | null {
    return this.causticPlane
  }

  /**
   * Adapts the astrolabe position and scale based on book stage:
   * - cover: Aligns with the book cover's golden astrolabe emblem
   * - cover_input: Gently rises to give clear focus to date entry
   * - reading_spread: Ascends to upper-center celestial canopy above the open spread
   */
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

  /**
   * Updates pointer coordinates for gentle gyroscopic parallax
   */
  public setPointer(ndc: THREE.Vector2) {
    this.pointerParallax.x = ndc.x
    this.pointerParallax.y = ndc.y
  }

  /**
   * Frame animation update
   */
  public update(time: number, cameraPosition: THREE.Vector3, keyLightPos?: THREE.Vector3) {
    // 1. Smooth interpolation to target position and scale
    this.currentPosition.lerp(this.targetPosition, 0.055)
    this.currentScale += (this.targetScale - this.currentScale) * 0.055

    // 2. Gyroscopic Breathing & Floating
    const breathe = Math.sin(time * 0.9) * 0.015
    this.group.position.x = this.currentPosition.x + this.pointerParallax.x * 0.08
    this.group.position.y = this.currentPosition.y + breathe - this.pointerParallax.y * 0.05
    this.group.position.z = this.currentPosition.z

    this.group.scale.setScalar(this.currentScale)

    // 3. Harmonic Gyroscopic Ring Rotations (golden ratio harmonics)
    const baseSpeed = 0.32
    // Outer Meridian Ring: slow steady precession
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

    // 4. Faceted Crystal Tumbling & Shader Update
    this.crystalMesh.rotation.x = time * 0.45
    this.crystalMesh.rotation.y = time * 0.65
    this.crystalMesh.rotation.z = time * 0.25

    // Update Crystal Dispersion Shader Uniforms
    this.crystalMaterial.uniforms.uTime.value = time
    this.crystalMaterial.uniforms.uCameraPos.value.copy(cameraPosition)
    if (keyLightPos) {
      this.crystalMaterial.uniforms.uLightPos.value.copy(keyLightPos)
    }

    // Gentle pulse of the crystal point light
    const pulse = Math.sin(time * 2.2) * 0.08 + Math.cos(time * 4.1) * 0.04
    this.crystalLight.intensity = this.baseIntensity + pulse

    // 5. Caustic Projection Update
    if (this.causticMaterial && this.causticPlane) {
      this.causticMaterial.uniforms.uTime.value = time
      // Caustic follows astrolabe X/Z coordinates softly
      this.causticPlane.position.x = this.group.position.x * 0.7
      this.causticPlane.position.z = this.group.position.z * 0.7
    }

    // 6. Crystalline Dispersion Particles Circulation
    const posAttr = this.particles.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    const count = this.particleSpeeds.length

    for (let i = 0; i < count; i++) {
      let y = arr[i * 3 + 1] + this.particleSpeeds[i] * 0.007
      if (y > 2.8) {
        y = 0.05
        arr[i * 3 + 0] = (Math.random() - 0.5) * 3.4
        arr[i * 3 + 2] = (Math.random() - 0.5) * 2.8
      }
      arr[i * 3 + 1] = y

      // Subtle orbital swirl around the astrolabe
      const px = arr[i * 3 + 0]
      const pz = arr[i * 3 + 2]
      const angle = 0.003
      arr[i * 3 + 0] = px * Math.cos(angle) - pz * Math.sin(angle)
      arr[i * 3 + 2] = px * Math.sin(angle) + pz * Math.cos(angle)
    }
    posAttr.needsUpdate = true
  }

  /**
   * Sets dispersion intensity multiplier (default 1.25)
   */
  public setDispersionIntensity(val: number) {
    this.crystalMaterial.uniforms.uDispersion.value = val
    if (this.causticMaterial) {
      this.causticMaterial.uniforms.uIntensity.value = Math.min(1.5, val * 0.8)
    }
  }

  /**
   * Clean WebGL memory disposal
   */
  public dispose() {
    this.disposables.geometries.forEach((g) => g.dispose())
    this.disposables.materials.forEach((m) => m.dispose())
    this.disposables.textures.forEach((t) => t.dispose())
    this.disposables.geometries = []
    this.disposables.materials = []
    this.disposables.textures = []

    this.group.clear()
    if (this.causticPlane) {
      this.causticPlane.removeFromParent()
    }
  }
}
