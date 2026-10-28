# Procedural Worlds — Design & Architecture

Technical reference for contributors. For a user-facing overview see [README.md](README.md).

---

## Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Rendering | [Three.js](https://threejs.org/), WebGL | r186+ |
| Shaders | GLSL via [glslify](https://github.com/glslify/glslify) | 7.x |
| Noise (CPU) | `simplex-noise`, `alea`, `seedrandom` | — |
| Noise (GPU) | `glsl-noise`, `glsl-worley`, `glsl-atmosphere` | — |
| UI | `lil-gui`, Bootstrap 5 | — |
| Build | Webpack 5, Babel 8, TypeScript 7 | — |
| Dev server | webpack-dev-server 6 | — |

---

## Source Layout

```
src/ts/
  index.ts            — entry point; boots main/mainVR/mainWagner
  main/               — three top-level entry modes
    main.ts           — standard WebGL mode
    mainVR.ts         — WebVR mode (webvr-polyfill)
    mainWagner.ts     — post-processing variant
  scene/              — Three.js scene objects (one class per visual element)
  shaders/            — GLSL shader pairs (.frag / .vert) + glslify partials
  tools/              — GPU texture generators (AbstractCanvasTexture, env maps)
  utils/              — helpers (RenderQueue, WebGL, loadTexture, ColorGUIHelper)
  views/              — application base classes and LoadingBar
```

---

## Generation Pipeline

Each new seed runs the following sequence, orchestrated by `RenderQueue` to serialise async GPU uploads:

1. **Seed initialisation** — a seed string (e.g. `"Ezrohzo Esogam"`) initialises a seeded PRNG chain via `seedrandom` + `Alea`. All downstream random choices (biome palette, water level, atmosphere tint, cloud density, nebula colours) derive from this chain, making every world fully deterministic and shareable via `?seed=…`.

2. **Cube-face texture bake** — six cube-face render targets are drawn onto a `WebGLCubeRenderTarget`. Each face runs noise (Simplex FBM with selectable fractal type: Ridged, Inverse-Ridged, Domain-Warp, Cloud) through a biome lookup keyed on water level, moisture, and elevation. This produces four per-face maps baked in a single pass: colour, normal, roughness, and displacement.

3. **Planet mesh** — a `SphereGeometry` with `MeshStandardMaterial` receives the baked cube maps. Displacement scale and normal scale are GUI-tunable at runtime.

4. **Atmosphere shell** — a slightly larger sphere wraps the planet using a Rayleigh-style scattering shader (`atmosphere.frag/vert`). Scatter colour is seeded toward the planet's water colour. An optional `AtmosphereRing` adds an equatorial ring.

5. **Cloud shell** — a second sphere at cloud altitude renders a noise-based cloud env map (`cloudMap.frag`) with soft-edge fading and parallax depth shading (`cloud.frag`). Cloud density and coverage are GUI-tunable.

6. **Nebula skydome** — a `NebulaEnvMap` bakes a procedural cube texture from layered noise; this is applied to a large inverted sphere. Star density in `SkyStars` is modulated by the nebula map's brightness.

7. **Sun & lens flare** — `Sun` renders with a custom `SunTexture` and a randomised multi-layer `Lensflare` (rings, blurs, glows). Position and intensity are seed-derived.

8. **City lights** — `CityLights` renders an additive night-side layer using a noise map keyed to low-elevation, low-roughness terrain.

---

## Shader Organisation

Shaders live in `src/ts/shaders/` and are bundled by `glslify-loader` + `raw-loader`. glslify `#pragma glslify` imports are used for reusable noise and utility partials:

| Partial | Purpose |
| --- | --- |
| `noise.*` | Simplex 2D/3D noise base |
| `noiseMap.*` | FBM variants (Ridged, Domain-Warp, Cloud) |
| `normalMap.*` | Finite-difference normal from height field |
| `roughnessMap.*` | Roughness from height + slope |
| `flowNoiseMap.*` | Flow-distorted noise for clouds/nebula |
| `textureMap.*` | Biome colour lookup |
| `stars.*` | Star field density from noise |
| `water.*` | Specular water layer |
| `atmosphere.*` | Rayleigh + Mie scattering |
| `atmosRing.*` | Ring scattering variant |
| `glow.*` | Additive glow pass |
| `cityLights.*` | Night-side emissive layer |
| `nebulaMap.*` | Layered nebula noise |
| `cloudMap.*` / `clouds.*` | Cloud env map + cloud shell |

---

## GPU Texture Tools (`src/ts/tools/`)

All extend `AbstractCanvasTexture` or `AbstractEnvMap`:

| Class | Output |
| --- | --- |
| `BiomeTexture` | Colour + displacement cube map |
| `NormalEnvMap` | Normal cube map from height |
| `RoughnessEnvMap` | Roughness cube map |
| `CloudEnvMap` | Cloud density cube map |
| `NebulaEnvMap` | Nebula colour cube map |
| `NoiseEnvMap` | Raw noise cube map (shared base) |
| `StarEnvMap` | Star field cube map |
| `SunTexture` | 2D sun disc texture |
| `TextureEnvMap` | Passthrough from an external image |

---

## RenderQueue

`utils/RenderQueue.ts` serialises all async GPU texture uploads. Because `WebGLCubeRenderTarget` renders must complete before dependent materials are assigned, the queue ensures ordering without blocking the main thread. Each item is a `() => Promise<void>` pushed by scene objects; the queue drains one item per frame tick.

---

## Build Configuration

The Webpack config (`webpack.config.js`) handles:

- **TypeScript** via `babel-loader` (Babel 8 + `@babel/preset-typescript`) — no `tsc` emit, type-checking is a separate `npm run typecheck`
- **Three.js alias** — `three$` resolves to `three/build/three.module.js` to ensure a single instance
- **GLSL** — `.glsl/.frag/.vert` files in `src/ts/shaders/` go through `raw-loader` → `glslify-loader` with `glslify-hex` transform
- **glslify browserify transforms** — `ify-loader` applied to `node_modules/` (excluding `popper.js`) to handle glsl packages that ship CommonJS browserify transforms
- **CSS** — SCSS compiled via `sass-loader` → `css-loader` → `MiniCssExtractPlugin`; cssnano minimises in production with svgo disabled (Bootstrap's URL-encoded SVG data URIs are incompatible with svgo)
- **Assets** — images inlined as data URLs below 8 KiB, emitted to `assets/textures/` above
- **Vendor split** — `node_modules/` chunked into a separate `vendor.[hash].js`
- **Output** — `dist/` with content-hash filenames; `output.clean: true` removes stale files

---

## VR Mode

`mainVR.ts` extends `AbstractVRApplication` and uses `webvr-polyfill` + `webvr-ui` to provide a WebVR enter button. The scene graph and generation pipeline are identical; only the camera/renderer setup differs.
