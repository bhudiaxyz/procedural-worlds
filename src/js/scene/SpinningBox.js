import * as THREE from 'three';

import vertShader from '!raw-loader!glslify-loader!../shaders/box.vert';
import fragShader from '!raw-loader!glslify-loader!../shaders/box.frag';

export default class SpinningBox extends THREE.Object3D {
  constructor(size = 1000) {
    super();
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.ShaderMaterial({
        vertexShader: vertShader,
        fragmentShader: fragShader,
        uniforms: {
          time: {value: 0},
          colorA: {value: new THREE.Color('rgb(93, 50, 180)')},
          colorB: {value: new THREE.Color('rgb(123, 131, 186)')}
        }
      })
    );
    this.add(this.mesh);
  }

  update(dt = 0) {
    this.rotation.x += 0.0015;
    this.rotation.y -= 0.0035;
    this.rotation.z += 0.0045;
  }
};
