import * as THREE from 'three';
import NebulaEnvMap from '../tools/NebulaEnvMap'
import NebulaTexture from "../tools/NebulaTexture";

export default class Nebula extends THREE.Object3D {

  constructor() {
    super();

    this.resolution = 1024;
    this.radius = 45000;

    this.params = {
      rotate: true,
      rotationSpeed: 0.0002,
      res1: this.randRange(1.0, 3.0),
      res2: this.randRange(1.0, 3.0),
      resMix: this.randRange(1.0, 3.0),
      mixScale: this.randRange(1.0, 3.0),
      opacity: 1.0,
      showNebulaMap: false
    };

    this.nebulaTexture = new NebulaTexture();
    this.skyMap = new NebulaEnvMap();
    this.skyMaps = this.skyMap.maps;

    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xFFFFFF),
        side: THREE.BackSide,
        transparent: true,
        opacity: this.params.opacity
      }));
    }

    this.geometry = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
    for (var i in this.geometry.vertices) {
      this.geometry.vertices[i].normalize().multiplyScalar(this.radius);
    }
    this.computeGeometry(this.geometry);
    this.sphere = new THREE.Mesh(this.geometry, this.materials);
    this.add(this.sphere);

    this.createControls();
  }

  createControls() {
    let nebulaFolder = window.gui.addFolder('Nebula');

    nebulaFolder.add(this.params, "rotate");
    nebulaFolder.add(this.params, 'rotationSpeed', -0.01, 0.01);
    nebulaFolder.add(this.params, "opacity", 0.0, 1.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    const nebulaFields = ["res1", "res2", "resMix", "mixScale"];
    for (let i = 0; i < nebulaFields.length; ++i) {
      nebulaFolder.add(this.params, nebulaFields[i], 1.0, 3.0).step(0.001);
    }

    nebulaFolder.add(this.params, "showNebulaMap").onChange(value => {
      if (this.nebulaTexture) {
        this.nebulaTexture.toggleCanvasDisplay(value);
      }
    });
  }

  update() {
    if (this.params.rotate) {
      this.rotation.y += this.params.rotationSpeed;
    }
  }

  generateTexture() {
    this.nebulaTexture.generateTexture();
  }

  render(props = {}) {
    this.seed = this.randRange(0, 1000);

    this.skyMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.params.res1,
      res2: this.params.res2,
      resMix: this.params.resMix,
      mixScale: this.params.mixScale,
      nebulaMap: this.nebulaTexture.texture
    });

    this.updateMaterial();
  }

  updateMaterial() {
    for (let i = 0; i < 6; ++i) {
      let material = this.materials[i];
      material.map = this.skyMaps[i];
      material.opacity = this.params.opacity;
    }
  }


  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  computeGeometry(geometry) {
    // geometry.makeGroups();
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    geometry.computeMorphNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    // geometry.computeLineDistances();

    geometry.verticesNeedUpdate = true;
    geometry.elementsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    // geometry.tangentsNeedUpdate = true;
    geometry.colorsNeedUpdate = true;
    geometry.lineDistancesNeedUpdate = true;
    // geometry.buffersNeedUpdate = true;
    geometry.groupsNeedUpdate = true;
  }

}
