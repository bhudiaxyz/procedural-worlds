// @ts-nocheck
// forked from https://github.com/superguigui/Wagner/blob/master/example/index.js

import * as THREE from 'three';
import dat from 'dat-gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import AbstractApplication from '../views/AbstractApplication'

export default class Main extends AbstractApplication {

  constructor(opts = {}) {
    super(opts);
    this.cubes = [];

    this.params = {
      usePostProcessing: true,
      useFXAA: true,
      useBlur: false,
      useBloom: true
    };

    const light = new THREE.PointLight(0xFFFFFF, 1);
    light.position.copy(this._camera.position);
    this._scene.add(light);

    this.material = new THREE.MeshPhongMaterial({color: 0x3a9ceb});
    let c;
    for (let i = 0; i < 500; ++i) {
      c = this.addCube();
      this.cubes.push(c);
      this._scene.add(c);
    }

    this.initPostprocessing();
    this.initGui();
  }

  addCube() {
    let cube = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), this.material);

    cube.position.set(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * -500
    );

    cube.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    return cube;
  }

  initPostprocessing() {
    this._renderer.autoClearColor = true;
    this.composer = new EffectComposer(this._renderer);
    const renderPass = new RenderPass(this._scene, this._camera);
    this.fxaaPass = new ShaderPass(FXAAShader);
    this.bloomPass = new UnrealBloomPass(undefined, 1.5, 0.4, 0.85);
    this.composer.addPass(renderPass);
    this.composer.addPass(this.fxaaPass);
    this.composer.addPass(this.bloomPass);
  }

  initGui() {
    const gui = new dat.GUI();
    gui.add(this.params, 'usePostProcessing');
    gui.add(this.params, 'useFXAA');
    gui.add(this.params, 'useBlur');
    gui.add(this.params, 'useBloom');

    return gui;
  }

  animate() {
    super.animate();

    for (let i = 0; i < this.cubes.length; ++i) {
      this.cubes[i].rotation.y += 0.01 + ((i - this.cubes.length) * 0.00001);
      this.cubes[i].rotation.x += 0.01 + ((i - this.cubes.length) * 0.00001);
    }

    if (this.params.usePostProcessing) {
      this.fxaaPass.enabled = this.params.useFXAA;
      this.bloomPass.enabled = this.params.useBloom;
      this.composer.render();
    } else {
      this._renderer.render(this._scene, this._camera);
    }
  }
}
