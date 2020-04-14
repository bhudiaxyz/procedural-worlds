import * as THREE from 'three'

import shaderVert from '!raw-loader!glslify-loader!../shaders/glow.vert'
import shaderFrag from '!raw-loader!glslify-loader!../shaders/glow.frag'

export default class Glow extends THREE.Object3D {

  constructor() {
    super();

    this.size = 1030;
    this.settings = {
      glow: 1.0,
      c: 0.33,
      p: 1.27,
      color: new THREE.Color(0x55ffff)
    };

    let glowFolder = window.gui.addFolder('Glow');
    glowFolder.add(this.settings, "glow", 0.0, 1.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    glowFolder.addColor(this.settings, "color").onChange(value => {
      this.updateMaterial();
    });

    glowFolder.add(this.settings, "c", 0, 1).step(0.01).onChange(value => {
      this.updateMaterial();
    });
    glowFolder.add(this.settings, "p", 0, 6).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    this.mat = new THREE.ShaderMaterial({
      vertexShader: shaderVert,
      fragmentShader: shaderFrag,
      uniforms: {
        c: {type: "f", value: this.settings.c},
        p: {type: "f", value: this.settings.p},
        glowColor: {type: "c", value: this.settings.color},
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

  update() {
    this.mat.uniforms.viewVector.value.subVectors(window.camera.position, this.sphere.position);
  }

  updateMaterial() {
    this.mat.uniforms.c.value = this.settings.c;
    this.mat.uniforms.p.value = this.settings.p;
    this.mat.uniforms.glowColor.value = this.settings.color;
  }

  randomize() {
    this.settings.glow = this.randRange(0.25, 1.0);
    this.randomizeColor();
  }

  randomizeColor() {
    this.settings.color.setRGB(
      window.rng(),
      window.rng(),
      window.rng()
    );

    this.updateMaterial();
  }
}

