import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { DoubleSide, RingGeometry, Vector3, type Mesh, type MeshStandardMaterial } from 'three';
import type { BodySpec } from './layout';
import { useColorTextures, type Tier } from './textures';
import { useFade } from './useFade';

interface TexturedPlanetProps {
  spec: BodySpec & { texture: NonNullable<BodySpec['texture']> };
  tier: Tier;
  animate: boolean;
  segments: number;
}

/** Ring geometry whose U coordinate runs from inner to outer edge, to fit a radial ring texture. */
function radialRing(inner: number, outer: number, segments: number) {
  const geometry = new RingGeometry(inner, outer, segments, 1);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const v = new Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
  }
  return geometry;
}

export function TexturedPlanet({ spec, tier, animate, segments }: TexturedPlanetProps) {
  const names = spec.ring ? ([spec.texture, 'saturn_ring'] as const) : ([spec.texture] as const);
  const maps = useColorTextures(tier, names as readonly string[]);
  const body = useRef<Mesh>(null);
  const materials = useRef<MeshStandardMaterial[]>([]);
  const r = spec.radius;
  const ring = useMemo(
    () => (spec.ring ? radialRing(r * 1.25, r * 2.3, 128) : null),
    [spec.ring, r],
  );
  useLayoutEffect(() => () => ring?.dispose(), [ring]);

  const group = useFade(r, (fade) => {
    for (const material of materials.current) if (material) material.opacity = fade;
  });

  useFrame((_, delta) => {
    if (animate && body.current)
      body.current.rotation.y += delta * (spec.texture === 'jupiter' ? 0.04 : 0.02);
  });

  return (
    <group ref={group} position={spec.position} rotation={[0, 0, spec.tilt ?? 0]}>
      <mesh ref={body}>
        <sphereGeometry args={[r, segments, segments / 2]} />
        <meshStandardMaterial
          ref={(m) => {
            if (m) materials.current[0] = m;
          }}
          map={maps[spec.texture]}
          roughness={0.95}
          metalness={0}
          transparent
        />
      </mesh>
      {ring && (
        <mesh geometry={ring} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            ref={(m) => {
              if (m) materials.current[1] = m;
            }}
            map={maps.saturn_ring}
            side={DoubleSide}
            transparent
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      )}
    </group>
  );
}
