import * as THREE from 'three'
import WAGNER from '@superguigui/wagner'
import MultiPassBloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass'
import GodrayPass from '@superguigui/wagner/src/passes/godray/godraypass'
import AbstractApplication from '../views/AbstractApplication'
import Planet from '../scene/Planet'

import shaderVert from '!raw-loader!glslify-loader!../shaders/custom.vert';
import shaderFrag from '!raw-loader!glslify-loader!../shaders/custom.frag';

class Main extends AbstractApplication {

  constructor(opts = {}) {
    super(opts);

    this.planet = new Planet();
    this.scene.add(this.planet);

    this.initPostprocessing();
  }

  initPostprocessing() {
    this._renderer.autoClearColor = true;
    this.bloom = false;
    this.composer = new WAGNER.Composer(this._renderer);
    this.bloomPass = new MultiPassBloomPass({
      blurAmount: 3,
      applyZoomBlur: true
    });
    this.godrayPass = new GodrayPass();

    let postProcessFolder = window.gui.addFolder("Post Processing");
    postProcessFolder.add(this, "bloom");
    postProcessFolder.add(this.bloomPass.params, "blurAmount", 0, 5);
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
