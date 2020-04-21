import * as THREE from 'three';

import vertShader from '!raw-loader!glslify-loader!../shaders/atmosRing.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/atmosRing.frag'

export default class AtmosphereRing extends THREE.Object3D {

  constructor() {
    super();

    this.radius = 1030;

    this.params = {
      color: new THREE.Color(0.72, 0.27, 0.35),
      Kr: 0.0025,
      Km: 0.0010,
      ESun: 20.0,
      g: -0.950,
      innerRadius: 1000,
      outerRadius: this.radius,
      wavelength: [0.650, 0.570, 0.475],
      scaleDepth: 0.25,
      mieScaleDepth: 0.1
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        v3LightPosition: {type: "v3", value: new THREE.Vector3(-1, 1, 1)},
        v3InvWavelength: {type: "v3", value: new THREE.Vector3(1 / Math.pow(this.params.wavelength[0], 4), 1 / Math.pow(this.params.wavelength[1], 4), 1 / Math.pow(this.params.wavelength[2], 4))},
        fCameraHeight: {type: "f", value: 0},
        fCameraHeight2: {type: "f", value: 0},
        fInnerRadius: {type: "f", value: this.params.innerRadius},
        fInnerRadius2: {type: "f", value: this.params.innerRadius * this.params.innerRadius},
        fOuterRadius: {type: "f", value: this.params.outerRadius},
        fOuterRadius2: {type: "f", value: this.params.outerRadius * this.params.outerRadius},
        fKrESun: {type: "f", value: this.params.Kr * this.params.ESun},
        fKmESun: {type: "f", value: this.params.Km * this.params.ESun},
        fKr4PI: {type: "f", value: this.params.Kr * 4.0 * Math.PI},
        fKm4PI: {type: "f", value: this.params.Km * 4.0 * Math.PI},
        fScale: {type: "f", value: 1 / (this.params.outerRadius - this.params.innerRadius)},
        fScaleDepth: {type: "f", value: this.params.scaleDepth},
        fScaleOverScaleDepth: {type: "f", value: 1 / (this.params.outerRadius - this.params.innerRadius) / this.params.scaleDepth},
        g: {type: "f", value: this.params.g},
        g2: {type: "f", value: this.params.g * this.params.g},
        nSamples: {type: "i", value: 3},
        fSamples: {type: "f", value: 3.0},
        atmosphereColor: {type: "v3", value: new THREE.Vector4(this.params.color.r, this.params.color.g, this.params.color.b, 1)},
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

    this.geometry = new THREE.IcosahedronGeometry(this.radius, 6);
    this.sphere = new THREE.Mesh(this.geometry, this.material);
    // this.sphere.scale.set(this.radius, this.radius, this.radius);
    this.add(this.sphere);

    this.createControls();
  }

  createControls() {
    let atmosRingFolder = window.gui.addFolder('Atmosphere Ring');

    this.params.atmosRingColor = [this.params.color.r * 255, this.params.color.g * 255, this.params.color.b * 255];
    atmosRingFolder.addColor(this.params, "atmosRingColor").name('color').onChange(value => {
      this.params.color.r = value[0] / 255;
      this.params.color.g = value[1] / 255;
      this.params.color.b = value[2] / 255;
      this.updateMaterial();
    });

    const atmosRingFields = ["Kr", "Km", "scaleDepth", "mieScaleDepth"];
    for (let i = 0; i < atmosRingFields.length; i++) {
      atmosRingFolder.add(this.params, atmosRingFields[i], 0.0, 1.0).step(0.001).onChange(value => {
        this.updateMaterial();
      });
    }

    atmosRingFolder.add(this.params, "g", -1.0, 1.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });

    atmosRingFolder.add(this.params, "ESun", -100.0, 100.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });

  }

  update() {
    this.updateMaterial();
  }

  updateMaterial() {
    this.material.uniforms.atmosphereColor.value.set(this.params.color.r, this.params.color.g, this.params.color.b, 1.0);
    this.material.uniforms.fKrESun.value = this.params.Kr * this.params.ESun;
    this.material.uniforms.fKmESun.value = this.params.Km * this.params.ESun;
    this.material.uniforms.fKr4PI.value = this.params.Kr * 4.0 * Math.PI;
    this.material.uniforms.fKm4PI.value = this.params.Km * 4.0 * Math.PI;
    this.material.uniforms.fScaleDepth.value = this.params.scaleDepth;
    this.material.uniforms.fScaleOverScaleDepth.value = 1 / (this.params.outerRadius - this.params.innerRadius) / this.params.scaleDepth;
    this.material.uniforms.g.value = this.params.g;
    this.material.uniforms.g2.value = this.params.g * this.params.g;

    let cameraHeight = window.camera.position.length();
    this.material.uniforms.fCameraHeight.value = cameraHeight;
    this.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;
    this.material.uniforms.v3InvWavelength.value = new THREE.Vector3(1 / Math.pow(this.params.color.r, 4), 1 / Math.pow(this.params.color.g, 4), 1 / Math.pow(this.params.color.b, 4));
    this.material.uniforms.level.value = window.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
    this.params.color.setRGB(
      this.randRange(0.3, 1.0),
      this.randRange(0.3, 1.0),
      this.randRange(0.3, 1.0)
    );
    this.params.atmosRingColor = [this.params.color.r * 255, this.params.color.g * 255, this.params.color.b * 255];

    this.updateMaterial();
  }
}

