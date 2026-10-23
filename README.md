# Procedural Worlds

A WebGL-based procedural planet generator built with Three.js. Every world is uniquely generated from a seed string — terrain, oceans, atmosphere, clouds, stars, and nebulae are all computed in real-time on the GPU.

**Live demo:** [bhudiaxyz.github.io/procedural-worlds](https://bhudiaxyz.github.io/procedural-worlds)

---

## Features

- **Procedural planets** — seed-driven terrain generation using Simplex noise and Worley noise, with biome mapping (water level, moisture, elevation)
- **Physically-based rendering** — MeshStandardMaterial with per-face normal maps, roughness maps, and displacement maps baked from noise
- **Dynamic atmosphere** — Rayleigh/Mie scattering shader (via `glsl-atmosphere`) with a configurable atmosphere ring
- **Volumetric clouds** — separate cloud layer with a noise-based env map rendered onto a translucent sphere
- **Procedural nebulae** — full-sky nebula backdrop generated from layered noise, tinted dynamically per seed
- **Stellar field** — procedural star field influenced by the nebula texture
- **Solar system** — animated sun with bloom/godray post-processing (Wagner compositor)
- **VR support** — WebVR-compatible mode via `mainVR.ts` and webvr-polyfill
- **Shareable seeds** — world name encoded in the URL (`?seed=...`); press Space or click "New" to generate a random one
- **Interactive controls** — dat.GUI panel for tweaking resolution, post-processing, water color, rotation speed, wireframe, and more

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Rendering | [Three.js](https://threejs.org/) r89, WebGL |
| Shaders | GLSL via [glslify](https://github.com/glslify/glslify) |
| Noise | simplex-noise, glsl-noise, glsl-worley, Alea PRNG |
| Post-processing | [@superguigui/wagner](https://github.com/superguigui/wagner) (bloom, godrays) |
| UI | dat.GUI, Bootstrap 4 |
| Build | Webpack 5, Babel, TypeScript |

---

## How It Works

1. A seed string (e.g. `"Ezrohzo Esogam"`) initialises a seeded PRNG via `seedrandom` + `Alea`.
2. Six cube-face env maps are rendered onto a sphere to form the planet surface — each face runs noise through a biome lookup to produce colour, normal, and roughness textures at the chosen resolution (128 – 2048 px).
3. An atmosphere pass wraps the planet using the `glsl-atmosphere` Rayleigh scattering shader.
4. The nebula is drawn as a skydome from a procedurally generated cube texture; stars are scattered on top, density modulated by the nebula map.
5. The sun renders with a custom texture and animates solar-flare geometry.
6. On each new seed the full render pipeline re-runs via a `RenderQueue` that sequences async GPU texture uploads.

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
