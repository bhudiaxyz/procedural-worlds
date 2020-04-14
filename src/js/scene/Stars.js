import * as THREE from 'three'
import StarMap from '../tools/StarMap'

export default class Stars extends THREE.Object3D{

  constructor() {
    super();

    this.materials = [];
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.emissiveIntensity = 1.0;

    this.resolution = 1024;
    this.size = 50000;

    this.settings = {
      speed: 0.1,
      res1: this.randRange(0.5, 2.0),
      res2: this.randRange(0.5, 2.0),
      resMix: this.randRange(0.5, 2.0),
      mixScale: this.randRange(0.5, 2.0),
      opacity: 1.0
    };

    let starsFolder = window.gui.addFolder('Stars');

    starsFolder.add(this.settings, "res1", 0.5, 2.0).step(0.001);
    starsFolder.add(this.settings, "res2", 0.5, 2.00).step(0.001);
    starsFolder.add(this.settings, "resMix", 0.5, 2.0).step(0.001);
    starsFolder.add(this.settings, "mixScale", 0.5, 2.0).step(0.001);

    this.starMaps = [];

    this.setup();
  }

  update() {
    // No-op
  }

  setup() {
    this.starMap = new StarMap();
    this.starMaps = this.starMap.maps;

    for (let i = 0; i < 6; i++) {
      let material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xFFFFFF),
        side: THREE.BackSide,
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

  render(props) {
    this.seed = this.randRange(0, 1000);

    this.starMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.settings.res1,
      res2: this.settings.res2,
      resMix: this.settings.resMix,
      mixScale: this.settings.mixScale,
      nebulaeMap: props.nebulaeMap
    });

    this.updateMaterial();
  }

  updateMaterial() {
    for (let i = 0; i < 6; i++) {
      let material = this.materials[i];
      material.map = this.starMaps[i];
    }
  }


  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  computeGeometry(geometry) {
    // geometry.makeGroups();
    geometry.computeVertexNormals()
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
