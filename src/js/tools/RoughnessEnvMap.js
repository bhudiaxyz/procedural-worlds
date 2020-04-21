import * as THREE from 'three';
import AbstractEnvMap from './AbstractEnvMap';

import vertShader from '!raw-loader!glslify-loader!../shaders/texture.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/roughnessMap.frag'

export default class RoughnessEnvMap extends AbstractEnvMap {

  constructor() {
    super();
  }

  // Implement
  setupMaterials() {
    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.ShaderMaterial({
        uniforms: {
          resolution: {type: "f", value: 0},
          waterLevel: {type: "f", value: 0},
          heightMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite: false
      }));
    }
  }

  // Implement
  updateMaterials(props) {
    // props.resolution
    // props.heightMaps[]
    // props.waterLevel

    for (let i = 0; i < 6; ++i) {
      this.materials[i].uniforms.resolution.value = props.resolution;
      this.materials[i].uniforms.waterLevel.value = props.waterLevel;
      this.materials[i].uniforms.heightMap.value = props.heightMaps[i];
      this.materials[i].needsUpdate = true;
    }
  }
}

