// Particle Vertex Shader
attribute float size;
attribute vec3 customColor;
attribute float alpha;

varying vec3 vColor;
varying float vAlpha;

uniform float uTime;
uniform float uScale;
uniform float uAudioLevel;

void main() {
  vColor = customColor;
  vAlpha = alpha;

  vec3 pos = position;

  // Audio reactive size
  float audioSize = size * (1.0 + uAudioLevel * 0.5);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = audioSize * uScale * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
