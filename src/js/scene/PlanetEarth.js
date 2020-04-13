import * as THREE from 'three';

const imgGrass = require('../../assets/textures/terrain/grass1.jpg');
const imgMoon = require('../../assets/textures/planets/moon.png');
const imgSand = require('../../assets/textures/terrain/sand1.jpg');
const imgSnow = require('../../assets/textures/terrain/snow1.jpg');
const imgStone = require('../../assets/textures/terrain/stone2.jpg');
const imgWater = require('../../assets/textures/terrain/water3.jpg');
const imgWaterNormals = require('../../assets/textures/terrain/waternormals.jpg');

import atmosphereFragShader from '!raw-loader!glslify-loader!../shaders/atmosphere.frag';
import cloudsFragShader from '!raw-loader!glslify-loader!../shaders/clouds.frag';
import standardVertShader from '!raw-loader!glslify-loader!../shaders/standard.vert';
import terrainFragShader from '!raw-loader!glslify-loader!../shaders/terrain.frag';
import terrainVertShader from '!raw-loader!glslify-loader!../shaders/terrain.vert';
import waterFragShader from '!raw-loader!glslify-loader!../shaders/water.frag';

export default class PlanetEarth extends THREE.Object3D {
  constructor(
    random,
    params,
    radius = 25.0,
    detail = 6,
    widthSegments = 64,
    heightSegments = 64
  ) {
    super();

    this.random = random;
    this.params = params;
    this.setupPlanetEarth(radius, detail, widthSegments, heightSegments);
    this.setupEarthMoon(radius, detail);
  }

  setupPlanetEarth(radius, detail, widthSegments, heightSegments) {
    const atmosphere_radius = radius * 1.085;
    const clouds_radius = radius * 1.07;
    const ocean_radius = radius * 1.0002;
    const image_resolution = 1024.0;

    const textureLoader = new THREE.TextureLoader();
    this.earthPivotPoint = new THREE.Object3D();

    // Earth sphere
    this.earthMesh = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(radius, detail),
      new THREE.ShaderMaterial({
        uniforms: {
          texWater: {type: "t", value: textureLoader.load(imgWater)},
          texSand: {type: "t", value: textureLoader.load(imgSand)},
          texGrass: {type: "t", value: textureLoader.load(imgGrass)},
          texStone: {type: "t", value: textureLoader.load(imgStone)},
          texSnow: {type: "t", value: textureLoader.load(imgSnow)},
          lightPosition: {type: 'v3', value: this.params.dirLightPosition},
          lightColor: {type: 'v4', value: this.params.dirLightColorV4},
          lightIntensity: {type: 'f', value: this.params.dirLightIntensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: radius},
          roughness: {type: "f", value: this.params.earthRoughness},
          lacunarity: {type: "f", value: this.params.earthLacunarity},
          seed: {type: "f", value: this.random() * 7}
        },
        vertexShader: terrainVertShader,
        fragmentShader: terrainFragShader
      })
    );
    this.earthMesh.position.set(0, 0, 0);
    this.earthMesh.castShadow = true; // default is false
    this.earthMesh.receiveShadow = true; //default is false
    this.earthMesh.add(this.earthPivotPoint); // pivot is tied to earth

