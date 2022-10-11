import * as THREE from 'three';

import ColorGUIHelper from "../utils/ColorGUIHelper";
import BiomeTexture from '../tools/BiomeTexture'
import Atmosphere from './Atmosphere'
import NoiseEnvMap from '../tools/NoiseEnvMap'
import TextureEnvMap from '../tools/TextureEnvMap'
import NormalEnvMap from '../tools/NormalEnvMap'
import RoughnessEnvMap from '../tools/RoughnessEnvMap'
import Clouds from './Clouds'
import Glow from './Glow'
import AtmosphereRing from './AtmosphereRing'

const BASE_WATER_COLOR = new THREE.Color(0.0, 0.4, 0.9);
const NUM_MAP_PLANE_ON_SPHERE = 6
const PLANET_RESOLUTION = 1024

export default class Planet extends THREE.Object3D {

  constructor(radius = 1000.0) {
    super();

    this.radius = radius;
    this.materials = [];
    this.resolution = PLANET_RESOLUTION;

    this.heightMaps = [];
    this.moistureMaps = [];
    this.textureMaps = [];
    this.normalMaps = [];
    this.roughnessMaps = [];

    this.params = {
      visible: true,
      rotate: true,
      rotationSpeed: 0.0005,
      wireframe: false,
      waterLevel: 0.2,
      waterColor: BASE_WATER_COLOR.clone(),
      roughness: 0.8,
      metalness: 0.5,
      normalScale: 4.14,
      bumpScale: 1.0,
      displacementScale: 1.0,
      displayMap: "textureMap",
      showBiomeMap: false
    };
    this.params.normalScaleV2 = new THREE.Vector2(this.params.normalScale, this.params.normalScale);

    this.createInnerPlanet();
    this.createOuterPlanet();

    this.createControls();
  }

  randomWaterColor() {

    let newColor = new THREE.Color();

    let hsl = BASE_WATER_COLOR.getHSL();
    newColor.setHSL(
      hsl.h,
      hsl.s + window.rng() * 0.4 - 0.2,
      hsl.l + window.rng() * 0.4 - 0.2);

    return newColor;
  }

  get rotate() {
    return this.params.rotate;
  }

