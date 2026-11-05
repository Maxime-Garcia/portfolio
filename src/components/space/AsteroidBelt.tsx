import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  DodecahedronGeometry,
  Matrix4,
  Quaternion,
  Vector3,
  Euler,
  type InstancedMesh,
  type MeshStandardMaterial,
} from 'three';
import { seeded } from './random';
import { useFade } from './useFade';

interface AsteroidBeltProps {
  center: [number, number, number];
  count: number;
  animate: boolean;
}

/**
 * Between Mars and Jupiter the camera flies through a ring of tumbling rocks
 * (one instanced draw call), so the voyage has texture and depth.
 */
export function AsteroidBelt({ center, count, animate }: AsteroidBeltProps) {
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const geometry = useMemo(() => new DodecahedronGeometry(1, 0), []);
  const rocks = useMemo(() => {
    const random = seeded(31);
    return Array.from({ length: count }, () => {
      const angle = random() * Math.PI * 2;
      const distance = 9 + random() * 9;
      return {
        position: new Vector3(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance * 0.75,
          (random() - 0.5) * 14,
        ),
        rotation: new Euler(random() * 6, random() * 6, random() * 6),
        spin: (random() - 0.5) * 0.6,
        scale: new Vector3(0.12 + random() * 0.4, 0.1 + random() * 0.3, 0.12 + random() * 0.35),
      };
    });
  }, [count]);

  const matrix = useMemo(() => new Matrix4(), []);
  const quaternion = useMemo(() => new Quaternion(), []);
  const write = (time: number) => {
    if (!mesh.current) return;
    rocks.forEach((rock, i) => {
      quaternion.setFromEuler(
        new Euler(
          rock.rotation.x + time * rock.spin,
          rock.rotation.y + time * rock.spin,
          rock.rotation.z,
        ),
      );
      matrix.compose(rock.position, quaternion, rock.scale);
      mesh.current?.setMatrixAt(i, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => write(0));

  const group = useFade(16, (fade) => {
    if (material.current) material.current.opacity = fade;
  });
  useFrame(({ clock }, delta) => {
    if (!animate) return;
    write(clock.elapsedTime);
    if (group.current) group.current.rotation.z += delta * 0.01;
  });

  return (
    <group ref={group} position={center}>
      <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
        <meshStandardMaterial
          ref={material}
          color="#7a6e64"
          roughness={1}
          flatShading
          transparent
        />
      </instancedMesh>
    </group>
  );
}
