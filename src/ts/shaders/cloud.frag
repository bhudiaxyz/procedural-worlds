uniform sampler2D cloudMap;
uniform vec3 color;
uniform float opacity;
uniform float time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);

  // Parallax: offset UV along the tangent projection of viewDir
  // gives the illusion of cloud thickness / depth
  float parallaxStrength = 0.04;
  vec2 offset = vec2(dot(viewDir, vec3(1.0, 0.0, 0.0)),
                     dot(viewDir, vec3(0.0, 1.0, 0.0))) * parallaxStrength;

  // Sample base cloud layer and a slightly offset "shadow" layer
  float cloud0 = texture2D(cloudMap, vUv).r;
  float cloud1 = texture2D(cloudMap, vUv + offset).r;
  float cloud2 = texture2D(cloudMap, vUv + offset * 2.0).r;

  // Alpha from base cloud shape
  float alpha = cloud0 * opacity;
  if (alpha < 0.02) discard;

  // Depth shading: where the offset samples are dense, the cloud is thick → darker base
  float thickness = cloud1 * cloud2;
  float shadowing = mix(1.0, 0.55, thickness);

  // Simple diffuse from scene light (-1, 1, 1)
  vec3 lightDir = normalize(vec3(-1.0, 1.0, 1.0));
  float diff = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;

  vec3 cloudColor = color * shadowing * diff;

  // Soft edge fade
  float edgeFade = smoothstep(0.0, 0.4, cloud0) * smoothstep(1.0, 0.6, cloud0);
  alpha *= (0.2 + edgeFade * 0.8);

  gl_FragColor = vec4(cloudColor, alpha);
}
