import * as THREE from 'three';
import CloudMap from '../tools/CloudMap'
import tinycolor from 'tinycolor2'

export default class Clouds extends THREE.Object3D {

  constructor() {
    super();

    this.materials = [];
    this.cloudMaps = [];
    this.resolution = 1024;
    this.size = 1001;

    this.settings = {
      rotationSpeed: 0.0008,
      roughness: 0.9,
      metalness: 0.5,
      normalScale: 5.0,
      opacity: 1,
      color: new THREE.Color(0xffffff),
    };

    this.createControls();

    this.setup();
  }

  createControls() {
    let cloudsFolder = window.gui.addFolder('Clouds');

    cloudsFolder.add(this.settings, 'rotationSpeed', -0.01, 0.01);

    cloudsFolder.add(this.settings, "opacity", 0.0, 1.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });

    this.settings.cloudColor = [this.settings.color.r * 255, this.settings.color.g * 255, this.settings.color.b * 255];
    cloudsFolder.addColor(this.settings, "cloudColor").name('color').onChange(value => {
      this.settings.color.r = value[0] / 255;
      this.settings.color.g = value[1] / 255;
      this.settings.color.b = value[2] / 255;
      this.updateMaterial();
    });

    cloudsFolder.add(this.settings, "roughness", 0.0, 1.0).step(0.001).onChange(value => {
      this.updateMaterial();
    });

    cloudsFolder.add(this.settings, "normalScale", 0.0, 10.0).step(0.01).onChange(value => {
      this.updateMaterial();
    });
  }

  update() {
    this.rotation.y += this.settings.rotationSpeed;
    this.rotation.z += 0.0001;
  }

  setup() {
    this.cloudMap = new CloudMap();
    this.cloudMaps = this.cloudMap.maps;

    for (let i = 0; i < 6; i++) {
      let material = new THREE.MeshStandardMaterial({
        color: this.settings.color,
        transparent: true,
      });
      this.materials[i] = material;
    }

    let geo = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
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
    let cloudSize = this.randRange(0.5, 1.0);

    let mixScale = this.map_range(props.waterLevel * props.waterLevel, 0, 0.8, 0.0, 3.0);

    this.cloudMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.randRange(0.1, 1.0),
      res2: this.randRange(0.1, 1.0),
      resMix: this.randRange(0.1, 1.0),
      mixScale: this.randRange(0.1, 1.0)
    });

    this.updateMaterial();
  }

  map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  updateMaterial() {
    for (let i = 0; i < 6; i++) {
      let material = this.materials[i];
      material.roughness = this.settings.roughness;
      material.metalness = this.settings.metalness;
      material.opacity = this.settings.opacity;
      material.map = this.cloudMaps[i];
      material.color = this.settings.color;
      material.alphaMap = this.cloudMaps[i];
      material.bumpMap = this.cloudMaps[i];
      material.bumpScale = 1.0;
    }
  }

  randomizeColor() {
    this.settings.color.setRGB(
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0)
    );
    this.settings.cloudColor = [this.settings.color.r * 255, this.settings.color.g * 255, this.settings.color.b * 255];

    this.updateMaterial();
  }

  randomize() {
    this.settings.opacity = this.randRange(0.25, 1.0);
    this.randomizeColor();
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

