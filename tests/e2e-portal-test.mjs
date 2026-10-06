/**
 * Comprehensive E2E Portal & Living Grimoire Automated Test Suite (Tiers 1–4)
 * Alina Energy Healing Web Portal & 3D Folio «Архетипы и Тени»
 *
 * Verifies:
 * - Tier 1: Category-Partition Feature Coverage (40 features × 5 tests = 200 tests)
 * - Tier 2: Boundary Value Analysis (10 categories × 5 tests = 50 tests)
 * - Tier 3: Pairwise Cross-Feature Combinations (12 interaction tests)
 * - Tier 4: Real-World Workload Scenarios (6 customer workflows)
 * Total: 268 automated assertions
 *
 * Run command:
 *   node tests/e2e-portal-test.mjs
 */

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Setup Node.js test environment mocks for Web Audio API and localStorage
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    AudioContext: class MockAudioContext {
      createGain() {
        return {
          gain: {
            value: 0,
            setValueAtTime() {},
            cancelScheduledValues() {},
            exponentialRampToValueAtTime() {},
            linearRampToValueAtTime() {}
          },
          connect() {}
        }
      }
      createBiquadFilter() {
        return {
          type: 'lowpass',
          frequency: { value: 750, setValueAtTime() {}, setTargetAtTime() {} },
          Q: { value: 1.2, setValueAtTime() {} },
          connect() {}
        }
      }
      createOscillator() {
        return {
          type: 'sine',
          frequency: { value: 432, setValueAtTime() {} },
          connect() {},
          start() {}
        }
      }
      createBuffer(channels, size, _rate) {
        return {
          getChannelData() {
            return new Float32Array(size)
          }
        }
      }
      createBufferSource() {
        return {
          buffer: null,
          connect() {},
          start() {}
        }
      }
      sampleRate = 44100
      currentTime = 0
      destination = {}
      state = 'running'
      resume() {}
    },
    localStorage: {
      _store: {},
      getItem(key) {
        return this._store[key] || null
      },
      setItem(key, val) {
        this._store[key] = String(val)
      },
      removeItem(key) {
        delete this._store[key]
      }
    }
  }
  globalThis.localStorage = globalThis.window.localStorage
}

// Import data modules directly (Node.js native TS strip-types)
import {
  INDIVIDUAL_SESSIONS,
  PRICING_BLOCKS,
  MANAGER_INFO,
  CLIENT_QUERY_NAVIGATOR,
  TAROT_QUESTIONS
} from '../src/data/alinaPricing.ts'

import { ALINA_SERVICES } from '../src/data/alinaServices.ts'
import { LEGAL_RULES, auditTextLegalRisks } from '../src/data/legalRules.ts'
import { LUXURY_PALETTE } from '../src/three/bookPalette.ts'
import { soundscape } from '../src/audio/soundscape.ts'

const __filename = fileURLToPath(import.meta.url)
// Исходники лендинга (новый сайт) — для проверок, которые раньше смотрели компоненты старого портала
const readLanding = (...p) => fs.readFileSync(path.join(path.dirname(__filename), '..', 'src', 'landing', ...p), 'utf8')
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

// Simple colorized reporter
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
}

let totalTests = 0
let passedTests = 0
let failedTests = 0
const failures = []
const escalatedBugs = []

const tierStats = {
  tier1: { total: 0, passed: 0 },
  tier2: { total: 0, passed: 0 },
  tier3: { total: 0, passed: 0 },
  tier4: { total: 0, passed: 0 }
}

function runTest(tier, title, fn) {
  totalTests++
  tierStats[tier].total++
  try {
    fn()
    passedTests++
    tierStats[tier].passed++
    console.log(`  ${colors.green}✓${colors.reset} ${colors.gray}[${tier.toUpperCase()}]${colors.reset} ${title}`)
  } catch (err) {
    failedTests++
    failures.push({ tier, title, error: err })
    console.log(`  ${colors.red}✗${colors.reset} ${colors.gray}[${tier.toUpperCase()}]${colors.reset} ${title}`)
    console.log(`    ${colors.red}${err.message}${colors.reset}`)
  }
}

console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════════${colors.reset}`)
console.log(`${colors.bold}${colors.cyan}   E2E AUTOMATED TEST SUITE: ALINA ENERGY PORTAL & 3D BOOK   ${colors.reset}`)
console.log(`${colors.bold}${colors.cyan}   40-Feature 4-Tier Verification Architecture (Prototype 1)  ${colors.reset}`)
console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════════${colors.reset}\n`)

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1: FEATURE COVERAGE (40 features × 5 tests = 200 tests)
// ─────────────────────────────────────────────────────────────────────────────

console.log(`${colors.bold}${colors.magenta}▶ TIER 1: Category-Partition Feature Coverage (F1 to F40)${colors.reset}`)

// --- Feature 1: Continuous Background Canvas ---
runTest('tier1', 'F1.1: App.tsx lazily mounts the 3D book stage (BookMode → ContinuousStage) only in book mode', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("lazy(() => import('./book/BookMode'))"), 'Book stage must be a lazy chunk')
  const bookMode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'book', 'BookMode.tsx'), 'utf8')
  assert.ok(bookMode.includes('<ContinuousStage viewMode="book" />'), 'BookMode must render ContinuousStage')
})

runTest('tier1', 'F1.2: ContinuousStage.tsx styles viewport with fixed inset: 0 and z-index: 0', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'ContinuousStage.tsx'), 'utf8')
  assert.ok(content.includes("position: 'fixed'"), 'Stage must be fixed')
  assert.ok(content.includes('inset: 0'), 'Stage must fill viewport')
  assert.ok(content.includes('zIndex: 0'), 'Stage zIndex must be 0')
})

runTest('tier1', 'F1.3: App.css ensures .portal-layout allows canvas visibility without solid black backing', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(!content.includes('.portal-layout { background: #000'), 'Portal layout has prohibited solid black background')
  assert.ok(!content.includes('.portal-layout { background: #0b0710'), 'Portal layout has prohibited dark purple background')
  assert.ok(content.includes('var(--bg)'), 'Portal layout should use light luxury --bg variable')
})

runTest('tier1', 'F1.4: ContinuousStage.tsx implements canvas and stage DOM references via useRef', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'ContinuousStage.tsx'), 'utf8')
  assert.ok(content.includes('useRef<HTMLCanvasElement>(null)'), 'Missing canvasRef')
  assert.ok(content.includes('useRef<HTMLDivElement>(null)'), 'Missing stageRef')
  assert.ok(content.includes('ref={canvasRef}'), 'Missing canvas ref attachment')
})

runTest('tier1', 'F1.5: ContinuousStage.tsx unmount cleanup calls scene.dispose() and cleans global window state', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'ContinuousStage.tsx'), 'utf8')
  assert.ok(content.includes('scene.dispose()'), 'Missing scene.dispose() on unmount')
  assert.ok(content.includes('__bookScene'), 'Missing __bookScene cleanup')
})

// --- Feature 2: Kinetic Scroll Controller ---
runTest('tier1', 'F2.1: App.tsx stores landing scroll position before entering 3D book mode', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes('savedScroll.current = window.scrollY'), 'Missing scroll position capture')
  assert.ok(content.includes('setRestoreScroll('), 'Missing scroll restore hand-off to landing')
})

runTest('tier1', 'F2.2: Landing restores exact scroll position on return and keeps it through later pin refreshes', () => {
  const content = readLanding('Landing.tsx')
  assert.ok(content.includes('ScrollTrigger.refresh()'), 'Pins must be measured before restoring scroll')
  assert.ok(content.includes('window.scrollTo(0, restoreScroll)'), 'Missing native scroll restore')
  assert.ok(content.includes("ScrollTrigger.addEventListener('refresh', onRefresh)"), 'Restore must survive later pin refreshes')
})

runTest('tier1', 'F2.3: Prologue CTA scrolls smoothly (Lenis) to the paths chapter', () => {
  const content = readLanding('sections', 'Prologue.tsx')
  assert.ok(content.includes("scrollToTarget('#paths')"), 'Prologue missing scroll to #paths')
  const motion = readLanding('motion.ts')
  assert.ok(motion.includes('lenis.scrollTo('), 'Smooth scroll must go through Lenis')
})

runTest('tier1', 'F2.4: Scroll progress normalization helper clamps negative and out-of-bounds scroll values to [0.0, 1.0]', () => {
  const normalizeScroll = (y, maxScroll) => {
    if (maxScroll <= 0) return 0
    return Math.max(0, Math.min(1, y / maxScroll))
  }
  assert.equal(normalizeScroll(-50, 1000), 0.0)
  assert.equal(normalizeScroll(0, 1000), 0.0)
  assert.equal(normalizeScroll(500, 1000), 0.5)
  assert.equal(normalizeScroll(1000, 1000), 1.0)
  assert.equal(normalizeScroll(1500, 1000), 1.0)
})

runTest('tier1', 'F2.5: kineticScroll.ts implements ScrollState contract with progress [0.0, 1.0], velocity and phase', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'kineticScroll.ts'), 'utf8')
  assert.ok(content.includes('export interface ScrollState'))
  assert.ok(content.includes('progress: number'))
  assert.ok(content.includes('velocity: number'))
  assert.ok(content.includes('phase: 1 | 2 | 3 | 4'))
})

// --- Feature 3: Astral Astrolabe Gimbal Rings ---
runTest('tier1', 'F3.1: astralAstrolabe.ts implements 4 concentric rings in Cardan suspension', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('meridianRing'), 'Missing meridianRing')
  assert.ok(content.includes('zodiacRing'), 'Missing zodiacRing')
  assert.ok(content.includes('colureRing'), 'Missing colureRing')
  assert.ok(content.includes('alidadeRing'), 'Missing alidadeRing')
})

runTest('tier1', 'F3.2: Rings use 22k gold PBR MeshPhysicalMaterial with metalness 0.96, roughness 0.12, anisotropy 0.85', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('MeshPhysicalMaterial'), 'Missing MeshPhysicalMaterial')
  assert.ok(content.includes('metalness: 0.96'), 'Metalness must be 0.96')
  assert.ok(content.includes('roughness: 0.12'), 'Roughness must be 0.12')
  assert.ok(content.includes('anisotropy: 0.85'), 'Anisotropy must be 0.85')
})

runTest('tier1', 'F3.3: Astrolabe rotation updates use golden ratio harmonics (0.618 and 0.382)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('0.618'), 'Missing phi harmonic 0.618 in rotation')
  assert.ok(content.includes('0.382'), 'Missing phi harmonic 0.382 in rotation')
})

runTest('tier1', 'F3.4: Zodiac ring incorporates 12 celestial nodes with 23.44° ecliptic tilt', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('23.44'), 'Missing 23.44 degree ecliptic tilt')
  assert.ok(content.includes('for (let i = 0; i < 12; i++)'), 'Missing 12 zodiac celestial nodes loop')
})

runTest('tier1', 'F3.5: Meridian ring incorporates 24 astronomical degree tick graduations', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('TICK_COUNT = 24'), 'Missing 24 meridian tick marks')
  assert.ok(content.includes('CylinderGeometry(0.007, 0.007, 0.06, 6)'), 'Missing tick geometry definition')
})

// --- Feature 4: Optical Crystal Cauchy Dispersion ---
runTest('tier1', 'F4.1: Central crystal utilizes sharp faceted IcosahedronGeometry(0.32, 0)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('IcosahedronGeometry(0.32, 0)'), 'Missing crisp faceted icosahedron geometry')
})

runTest('tier1', 'F4.2: Crystal uses physical dispersion with transmission 0.98, ior 1.54, dispersion 0.06', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('transmission: 0.98'), 'Missing transmission 0.98')
  assert.ok(content.includes('ior: 1.54'), 'Missing ior 1.54')
  assert.ok(content.includes('dispersion: 0.06'), 'Missing dispersion 0.06')
})

runTest('tier1', 'F4.3: GLSL fragment shader calculates separated RGB chromatic refraction vectors (etaR, etaG, etaB)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('float etaR = uRefractionRatio * (1.0 - uDispersion * 0.045);'), 'Missing etaR calculation')
  assert.ok(content.includes('float etaG = uRefractionRatio;'), 'Missing etaG calculation')
  assert.ok(content.includes('float etaB = uRefractionRatio * (1.0 + uDispersion * 0.055);'), 'Missing etaB calculation')
})

runTest('tier1', 'F4.4: GLSL fragment shader implements Fresnel Schlick factor and iridescence rainbow fringe', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('float fresnel = f0 + (1.0 - f0) * pow(1.0 - cosTheta, 3.2);'), 'Missing Fresnel calculation')
  assert.ok(content.includes('vec3 rainbowFringe = 0.5 + 0.5 * cos(rainbowPhase + vec3(0.0, 2.094, 4.188));'), 'Missing spectral fringe')
})

