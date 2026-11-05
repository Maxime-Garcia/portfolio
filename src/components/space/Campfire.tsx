import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  IcosahedronGeometry,
  Quaternion,
  Vector3,
  type Group,
  type Mesh,
  type PointLight,
  type Points,
} from 'three';
import { scrollVelocity } from '../../stores/velocity';
import type { BodySpec } from './layout';
import { seeded } from './random';
import { useFade } from './useFade';

interface CampfireProps {
  spec: BodySpec;
  animate: boolean;
}

/** A small rocky world with a lumpy, low-poly surface (deterministic). */
function planetoid(radius: number) {
  const geometry = new IcosahedronGeometry(radius, 3);
  const random = seeded(23);
  const position = geometry.attributes.position;
  const v = new Vector3();
  const offsets = new Map<string, number>();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
    if (!offsets.has(key)) offsets.set(key, 1 + (random() - 0.5) * 0.08);
    v.multiplyScalar(offsets.get(key) ?? 1);
    position.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Places an object on the sphere surface at (lat, lon), standing along the normal. */
function onSurface(radius: number, lat: number, lon: number, lift = 0) {
  const normal = new Vector3(
    Math.cos(lat) * Math.sin(lon),
    Math.sin(lat),
    Math.cos(lat) * Math.cos(lon),
  );
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);
  return { position: normal.clone().multiplyScalar(radius + lift), quaternion };
}

function noteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.font = '48px serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('♪', 32, 34);
  }
  return new CanvasTexture(canvas);
}

/**
 * Campfire (Passions): an original little world where the pilot lands at night —
 * pines, a crackling fire that lights the ground, a guitar leaning on a log,
 * embers and music notes drifting up. Fire and notes calm down under reduced motion.
 */
