import * as THREE from 'three';
import AbstractEnvMap from './AbstractEnvMap';

import vertShader from '!raw-loader!glslify-loader!../shaders/texture.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/textureMap.frag'

export default class TextureEnvMap extends AbstractEnvMap {

  constructor() {
    super();
  }

  // Implement
  setupMaterials() {
    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.ShaderMaterial({
        uniforms: {
          biomeMap: {type: "t", value: new THREE.Texture()},
          heightMap: {type: "t", value: new THREE.Texture()},
          moistureMap: {type: "t", value: new THREE.Texture()},
          waterLevel: {type: "f", value: 0}
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
    // props.moistureMaps[]
    // props.biomeMap
    // props.waterLevel

    for (let i = 0; i < 6; ++i) {
      this.materials[i].uniforms.heightMap.value = props.heightMaps[i];
      this.materials[i].uniforms.moistureMap.value = props.moistureMaps[i];
      this.materials[i].uniforms.biomeMap.value = props.biomeMap;
      this.materials[i].uniforms.waterLevel.value = props.waterLevel;
      this.materials[i].needsUpdate = true;
    }
  }
}
