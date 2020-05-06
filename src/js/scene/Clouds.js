import * as THREE from 'three';
import CloudEnvMap from '../tools/CloudEnvMap'

import ColorGUIHelper from "../utils/ColorGUIHelper";

export default class Clouds extends THREE.Object3D {

  constructor(radius = 1005.0) {
    super();

    this.radius = radius;
    this.resolution = 1024;

    this.params = {
      visible: true,
      rotate: true,
      rotationSpeed: 0.0009,
      color: new THREE.Color(0xffffff),
      opacity: 1.0,
      roughness: 0.9,
      metalness: 0.5,
      bumpScale: 1.0
    };

    this.cloudMap = new CloudEnvMap();
    this.cloudMaps = this.cloudMap.maps;

    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.MeshStandardMaterial({
        color: this.params.color,
        transparent: true,
        roughness: this.params.roughness,
        metalness: this.params.metalness,
        opacity: this.params.opacity,
        bumpScale: this.params.bumpScale
      }));
    }

    this.geometry = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
    for (var i in this.geometry.vertices) {
      this.geometry.vertices[i].normalize().multiplyScalar(this.radius);
    }
    this.computeGeometry(this.geometry);
    this.sphere = new THREE.Mesh(this.geometry, this.materials);
    this.add(this.sphere);

    this.createControls();
  }

  createControls() {
    let cloudsFolder = window.gui.addFolder('Clouds');

    cloudsFolder.add(this.params, "visible").onChange(value => {
      this.sphere.visible = value;
    });

    cloudsFolder.add(this.params, "rotate");
    cloudsFolder.add(this.params, 'rotationSpeed', -0.02, 0.02);

    const cloudsFields = ["opacity", "roughness", "bumpScale"];
    for (let i = 0; i < cloudsFields.length; ++i) {
      cloudsFolder.add(this.params, cloudsFields[i], 0.0, 1.0).step(0.001).listen().onChange(value => {
        this.updateMaterial();
      });
    }

    cloudsFolder.addColor(new ColorGUIHelper(this.params, "color"), "color").listen().onChange(value => {
      this.updateMaterial();
    });
  }

  update() {
    if (this.params.rotate) {
      this.rotation.y += this.params.rotationSpeed;
      this.rotation.z += 0.0001;
    }
  }

  render(props) {
    this.seed = this.randRange(0, 1000);
    // let cloudSize = this.randRange(0.5, 1.0);
    // let mixScale = this.map_range(props.waterLevel * props.waterLevel, 0, 0.8, 0.0, 5.0);
    this.updateMaterial();

    this.cloudMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.randRange(0.1, 1.0),
      res2: this.randRange(0.1, 1.0),
      resMix: this.randRange(0.1, 1.0),
      mixScale: this.randRange(0.1, 1.0)
    });

  }

  map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  updateMaterial() {
    for (let i = 0; i < 6; ++i) {
      let material = this.materials[i];
      material.roughness = this.params.roughness;
      material.metalness = this.params.metalness;
      material.opacity = this.params.opacity;
      material.bumpScale = this.params.bumpScale;
      material.color = this.params.color;
      material.map = this.cloudMaps[i];
      material.alphaMap = this.cloudMaps[i];
      material.bumpMap = this.cloudMaps[i];
    }
  }

  randRange(low, high) {
    let range = high - low;
    let n = window.rng() * range;
    return low + n;
  }

  randomizeColor() {
    this.params.color.setRGB(
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0),
      this.randRange(0.5, 1.0)
    );

    this.updateMaterial();
  }

  randomize() {
    this.params.opacity = this.randRange(0.25, 1.0);

    this.randomizeColor();
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

