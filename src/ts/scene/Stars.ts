// @ts-nocheck
import * as THREE from 'three';

import vertShader from '!raw-loader!../shaders/stars.vert'
import fragShader from '!raw-loader!../shaders/stars.frag'

export default class Stars extends THREE.Object3D {

  constructor() {
    super();

    this.radius = 50000;
    this.time = 0.0;

    this.params = {
      visible: true,
      rotate: true,
      rotationSpeed: 0.0003,
    };

    // 6 materials — one per BoxGeometry face, each with a different seed offset
    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.ShaderMaterial({
        uniforms: {
          seed: { value: i * 73.137 },
          time: { value: 0.0 },
        },
        vertexShader:   vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite:  false,
        side: THREE.BackSide,
      }));
    }

    this.geometry = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
    const pos = this.geometry.attributes.position.array;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.length; i += 3) {
      v.set(pos[i], pos[i + 1], pos[i + 2]).normalize().multiplyScalar(this.radius);
      pos[i] = v.x; pos[i + 1] = v.y; pos[i + 2] = v.z;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
    this.sphere = new THREE.Mesh(this.geometry, this.materials);
    this.add(this.sphere);

    this.createControls();
  }

  createControls() {
    let starsFolder = window.gui.addFolder('Stars');
    starsFolder.add(this.params, "visible").onChange(value => {
      this.sphere.visible = value;
    });
    starsFolder.add(this.params, "rotate");
    starsFolder.add(this.params, 'rotationSpeed', -0.01, 0.01);
  }

  update() {
    if (this.params.rotate) {
      this.rotation.y += this.params.rotationSpeed;
    }
    this.time += 0.005;
    for (let i = 0; i < 6; ++i) {
      this.materials[i].uniforms.time.value = this.time;
    }
  }

  render(props) {
    // Reseed star pattern on each generate
    const seed = Math.random() * 1000;
    for (let i = 0; i < 6; ++i) {
      this.materials[i].uniforms.seed.value = seed + i * 73.137;
    }
  }

  randRange(low, high) {
    let range = high - low;
    return low + Math.random() * range;
  }
}
