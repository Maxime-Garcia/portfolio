import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BackSide, type ShaderMaterial } from 'three';
import type { Palette } from './palette';
import { nebulaFragment, nebulaVertex } from './shaders/nebula';

interface NebulaProps {
  palette: Palette;
  animate: boolean;
}

export function Nebula({ palette, animate }: NebulaProps) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uColorA: { value: palette.nebulaA.clone() },
      uColorB: { value: palette.nebulaB.clone() },
      uTime: { value: 0 },
      uStrength: { value: palette.nebula },
    }),
    [],
  );
  uniforms.uColorA.value.copy(palette.nebulaA);
  uniforms.uColorB.value.copy(palette.nebulaB);
  uniforms.uStrength.value = palette.nebula;

  useFrame((_, delta) => {
    if (animate && material.current) material.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh position={[0, 0, -55]}>
      <sphereGeometry args={[150, 32, 16]} />
      <shaderMaterial
        ref={material}
        vertexShader={nebulaVertex}
        fragmentShader={nebulaFragment}
        uniforms={uniforms}
        side={BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
