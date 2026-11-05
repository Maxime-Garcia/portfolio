import { useMemo } from 'react';
import { AdditiveBlending, Color, DoubleSide, NormalBlending } from 'three';
import type { BodySpec } from './layout';
import type { Palette } from './palette';
import { useColorTextures, type Tier } from './textures';
import { useFade } from './useFade';

interface SombreroProps {
  spec: BodySpec;
  tier: Tier;
  dark: boolean;
  palette: Palette;
}

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** Dark theme: the photo glows, added to the sky. Light theme: printed in ink, like an astronomical chart. */
const fragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uOpacity;
uniform float uInk;
uniform vec3 uInkColor;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(uMap, vUv).rgb;
  float luma = max(c.r, max(c.g, c.b));
  vec3 color = mix(c * 0.92, uInkColor, uInk);
  float alpha = mix(1.0, smoothstep(0.04, 0.9, luma) * 0.85, uInk);
  gl_FragColor = vec4(color, alpha * uOpacity);
}
`;

/**
 * The Sombrero galaxy, M104 (NASA/ESA and The Hubble Heritage Team, STScI/AURA — CC BY 4.0),
 * the Hubble photograph on a slightly tilted card.
 */
export function Sombrero({ spec, tier, dark, palette }: SombreroProps) {
  const { sombrero } = useColorTextures(tier, ['sombrero'] as const);
  const width = spec.radius * 2.6;
  const uniforms = useMemo(
    () => ({
      uMap: { value: sombrero },
      uOpacity: { value: 1 },
      uInk: { value: dark ? 0 : 1 },
      uInkColor: { value: new Color() },
    }),
    // Stable object; values are synced below.
    [],
  );
  uniforms.uMap.value = sombrero;
  uniforms.uInk.value = dark ? 0 : 1;
  uniforms.uInkColor.value.copy(palette.ink);
  const group = useFade(spec.radius, (fade) => {
    uniforms.uOpacity.value = fade;
  });

  return (
    <group ref={group} position={spec.position} rotation={[0.08, -0.25, -0.12]}>
      <mesh>
        <planeGeometry args={[width, width / 1.6]} />
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={DoubleSide}
          blending={dark ? AdditiveBlending : NormalBlending}
        />
      </mesh>
    </group>
  );
}
