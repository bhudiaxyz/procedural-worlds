import * as THREE from 'three';

import ColorGUIHelper from "../utils/ColorGUIHelper";

import vertShader from '!raw-loader!glslify-loader!../shaders/glow.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/glow.frag'

export default class Glow extends THREE.Object3D {

  constructor(radius = 1030.0) {
    super();

    this.radius = radius;

    this.params = {
      visible: true,
      color: new THREE.Color(0x55ffff),
      glow: 1.0,
      c: 0.41,
      p: 0.53
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        c: {type: "f", value: this.params.c},
        p: {type: "f", value: this.params.p},
        glowColor: {type: "c", value: this.params.color},
        viewVector: {type: "v3", value: new THREE.Vector3(window.camera.position)}
      },
      vertexShader: vertShader,
      fragmentShader: fragShader
    });

    this.material.transparent = true;
    this.material.blending = THREE.AdditiveBlending;
    this.material.side = THREE.BackSide;

    this.geometry = new THREE.IcosahedronBufferGeometry(this.radius, 6);
    this.sphere = new THREE.Mesh(this.geometry, this.material);
    // this.sphere.scale.set(this.radius, this.radius, this.radius);
    this.add(this.sphere);

    this.createControls();
  }

  createControls() {
    let glowFolder = window.gui.addFolder('Glow');

    glowFolder.add(this.params, "visible").onChange(value => {
      this.sphere.visible = value;
    });

    glowFolder.add(this.params, "glow", 0.0, 1.0).step(0.01).listen().onChange(value => {
      this.updateMaterial();
    });

    glowFolder.addColor(new ColorGUIHelper(this.params, "color"), "color").listen().onChange(value => {
      this.updateMaterial();
    });

    glowFolder.add(this.params, "c", 0, 1).step(0.01).listen().onChange(value => {
      this.updateMaterial();
    });
    glowFolder.add(this.params, "p", 0, 1).step(0.01).listen().onChange(value => {
      this.updateMaterial();
    });

  }

  update() {
    this.material.uniforms.viewVector.value.subVectors(window.camera.position, this.sphere.position);
  }

  updateMaterial() {
    this.material.uniforms.c.value = this.params.c;
    this.material.uniforms.p.value = this.params.p;
    this.material.uniforms.glowColor.value = this.params.color;
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  randomizeColor() {
    this.params.color.setRGB(
      this.randRange(0.2, 0.8),
      this.randRange(0.2, 0.8),
      this.randRange(0.2, 0.8)
    );

    this.updateMaterial();
  }

  randomize() {
    this.params.glow = this.randRange(0.25, 1.0);
    this.params.c = this.randRange(0.4, 1.0);
    this.params.p = this.randRange(0.4, 1.0);

    this.randomizeColor();
  }
}

