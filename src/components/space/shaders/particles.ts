/** Shared point-sprite shaders for the nebula and the galaxy: soft round sprites, per-point colour and size. */
export const particleVertex = /* glsl */ `
attribute float aSize;
attribute vec3 aColor;
uniform float uPixelRatio;
uniform float uScale;
uniform float uTime;
uniform float uSpin;
varying vec3 vColor;

void main() {
  vec3 p = position;
  // Differential rotation: inner parts turn faster (galaxy); uSpin = 0 for the nebula.
  float r = length(p.xz);
  float angle = uTime * uSpin / (0.6 + r * 0.15);
  float c = cos(angle);
  float s = sin(angle);
  p.xz = mat2(c, -s, s, c) * p.xz;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vColor = aColor;
  gl_PointSize = aSize * uScale * uPixelRatio * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

export const particleFragment = /* glsl */ `
uniform float uOpacity;
uniform float uSoftness;
varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float alpha = pow(max(1.0 - d, 0.0), uSoftness) * uOpacity;
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;
