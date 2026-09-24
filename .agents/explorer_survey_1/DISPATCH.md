# Dispatch: Explorer 1 (3D & Graphics Engine Survey)

## Mission
Investigate the existing 3D architecture, Three.js setup (version, canvas, scenes, materials, shaders, book rendering, post-processing), WebGL canvas mounting/unmounting, performance, VRAM footprint, and assess how to integrate Continuous Canvas with the 3D Astrolabe, 4 kinetic scroll phases, and dispersion/particles.

## Inputs
- Authoritative User Request: `/Users/mcv/Documents/book/.agents/ORIGINAL_REQUEST.md`
- Project root: `/Users/mcv/Documents/book`

## Expected Output
A detailed report written to `/Users/mcv/Documents/book/.agents/explorer_survey_1/handoff.md` covering:
1. Current Three.js version and 3D codebase structure (`src/components/BookScene/`, etc.).
2. How the current 3D canvas is mounted, rendered, and managed across routes/views.
3. Analysis of VRAM usage, shaders, textures, materials, and geometries.
4. Feasibility and technical plan for 3-ring gimbal Astrolabe, optical crystal icosahedron with physical dispersion, and 15k ether particles (GPU Curl Noise / InstancedMesh).
5. 4 scroll transformation phases (0-25%, 25-60%, 60-85%, 85-100%) and transition into the 3D book spread.
6. DOM overlay projection, Retina scaling, and LOD adaptation.

## 2026-09-23T19:02:56Z
Investigate the project repository at /Users/mcv/Documents/book.
Analyze Three.js version and configuration, canvas lifecycle, current 3D scenes (BookScene, etc.), VRAM footprint, shaders, geometries, textures, and determine how to architect Continuous Canvas (fixed background WebGL canvas, position: fixed, inset: 0), kinetic scroll controller, the 3-ring Astrolabe (MeshPhysicalMaterial metalness 0.96, roughness 0.12, anisotropy 0.85), crystal icosahedron with physical dispersion (transmission 0.98, ior 1.54, dispersion 0.06), 15,000 ether particles (GPU Curl Noise / InstancedMesh), 4 scroll phases, and DOM projection with VRAM < 40 MB and 60 FPS.
Write your detailed findings and architectural recommendations to /Users/mcv/Documents/book/.agents/explorer_survey_1/handoff.md.
Follow the communication protocol: communicate back via send_message when done.