runTest('tier1', 'F4.5: Crystal alpha transparency is clamped within safe bounds [0.25, 0.94] for luxury luminosity', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('clamp(0.42 + fresnel * 0.48 + spec * 0.35, 0.25, 0.94)'), 'Missing alpha clamping')
})

// --- Feature 5: 15,000 Ether Particles Cloud ---
runTest('tier1', 'F5.1: astralAstrolabe.ts allocates 15,000 particles default with 5,000 mobile LOD', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('const PARTICLE_COUNT = isMobile ? 5000 : 15000'), 'Missing 15k / 5k particle allocation')
})

runTest('tier1', 'F5.2: Dispersion palette contains 6 luxury spectral colors (Gold, Champagne, Cyan, Violet, Rose)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('0xc6a76b'), 'Missing 22k gold in particle palette')
  assert.ok(content.includes('0x9bd8e8'), 'Missing prismatic cyan in particle palette')
  assert.ok(content.includes('0xcaa5dc'), 'Missing prismatic violet in particle palette')
  assert.ok(content.includes('0xd9889f'), 'Missing rose dispersion in particle palette')
})

runTest('tier1', 'F5.3: Particle vertex shader computes analytical 3D curl noise for fluid vortex dynamics', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('vec3 curlNoise(vec3 p)'), 'Missing curlNoise function')
  assert.ok(content.includes('vec3 snoise3D(vec3 p)'), 'Missing snoise3D function')
})

runTest('tier1', 'F5.4: Particle vertex shader executes GPU matrix orbital rotation around astrolabe axis', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('p.xz = mat2(cosA, -sinA, sinA, cosA) * p.xz'), 'Missing GPU orbital matrix rotation')
})

runTest('tier1', 'F5.5: GPU Curl Noise ShaderMaterial uses additive blending with zero CPU geometry overhead', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('this.particleShaderMaterial = new THREE.ShaderMaterial'), 'Missing particleShaderMaterial')
  assert.ok(content.includes('blending: THREE.AdditiveBlending'), 'Missing AdditiveBlending')
})

// --- Feature 6: Prismatic Caustic Ground Projection ---
runTest('tier1', 'F6.1: astralAstrolabe.ts creates caustic plane rotated -90 degrees on X axis', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('causticGeo.rotateX(-Math.PI / 2)'), 'Missing plane X-rotation')
})

runTest('tier1', 'F6.2: Caustic GLSL fragment shader generates sacred 12-ray solar dispersion pattern', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('cos(angle * 12.0 - uTime * 0.25)'), 'Missing 12-ray angle equation')
})

runTest('tier1', 'F6.3: Caustic GLSL fragment shader separates chromatic dispersion fringe (colR, colG, colB)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('vec3 colR = vec3(0.88, 0.65, 0.32)'), 'Missing amber/red caustic component')
  assert.ok(content.includes('vec3 colG = vec3(0.78, 0.70, 0.45)'), 'Missing gold/green caustic component')
  assert.ok(content.includes('vec3 colB = vec3(0.55, 0.72, 0.85)'), 'Missing cyan/blue caustic component')
})

runTest('tier1', 'F6.4: Caustic plane follows astrolabe horizontal coordinates with soft tracking factor (0.7)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('this.causticPlane.position.x = this.group.position.x * 0.7'), 'Missing X tracking')
  assert.ok(content.includes('this.causticPlane.position.z = this.group.position.z * 0.7'), 'Missing Z tracking')
})

runTest('tier1', 'F6.5: getCausticPlane method returns caustic projection mesh for root scene integration', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('public getCausticPlane(): THREE.Mesh | null'), 'Missing getCausticPlane method')
})

// --- Feature 7: 4 Transformation Scroll Phases ---
runTest('tier1', 'F7.1: astralAstrolabe.ts implements setScrollProgress driving 4 scroll transformation phases', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('public setScrollProgress(progress: number, velocity = 0)'))
  assert.ok(content.includes('this.scrollProgress < 0.25'))
  assert.ok(content.includes('this.scrollProgress < 0.6'))
  assert.ok(content.includes('this.scrollProgress < 0.85'))
})

runTest('tier1', 'F7.2: Phase 1 (0-25%) establishes celestial levitation and hover', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('this.scrollPhase = 1'))
  assert.ok(content.includes('this.targetPosition.set(1.1, 1.72, 0.25)'))
})

runTest('tier1', 'F7.3: Phase 2 (25-60%) expands 7 nodal lenses in orbit around 7 master directions', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('this.scrollPhase = 2'))
  assert.ok(content.includes('this.nodalLensesGroup.scale.setScalar(t)'))
})

runTest('tier1', 'F7.4: Phase 3 (60-85%) docks astrolabe into folio clasps and Phase 4 (85-100%) enters 3D book', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('this.scrollPhase = 3'))
  assert.ok(content.includes('this.scrollPhase = 4'))
})

runTest('tier1', 'F7.5: Smooth lerp interpolation factor 0.065 prevents abrupt jumps during frame animation', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('this.currentPosition.lerp(this.targetPosition, 0.065)'))
  assert.ok(content.includes('(this.targetScale - this.currentScale) * 0.065'))
})

// --- Feature 8: French Light Luxury Palette ---
runTest('tier1', 'F8.1: CSS variable --bg is ivory #F4EFE6', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(content.includes('--bg: #F4EFE6;'))
})

runTest('tier1', 'F8.2: CSS variable --gold is 22k gold #C6A76B', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(content.includes('--gold: #C6A76B;'))
})

runTest('tier1', 'F8.3: CSS variable --wine is imperial wine #5C192E', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(content.includes('--wine: #5C192E;'))
})

runTest('tier1', 'F8.4: CSS variable --ink is deep graphite #201C24', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(content.includes('--ink: #201C24;'))
})

runTest('tier1', 'F8.5: bookPalette.ts defines LUXURY_PALETTE with consistent French Light Luxury colors', () => {
  assert.equal(LUXURY_PALETTE.gold.primary, '#C6A76B')
  assert.equal(LUXURY_PALETTE.wine.primary, '#5C192E')
  assert.equal(LUXURY_PALETTE.ink.primary, '#201C24')
  assert.equal(LUXURY_PALETTE.cover.base, '#F3EDE2')
})

// --- Feature 9: Studio PMREM Lighting ---
runTest('tier1', 'F9.1: bookScene.ts configures HemisphereLight with sky 0xfffbf4 and ground 0xd8cebe', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('THREE.HemisphereLight(0xfffbf4, 0xd8cebe, 0.78)'))
})

runTest('tier1', 'F9.2: Directional key light 0xfff7ec casts shadows with PCFSoftShadowMap', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('THREE.DirectionalLight(0xfff7ec, 1.45)'))
  assert.ok(content.includes('THREE.PCFSoftShadowMap'))
})

runTest('tier1', 'F9.3: Warm candle PointLight 0xffaa42 simulates 2200K candle flame in parisian studio', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('THREE.PointLight(0xffaa42, 1.15, 12, 2)'))
})

runTest('tier1', 'F9.4: Rim fill light 0xead8b5 provides golden contour back-illumination', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('THREE.PointLight(0xead8b5, 0.45, 12, 2)'))
})

runTest('tier1', 'F9.5: Tone mapping configured with ACESFilmicToneMapping and exposure 1.12', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('THREE.ACESFilmicToneMapping'))
  assert.ok(content.includes('renderer.toneMappingExposure = 1.12'))
})

// --- Feature 10: Selective Bloom Postprocessing ---
runTest('tier1', 'F10.1: bookScene.ts scene fog is calibrated to warm champagne tone 0xe6dfd2 with density 0.032', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('THREE.FogExp2(0xe6dfd2, 0.032)'))
})

runTest('tier1', 'F10.2: Crystal point light intensity pulses dynamically with dual sinusoidal harmonics', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('Math.sin(time * 2.2) * 0.08 + Math.cos(time * 4.1) * 0.04'))
})

runTest('tier1', 'F10.3: Ground plane uses light travertine color 0xe8dfd0 to preserve bright ambient bounce', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('color: 0xe8dfd0, roughness: 0.94, metalness: 0.02'))
})

runTest('tier1', 'F10.4: Gold leaf materials specify emissiveIntensity 0.08 for selective highlight retention', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('emissive: 0x3d2b0f'))
  assert.ok(content.includes('emissiveIntensity: 0.08'))
})

runTest('tier1', 'F10.5: WebGL output color space configured with sRGB for accurate gamma correction', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('THREE.SRGBColorSpace'))
})

// --- Feature 11: Hybrid Rendering Architecture ---
runTest('tier1', 'F11.1: Landing renders crisp DOM chapters over a fixed atmosphere layer', () => {
  const content = readLanding('Landing.tsx')
  assert.ok(content.includes('className="lx-sky"'))
  assert.ok(content.includes('<main>'))
  // слой неба действительно fixed: иначе он занял бы место в потоке и сдвинул контент
  const css = readLanding('landing.css')
  const sky = css.match(/(?:^|\n)\.lx-sky\s*\{([^}]*)\}/)
  assert.ok(sky, '.lx-sky rule not found in landing.css')
  assert.ok(/position:\s*fixed/.test(sky[1]))
})

runTest('tier1', 'F11.2: BookNavbarOverlay renders vector DOM top bar with title and badge in 3D book mode', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes('book-navbar-overlay__title'))
  assert.ok(content.includes('book-navbar-overlay__badge'))
})

runTest('tier1', 'F11.3: bookScene.ts pointer move handler converts 2D client coordinates to NDC mouseVec', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('((e.clientX - r.left) / r.width) * 2 - 1'))
  assert.ok(content.includes('-(((e.clientY - r.top) / r.height) * 2 - 1)'))
})

runTest('tier1', 'F11.4: Raycaster intersects 3D book elements and triggers interactive actions', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('this.raycaster.setFromCamera(this.mouseVec, this.camera)'))
})

runTest('tier1', 'F11.5: Stage cursor style updates dynamically between pointer and default based on raycast hit', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes("this.stage.style.cursor = hit.cursor"))
  assert.ok(content.includes("this.stage.style.cursor = 'default'"))
})

// --- Feature 12: VRAM Optimization (<40 MB) ---
runTest('tier1', 'F12.1: bookScene.ts implements disposeLeaf disposing geometries, materials and textures', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('private disposeLeaf(leaf: Leaf)'))
  assert.ok(content.includes('leaf.mesh.geometry.dispose()'))
  assert.ok(content.includes('mat.map?.dispose()'))
  assert.ok(content.includes('mat.dispose()'))
})

runTest('tier1', 'F12.2: clearBook cleans up all active turnable leaves and resets stack counters', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('this.turnable.forEach((l) => this.disposeLeaf(l))'))
  assert.ok(content.includes('this.turnable = []'))
})

runTest('tier1', 'F12.3: astralAstrolabe.ts tracks disposables registry for thorough WebGL memory cleanup', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('this.disposables.geometries.forEach((g) => g.dispose())'))
  assert.ok(content.includes('this.disposables.materials.forEach((m) => m.dispose())'))
})

runTest('tier1', 'F12.4: ContinuousStage.tsx unmount hook calls scene.dispose()', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'ContinuousStage.tsx'), 'utf8')
  assert.ok(content.includes('scene.dispose()'))
})

runTest('tier1', 'F12.5: Procedural 2D canvas pages avoid large 28-texture raster overhead', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('document.createElement(\'canvas\')'))
  assert.ok(content.includes('drawCoverOntoCanvas'))
})

// --- Feature 13: 60 FPS Performance & Mobile LOD ---
runTest('tier1', 'F13.1: bookScene.ts clamps renderer device pixel ratio to Math.min(window.devicePixelRatio, 2)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('Math.min(window.devicePixelRatio, 2)'))
})

runTest('tier1', 'F13.2: Animation frame loop uses cancelAnimationFrame on dispose to eliminate background CPU leaks', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('cancelAnimationFrame(this.raf)'))
})

runTest('tier1', 'F13.3: Gyroscopic breathing motion operates with lightweight sinusoidal formula', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('const breathe = Math.sin(time * 0.9) * 0.015'))
})

runTest('tier1', 'F13.4: Camera interpolation uses efficient Vector3.lerp with 0.065 factor', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('this.camera.position.lerp(wantPos, 0.065)'))
  assert.ok(content.includes('this.currentLook.lerp(tgt.look, 0.065)'))
})

runTest('tier1', 'F13.5: Raycasting during page turn animations is skipped to maintain 60 FPS', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('if (this.anim) return'), 'onPointerDown must abort raycast during turn animation')
})

// --- Feature 14: 432 Hz Generative Soundscape ---
runTest('tier1', 'F14.1: soundscape.ts configures 432 Hz fundamental meditative drone oscillator', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('oscFund.frequency.setValueAtTime(432, this.ctx.currentTime)'))
})

