import * as THREE from 'three';
import SunTexture from '../tools/SunTexture'
import ColorGUIHelper from "../utils/ColorGUIHelper";

const SUN_COLOR = new THREE.Color(1.0, 1.0, 1.0);

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
      color: SUN_COLOR.clone(),
    };

    this.sunTexture = new SunTexture();
    this.lensFlare = null;

    this.createControls();
  }

  createControls() {
    let sunFolder = window.gui.addFolder('Sun');

    sunFolder.addColor(new ColorGUIHelper(this.params, "color"), "color").onChange(value => {
      this.updateMaterial();
    });

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
    // let sunColor = new THREE.Color().setHSL(this.randRange(0.6, 1), 1, 0, 0.6);
    let sunColor = this.randomColor()
    this.params.sunSize = Math.round(this.randRange(1000, 2500));

    this.lensFlare = new THREE.LensFlare(this.sunTexture.texture, this.params.sunSize, 0.0, THREE.AdditiveBlending, sunColor);
    this.lensFlare.add(this.sunTexture.texture, this.params.sunSize * 2, 0.1, THREE.AdditiveBlending, sunColor, 0.2);

    const numSuns = this.randRange(1, 3);
    for (let i = 0; i < numSuns; ++i) {
      // let size = Math.pow(this.randRange(5, 200), 2) * 10;
      this.lensFlare.add(this.textureSun,
        this.randRange(100, 600), this.randRange(-0.1, 0.2),
        THREE.AdditiveBlending, this.randomColor(), this.randRange(0.05, 0.25));
    }

    const numFlares = this.randRange(5, 10);
    for (let i = 0; i < numFlares; ++i) {
      this.lensFlare.add(this.textureFlare,
        this.randRange(200, 500), this.randRange(-0.1, 0.2),
        THREE.AdditiveBlending, this.randomColor(true), this.randRange(0.1, 0.23));
    }

    const numLargeFlares = this.randRange(5, 15);
    for (let i = 0; i < numLargeFlares; ++i) {
      this.lensFlare.add(this.textureBlur,
        this.randRange(5, 200) * 4, this.randRange(0.05, 0.4),
        THREE.AdditiveBlending, this.randomColor(), this.randRange(0.1, 0.3));
    }

    const numSmallFlares = this.randRange(5, 25);
    for (let i = 0; i < numSmallFlares; ++i) {
      this.lensFlare.add(this.textureBlur,
        this.randRange(5, 200), this.randRange(-0.05, -0.2),
        THREE.AdditiveBlending, this.randomColor(true), this.randRange(0.1, 0.3));
    }

    const numRings = this.randRange(10, 30);
    for (let i = 0; i < numRings; ++i) {
      this.lensFlare.add(this.textureRing,
       this.randRange(200, 400), this.randRange(-0.1, 0.3),
        THREE.AdditiveBlending, this.randomColor(), this.randRange(0, 0.1));
    }

    this.lensFlare.position.set(-20000, 20000, 20000);

    this.add(this.lensFlare);
  }

  randomColor(use_base = false) {
    if (use_base) {
      let sunColor = this.params.color.getHSL();
      return new THREE.Color().setHSL(this.randRange(sunColor.h, 1.0), this.randRange(0.5, 0.9), 0.7);
    } else {
      return new THREE.Color().setHSL(this.randRange(0, 1), this.randRange(0, 0.9), 0.5);
    }
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
    this.params.color.setHSL(this.randRange(0.0, 1.0), 1.0, 1.0);

    this.updateMaterial();
  }

  render() {
    this.remove(this.lensFlare);

    this.generateTexture();
    this.createLensFlare();
  }
}
