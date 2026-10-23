// @ts-nocheck
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
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
    this.params.sunSize = Math.round(this.randRange(700, 1200));

    this.lensFlare = new Lensflare();
    this.lensFlare.addElement(new LensflareElement(this.sunTexture.texture, this.params.sunSize, 0.0, sunColor));
    this.lensFlare.addElement(new LensflareElement(this.sunTexture.texture, this.params.sunSize * 0.6, 0.1, sunColor));

    const numSuns = this.randRange(1, 2);
    for (let i = 0; i < numSuns; ++i) {
      this.lensFlare.addElement(new LensflareElement(this.textureSun,
        this.randRange(200, 500), this.randRange(-0.1, 0.2),
        this.randomColor()));
    }

    const numFlares = this.randRange(2, 5);
    for (let i = 0; i < numFlares; ++i) {
      this.lensFlare.addElement(new LensflareElement(this.textureFlare,
        this.randRange(150, 400), this.randRange(-0.1, 0.2),
        this.randomColor(true)));
    }

    const numLargeFlares = this.randRange(1, 3);
    for (let i = 0; i < numLargeFlares; ++i) {
      this.lensFlare.addElement(new LensflareElement(this.textureBlur,
        this.randRange(200, 500), this.randRange(0.05, 0.4),
        this.randomColor()));
    }

    const numSmallFlares = this.randRange(2, 6);
    for (let i = 0; i < numSmallFlares; ++i) {
      this.lensFlare.addElement(new LensflareElement(this.textureBlur,
        this.randRange(80, 250), this.randRange(-0.05, -0.2),
        this.randomColor(true)));
    }

    const numRings = this.randRange(4, 10);
    for (let i = 0; i < numRings; ++i) {
      this.lensFlare.addElement(new LensflareElement(this.textureRing,
        this.randRange(150, 450), this.randRange(-0.1, 0.3),
        this.randomColor()));
    }

    this.lensFlare.position.set(-20000, 20000, 20000);

    this.add(this.lensFlare);
  }

  randomColor(use_base = false) {
    if (use_base) {
      let sunColor = this.params.color.getHSL({ h: 0, s: 0, l: 0 });
      return new THREE.Color().setHSL(this.randRange(sunColor.h, 1.0), this.randRange(0.4, 0.7), 0.3);
    } else {
      return new THREE.Color().setHSL(this.randRange(0, 1), this.randRange(0.3, 0.6), 0.25);
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
    this.params.color.setHSL(this.randRange(0.0, 1.0), 0.6, 0.8);

    this.updateMaterial();
  }

  render() {
    this.remove(this.lensFlare);

    this.generateTexture();
    this.createLensFlare();
  }
}
