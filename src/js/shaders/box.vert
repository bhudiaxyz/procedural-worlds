#pragma glslify: turbulence = require('./noise/turbulence')
#pragma glslify: pnoise = require('glsl-noise/periodic/3d')
#pragma glslify: PI = require('glsl-pi');

#if defined(FLAT_SHADED) || defined(USE_BUMPMAP) || defined(USE_NORMALMAP)

varying vec3 vViewPosition;

#endif

#ifndef FLAT_SHADED

varying vec3 vNormal;

#endif

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vPosition01;
varying vec3 lightDirection;

const vec3 noiseVec3 = vec3(PI);

// Also, using glslify-hex, you can use #ff00ff to create vec3 colors


void main () {

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

    #ifndef FLAT_SHADED// Normal computed with derivatives when FLAT_SHADED

    vNormal = normalize(transformedNormal);

    #endif

    //displacement = pnoise(0.076 * position + noiseVec3, noiseVec3) * 0.43;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
