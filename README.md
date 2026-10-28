# Procedural Worlds

A WebGL-based procedural planet generator built with Three.js. Every world is uniquely generated from a seed string — terrain, oceans, atmosphere, clouds, stars, and nebulae computed in real-time on the GPU.

**Live demo:** [bhudiaxyz.github.io/procedural-worlds](https://bhudiaxyz.github.io/procedural-worlds)

---

## Highlights

- **Seed-driven worlds** — any string produces a unique, deterministic planet; share via URL (`?seed=…`)
- **GPU noise pipeline** — terrain biomes, normals, roughness, and displacement baked in real-time using Simplex, FBM, Ridged, Domain-Warp, and Worley noise
- **Physically-based rendering** — `MeshStandardMaterial` with per-face normal, roughness, metalness, and displacement maps
- **Dynamic atmosphere & clouds** — configurable Rayleigh-style scattering shell + volumetric cloud layer with parallax depth
- **Procedural sky** — full-sky nebula skydome + star field density modulated by the nebula map + animated lens-flare sun
- **VR support** — WebVR-compatible via `mainVR.ts` and `webvr-polyfill`
- **Live controls** — lil-GUI panel for resolution, water level, displacement, noise, atmosphere, cloud parameters, and more

See [DESIGN.md](DESIGN.md) for architecture and technical details.

---

## Getting Started

```bash
npm install
npm start        # dev server at localhost:8080
npm run build    # production bundle → dist/
npm run deploy   # build + push to GitHub Pages
```

Press **Space** or click **New** to generate a random world. Type a seed in the GUI or share the URL.

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