  createInnerPlanet() {
    this.biome = new BiomeTexture();

    this.heightMap = new NoiseEnvMap();
    this.heightMaps = this.heightMap.maps;

    this.moistureMap = new NoiseEnvMap();
    this.moistureMaps = this.moistureMap.maps;

    this.textureMap = new TextureEnvMap();
    this.textureMaps = this.textureMap.maps;

    this.normalMap = new NormalEnvMap();
    this.normalMaps = this.normalMap.maps;

    this.roughnessMap = new RoughnessEnvMap();
    this.roughnessMaps = this.roughnessMap.maps;

    this.materials = [];
    for (let i = 0; i < NUM_MAP_PLANE_ON_SPHERE; ++i) {
      this.materials.push(new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffffff),
        wireframe: this.params.wireframe,
        roughness: this.params.roughness,
        metalness: this.params.metalness,
        normalScale: this.params.normalScaleV2,
        bumpScale: this.params.bumpScale,
        displacementScale: this.params.displacementScale
      }));
    }

    this.geometry = new THREE.BoxGeometry(1, 1, 1, 128, 128, 128);
    for (var i in this.geometry.vertices) {
      this.geometry.vertices[i].normalize().multiplyScalar(this.radius);
    }
    this.computeGeometry(this.geometry);
    this.sphere = new THREE.Mesh(this.geometry, this.materials);
    this.add(this.sphere);
  }


  createOuterPlanet() {
    this.clouds = new Clouds();
    this.add(this.clouds);

    this.atmosphere = new Atmosphere();
    this.add(this.atmosphere);

    this.atmosphereRing = new AtmosphereRing();
    this.add(this.atmosphereRing);

    this.glow = new Glow();
    this.add(this.glow);
  }

  createControls() {
    let planetFolder = gui.addFolder('Planet');

    planetFolder.add(this.params, "visible").onChange(value => {
      this.sphere.visible = value;
    });

    planetFolder.add(this.params, "rotate");
    planetFolder.add(this.params, 'rotationSpeed', -0.01, 0.01);

    planetFolder.add(this.params, "wireframe").onChange(value => {
      this.updateMaterial();
    });
    planetFolder.add(this.params, "waterLevel", 0, 1.0).listen().onChange(value => {
      this.updateTexture();
    });

    planetFolder.addColor(new ColorGUIHelper(this.params, "waterColor"), "color").listen().onChange(value => {
      this.updateTexture();
    });


    const planetFields = ["roughness", "metalness", "bumpScale", "displacementScale"];
    for (let i = 0; i < planetFields.length; ++i) {
      planetFolder.add(this.params, planetFields[i], 0.0, 1.0).listen().onChange(value => {
        this.updateMaterial();
      });
    }

    planetFolder.add(this.params, "normalScale", -6.0, 6.0).listen().onChange(value => {
      this.updateMaterial();
    });

    planetFolder.add(this.params, "displayMap", ["textureMap", "heightMap", "moistureMap", "normalMap", "roughnessMap"]).onChange(value => {
      this.updateMaterial();
    });

    planetFolder.add(this.params, "showBiomeMap").onChange(value => {
      if (this.biome) {
        this.biome.visibleCanvas(value);
      }
    });
  }

  update() {
    if (this.params.rotate) {
      this.sphere.rotation.y += this.params.rotationSpeed;
      this.clouds.update();
    }

    this.atmosphere.update();
    this.atmosphereRing.update();
    this.glow.update();
  }

  renderUI() {
    // No-op
  }

  updateTexture() {
    // this.biome.generateTexture({waterLevel: this.params.waterLevel});
    this.textureMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      moistureMaps: this.moistureMaps,
      biomeMap: this.biome.texture,
      waterLevel: this.params.waterLevel,
      waterColor: this.params.waterColor,
    });

    this.updateMaterial();
  }

  render() {
    this.seed = this.randRange(0, 1) * 1000.0;
    this.params.waterLevel = this.randRange(0.1, 0.5);
    let rndWaterColor = this.randomWaterColor();
    this.params.waterColor.setRGB(rndWaterColor.r, rndWaterColor.g, rndWaterColor.b);

    this.clouds.resolution = this.resolution;
    this.updateNormalScaleForRes(this.resolution);

    this.biome.generateTexture({waterLevel: this.params.waterLevel});
    this.clouds.randomize();
    this.atmosphere.randomize();
    this.atmosphereRing.randomize();
    this.glow.randomize();

    let resMin = 0.01;
    let resMax = 5.0;

    this.updateMaterial();

    // GROUND
    this.heightMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: this.randRange(resMin, resMax),
      res2: this.randRange(resMin, resMax),
      resMix: this.randRange(resMin, resMax),
      mixScale: this.randRange(0.5, 1.0),
      ridgesType: Math.floor(this.randRange(0, 4))
    });

    this.textureMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      moistureMaps: this.moistureMaps,
      biomeMap: this.biome.texture,
      waterLevel: this.params.waterLevel,
      waterColor: this.params.waterColor,
    });

    this.roughnessMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      waterLevel: this.params.waterLevel
    });

    const resMod = this.randRange(2, 5);
    resMax *= resMod;
    resMin *= resMod;

    this.moistureMap.render({
      seed: this.seed * this.seed,
      resolution: this.resolution,
      res1: this.randRange(resMin, resMax),
      res2: this.randRange(resMin, resMax),
      resMix: this.randRange(resMin, resMax),
      mixScale: this.randRange(0.5, 1.0),
      ridgesType: Math.floor(this.randRange(0, 4))
    });

    this.normalMap.render({
      resolution: this.resolution,
      waterLevel: this.params.waterLevel,
      heightMaps: this.heightMaps,
      textureMaps: this.textureMaps
    });

    // CLOUDS
    this.clouds.render({
      waterLevel: this.params.waterLevel
    });

    window.renderQueue.addCallback(() => {
      this.updateMaterial();
    });
  }

  updateMaterial() {
    this.params.normalScaleV2.set(this.params.normalScale, this.params.normalScale);

    for (let i = 0; i < NUM_MAP_PLANE_ON_SPHERE; ++i) {
      let material = this.materials[i];
      material.wireframe = this.params.wireframe;
      material.roughness = this.params.roughness;
      material.metalness = this.params.metalness;
      material.normalScale = this.params.normalScaleV2;
      material.bumpScale = this.params.bumpScale;
      material.displacementScale = this.params.displacementScale;

      material.map = null;
      material.normalMap = null;
      material.roughnessMap = null;
      material.metalnessMap = null;
      material.displacementMap = null;
      material.bumpMap = null;

      if (this.params.displayMap === "textureMap") {
        material.map = this.textureMaps[i];
        material.normalMap = this.normalMaps[i];
        material.roughnessMap = this.roughnessMaps[i];
        material.metalnessMap = this.moistureMaps[i];
        material.displacementMap = this.normalMap[i];
        material.bumpMap = this.roughnessMap[i];
      } else if (this.params.displayMap === "heightMap") {
        material.map = this.heightMaps[i];
      } else if (this.params.displayMap === "moistureMap") {
        material.map = this.moistureMaps[i];
      } else if (this.params.displayMap === "normalMap") {
        material.map = this.normalMaps[i];
      } else if (this.params.displayMap === "roughnessMap") {
        material.map = this.roughnessMaps[i];
      }

      material.needsUpdate = true;
    }
  }

  updateNormalScaleForRes(value) {
    if (value === 256) {
      this.params.normalScale = 0.25;
    } else if (value === 512) {
      this.params.normalScale = 0.5;
    } else if (value === 1024) {
      this.params.normalScale = 1.0;
    } else if (value === 2048) {
      this.params.normalScale = 1.5;
    } else if (value === 4096) {
      this.params.normalScale = 3.0;
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

