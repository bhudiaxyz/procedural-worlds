import * as THREE from 'three'

import vertShader from '!raw-loader!glslify-loader!../shaders/planet.vert';
import fragShader from '!raw-loader!glslify-loader!../shaders/atmos.frag';

export default class Atmosphere extends THREE.Object3D {

  constructor(random) {
    super();
    this.random = random;
    this.time = 0.0;
    this.atmo1 = 0.5;
    this.atmo2 = 0.5;
    this.atmo3 = 1.0;
    this.atmo4 = 0.5;
    this.atmo5 = 0.1;

    this.color = new THREE.Color(0x00ffff);
    this.size = 1002;
    this.atmosphere = 0.3;

    this.mat = new THREE.ShaderMaterial({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        "time" : {type: "f", value: this.time},
        "atmo1" : {type: "f", value: this.atmo1},
        "atmo2" : {type: "f", value: this.atmo2},
        "atmo3" : {type: "f", value: this.atmo3},
        "atmo4" : {type: "f", value: this.atmo4},
        "atmo5" : {type: "f", value: this.atmo5},
        "alpha" : {type: "f", value: this.atmosphere},
        "color" : {type: "c", value: this.color}
      }
    });

    this.mat.transparent = true;
    this.mat.blending = THREE.AdditiveBlending;
    // this.mat.side = THREE.DoubleSide;
    // this.mat = new THREE.MeshStandardMaterial({color: 0xFFFFFF});

    this.geo = new THREE.IcosahedronBufferGeometry(1, 6);
    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.scale.set(this.size, this.size, this.size);
    this.add(this.mesh);
  }

  update() {
    this.time += this.speed;
    this.mat.uniforms.time.value = this.time;
    this.mat.uniforms.atmo1.value = this.atmo1;
    this.mat.uniforms.atmo2.value = this.atmo2;
    this.mat.uniforms.atmo3.value = this.atmo3;
    this.mat.uniforms.atmo4.value = this.atmo4;
    this.mat.uniforms.atmo5.value = this.atmo5;
    this.mat.uniforms.alpha.value = this.atmosphere;
    this.mat.uniforms.color.value = this.color;
  }

  randomize() {
    this.randomizeColor();

  }

  randomizeColor() {
    this.color = new THREE.Color();

    this.color.r = this.randRange(0.5, 1.0);
    this.color.g = this.randRange(0.5, 1.0);
    this.color.b = this.randRange(0.5, 1.0);

    this.mat.uniforms.color.value = this.color;
  }

  randRange(low, high) {
    let range = high - low;
    let n = this.random() * range;
    return low + n;
  }
}

