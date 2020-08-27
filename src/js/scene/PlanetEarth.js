import * as THREE from 'three';
import terrainFragShader from '!raw-loader!glslify-loader!../shaders/terrain.frag';
import terrainVertShader from '!raw-loader!glslify-loader!../shaders/terrain.vert';
import atmosphereFragShader from '!raw-loader!glslify-loader!../shaders/atmosphere.frag';
import cloudsFragShader from '!raw-loader!glslify-loader!../shaders/clouds.frag';
import standardVertShader from '!raw-loader!glslify-loader!../shaders/standard.vert';
import waterFragShader from '!raw-loader!glslify-loader!../shaders/water.frag';

const imgGrass = require('../../assets/textures/terrain/grass3.jpg');
const imgMoon = require('../../assets/textures/planets/moon.png');
const imgSand = require('../../assets/textures/terrain/sand2.jpg');
const imgSnow = require('../../assets/textures/terrain/snow2.jpg');
const imgStone = require('../../assets/textures/terrain/stone2.jpg');
const imgWater = require('../../assets/textures/terrain/water1.jpg');
const imgWaterNormals = require('../../assets/textures/terrain/water_normals1.jpg');

export default class PlanetEarth extends THREE.Object3D {
  constructor(
    random,
    radius = 1000.0,
    detail = 6,
    widthSegments = 64,
    heightSegments = 64
  ) {
    super();

    this.random = random;

    this.params = {
      // General
      rotate: true,

      // Earth
      earth: {
        visible: true,
        radius: radius,
        speed: 0.000005,
        roughness: 0.01137,
        lacunarity: 0.00125,
        rotation: new THREE.Vector3(0.0, 0.003, 0.000)
      },

      // Ocean
      ocean: {
        visible: true,
        radius: radius * 0.9999,
        speed: 0.0000275963,
        waterLevel: 0.0,
      },

      // Clouds
      clouds: {
        visible: true,
        radius: radius * 1.035,
        speed: 0.00002140,
        rangeFactor: 0.29,
        smoothness: 2.6,
        rotation: new THREE.Vector3(0.000053, -0.00138, 0.00003)
      },

      // Atmosphere
      atmosphere: {
        visible: true,
        radius: radius * 1.025,
        speed: 0.00002140
      },

      // Moon
      moon: {
        visible: true,
        radius: radius * 0.27,
        speed: 0.00015,
        positionX: radius * 5.36,
        roughness: 0.031,
        lacunarity: 0.076
      },

      // Lighting
      light: {
        position: new THREE.Vector3().copy(window.light.position).multiplyScalar(radius),
        color: new THREE.Vector4(window.light.color.r, window.light.color.g, window.light.color.b, 1.0),
        intensity: window.light.intensity
      }
    };

    this.setupPlanetEarth(detail, widthSegments, heightSegments);
    this.setupEarthMoon(detail, widthSegments, heightSegments);

    this.createControls();
  }

