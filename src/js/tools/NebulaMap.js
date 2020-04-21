import * as THREE from 'three';
import Map from './Map';

import vertShader from '!raw-loader!glslify-loader!../shaders/texture.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/nebula.frag'

export default class NebulaMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          index: {type: "i", value: i},
          seed: {type: "f", value: 0},
          resolution: {type: "f", value: 0},
          res1: {type: "f", value: 0},
          res2: {type: "f", value: 0},
          resMix: {type: "f", value: 0},
          mixScale: {type: "f", value: 0},
          nebulaeMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite: false
      });
    }
  }

  updateMaterial(props) {
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.seed.value = props.seed;
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.res1.value = props.res1;
      this.mats[i].uniforms.res2.value = props.res2;
      this.mats[i].uniforms.resMix.value = props.resMix;
      this.mats[i].uniforms.mixScale.value = props.mixScale;
      this.mats[i].uniforms.nebulaeMap.value = props.nebulaeMap;
      this.mats[i].needsUpdate = true;
    }
  }

  render(props) {
    // props.seed
    // props.resolution
    // props.res1
    // props.res2
    // props.resMix
    // props.mixScale

    this.updateMaterial(props);

    super.render(props);
  }

}
