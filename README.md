# Procedural Worlds

A WebGL-based procedural planet generator built with Three.js. Every world is uniquely generated from a seed string — terrain, oceans, atmosphere, clouds, stars, and nebulae are all computed in real-time on the GPU.

**Live demo:** [bhudiaxyz.github.io/procedural-worlds](https://bhudiaxyz.github.io/procedural-worlds)

---

## Features

- **Procedural planets** — seed-driven terrain generation using Simplex noise and FBM (Ridged, Inverse-Ridged, Domain-Warp, Cloud), with biome mapping from water level, moisture, and elevation
- **Physically-based rendering** — `MeshStandardMaterial` with per-face normal maps, roughness maps, metalness maps, and displacement maps baked from noise
- **Dynamic atmosphere** — configurable scattering shader with atmosphere ring; colour tinted toward the planet's water colour per seed
- **Volumetric clouds** — separate cloud shell with a noise-based env map, soft-edge fading, and parallax depth shading
- **Procedural nebulae** — full-sky nebula backdrop generated from layered noise, tinted dynamically per seed
- **Stellar field** — procedural star field influenced by the nebula texture
- **Lens flare sun** — animated sun with randomised multi-layer lens flare (rings, blurs, glows)
- **City lights** — night-side city light layer on the planet surface
- **VR support** — WebVR-compatible mode via `mainVR.ts` and `webvr-polyfill`
- **Shareable seeds** — world name encoded in the URL (`?seed=…`); press Space or click **New** to generate a random one
- **Interactive controls** — lil-GUI panel for tweaking resolution, water level, displacement scale, normal scale, noise parameters, atmosphere, clouds, and more

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Rendering | [Three.js](https://threejs.org/) r186+, WebGL |
| Shaders | GLSL via [glslify](https://github.com/glslify/glslify) |
| Noise | simplex-noise, glsl-noise, glsl-worley, Alea PRNG |
| UI | lil-GUI, Bootstrap 5, Inter font |
| Build | Webpack 5, Babel 7, TypeScript |

---

## How It Works

1. A seed string (e.g. `"Ezrohzo Esogam"`) initialises a seeded PRNG via `seedrandom` + `Alea`.
2. Six cube-face env maps are rendered onto a sphere — each face runs noise through a biome lookup to produce colour, normal, roughness, and displacement textures at the chosen resolution (128–2048 px).
3. An atmosphere shell wraps the planet using a configurable Rayleigh-style scattering shader.
4. A separate cloud shell renders a noise-based cloud map with soft edge fading and parallax depth shading.
5. The nebula is drawn as a skydome from a procedurally generated cube texture; stars are scattered on top, density modulated by the nebula map.
6. The sun renders with a custom generated texture and a randomised multi-layer `Lensflare`.
7. On each new seed the full render pipeline re-runs via a `RenderQueue` that sequences async GPU texture uploads.

---

## Getting Started

```bash
npm install
npm start        # dev server with hot reload at localhost:8080
npm run build    # production bundle → dist/
npm run deploy   # build + push to GitHub Pages
```

Press **Space** or click **New** to generate a random world. Type a seed string directly in the GUI or share the URL.

---

## Controls

| Input | Action |
| --- | --- |
| Space | New random planet |
| H | Show/hide GUI |
| Left drag | Orbit camera |
| Scroll | Zoom |

---

## License

MIT — see [LICENSE](LICENSE).