  setupPlanetEarth(detail, widthSegments, heightSegments) {
    const image_resolution = 1024.0;

    const textureLoader = new THREE.TextureLoader();
    this.earthPivotPoint = new THREE.Object3D();

    // Earth sphere
    this.earthMesh = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(this.params.earth.radius, detail),
      new THREE.ShaderMaterial({
        uniforms: {
          texWater: {type: "t", value: textureLoader.load(imgWater)},
          texSand: {type: "t", value: textureLoader.load(imgSand)},
          texGrass: {type: "t", value: textureLoader.load(imgGrass)},
          texStone: {type: "t", value: textureLoader.load(imgStone)},
          texSnow: {type: "t", value: textureLoader.load(imgSnow)},
          lightPosition: {type: "v3", value: this.params.light.position},
          lightColor: {type: 'v4', value: this.params.light.color},
          lightIntensity: {type: 'f', value: this.params.light.intensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: this.params.earth.radius},
          roughness: {type: "f", value: this.params.earth.roughness},
          lacunarity: {type: "f", value: this.params.earth.lacunarity},
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
      new THREE.IcosahedronBufferGeometry(this.params.ocean.radius, detail),
      new THREE.ShaderMaterial({
        uniforms: {
          texWater: {type: "t", value: waterNormals},
          lightPosition: {type: "v3", value: this.params.light.position},
          lightColor: {type: 'v4', value: this.params.light.color},
          lightIntensity: {type: 'f', value: this.params.light.intensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: this.params.ocean.radius},
          roughness: {type: "f", value: this.params.earth.roughness * 2.7},
          lacunarity: {type: "f", value: this.params.earth.lacunarity * 3.14},
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
      new THREE.SphereGeometry(this.params.atmosphere.radius, widthSegments, heightSegments),
      new THREE.ShaderMaterial({
        uniforms: {
          lightPosition: {type: "v3", value: this.params.light.position},
          lightColor: {type: 'v4', value: this.params.light.color},
          lightIntensity: {type: 'f', value: this.params.light.intensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: this.params.atmosphere.radius},
          roughness: {type: "f", value: this.params.earth.roughness},
          lacunarity: {type: "f", value: this.params.earth.lacunarity},
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
      new THREE.SphereGeometry(this.params.clouds.radius, widthSegments, heightSegments),
      new THREE.ShaderMaterial({
        uniforms: {
          lightPosition: {type: "v3", value: this.params.light.position},
          lightColor: {type: 'v4', value: this.params.light.color},
          lightIntensity: {type: 'f', value: this.params.light.intensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: this.params.clouds.radius},
          resolution: {type: "f", value: image_resolution},
          baseColor: {type: "v3", value: new THREE.Vector3(0.65, 0.65, 0.65)},
          rangeFactor: {type: "f", value: this.params.clouds.rangeFactor},
          smoothness: {type: "f", value: this.params.clouds.smoothness},
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

  setupEarthMoon(detail, widthSegments, heightSegments) {
    const textureLoader = new THREE.TextureLoader();

    // Moon
    const moonTexture = textureLoader.load(imgMoon);
    this.moonMesh = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(this.params.moon.radius, detail),
      new THREE.ShaderMaterial({
        uniforms: {
          texWater: {type: "t", value: moonTexture},
          texSand: {type: "t", value: moonTexture},
          texGrass: {type: "t", value: moonTexture},
          texStone: {type: "t", value: moonTexture},
          texSnow: {type: "t", value: moonTexture},
          lightPosition: {type: "v3", value: this.params.light.position},
          lightColor: {type: 'v4', value: this.params.light.color},
          lightIntensity: {type: 'f', value: this.params.light.intensity},
          time: {type: "f", value: 0.0},
          radius: {type: "f", value: this.params.moon.radius},
          roughness: {type: "f", value: this.params.moon.roughness},
          lacunarity: {type: "f", value: this.params.moon.lacunarity},
          seed: {type: "f", value: this.random() * 7}
        },
        vertexShader: terrainVertShader,
        fragmentShader: terrainFragShader
      })
    );
    this.moonMesh.position.set(this.params.moon.positionX, 0, 0); // relative to earth
    this.moonMesh.rotation.y = -180.0; // so dark-side of moon is facing out from earth point of view
    this.add(this.moonMesh);
    this.earthPivotPoint.add(this.moonMesh); // Moon pivots around (and parented to) the earth.
  }

  createControls() {
    let f = window.gui.addFolder('Planet');
    f.add(this.params.earth, "visible").onChange(value => {
      this.earthMesh.visible = value;
    });
    f.add(this.params, 'rotate');
    f.add(this.params.earth, 'speed', -0.001, 0.001);
    f.add(this.params.earth, 'roughness', 0.0, 0.1).onChange(value => {
      this.updateMaterial();
    });
    f.add(this.params.earth, 'lacunarity', -1.0, 1.0).onChange(value => {
      this.updateMaterial();
    });
    f.add(this.params.earth.rotation, 'x').name('Rotation X').min(-0.05).max(0.05);
    f.add(this.params.earth.rotation, 'y').name('Rotation Y').min(-0.05).max(0.05);
    f.add(this.params.earth.rotation, 'z').name('Rotation Z').min(-0.05).max(0.05);
    f.close();

    f = window.gui.addFolder("Oceans");
    f.add(this.params.ocean, "visible").onChange(value => {
      this.oceanMesh.visible = value;
    });

    f = window.gui.addFolder("Clouds");
    f.add(this.params.clouds, 'visible').onChange(value => {
      this.cloudsMesh.visible = value;
    });
    f.add(this.params.clouds, 'speed', 0.0, 0.001);
    f.add(this.params.clouds, 'rangeFactor', 0.0, 3.0).onChange(value => {
      this.updateMaterial();
    });
    f.add(this.params.clouds, 'smoothness', 0.0, 3.0).onChange(value => {
      this.updateMaterial();
    });
    f.add(this.params.clouds.rotation, 'x').name('Rotation X').min(-0.05).max(0.05);
    f.add(this.params.clouds.rotation, 'y').name('Rotation Y').min(-0.05).max(0.05);
    f.add(this.params.clouds.rotation, 'z').name('Rotation Z').min(-0.05).max(0.05);
    f.close();

    f = window.gui.addFolder("Atmosphere");
    f.add(this.params.atmosphere, 'visible').onChange(value => {
      this.atmosphereMesh.visible = value;
    });
    f.close();

    f = window.gui.addFolder("Moon");
    f.add(this.params.moon, 'visible').onChange(value => {
      this.moonMesh.visible = value;
    });
    f.add(this.params.moon, 'speed', -0.05, 0.05);
    f.add(this.params.moon, 'roughness', 0.0, 2.0).onChange(value => {
      this.updateMaterial();
    });
    f.add(this.params.moon, 'lacunarity', 0.0, 2.0).onChange(value => {
      this.updateMaterial();
    });
    f.close();
  }

  randomize() {
    this.earthMesh.material.uniforms.seed.value = this.random() * 7.0;
    this.oceanMesh.material.uniforms.seed.value = this.random() * 7.0;
    this.atmosphereMesh.material.uniforms.seed.value = this.random() * 7.0;
    this.cloudsMesh.material.uniforms.seed.value = this.random() * 7.0;
    this.moonMesh.material.uniforms.seed.value = this.random() * 7.0;
  }

  updateMaterial() {
    const lightPosition = new THREE.Vector3().copy(window.light.position).multiplyScalar(this.params.earth.radius)
    const lightColor = new THREE.Vector4(window.light.color.r, window.light.color.g, window.light.color.b, 1.0);

    // Earth Moon
    this.moonMesh.material.uniforms.lightPosition.value.copy(lightPosition);
    this.moonMesh.material.uniforms.lightColor.value.copy(lightColor);
    this.moonMesh.material.uniforms.lightIntensity.value = window.light.intensity;
    this.moonMesh.material.uniforms.roughness.value = this.params.moon.roughness;
    this.moonMesh.material.uniforms.lacunarity.value = this.params.moon.lacunarity;

    // Planet Earth
    this.earthMesh.material.uniforms.lightPosition.value.copy(lightPosition);
    this.earthMesh.material.uniforms.lightColor.value.copy(lightColor);
    this.earthMesh.material.uniforms.lightIntensity.value = window.light.intensity;
    this.earthMesh.material.uniforms.roughness.value = this.params.earth.roughness;
    this.earthMesh.material.uniforms.lacunarity.value = this.params.earth.lacunarity;

    this.oceanMesh.material.uniforms.lightPosition.value.copy(lightPosition);
    this.oceanMesh.material.uniforms.lightColor.value.copy(lightColor);
    this.oceanMesh.material.uniforms.lightIntensity.value = window.light.intensity;
    this.oceanMesh.material.uniforms.roughness.value = this.params.earth.roughness * 2.7;
    this.oceanMesh.material.uniforms.lacunarity.value = this.params.earth.lacunarity * 3.14;

    this.atmosphereMesh.material.uniforms.lightPosition.value.copy(lightPosition);
    this.atmosphereMesh.material.uniforms.lightColor.value.copy(lightColor);
    this.atmosphereMesh.material.uniforms.lightIntensity.value = window.light.intensity;
    this.atmosphereMesh.material.uniforms.roughness.value = this.params.earth.roughness;
    this.atmosphereMesh.material.uniforms.lacunarity.value = this.params.earth.lacunarity;

    this.cloudsMesh.material.uniforms.lightPosition.value.copy(lightPosition);
    this.cloudsMesh.material.uniforms.lightColor.value.copy(lightColor);
    this.cloudsMesh.material.uniforms.lightIntensity.value = window.light.intensity;
    this.cloudsMesh.material.uniforms.rangeFactor.value = this.params.clouds.rangeFactor;
    this.cloudsMesh.material.uniforms.smoothness.value = this.params.clouds.smoothness;
  }

  update(dt = 0) {
    // Earth Moon
    this.moonMesh.material.uniforms.time.value = this.params.moon.speed * 0.1;

    // Planet Earth
    this.earthMesh.material.uniforms.time.value = this.params.earth.speed * 0.1;
    this.oceanMesh.material.uniforms.time.value += this.params.ocean.speed * 0.15;
    this.atmosphereMesh.material.uniforms.time.value = this.params.atmosphere.speed * 0.1;
    this.cloudsMesh.material.uniforms.time.value += this.params.clouds.speed * 0.2;

    this.cloudsMesh.rotation.x += this.params.clouds.rotation.x;
    this.cloudsMesh.rotation.y += this.params.clouds.rotation.y;
    this.cloudsMesh.rotation.z += this.params.clouds.rotation.z;

    if (this.params.rotate) {
      this.earthMesh.rotation.x += this.params.earth.rotation.x;
      this.earthMesh.rotation.y += this.params.earth.rotation.y;
      this.earthMesh.rotation.z += this.params.earth.rotation.z;

      this.earthPivotPoint.rotation.y += this.params.moon.speed;
    }
  }

  renderUI() {
    // No-op
  }

  render() {
    this.randomize();
  }
}
