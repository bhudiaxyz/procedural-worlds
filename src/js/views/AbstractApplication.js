import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';

import * as Stats from 'stats.js';
import * as dat from 'dat.gui/build/dat.gui.js';

import RenderQueue from "../utils/RenderQueue";

export default class AbstractApplication {

  constructor(opts = {}) {

    // Preamble of standard stuff expected everywhere
    this.prepareInit(opts);

    // Standard scene stuff
    this.setupLights();
    this.setupControls();
    this.setupParamControls();

    window.addEventListener('resize', () => this.onWindowResize, false);
    window.addEventListener('keydown', (e) => {
      this.onKeyDown(e)
    }, false);
  }

  prepareInit(opts = {}) {
    this._rafID = null;

    if (opts.container) {
      this.container = opts.container;
    } else {
      const div = document.createElement('div');
      div.setAttribute('class', 'container');
      div.setAttribute('id', 'canvas-container');
      document.body.appendChild(div);
      this.container = div;
    }

    window.renderQueue = new RenderQueue();

    this.params = {
      // General
      rotate: true,
      panRotate: true,
    };

    this._scene = new THREE.Scene();

    this._renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this._renderer.setClearColor(0x111111);  // it's a dark gray
    this._renderer.setPixelRatio(window.devicePixelRatio || 1);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    window.renderer = this._renderer;

    this._camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
    this._camera.position.set(0, 2, 0);
    this._camera.lookAt(new THREE.Vector3(0, 0, 0));
    window.camera = this._camera;

    // stats
    this.stats = new Stats();

    this.container.appendChild(this.stats.dom);
    this.container.appendChild(this._renderer.domElement);
  }

  setupLights() {
    // lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this._scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
    this.directionalLight.position.set(-1, 1.0, 1);
    this._scene.add(this.directionalLight);
    window.light = this.directionalLight;
  }

  setupControls() {
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enabled = true;
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.1;
    this._controls.rotateSpeed = 0.1;
    this._controls.autoRotate = true;
    this._controls.autoRotateSpeed = 0.01;
    this._controls.zoomSpeed = 0.1;
  }

  setupParamControls() {
    this._gui = new dat.GUI();

    // camera
    let cameraFolder = this._gui.addFolder('Camera');

    cameraFolder.add(this._controls, "autoRotate");

    this.fovControl = cameraFolder.add(this._camera, "fov", 20, 120);
    this.fovControl.onChange(value => {
      this._camera.updateProjectionMatrix()
    });

    cameraFolder.add(this._camera.position, 'x').name('Camera X').min(-2000).max(2000);
    cameraFolder.add(this._camera.position, 'y').name('Camera Y').min(-2000).max(2000);
    cameraFolder.add(this._camera.position, 'z').name('Camera Z').min(-2000).max(2000);
    cameraFolder.close();

    // lighting
    let lightFolder = this._gui.addFolder('Lighting');

    this.sunColor = {r: 255, g: 255, b: 255};
    this.dirLightControl = lightFolder.addColor(this, "sunColor").onChange(value => {
      this.directionalLight.color.r = this.sunColor.r / 255;
      this.directionalLight.color.g = this.sunColor.g / 255;
      this.directionalLight.color.b = this.sunColor.b / 255;
    });
    lightFolder.add(this.directionalLight, "intensity", 0.0, 3.0);

    this.ambientColor = {r: 255, g: 255, b: 255};
    this.ambientControl = lightFolder.addColor(this, "ambientColor").onChange(value => {
      this.ambientLight.color.r = this.ambientColor.r / 255;
      this.ambientLight.color.g = this.ambientColor.g / 255;
      this.ambientLight.color.b = this.ambientColor.b / 255;
    });
    lightFolder.add(this.ambientLight, "intensity", 0.0, 2.0);
    lightFolder.close();

    this._gui.open();

  }

  get renderer() {
    return this._renderer;
  }

  get controls() {
    return this._controls;
  }

  get camera() {
    return this._camera;
  }

  get scene() {
    return this._scene;
  }

  onKeyDown(e) {
    if (e.keyCode == '72') {
      var infoBoxHolder = document.getElementById("infoBoxHolder");
      if (infoBoxHolder.style.visibility === "hidden") {
        infoBoxHolder.style.visibility = "visible";
      } else {
        infoBoxHolder.style.visibility = "hidden";
      }
    }
  }

  onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  start() {
    this._rafID = requestAnimationFrame(() => this.animate);
  }

  stop() {
    cancelAnimationFrame(this._rafID);
    this._rafID = null;
  }

  update(dt = 0) {
    // No-op
  }

  draw(dt = 0) {
    this.stats.update();
    this._controls.update();
    window.renderQueue.update();

    this.update();
    this._renderer.render(this._scene, this._camera);
  }

  animate(dt = 0) {
    console.log("AbstractApplication::animate - ENTER");
    this.draw();
    this._rafID = requestAnimationFrame(() => this.animate);
    console.log("AbstractApplication::animate - EXIT");
  }

}
