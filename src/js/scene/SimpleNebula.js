import * as THREE from 'three';

import NebulaTexture from "../tools/NebulaTexture";

export default class SimpleNebula extends THREE.Object3D {
  constructor(
    random,
    radius = 45000.0,
    detail = 6,
    widthSegments = 64,
    heightSegments = 64
  ) {
    super();

    this.resolution = 1024;
    this.size = radius;

    this.params = {
      speed: 0.1,
      mixScale: this.randRange(1.0, 3.0),
      opacity: 1.0,
      showTextureMap: false
    };

    this.nebulaTexture = new NebulaTexture();
    this.generateTexture();

    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.MeshBasicMaterial({
        map: this.nebulaTexture.texture,
        side: THREE.BackSide,
        transparent: true,
        opacity: this.params.opacity
      }));
    }

    this.geometry = new THREE.BoxGeometry(10000, 10000, 10000);
    this.mesh = new THREE.Mesh(this.geometry, this.materials);
    this.add(this.mesh);

    this.createControls();
  }

  createControls() {
    let nebulaFolder = window.gui.addFolder('Nebula');

    nebulaFolder.add(this.params, "opacity", 0.0, 1.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    nebulaFolder.add(this.params, "showTextureMap").onChange(value => {
      if (this.nebulaTexture) {
        this.nebulaTexture.visibleCanvas(value);
      }
    });
  }

  generateTexture() {
    this.nebulaTexture.generateTexture();
  }

  updateMaterial() {
    for (let i = 0; i < 6; ++i) {
      this.materials[i].map = this.nebulaTexture.texture;
      this.materials[i].needsUpdate = true;
    }
  }

  render() {
    this.generateTexture();
    this.updateMaterial();
  }

  update(dt = 0) {
    this.rotation.y += 0.0003;
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }
};
