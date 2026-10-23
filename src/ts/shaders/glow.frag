uniform vec3 glowColor;

varying float intensity;

void main()
{
    float alpha = clamp(intensity, 0.0, 1.0);
    // Brighten slightly toward the limb edge for a sun-scatter look
    vec3 scatter = mix(glowColor, glowColor * 1.6 + vec3(0.05), alpha);
    gl_FragColor = vec4(scatter * alpha, alpha);
}
