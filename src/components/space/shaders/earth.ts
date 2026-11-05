export const earthVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewW;

void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewW = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

/** Day map lit by the sun, city lights on the night side, ocean glint, blue rim. */
export const earthFragment = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform vec3 uSun;
uniform float uOpacity;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewW;

void main() {
  vec3 n = normalize(vNormalW);
  float light = dot(n, normalize(uSun));
  float day = smoothstep(-0.15, 0.25, light);
  vec3 dayColor = texture2D(uDay, vUv).rgb;
  vec3 nightColor = texture2D(uNight, vUv).rgb * vec3(1.0, 0.85, 0.6) * 1.6;
  vec3 color = mix(nightColor, dayColor * (0.15 + 1.05 * max(light, 0.0)), day);

  // Specular glint on water (dark, blue-ish pixels of the day map).
  float water = smoothstep(0.25, 0.05, dayColor.r) * step(dayColor.r, dayColor.b);
  vec3 halfway = normalize(normalize(uSun) + normalize(vViewW));
  color += water * pow(max(dot(n, halfway), 0.0), 60.0) * 0.6 * day;

  float rim = pow(1.0 - max(dot(n, normalize(vViewW)), 0.0), 3.0);
  color += vec3(0.3, 0.6, 1.0) * rim * (0.25 + 0.75 * day);
  gl_FragColor = vec4(color, uOpacity);
  #include <colorspace_fragment>
}
`;

export const atmosphereVertex = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vViewW;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewW = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

/** Outer glow seen around the limb, brighter on the sunlit side. */
export const atmosphereFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uSun;
uniform float uOpacity;
varying vec3 vNormalW;
varying vec3 vViewW;

void main() {
  vec3 n = normalize(vNormalW);
  // Back faces: 0 at the outer silhouette, rising towards the planet's limb.
  float edge = pow(clamp(-dot(n, normalize(vViewW)), 0.0, 1.0), 1.6);
  float lit = smoothstep(-0.4, 0.6, dot(n, normalize(uSun)));
  gl_FragColor = vec4(uColor * 1.6, clamp(edge, 0.0, 1.0) * lit * uOpacity);
}
`;