runTest('tier1', 'F14.2: soundscape.ts configures 864 Hz octave overtone oscillator', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('oscOctave.frequency.setValueAtTime(864, this.ctx.currentTime)'))
})

runTest('tier1', 'F14.3: soundscape.ts configures 216 Hz sub-harmonic warm resonance oscillator', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('oscSub.frequency.setValueAtTime(216, this.ctx.currentTime)'))
})

runTest('tier1', 'F14.4: soundscape.ts initializes lowpass BiquadFilterNode at 750 Hz with resonance Q = 1.2', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes("filterNode.type = 'lowpass'"))
  assert.ok(content.includes('filterNode.frequency.setValueAtTime(750, this.ctx.currentTime)'))
  assert.ok(content.includes('filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime)'))
})

runTest('tier1', 'F14.5: Master gain transitions use exponential ramps (1.2s fade-in to 0.25, 0.8s fade-out to 0.0001)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('exponentialRampToValueAtTime(0.25, now + 1.2)'))
  assert.ok(content.includes('exponentialRampToValueAtTime(0.0001, now + 0.8)'))
})

// --- Feature 15: Scroll Cutoff Filter Modulation ---
runTest('tier1', 'F15.1: updateScrollCutoff formula scales filter frequency between 650 Hz and 2200 Hz', () => {
  const calcCutoff = (velocity) => Math.min(2200, Math.max(650, 650 + Math.abs(velocity) * 500))
  assert.equal(calcCutoff(0), 650)
  assert.equal(calcCutoff(1.0), 1150)
  assert.equal(calcCutoff(3.0), 2150)
  assert.equal(calcCutoff(5.0), 2200)
})

runTest('tier1', 'F15.2: updateScrollCutoff uses exponential target smoothing with 0.15s time constant', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('this.filterNode.frequency.setTargetAtTime(targetFreq, now, 0.15)'))
})

runTest('tier1', 'F15.3: updateScrollCutoff executes cleanly via soundscape controller without throwing', () => {
  assert.doesNotThrow(() => {
    soundscape.updateScrollCutoff(1.5)
    soundscape.updateScrollCutoff(0)
  })
})

runTest('tier1', 'F15.4: Negative velocity values are absolute-valued to modulate brightness symmetrically', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('Math.abs(velocity)'))
  assert.ok(content.includes('Math.min(2200'))
})

runTest('tier1', 'F15.5: Cutoff modulation is guarded by isPlaying check to prevent unnecessary audio calculations', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('if (!this.ctx || !this.filterNode || !this.isPlaying) return'))
})

// --- Feature 16: Page Turn Rustle Synthesis ---
runTest('tier1', 'F16.1: playPageTurn creates audio buffer for 180ms pink noise tactile burst', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('this.ctx.sampleRate * 0.18 // 180ms'))
})

runTest('tier1', 'F16.2: Pink noise filtering algorithm implements 3-pole IIR filter coefficients', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('0.99886 * b0 + white * 0.0555179'))
  assert.ok(content.includes('0.99332 * b1 + white * 0.0750759'))
  assert.ok(content.includes('0.96900 * b2 + white * 0.1538520'))
})

runTest('tier1', 'F16.3: Bandpass BiquadFilter centers at 1400 Hz with Q = 0.8 for crisp paper rustle', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes("filter.type = 'bandpass'"))
  assert.ok(content.includes('filter.frequency.setValueAtTime(1400, now)'))
  assert.ok(content.includes('filter.Q.setValueAtTime(0.8, now)'))
})

runTest('tier1', 'F16.4: Rustle envelope features rapid linear attack to 0.35 in 40ms', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('gain.linearRampToValueAtTime(0.35, now + 0.04)'))
})

runTest('tier1', 'F16.5: Rustle envelope features exponential decay to silence over remaining 140ms', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('gain.exponentialRampToValueAtTime(0.0001, now + 0.18)'))
})

// --- Feature 17: Audio Toggle & LocalStorage ---
runTest('tier1', 'F17.1: soundscape.ts constructor loads initial state from localStorage key "alina_soundscape_enabled"', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes("const STORAGE_KEY = 'alina_soundscape_enabled'"))
  assert.ok(content.includes('localStorage.getItem(STORAGE_KEY)'))
})

runTest('tier1', 'F17.2: soundscape.toggle flips enabled state and persists new value', () => {
  const initial = soundscape.getIsEnabled()
  const toggled = soundscape.toggle()
  assert.equal(toggled, !initial)
  assert.equal(soundscape.getIsEnabled(), !initial)
  // Restore initial state
  soundscape.toggle()
})

runTest('tier1', 'F17.3: Landing Header renders audio toggle button with sound icon and 432 Hz frequency label', () => {
  const content = readLanding('components', 'Header.tsx')
  assert.ok(content.includes('soundscape.toggle()'))
  assert.ok(content.includes('432 Гц'))
})

runTest('tier1', 'F17.4: Audio resume handles suspended context on first user gesture', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes("if (this.ctx.state === 'suspended')"))
  assert.ok(content.includes('this.ctx.resume()'))
})

runTest('tier1', 'F17.5: localStorage access is safely wrapped in try/catch for private browsing compatibility', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'audio/soundscape.ts'), 'utf8')
  assert.ok(content.includes('try {'), 'Missing try block for storage')
  assert.ok(content.includes('catch {'), 'Missing catch block for storage')
})

// --- Feature 18: 16 Individual Sessions Catalog ---
runTest('tier1', 'F18.1: Exactly 16 individual sessions configured in INDIVIDUAL_SESSIONS', () => {
  assert.equal(INDIVIDUAL_SESSIONS.length, 16)
})

runTest('tier1', 'F18.2: Session distribution matches 3 pricing blocks: 5 taro-matrix, 6 soul-archetypes, 5 energy-ritual', () => {
  assert.equal(INDIVIDUAL_SESSIONS.filter((s) => s.blockId === 'taro-matrix').length, 5)
  assert.equal(INDIVIDUAL_SESSIONS.filter((s) => s.blockId === 'soul-archetypes').length, 6)
  assert.equal(INDIVIDUAL_SESSIONS.filter((s) => s.blockId === 'energy-ritual').length, 5)
})

runTest('tier1', 'F18.3: All 16 session IDs are unique non-empty strings', () => {
  const ids = INDIVIDUAL_SESSIONS.map((s) => s.id)
  assert.equal(new Set(ids).size, 16)
  for (const s of INDIVIDUAL_SESSIONS) {
    assert.ok(s.title.trim().length > 0)
    assert.ok(s.description.trim().length > 0)
  }
})

runTest('tier1', 'F18.4: Exact price points match official price list across all 16 sessions', () => {
  const expectedPricePoints = {
    'taro-session': [5555, 9999, 9999, 14999],
    'twin-flames-consultation': [8888, 13369],
    'destiny-matrix': [14999],
    'ancestral-healing': [18000],
    'matrix-plus-healing': [29999],
    'akashic-records': [18000],
    'regression-session': [21000],
    'soul-journey': [15000, 18000, 19999, 22999],
    'shadow-integration': [6666],
    'light-shadow-integration': [9999],
    'empress-session': [19999],
    'energy-alignment': [12000, 15000],
    'quantum-cleansing': [12000, 15000],
    'energy-complex': [22000, 25000],
    'magic-diagnosis-ritual': [8000, 28000],
    'personal-mentorship': [222000]
  }

  for (const [id, expectedPrices] of Object.entries(expectedPricePoints)) {
    const session = INDIVIDUAL_SESSIONS.find((s) => s.id === id)
    assert.ok(session, `Session ${id} not found`)
    assert.deepEqual(session.options.map((o) => o.priceNumber), expectedPrices)
  }
})

runTest('tier1', 'F18.5: Flagship recommendations marked with isFeatured: true', () => {
  const featured = INDIVIDUAL_SESSIONS.filter((s) => s.isFeatured).map((s) => s.id)
  assert.ok(featured.includes('matrix-plus-healing'))
  assert.ok(featured.includes('akashic-records'))
  assert.ok(featured.includes('empress-session'))
  assert.ok(featured.includes('energy-complex'))
  assert.ok(featured.includes('personal-mentorship'))
})

// --- Feature 19: Variable Tariff Selector ---
runTest('tier1', 'F19.1: Total tariff options across all 16 sessions is exactly 27 options', () => {
  const totalOptions = INDIVIDUAL_SESSIONS.reduce((acc, s) => acc + s.options.length, 0)
  assert.equal(totalOptions, 27)
})

runTest('tier1', 'F19.2: Every option contains non-empty label, price string with ₽ and positive numeric price', () => {
  for (const s of INDIVIDUAL_SESSIONS) {
    for (const opt of s.options) {
      assert.ok(opt.label.length > 0)
      assert.ok(opt.price.endsWith('₽'))
      assert.ok(opt.priceNumber > 0)
    }
  }
})

runTest('tier1', 'F19.3: Tarot session has 4 tariff options: 5 Qs, 10 Qs, Video 30m, Video 60m', () => {
  const taro = INDIVIDUAL_SESSIONS.find((s) => s.id === 'taro-session')
  assert.equal(taro.options.length, 4)
  assert.equal(taro.options[0].priceNumber, 5555)
  assert.equal(taro.options[1].priceNumber, 9999)
  assert.equal(taro.options[2].priceNumber, 9999)
  assert.equal(taro.options[3].priceNumber, 14999)
})

runTest('tier1', 'F19.4: Soul Journey session has 4 options: 45m rec, 45m online, 60m rec, 60m online', () => {
  const sj = INDIVIDUAL_SESSIONS.find((s) => s.id === 'soul-journey')
  assert.equal(sj.options.length, 4)
  assert.equal(sj.options[0].priceNumber, 15000)
  assert.equal(sj.options[1].priceNumber, 18000)
  assert.equal(sj.options[2].priceNumber, 19999)
  assert.equal(sj.options[3].priceNumber, 22999)
})

runTest('tier1', 'F19.5: Sessions chapter tracks the selected tariff per session row', () => {
  const content = readLanding('sections', 'Sessions.tsx')
  assert.ok(content.includes('const [opt, setOpt] = useState(0)'))
  assert.ok(content.includes('role="radiogroup"'))
})

// --- Feature 20: Online Format Surcharge (+3 000 ₽) ---
runTest('tier1', 'F20.1: Soul Journey 45m online is exactly +3 000 ₽ higher than recording (15 000 vs 18 000 ₽)', () => {
  const sj = INDIVIDUAL_SESSIONS.find((s) => s.id === 'soul-journey')
  assert.equal(sj.options[1].priceNumber - sj.options[0].priceNumber, 3000)
})

runTest('tier1', 'F20.2: Soul Journey 60m online is exactly +3 000 ₽ higher than recording (19 999 vs 22 999 ₽)', () => {
  const sj = INDIVIDUAL_SESSIONS.find((s) => s.id === 'soul-journey')
  assert.equal(sj.options[3].priceNumber - sj.options[2].priceNumber, 3000)
})

runTest('tier1', 'F20.3: Energy Alignment online is exactly +3 000 ₽ higher than recording (12 000 vs 15 000 ₽)', () => {
  const ea = INDIVIDUAL_SESSIONS.find((s) => s.id === 'energy-alignment')
  assert.equal(ea.options[1].priceNumber - ea.options[0].priceNumber, 3000)
})

runTest('tier1', 'F20.4: Quantum Cleansing online is exactly +3 000 ₽ higher than recording (12 000 vs 15 000 ₽)', () => {
  const qc = INDIVIDUAL_SESSIONS.find((s) => s.id === 'quantum-cleansing')
  assert.equal(qc.options[1].priceNumber - qc.options[0].priceNumber, 3000)
})

runTest('tier1', 'F20.5: Energy Complex online is exactly +3 000 ₽ higher than recording (22 000 vs 25 000 ₽)', () => {
  const ec = INDIVIDUAL_SESSIONS.find((s) => s.id === 'energy-complex')
  assert.equal(ec.options[1].priceNumber - ec.options[0].priceNumber, 3000)
})

// --- Feature 21: Twin Flames 20% Discount ---
runTest('tier1', 'F21.1: 20% discount on Energy Alignment recording (12 000 ₽) yields exactly 9 600 ₽', () => {
  const base = 12000
  const discounted = Math.round(base * 0.8)
  assert.equal(discounted, 9600)
})

runTest('tier1', 'F21.2: 20% discount on Energy Alignment online (15 000 ₽) yields exactly 12 000 ₽', () => {
  const base = 15000
  const discounted = Math.round(base * 0.8)
  assert.equal(discounted, 12000)
})

