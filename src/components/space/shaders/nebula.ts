import { noise } from './noise';

export const nebulaVertex = /* glsl */ `
varying vec3 vDir;

void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** Backdrop sphere seen from inside: two-tone fbm clouds, faint by design. */
export const nebulaFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uStrength;
varying vec3 vDir;
${noise(3)}

void main() {
  float a = fbm(vDir * 3.0 + vec3(uTime * 0.01, 0.0, 0.0));
  float b = fbm(vDir * 5.0 - vec3(0.0, uTime * 0.008, 0.0));
  vec3 color = uColorA * smoothstep(0.45, 0.85, a) + uColorB * smoothstep(0.5, 0.9, b);
  gl_FragColor = vec4(color, uStrength * max(color.r, max(color.g, color.b)));
}
`;
