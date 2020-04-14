import * as THREE from 'three';

import shaderVert from '!raw-loader!glslify-loader!../shaders/planet.vert'
import shaderFrag from '!raw-loader!glslify-loader!../shaders/atmos.frag'

export default class Atmosphere extends THREE.Object3D {

  constructor() {
    super();

    this.time = 0.0;
    this.size = 1002;

    this.settings = {
      speed: 0.1,
      atmo1: 0.5,
      atmo2: 0.5,
      atmo3: 1.0,
      atmo4: 0.5,
      atmo5: 0.1,
      color: new THREE.Color(0x00ffff),
      opacity: 0.3
    };

    let atmosFolder = window.gui.addFolder('Atmosphere');

    atmosFolder.add(this.settings, "opacity", 0.0, 1.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    atmosFolder.addColor(this.settings, "color").onChange(value => {
      this.updateMaterial();
    });

    atmosFolder.add(this.settings, "atmo1", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    atmosFolder.add(this.settings, "atmo2", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    atmosFolder.add(this.settings, "atmo3", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    atmosFolder.add(this.settings, "atmo4", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    atmosFolder.add(this.settings, "atmo5", 0.0, 3.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });


    this.mat = new THREE.ShaderMaterial({
      vertexShader: shaderVert,
      fragmentShader: shaderFrag,
      uniforms: {
        "time": {type: "f", value: this.time},
        "atmo1": {type: "f", value: this.settings.atmo1},
        "atmo2": {type: "f", value: this.settings.atmo2},
        "atmo3": {type: "f", value: this.settings.atmo3},
        "atmo4": {type: "f", value: this.settings.atmo4},
        "atmo5": {type: "f", value: this.settings.atmo5},
        "alpha": {type: "f", value: this.settings.opacity},
        "color": {type: "c", value: this.settings.color}
      }
    });

    this.mat.transparent = true;
    this.mat.blending = THREE.AdditiveBlending;
    this.geo = new THREE.IcosahedronBufferGeometry(1, 6);
    this.sphere = new THREE.Mesh(this.geo, this.mat);
    this.sphere.scale.set(this.size, this.size, this.size);

    this.add(this.sphere);
  }

  update() {
    this.time += this.speed;
  }

  updateMaterial() {
    this.mat.uniforms.time.value = this.time;
    this.mat.uniforms.atmo1.value = this.settings.atmo1;
    this.mat.uniforms.atmo2.value = this.settings.atmo2;
    this.mat.uniforms.atmo3.value = this.settings.atmo3;
    this.mat.uniforms.atmo4.value = this.settings.atmo4;
    this.mat.uniforms.atmo5.value = this.settings.atmo5;
    this.mat.uniforms.alpha.value = this.settings.opacity;
    this.mat.uniforms.color.value = this.settings.color;
  }

  randomizeColor() {
    this.settings.color.setRGB(
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0)
    );

    this.updateMaterial();
  }

  randomize() {
    this.settings.atmo1 = this.randRange(0.0, 3.0);
    this.settings.atmo2 = this.randRange(0.0, 3.0);
    this.settings.atmo3 = this.randRange(0.0, 3.0);
    this.settings.atmo4 = this.randRange(0.0, 3.0);
    this.settings.atmo5 = this.randRange(0.0, 3.0);

    this.randomizeColor();
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }
}