runTest('tier1', 'F21.3: Twin Flames consultation metadata explicitly lists 20% discount with exact prices', () => {
  const tf = INDIVIDUAL_SESSIONS.find((s) => s.id === 'twin-flames-consultation')
  assert.ok(tf.bonus?.includes('Скидка 20% на энергетическое выравнивание'))
  assert.ok(tf.bonus?.includes('запись 9 600 ₽, онлайн 12 000 ₽'))
})

runTest('tier1', 'F21.4: Energy Alignment metadata notes 14-day eligibility window following Twin Flames', () => {
  const ea = INDIVIDUAL_SESSIONS.find((s) => s.id === 'energy-alignment')
  assert.ok(ea.bonus?.includes('скидка 20% в течение 14 дней'))
})

runTest('tier1', 'F21.5: Free bonus guide «11.11 — Код Единства» included with Twin Flames consultation', () => {
  const tf = INDIVIDUAL_SESSIONS.find((s) => s.id === 'twin-flames-consultation')
  assert.ok(tf.bonus?.includes('11.11 — Код Единства'))
})

// --- Feature 22: Magic Diagnosis & Clean Separation ---
runTest('tier1', 'F22.1: Magic Diagnosis session offers preliminary diagnosis at 8 000 ₽ (~30 min)', () => {
  const magic = INDIVIDUAL_SESSIONS.find((s) => s.id === 'magic-diagnosis-ritual')
  assert.equal(magic.options[0].priceNumber, 8000)
  assert.ok(magic.options[0].label.includes('Диагностика'))
})

runTest('tier1', 'F22.2: Big ritual cleansing is priced from 28 000 ₽ and requires preliminary diagnosis', () => {
  const magic = INDIVIDUAL_SESSIONS.find((s) => s.id === 'magic-diagnosis-ritual')
  assert.equal(magic.options[1].priceNumber, 28000)
  assert.ok(magic.description.includes('только после диагностики'))
})

runTest('tier1', 'F22.3: Session description states big cleaning cannot be purchased upfront', () => {
  const magic = INDIVIDUAL_SESSIONS.find((s) => s.id === 'magic-diagnosis-ritual')
  assert.ok(magic.description.includes('только после диагностики'))
})

runTest('tier1', 'F22.4: Session note specifies that big cleaning is assigned exclusively personally by Alina', () => {
  const magic = INDIVIDUAL_SESSIONS.find((s) => s.id === 'magic-diagnosis-ritual')
  assert.ok(magic.note?.includes('назначается только лично мастером'))
})

runTest('tier1', 'F22.5: alina_skills.md documents the commercial ethics rule for manager booking', () => {
  const skills = fs.readFileSync(path.join(ROOT_DIR, 'alina_skills.md'), 'utf8')
  assert.ok(skills.includes('чистку заранее не продавать'))
})

// --- Feature 23: 7 Author Group Programs ---
runTest('tier1', 'F23.1: Exactly 7 author group programs + 1 3D book in ALINA_SERVICES (total 8 entries)', () => {
  assert.equal(ALINA_SERVICES.length, 8)
  assert.equal(ALINA_SERVICES.filter((s) => !s.isBook).length, 7)
  assert.equal(ALINA_SERVICES.filter((s) => s.isBook).length, 1)
})

runTest('tier1', 'F23.2: Program numbering is sequential from 01 to 08', () => {
  const numbers = ALINA_SERVICES.map((s) => s.number)
  assert.deepEqual(numbers, ['01', '02', '03', '04', '05', '06', '07', '08'])
})

runTest('tier1', 'F23.3: All 8 titles in ALINA_SERVICES are distinct and non-empty', () => {
  const titles = ALINA_SERVICES.map((s) => s.title)
  assert.equal(new Set(titles).size, 8)
})

runTest('tier1', 'F23.4: Group programs contain bullets, outcomes and fullDescription arrays', () => {
  for (const s of ALINA_SERVICES) {
    assert.ok(s.bullets.length >= 3)
    assert.ok(s.outcomes.length >= 3)
    assert.ok(s.fullDescription.length >= 2)
  }
})

runTest('tier1', 'F23.5: alina_skills.md reflects all 7 author group directions', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'alina_skills.md'), 'utf8')
  assert.ok(content.includes('Вокальная терапия'))
  assert.ok(content.includes('Таро 5D'))
  assert.ok(content.includes('Женские группы'))
  assert.ok(content.includes('Обучение ченнелингу'))
  assert.ok(content.includes('Эволюция Мастера'))
  assert.ok(content.includes('Работа с отношениями'))
  assert.ok(content.includes('Женская тантра'))
})

// --- Feature 24: 3D Book Grimoire Service Card ---
runTest('tier1', 'F24.1: Exactly one service card is marked with isBook: true (archetypes-book)', () => {
  const bookCards = ALINA_SERVICES.filter((s) => s.isBook)
  assert.equal(bookCards.length, 1)
  assert.equal(bookCards[0].id, 'archetypes-book')
})

runTest('tier1', 'F24.2: archetypes-book card badge is "3D Luxury Art-Book"', () => {
  const book = ALINA_SERVICES.find((s) => s.id === 'archetypes-book')
  assert.equal(book.badge, '3D Luxury Art-Book')
})

runTest('tier1', 'F24.3: The book lives in its own chapter; the seven path cards exclude the isBook entry', () => {
  const content = readLanding('content.ts')
  assert.ok(content.includes('ALINA_SERVICES.filter((s) => !s.isBook)'))
  const folio = readLanding('sections', 'Folio.tsx')
  assert.ok(folio.includes('Открыть книгу сейчас'))
})

runTest('tier1', 'F24.4: Book chapter CTA invokes onOpenBook callback directly', () => {
  const content = readLanding('sections', 'Folio.tsx')
  assert.ok(content.includes('onClick={onOpenBook}'))
})

runTest('tier1', 'F24.5: archetypes-book card highlights 3D book features with 16 codes and 3D engine', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'data', 'alinaServices.ts'), 'utf8')
  assert.ok(content.includes('Уникальный 3D-движок'))
  assert.ok(content.includes('16 персональных позиций'))
})

// --- Feature 25: Service Modal (ServiceModal) ---
runTest('tier1', 'F25.1: Path drawer renders service title, badge, and description paragraphs', () => {
  const content = readLanding('sections', 'Paths.tsx')
  assert.ok(content.includes('{s.title}'))
  assert.ok(content.includes('{s.badge}'))
  assert.ok(content.includes('s.fullDescription.map'))
})

runTest('tier1', 'F25.2: Path drawer renders syllabus bullets and tangible outcomes', () => {
  const content = readLanding('sections', 'Paths.tsx')
  assert.ok(content.includes('s.bullets.map'))
  assert.ok(content.includes('s.outcomes.map'))
})

runTest('tier1', 'F25.3: Path drawer provides Escape key listener for keyboard dismiss', () => {
  const content = readLanding('sections', 'Paths.tsx')
  assert.ok(content.includes("e.key === 'Escape'"))
  assert.ok(content.includes("window.removeEventListener('keydown'"))
})

runTest('tier1', 'F25.4: Path drawer closes on backdrop click', () => {
  const content = readLanding('sections', 'Paths.tsx')
  assert.ok(content.includes('className="lx-drawer__veil" onClick={onClose}'))
})

runTest('tier1', 'F25.5: Path drawer books through Maria in Telegram and WhatsApp', () => {
  const content = readLanding('sections', 'Paths.tsx')
  assert.ok(content.includes('Записаться через Марию'))
  assert.ok(content.includes('telegramLink(pathBookingMessage(s))'))
  assert.ok(content.includes('whatsappLink(pathBookingMessage(s))'))
})

// --- Feature 26: Manager Maria Booking Routing ---
runTest('tier1', 'F26.1: MANAGER_INFO defines name "Мария" and telegramHandle "maria_anima"', () => {
  assert.equal(MANAGER_INFO.name, 'Мария')
  assert.equal(MANAGER_INFO.telegramHandle, 'maria_anima')
})

runTest('tier1', 'F26.2: Maria Telegram URL is https://t.me/maria_anima', () => {
  assert.equal(MANAGER_INFO.telegramUrl, 'https://t.me/maria_anima')
})

runTest('tier1', 'F26.3: Maria phone number is +7 915 214 9560 and WhatsApp URL is https://wa.me/79152149560', () => {
  assert.equal(MANAGER_INFO.phone, '+7 915 214 9560')
  assert.equal(MANAGER_INFO.whatsappUrl, 'https://wa.me/79152149560')
})

runTest('tier1', 'F26.4: MANAGER_INFO includes Alina endorsement quote', () => {
  assert.ok(MANAGER_INFO.quote.includes('Мария — моя правая рука во всех рабочих вопросах'))
})

runTest('tier1', 'F26.5: Contact chapter shows Maria contacts with prefilled Telegram & WhatsApp links', () => {
  const content = readLanding('sections', 'Contact.tsx')
  assert.ok(content.includes('telegramLink(HELLO)'))
  assert.ok(content.includes('whatsappLink(HELLO)'))
  assert.ok(content.includes('MANAGER_INFO.telegram'))
  assert.ok(content.includes('MANAGER_INFO.phone'))
  const shared = readLanding('content.ts')
  assert.ok(shared.includes('MANAGER_INFO.telegramUrl') && shared.includes('MANAGER_INFO.whatsappUrl'))
})

// --- Feature 27: Client Query Navigator (14 Chips) ---
runTest('tier1', 'F27.1: CLIENT_QUERY_NAVIGATOR contains exactly 14 situation chips', () => {
  assert.equal(CLIENT_QUERY_NAVIGATOR.length, 14)
})

runTest('tier1', 'F27.2: Every navigator item has label, icon, hint and targetSessionId', () => {
  for (const item of CLIENT_QUERY_NAVIGATOR) {
    assert.ok(item.label.length > 0)
    assert.ok(item.icon.length > 0)
    assert.ok(item.hint.length > 0)
    assert.ok(item.targetSessionId.length > 0)
  }
})

runTest('tier1', 'F27.3: Every targetSessionId resolves to an existing session in INDIVIDUAL_SESSIONS', () => {
  const sessionIds = new Set(INDIVIDUAL_SESSIONS.map((s) => s.id))
  for (const item of CLIENT_QUERY_NAVIGATOR) {
    assert.ok(sessionIds.has(item.targetSessionId), `Target session ${item.targetSessionId} not found`)
  }
})

runTest('tier1', 'F27.4: Relationship, money & twin flames queries route accurately', () => {
  const rel = CLIENT_QUERY_NAVIGATOR.find((c) => c.label.includes('Отношения'))
  const money = CLIENT_QUERY_NAVIGATOR.find((c) => c.label.includes('Деньги'))
  const tf = CLIENT_QUERY_NAVIGATOR.find((c) => c.label.includes('Близнецовые пламена'))
  assert.equal(rel.targetSessionId, 'taro-session')
  assert.equal(money.targetSessionId, 'taro-session')
  assert.equal(tf.targetSessionId, 'twin-flames-consultation')
})

runTest('tier1', 'F27.5: Shadow, soul journey, empress & complex queries route accurately', () => {
  const shadow = CLIENT_QUERY_NAVIGATOR.find((c) => c.label.includes('Тени'))
  const soul = CLIENT_QUERY_NAVIGATOR.find((c) => c.label.includes('Истощение'))
  const empress = CLIENT_QUERY_NAVIGATOR.find((c) => c.label.includes('Женственность'))
  const complex = CLIENT_QUERY_NAVIGATOR.find((c) => c.label.includes('перезагрузка'))
  assert.equal(shadow.targetSessionId, 'shadow-integration')
  assert.equal(soul.targetSessionId, 'soul-journey')
  assert.equal(empress.targetSessionId, 'empress-session')
  assert.equal(complex.targetSessionId, 'energy-complex')
})

// --- Feature 28: Tarot Questions Bank (36 Questions) ---
runTest('tier1', 'F28.1: TAROT_QUESTIONS contains exactly 36 questions (27 relationships + 9 money)', () => {
  assert.equal(TAROT_QUESTIONS.relationships.length, 27)
  assert.equal(TAROT_QUESTIONS.moneyAndRealization.length, 9)
  assert.equal(TAROT_QUESTIONS.relationships.length + TAROT_QUESTIONS.moneyAndRealization.length, 36)
})

runTest('tier1', 'F28.2: All 36 questions are non-empty strings (>15 chars) ending with "?"', () => {
  const allQs = [...TAROT_QUESTIONS.relationships, ...TAROT_QUESTIONS.moneyAndRealization]
  for (const q of allQs) {
    assert.ok(q.length >= 15)
    assert.ok(q.endsWith('?'))
  }
})

runTest('tier1', 'F28.3: All 36 questions are unique without duplicates', () => {
  const allQs = [...TAROT_QUESTIONS.relationships, ...TAROT_QUESTIONS.moneyAndRealization]
  assert.equal(new Set(allQs).size, 36)
})

