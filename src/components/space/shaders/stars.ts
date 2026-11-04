export const starsVertex = /* glsl */ `
attribute float aSize;
attribute float aPhase;
uniform float uTime;
uniform float uPixelRatio;
varying float vTwinkle;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vTwinkle = 0.65 + 0.35 * sin(uTime * 1.5 + aPhase);
  gl_PointSize = aSize * uPixelRatio * (260.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

export const starsFragment = /* glsl */ `
uniform vec3 uColor;
varying float vTwinkle;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.0, d) * vTwinkle;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`;
