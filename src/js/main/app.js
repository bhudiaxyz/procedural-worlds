import * as THREE from "three";
import OrbitControls from 'orbit-controls-es6';
import * as Alea from 'alea';
import * as SimplexNoise from 'simplex-noise';
import * as Stats from 'stats.js';
import * as dat from 'dat.gui/build/dat.gui.js';

import seedrandom from 'seedrandom'
import Nebula from '../scene/Nebula';
import Stars from '../scene/Stars';
import SkyBox from '../scene/SkyBox';
import NebulaeGradient from "../tools/NebulaeGradient";
import Biome from "../tools/Biome";
import PlanetEarth from "../scene/PlanetEarth";
import SkyStars from "../scene/SkyStars";

const N = 6;
const TWO_N = Math.pow(2, N); // detail of the spheres
const EARTH_RADIUS = 25.0;

export default class Application {
  constructor(opts = {}) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.startTime = Date.now();
    this.rafId = null;
    this.container = opts.container;

    // Preamble of standard stuff expected everywhere
    this.prepareInit();

    // Standard scene stuff
    this.setupRenderer();
    this.setupLights();
    // this.setupHelpers();
    // window.renderer = this.renderer;

    // Scene setup
    this.biome = new Biome(this.random);
    this.biome.generateTexture({waterLevel: this.params.waterLevel});

    this.nebulaeGradient = new NebulaeGradient(this.random);
    this.nebulaeGradient.generateTexture();
    this.params.nebulaeMap = this.nebulaeGradient.texture;

    this.skybox = new SkyBox(EARTH_RADIUS * 400.0, TWO_N, TWO_N);
    this.scene.add(this.skybox);
    // this.nebula = new Nebula(this.random);
    // this.nebula.resolution = this.params.resolution;
    // this.scene.add(this.nebula);
    // this.nebula.render({nebulaeMap: this.nebulaeGradient.texture});

    this.stars = new SkyStars(this.random, this.params, EARTH_RADIUS * 175, EARTH_RADIUS * 7, 500);
    this.scene.add(this.stars);
    // this.stars = new Stars(this.random);
    // this.stars.resolution = this.params.resolution;
    // this.stars.render({nebulaeMap: this.nebulaeGradient.texture});
    // this.scene.add(this.stars);

    this.planetEarth = new PlanetEarth(this.random, this.params, EARTH_RADIUS, N, TWO_N, TWO_N);
    this.scene.add(this.planetEarth);

    // UI controls setup
    this.setupParamsControl();

