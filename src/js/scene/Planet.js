import * as THREE from 'three';

import Biome from '../tools/Biome'
import Atmosphere from './Atmosphere'
import NoiseMap from '../tools/NoiseMap'
import TextureMap from '../tools/TextureMap'
import NormalMap from '../tools/NormalMap'
import RoughnessMap from '../tools/RoughnessMap'
import Clouds from './Clouds'
import Glow from './Glow'
import AtmosphereRing from './AtmosphereRing'


export default class Planet extends THREE.Object3D {

  constructor() {
    super();

    this.materials = [];
    this.resolution = 1024;
    this.size = 1000;

    this.heightMaps = [];
    this.moistureMaps = [];
    this.textureMaps = [];
    this.normalMaps = [];
    this.roughnessMaps = [];

    this.settings = {
      waterLevel: 0.0,
      roughness: 0.8,
      metalness: 0.5,
      normalScale: 3.0,
      rotate: true,
      displayMap: "textureMap",
      showBiomeMap: false
    };

    this.createInnerPlanet();
    this.createOuterPlanet();

    this.createControls();
  }

  createInnerPlanet() {
    this.biome = new Biome();

    this.heightMap = new NoiseMap();
    this.heightMaps = this.heightMap.maps;

    this.moistureMap = new NoiseMap();
    this.moistureMaps = this.moistureMap.maps;

    this.textureMap = new TextureMap();
    this.textureMaps = this.textureMap.maps;

    this.normalMap = new NormalMap();
    this.normalMaps = this.normalMap.maps;

    this.roughnessMap = new RoughnessMap();
    this.roughnessMaps = this.roughnessMap.maps;

    for (let i = 0; i < 6; i++) {
      let material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xFFFFFF)
      });
      this.materials[i] = material;
    }

    const geo = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
    const radius = this.size;
    for (var i in geo.vertices) {
      var vertex = geo.vertices[i];
      vertex.normalize().multiplyScalar(radius);
    }
    this.computeGeometry(geo);
    this.ground = new THREE.Mesh(geo, this.materials);
    this.add(this.ground);
  }


  createOuterPlanet() {
    this.clouds = new Clouds();
    this.add(this.clouds);

    this.glow = new Glow();
    this.add(this.glow);

    this.atmosphere = new Atmosphere();
    this.add(this.atmosphere);

    this.atmosphereRing = new AtmosphereRing();
    this.add(this.atmosphereRing);
  }

  createControls() {
    let planetFolder = gui.addFolder('Planet');

    planetFolder.add(this.settings, "rotate");

    planetFolder.add(this.settings, "roughness", 0.0, 1.0).onChange(value => {
      this.updateMaterial();
    });

    planetFolder.add(this.settings, "metalness", 0.0, 1.0).onChange(value => {
      this.updateMaterial();
    });

    planetFolder.add(this.settings, "normalScale", -3.0, 6.0).onChange(value => {
      this.updateMaterial();
    });

    planetFolder.add(this.settings, "displayMap", ["textureMap", "heightMap", "moistureMap", "normalMap", "roughnessMap"]).onChange(value => {
      this.updateMaterial();
    });

    planetFolder.add(this.settings, "showBiomeMap").onChange(value => {
      if (this.biome) {
        this.biome.toggleCanvasDisplay(value);
      }
    });
  }

  update() {
    if (this.settings.rotate) {
      this.ground.rotation.y += 0.0005;
      this.clouds.rotation.y += 0.0008;
    }

    this.atmosphere.update();
    this.atmosphereRing.update();
    this.glow.update();
  }

  renderUI() {
    // No-op
  }

  renderScene() {
    this.seed = this.randRange(0, 1) * 1000.0;
    this.settings.waterLevel = this.randRange(0.1, 0.5);

    this.clouds.resolution = this.resolution;
    this.updateNormalScaleForRes(this.resolution);

    this.biome.generateTexture({waterLevel: this.settings.waterLevel});
    this.clouds.randomize();
    this.atmosphere.randomize();
    this.atmosphereRing.randomize();
    this.glow.randomize();

    let resMin = 0.01;
    let resMax = 5.0;

    this.heightMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.randRange(resMin, resMax),
      res2: this.randRange(resMin, resMax),
      resMix: this.randRange(resMin, resMax),
      mixScale: this.randRange(0.5, 1.0),
      doesRidged: Math.floor(this.randRange(0, 4))
    });

    const resMod = this.randRange(3, 10);
    resMax *= resMod;
    resMin *= resMod;

    this.moistureMap.render({
      seed: this.seed + 392.253,
      resolution: this.resolution,
      res1: this.randRange(resMin, resMax),
      res2: this.randRange(resMin, resMax),
      resMix: this.randRange(resMin, resMax),
      mixScale: this.randRange(0.5, 1.0),
      doesRidged: Math.floor(this.randRange(0, 4))
    });

    this.textureMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      moistureMaps: this.moistureMaps,
      biomeMap: this.biome.texture
    });

    this.normalMap.render({
      resolution: this.resolution,
      waterLevel: this.settings.waterLevel,
      heightMaps: this.heightMaps,
      textureMaps: this.textureMaps
    });

    this.roughnessMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      waterLevel: this.settings.waterLevel
    });

    this.clouds.render({
      waterLevel: this.settings.waterLevel
    });

    window.renderQueue.addCallback(() => {
      this.updateMaterial();
    });
  }

  updateMaterial() {
    for (let i = 0; i < 6; i++) {
      let material = this.materials[i];
      material.roughness = this.settings.roughness;
      material.metalness = this.settings.metalness;

      if (this.settings.displayMap === "textureMap") {
        material.map = this.textureMaps[i];
        material.normalMap = this.normalMaps[i];
        material.normalScale = new THREE.Vector2(this.settings.normalScale, this.settings.normalScale);
        material.roughnessMap = this.roughnessMaps[i];
        // material.metalnessMap = this.roughnessMaps[i];
      } else if (this.settings.displayMap === "heightMap") {
        material.map = this.heightMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      } else if (this.settings.displayMap === "moistureMap") {
        material.map = this.moistureMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      } else if (this.settings.displayMap === "normalMap") {
        material.map = this.normalMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      } else if (this.settings.displayMap === "roughnessMap") {
        material.map = this.roughnessMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }

      material.needsUpdate = true;
    }
  }

  updateNormalScaleForRes(value) {
    if (value === 256) this.settings.normalScale = 0.25;
    if (value === 512) this.settings.normalScale = 0.5;
    if (value === 1024) this.settings.normalScale = 1.0;
    if (value === 2048) this.settings.normalScale = 1.5;
    if (value === 4096) this.settings.normalScale = 3.0;
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