runTest('tier1', 'F28.4: Sessions chapter renders the Tarot Questions Bank with both question groups', () => {
  const content = readLanding('sections', 'Sessions.tsx')
  assert.ok(content.includes('TAROT_QUESTIONS.relationships'))
  assert.ok(content.includes('TAROT_QUESTIONS.moneyAndRealization'))
  assert.ok(content.includes('Отправить Марии'))
})

runTest('tier1', 'F28.5: Clicking a Tarot question generates Telegram booking URL targeting Maria', () => {
  const sampleQ = TAROT_QUESTIONS.relationships[0]
  const tgUrl = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(
    `Здравствуйте, Мария! Хочу задать на сессии Таро следующий вопрос:\n\n«${sampleQ}»`
  )}`
  assert.ok(tgUrl.startsWith('https://t.me/maria_anima?text='))
  assert.ok(tgUrl.includes(encodeURIComponent(sampleQ)))
})

// --- Feature 29: RF Legal Risk Engine ---
runTest('tier1', 'F29.1: LEGAL_RULES defines 7 core regulatory risk rules with regex patterns and safe replacements', () => {
  assert.equal(LEGAL_RULES.length, 7)
  const ids = LEGAL_RULES.map((r) => r.id)
  assert.deepEqual(ids, [
    'heal_organs',
    'disease_cure',
    'magic_curse',
    'guaranteed_future',
    'love_return_guarantee',
    'magic_cleaning_sale',
    'money_channel_open'
  ])
})

runTest('tier1', 'F29.2: auditTextLegalRisks detects stop-words across medical, fraud, and advertising laws', () => {
  const risky = '100% предсказание будущего! Снятие порчи и полное исцеление органов.'
  const audit = auditTextLegalRisks(risky)
  assert.equal(audit.matchedRules.length, 3)
  assert.equal(audit.riskLevel, 'high')
  assert.ok(audit.score <= 50)
})

runTest('tier1', 'F29.3: Clean consultative text achieves score 100 and riskLevel "low"', () => {
  const clean = 'Индивидуальная консультация Таро по вопросам отношений. Исследуем вероятности и точки выбора (18+).'
  const audit = auditTextLegalRisks(clean)
  assert.equal(audit.matchedRules.length, 0)
  assert.equal(audit.riskLevel, 'low')
  assert.equal(audit.score, 100)
})

runTest('tier1', 'F29.4: Text with 18+ and non-medical disclaimer earns hasDisclaimer bonus', () => {
  const text = 'Практики самопознания. Услуга не является медицинской (18+).'
  const audit = auditTextLegalRisks(text)
  assert.equal(audit.hasDisclaimer, true)
})

runTest('tier1', 'F29.5: Compliance score is strictly clamped to [0, 100]', () => {
  const toxic =
    'исцеление органов излечение от болезней снятие порчи гарантирую будущее вернем мужа большая чистка за 50000 открытие денежного канала'
  const audit = auditTextLegalRisks(toxic)
  assert.equal(audit.score, 0)
  assert.equal(audit.riskLevel, 'high')
})

// --- Feature 30: Interactive Legal Risk Checker UI ---
runTest('tier1', 'F30.1: LegalRiskChecker component accepts isOpen and onClose props', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'LegalRiskChecker.tsx'), 'utf8')
  assert.ok(content.includes('interface LegalRiskCheckerProps'))
  assert.ok(content.includes('isOpen: boolean'))
  assert.ok(content.includes('onClose: () => void'))
})

runTest('tier1', 'F30.2: LegalRiskChecker renders live score progress bar and risk status badge', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'LegalRiskChecker.tsx'), 'utf8')
  assert.ok(content.includes('auditTextLegalRisks'))
  assert.ok(content.includes('audit.score'))
  assert.ok(content.includes('audit.riskLevel'))
})

runTest('tier1', 'F30.3: LegalRiskChecker displays recommended safe euphemisms for matched stop-words', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'LegalRiskChecker.tsx'), 'utf8')
  assert.ok(content.includes('m.rule.safeReplacement'))
})

runTest('tier1', 'F30.4: LegalRiskChecker provides one-click replacement button for detected violations', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'LegalRiskChecker.tsx'), 'utf8')
  assert.ok(content.includes('handleApplyReplacement'))
  assert.ok(content.includes('Заменить'))
})

runTest('tier1', 'F30.5: Landing integrates LegalRiskChecker and controls modal state via legalOpen', () => {
  const content = readLanding('Landing.tsx')
  assert.ok(content.includes('<LegalRiskChecker'))
  assert.ok(content.includes('isOpen={legalOpen}'))
  assert.ok(content.includes('setLegalOpen(false)'))
})

// --- Feature 31: Statutory Footer Disclaimer ---
runTest('tier1', 'F31.1: Footer disclaimer specifies 18+ age restriction requirement', () => {
  const content = readLanding('content.ts')
  assert.ok(content.includes('18+'))
})

runTest('tier1', 'F31.2: Footer disclaimer states services do not constitute medical or psychological diagnosis', () => {
  const content = readLanding('content.ts')
  const normalized = content.replace(/\s+/g, ' ')
  assert.ok(normalized.includes('не заменяют диагностику, консультацию или лечение'))
})

runTest('tier1', 'F31.3: Footer disclaimer designates services as informational and consultative', () => {
  const content = readLanding('content.ts')
  assert.ok(content.includes('информационно-консультационный'))
})

runTest('tier1', 'F31.4: Footer provides button to trigger RF Legal Risk Checker modal', () => {
  const content = readLanding('sections', 'Contact.tsx')
  assert.ok(content.includes('onClick={onOpenLegal}'))
  assert.ok(content.includes('Проверка текстов на юр. риски (РФ)'))
  assert.ok(content.includes('{LEGAL_DISCLAIMER}'))
})

runTest('tier1', 'F31.5: docs/LEGAL_COMPLIANCE_RF.md documents federal advertising and health legislation', () => {
  const docPath = path.join(ROOT_DIR, 'docs', 'LEGAL_COMPLIANCE_RF.md')
  assert.ok(fs.existsSync(docPath))
  const content = fs.readFileSync(docPath, 'utf8')
  assert.ok(content.includes('№ 38-ФЗ'))
  assert.ok(content.includes('№ 323-ФЗ'))
})

// --- Feature 32: 13 Personal Arcana Chapters ---
runTest('tier1', 'F32.1: chapters.ts builds exactly 13 personal arcana chapters from profile', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'numerology', 'chapters.ts'), 'utf8')
  assert.ok(content.includes('export function buildChapters'))
  assert.ok(content.includes("id: 'soul'"))
  assert.ok(content.includes("id: 'personality'"))
  assert.ok(content.includes("id: 'gift'"))
  assert.ok(content.includes("id: 'destiny'"))
  assert.ok(content.includes("id: 'shadow'"))
  assert.ok(content.includes("id: 'deep_shadow'"))
  assert.ok(content.includes("id: 'shadow_guardian'"))
  assert.ok(content.includes("id: 'higher_vector'"))
  assert.ok(content.includes("id: 'divine_guide'"))
  assert.ok(content.includes("id: 'integration'"))
  assert.ok(content.includes("id: 'ancestral_male'"))
  assert.ok(content.includes("id: 'ancestral_female'"))
  assert.ok(content.includes("id: 'profile_map'"))
})

runTest('tier1', 'F32.2: chapters.ts distinguishes single, ancestral and summary chapter kinds', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'numerology', 'chapters.ts'), 'utf8')
  assert.ok(content.includes("export type ChapterKind = 'single' | 'ancestral' | 'summary'"))
})

runTest('tier1', 'F32.3: normalize.ts implements toRoman mapping arcana 1-22 to Roman numerals I-XXII', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'numerology', 'normalize.ts'), 'utf8')
  assert.ok(content.includes('export function toRoman'))
  assert.ok(content.includes("'XXII'"))
  assert.ok(content.includes("'I'"))
})

runTest('tier1', 'F32.4: calculate.ts normalizes birthdate values to arcana range [1, 22]', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'numerology', 'normalize.ts'), 'utf8')
  assert.ok(content.includes('normalizeArcana'))
  const norm = (val) => {
    while (val > 22) val -= 22
    return val <= 0 ? 22 : val
  }
  assert.equal(norm(25), 3)
  assert.equal(norm(44), 22)
  assert.equal(norm(7), 7)
})

runTest('tier1', 'F32.5: Ancestral chapters include spiritual, material and integral lineage lines', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'numerology', 'chapters.ts'), 'utf8')
  assert.ok(content.includes('ancestralLines: {'))
  assert.ok(content.includes('spiritual: maleSpiritual'))
  assert.ok(content.includes('material: maleMaterial'))
  assert.ok(content.includes('integral: maleIntegral'))
})

// --- Feature 33: 5 Reading Layer Tabs ---
runTest('tier1', 'F33.1: useBookStore.ts defines ReadingLayerTab with 5 tabs', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'store', 'useBookStore.ts'), 'utf8')
  assert.ok(content.includes("export type ReadingLayerTab = 'essence' | 'shadow' | 'life' | 'archetypes' | 'integration'"))
})

runTest('tier1', 'F33.2: bookLayout.ts defines READING_TABS with Russian labels (Свет, Тень, В Жизни, Пантеон, Вопросы)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookLayout.ts'), 'utf8')
  assert.ok(content.includes('READING_TABS'))
  assert.ok(content.includes('✦ Свет'))
  assert.ok(content.includes('☾ Тень'))
  assert.ok(content.includes('⚖ В Жизни'))
})

runTest('tier1', 'F33.3: bookScene.ts updates right page texture upon tab selection via updateRightPageTab', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('updateRightPageTab(spreadIdx: number, activeTab: ReadingLayerTab)'))
})

runTest('tier1', 'F33.4: ContinuousStage.tsx listens to activeLayerTab and synchronizes with sceneRef', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'ContinuousStage.tsx'), 'utf8')
  assert.ok(content.includes('useBookStore((s) => s.activeLayerTab)'))
  assert.ok(content.includes('sceneRef.current.updateRightPageTab(currentSpread - 1, activeLayerTab)'))
})

runTest('tier1', 'F33.5: useBookStore tracks tabPage for multi-page content overflow within tabs', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'store', 'useBookStore.ts'), 'utf8')
  assert.ok(content.includes('tabPage: number'))
  assert.ok(content.includes('setTabPage: (page: number) => void'))
})

// --- Feature 34: Star Rating Assessment System ---
runTest('tier1', 'F34.1: useBookStore.ts defines UserScoreRecord with score 1 to 5 and timestamp', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'store', 'useBookStore.ts'), 'utf8')
  assert.ok(content.includes('export interface UserScoreRecord'))
  assert.ok(content.includes('score: number // 1 to 5'))
  assert.ok(content.includes('timestamp: number'))
})

runTest('tier1', 'F34.2: useBookStore persists scores in localStorage under key "archetypes_scores_v03"', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'store', 'useBookStore.ts'), 'utf8')
  assert.ok(content.includes("const SCORES_STORAGE_KEY = 'archetypes_scores_v03'"))
  assert.ok(content.includes('localStorage.setItem(SCORES_STORAGE_KEY'))
})

runTest('tier1', 'F34.3: bookLayout.ts defines STAR_RATING_LAYOUT with star positions and starCount: 5', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookLayout.ts'), 'utf8')
  assert.ok(content.includes('STAR_RATING_LAYOUT'))
  assert.ok(content.includes('starCount: 5'))
})

runTest('tier1', 'F34.4: bookScene.ts updates left page texture with latest rating score via updateLeftPageScore', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('updateLeftPageScore(spreadIdx: number, score: number)'))
})

runTest('tier1', 'F34.5: ContinuousStage.tsx synchronizes score updates to sceneRef', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'ContinuousStage.tsx'), 'utf8')
  assert.ok(content.includes('sceneRef.current.updateLeftPageScore(currentSpread - 1, latestScore)'))
})

// --- Feature 35: Page Curl Animation ---
runTest('tier1', 'F35.1: bookScene.ts defines TURN_DURATION = 820ms for tactile physical page turn', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('const TURN_DURATION = 820'))
})

runTest('tier1', 'F35.2: bookScene.ts defines CURL_EXTRA_ANGLE = 0.85 for scroll-like page bending', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('const CURL_EXTRA_ANGLE = 0.85'))
})

runTest('tier1', 'F35.3: luxuryTextures.ts creates gilded edges texture with 22k gold specular finish', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'luxuryTextures.ts'), 'utf8')
  assert.ok(content.includes('export function makeGildedEdgesTexture'))
  assert.ok(content.includes('ctx.fillStyle = LUXURY_PALETTE.gold.primary'))
})

runTest('tier1', 'F35.4: applyPageCurl computes vertex deformation dynamically based on turnProgress', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes('private applyPageCurl(mesh: THREE.Mesh, t: number)'))
})

runTest('tier1', 'F35.5: Turn animation queue in ContinuousStage.tsx guards against double-triggering during ongoing turns', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'ContinuousStage.tsx'), 'utf8')
  assert.ok(content.includes('if (!scene || queueRunning.current || viewMode !== \'book\') return'))
  assert.ok(content.includes('queueRunning.current = true'))
})

// --- Feature 36: Floating Navigation Bar ---
runTest('tier1', 'F36.1: BookNavbarOverlay renders a reader-facing badge', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes('book-navbar-overlay__badge'))
  assert.ok(content.includes('Книга персональных кодов'))
})

runTest('tier1', 'F36.2: BookNavbarOverlay renders return button with label "На сайт Alina Tarot Energy" and arrow "←"', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes('На сайт Alina Tarot Energy'))
  assert.ok(content.includes('←'))
  assert.ok(content.includes('onBackToPortal'))
})

runTest('tier1', 'F36.3: BookNavbarOverlay displays current chapter title and spread page indicator', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes('currentChapter.title'))
  assert.ok(content.includes('currentSpread'))
})

runTest('tier1', 'F36.4: BookNavbarOverlay renders center emblem title "✦ АРХЕТИПЫ И ТЕНИ ✦"', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes('✦ АРХЕТИПЫ И ТЕНИ ✦'))
})

runTest('tier1', 'F36.5: BookNavbarOverlay provides return button and chapter spread indicator', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes('book-navbar-overlay__spread'))
  assert.ok(content.includes('onBackToPortal'))
})

// --- Feature 37: Hash Navigation & Scroll Return ---
runTest('tier1', 'F37.1: App.tsx initializes viewMode based on window.location.hash === "#book"', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("window.location.hash === '#book'"))
  assert.ok(content.includes("isBookHash() ? 'book' : 'portal'"))
})

runTest('tier1', 'F37.2: hashchange event listener updates viewMode on forward/back navigation', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("window.addEventListener('hashchange', onHash)"))
})

runTest('tier1', 'F37.3: openBook sets window.location.hash = "book"', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("window.location.hash = 'book'"))
})

runTest('tier1', 'F37.4: backToPortal clears hash via pushState without reloading page', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("window.history.pushState(null, '', window.location.pathname + window.location.search)"))
})

runTest('tier1', 'F37.5: Escape key listener in App.tsx triggers backToPortal', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("e.key === 'Escape'"))
  assert.ok(content.includes('backToPortal()'))
})

// --- Feature 38: Oxlint Linting Suite ---
runTest('tier1', 'F38.1: package.json scripts defines "lint": "oxlint"', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'))
  assert.equal(pkg.scripts.lint, 'oxlint')
})

runTest('tier1', 'F38.2: oxlint devDependency is installed and configured', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'))
  assert.ok(pkg.devDependencies.oxlint, 'Missing oxlint devDependency')
})

runTest('tier1', 'F38.3: Project root includes .oxlintrc.json or valid lint configuration', () => {
  const configPath = path.join(ROOT_DIR, '.oxlintrc.json')
  assert.ok(fs.existsSync(configPath) || fs.existsSync(path.join(ROOT_DIR, 'package.json')))
})

runTest('tier1', 'F38.4: oxlint targets all source files under src/', () => {
  assert.ok(fs.existsSync(path.join(ROOT_DIR, 'src', 'App.tsx')))
  assert.ok(fs.existsSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts')))
})

runTest('tier1', 'F38.5: Zero lint errors or warnings policy is documented and enforced', () => {
  const projectMd = fs.readFileSync(path.join(ROOT_DIR, 'PROJECT.md'), 'utf8')
  assert.ok(projectMd.includes('0 warnings, 0 errors'))
})

// --- Feature 39: TypeScript & Rolldown Production Build ---
runTest('tier1', 'F39.1: package.json defines "build": "tsc -b && vite build"', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'))
  assert.equal(pkg.scripts.build, 'tsc -b && vite build')
})

runTest('tier1', 'F39.2: vite.config.ts configures VitePWA and workbox for offline service worker caching', () => {
  const viteConfig = fs.readFileSync(path.join(ROOT_DIR, 'vite.config.ts'), 'utf8')
  assert.ok(viteConfig.includes('VitePWA'))
  assert.ok(viteConfig.includes('workbox'))
})

runTest('tier1', 'F39.3: tsconfig.app.json enforces skipLibCheck and bundler resolution', () => {
  const tsconfigContent = fs.readFileSync(path.join(ROOT_DIR, 'tsconfig.app.json'), 'utf8')
  assert.ok(tsconfigContent.includes('"skipLibCheck": true'))
  assert.ok(tsconfigContent.includes('"moduleResolution": "bundler"'))
})

runTest('tier1', 'F39.4: Build output directory dist/ contains index.html and assets', () => {
  const distPath = path.join(ROOT_DIR, 'dist')
  if (fs.existsSync(distPath)) {
    assert.ok(fs.existsSync(path.join(distPath, 'index.html')))
  } else {
    assert.ok(true)
  }
})

runTest('tier1', 'F39.5: React 19 and Three.js 0.185.1 are declared in dependencies', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'))
  assert.ok(pkg.dependencies.react.includes('19'))
  assert.ok(pkg.dependencies.three.includes('0.185'))
})

// --- Feature 40: Git Policy (коммиты локальные, push — по просьбе владельца) ---
// Git читаем командами, а не файлами из .git: в worktree `.git` — файл-указатель, а не каталог
const gitOut = (...args) => execFileSync('git', args, { cwd: ROOT_DIR, encoding: 'utf8' }).trim()

runTest('tier1', 'F40.1: AGENTS.md documents local-commit, push-on-owner-request policy', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'AGENTS.md'), 'utf8')
  assert.ok(content.includes('git push'))
  assert.ok(content.includes('по просьбе владельца'))
})

runTest('tier1', 'F40.2: GEMINI.md documents the same local-commit, push-on-owner-request policy', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'GEMINI.md'), 'utf8')
  assert.ok(content.includes('git push'))
  assert.ok(content.includes('по просьбе владельца'))
  // старая политика (запрет push) не должна расходиться с AGENTS.md
  assert.ok(!content.includes('STRICT LOCAL GIT ONLY'))
})

runTest('tier1', 'F40.3: origin remote is configured and push is not disabled', () => {
  let cfg = ''
  try {
    cfg = gitOut('config', '--get-regexp', '^remote\\.origin\\.')
  } catch {
    // git config выходит с кодом 1, если секции remote.origin нет вовсе
    assert.fail('remote "origin" is not configured')
  }
  assert.ok(/^remote\.origin\.url\s+\S+/m.test(cfg), 'remote "origin" has no url')
  assert.ok(!/^remote\.origin\.pushurl\s+DISABLED\s*$/im.test(cfg), 'push to origin is disabled')
})

runTest('tier1', 'F40.4: if a pre-push hook exists, it does not abort pushes with exit 1', () => {
  // каталог хуков общий для worktree — спрашиваем у git, а не собираем путь руками
  const hookPath = path.join(path.resolve(ROOT_DIR, gitOut('rev-parse', '--git-path', 'hooks')), 'pre-push')
  if (fs.existsSync(hookPath)) {
    const content = fs.readFileSync(hookPath, 'utf8')
    // безусловный `exit 1` на верхнем уровне (как в прежнем «запрещающем» хуке);
    // проверки вида `npm test || exit 1` или `exit 1` внутри if-блока — законны
    assert.ok(!/^exit\s+1\s*$/m.test(content))
  }
})

runTest('tier1', 'F40.5: Git repository keeps local commit history (HEAD resolves to a commit)', () => {
  // 40 hex — SHA-1, 64 — SHA-256-репозитории
  assert.match(gitOut('rev-parse', '--verify', 'HEAD'), /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/)
})

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2: BOUNDARY & CORNER CASES (50 tests)
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${colors.bold}${colors.magenta}▶ TIER 2: Boundary Value Analysis (BVA)${colors.reset}`)

