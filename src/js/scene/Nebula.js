import * as THREE from 'three';
import NebulaMap from '../tools/NebulaMap'
import NebulaeGradient from "../tools/NebulaeGradient";

export default class Nebula extends THREE.Object3D {

  constructor() {
    super();

    this.materials = [];
    this.skyMaps = [];

    this.resolution = 1024;
    this.size = 45000;

    this.params = {
      speed: 0.1,
      res1: this.randRange(1.0, 3.0),
      res2: this.randRange(1.0, 3.0),
      resMix: this.randRange(1.0, 3.0),
      mixScale: this.randRange(1.0, 3.0),
      opacity: 1.0,
      showNebulaMap: false
    };
    this.nebulaeGradient = new NebulaeGradient();

    this.createControls();

    this.setup();
  }

  createControls() {
    let nebulaFolder = window.gui.addFolder('Nebula');

    nebulaFolder.add(this.params, "opacity", 0.0, 1.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    nebulaFolder.add(this.params, "res1", 1.0, 3.0).step(0.001);
    nebulaFolder.add(this.params, "res2", 1.0, 3.0).step(0.001);
    nebulaFolder.add(this.params, "resMix", 1.0, 3.0).step(0.001);
    nebulaFolder.add(this.params, "mixScale", 1.0, 3.0).step(0.001);

    nebulaFolder.add(this.params, "showNebulaMap").onChange(value => {
      if (this.nebulaeGradient) {
        this.nebulaeGradient.toggleCanvasDisplay(value);
      }
    });
  }

  update() {
    // No-op
  }

  setup() {
    this.skyMap = new NebulaMap();
    this.skyMaps = this.skyMap.maps;

    for (let i = 0; i < 6; i++) {
      let material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xFFFFFF),
        side: THREE.BackSide,
        transparent: true,
        opacity: this.params.opacity
      });
      this.materials[i] = material;
    }

    let geo = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
    let radius = this.size;
    for (var i in geo.vertices) {
      var vertex = geo.vertices[i];
      vertex.normalize().multiplyScalar(radius);
    }
    this.computeGeometry(geo);
    this.sphere = new THREE.Mesh(geo, this.materials);

    this.add(this.sphere);
  }

  generateTexture() {
    this.nebulaeGradient.generateTexture();
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
      nebulaeMap: this.nebulaeGradient.texture
    });

    this.updateMaterial();
  }

  updateMaterial() {
    for (let i = 0; i < 6; i++) {
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
