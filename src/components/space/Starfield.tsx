import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, NormalBlending, type ShaderMaterial } from 'three';
import type { Palette } from './palette';
import { starsFragment, starsVertex } from './shaders/stars';

interface StarfieldProps {
  count: number;
  palette: Palette;
  additive: boolean;
  animate: boolean;
}

/** Deterministic pseudo-random, so the sky is the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Starfield({ count, palette, additive, animate }: StarfieldProps) {
  const material = useRef<ShaderMaterial>(null);
  const dpr = useThree((state) => state.viewport.dpr);
  const { positions, sizes, phases } = useMemo(() => {
    const random = mulberry32(42);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * 160;
      positions[i * 3 + 1] = (random() - 0.5) * 110;
      positions[i * 3 + 2] = 20 - random() * 300;
      sizes[i] = 0.4 + random() * random() * 2.2;
      phases[i] = random() * Math.PI * 2;
    }
    return { positions, sizes, phases };
  }, [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: dpr },
      uColor: { value: palette.star.clone() },
    }),
    [],
  );
  uniforms.uColor.value.copy(palette.star);
  uniforms.uPixelRatio.value = dpr;

  useFrame((_, delta) => {
    if (animate && material.current) material.current.uniforms.uTime.value += delta;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={starsVertex}
        fragmentShader={starsFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={additive ? AdditiveBlending : NormalBlending}
      />
    </points>
  );
}
