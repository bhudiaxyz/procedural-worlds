uniform sampler2D heightMap;
uniform float waterLevel;
uniform float seed;

varying vec2 vUv;
varying vec3 vNormal;

// Fast hash — returns [0,1]
float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7) + seed);
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
}

void main() {
    float height = texture2D(heightMap, vUv).r;

    // Only render on land
    if (height <= waterLevel) discard;

    // Only render on the night side (away from directional light at -1,1,1)
    vec3 lightDir = normalize(vec3(-1.0, 1.0, 1.0));
    float lit = dot(vNormal, lightDir);
    // Soft transition: fully dark at lit < -0.1, fades in from -0.1 to 0.1
    float nightFactor = 1.0 - smoothstep(-0.15, 0.1, lit);
    if (nightFactor < 0.01) discard;

    // Grid-based city placement
    float cellSize = 0.018;
    vec2 cell = floor(vUv / cellSize);
    vec2 cellUv = fract(vUv / cellSize);

    float cityChance = hash(cell);
    if (cityChance < 0.72) discard; // ~28% of cells have a city

    // Star-like point: position jittered within cell
    vec2 cityPos = vec2(hash(cell + 0.3), hash(cell + 0.7));
    float dist = length(cellUv - cityPos);

    float size = 0.08 + hash(cell + 1.1) * 0.1;
    float brightness = smoothstep(size, 0.0, dist);
    if (brightness < 0.01) discard;

    // City brightness: power law — most dim, few bright
    float mag = pow(hash(cell + 2.2), 2.0);
    brightness *= (0.3 + mag * 0.7);

    // Colour temperature: warm white to orange
    float temp = hash(cell + 3.3);
    vec3 cityColor = mix(vec3(1.0, 0.85, 0.5), vec3(1.0, 0.6, 0.2), temp);

    float alpha = brightness * nightFactor;
    gl_FragColor = vec4(cityColor * brightness, alpha);
}