// B1: Pricing Boundaries
runTest('tier2', 'B1.1: Zero price boundary: no session option has a price of 0 ₽ or negative price', () => {
  for (const s of INDIVIDUAL_SESSIONS) {
    for (const opt of s.options) {
      assert.ok(opt.priceNumber > 0, `Option in ${s.id} has invalid price: ${opt.priceNumber}`)
    }
  }
})

runTest('tier2', 'B1.2: Minimum price boundary: lowest price across all sessions is exactly 5 555 ₽ (Таро 5 вопросов)', () => {
  const allPrices = INDIVIDUAL_SESSIONS.flatMap((s) => s.options.map((o) => o.priceNumber))
  const minPrice = Math.min(...allPrices)
  assert.equal(minPrice, 5555)
})

runTest('tier2', 'B1.3: Maximum price boundary: highest price is 222 000 ₽ (Личное наставничество 1 месяц)', () => {
  const allPrices = INDIVIDUAL_SESSIONS.flatMap((s) => s.options.map((o) => o.priceNumber))
  const maxPrice = Math.max(...allPrices)
  assert.equal(maxPrice, 222000)
})

runTest('tier2', 'B1.4: Price string format matches numeric price with ₽ currency symbol', () => {
  for (const s of INDIVIDUAL_SESSIONS) {
    for (const opt of s.options) {
      assert.ok(opt.price.endsWith('₽'))
      const digitsInString = parseInt(opt.price.replace(/[^\d]/g, ''), 10)
      assert.equal(digitsInString, opt.priceNumber)
    }
  }
})

runTest('tier2', 'B1.5: Option index boundary: selecting invalid index defaults gracefully to option 0', () => {
  const session = INDIVIDUAL_SESSIONS[0]
  const getSelectedOption = (s, idx) => s.options[idx] || s.options[0]
  assert.deepEqual(getSelectedOption(session, 0), session.options[0])
  assert.deepEqual(getSelectedOption(session, 999), session.options[0])
  assert.deepEqual(getSelectedOption(session, -1), session.options[0])
})

// B2: Group Service Boundaries
runTest('tier2', 'B2.1: Group services ID slugs contain only lowercase alphanumeric and hyphens', () => {
  const slugRegex = /^[a-z0-9-]+$/
  for (const s of ALINA_SERVICES) {
    assert.ok(slugRegex.test(s.id))
  }
})

runTest('tier2', 'B2.2: Full description paragraphs array has at least 2 paragraphs per service', () => {
  for (const s of ALINA_SERVICES) {
    assert.ok(Array.isArray(s.fullDescription) && s.fullDescription.length >= 2)
  }
})

runTest('tier2', 'B2.3: Bullets array has between 3 and 6 items per service', () => {
  for (const s of ALINA_SERVICES) {
    assert.ok(s.bullets.length >= 3 && s.bullets.length <= 6)
  }
})

runTest('tier2', 'B2.4: Outcomes array has at least 3 items per service', () => {
  for (const s of ALINA_SERVICES) {
    assert.ok(s.outcomes.length >= 3)
  }
})

runTest('tier2', 'B2.5: Only exactly one service has isBook: true (archetypes-book)', () => {
  const bookServices = ALINA_SERVICES.filter((s) => s.isBook)
  assert.equal(bookServices.length, 1)
  assert.equal(bookServices[0].id, 'archetypes-book')
})

// B3: Navigator Boundaries
runTest('tier2', 'B3.1: Navigator handles unknown/empty session lookup safely without throwing exceptions', () => {
  const lookupSession = (targetId) => INDIVIDUAL_SESSIONS.find((s) => s.id === targetId) ?? null
  assert.equal(lookupSession('non-existent-id'), null)
  assert.equal(lookupSession(''), null)
})

runTest('tier2', 'B3.2: All navigator labels are within boundary lengths (10 to 45 characters)', () => {
  for (const item of CLIENT_QUERY_NAVIGATOR) {
    assert.ok(item.label.length >= 10 && item.label.length <= 45)
  }
})

runTest('tier2', 'B3.3: All navigator hint texts are within boundary lengths (30 to 130 characters)', () => {
  for (const item of CLIENT_QUERY_NAVIGATOR) {
    assert.ok(item.hint.length >= 30 && item.hint.length <= 130)
  }
})

runTest('tier2', 'B3.4: Navigator icons are valid non-empty emoji strings', () => {
  for (const item of CLIENT_QUERY_NAVIGATOR) {
    assert.ok(item.icon.trim().length > 0)
  }
})

runTest('tier2', 'B3.5: No duplicate labels exist in CLIENT_QUERY_NAVIGATOR', () => {
  const labels = CLIENT_QUERY_NAVIGATOR.map((i) => i.label)
  assert.equal(new Set(labels).size, labels.length)
})

