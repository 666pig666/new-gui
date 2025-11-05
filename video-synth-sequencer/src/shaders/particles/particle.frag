// Particle Fragment Shader
varying vec3 vColor;
varying float vAlpha;

uniform sampler2D uTexture;

void main() {
  // Circular particle
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  if (dist > 0.5) {
    discard;
  }

  float alpha = (1.0 - dist * 2.0) * vAlpha;

  gl_FragColor = vec4(vColor, alpha);
}
