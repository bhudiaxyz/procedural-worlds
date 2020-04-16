import * as THREE from 'three';

import shaderVert from '!raw-loader!glslify-loader!../shaders/planet.vert'
import shaderFrag from '!raw-loader!glslify-loader!../shaders/atmos.frag'

export default class Atmosphere extends THREE.Object3D {

  constructor() {
    super();

    this.time = 0.0;
    this.size = 1002;

    this.params = {
      speed: 0.1,
      atmo1: 0.5,
      atmo2: 0.5,
      atmo3: 1.0,
      atmo4: 0.5,
      atmo5: 0.1,
      color: new THREE.Color(0x00ffff),
      opacity: 0.3
    };

    this.createControls();

    this.mat = new THREE.ShaderMaterial({
      vertexShader: shaderVert,
      fragmentShader: shaderFrag,
      uniforms: {
        "time": {type: "f", value: this.time},
        "atmo1": {type: "f", value: this.params.atmo1},
        "atmo2": {type: "f", value: this.params.atmo2},
        "atmo3": {type: "f", value: this.params.atmo3},
        "atmo4": {type: "f", value: this.params.atmo4},
        "atmo5": {type: "f", value: this.params.atmo5},
        "alpha": {type: "f", value: this.params.opacity},
        "color": {type: "c", value: this.params.color}
      }
    });

    this.mat.transparent = true;
    this.mat.blending = THREE.AdditiveBlending;
    this.geo = new THREE.IcosahedronBufferGeometry(1, 6);
    this.sphere = new THREE.Mesh(this.geo, this.mat);
    this.sphere.scale.set(this.size, this.size, this.size);

    this.add(this.sphere);
  }

  createControls() {
    let atmosFolder = window.gui.addFolder('Atmosphere');

    this.params.atmosColor = [this.params.color.r * 255, this.params.color.g * 255, this.params.color.b * 255];
    atmosFolder.addColor(this.params, "atmosColor").name('color').onChange(value => {
      this.params.color.r = value[0] / 255;
      this.params.color.g = value[1] / 255;
      this.params.color.b = value[2] / 255;
      this.updateMaterial();
    });

    atmosFolder.add(this.params, "opacity", 0.0, 1.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    atmosFolder.add(this.params, "atmo1", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    atmosFolder.add(this.params, "atmo2", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    atmosFolder.add(this.params, "atmo3", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    atmosFolder.add(this.params, "atmo4", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    atmosFolder.add(this.params, "atmo5", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
  }

  update() {
    this.time += this.speed;
  }

  updateMaterial() {
    this.mat.uniforms.time.value = this.time;
    this.mat.uniforms.atmo1.value = this.params.atmo1;
    this.mat.uniforms.atmo2.value = this.params.atmo2;
    this.mat.uniforms.atmo3.value = this.params.atmo3;
    this.mat.uniforms.atmo4.value = this.params.atmo4;
    this.mat.uniforms.atmo5.value = this.params.atmo5;
    this.mat.uniforms.alpha.value = this.params.opacity;
    this.mat.uniforms.color.value = this.params.color;
  }

  randomizeColor() {
    this.params.color.setRGB(
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0)
    );
    this.params.atmosColor = [this.params.color.r * 255, this.params.color.g * 255, this.params.color.b * 255];

    this.updateMaterial();
  }

  randomize() {
    this.params.atmo1 = this.randRange(0.0, 3.0);
    this.params.atmo2 = this.randRange(0.0, 3.0);
    this.params.atmo3 = this.randRange(0.0, 3.0);
    this.params.atmo4 = this.randRange(0.0, 3.0);
    this.params.atmo5 = this.randRange(0.0, 3.0);

    this.randomizeColor();
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }
}