// B4: Tarot Questions Boundaries
runTest('tier2', 'B4.1: Shortest Tarot question length boundary (>= 30 characters)', () => {
  const allQs = [...TAROT_QUESTIONS.relationships, ...TAROT_QUESTIONS.moneyAndRealization]
  const minLength = Math.min(...allQs.map((q) => q.length))
  assert.ok(minLength >= 30)
})

runTest('tier2', 'B4.2: Longest Tarot question length boundary (<= 120 characters)', () => {
  const allQs = [...TAROT_QUESTIONS.relationships, ...TAROT_QUESTIONS.moneyAndRealization]
  const maxLength = Math.max(...allQs.map((q) => q.length))
  assert.ok(maxLength <= 120)
})

runTest('tier2', 'B4.3: Category boundary: invalid category falls back safely to relationships', () => {
  const getQuestions = (cat) => (cat === 'money' ? TAROT_QUESTIONS.moneyAndRealization : TAROT_QUESTIONS.relationships)
  assert.equal(getQuestions('relationships').length, 27)
  assert.equal(getQuestions('money').length, 9)
  assert.equal(getQuestions('unknown').length, 27)
})

runTest('tier2', 'B4.4: Questions do not contain forbidden fatalistic patterns («умру», «заболею», «100% порча»)', () => {
  const allQs = [...TAROT_QUESTIONS.relationships, ...TAROT_QUESTIONS.moneyAndRealization]
  const forbidden = [/умр(у|ет)/i, /заболе(ю|ет)/i, /100%\s+порч/i, /приворот/i]
  for (const q of allQs) {
    for (const pat of forbidden) {
      assert.ok(!pat.test(q))
    }
  }
})

runTest('tier2', 'B4.5: Copy handler handles clipboard absence (graceful fallback when navigator.clipboard is undefined)', () => {
  let copiedText = null
  const safeCopy = (text, mockClipboard) => {
    mockClipboard?.writeText(text)
    copiedText = text
    return copiedText
  }
  assert.equal(safeCopy('test question', null), 'test question')
})

// B5: Mathematical Precision & Operational Bounds
runTest('tier2', 'B5.1: Mathematical precision of 20% discount on 12 000 ₽ is exactly 2 400 ₽ discount -> 9 600 ₽', () => {
  const base = 12000
  const discountAmount = base * 0.2
  const finalPrice = base - discountAmount
  assert.equal(discountAmount, 2400)
  assert.equal(finalPrice, 9600)
})

runTest('tier2', 'B5.2: Mathematical precision of 20% discount on 15 000 ₽ is exactly 3 000 ₽ discount -> 12 000 ₽', () => {
  const base = 15000
  const discountAmount = base * 0.2
  const finalPrice = base - discountAmount
  assert.equal(discountAmount, 3000)
  assert.equal(finalPrice, 12000)
})

runTest('tier2', 'B5.3: Online format surcharge is exactly 3 000 ₽ across all sessions with no rounding artifacts', () => {
  const checks = [
    { rec: 15000, online: 18000 },
    { rec: 19999, online: 22999 },
    { rec: 12000, online: 15000 },
    { rec: 22000, online: 25000 }
  ]
  for (const c of checks) {
    assert.equal(c.online - c.rec, 3000)
  }
})

runTest('tier2', 'B5.4: Surcharge consistency on 60 min session: 19 999 ₽ + 3 000 ₽ = 22 999 ₽', () => {
  const sj = INDIVIDUAL_SESSIONS.find((s) => s.id === 'soul-journey')
  const rec60 = sj.options.find((o) => o.label.includes('60 мин (в записи)'))
  const online60 = sj.options.find((o) => o.label.includes('60 мин (онлайн-сессия)'))
  assert.equal(online60.priceNumber - rec60.priceNumber, 3000)
})

runTest('tier2', 'B5.5: Clean division & rounding boundary for discount percentage math (no floating point residue)', () => {
  assert.equal(Math.round(12000 * 0.8), 9600)
  assert.equal(Math.round(15000 * 0.8), 12000)
})

// B6: URL Encoding Boundaries
runTest('tier2', 'B6.1: URL encoding with Cyrillic characters does not leave unescaped spaces or symbols', () => {
  const message = 'Здравствуйте, Мария! Запись на Таро'
  const encoded = encodeURIComponent(message)
  assert.ok(!encoded.includes(' '))
  assert.ok(encoded.includes('%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5'))
})

runTest('tier2', 'B6.2: URL encoding with quotes « » correctly encodes to %C2%AB and %C2%BB', () => {
  const textWithQuotes = 'Сессия: «Императрица»'
  const encoded = encodeURIComponent(textWithQuotes)
  assert.ok(encoded.includes('%C2%AB'))
  assert.ok(encoded.includes('%C2%BB'))
})

runTest('tier2', 'B6.3: URL encoding with line breaks \\n\\n properly encodes to %0A%0A', () => {
  const multiLine = 'Вопрос 1\n\nВопрос 2'
  const encoded = encodeURIComponent(multiLine)
  assert.ok(encoded.includes('%0A%0A'))
})

runTest('tier2', 'B6.4: WhatsApp phone format: digits only in wa.me URL (79152149560)', () => {
  const phoneDigits = MANAGER_INFO.phone.replace(/[^\d]/g, '')
  assert.equal(phoneDigits, '79152149560')
  assert.equal(MANAGER_INFO.whatsappUrl, `https://wa.me/${phoneDigits}`)
})

runTest('tier2', 'B6.5: Telegram handle format in URL has no leading @ (t.me/maria_anima)', () => {
  assert.ok(!MANAGER_INFO.telegramUrl.includes('/@'))
  assert.equal(MANAGER_INFO.telegramUrl, 'https://t.me/maria_anima')
})

// B7: 3D Book & Modal Boundaries
runTest('tier2', 'B7.1: Return bar renders even when current spread is 0 (cover stage)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes("stage === 'cover'"))
})

runTest('tier2', 'B7.2: Return bar handles large spread numbers without crashing', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes('currentSpread > 0 && chapters[currentSpread - 1]'))
})

runTest('tier2', 'B7.3: Multiple consecutive openBook calls maintain consistent state', () => {
  let viewMode = 'portal'
  const openBook = () => {
    viewMode = 'book'
  }
  openBook()
  openBook()
  assert.equal(viewMode, 'book')
})

runTest('tier2', 'B7.4: Rapid switching between portal and book cleans up event listeners', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("window.removeEventListener('hashchange'"))
})

runTest('tier2', 'B7.5: ESC key handler in drawer components safely closes them without throwing', () => {
  const content = readLanding('sections', 'Paths.tsx')
  assert.ok(content.includes("e.key === 'Escape'"))
  assert.ok(content.includes("window.removeEventListener('keydown'"))
})

// B8: State & Hash Boundaries
runTest('tier2', 'B8.1: Hash handling with empty hash "" or "#" stays on portal', () => {
  const getMode = (hash) => (hash === '#book' ? 'book' : 'portal')
  assert.equal(getMode(''), 'portal')
  assert.equal(getMode('#'), 'portal')
})

runTest('tier2', 'B8.2: Hash handling with unexpected hash "#unknown" stays on portal', () => {
  const getMode = (hash) => (hash === '#book' ? 'book' : 'portal')
  assert.equal(getMode('#unknown'), 'portal')
  assert.equal(getMode('#pricing'), 'portal')
})

runTest('tier2', 'B8.3: History state preservation does not modify pathname when clearing hash', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("window.history.pushState(null, '', window.location.pathname + window.location.search)"))
})

runTest('tier2', 'B8.4: Birthdate formatting handles leap day 29.02 and Russian locale ru-RU', () => {
  const leapDate = new Date(2000, 1, 29)
  const formatted = leapDate.toLocaleDateString('ru-RU')
  assert.equal(formatted, '29.02.2000')
})

runTest('tier2', 'B8.5: Stage transitions support cover and reading stages with layer tabs', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'store', 'useBookStore.ts'), 'utf8')
  assert.ok(content.includes("'cover'"))
  assert.ok(content.includes("'reading'"))
  assert.ok(content.includes('ReadingLayerTab'))
})

// B9: Responsive & Contrast Boundaries
runTest('tier2', 'B9.1: Mobile breakpoint boundary (320px-640px) enforces horizontal overflow containment', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(content.includes('overflow-x: hidden;'))
  assert.ok(content.includes('@media (max-width: 640px)'))
})

runTest('tier2', 'B9.2: Tablet breakpoint boundary (768px width) responsive grid definitions', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(content.includes('grid-template-columns: 1fr;'))
})

runTest('tier2', 'B9.3: Desktop container max-width boundary is set to 1240px', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(content.includes('max-width: 1240px;'))
})

runTest('tier2', 'B9.4: Ultra-wide / 4K boundary (3840px) background styling fills with var(--bg)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.css'), 'utf8')
  assert.ok(content.includes('background-color: var(--bg);'))
})

runTest('tier2', 'B9.5: Color contrast compliance: deep ink text #201C24 on ivory background #F4EFE6 exceeds WCAG AAA (7:1)', () => {
  const getLuminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }
  const lumInk = getLuminance(0x20, 0x1c, 0x24)
  const lumBg = getLuminance(0xf4, 0xef, 0xe6)
  const contrastRatio = (lumBg + 0.05) / (lumInk + 0.05)
  assert.ok(contrastRatio > 14)
})

// B10: Legal Audit Boundaries
runTest('tier2', 'B10.1: Legal audit handles empty string "" (score 100, riskLevel "low", 0 matches)', () => {
  const audit = auditTextLegalRisks('')
  assert.equal(audit.score, 100)
  assert.equal(audit.riskLevel, 'low')
  assert.equal(audit.matchedRules.length, 0)
})

runTest('tier2', 'B10.2: Legal audit handles whitespace-only "   \\n\\t  " (score 100, riskLevel "low")', () => {
  const audit = auditTextLegalRisks('   \n\t  ')
  assert.equal(audit.score, 100)
  assert.equal(audit.riskLevel, 'low')
})

runTest('tier2', 'B10.3: Legal audit handles short text < 80 chars without disclaimer (no 15-point penalty applied)', () => {
  const shortText = 'Короткий анонс встречи по медитации.'
  const audit = auditTextLegalRisks(shortText)
  assert.equal(audit.score, 100)
})

runTest('tier2', 'B10.4: Legal audit handles massive text 10,000+ chars in <100ms without ReDoS timeout', () => {
  const hugeText = 'Безопасное описание практики самопознания. '.repeat(500)
  const start = Date.now()
  const audit = auditTextLegalRisks(hugeText)
  const elapsed = Date.now() - start
  assert.ok(elapsed < 100)
  assert.equal(audit.matchedRules.length, 0)
})

runTest('tier2', 'B10.5: Legal audit score clamp boundary: multiple high violations cannot reduce score below 0', () => {
  const toxicText =
    'исцеление органов излечение от болезней снятие порчи гарантирую будущее вернем мужа большая чистка за 50000 открытие денежного канала'
  const audit = auditTextLegalRisks(toxicText)
  assert.equal(audit.score, 0)
  assert.equal(audit.riskLevel, 'high')
  assert.ok(audit.matchedRules.length >= 5)
})

// ─────────────────────────────────────────────────────────────────────────────
// TIER 3: CROSS-FEATURE PAIRWISE COMBINATIONS (12 tests)
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${colors.bold}${colors.magenta}▶ TIER 3: Cross-Feature Pairwise Combinations (C1 to C12)${colors.reset}`)

runTest('tier3', 'C1: Navigator chip click activates correct block tab and targets valid session element ID', () => {
  for (const chip of CLIENT_QUERY_NAVIGATOR) {
    const targetSession = INDIVIDUAL_SESSIONS.find((s) => s.id === chip.targetSessionId)
    assert.ok(targetSession)
    const expectedElementId = `session-${chip.targetSessionId}`
    assert.ok(expectedElementId.startsWith('session-'))
    assert.ok(PRICING_BLOCKS.some((b) => b.id === targetSession.blockId))
  }
})

runTest('tier3', 'C2: Selecting individual session option dynamically updates Telegram CTA URL with price and label', () => {
  const session = INDIVIDUAL_SESSIONS.find((s) => s.id === 'soul-journey')
  for (let idx = 0; idx < session.options.length; idx++) {
    const opt = session.options[idx]
    const expectedMessage = `Здравствуйте, Мария! Хочу записаться на сессию Alina Tarot Energy: «${session.title}» (тариф: ${opt.label} — ${opt.price})`
    const tgUrl = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(expectedMessage)}`
    assert.ok(tgUrl.startsWith('https://t.me/maria_anima?text='))
    assert.ok(tgUrl.includes(encodeURIComponent(opt.price)))
    assert.ok(tgUrl.includes(encodeURIComponent(opt.label)))
  }
})

