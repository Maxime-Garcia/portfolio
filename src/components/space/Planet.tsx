import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { DoubleSide, type Mesh, type ShaderMaterial } from 'three';
import type { PlanetSpec } from './layout';
import type { Palette } from './palette';
import { planetFragment, planetVertex } from './shaders/planet';
import { audioLevel } from '../../stores/audio';

/** Fog range (camera distance). The active planet is ~12 away, the next one ~35. */
export const FOG_NEAR = 18;
export const FOG_FAR = 40;

interface PlanetProps {
  spec: PlanetSpec;
  palette: Palette;
  seed: number;
  animate: boolean;
  segments: number;
}

export function Planet({ spec, palette, seed, animate, segments }: PlanetProps) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uBase: { value: palette[spec.base].clone() },
      uAccent: { value: palette[spec.accent].clone() },
      uTime: { value: 0 },
      uSeed: { value: seed },
      uBands: { value: spec.bands },
      uFog: { value: palette.background.clone() },
      uFogRange: { value: [FOG_NEAR, FOG_FAR] },
    }),
    // Stable uniforms object; colours are updated in place below.
    [],
  );
  uniforms.uBase.value.copy(palette[spec.base]);
  uniforms.uAccent.value.copy(palette[spec.accent]);
  uniforms.uFog.value.copy(palette.background);

  useFrame((_, delta) => {
    if (!animate) return;
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.05;
      // The Passions planet pulses with the music (level is 0 under reduced motion).
      if (spec.id === 'passions') {
        const target = 1 + audioLevel.value * 0.35;
        const s = mesh.current.scale.x + (target - mesh.current.scale.x) * Math.min(1, delta * 10);
        mesh.current.scale.setScalar(s);
      }
    }
    if (material.current) material.current.uniforms.uTime.value += delta;
  });

  return (
    <group position={spec.position}>
      <mesh ref={mesh} rotation={[0.2, seed, 0.1]}>
        <sphereGeometry args={[spec.radius, segments, segments / 2]} />
        <shaderMaterial
          ref={material}
          vertexShader={planetVertex}
          fragmentShader={planetFragment}
          uniforms={uniforms}
          transparent
        />
      </mesh>
      {spec.ring && (
        <mesh rotation={[Math.PI / 2.3, 0, 0.3]}>
          <ringGeometry args={[spec.radius * 1.45, spec.radius * 2.1, 96]} />
          <meshBasicMaterial color={palette.ink} transparent opacity={0.18} side={DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
