import * as THREE from 'three';
import AbstractMapTexture from './AbstractMapTexture';

import vertShader from '!raw-loader!glslify-loader!../shaders/texture.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/textureMap.frag'

export default class TextureMap extends AbstractMapTexture {

  constructor() {
    super();
  }

  // Implement
  setupMaterials() {
    this.mats = [];
    for (let i = 0; i < 6; i++) {
      this.mats.push(new THREE.ShaderMaterial({
        uniforms: {
          biomeMap: {type: "t", value: new THREE.Texture()},
          heightMap: {type: "t", value: new THREE.Texture()},
          moistureMap: {type: "t", value: new THREE.Texture()}
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite: false
      }));
    }
  }

  // Implement
  updateMaterial(props) {
    // props.resolution
    // props.heightMaps[]
    // props.moistureMaps[]
    // props.biomeMap

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
      this.mats[i].uniforms.moistureMap.value = props.moistureMaps[i];
      this.mats[i].uniforms.biomeMap.value = props.biomeMap;
      this.mats[i].needsUpdate = true;
    }
  }
}
