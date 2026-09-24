# Dispatch: Worker M1 & M2 (Continuous Canvas, Kinetic Scroll & 3D Astrolabe Engine)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mission
Implement Milestone 1 (Continuous Canvas Architecture & Kinetic Scroll Controller) and Milestone 2 (3D Astrolabe PBR Upgrade & 4-Phase Kinetic Scroll Transformation) in strict accordance with Prototype 1 specifications.

## Inputs
- Authoritative User Request: `/Users/mcv/Documents/book/.agents/ORIGINAL_REQUEST.md` (read this first!)
- Project Plan & Contracts: `/Users/mcv/Documents/book/PROJECT.md`
- 3D Graphics Explorer Blueprint: `/Users/mcv/Documents/book/.agents/explorer_survey_1/handoff.md`
- Portal UI Explorer Report: `/Users/mcv/Documents/book/.agents/explorer_survey_2/handoff.md`

## Exclusively Owned Files
- `/Users/mcv/Documents/book/src/three/kineticScroll.ts` (create)
- `/Users/mcv/Documents/book/src/three/ContinuousStage.tsx` (create or refactor from `BookStage.tsx`)
- `/Users/mcv/Documents/book/src/three/astralAstrolabe.ts`
- `/Users/mcv/Documents/book/src/App.tsx`
- `/Users/mcv/Documents/book/src/audio/soundscape.ts`
DO NOT modify test files under `tests/` or files owned by other agents!

## Implementation Scope
1. **Continuous Canvas Architecture (`src/three/ContinuousStage.tsx`, `src/App.tsx`)**:
   - Mount persistent WebGL canvas element at `position: fixed; inset: 0; z-index: 0; pointer-events: none`.
   - Never unmount or recreate WebGL context during navigation between Portal and Book.
   - Portal DOM layout sits at `z-index: 10` with transparent background so the 3D astrolabe/folio is visible underneath.
   - Maintain `#book` hash routing and smooth scroll restoration.
2. **Kinetic Scroll Progress Controller (`src/three/kineticScroll.ts`)**:
   - Calculate normalized `scrollProgress ∈ [0.0, 1.0]` with smooth spring/damping interpolation (`lerpFactor ≈ 0.08`).
   - Calculate scroll velocity and pass it to `src/audio/soundscape.ts` (`updateScrollVelocity`) to modulate the 432 Hz biquad filter cutoff frequency between 650 Hz and 2200 Hz.
   - Export hook / singleton for reactive consumption in React and Three.js animation loops.
3. **3D Astrolabe PBR Upgrade (`src/three/astralAstrolabe.ts`)**:
   - 3 Concentric Gold Gimbal Rings in Cardan Suspension (`meridianRing`, `zodiacRing`, `colureRing`):
     Upgrade material to `MeshPhysicalMaterial`: `color: 0xC6A76B`, `metalness: 0.96`, `roughness: 0.12`, `anisotropy: 0.85`, `clearcoat: 0.75`.
   - Central Optical Crystal Icosahedron:
     `transmission: 0.98`, `ior: 1.54`, `dispersion: 0.06`, `roughness: 0.04`, `transparent: true`.
     Retain Cauchy GLSL dispersion shader pass / tokens (`uDispersion`, `uRefractionRatio`, `etaR`, `etaG`, `etaB`, `refractR`, `refractG`, `refractB`, `fresnel`) to ensure 100% test compatibility with `prototype1-astrolabe-test.mjs`.
   - 15,000 Gold Ether Particles with GPU Curl Noise:
     Simulate particles entirely in the vertex shader using 3D analytical Curl Noise.
     GPU buffer memory: ~480 KB. CPU overhead: 0.00 ms.
     Implement mobile LOD adaptation: automatically scale to 5,000 particles when screen width < 768px.
   - 4-Phase Transformation Interpolator:
     Implement `setScrollProgress(progress, velocity)` mapping smoothly across:
     - Phase 1 (0.00–0.25): celestial levitation, rainbow spectral dispersion flares, mouse microparallax.
     - Phase 2 (0.25–0.60): 7-lens orbital expansion around the 7 master directions with caustic illumination.
     - Phase 3 (0.60–0.85): kinetic ring closing into gold book cover clasps and folio frame.
     - Phase 4 (0.85–1.00): 3D book foregrounding, tactile date input, and opening to arcana spread.
4. **Build & Quality Verification**:
   - Run `npm run lint` (`oxlint` must report 0 warnings and 0 errors).
   - Run `npm run build` (`tsc -b && vite build` must compile with 0 errors).
   - Run `node tests/prototype1-astrolabe-test.mjs` (must pass 100%).
   - Document all changes and test outputs in `/Users/mcv/Documents/book/.agents/worker_m1/handoff.md`.

## 2026-09-23T19:22:36Z
Resume implementation task for Milestone 1 & Milestone 2 (Continuous Canvas, Kinetic Scroll, 3D Astrolabe PBR, GPU Curl particles, 4-phase scroll transformation). Proceed with modifying files according to your dispatch.
