import * as THREE from 'three';
import Biome from '../tools/Biome'
import Atmosphere from './Atmosphere'
import NoiseMap from '../tools/NoiseMap'
import TextureMap from '../tools/TextureMap'
import NormalMap from '../tools/NormalMap'
import RoughnessMap from '../tools/RoughnessMap'
import Clouds from './Clouds'
import Stars from './Stars'
import Nebula from './Nebula'
import Sun from './Sun'
import Glow from './Glow'
import NebulaeGradient from '../tools/NebulaeGradient'
import seedrandom from 'seedrandom'
import randomString from 'crypto-random-string'
import AtmosphereRing from './AtmosphereRing'
import randomLorem from 'random-lorem'

import textureVert from '!raw-loader!glslify-loader!../shaders/texture.vert'
import textureFrag from '!raw-loader!glslify-loader!../shaders/textureMap.frag'
import normalMapFrag from '!raw-loader!glslify-loader!../shaders/normalMap.frag'
import normalMapVert from '!raw-loader!glslify-loader!../shaders/normalMap.vert'
import roughnessMapFrag from '!raw-loader!glslify-loader!../shaders/roughnessMap.frag'


export default class Planet extends THREE.Object3D {

  constructor() {
    super();

    this.seedString = "Scarlett";
    this.initSeed();

    this.materials = [];
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 3.0;
    this.resolution = 1024;
    this.size = 1000;
    this.waterLevel = 0.0;

    this.heightMaps = [];
    this.moistureMaps = [];
    this.textureMaps = [];
    this.normalMaps = [];
    this.roughnessMaps = [];

    this.rotate = true;
    this.autoGenerate = false;
    this.autoGenCountCurrent = 0;
    this.autoGenTime = 3 * 60;
    this.autoGenCountMax = this.autoGenTime * 60;

    let planetFolder = gui.addFolder('Planet');

    planetFolder.add(this, "roughness", 0.0, 1.0).onChange(value => {
      this.updateMaterial();
    });

    planetFolder.add(this, "metalness", 0.0, 1.0).onChange(value => {
      this.updateMaterial();
    });

    planetFolder.add(this, "normalScale", -3.0, 6.0).onChange(value => {
      this.updateMaterial();
    });

    this.biome = new Biome();
    this.nebulaeGradient = new NebulaeGradient();

    this.createScene();

    this.stars = new Stars();
    this.add(this.stars);

    this.nebula = new Nebula();
    this.add(this.nebula);

    this.sun = new Sun();
    this.add(this.sun);

    this.clouds = new Clouds();
    this.add(this.clouds);

    this.glow = new Glow();
    this.add(this.glow);

    this.atmosphere = new Atmosphere();
    this.add(this.atmosphere);

    this.atmosphereRing = new AtmosphereRing();
    this.add(this.atmosphereRing);

    this.loadSeedFromURL();

    let generalFolder = window.gui.addFolder('General');
    generalFolder.add(this, "rotate");

    generalFolder.add(this, "resolution", [256, 512, 1024, 2048, 4096]).onChange(value => {
      this.regenerate();
    });

    this.seedStringControl = generalFolder.add(this, "seedString").listen();
    this.seedStringControl.onFinishChange(value => {
      this.loadSeedFromTextfield();
    });

    // debug options
    this.displayMap = "textureMap";
    let debugFolder = window.gui.addFolder('Debug');
    debugFolder.add(this, "displayMap", ["textureMap", "heightMap", "moistureMap", "normalMap", "roughnessMap"]).onChange(value => {
      this.updateMaterial();
    });

    this.showBiomeMap = false;
    debugFolder.add(this, "showBiomeMap").onChange(value => {
      if (this.biome) {
        this.biome.toggleCanvasDisplay(value);
      }
    });

    this.showNebulaMap = false;
    debugFolder.add(this, "showNebulaMap").onChange(value => {
      if (this.nebulaeGradient) {
        this.nebulaeGradient.toggleCanvasDisplay(value);
      }
    });

    this.showSunMap = false;
    debugFolder.add(this, "showSunMap").onChange(value => {
      if (this.sun) {
        this.sun.sunTexture.toggleCanvasDisplay(value);
      }
    });

    debugFolder.add(this, "autoGenerate");
    debugFolder.add(this, "autoGenTime", 30, 300).step(1).onChange(value => {
      this.autoGenCountMax = this.autoGenTime * 60
    });

    window.gui.add(this, "randomize");

    document.addEventListener('keydown', (event) => {
      if (event.keyCode == 32) {
        this.randomize();
      }
    });

    window.onpopstate = (event) => {
      this.loadSeedFromURL();
    };

    this.renderUI();
  }

  update() {
    if (this.rotate) {
      this.ground.rotation.y += 0.0005;
      this.stars.rotation.y += 0.0004;
      this.nebula.rotation.y += 0.0003;
      this.clouds.rotation.y += 0.0008;
    }

    this.atmosphere.update();
    this.atmosphereRing.update();
    this.glow.update();

    if (this.autoGenerate) {
      this.autoGenCountCurrent++;
      if (this.autoGenCountCurrent > this.autoGenCountMax) {
        this.randomize();
      }
    }

    this.stars.position.copy(window.camera.position);
    this.nebula.position.copy(window.camera.position);
  }

