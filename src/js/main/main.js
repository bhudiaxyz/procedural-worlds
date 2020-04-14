import * as THREE from 'three'
import WAGNER from '@superguigui/wagner/'
import MultiPassBloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass'
import GodrayPass from '@superguigui/wagner/src/passes/godray/godraypass'
import AbstractApplication from '../views/AbstractApplication'
import Planet from '../scene/Planet'
import RenderQueue from '../utils/RenderQueue'

import shaderVert from '!raw-loader!glslify-loader!../shaders/custom.vert';
import shaderFrag from '!raw-loader!glslify-loader!../shaders/custom.frag';

class Main extends AbstractApplication {

  constructor(opts = {}) {
    super();

    // texture loading example
    // var texture = new THREE.TextureLoader().load( 'assets/textures/crate.gif' );

    this.initPostprocessing();
    // this.createBrandTag();

    window.renderQueue = new RenderQueue();

    this.planet = new Planet();
    this.scene.add(this.planet.view);
  }

  initPostprocessing() {
    this._renderer.autoClearColor = true;
    this.composer = new WAGNER.Composer(this._renderer);
    this.bloomPass = new MultiPassBloomPass({
      blurAmount: 3,
      applyZoomBlur: true
    });
    this.godrayPass = new GodrayPass();

    let folder = window.gui.addFolder("Post Processing");
    this.bloom = false;
    folder.add(this, "bloom");
    folder.add(this.bloomPass.params, "blurAmount", 0, 5);


  }

  createBrandTag() {
    let a = document.createElement("a");
    a.href = "http://www.colordodge.com";
    a.innerHTML = "<div id='brandTag'>Colordodge</div>";
    document.body.appendChild(a);
  }

  animate() {
    super.animate();

    window.renderQueue.update();
    this.planet.update();

    if (this.bloom) {
      this.composer.reset();
      this.composer.render(this._scene, this._camera);
      this.composer.pass(this.bloomPass);
      this.composer.pass(this.godrayPass);
      this.composer.toScreen();
    }
  }

}

export default Main;
