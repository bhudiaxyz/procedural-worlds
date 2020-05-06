import * as THREE from 'three';

import ColorGUIHelper from "../utils/ColorGUIHelper";

import vertShader from '!raw-loader!glslify-loader!../shaders/planet.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/atmos.frag'

export default class Atmosphere extends THREE.Object3D {

  constructor(radius = 1010.0) {
    super();

    this.radius = radius;
    this.time = 0.0;

    this.params = {
      visible: true,
      speed: 0.1,
      color: new THREE.Color(0x00ffff),
      opacity: 0.31,
      atmo1: 0.5,
      atmo2: 0.5,
      atmo3: 1.0,
      atmo4: 0.25,
      atmo5: 0.01
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        "time": {type: "f", value: this.time},
        "atmo1": {type: "f", value: this.params.atmo1},
        "atmo2": {type: "f", value: this.params.atmo2},
        "atmo3": {type: "f", value: this.params.atmo3},
        "atmo4": {type: "f", value: this.params.atmo4},
        "atmo5": {type: "f", value: this.params.atmo5},
        "alpha": {type: "f", value: this.params.opacity},
        "color": {type: "c", value: this.params.color}
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.geometry = new THREE.IcosahedronBufferGeometry(this.radius, 6);
    this.sphere = new THREE.Mesh(this.geometry, this.material);
    // this.sphere.scale.set(this.radius, this.radius, this.radius);
    this.add(this.sphere);

    this.createControls();
  }

  createControls() {
    let atmosFolder = window.gui.addFolder('Atmosphere');

    atmosFolder.add(this.params, "visible").onChange(value => {
      this.sphere.visible = value;
    });

    atmosFolder.addColor(new ColorGUIHelper(this.params, "color"), "color").listen().onChange(value => {
      this.updateMaterial();
    });

    atmosFolder.add(this.params, "opacity", 0.0, 1.0).step(0.01).listen().onChange(value => {
      this.updateMaterial();
    });

    const atmosFields = ["atmo1", "atmo2", "atmo3", "atmo4", "atmo5"];
    for (let i = 0; i < atmosFields.length; ++i) {
      atmosFolder.add(this.params, atmosFields[i], 0.0, 3.0).step(0.01).listen().onChange(value => {
        this.updateMaterial();
      });
    }
  }

  update() {
    this.time += this.params.speed;
  }

  updateMaterial() {
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.atmo1.value = this.params.atmo1;
    this.material.uniforms.atmo2.value = this.params.atmo2;
    this.material.uniforms.atmo3.value = this.params.atmo3;
    this.material.uniforms.atmo4.value = this.params.atmo4;
    this.material.uniforms.atmo5.value = this.params.atmo5;
    this.material.uniforms.alpha.value = this.params.opacity;
    this.material.uniforms.color.value = this.params.color;
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  randomizeColor() {
    this.params.color.setRGB(
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0)
    );

    this.updateMaterial();
  }

  randomize() {
    this.params.atmo1 = this.randRange(0.0, 1.0);
    this.params.atmo2 = this.randRange(0.0, 1.0);
    this.params.atmo3 = this.randRange(0.0, 1.0);
    this.params.atmo4 = this.randRange(0.0, 1.0);
    this.params.atmo5 = this.randRange(0.1, 2.0);

    this.randomizeColor();
  }
}

