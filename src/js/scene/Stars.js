import * as THREE from 'three';
import StarMap from '../tools/StarMap'

export default class Stars extends THREE.Object3D {

  constructor() {
    super();

    this.materials = [];
    this.starMaps = [];
    this.resolution = 1024;
    this.radius = 50000;

    this.params = {
      rotate: true,
      rotationSpeed: 0.0003,
      res1: this.randRange(0.5, 2.0),
      res2: this.randRange(0.5, 2.0),
      resMix: this.randRange(0.5, 2.0),
      mixScale: this.randRange(0.5, 2.0),
      opacity: 1.0
    };

    this.createControls();

    this.starMap = new StarMap();
    this.starMaps = this.starMap.maps;

    this.materials = [];
    for (let i = 0; i < 6; i++) {
      this.materials.push(new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xFFFFFF),
        side: THREE.BackSide,
      }));
    }

    let geo = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
    for (var i in geo.vertices) {
      geo.vertices[i].normalize().multiplyScalar(this.radius);
    }
    this.computeGeometry(geo);
    this.sphere = new THREE.Mesh(geo, this.materials);

    this.add(this.sphere);
  }

  createControls() {
    let starsFolder = window.gui.addFolder('Stars');

    starsFolder.add(this.params, "rotate");
    starsFolder.add(this.params, 'rotationSpeed', -0.01, 0.01);
    starsFolder.add(this.params, "res1", 0.5, 2.0).step(0.001);
    starsFolder.add(this.params, "res2", 0.5, 2.00).step(0.001);
    starsFolder.add(this.params, "resMix", 0.5, 2.0).step(0.001);
    starsFolder.add(this.params, "mixScale", 0.5, 2.0).step(0.001);
  }

  update() {
    if (this.params.rotate) {
      this.rotation.y += this.params.rotationSpeed;
    }
  }

  render(props) {
    this.seed = this.randRange(0, 1000);

    this.starMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.params.res1,
      res2: this.params.res2,
      resMix: this.params.resMix,
      mixScale: this.params.mixScale,
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
