import * as THREE from 'three'

import vertShader from '!raw-loader!glslify-loader!../shaders/atmosRing.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/atmosRing.frag'

export default class AtmosphereRing extends THREE.Object3D{

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

    // Used for the atmosphere shader
    this.atmosphereUniforms = {
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
    };

    this.mat = new THREE.ShaderMaterial({
      uniforms: this.atmosphereUniforms,
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

  update() {
    this.updateUniforms();
  }

  updateUniforms() {
    let cameraHeight = window.camera.position.length();
    this.atmosphereUniforms.fCameraHeight.value = cameraHeight;
    this.atmosphereUniforms.fCameraHeight2.value = cameraHeight * cameraHeight;
    this.atmosphereUniforms.v3InvWavelength.value = new THREE.Vector3(1 / Math.pow(this.settings.color.r, 4), 1 / Math.pow(this.settings.color.g, 4), 1 / Math.pow(this.settings.color.b, 4));
    this.atmosphereUniforms.level.value = window.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
  }
}

