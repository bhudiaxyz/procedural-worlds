uniform float resolution;
uniform sampler2D heightMap;
uniform float waterLevel;

varying vec2 vUv;

float getBrightness(vec4 color) {
    return 1.0 - (0.2126*color.r + 0.7152*color.g + 0.0722*color.b);
}

void main() {
    float x = vUv.x;
    float y = vUv.y;

    float pixelSize = 1.0 / resolution;

    float n = texture2D(heightMap, vec2(x, y)).r;
    float roughness = 0.0;

    if (n < waterLevel) {
        roughness = 0.45;
    } else {
        roughness = 0.85;
    }

    gl_FragColor = vec4(vec3(roughness), 1.0);
}
