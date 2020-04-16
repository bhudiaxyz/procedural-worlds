import * as THREE from 'three';

import shaderVert from '!raw-loader!glslify-loader!../shaders/glow.vert'
import shaderFrag from '!raw-loader!glslify-loader!../shaders/glow.frag'

export default class Glow extends THREE.Object3D {

  constructor() {
    super();

    this.size = 1030;
    this.params = {
      glow: 1.0,
      c: 0.33,
      p: 1.27,
      color: new THREE.Color(0x55ffff)
    };

    this.createControls();

    this.mat = new THREE.ShaderMaterial({
      vertexShader: shaderVert,
      fragmentShader: shaderFrag,
      uniforms: {
        c: {type: "f", value: this.params.c},
        p: {type: "f", value: this.params.p},
        glowColor: {type: "c", value: this.params.color},
        viewVector: {type: "v3", value: new THREE.Vector3(window.camera.position)}
      }
    });

    this.mat.transparent = true;
    this.mat.blending = THREE.AdditiveBlending;
    this.mat.side = THREE.BackSide;

    this.geo = new THREE.IcosahedronBufferGeometry(1, 6);
    this.sphere = new THREE.Mesh(this.geo, this.mat);
    this.sphere.scale.set(this.size, this.size, this.size);

    this.add(this.sphere);
  }

  createControls() {
    let glowFolder = window.gui.addFolder('Glow');
    glowFolder.add(this.params, "glow", 0.0, 1.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    this.params.glowColor = [this.params.color.r * 255, this.params.color.g * 255, this.params.color.b * 255];
    glowFolder.addColor(this.params, "glowColor").name('color').onChange(value => {
      this.params.color.r = value[0] / 255;
      this.params.color.g = value[1] / 255;
      this.params.color.b = value[2] / 255;
      this.updateMaterial();
    });

    glowFolder.add(this.params, "c", 0, 1).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    glowFolder.add(this.params, "p", 0, 6).step(0.01).onChange(value => {
      this.updateMaterial();
    });

  }

  update() {
    this.mat.uniforms.viewVector.value.subVectors(window.camera.position, this.sphere.position);
  }

  updateMaterial() {
    this.mat.uniforms.c.value = this.params.c;
    this.mat.uniforms.p.value = this.params.p;
    this.mat.uniforms.glowColor.value = this.params.color;
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  randomize() {
    this.params.glow = this.randRange(0.25, 1.0);
    this.randomizeColor();
  }

  randomizeColor() {
    this.params.color.setRGB(
      window.rng(),
      window.rng(),
      window.rng()
    );
    this.params.glowColor = [this.params.color.r * 255, this.params.color.g * 255, this.params.color.b * 255];

    this.updateMaterial();
  }
}
