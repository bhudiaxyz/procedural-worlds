// @ts-nocheck
import * as THREE from 'three';
import StarEnvMap from '../tools/StarEnvMap'

export default class Stars extends THREE.Object3D {

  constructor() {
    super();

    this.resolution = 1024;
    this.radius = 50000;

    this.params = {
      visible: true,
      rotate: true,
      rotationSpeed: 0.0003,
      res1: this.randRange(0.5, 2.0),
      res2: this.randRange(0.5, 2.0),
      resMix: this.randRange(0.5, 2.0),
      mixScale: this.randRange(0.5, 2.0),
      opacity: 1.0
    };

    this.starMap = new StarEnvMap();
    this.starMaps = this.starMap.maps;

    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xFFFFFF),
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
    this.computeGeometry(this.geometry);
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

    const starFields = ["res1", "res2", "resMix", "mixScale"];
    for (let i = 0; i < starFields.length; ++i) {
      starsFolder.add(this.params, starFields[i], 0.5, 2.0).step(0.001).listen().onChange(value => {
        this.updateMaterial();
      });
    }
  }

  update() {
    if (this.params.rotate) {
      this.rotation.y += this.params.rotationSpeed;
    }
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  render(props) {
    this.seed = this.randRange(0, 1000);
    this.updateMaterial();

    this.starMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.params.res1,
      res2: this.params.res2,
      resMix: this.params.resMix,
      mixScale: this.params.mixScale,
      nebulaMap: props.nebulaMap
    });
  }

  updateMaterial() {
    for (let i = 0; i < 6; ++i) {
      let material = this.materials[i];
      material.map = this.starMaps[i];
    }
  }

  computeGeometry(geometry) {
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
  }

}
