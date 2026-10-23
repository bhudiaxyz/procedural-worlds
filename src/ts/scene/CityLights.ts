// @ts-nocheck
import * as THREE from 'three';

import vertShader from '!raw-loader!../shaders/cityLights.vert'
import fragShader from '!raw-loader!../shaders/cityLights.frag'

export default class CityLights extends THREE.Object3D {

  constructor(radius = 1001.0) {
    super();
    this.radius = radius;

    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.ShaderMaterial({
        uniforms: {
          heightMap:  { value: null },
          waterLevel: { value: 0.2 },
          seed:       { value: 0.0 },
        },
        vertexShader:   vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite:  false,
        blending: THREE.AdditiveBlending,
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

  render({ heightMaps, waterLevel, seed }) {
    for (let i = 0; i < 6; ++i) {
      const u = this.materials[i].uniforms;
      u.heightMap.value  = heightMaps[i];
      u.waterLevel.value = waterLevel;
      u.seed.value       = seed + i * 17.3;
    }
  }
}
