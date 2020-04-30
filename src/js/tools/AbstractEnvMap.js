import * as THREE from 'three';

const texResolution = 1024;

export default class AbstractEnvMap {

  constructor() {
    this.materials = [];
    this.maps = [];
    this.textures = [];
    this.textureCameras = [];
    this.textureScenes = [];
    this.planes = [];
    this.geometries = [];

    this.setupMaterials();

    for (let i = 0; i < 6; ++i) {
      this.textures.push(new THREE.WebGLRenderTarget(texResolution, texResolution, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      }));
      this.textureCameras.push(new THREE.OrthographicCamera(-texResolution / 2, texResolution / 2, texResolution / 2, -texResolution / 2, -100, 100));
      this.textureCameras[i].position.z = 10;

      this.textureScenes.push(new THREE.Scene());
      this.geometries.push(new THREE.PlaneGeometry(1, 1));
      this.planes.push(new THREE.Mesh(this.geometries[i], this.materials[i]));
      this.planes[i].position.z = -10;
      this.textureScenes[i].add(this.planes[i]);
      // window.renderer.render(textureScene, textureCamera, texture, true);
      this.maps.push(this.textures[i].texture);
    }
  }

  visible(is_visible) {
    for (let i = 0; i < 6; ++i) {
      this.geometries[i] = is_visible;
    }
  }

  setupMaterials() {
    // Abstract - initialise this.materials
  }

  updateMaterials(props) {
    // Abstract - update this.materials settings
  }

  render(props) {
    // props.resolution

    this.updateMaterials(props);

    let resolution = props.resolution;
    for (let i = 0; i < 6; ++i) {
      window.renderQueue.addAction(() => {
        this.textures[i].setSize(resolution, resolution);
        this.textures[i].needsUpdate = true;
        this.textureCameras[i].left = -resolution / 2;
        this.textureCameras[i].right = resolution / 2;
        this.textureCameras[i].top = resolution / 2;
        this.textureCameras[i].bottom = -resolution / 2;
        this.textureCameras[i].updateProjectionMatrix();
        if (this.geometries[i])
          this.geometries[i].dispose();
        this.geometries[i] = new THREE.PlaneGeometry(resolution, resolution);
        this.planes[i].geometry = this.geometries[i];
        window.renderer.render(this.textureScenes[i], this.textureCameras[i], this.textures[i], true);
      });
    }
  }
}
