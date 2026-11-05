import { BackSide } from 'three';
import { useColorTextures, type Tier } from './textures';

/** The real Milky Way (Solar System Scope, CC BY 4.0) on a huge inner sphere. Dark theme only. */
export function Sky({ tier }: { tier: Tier }) {
  const { milky_way } = useColorTextures(tier, ['milky_way'] as const);
  return (
    <mesh rotation={[0.4, 0, 0.6]} renderOrder={-1}>
      <sphereGeometry args={[500, 64, 32]} />
      <meshBasicMaterial
        map={milky_way}
        side={BackSide}
        depthWrite={false}
        color="#a8acc8"
        fog={false}
        toneMapped={false}
      />
    </mesh>
  );
}
