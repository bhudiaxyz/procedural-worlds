#pragma glslify: noise = require('glsl-noise/classic/4d')

uniform float resolution;
uniform sampler2D heightMap;
uniform float waterLevel;
uniform int index;
uniform float seed;

varying vec2 vUv;

vec3 getSphericalCoord(int index, float x, float y, float width) {
    width /= 2.0;
    x -= width; y -= width;
    vec3 coord = vec3(0.0);
    if      (index == 0) { coord.x= width; coord.y=-y; coord.z=-x; }
    else if (index == 1) { coord.x=-width; coord.y=-y; coord.z= x; }
    else if (index == 2) { coord.x=x; coord.y= width; coord.z= y; }
    else if (index == 3) { coord.x=x; coord.y=-width; coord.z=-y; }
    else if (index == 4) { coord.x=x; coord.y=-y; coord.z= width; }
    else if (index == 5) { coord.x=-x; coord.y=-y; coord.z=-width; }
    return normalize(coord);
}

float fbm(vec3 pos, float seed) {
    float n = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 6; ++i) {
        n += amp * (noise(vec4(pos * freq, seed + float(i) * 7.3)) * 0.5 + 0.5);
        freq *= 2.0;
        amp *= 0.5;
    }
    return n;
}

void main() {
    float x = vUv.x;
    float y = 1.0 - vUv.y;
    vec3 sp = getSphericalCoord(index, x * resolution, y * resolution, resolution);

    vec2 sampUv = clamp(vec2(vUv.x, vUv.y), 0.04, 0.96);
    float height = texture2D(heightMap, sampUv).r;

    float n = fbm(sp * 3.0, seed);

    float roughness;
    if (height < waterLevel) {
        roughness = mix(0.1, 0.35, n);
    } else {
        float heightFactor = (height - waterLevel) / (1.0 - waterLevel);
        roughness = mix(0.6, 1.0, n * 0.6 + heightFactor * 0.4);
    }

    gl_FragColor = vec4(vec3(roughness), 1.0);
}
