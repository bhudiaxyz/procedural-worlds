import AbstractApplication from "./views/AbstractApplication";
import Stars from './scene/Stars';
import Nebula from './scene/Nebula';
import SpinningBox from './scene/SpinningBox';

export default class Application extends AbstractApplication {

  constructor(opts = {}) {
    super(opts);

    this.spinningBox = new SpinningBox();
    this.scene.add(this.spinningBox);

    this.stars = new Stars();
    this.scene.add(this.stars);

    this.nebula = new Nebula();
    this.scene.add(this.nebula);
  }

  update(dt = 0) {
    this.spinningBox.update();

    this.stars.rotation.y += 0.0003;
    this.nebula.rotation.y += 0.0003;

    this.stars.position.copy(window.camera.position);
    this.nebula.position.copy(window.camera.position);
  }

}

