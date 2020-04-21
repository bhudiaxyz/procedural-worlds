import * as THREE from 'three';

const texResolution = 1024;

export default class AbstractMapTexture {

  constructor() {
    this.mats = [];
    this.maps = [];
    this.textures = [];
    this.textureCameras = [];
    this.textureScenes = [];
    this.planes = [];
    this.geos = [];

    this.setupMaterials();
    for (let i = 0; i < 6; i++) {
      this.textures.push(new THREE.WebGLRenderTarget(texResolution, texResolution, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      }));
      this.textureCameras.push(new THREE.OrthographicCamera(-texResolution / 2, texResolution / 2, texResolution / 2, -texResolution / 2, -100, 100));
      this.textureCameras[i].position.z = 10;

      this.textureScenes.push(new THREE.Scene());
      this.geos.push(new THREE.PlaneGeometry(1, 1));
      this.planes.push(new THREE.Mesh(this.geos[i], this.mats[i]));
      this.planes[i].position.z = -10;
      this.textureScenes[i].add(this.planes[i]);
      // window.renderer.render(textureScene, textureCamera, texture, true);
      this.maps.push(this.textures[i].texture);
    }
  }

  setupMaterials() {
    // Abstract
  }

  updateMaterial(props) {
    // Abstract
  }

  render(props) {
    // props.resolution

    this.updateMaterial(props);

    let resolution = props.resolution;
    for (let i = 0; i < 6; i++) {
      window.renderQueue.addAction(() => {
        this.textures[i].setSize(resolution, resolution);
        this.textures[i].needsUpdate = true;
        this.textureCameras[i].left = -resolution / 2;
        this.textureCameras[i].right = resolution / 2;
        this.textureCameras[i].top = resolution / 2;
        this.textureCameras[i].bottom = -resolution / 2;
        this.textureCameras[i].updateProjectionMatrix();
        this.geos[i] = new THREE.PlaneGeometry(resolution, resolution);
        this.planes[i].geometry = this.geos[i];
        window.renderer.render(this.textureScenes[i], this.textureCameras[i], this.textures[i], true);
        this.geos[i].dispose();
      });
    }
  }
}
