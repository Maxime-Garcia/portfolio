import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { BackSide, type MeshBasicMaterial } from 'three';
import { introFactor } from './intro';
import { useColorTextures, type Tier } from './textures';

/** The real Milky Way (Solar System Scope, CC BY 4.0) on a huge inner sphere. Dark theme only; fades in. */
export function Sky({ tier }: { tier: Tier }) {
  const { milky_way } = useColorTextures(tier, ['milky_way'] as const);
  const material = useRef<MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (material.current) material.current.opacity = introFactor(clock.elapsedTime);
  });
  return (
    <mesh rotation={[0.4, 0, 0.6]} renderOrder={-1}>
      <sphereGeometry args={[500, 64, 32]} />
      <meshBasicMaterial
        ref={material}
        map={milky_way}
        side={BackSide}
        depthWrite={false}
        color="#a8acc8"
        fog={false}
        toneMapped={false}
        transparent
        opacity={0}
      />
    </mesh>
  );
}
