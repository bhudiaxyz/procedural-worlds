uniform sampler2D heightMap;
uniform float waterLevel;
uniform float time;
uniform vec3 shallowColor;
uniform vec3 deepColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  float height = texture2D(heightMap, vUv).r;
  if (height > waterLevel) discard;

  float depth = clamp(1.0 - height / max(waterLevel, 0.001), 0.0, 1.0);

  // Two overlapping ripple waves at different frequencies/speeds
  float r1 = sin(vUv.x * 40.0 + time * 0.6) * cos(vUv.y * 35.0 + time * 0.4);
  float r2 = sin(vUv.x * 25.0 - time * 0.5) * cos(vUv.y * 50.0 - time * 0.3);
  vec3 rippleNormal = normalize(vNormal + vec3(r1 * 0.05, r2 * 0.05, 0.0));

  vec3 viewDir = normalize(cameraPosition - vWorldPos);

  // Fresnel — edge-on = more reflective
  float fresnel = pow(1.0 - clamp(dot(rippleNormal, viewDir), 0.0, 1.0), 4.0);

  // Specular highlight matching scene directional light (-1, 1, 1)
  vec3 lightDir = normalize(vec3(-1.0, 1.0, 1.0));
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(clamp(dot(rippleNormal, halfVec), 0.0, 1.0), 128.0);

  vec3 color = mix(shallowColor, deepColor, depth * 0.6);
  // Fresnel tints toward dark space at glancing angles
  color = mix(color, vec3(0.02, 0.06, 0.2), fresnel * 0.5);
  color += vec3(spec);

  float alpha = 0.65 + fresnel * 0.25;

  gl_FragColor = vec4(color, alpha);
}