export function Campfire({ spec, animate }: CampfireProps) {
  const r = spec.radius;
  const geometry = useMemo(() => planetoid(r), [r]);
  const flames = useRef<Mesh[]>([]);
  const light = useRef<PointLight>(null);
  const embers = useRef<Points>(null);
  const notes = useRef<Group>(null);
  const opacity = useRef(1);
  const note = useMemo(() => noteTexture(), []);
  const pines = useMemo(() => {
    const random = seeded(5);
    return Array.from({ length: 14 }, () => {
      const lat = 0.25 + random() * 1.1;
      const lon = random() * Math.PI * 2;
      // Keep the camp clearing (top-front) free of trees.
      if (lat > 1.0 && Math.cos(lon) > 0.3) return null;
      return { ...onSurface(r * 0.98, lat, lon), scale: 0.18 + random() * 0.16 };
    }).filter(Boolean) as { position: Vector3; quaternion: Quaternion; scale: number }[];
  }, [r]);
  const camp = useMemo(() => onSurface(r * 0.99, 1.3, 0.1), [r]);
  const emberData = useMemo(() => {
    const random = seeded(9);
    const count = 40;
    return {
      positions: new Float32Array(count * 3),
      seeds: Array.from({ length: count }, () => ({
        x: (random() - 0.5) * 0.2,
        z: (random() - 0.5) * 0.2,
        speed: 0.25 + random() * 0.35,
        phase: random(),
      })),
    };
  }, []);

  const group = useFade(r, (fade) => {
    opacity.current = fade;
  });

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const pulse = animate ? scrollVelocity.intensity : 0;
    flames.current.forEach((flame, i) => {
      if (!flame) return;
      const flicker = animate
        ? 1 + Math.sin(t * (9 + i * 3) + i) * 0.12 + Math.sin(t * 23 + i * 2) * 0.06
        : 1;
      flame.scale.set(1, flicker * (1 + pulse * 0.6), 1);
    });
    if (light.current)
      light.current.intensity =
        (animate ? 6 + Math.sin(t * 13) * 1.2 + Math.sin(t * 7.3) * 0.8 : 6) * opacity.current;
    if (embers.current && animate) {
      const position = embers.current.geometry.attributes.position;
      emberData.seeds.forEach((seed, i) => {
        const life = (t * seed.speed + seed.phase) % 1;
        position.setXYZ(i, seed.x + Math.sin(t * 2 + i) * 0.05 * life, 0.15 + life * 1.1, seed.z);
      });
      position.needsUpdate = true;
    }
    if (notes.current) {
      notes.current.children.forEach((child, i) => {
        const life = animate
          ? (t * 0.12 + i / (notes.current?.children.length ?? 1)) % 1
          : 0.3 + i * 0.12;
        child.position.set(
          Math.sin(i * 2.1 + t * (animate ? 0.6 : 0)) * 0.6,
          0.6 + life * 1.8,
          Math.cos(i * 1.7) * 0.3,
        );
        (child as unknown as { material: { opacity: number } }).material.opacity =
          Math.sin(life * Math.PI) * 0.9 * opacity.current;
      });
    }
    // The camp stays facing the camera: no spin.
    void delta;
  });

  const wood = new Color('#6b4226');
  return (
    <group ref={group} position={spec.position} rotation={[0.95, 0, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#3f6b62" emissive="#0d1a24" flatShading roughness={1} />
      </mesh>
      {pines.map((pine, i) => (
        <group key={i} position={pine.position} quaternion={pine.quaternion} scale={pine.scale}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.7, 5]} />
            <meshStandardMaterial color={wood} flatShading />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[0.55, 1.6, 6]} />
            <meshStandardMaterial color="#2f8a63" flatShading />
          </mesh>
        </group>
      ))}
      <group position={camp.position} quaternion={camp.quaternion}>
        {/* Logs */}
        <mesh rotation={[0, 0.4, Math.PI / 2]} position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
          <meshStandardMaterial color={wood} />
        </mesh>
        <mesh rotation={[0, -0.6, Math.PI / 2]} position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
          <meshStandardMaterial color={wood} />
        </mesh>
        {/* Flames */}
        {[
          ['#ff7a1a', 0.12, 0.42, 0],
          ['#ffb347', 0.08, 0.32, 0.03],
          ['#fff1a8', 0.04, 0.2, -0.02],
        ].map(([color, radius, height, x], i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) flames.current[i] = m;
            }}
            position={[x as number, 0.08, 0]}
          >
            <coneGeometry args={[radius as number, height as number, 8, 1, true]} />
            <meshBasicMaterial
              color={new Color(color as string).multiplyScalar(2.2)}
              toneMapped={false}
              transparent
              opacity={0.9}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
        <pointLight
          ref={light}
          position={[0, 0.35, 0]}
          color="#ffa040"
          distance={4}
          decay={1.6}
          intensity={6}
        />
        {/* Guitar leaning on a log */}
        <group position={[0.45, 0.02, 0.1]} rotation={[0.1, -0.5, -0.45]} scale={0.32}>
          <mesh position={[0, 0.35, 0]} scale={[1, 1.15, 0.35]}>
            <sphereGeometry args={[0.42, 16, 12]} />
            <meshStandardMaterial color="#b5652b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.85, 0]} scale={[0.8, 0.9, 0.32]}>
            <sphereGeometry args={[0.32, 16, 12]} />
            <meshStandardMaterial color="#b5652b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.62, 0.15]}>
            <circleGeometry args={[0.1, 16]} />
            <meshBasicMaterial color="#1a0f08" />
          </mesh>
          <mesh position={[0, 1.65, 0]}>
            <boxGeometry args={[0.1, 1.2, 0.06]} />
            <meshStandardMaterial color="#3b2416" />
          </mesh>
          <mesh position={[0, 2.32, 0]}>
            <boxGeometry args={[0.16, 0.22, 0.05]} />
            <meshStandardMaterial color="#2a1a10" />
          </mesh>
        </group>
        {/* Embers */}
        <points ref={embers}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[emberData.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={new Color('#ffb347').multiplyScalar(2)}
            size={0.035}
            transparent
            opacity={0.9}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </points>
        {/* Music notes */}
        <group ref={notes}>
          {Array.from({ length: 5 }, (_, i) => (
            <sprite key={i} scale={0.22}>
              <spriteMaterial
                map={note}
                color={i % 2 ? '#5ef2ff' : '#ff4fd8'}
                transparent
                depthWrite={false}
              />
            </sprite>
          ))}
        </group>
      </group>
    </group>
  );
}
