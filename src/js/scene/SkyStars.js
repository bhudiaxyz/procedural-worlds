import * as THREE from 'three';

const imgSpaceStar = require('../../assets/textures/space/star-cluster.png');

export default class SkyStars extends THREE.Object3D {
  constructor(
    random,
    params,
    radius = 4375,
    spread = 175,
    count = 500
  ) {
    super();

    this.random = random;
    this.params = params;
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load(imgSpaceStar);

    const geometry = new THREE.Geometry();

    for (let i = 0; i < count; i += 1) {
      // Generate a random point around a (randomized) sphere (using polar co-ords) - http://corysimon.github.io/articles/uniformdistn-on-sphere/
      const sphere = radius + this.random() * spread;
      const theta = 2 * Math.PI * this.random();
      const phi = Math.acos(1 - 2 * this.random());
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      geometry.vertices.push(new THREE.Vector3(sphere * x, sphere * y, sphere * z));
    }

    const material = new THREE.PointsMaterial({
      size: 32,
      map: bgTexture,
      transparent: true,
      // alphaTest's default is 0 and the particles overlap. Any value > 0 prevents the particles from overlapping.
      alphaTest: 0.5,
    });

    this.mesh = new THREE.Points(geometry, material);
    this.mesh.position.set(0, 0, 0);
    this.add(this.mesh);
  }

  update(dt = 0) {
    this.mesh.rotation.y += this.params.starSpeed;
  }
};
