import * as THREE from 'three';

import ColorGUIHelper from "../utils/ColorGUIHelper";

import vertShader from '!raw-loader!glslify-loader!../shaders/atmosRing.vert'
import fragShader from '!raw-loader!glslify-loader!../shaders/atmosRing.frag'


export default class AtmosphereRing extends THREE.Object3D {

  constructor(radius = 1030.0) {
    super();

    this.radius = radius;

    this.params = {
      visible: true,
      color: new THREE.Color(0.650, 0.570, 0.475),
      Kr: 0.0025,
      Km: 0.0010,
      ESun: 20.0,
      g: -0.950,
      innerRadius: 1000,
      outerRadius: this.radius,
      scaleDepth: 0.25,
      mieScaleDepth: 0.1
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        v3LightPosition: {type: "v3", value: new THREE.Vector3(window.light.position.x, window.light.position.y, window.light.position.z).multiplyScalar(radius)},
        v3InvWavelength: {type: "v3", value: new THREE.Vector3(1 / Math.pow(this.params.color.r, 4), 1 / Math.pow(this.params.color.g, 4), 1 / Math.pow(this.params.color.b, 4))},
        fInnerRadius: {type: "f", value: this.params.innerRadius},
        fOuterRadius: {type: "f", value: this.params.outerRadius},
        fKrESun: {type: "f", value: this.params.Kr * this.params.ESun},
        fKmESun: {type: "f", value: this.params.Km * this.params.ESun},
        fKr4PI: {type: "f", value: this.params.Kr * 4.0 * Math.PI},
        fKm4PI: {type: "f", value: this.params.Km * 4.0 * Math.PI},
        fScale: {type: "f", value: 1 / (this.params.outerRadius - this.params.innerRadius)},
        fScaleDepth: {type: "f", value: this.params.scaleDepth},
        fScaleOverScaleDepth: {type: "f", value: 1 / (this.params.outerRadius - this.params.innerRadius) / this.params.scaleDepth},
        g: {type: "f", value: this.params.g},
        g2: {type: "f", value: this.params.g * this.params.g},
        fCameraHeight: {type: "f", value: window.camera.position.length()}
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });

    this.geometry = new THREE.IcosahedronGeometry(this.radius, 6);
    this.sphere = new THREE.Mesh(this.geometry, this.material);
    // this.sphere.scale.set(this.radius, this.radius, this.radius);
    this.add(this.sphere);

    this.createControls();
  }

  createControls() {
    let atmosRingFolder = window.gui.addFolder('Atmosphere Ring');

    atmosRingFolder.add(this.params, "visible").onChange(value => {
      this.sphere.visible = value;
    });

    atmosRingFolder.addColor(new ColorGUIHelper(this.params, "color"), "color").listen().onChange(value => {
      this.updateMaterial();
    });

    const atmosRingFields = ["Kr", "Km", "scaleDepth", "mieScaleDepth"];
    for (let i = 0; i < atmosRingFields.length; ++i) {
      atmosRingFolder.add(this.params, atmosRingFields[i], 0.0, 1.0).step(0.001).listen().onChange(value => {
        this.updateMaterial();
      });
    }

    atmosRingFolder.add(this.params, "g", -1.0, 1.0).step(0.001).listen().onChange(value => {
      this.updateMaterial();
    });

    atmosRingFolder.add(this.params, "ESun", -2000.0, 2000.0).listen().onChange(value => {
      this.updateMaterial();
    });

  }

  update() {
    // No-op
  }

  updateMaterial() {
    this.material.uniforms.v3InvWavelength.value.set(1 / Math.pow(this.params.color.r, 4), 1 / Math.pow(this.params.color.g, 4), 1 / Math.pow(this.params.color.b, 4));
    this.material.uniforms.fKrESun.value = this.params.Kr * this.params.ESun;
    this.material.uniforms.fKmESun.value = this.params.Km * this.params.ESun;
    this.material.uniforms.fKr4PI.value = this.params.Kr * 4.0 * Math.PI;
    this.material.uniforms.fKm4PI.value = this.params.Km * 4.0 * Math.PI;
    this.material.uniforms.fScaleDepth.value = this.params.scaleDepth;
    this.material.uniforms.fScaleOverScaleDepth.value = 1 / (this.params.outerRadius - this.params.innerRadius) / this.params.scaleDepth;
    this.material.uniforms.g.value = this.params.g;
    this.material.uniforms.g2.value = this.params.g * this.params.g;
    this.material.uniforms.fCameraHeight.value = window.camera.position.length();
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  randomizeColor() {
    this.params.color.setRGB(
      this.randRange(0.3, 1.0),
      this.randRange(0.3, 1.0),
      this.randRange(0.3, 1.0)
    );

    this.updateMaterial();
  }

  randomize() {
    this.params.Kr = this.randRange(0.01, 1.0);
    this.params.Km = this.randRange(0.01, 1.0);
    this.params.scaleDepth = this.randRange(0.0, 1.0);
    this.params.mieScaleDepth = this.randRange(0.01, 1.0);
    this.params.g = this.randRange(-1.0, 1.0);
    this.params.ESun = this.randRange(-100.0, 100.0);

    this.randomizeColor();
  }
}

