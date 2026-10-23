// Shims for deps that predate @types coverage at these versions.
// Replace with proper types when upgrading Three.js to r125+.

// Node.js globals used by webpack-bundled code
declare var global: any;
declare function require(id: string): any;

// Custom window properties set at runtime
interface Window {
  gui: any;
  rng: any;
  seedString: string;
  renderQueue: any;
  renderer: any;
  camera: any;
  light: any;
  THREE: any;
}

declare module 'three.meshline' { const v: any; export = v; }
declare module 'stats.js' { const v: any; export = v; }
declare module 'webvr-polyfill' { const v: any; export = v; }
declare module 'webvr-ui' { const v: any; export = v; }
declare module '*.glsl' { const v: string; export default v; }
declare module '*.frag' { const v: string; export default v; }
declare module '*.vert' { const v: string; export default v; }
declare module '*.scss' { const v: Record<string, string>; export default v; }
