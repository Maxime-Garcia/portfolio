import { noise } from './noise';

export const planetVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vLocal;
varying vec3 vView;
varying float vDepth;

void main() {
  vLocal = position;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

/** Banded gas-giant / rocky look from fbm, lit from one side, with a fresnel rim in the accent colour. */
export const planetFragment = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uAccent;
uniform float uTime;
uniform float uSeed;
uniform float uBands;
uniform vec3 uFog;
uniform vec2 uFogRange;
varying float vDepth;
varying vec3 vNormal;
varying vec3 vLocal;
varying vec3 vView;
${noise(4)}

void main() {
  vec3 p = normalize(vLocal);
  float warp = fbm(p * 2.5 + vec3(uSeed, uTime * 0.02, 0.0));
  float bands = sin((p.y + warp * 0.35) * uBands) * 0.5 + 0.5;
  float detail = fbm(p * 6.0 + uSeed);
  vec3 surface = mix(uBase, uAccent, smoothstep(0.25, 0.85, bands * 0.7 + detail * 0.4));

  vec3 light = normalize(vec3(-0.6, 0.4, 0.7));
  float diffuse = clamp(dot(vNormal, light), 0.0, 1.0);
  float rim = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), 2.5);

  vec3 color = surface * (0.18 + 0.95 * diffuse) + uAccent * rim * 0.9;
  // Depth fade: distant planets dissolve (colour towards the page background, alpha to zero),
  // so they never draw dark discs behind the text.
  float fog = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  gl_FragColor = vec4(mix(color, uFog, fog * 0.6), 1.0 - fog);
}
`;
