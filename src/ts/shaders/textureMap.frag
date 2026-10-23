#pragma glslify: noise = require('glsl-noise/classic/4d')

uniform sampler2D biomeMap;
uniform sampler2D heightMap;
uniform sampler2D moistureMap;
uniform float waterLevel;
uniform vec3 waterColor;

varying vec2 vUv;

void main() {
    float x = vUv.x;
    float y = vUv.y;

    float n1 = texture2D(heightMap, vec2(x, y)).r;
    float n2 = texture2D(moistureMap, vec2(x, y)).r;

    vec4 color = texture2D(biomeMap, vec2(n2, n1));

    vec4 water = vec4(waterColor, 1.0);

    if (n1 < waterLevel) {
        color = mix(water, color, 0.3);
    }

    float coastLevel = waterLevel * 0.90;
    if (n1 < waterLevel && n1 > 0.4) {
        vec4 coast = vec4(vec3(1.0), 1.0);
        float amount = 1.0 - ((0.5 - n1) * 10.0);
        color = mix(color, coast, amount*0.3);
    }

    gl_FragColor = color;
}
