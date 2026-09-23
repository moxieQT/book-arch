import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

console.log('======================================================================')
console.log('   PROTOTYPE 1: ASTRAL ASTROLABE & LIVING GRIMOIRE TEST SUITE         ')
console.log('======================================================================\n')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (err) {
    failed++
    console.error(`  ✗ ${name}`)
    console.error(`    ${err.message}`)
  }
}

// 1. Module and Architectural Integrity
test('P1.1: astralAstrolabe.ts exists and exports AstralAstrolabe class', () => {
  const filePath = path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts')
  assert.ok(fs.existsSync(filePath), 'astralAstrolabe.ts not found')
  const content = fs.readFileSync(filePath, 'utf8')
  assert.ok(content.includes('export class AstralAstrolabe'), 'AstralAstrolabe class not exported')
})

test('P1.2: AstralAstrolabe implements 4 concentric rings in 22k gold finish', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('meridianRing'), 'Meridian ring missing')
  assert.ok(content.includes('zodiacRing'), 'Zodiac ring missing')
  assert.ok(content.includes('colureRing'), 'Colure ring missing')
  assert.ok(content.includes('alidadeRing'), 'Alidade ring missing')
  assert.ok(content.includes('MeshPhysicalMaterial'), 'Physical PBR gold material missing')
  assert.ok(content.includes('0xc6a76b') || content.includes('0xC6A76B'), '22k gold color missing')
})

test('P1.3: Central Crystal uses GLSL Chromatic Light Dispersion Shader with Cauchy parameters', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('uDispersion'), 'uDispersion uniform missing')
  assert.ok(content.includes('uRefractionRatio'), 'uRefractionRatio uniform missing')
  assert.ok(content.includes('etaR'), 'Red refraction vector missing')
  assert.ok(content.includes('etaG'), 'Green refraction vector missing')
  assert.ok(content.includes('etaB'), 'Blue refraction vector missing')
  assert.ok(content.includes('refractR'), 'refractR missing')
  assert.ok(content.includes('refractG'), 'refractG missing')
  assert.ok(content.includes('refractB'), 'refractB missing')
  assert.ok(content.includes('fresnel'), 'Fresnel factor missing')
})

test('P1.4: Prismatic Caustic ground projection plane onto limestone/travertine', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('causticVertexShader'), 'Caustic vertex shader missing')
  assert.ok(content.includes('causticFragmentShader'), 'Caustic fragment shader missing')
  assert.ok(content.includes('getCausticPlane'), 'getCausticPlane method missing')
})

test('P1.5: Crystalline Dispersion & Gold Dust Particles with chromatic spectral colors', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('dispersionPalette'), 'Dispersion palette missing')
  assert.ok(content.includes('particleSpeeds'), 'Particle speeds missing')
  assert.ok(content.includes('PointsMaterial'), 'PointsMaterial missing')
})

test('P1.6: WebGL memory management: dispose cleans up all buffers, materials, textures', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'astralAstrolabe.ts'), 'utf8')
  assert.ok(content.includes('public dispose()'), 'dispose method missing')
  assert.ok(content.includes('this.disposables.geometries.forEach'), 'geometries disposal missing')
  assert.ok(content.includes('this.disposables.materials.forEach'), 'materials disposal missing')
})

test('P1.7: BookScene integrates AstralAstrolabe and living grimoire breathing motion', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'three', 'bookScene.ts'), 'utf8')
  assert.ok(content.includes("import { AstralAstrolabe } from './astralAstrolabe'"), 'AstralAstrolabe import missing')
  assert.ok(content.includes('this.astrolabe = new AstralAstrolabe'), 'astrolabe instantiation missing')
  assert.ok(content.includes('this.astrolabe.update'), 'astrolabe update call missing')
  assert.ok(content.includes('this.astrolabe.dispose'), 'astrolabe dispose call missing')
  assert.ok(content.includes('Math.sin(t * 0.85) * 0.006'), 'living grimoire breathing formula missing')
})

test('P1.8: BookNavbarOverlay.tsx displays Prototype 1 badge', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookNavbarOverlay.tsx'), 'utf8')
  assert.ok(content.includes('book-navbar-overlay__badge'), 'badge element missing')
  assert.ok(content.includes('Прототип 1 · Астральный Астролябий и Живой Гримуар'), 'Prototype 1 badge text missing')
})

test('P1.9: BookBanner.tsx highlights Prototype 1 in quiet luxury aesthetic', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'BookBanner.tsx'), 'utf8')
  assert.ok(content.includes('ПРОТОТИП 1 · АСТРАЛЬНЫЙ АСТРОЛЯБИЙ И ЖИВОЙ ГРИМУАР'), 'Prototype 1 banner tag missing')
  assert.ok(content.includes('кристальной дисперсией света'), 'banner description missing crystal dispersion')
})

test('P1.10: _preview.html (teamwork-preview) enforces strict French Light Luxury theme', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, '_preview.html'), 'utf8')
  assert.ok(content.includes('--bg: #F4EFE6;'), '_preview.html missing --bg: #F4EFE6;')
  assert.ok(content.includes('--gold: #C6A76B;'), '_preview.html missing --gold: #C6A76B;')
  assert.ok(content.includes('--wine: #5C192E;'), '_preview.html missing --wine: #5C192E;')
  assert.ok(content.includes('--ink: #201C24;'), '_preview.html missing --ink: #201C24;')
  assert.ok(content.includes('color-scheme: light;'), '_preview.html missing light color-scheme')
  assert.ok(!content.includes('color-scheme: dark;'), '_preview.html still contains dark color-scheme')
  assert.ok(!content.includes('--bg:#0b0710;'), '_preview.html still contains old dark background')
})

test('P1.11: _preview.html embeds interactive 3D WebGL Three.js Astrolabe canvas', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, '_preview.html'), 'utf8')
  assert.ok(content.includes('<canvas id="threeCanvas"></canvas>'), 'Three.js canvas element missing')
  assert.ok(content.includes('crystalFragmentShader'), 'Crystal shader missing from preview')
  assert.ok(content.includes('meridianRing'), 'Meridian ring missing from preview')
  assert.ok(content.includes('zodiacRing') || content.includes('zodiacGroup'), 'Zodiac ring missing from preview')
  assert.ok(content.includes('dispersionSlider'), 'Interactive dispersion slider missing')
})

console.log('\n======================================================================')
console.log(`  Tests Passed: ${passed} / ${passed + failed}`)
console.log('======================================================================\n')

if (failed > 0) {
  process.exit(1)
}
