// @ts-nocheck
import * as THREE from 'three';

import vertShader from '!raw-loader!../shaders/water.vert'
import fragShader from '!raw-loader!../shaders/water.frag'

const DEFAULT_SHALLOW = new THREE.Color(0.05, 0.3, 0.7);
const DEFAULT_DEEP    = new THREE.Color(0.0,  0.05, 0.25);

export default class Water extends THREE.Object3D {

  constructor(radius = 1003.0) {
    super();

    this.radius = radius;
    this.time = 0.0;

    this.params = {
      speed: 0.008,
      shallowColor: DEFAULT_SHALLOW.clone(),
      deepColor:    DEFAULT_DEEP.clone(),
    };

    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.ShaderMaterial({
        uniforms: {
          heightMap:    { value: null },
          waterLevel:   { value: 0.2 },
          time:         { value: 0.0 },
          shallowColor: { value: this.params.shallowColor },
          deepColor:    { value: this.params.deepColor },
        },
        vertexShader:   vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite:  false,
        side: THREE.FrontSide,
      }));
    }

    this.geometry = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
    const pos = this.geometry.attributes.position.array;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.length; i += 3) {
      v.set(pos[i], pos[i + 1], pos[i + 2]).normalize().multiplyScalar(this.radius);
      pos[i] = v.x; pos[i + 1] = v.y; pos[i + 2] = v.z;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();

    this.sphere = new THREE.Mesh(this.geometry, this.materials);
    this.add(this.sphere);
  }

  update() {
    this.time += this.params.speed;
    for (let i = 0; i < 6; ++i) {
      this.materials[i].uniforms.time.value = this.time;
    }
  }

  render({ heightMaps, waterLevel }) {
    for (let i = 0; i < 6; ++i) {
      this.materials[i].uniforms.heightMap.value  = heightMaps[i];
      this.materials[i].uniforms.waterLevel.value = waterLevel;
    }
  }

  randomize() {
    // colours intentionally kept stable; override via GUI if needed
  }
}
