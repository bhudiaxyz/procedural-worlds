// @ts-nocheck
import * as THREE from 'three';

const SHADOW_COLOR = new THREE.Color(0x000000);

export default class CloudShadow extends THREE.Object3D {

  constructor(radius = 1002.0) {
    super();
    this.radius = radius;

    this.materials = [];
    for (let i = 0; i < 6; ++i) {
      this.materials.push(new THREE.MeshBasicMaterial({
        color: SHADOW_COLOR,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        side: THREE.FrontSide,
      }));
    }

    this.geometry = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
    const pos = this.geometry.attributes.position.array;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.length; i += 3) {
      v.set(pos[i], pos[i + 1], pos[i + 2]).normalize().multiplyScalar(this.radius);
      pos[i] = v.x; pos[i + 1] = v.y; pos[i + 2] = v.z;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();

    this.sphere = new THREE.Mesh(this.geometry, this.materials);
    this.add(this.sphere);
  }

  render({ cloudMaps }) {
    for (let i = 0; i < 6; ++i) {
      this.materials[i].alphaMap = cloudMaps[i];
      this.materials[i].needsUpdate = true;
    }
  }
}
