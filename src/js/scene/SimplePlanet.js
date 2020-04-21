import * as THREE from 'three';

import Biome from "../tools/Biome";
import NebulaeGradient from "../tools/NebulaeGradient";

import terrainVertShader from '!raw-loader!glslify-loader!../shaders/terrain.vert';
import terrainFragShader from '!raw-loader!glslify-loader!../shaders/terrain.frag';

export default class SimplePlanet extends THREE.Object3D {
  constructor(
    random,
    radius = 1000.0,
    detail = 6) {
    super();

    this.params = {
      waterLevel: 0.0,
      oceanVisible: true,
      oceanSpeed: 0.0000275963,
      earthSpeed: 0.00008,
      earthRoughness: 0.049,
      earthLacunarity: 0.076,
      earthRotation: new THREE.Vector3(0.0, 0.003, 0.000),
    };

    this.waterBiome = new Biome();
    this.sandBiome = new NebulaeGradient();
    this.grassBiome = new NebulaeGradient();
    this.stoneBiome = new NebulaeGradient();

    this.generateTexture();

    this.geometry = new THREE.IcosahedronBufferGeometry(radius, detail);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        texWater: {type: "t", value: this.waterBiome.texture},
        texSand: {type: "t", value: this.sandBiome.texture},
        texGrass: {type: "t", value: this.grassBiome.texture},
        texStone: {type: "t", value: this.stoneBiome.texture},
        texSnow: {type: "t", value: this.waterBiome.texture},
        lightPosition: {type: 'v3', value: new THREE.Vector3(window.light.position.x * radius, window.light.position.y * radius, window.light.position.z * radius)},
        lightColor: {type: 'v4', value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0)},
        lightIntensity: {type: 'f', value: 1.0},
        time: {type: "f", value: 0.0},
        radius: {type: "f", value: radius},
        roughness: {type: "f", value: this.params.earthRoughness},
        lacunarity: {type: "f", value: this.params.earthLacunarity},
        seed: {type: "f", value: random() * 7}
      },
      vertexShader: terrainVertShader,
      fragmentShader: terrainFragShader
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
  }

  generateTexture() {
    this.waterBiome.generateTexture({waterLevel: this.params.waterLevel});
    this.sandBiome.generateTexture();
    this.grassBiome.generateTexture();
    this.stoneBiome.generateTexture();
  }

  updateMaterial() {
    this.material.uniforms.texWater.value = this.waterBiome.texture;
    this.material.uniforms.texSand.value = this.sandBiome.texture;
    this.material.uniforms.texGrass.value = this.grassBiome.texture;
    this.material.uniforms.texStone.value = this.stoneBiome.texture;
    this.material.uniforms.texSnow.value = this.waterBiome.texture;
    this.material.needsUpdate = true;
  }

  render() {
    this.generateTexture();
    this.updateMaterial();
  }

  update(dt = 0) {
    //this.rotation.x += 0.0015;
    this.rotation.y += 0.0025;
    //this.rotation.z += 0.0045;
  }
};
