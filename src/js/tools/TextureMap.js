import * as THREE from 'three';
import Map from './Map';

import vertShader from '!raw-loader!glslify-loader!../shaders/texture.vert';
import fragShader from '!raw-loader!glslify-loader!../shaders/textureMap.frag';

export default class TextureMap extends Map {

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
          biomeMap: {type: "t", value: new THREE.Texture()},
          heightMap: {type: "t", value: new THREE.Texture()},
          moistureMap: {type: "t", value: new THREE.Texture()}
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
    // props.moistureMaps[]
    // props.biomeMap

    let resolution = props.resolution;

    for (let i = 0; i < Map.NUM_MAPS; i++) {

      this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
      this.mats[i].uniforms.moistureMap.value = props.moistureMaps[i];
      this.mats[i].uniforms.biomeMap.value = props.biomeMap;
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }

}