  renderUI() {
    let infoBoxHolder = document.createElement("div");
    infoBoxHolder.setAttribute("id", "infoBoxHolder");
    document.body.appendChild(infoBoxHolder);

    // new planet button
    let newPlanetButtonHolder = document.createElement("div");
    newPlanetButtonHolder.setAttribute("id", "newPlanetButtonHolder");
    newPlanetButtonHolder.setAttribute("class", "text-center");
    newPlanetButtonHolder.innerHTML = "<button id='newPlanetButton' class='btn btn-primary'>New</button>";
    infoBoxHolder.appendChild(newPlanetButtonHolder);

    let newPlanetButton = document.getElementById("newPlanetButton");
    newPlanetButton.addEventListener('click', (e) => {
      this.randomize()
    });

    let infoBox = document.createElement("div");
    infoBox.setAttribute("id", "infoBox");
    infoBox.innerHTML = "Planet<br><div id='planetName'></div><br><div id='instructions'>H - Show/Hide UI<br>SPACEBAR - New Planet</div>";
    infoBoxHolder.appendChild(infoBox);

    let line = document.createElement("div");
    line.setAttribute("id", "line");
    infoBoxHolder.appendChild(line);

    infoBoxHolder.appendChild(window.gui.domElement);

    this.updatePlanetName();
  }

  updatePlanetName() {
    let planetName = document.getElementById("planetName");
    if (planetName != null) {
      planetName.innerHTML = this.seedString;
    }
  }

  initSeed() {
    window.rng = seedrandom(this.seedString);
  }

  loadSeedFromURL() {
    this.seedString = this.getParameterByName("seed");
    if (this.seedString) {
      console.log("seed string exists");
      this.regenerate();
    } else {
      console.log("no seed string");
      this.randomize();
    }

  }

  loadSeedFromTextfield() {
    let url = this.updateQueryString("seed", this.seedString);
    window.history.pushState({seed: this.seedString}, this.seedString, url);
    this.regenerate();
  }

  regenerate() {
    this.autoGenCountCurrent = 0;
    this.renderScene();
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  randomize() {
    let n = Math.random();
    let wordCount = 0;
    if (n > 0.8) {
      wordCount = 1;
    } else if (n > 0.4) {
      wordCount = 2;
    } else {
      wordCount = 3;
    }

    this.seedString = "";
    for (let i = 0; i < wordCount; i++) {
      this.seedString += this.capitalizeFirstLetter(randomLorem({min: 2, max: 8}));
      if (i < wordCount - 1) {
        this.seedString += " ";
      }
    }

    let url = this.updateQueryString("seed", this.seedString);
    window.history.pushState({seed: this.seedString}, this.seedString, url);
    this.autoGenCountCurrent = 0;
    this.renderScene();
  }


  createScene() {
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

    let geo = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
    let radius = this.size;
    for (var i in geo.vertices) {
      var vertex = geo.vertices[i];
      vertex.normalize().multiplyScalar(radius);
    }
    this.computeGeometry(geo);
    this.ground = new THREE.Mesh(geo, this.materials);
    this.add(this.ground);
  }


  renderScene() {
    this.initSeed();
    this.updatePlanetName();

    this.seed = this.randRange(0, 1) * 1000.0;
    this.waterLevel = this.randRange(0.1, 0.5);

    this.stars.resolution = this.resolution;
    this.nebula.resolution = this.resolution;
    this.clouds.resolution = this.resolution;

    this.updateNormalScaleForRes(this.resolution);
    this.biome.generateTexture({waterLevel: this.waterLevel});
    this.nebulaeGradient.generateTexture();

    this.atmosphere.randomize();

    this.clouds.randomize();

    window.renderQueue.start();

    this.stars.render({
      nebulaeMap: this.nebulaeGradient.texture
    });

    this.nebula.render({
      nebulaeMap: this.nebulaeGradient.texture
    });

    this.sun.render();

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

    let resMod = this.randRange(3, 10);
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
      waterLevel: this.waterLevel,
      heightMaps: this.heightMaps,
      textureMaps: this.textureMaps
    });

    this.roughnessMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      waterLevel: this.waterLevel
    });

    this.clouds.render({
      waterLevel: this.waterLevel
    });

    window.renderQueue.addCallback(() => {
      this.updateMaterial();
    });
  }

  updateMaterial() {
    for (let i = 0; i < 6; i++) {
      let material = this.materials[i];
      material.roughness = this.roughness;
      material.metalness = this.metalness;

      if (this.displayMap === "textureMap") {
        material.map = this.textureMaps[i];
        material.normalMap = this.normalMaps[i];
        material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
        material.roughnessMap = this.roughnessMaps[i];
        // material.metalnessMap = this.roughnessMaps[i];
      } else if (this.displayMap === "heightMap") {
        material.map = this.heightMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      } else if (this.displayMap === "moistureMap") {
        material.map = this.moistureMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      } else if (this.displayMap === "normalMap") {
        material.map = this.normalMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      } else if (this.displayMap === "roughnessMap") {
        material.map = this.roughnessMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }

      material.needsUpdate = true;
    }
  }

  updateNormalScaleForRes(value) {
    if (value === 256) this.normalScale = 0.25;
    if (value === 512) this.normalScale = 0.5;
    if (value === 1024) this.normalScale = 1.0;
    if (value === 2048) this.normalScale = 1.5;
    if (value === 4096) this.normalScale = 3.0;
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

  updateQueryString(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
      hash;

    if (re.test(url)) {
      if (typeof value !== 'undefined' && value !== null)
        return url.replace(re, '$1' + key + "=" + value + '$2$3');
      else {
        hash = url.split('#');
        url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
        if (typeof hash[1] !== 'undefined' && hash[1] !== null)
          url += '#' + hash[1];
        return url;
      }
    } else {
      if (typeof value !== 'undefined' && value !== null) {
        var separator = url.indexOf('?') !== -1 ? '&' : '?';
        hash = url.split('#');
        url = hash[0] + separator + key + '=' + value;
        if (typeof hash[1] !== 'undefined' && hash[1] !== null)
          url += '#' + hash[1];
        return url;
      } else
        return url;
    }
  }

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

}

