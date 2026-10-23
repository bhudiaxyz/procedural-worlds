uniform float seed;
uniform float time;

varying vec2 vUv;

float hash(vec2 p) {
    p = fract(p * vec2(127.1 + seed, 311.7 + seed * 0.3));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
}

void main() {
    // Multi-scale grid: large sparse bright stars + small dense dim stars
    vec3 color = vec3(0.0);

    // Layer 1: bright stars, sparse
    float cs1 = 0.012;
    vec2 cell1 = floor(vUv / cs1);
    vec2 uv1   = fract(vUv / cs1);
    float h1 = hash(cell1);
    if (h1 > 0.88) {
        vec2 pos1 = vec2(hash(cell1 + 0.1), hash(cell1 + 0.2));
        float dist1 = length(uv1 - pos1);
        float sz1 = 0.06 + hash(cell1 + 0.4) * 0.08;
        float b1 = smoothstep(sz1, 0.0, dist1);
        float temp1 = hash(cell1 + 0.5);
        vec3 c1 = mix(vec3(1.0, 0.85, 0.6), vec3(0.7, 0.85, 1.0), temp1);
        // Subtle twinkle
        b1 *= 0.8 + 0.2 * sin(time * (2.0 + hash(cell1 + 0.6) * 4.0) + hash(cell1 + 0.7) * 6.28);
        color += c1 * b1 * (0.6 + hash(cell1 + 0.8) * 0.4);
    }

    // Layer 2: dim background stars, dense
    float cs2 = 0.004;
    vec2 cell2 = floor(vUv / cs2);
    vec2 uv2   = fract(vUv / cs2);
    float h2 = hash(cell2 + 100.0);
    if (h2 > 0.75) {
        vec2 pos2 = vec2(hash(cell2 + 10.1), hash(cell2 + 10.2));
        float dist2 = length(uv2 - pos2);
        float b2 = smoothstep(0.15, 0.0, dist2);
        float temp2 = hash(cell2 + 10.5);
        vec3 c2 = mix(vec3(0.9, 0.8, 0.7), vec3(0.75, 0.85, 1.0), temp2);
        color += c2 * b2 * 0.35;
    }

    if (length(color) < 0.01) discard;

    gl_FragColor = vec4(color, 1.0);
}
