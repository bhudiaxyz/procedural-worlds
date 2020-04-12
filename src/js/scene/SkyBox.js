import * as THREE from 'three';

const imgSkyboxNx = require('../../assets/textures/space/dark-s_nx.jpg');
const imgSkyboxNy = require('../../assets/textures/space/dark-s_ny.jpg');
const imgSkyboxNz = require('../../assets/textures/space/dark-s_nz.jpg');
const imgSkyboxPx = require('../../assets/textures/space/dark-s_px.jpg');
const imgSkyboxPy = require('../../assets/textures/space/dark-s_py.jpg');
const imgSkyboxPz = require('../../assets/textures/space/dark-s_pz.jpg');

export default class SkyBox extends THREE.Object3D {
  constructor(
    radius = 3750,
    widthSegments = 64,
    heightSegments = 64,
  ) {
    super();
    let loader = new THREE.CubeTextureLoader();

    const textureCube = loader.load([
      imgSkyboxPx, imgSkyboxNx,
      imgSkyboxPy, imgSkyboxNy,
      imgSkyboxPz, imgSkyboxNz
    ]);
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, widthSegments, heightSegments),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        envMap: textureCube,
        side: THREE.BackSide,
        transparent: true
      })
    );
    this.add(this.mesh);
  }

  update(dt = 0) {
    // No-op
  }
};
