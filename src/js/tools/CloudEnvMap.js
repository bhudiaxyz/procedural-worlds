import * as THREE from 'three';
import AbstractEnvMap from './AbstractEnvMap';

import vertShader from '!raw-loader!glslify-loader!../shaders/texture.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/cloudMap.frag'

export default class CloudEnvMap extends AbstractEnvMap {

  constructor() {
    super();
  }

  // Implement
  setupMaterials() {
    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.ShaderMaterial({
        uniforms: {
          index: {type: "i", value: i},
          seed: {type: "f", value: 0},
          resolution: {type: "f", value: 0},
          res1: {type: "f", value: 0},
          res2: {type: "f", value: 0},
          resMix: {type: "f", value: 0},
          mixScale: {type: "f", value: 0}
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
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    for (let i = 0; i < 6; ++i) {
      this.materials[i].uniforms.seed.value = props.seed;
      this.materials[i].uniforms.resolution.value = props.resolution;
      this.materials[i].uniforms.res1.value = props.res1;
      this.materials[i].uniforms.res2.value = props.res2;
      this.materials[i].uniforms.resMix.value = props.resMix;
      this.materials[i].uniforms.mixScale.value = props.mixScale;
      this.materials[i].needsUpdate = true;
    }
  }
}

