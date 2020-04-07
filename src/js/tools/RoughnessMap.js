import * as THREE from 'three';
import Map from './Map';

import vertShader from '!raw-loader!glslify-loader!../shaders/texture.vert';
import fragShader from '!raw-loader!glslify-loader!../shaders/roughnessMap.frag';

export default class RoughnessMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < Map.NUM_MAPS; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          resolution: {type: "f", value: 0},
          waterLevel: {type: "f", value: 0},
          heightMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.resolution
    // props.heightMaps[]
    // props.waterLevel

    for (let i = 0; i < Map.NUM_MAPS; i++) {
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.waterLevel.value = props.waterLevel;
      this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }

}