    // Earth ocean
    const waterNormals = textureLoader.load(imgWaterNormals);
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    this.oceanMesh = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(radius, detail),
      new THREE.ShaderMaterial({
        uniforms: {
          texWater: {type: "t", value: waterNormals},
          lightPosition: {type: 'v3', value: this.params.dirLightPosition},
          lightColor: {type: 'v4', value: this.params.dirLightColorV4},
          lightIntensity: {type: 'f', value: this.params.dirLightIntensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: ocean_radius},
          roughness: {type: "f", value: this.params.earthRoughness * 2.7},
          lacunarity: {type: "f", value: this.params.earthLacunarity * 3.14},
          seed: {type: "f", value: this.random() * 7}
        },
        vertexShader: standardVertShader,
        fragmentShader: waterFragShader
      })
    );
    this.oceanMesh.position.set(0, 0, 0); // relative to earth
    this.oceanMesh.castShadow = true; // default is false
    this.oceanMesh.receiveShadow = true; //default is false
    this.earthMesh.add(this.oceanMesh);

    // Earth Atmosphere Shader
    this.atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(atmosphere_radius, widthSegments, heightSegments),
      new THREE.ShaderMaterial({
        uniforms: {
          lightPosition: {type: 'v3', value: this.params.dirLightPosition},
          lightColor: {type: 'v4', value: this.params.dirLightColorV4},
          lightIntensity: {type: 'f', value: this.params.dirLightIntensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: atmosphere_radius},
          roughness: {type: "f", value: this.params.earthRoughness},
          lacunarity: {type: "f", value: this.params.earthLacunarity},
          seed: {type: "f", value: this.random() * 7}
        },
        vertexShader: standardVertShader,
        fragmentShader: atmosphereFragShader,
        side: THREE.BackSide,
        transparent: true
      })
    );
    this.atmosphereMesh.position.set(0, 0, 0); // relative to earth
    this.atmosphereMesh.castShadow = true; // default is false
    this.atmosphereMesh.receiveShadow = true; //default is false
    this.earthMesh.add(this.atmosphereMesh);

    // Earth Clouds Shader
    this.cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(clouds_radius, widthSegments, heightSegments),
      new THREE.ShaderMaterial({
        uniforms: {
          lightPosition: {type: 'v3', value: this.params.dirLightPosition},
          lightColor: {type: 'v4', value: this.params.dirLightColorV4},
          lightIntensity: {type: 'f', value: this.params.dirLightIntensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: clouds_radius},
          resolution: {type: "f", value: image_resolution},
          baseColor: {type: "v3", value: new THREE.Vector3(0.65, 0.65, 0.65)},
          rangeFactor: {type: "f", value: this.params.cloudRangeFactor},
          smoothness: {type: "f", value: this.params.cloudSmoothness},
          seed: {type: "f", value: this.random() * 7}
        },
        vertexShader: standardVertShader,
        fragmentShader: cloudsFragShader,
        side: THREE.DoubleSide,
        transparent: true
      })
    );
    this.cloudsMesh.position.set(0, 0, 0); // relative to earth
    this.cloudsMesh.castShadow = true; // default is false
    this.cloudsMesh.receiveShadow = true; //default is false
    this.earthMesh.add(this.cloudsMesh);

    this.add(this.earthMesh);
  }

  setupEarthMoon(radius, detail) {
    const moon_radius = radius * 0.27;
    const moon_posx = radius * 5.36;

    const textureLoader = new THREE.TextureLoader();

    // Moon
    const moonTexture = textureLoader.load(imgMoon);
    this.moonMesh = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(moon_radius, detail),
      new THREE.ShaderMaterial({
        uniforms: {
          texWater: {type: "t", value: moonTexture},
          texSand: {type: "t", value: moonTexture},
          texGrass: {type: "t", value: moonTexture},
          texStone: {type: "t", value: moonTexture},
          texSnow: {type: "t", value: moonTexture},

          lightPosition: {type: 'v3', value: this.params.dirLightPosition},
          lightColor: {type: 'v4', value: this.params.dirLightColorV4},
          lightIntensity: {type: 'f', value: this.params.dirLightIntensity},

          time: {type: "f", value: 0.0},
          radius: {type: "f", value: moon_radius},
          roughness: {type: "f", value: this.params.moonRoughness},
          lacunarity: {type: "f", value: this.params.moonLacunarity},
          seed: {type: "f", value: this.random() * 7}
        },
        vertexShader: terrainVertShader,
        fragmentShader: terrainFragShader
      })
    );
    this.moonMesh.position.set(moon_posx, 0, 0); // relative to earth
    this.moonMesh.rotation.y = -180.0; // so dark-side of moon is facing out from earth point of view
    this.add(this.moonMesh);
    this.earthPivotPoint.add(this.moonMesh); // Moon pivots around (and parented to) the earth.
  }

  randomize() {
    this.earthMesh.material.uniforms.seed.value = this.random() * 7.0;
    this.oceanMesh.material.uniforms.seed.value = this.random() * 7.0;
    this.atmosphereMesh.material.uniforms.seed.value = this.random() * 7.0;
    this.cloudsMesh.material.uniforms.seed.value = this.random() * 7.0;
    this.moonMesh.material.uniforms.seed.value = this.random() * 7.0;
  }

  update(dt = 0) {
    // Earth Moon
    this.moonMesh.visible = this.params.moonVisible;
    this.moonMesh.material.uniforms.time.value = this.params.moonSpeed * 0.1;
    this.moonMesh.material.uniforms.roughness.value = this.params.moonRoughness;
    this.moonMesh.material.uniforms.lacunarity.value = this.params.moonLacunarity;

    // Planet Earth
    this.earthMesh.material.uniforms.time.value = this.params.earthSpeed * 0.1;
    this.earthMesh.material.uniforms.roughness.value = this.params.earthRoughness;
    this.earthMesh.material.uniforms.lacunarity.value = this.params.earthLacunarity;

    this.oceanMesh.material.uniforms.time.value = this.params.oceanSpeed * 0.15;
    this.oceanMesh.visible = this.params.oceanVisible;

    this.cloudsMesh.material.uniforms.time.value = this.params.cloudSpeed * 0.2;
    this.cloudsMesh.visible = this.params.cloudsVisible;
    this.cloudsMesh.material.uniforms.rangeFactor.value = this.params.cloudRangeFactor;
    this.cloudsMesh.material.uniforms.smoothness.value = this.params.cloudSmoothness;

    this.cloudsMesh.rotation.x += this.params.cloudRotation.x;
    this.cloudsMesh.rotation.y += this.params.cloudRotation.y;
    this.cloudsMesh.rotation.z += this.params.cloudRotation.z;

    if (this.params.rotate) {
      this.earthMesh.rotation.x += this.params.earthRotation.x;
      this.earthMesh.rotation.y += this.params.earthRotation.y;
      this.earthMesh.rotation.z += this.params.earthRotation.z;

      this.earthPivotPoint.rotation.y += this.params.moonSpeed;
    }
  }
};