    this.onResize();
    window.addEventListener('resize', () => this.onResize, false);
  }

  prepareInit() {
    this.scene = new THREE.Scene();
    this.stats = new Stats();
    this.random = new Alea();
    this.noise = new SimplexNoise(this.random);
    this.gui = new dat.GUI();

    this.params = {
      // General
      seed: seedrandom('procedural-seed'),
      resolution: 1024,
      random: this.random,
      rotate: true,
      panRotate: true,
      // Lighting
      pointLightColor: {r: 255, g: 255, b: 255},
      pointLightIntensity: 2,
      pointLightPosition: new THREE.Vector3(EARTH_RADIUS * 0.5, EARTH_RADIUS * 4.0, EARTH_RADIUS * 0.25),
      dirLightColor: {r: 255, g: 255, b: 255},
      dirLightIntensity: 1,
      dirLightPosition: new THREE.Vector3(EARTH_RADIUS * 4, EARTH_RADIUS * 0, -EARTH_RADIUS * 5.5),
      spotLightColor: {r: 159, g: 159, b: 159},
      spotLightPosition: new THREE.Vector3(EARTH_RADIUS * 1.2, EARTH_RADIUS * 2, EARTH_RADIUS * 0.5),
      ambLightColor: {r: 128, g: 128, b: 128},
      // Earth
      waterLevel: 0.0,
      oceanVisible: true,
      oceanSpeed: 0.0000275963,
      earthSpeed: 0.00014,
      earthRoughness: 0.069,
      earthLacunarity: 0.076,
      earthRotation: new THREE.Vector3(0.0, 0.003, 0.000),
      // Clouds
      cloudsVisible: true,
      cloudSpeed: 0.00002140,
      cloudRangeFactor: 0.29,
      cloudSmoothness: 2.6,
      cloudRotation: new THREE.Vector3(0.000053, -0.00138, 0.00003),
      // Moon
      moonVisible: true,
      moonSpeed: 0.00015,
      moonRoughness: 0.031,
      moonLacunarity: 0.076,
      // Nebular
      nebulaOpacity: 1.0,
      // Stars
      starSpeed: 0.00035,
      // Debug
      showBiomeMap: false,
      showNebulaMap: false
    };

    this.params.dirLightColorV4 = new THREE.Vector4(
      this.params.dirLightColor.r / 255.0,
      this.params.dirLightColor.g / 255.0,
      this.params.dirLightColor.b / 255.0,
      1.0);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  randRange(low, high) {
    let range = high - low;
    let n = this.random() * range;
    return low + n;
  }

  randomize() {
    this.biome.generateTexture({waterLevel: this.params.waterLevel});
    this.nebulaeGradient.generateTexture();
    this.planetEarth.randomize();
  }

  animate() {
    this.stats.update();
    this.controls.update();
    this.update();
    this.renderer.render(this.scene, this.camera);
    // when render is invoked via requestAnimationFrame(this.render) there is no 'this',
    // so either we bind it explicitly like so: requestAnimationFrame(this.render.bind(this));
    // or use an es6 arrow function like so:
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  stop() {
    cancelAnimationFrame(this.rafId);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    // this.renderer.setClearColor(0xd3d3d3);  // it's a light gray
    this.renderer.setClearColor(0x222222);  // it's a dark gray
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;

    this.container.appendChild(this.stats.dom);
    this.container.appendChild(this.renderer.domElement);

    const fov = 35;
    const aspect = this.width / this.height;
    const near = 0.1;
    const far = 10000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(EARTH_RADIUS * 5, EARTH_RADIUS * 0.5, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;
    this.controls.autoRotate = true;
  }

  setupLights() {
    const shadowMapSizeWidth = 512;
    const shadowMapSizeHeight = 512;
    const shadowCameraNear = 0.5;
    const shadowCameraFar = 200;

    this.pointLight = new THREE.PointLight(this.params.pointLightColor, this.params.pointLightIntensity);
    this.pointLight.position.set(this.params.pointLightPosition.x, this.params.pointLightPosition.y, this.params.pointLightPosition.z);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize.width = shadowMapSizeWidth;
    this.pointLight.shadow.mapSize.height = shadowMapSizeHeight;
    this.pointLight.shadow.camera.near = shadowCameraNear;
    this.pointLight.shadow.camera.far = shadowCameraFar;
    this.scene.add(this.pointLight);

    // directional light
    this.dirLight = new THREE.DirectionalLight(this.params.dirLightColor, this.params.dirLightIntensity);
    this.dirLight.position.set(this.params.dirLightPosition.x, this.params.dirLightPosition.y, this.params.dirLightPosition.z);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = shadowMapSizeWidth;
    this.dirLight.shadow.mapSize.height = shadowMapSizeHeight;
    this.dirLight.shadow.camera.near = shadowCameraNear;
    this.dirLight.shadow.camera.far = shadowCameraFar;
    this.scene.add(this.dirLight);

    // spotlight
    this.spotLight = new THREE.SpotLight(this.params.spotLightColor);
    this.spotLight.position.set(this.params.spotLightPosition.x, this.params.spotLightPosition.y, this.params.spotLightPosition.z);
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = shadowMapSizeWidth;
    this.spotLight.shadow.mapSize.height = shadowMapSizeHeight;
    this.spotLight.shadow.camera.near = shadowCameraNear;
    this.spotLight.shadow.camera.far = shadowCameraFar;
    this.scene.add(this.spotLight);

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(this.params.ambLightColor);
    this.scene.add(this.ambientLight);
  }


  setupHelpers() {
    // floor grid helper
    const gridHelper = new THREE.GridHelper(EARTH_RADIUS * 10, 16);
    this.scene.add(gridHelper);

    // XYZ axes helper (XYZ axes are RGB colors, respectively)
    const axisHelper = new THREE.AxesHelper(EARTH_RADIUS * 10);
    this.scene.add(axisHelper);

    // point light helper + shadow camera helper
    const pointLightHelper = new THREE.PointLightHelper(this.pointLight, 10);
    this.scene.add(pointLightHelper);
    const pointLightCameraHelper = new THREE.CameraHelper(this.pointLight.shadow.camera);
    this.scene.add(pointLightCameraHelper);

    // directional light helper + shadow camera helper
    const dirLightHelper = new THREE.DirectionalLightHelper(this.dirLight, 10);
    this.scene.add(dirLightHelper);
    const dirLightCameraHelper = new THREE.CameraHelper(this.dirLight.shadow.camera);
    this.scene.add(dirLightCameraHelper);

    // spot light helper + shadow camera helper
    const spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    this.scene.add(spotLightHelper);
    const spotLightCameraHelper = new THREE.CameraHelper(this.spotLight.shadow.camera);
    this.scene.add(spotLightCameraHelper);
  }

  setupParamsControl() {
    let f = this.gui.addFolder("General");
    f.add(this.params, 'rotate');
    f.add(this.controls, 'autoRotate');
    f.close();

    f = this.gui.addFolder('Lighting');
    f.add(this.params.pointLightPosition, 'x').name('Point X').min(-200).max(200);
    f.add(this.params.pointLightPosition, 'y').name('Point Y').min(-200).max(200);
    f.add(this.params.pointLightPosition, 'z').name('Point Z').min(-200).max(200);

    f.addColor(this.params, 'pointLightColor').name('Point Color').onChange(value => {
      this.pointLight.color.r = this.params.pointLightColor.r / 255.0;
      this.pointLight.color.g = this.params.pointLightColor.g / 255.0;
      this.pointLight.color.b = this.params.pointLightColor.b / 255.0;
    });

    f.add(this.params.dirLightPosition, 'x').name('Directional X').min(-200).max(200);
    f.add(this.params.dirLightPosition, 'y').name('Directional Y').min(-200).max(200);
    f.add(this.params.dirLightPosition, 'z').name('Directional Z').min(-200).max(200);

    f.addColor(this.params, 'dirLightColor').name('Directional Color').onChange(value => {
      this.dirLight.color.r = this.params.dirLightColor.r / 255.0;
      this.dirLight.color.g = this.params.dirLightColor.g / 255.0;
      this.dirLight.color.b = this.params.dirLightColor.b / 255.0;
      this.params.dirLightColorV4.set(this.dirLight.color.r, this.dirLight.color.g, this.dirLight.color.b, 1.0);
    });

    f.add(this.params.spotLightPosition, 'x').name('Spot X').min(-200).max(200);
    f.add(this.params.spotLightPosition, 'y').name('Spot Y').min(-200).max(200);
    f.add(this.params.spotLightPosition, 'z').name('Spot Z').min(-200).max(200);

    f.addColor(this.params, 'spotLightColor').name('Spot Color').onChange(value => {
      this.spotLight.color.r = this.params.spotLightColor.r / 255.0;
      this.spotLight.color.g = this.params.spotLightColor.g / 255.0;
      this.spotLight.color.b = this.params.spotLightColor.b / 255.0;
    });

    f.addColor(this.params, 'ambLightColor').name('Ambient Color').onChange(value => {
      this.ambientLight.color.r = this.params.ambLightColor.r / 255.0;
      this.ambientLight.color.g = this.params.ambLightColor.g / 255.0;
      this.ambientLight.color.b = this.params.ambLightColor.b / 255.0;
    });
    f.close();

    f = this.gui.addFolder('Camera');
    f.add(this.camera.position, 'x').name('Camera X').min(-200).max(200);
    f.add(this.camera.position, 'y').name('Camera Y').min(-200).max(200);
    f.add(this.camera.position, 'z').name('Camera Z').min(-200).max(200);
    f.close();

    f = this.gui.addFolder("Earth");
    f.add(this.params, 'oceanVisible');
    f.add(this.params, 'oceanSpeed', -0.001, 0.001);
    f.add(this.params, 'earthSpeed', -0.001, 0.001);
    f.add(this.params, 'earthRoughness', 0.0, 2.0);
    f.add(this.params, 'earthLacunarity', 0.0, 2.0);
    f.add(this.params.earthRotation, 'x').name('Earth Rotation X').min(-0.05).max(0.05);
    f.add(this.params.earthRotation, 'y').name('Earth Rotation Y').min(-0.05).max(0.05);
    f.add(this.params.earthRotation, 'z').name('Earth Rotation Z').min(-0.05).max(0.05);
    f.close();

    f = this.gui.addFolder("Clouds");
    f.add(this.params, 'cloudsVisible');
    f.add(this.params, 'cloudSpeed', 0.0, 0.001);
    f.add(this.params, 'cloudRangeFactor', 0.0, 3.0);
    f.add(this.params, 'cloudSmoothness', 0.0, 3.0);
    f.add(this.params.cloudRotation, 'x').name('Cloud Rotation X').min(-0.05).max(0.05);
    f.add(this.params.cloudRotation, 'y').name('Cloud Rotation Y').min(-0.05).max(0.05);
    f.add(this.params.cloudRotation, 'z').name('Cloud Rotation Z').min(-0.05).max(0.05);
    f.close();

    f = this.gui.addFolder("Moon");
    f.add(this.params, 'moonVisible');
    f.add(this.params, 'moonSpeed', -0.05, 0.05);
    f.add(this.params, 'moonRoughness', 0.0, 2.0);
    f.add(this.params, 'moonLacunarity', 0.0, 2.0);
    f.close();

    f = this.gui.addFolder("Debug");
    f.add(this.params, 'showNebulaMap').onChange(value => {
      if (this.nebulaeGradient) {
        this.nebulaeGradient.toggleCanvasDisplay(value);
      }
    });
    f.add(this.params, 'showBiomeMap').onChange(value => {
      if (this.biome) {
        this.biome.toggleCanvasDisplay(value);
      }
    });
    f.close();

    this.gui.add(this, 'randomize');
  }

  update() {
    const delta = Date.now() - this.startTime;

    this.stars.update();
    // this.planetEarth.update();
  }
}
