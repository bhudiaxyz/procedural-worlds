import * as THREE from 'three';
import SunTexture from '../tools/SunTexture'

export default class Sun extends THREE.Object3D {

  constructor() {
    super();

    let loader = new THREE.TextureLoader();
    this.textureFlare = loader.load('assets/textures/flare/lensFlareSun.jpg');
    this.textureRing = loader.load('assets/textures/flare/lensFlareRing.jpg');
    this.textureBlur = loader.load('assets/textures/flare/lensFlareBlur.jpg');
    this.textureSun = loader.load('assets/textures/flare/lensFlare.jpg');

    this.params = {
      showTextureMap: false,
      sunSize: 1500,
      color: new THREE.Color(0xffffff),
    };

    this.sunTexture = new SunTexture();
    this.lensFlare = null;

    this.createControls();
  }

  createControls() {
    let sunFolder = window.gui.addFolder('Sun');

    // glowFolder.addColor(new ColorGUIHelper(this.params, "color"), "color").onChange(value => {
    //   this.updateMaterial();
    // });

    sunFolder.add(this.params, "showTextureMap").onChange(value => {
      if (this.sunTexture) {
        this.sunTexture.visibleCanvas(value);
      }
    });
  }

  update() {
    // No-op
  }

  createLensFlare() {
    let h = this.randRange(0, 1);
    let s = 1.0;
    let l = 1.0;
    var sunColor = new THREE.Color().setHSL(h, s, l);
    // var sunColor2 = new THREE.Color().setHSL(this.randRange(0, 1), s, 0.5);
    this.params.sunSize = Math.round(this.randRange(1000, 2500));

    this.lensFlare = new THREE.LensFlare(this.sunTexture.texture, this.params.sunSize, 0.0, THREE.AdditiveBlending, sunColor);
    this.lensFlare.add(this.sunTexture.texture, this.params.sunSize * 2, 0.1, THREE.AdditiveBlending, sunColor, 0.2);

    const numSuns = this.randRange(1, 3);
    for (let i = 0; i < numSuns; ++i) {
      let size = this.randRange(100, 600);
      let offset = this.randRange(-0.1, 0.2);
      let color = this.randomColor();
      let alpha = this.randRange(0.05, 0.25);
      this.lensFlare.add(this.textureSun, size, offset, THREE.AdditiveBlending, color, alpha);
    }

    const numFlares = this.randRange(5, 10);
    for (let i = 0; i < numFlares; ++i) {
      let size = this.randRange(200, 500);
      let offset = this.randRange(-0.1, 0.2);
      let color = this.randomColor();
      let alpha = this.randRange(0.1, 0.23);
      this.lensFlare.add(this.textureFlare, size, offset, THREE.AdditiveBlending, color, alpha);
    }

    const numLargeFlares = this.randRange(5, 15);
    for (let i = 0; i < numLargeFlares; ++i) {
      let size = this.randRange(5, 200);
      // size = Math.pow(size, 2) * 200;
      let offset = this.randRange(0.05, 0.4);
      let color = this.randomColor();
      let alpha = this.randRange(0.1, 0.3);
      this.lensFlare.add(this.textureBlur, size, offset, THREE.AdditiveBlending, color, alpha);
    }

    const numSmallFlares = this.randRange(5, 25);
    for (let i = 0; i < numSmallFlares; ++i) {
      let size = this.randRange(5, 200);
      // size = Math.pow(size, 2) * 200;
      let offset = this.randRange(-0.05, -0.2);
      let color = this.randomColor();
      let alpha = this.randRange(0.1, 0.3);
      this.lensFlare.add(this.textureBlur, size, offset, THREE.AdditiveBlending, color, alpha);
    }

    const numRings = this.randRange(10, 30);
    for (let i = 0; i < numRings; ++i) {
      let size = this.randRange(200, 400);
      // size = Math.pow(size, 2) * 200;
      let offset = this.randRange(-0.1, 0.3);
      let color = this.randomColor();
      let alpha = this.randRange(0, 0.1);
      this.lensFlare.add(this.textureRing, size, offset, THREE.AdditiveBlending, color, alpha);
    }

    this.lensFlare.position.set(-20000, 20000, 20000);

    this.add(this.lensFlare);
  }

  randomColor() {
    return new THREE.Color().setHSL(
      this.randRange(0, 1),
      this.randRange(0, 0.9),
      0.5);
  }

  randRange(low, high) {
    let range = high - low;
    let n = Math.random() * range;
    return low + n;
  }

  generateTexture() {
    this.sunTexture.generateTexture({});
  }

  updateMaterial() {
    // No-op
  }

  randomizeColor() {
    this.params.color.setHSL(
      this.randRange(0.0, 1.0),
      1.0,
      1.0
    );

    this.updateMaterial();
  }

  render() {
    this.remove(this.lensFlare);

    this.generateTexture();
    this.createLensFlare();
  }
}
