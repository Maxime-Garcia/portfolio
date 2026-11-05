import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { AdditiveBlending, NormalBlending, type IUniform } from 'three';
import { particleFragment, particleVertex } from './shaders/particles';

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

export type ParticleUniforms = Record<
  'uPixelRatio' | 'uScale' | 'uTime' | 'uSpin' | 'uOpacity' | 'uSoftness',
  IUniform<number>
>;

/** Uniforms owned by the parent, which drives opacity and scale every frame without re-rendering. */
export function useParticleUniforms(softness: number, spin = 0): ParticleUniforms {
  const dpr = useThree((state) => state.viewport.dpr);
  const uniforms = useMemo<ParticleUniforms>(
    () => ({
      uPixelRatio: { value: dpr },
      uScale: { value: 1 },
      uTime: { value: 0 },
      uSpin: { value: spin },
      uOpacity: { value: 1 },
      uSoftness: { value: softness },
    }),
    // dpr is synced below; the object itself must stay stable.
    [],
  );
  uniforms.uPixelRatio.value = dpr;
  return uniforms;
}

interface ParticlesProps {
  data: ParticleData;
  uniforms: ParticleUniforms;
  additive: boolean;
  animate: boolean;
}

export function Particles({ data, uniforms, additive, animate }: ParticlesProps) {
  useFrame((_, delta) => {
    if (animate) uniforms.uTime.value += delta;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={additive ? AdditiveBlending : NormalBlending}
      />
    </points>
  );
}
