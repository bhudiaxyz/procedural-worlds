import * as THREE from 'three';

import vertShader from '!raw-loader!glslify-loader!../shaders/box.vert';
import fragShader from '!raw-loader!glslify-loader!../shaders/box.frag';

export default class SpinningBox extends THREE.Object3D {
  constructor() {
    super();
    this.add(new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.65, 0.65),
      new THREE.ShaderMaterial({
        vertexShader: vertShader,
        fragmentShader: fragShader,
        uniforms: {
          time: {value: 0},
          colorA: {value: new THREE.Color('rgb(93, 50, 180)')},
          colorB: {value: new THREE.Color('rgb(123, 131, 186)')}
        }
      })
    ));
  }

  update(dt = 0) {
    this.rotation.z += dt * 0.2;
  }
};
