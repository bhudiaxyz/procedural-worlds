import * as THREE from 'three';

import vertShader from '!raw-loader!glslify-loader!../shaders/atmosRing.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/atmosRing.frag'

export default class AtmosphereRing extends THREE.Object3D {

  constructor() {
    super();

    this.size = 1030;
    this.clock = new THREE.Clock();

    this.settings = {
      Kr: 0.0025,
      Km: 0.0010,
      ESun: 20.0,
      g: -0.950,
      innerRadius: 1000,
      outerRadius: this.size,
      wavelength: [0.650, 0.570, 0.475],
      scaleDepth: 0.25,
      mieScaleDepth: 0.1,
      color: new THREE.Color(0.72, 0.27, 0.35)
    };

    this.createControls();

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        v3LightPosition: {type: "v3", value: new THREE.Vector3(-1, 1, 1)},
        v3InvWavelength: {type: "v3", value: new THREE.Vector3(1 / Math.pow(this.settings.wavelength[0], 4), 1 / Math.pow(this.settings.wavelength[1], 4), 1 / Math.pow(this.settings.wavelength[2], 4))},
        fCameraHeight: {type: "f", value: 0},
        fCameraHeight2: {type: "f", value: 0},
        fInnerRadius: {type: "f", value: this.settings.innerRadius},
        fInnerRadius2: {type: "f", value: this.settings.innerRadius * this.settings.innerRadius},
        fOuterRadius: {type: "f", value: this.settings.outerRadius},
        fOuterRadius2: {type: "f", value: this.settings.outerRadius * this.settings.outerRadius},
        fKrESun: {type: "f", value: this.settings.Kr * this.settings.ESun},
        fKmESun: {type: "f", value: this.settings.Km * this.settings.ESun},
        fKr4PI: {type: "f", value: this.settings.Kr * 4.0 * Math.PI},
        fKm4PI: {type: "f", value: this.settings.Km * 4.0 * Math.PI},
        fScale: {type: "f", value: 1 / (this.settings.outerRadius - this.settings.innerRadius)},
        fScaleDepth: {type: "f", value: this.settings.scaleDepth},
        fScaleOverScaleDepth: {type: "f", value: 1 / (this.settings.outerRadius - this.settings.innerRadius) / this.settings.scaleDepth},
        g: {type: "f", value: this.settings.g},
        g2: {type: "f", value: this.settings.g * this.settings.g},
        nSamples: {type: "i", value: 3},
        fSamples: {type: "f", value: 3.0},
        atmosphereColor: {type: "v3", value: new THREE.Vector4(this.settings.color.r, this.settings.color.g, this.settings.color.b, 1)},
        tDisplacement: {type: "t", value: 0},
        tSkyboxDiffuse: {type: "t", value: 0},
        fNightScale: {type: "f", value: 1},
        level: {type: "f", value: window.camera.position.length()}
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true,
      side: THREE.BackSide
    });

    this.geo = new THREE.IcosahedronGeometry(this.size, 6);
    this.sphere = new THREE.Mesh(this.geo, this.mat);
    // this.sphere.scale.set(this.size, this.size, this.size);

    this.add(this.sphere);
  }

  createControls() {
    let atmosRingFolder = window.gui.addFolder('Atmosphere Ring');

    this.settings.atmosRingColor = [this.settings.color.r * 255, this.settings.color.g * 255, this.settings.color.b * 255];
    atmosRingFolder.addColor(this.settings, "atmosRingColor").name('color').onChange(value => {
      this.settings.color.r = value[0] / 255;
      this.settings.color.g = value[1] / 255;
      this.settings.color.b = value[2] / 255;
      this.updateMaterial();
    });

    atmosRingFolder.add(this.settings, "Kr", 0.0, 1.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });

    atmosRingFolder.add(this.settings, "Km", 0.0, 1.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });

    atmosRingFolder.add(this.settings, "g", -1.0, 1.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });

    atmosRingFolder.add(this.settings, "ESun", -100.0, 100.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });

    atmosRingFolder.add(this.settings, "scaleDepth", 0.0, 1.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });

    atmosRingFolder.add(this.settings, "mieScaleDepth", 0.0, 1.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });
  }

  update() {
    this.updateMaterial();
  }

  updateMaterial() {
    this.mat.uniforms.atmosphereColor.value.set(this.settings.color.r, this.settings.color.g, this.settings.color.b, 1.0);
    this.mat.uniforms.fKrESun.value = this.settings.Kr * this.settings.ESun;
    this.mat.uniforms.fKmESun.value = this.settings.Km * this.settings.ESun;
    this.mat.uniforms.fKr4PI.value = this.settings.Kr * 4.0 * Math.PI;
    this.mat.uniforms.fKm4PI.value = this.settings.Km * 4.0 * Math.PI;
    this.mat.uniforms.fScaleDepth.value = this.settings.scaleDepth;
    this.mat.uniforms.fScaleOverScaleDepth.value = 1 / (this.settings.outerRadius - this.settings.innerRadius) / this.settings.scaleDepth;
    this.mat.uniforms.g.value = this.settings.g;
    this.mat.uniforms.g2.value = this.settings.g * this.settings.g;

    let cameraHeight = window.camera.position.length();
    this.mat.uniforms.fCameraHeight.value = cameraHeight;
    this.mat.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;
    this.mat.uniforms.v3InvWavelength.value = new THREE.Vector3(1 / Math.pow(this.settings.color.r, 4), 1 / Math.pow(this.settings.color.g, 4), 1 / Math.pow(this.settings.color.b, 4));
    this.mat.uniforms.level.value = window.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  randomize() {
    this.randomizeColor();
  }

  randomizeColor() {
    this.settings.color.setRGB(
      this.randRange(0.3, 1.0),
      this.randRange(0.3, 1.0),
      this.randRange(0.3, 1.0)
    );
    this.settings.atmosRingColor = [this.settings.color.r * 255, this.settings.color.g * 255, this.settings.color.b * 255];

    this.updateMaterial();
  }
}