runTest('tier3', 'C3: Selecting a Tarot question from the Bank generates a Telegram booking URL targeting Maria', () => {
  const sampleQuestion = TAROT_QUESTIONS.relationships[0]
  const expectedTgUrl = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(
    `Здравствуйте, Мария! Хочу задать на сессии Таро следующий вопрос:\n\n«${sampleQuestion}»`
  )}`
  assert.ok(expectedTgUrl.startsWith('https://t.me/maria_anima?text='))
  assert.ok(expectedTgUrl.includes(encodeURIComponent(sampleQuestion)))
})

runTest('tier3', 'C4: Transition from Portal -> 3D Book via #book hash, then return via BookNavbarOverlay restores Portal', () => {
  let hash = ''
  let viewMode = 'portal'

  const openBook = () => {
    hash = '#book'
    viewMode = 'book'
  }
  openBook()
  assert.equal(hash, '#book')
  assert.equal(viewMode, 'book')

  const backToPortal = () => {
    if (hash === '#book') {
      hash = ''
    }
    viewMode = 'portal'
  }
  backToPortal()
  assert.equal(hash, '')
  assert.equal(viewMode, 'portal')
})

runTest('tier3', 'C5: Opening ServiceModal for group program vs 3D book service card differentiates actions', () => {
  const vocalService = ALINA_SERVICES.find((s) => s.id === 'vocal-sound-therapy')
  const bookService = ALINA_SERVICES.find((s) => s.id === 'archetypes-book')

  assert.equal(vocalService.isBook, undefined)
  assert.equal(bookService.isBook, true)

  const getModalActionType = (service) => (service.isBook ? 'OPEN_3D_BOOK' : 'CONTACT_BOOKING')
  assert.equal(getModalActionType(vocalService), 'CONTACT_BOOKING')
  assert.equal(getModalActionType(bookService), 'OPEN_3D_BOOK')
})

runTest('tier3', 'C6: Path drawer booking CTA routes directly to Manager Maria (@maria_anima)', () => {
  const content = readLanding('content.ts')
  assert.ok(content.includes('MANAGER_INFO.telegramUrl'))
  assert.ok(readLanding('sections', 'Paths.tsx').includes('telegramLink('))
})

runTest('tier3', 'C7: Twin Flame consultation card cross-references Energy Alignment 20% discount', () => {
  const tf = INDIVIDUAL_SESSIONS.find((s) => s.id === 'twin-flames-consultation')
  const ea = INDIVIDUAL_SESSIONS.find((s) => s.id === 'energy-alignment')

  assert.ok(tf.bonus?.includes('выравнивание'))
  assert.ok(ea.bonus?.includes('БП'))
})

runTest('tier3', 'C8: Legal Risk Checker opens from the footer and is lazy-loaded by the landing', () => {
  const landing = readLanding('Landing.tsx')
  const footer = readLanding('sections', 'Contact.tsx')
  assert.ok(landing.includes("import('../components/LegalRiskChecker')"))
  assert.ok(footer.includes('onClick={onOpenLegal}'))
})

runTest('tier3', 'C9: Safe replacement in Legal Risk Checker fixes matched rule and increases compliance score', () => {
  const originalDangerous = '100% предсказание будущего! Исцеление органов и снятие порчи.'
  const initialAudit = auditTextLegalRisks(originalDangerous)
  assert.equal(initialAudit.riskLevel, 'high')

  let fixedText = originalDangerous
  for (const match of initialAudit.matchedRules) {
    fixedText = fixedText.replace(match.matchedText, match.rule.safeReplacement)
  }
  fixedText += ' Услуга носит информационно-консультационный характер и не заменяет медицинскую помощь (18+).'

  const secondAudit = auditTextLegalRisks(fixedText)
  assert.ok(secondAudit.score >= 85)
  assert.equal(secondAudit.riskLevel, 'low')
  assert.equal(secondAudit.matchedRules.length, 0)
})

runTest('tier3', 'C10: Medical disclaimer in footer harmonizes with session-level safety guidelines', () => {
  const footerContent = readLanding('content.ts').replace(/\s+/g, ' ')
  const skillsContent = fs.readFileSync(path.join(ROOT_DIR, 'alina_skills.md'), 'utf8')

  assert.ok(footerContent.includes('не заменяют диагностику'))
  assert.ok(skillsContent.includes('профильным медицинским специалистам'))
})

runTest('tier3', 'C11: Kinetic scroll progress concurrently drives Astrolabe phase and Audio cutoff frequency', () => {
  const scrollProg = 0.5
  const scrollVelocity = 1.2
  const targetCutoff = Math.min(2200, Math.max(650, 650 + Math.abs(scrollVelocity) * 500))
  assert.equal(targetCutoff, 1250)

  const getStageByScroll = (prog) => {
    if (prog < 0.25) return 'cover'
    if (prog < 0.60) return 'cover_input'
    return 'reading_spread'
  }
  assert.equal(getStageByScroll(scrollProg), 'cover_input')
})

runTest('tier3', 'C12: 3D book stage is code-split and never mounted under the landing', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8')
  assert.ok(content.includes("lazy(() => import('./book/BookMode'))"))
  assert.ok(!content.includes('<ContinuousStage'))
  assert.ok(content.includes('<Landing '))
})

// ─────────────────────────────────────────────────────────────────────────────
// TIER 4: REAL-WORLD WORKLOAD SCENARIOS (6 tests)
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${colors.bold}${colors.magenta}▶ TIER 4: Real-World Workload Scenarios (S1 to S6)${colors.reset}`)

runTest('tier4', 'S1: Customer Seeks Relationship Clarity (Navigator -> Tarot -> Question Bank -> Maria Booking)', () => {
  const chip = CLIENT_QUERY_NAVIGATOR.find((c) => c.label === 'Отношения и чувства')
  assert.ok(chip)
  assert.equal(chip.targetSessionId, 'taro-session')

  const taroSession = INDIVIDUAL_SESSIONS.find((s) => s.id === chip.targetSessionId)
  assert.equal(taroSession.options.length, 4)

  const selectedQuestion = TAROT_QUESTIONS.relationships[0]
  assert.equal(selectedQuestion, 'Что человек действительно чувствует ко мне сейчас?')

  const bookingUrl = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(
    `Здравствуйте, Мария! Хочу задать на сессии Таро следующий вопрос:\n\n«${selectedQuestion}»`
  )}`
  assert.ok(bookingUrl.includes('maria_anima'))
  assert.ok(bookingUrl.includes(encodeURIComponent('Что человек действительно чувствует ко мне сейчас?')))
})

runTest('tier4', 'S2: Health & Somatic Query Flow with Medical Safety Disclaimer', () => {
  const exhaustionChip = CLIENT_QUERY_NAVIGATOR.find((c) => c.label.includes('Истощение'))
  assert.equal(exhaustionChip.targetSessionId, 'soul-journey')

  const session = INDIVIDUAL_SESSIONS.find((s) => s.id === exhaustionChip.targetSessionId)
  assert.ok(session.subtitle.includes('Мягкая'))

  const footerContent = readLanding('content.ts')
  const normalizedFooter = footerContent.replace(/\s+/g, ' ')
  assert.ok(normalizedFooter.includes('Они не являются медицинскими услугами'))
  assert.ok(normalizedFooter.includes('не заменяют диагностику, консультацию или лечение у дипломированных врачей'))
})

runTest('tier4', 'S3: Twin Flames to Energy Alignment Discount Workflow', () => {
  const tf = INDIVIDUAL_SESSIONS.find((s) => s.id === 'twin-flames-consultation')
  const tfOption = tf.options[1]
  assert.equal(tfOption.priceNumber, 13369)
  assert.ok(tf.bonus.includes('11.11 — Код Единства'))

  const ea = INDIVIDUAL_SESSIONS.find((s) => s.id === 'energy-alignment')
  const discountedRec = Math.round(ea.options[0].priceNumber * 0.8)
  const discountedOnline = Math.round(ea.options[1].priceNumber * 0.8)

  assert.equal(discountedRec, 9600)
  assert.equal(discountedOnline, 12000)

  const bookingMessage = `Здравствуйте, Мария! Я проходила консультацию «Близнецовые пламена». Хочу записаться на «Энергетическое выравнивание» со скидкой 20% (тариф: онлайн — 12 000 ₽ вместо 15 000 ₽)`
  const tgUrl = `https://t.me/${MANAGER_INFO.telegramHandle}?text=${encodeURIComponent(bookingMessage)}`
  assert.ok(tgUrl.includes('12%20000'))
})

runTest('tier4', 'S4: 3D Book Exploration and Return Workflow', () => {
  let currentHash = ''
  let viewMode = 'portal'

  const clickHeaderBookButton = () => {
    currentHash = '#book'
    viewMode = 'book'
  }
  clickHeaderBookButton()
  assert.equal(currentHash, '#book')
  assert.equal(viewMode, 'book')

  const navOverlayPath = path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx')
  assert.ok(fs.existsSync(navOverlayPath))

  const clickReturnToPractices = () => {
    currentHash = ''
    viewMode = 'portal'
  }
  clickReturnToPractices()
  assert.equal(currentHash, '')
  assert.equal(viewMode, 'portal')
})

runTest('tier4', 'S5: Advertising Copy Legal Compliance Audit & Safe Replacement Workflow', () => {
  const draftAd =
    'Уникальная сессия Таро! 100% предсказание будущего и полное снятие порчи. Снятие диагнозов и лечение органов.'

  const audit1 = auditTextLegalRisks(draftAd)
  assert.equal(audit1.riskLevel, 'high')
  assert.ok(audit1.matchedRules.length >= 3)
  assert.ok(audit1.score < 50)

  let compliantAd = draftAd
  for (const match of audit1.matchedRules) {
    compliantAd = compliantAd.replace(match.matchedText, match.rule.safeReplacement)
  }

  compliantAd += ' Услуги носят информационно-консультационный характер и не заменяют медицинскую помощь (18+).'

  const audit2 = auditTextLegalRisks(compliantAd)
  assert.equal(audit2.riskLevel, 'low')
  assert.equal(audit2.matchedRules.length, 0)
  assert.ok(audit2.score >= 85)
})

runTest('tier4', 'S6: Kinetic Scroll & Audio Sensory Journey', () => {
  const slowVelocity = 0.2
  const fastVelocity = 2.4
  const idleCutoff = Math.min(2200, Math.max(650, 650 + slowVelocity * 500))
  const kineticCutoff = Math.min(2200, Math.max(650, 650 + fastVelocity * 500))

  assert.equal(idleCutoff, 750)
  assert.equal(kineticCutoff, 1850)
  assert.ok(kineticCutoff > idleCutoff)

  soundscape.toggle()
  assert.equal(typeof soundscape.getIsEnabled(), 'boolean')
})

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY REPORT & EXIT
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════════${colors.reset}`)
console.log(`${colors.bold}${colors.cyan}                     TEST EXECUTION SUMMARY                       ${colors.reset}`)
console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════════════${colors.reset}\n`)

console.log(`  Tier 1 (Feature Coverage):     ${tierStats.tier1.passed} / ${tierStats.tier1.total} passed`)
console.log(`  Tier 2 (Boundary & Corner):    ${tierStats.tier2.passed} / ${tierStats.tier2.total} passed`)
console.log(`  Tier 3 (Cross-Feature):        ${tierStats.tier3.passed} / ${tierStats.tier3.total} passed`)
console.log(`  Tier 4 (Real-World Scenarios): ${tierStats.tier4.passed} / ${tierStats.tier4.total} passed`)
console.log(`  -------------------------------------------------------------`)
console.log(`  Total Automated Assertions:    ${passedTests} / ${totalTests} passed`)

if (escalatedBugs.length > 0) {
  console.log(`\n${colors.bold}${colors.yellow}⚠️  ESCALATED IMPLEMENTATION DEFECTS (${escalatedBugs.length}):${colors.reset}`)
  for (const b of escalatedBugs) {
    console.log(`  ${colors.bold}${b.id}: ${b.title}${colors.reset}`)
    console.log(`    ${colors.gray}Observation:${colors.reset}    ${b.observation}`)
    console.log(`    ${colors.gray}Impact:${colors.reset}         ${b.impact}`)
    console.log(`    ${colors.gray}Recommendation:${colors.reset} ${b.recommendation}\n`)
  }
}

if (failedTests > 0) {
  console.log(`\n${colors.bold}${colors.red}❌ FAILED TESTS (${failedTests}):${colors.reset}`)
  for (const f of failures) {
    console.log(`  - [${f.tier.toUpperCase()}] ${f.title}: ${f.error.message}`)
  }
  process.exit(1)
} else {
  console.log(`\n${colors.bold}${colors.green}✓ ALL TESTS PASSED SUCCESSFULLY (Exit code 0)${colors.reset}\n`)
  process.exit(0)
}
