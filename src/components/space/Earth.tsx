import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BackSide,
  Color,
  Vector3,
  type Mesh,
  type MeshStandardMaterial,
} from 'three';
import { SUN_DIRECTION, type BodySpec } from './layout';
import { atmosphereFragment, atmosphereVertex, earthFragment, earthVertex } from './shaders/earth';
import { useColorTextures, type Tier } from './textures';
import { useFade } from './useFade';

interface EarthProps {
  spec: BodySpec;
  tier: Tier;
  animate: boolean;
  segments: number;
}

export function Earth({ spec, tier, animate, segments }: EarthProps) {
  const maps = useColorTextures(tier, ['earth', 'earth_night', 'earth_clouds'] as const);
  const surface = useRef<Mesh>(null);
  const clouds = useRef<Mesh>(null);
  const sun = useMemo(() => new Vector3(...SUN_DIRECTION).normalize(), []);
  const earthUniforms = useMemo(
    () => ({
      uDay: { value: maps.earth },
      uNight: { value: maps.earth_night },
      uSun: { value: sun },
      uOpacity: { value: 1 },
    }),
    [maps, sun],
  );
  const glowUniforms = useMemo(
    () => ({
      uColor: { value: new Color('#4da6ff') },
      uSun: { value: sun },
      uOpacity: { value: 1 },
    }),
    [sun],
  );

  const group = useFade(spec.radius, (fade) => {
    earthUniforms.uOpacity.value = fade;
    glowUniforms.uOpacity.value = fade;
    if (clouds.current) (clouds.current.material as MeshStandardMaterial).opacity = 0.9 * fade;
  });

  useFrame((_, delta) => {
    if (!animate) return;
    if (surface.current) surface.current.rotation.y += delta * 0.02;
    if (clouds.current) clouds.current.rotation.y += delta * 0.026;
  });

  const r = spec.radius;
  return (
    <group ref={group} position={spec.position} rotation={[0, 0, spec.tilt ?? 0]}>
      <mesh ref={surface} rotation={[0, 2.2, 0]}>
        <sphereGeometry args={[r, segments, segments / 2]} />
        <shaderMaterial
          vertexShader={earthVertex}
          fragmentShader={earthFragment}
          uniforms={earthUniforms}
          transparent
        />
      </mesh>
      <mesh ref={clouds} rotation={[0, 2.2, 0]}>
        <sphereGeometry args={[r * 1.012, segments, segments / 2]} />
        <meshStandardMaterial
          color="#ffffff"
          alphaMap={maps.earth_clouds}
          transparent
          opacity={0.9}
          depthWrite={false}
          roughness={1}
        />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[r, segments, segments / 2]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={glowUniforms}
          side={BackSide}
          blending={AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
