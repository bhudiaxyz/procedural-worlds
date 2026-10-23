uniform vec3 viewVector;
uniform float c;
uniform float p;

varying float intensity;

void main()
{
    vec3 vNormal = normalize(normalMatrix * normal);
    vec3 vNormel = normalize(normalMatrix * viewVector);
    intensity = pow(clamp(c - dot(vNormal, vNormel), 0.0, 1.0), p);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
