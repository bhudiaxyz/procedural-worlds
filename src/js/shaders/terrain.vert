precision highp float;

#pragma glslify: turbulence = require('./noise/turbulence')
#pragma glslify: pnoise = require('glsl-noise/periodic/3d')

uniform vec3 lightPosition;
uniform vec4 lightColor;
uniform float lightIntensity;
uniform float radius;
uniform float time;
uniform float roughness;
uniform float lacunarity;
uniform float seed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vReflect;
varying vec3 vPosition;
varying vec3 vPosition01;
varying vec3 vNewPosition;
varying float displacement;
varying vec3 lightDirection;

const float PI = 3.14159265358979323846264;
const vec3 noiseVec3 = vec3(PI);

float random(vec3 p){
    return fract(sin(dot(p.xyz, vec3(12.9898, 78.233, 1.23456))) * (5356.5453+ seed*1234.7582));
}

float stripes(float x, float f) {
    float t = .5 + .5 * sin(f * 2.0 * PI * x);
    return t * t - .5;
}

void main() {
    vUv = uv;
    vec4 mPosition = modelMatrix * vec4(position, 1.0);
    vec3 nWorld = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vReflect = normalize(reflect(normalize(mPosition.xyz - cameraPosition), nWorld));
    vPosition = position;
    vNormal = normal;

    displacement = random(normal) * radius * roughness / 6.123;
    displacement += -turbulence(2.0 * normal) * radius * roughness;
    displacement += pnoise(lacunarity * position + noiseVec3, noiseVec3) * radius * roughness;
    lightDirection = normalize(lightPosition - position);

    vNewPosition = position + normal * vec3(displacement);
    vPosition01 = normalize(vNewPosition)/2.0 + vec3(0.5, 0.5, 0.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vNewPosition, 1.0);
}
