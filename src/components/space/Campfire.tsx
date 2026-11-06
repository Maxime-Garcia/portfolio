import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Matrix4,
  Object3D,
  Quaternion,
  Shape,
  Vector3,
  type InstancedMesh,
  type Mesh,
  type PointLight,
  type Points,
  type Group,
} from 'three';
import { scrollVelocity } from '../../stores/velocity';
import type { BodySpec } from './layout';
import { seeded } from './random';
import { direction, heightAt, terrain, WATER_LEVEL, type Clearing } from './terrain';
import { atmosphereFragment, atmosphereVertex } from './shaders/earth';
import { useFade } from './useFade';

interface CampfireProps {
  spec: BodySpec;
  animate: boolean;
}

const UP = new Vector3(0, 1, 0);

/** A soft radial sprite (glows, steam). */
function glowTexture(inner: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
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

/** An acoustic guitar silhouette (figure-eight body), extruded. Original geometry. */
function guitarBody() {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.42, 0, 0.5, 0.32, 0.36, 0.5);
  shape.bezierCurveTo(0.28, 0.6, 0.3, 0.68, 0.34, 0.78);
  shape.bezierCurveTo(0.42, 1.0, 0.18, 1.1, 0, 1.08);
  shape.bezierCurveTo(-0.18, 1.1, -0.42, 1.0, -0.34, 0.78);
  shape.bezierCurveTo(-0.3, 0.68, -0.28, 0.6, -0.36, 0.5);
  shape.bezierCurveTo(-0.5, 0.32, -0.42, 0, 0, 0);
  return new ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSize: 0.02,
    bevelThickness: 0.02,
    bevelSegments: 2,
    curveSegments: 24,
  });
}

/** Position + orientation standing on the terrain along a direction. */
function standOn(radius: number, dir: Vector3, clearings: readonly Clearing[], sink = 0) {
  const h = heightAt(dir, clearings);
  return {
    position: dir.clone().multiplyScalar(radius * (1 + h) - sink),
    quaternion: new Quaternion().setFromUnitVectors(UP, dir),
    height: h,
  };
}

/**
 * Campfire (Passions): an original little forest world where the pilot lands at night —
 * relief and a lake, a pine forest, a crackling fire ringed with stones, a guitar leaning on a log,
 * a wooden rocket on its pad and a geyser. Fire, steam and notes calm down under reduced motion.
 */
export function Campfire({ spec, animate }: CampfireProps) {
  const r = spec.radius;
  const campDir = useMemo(() => direction(1.12, 0.12), []);
  const rocketDir = useMemo(() => direction(0.82, -0.62), []);
  const geyserDir = useMemo(() => direction(0.62, 0.78), []);
  const clearings = useMemo<Clearing[]>(
    () => [
      { dir: campDir, size: 0.2 },
      { dir: rocketDir, size: 0.13 },
      { dir: geyserDir, size: 0.08 },
    ],
    [campDir, rocketDir, geyserDir],
  );
  const ground = useMemo(() => terrain(r, clearings), [r, clearings]);
  const camp = useMemo(() => standOn(r, campDir, clearings), [r, campDir, clearings]);
  const rocket = useMemo(() => standOn(r, rocketDir, clearings, 0.01), [r, rocketDir, clearings]);
  const geyser = useMemo(() => standOn(r, geyserDir, clearings, 0.01), [r, geyserDir, clearings]);

  // Pine forest: instanced trunks and three foliage tiers, on grassy, dry, non-clearing ground.
  const forest = useMemo(() => {
    const random = seeded(5);
    const trees: { matrix: Matrix4; color: Color }[] = [];
    const dummy = new Object3D();
    const groves = Array.from({ length: 30 }, () =>
      new Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize(),
    );
    for (let i = 0; trees.length < 260 && i < 6000; i++) {
      // Trees gather in groves: a grove centre plus a small random offset.
      const centre = groves[i % groves.length];
      const dir = centre
        .clone()
        .add(new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.45))
        .normalize();
      const h = heightAt(dir, clearings);
      if (h <= WATER_LEVEL + 0.015 || h > 0.05) continue;
      if (clearings.some((c) => dir.angleTo(c.dir) < c.size * 1.7)) continue;
      const stand = standOn(r, dir, clearings, 0.02);
      dummy.position.copy(stand.position);
      dummy.quaternion
        .copy(stand.quaternion)
        .multiply(new Quaternion().setFromAxisAngle(UP, random() * 6));
      dummy.scale.setScalar(0.1 + random() * 0.1);
      dummy.updateMatrix();
      trees.push({
        matrix: dummy.matrix.clone(),
        color: new Color().setHSL(0.38 + random() * 0.07, 0.42, 0.16 + random() * 0.1),
      });
    }
    return trees;
  }, [r, clearings]);
  const trunks = useRef<InstancedMesh>(null);
  const tiers = [
    useRef<InstancedMesh>(null),
    useRef<InstancedMesh>(null),
    useRef<InstancedMesh>(null),
  ];
  const trunkGeometry = useMemo(
    () => new CylinderGeometry(0.07, 0.1, 0.8, 6).translate(0, 0.4, 0),
    [],
  );
  const tierGeometries = useMemo(
    () =>
      [0, 1, 2].map((k) =>
        new ConeGeometry(0.62 - k * 0.15, 1.0 - k * 0.12, 7).translate(0, 0.9 + k * 0.48, 0),
      ),
    [],
  );
  useLayoutEffect(() => {
    forest.forEach((tree, i) => {
      trunks.current?.setMatrixAt(i, tree.matrix);
      tiers.forEach((tier, k) => {
        tier.current?.setMatrixAt(i, tree.matrix);
        tier.current?.setColorAt(i, tree.color.clone().offsetHSL(0, 0, k * 0.05));
      });
    });
    for (const mesh of [trunks.current, ...tiers.map((tier) => tier.current)]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [forest]);

  // Stones around the fire.
  const stones = useMemo(() => {
    const random = seeded(17);
    return Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      return {
        position: [Math.cos(a) * 0.17, 0.015, Math.sin(a) * 0.17] as [number, number, number],
        scale: 0.035 + random() * 0.02,
        rotation: random() * 3,
      };
    });
  }, []);

  const guitar = useMemo(() => guitarBody(), []);
  const glow = useMemo(() => glowTexture('rgba(255,170,80,0.9)'), []);
  const steam = useMemo(() => glowTexture('rgba(230,240,255,0.85)'), []);
  const note = useMemo(() => noteTexture(), []);
  const flames = useRef<Mesh[]>([]);
  const light = useRef<PointLight>(null);
  const embers = useRef<Points>(null);
  const notes = useRef<Group>(null);
  const plume = useRef<Group>(null);
  const emberData = useMemo(() => {
    const random = seeded(9);
    return {
      positions: new Float32Array(48 * 3),
      seeds: Array.from({ length: 48 }, () => ({
        x: (random() - 0.5) * 0.16,
        z: (random() - 0.5) * 0.16,
        speed: 0.25 + random() * 0.35,
        phase: random(),
      })),
    };
  }, []);

  const atmosphere = useMemo(
    () => ({
      uColor: { value: new Color('#8fd8ff') },
      uSun: { value: new Vector3(1, 0.3, 0.2).normalize() },
      uOpacity: { value: 1 },
    }),
    [],
  );
  const group = useFade(r, (fade) => {
    atmosphere.uOpacity.value = fade * 0.8;
  });

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pulse = animate ? scrollVelocity.intensity : 0;
    flames.current.forEach((flame, i) => {
      if (!flame) return;
      const flicker = animate
        ? 1 + Math.sin(t * (9 + i * 3) + i) * 0.14 + Math.sin(t * 23 + i * 2) * 0.07
        : 1;
      flame.scale.set(
        1 + (flicker - 1) * 0.4,
        flicker * (1 + pulse * 0.6),
        1 + (flicker - 1) * 0.4,
      );
    });
    if (light.current)
      light.current.intensity = animate ? 7 + Math.sin(t * 13) * 1.4 + Math.sin(t * 7.3) * 0.9 : 7;
    if (embers.current && animate) {
      const position = embers.current.geometry.attributes.position;
      emberData.seeds.forEach((seed, i) => {
        const life = (t * seed.speed + seed.phase) % 1;
        position.setXYZ(i, seed.x + Math.sin(t * 2 + i) * 0.05 * life, 0.12 + life * 1.0, seed.z);
      });
      position.needsUpdate = true;
    }
    if (notes.current) {
      const count = notes.current.children.length;
      notes.current.children.forEach((child, i) => {
        const life = animate ? (t * 0.12 + i / count) % 1 : 0.3 + i * 0.12;
        child.position.set(
          Math.sin(i * 2.1 + t * (animate ? 0.6 : 0)) * 0.45,
          0.45 + life * 1.5,
          Math.cos(i * 1.7) * 0.25,
        );
        const material = (child as unknown as { material: { opacity: number } }).material;
        material.opacity = Math.sin(life * Math.PI) * 0.9;
      });
    }
    // Geyser: erupts for ~3 s every ~9 s.
    if (plume.current) {
      const cycle = animate ? (t % 9) / 9 : 0.1;
      const burst = cycle < 0.33 ? Math.sin((cycle / 0.33) * Math.PI) : 0;
      plume.current.scale.set(0.6 + burst * 0.6, 0.15 + burst * 1.6, 0.6 + burst * 0.6);
      plume.current.children.forEach((child, i) => {
        const material = (child as unknown as { material: { opacity: number } }).material;
        material.opacity = burst * (0.75 - i * 0.18);
      });
    }
  });

  const wood = '#7a4b2a';
  return (
    <group ref={group} position={spec.position} rotation={[0.5, -0.2, 0]}>
      {/* Ground */}
      <mesh geometry={ground}>
        <meshStandardMaterial
          vertexColors
          roughness={0.95}
          emissive="#0c1a2a"
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* Atmosphere: fresnel glow at the limb */}
      <mesh scale={1.09}>
        <sphereGeometry args={[r, 64, 32]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={atmosphere}
          side={BackSide}
          blending={AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
      {/* Forest */}
      <instancedMesh ref={trunks} args={[trunkGeometry, undefined, forest.length]}>
        <meshStandardMaterial color={wood} flatShading />
      </instancedMesh>
      {tiers.map((tier, k) => (
        <instancedMesh key={k} ref={tier} args={[tierGeometries[k], undefined, forest.length]}>
          <meshStandardMaterial flatShading roughness={0.9} />
        </instancedMesh>
      ))}

      {/* Camp */}
      <group position={camp.position} quaternion={camp.quaternion}>
        {stones.map((stone, i) => (
          <mesh
            key={i}
            position={stone.position}
            rotation={[stone.rotation, stone.rotation, 0]}
            scale={stone.scale}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#8f8a84" flatShading />
          </mesh>
        ))}
        {[0.4, -0.7, 1.6].map((angle, i) => (
          <mesh key={i} rotation={[0, angle, Math.PI / 2 - 0.35]} position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.3, 6]} />
            <meshStandardMaterial color="#5a3720" />
          </mesh>
        ))}
        {(
          [
            ['#ff6a1a', 0.09, 0.34, 0, 0],
            ['#ffa53a', 0.065, 0.27, 0.025, 0.01],
            ['#ffd27a', 0.05, 0.2, -0.02, -0.01],
            ['#fff4c8', 0.025, 0.13, 0, 0],
          ] as const
        ).map(([color, radius, height, x, z], i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) flames.current[i] = m;
            }}
            position={[x, 0.06 + height / 2, z]}
          >
            <coneGeometry args={[radius, height, 10, 1, true]} />
            <meshBasicMaterial
              color={new Color(color).multiplyScalar(2.4)}
              toneMapped={false}
              transparent
              opacity={0.85}
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
        <sprite position={[0, 0.2, 0]} scale={0.9}>
          <spriteMaterial
            map={glow}
            transparent
            opacity={0.7}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        <pointLight
          ref={light}
          position={[0, 0.3, 0]}
          color="#ffa040"
          distance={3.2}
          decay={1.4}
          intensity={7}
        />

        {/* A log to sit on, and the guitar leaning against it */}
        <mesh position={[-0.42, 0.05, 0.12]} rotation={[0, 0.5, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.055, 0.42, 8]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
        <group position={[-0.3, 0.02, 0.24]} rotation={[-0.3, 0.35, 0.12]} scale={0.3}>
          <mesh geometry={guitar}>
            <meshStandardMaterial color="#c47a3a" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.62, 0.17]}>
            <circleGeometry args={[0.09, 24]} />
            <meshBasicMaterial color="#21140c" />
          </mesh>
          <mesh position={[0, 0.2, 0.17]}>
            <boxGeometry args={[0.26, 0.04, 0.02]} />
            <meshStandardMaterial color="#2a1a10" />
          </mesh>
          <mesh position={[0, 1.55, 0.07]}>
            <boxGeometry args={[0.09, 1.0, 0.06]} />
            <meshStandardMaterial color="#3b2416" />
          </mesh>
          <mesh position={[0, 2.15, 0.07]}>
            <boxGeometry args={[0.15, 0.24, 0.05]} />
            <meshStandardMaterial color="#2a1a10" />
          </mesh>
          {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
            <mesh key={i} position={[x, 1.17, 0.175]}>
              <boxGeometry args={[0.004, 1.95, 0.004]} />
              <meshBasicMaterial color="#e9e2d0" />
            </mesh>
          ))}
        </group>

        <points ref={embers}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[emberData.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={new Color('#ffb347').multiplyScalar(2)}
            size={0.03}
            transparent
            opacity={0.9}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </points>
        <group ref={notes}>
          {Array.from({ length: 5 }, (_, i) => (
            <sprite key={i} scale={0.18}>
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

      {/* Wooden rocket on its pad */}
      <group position={rocket.position} quaternion={rocket.quaternion} scale={0.32}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.55, 0.6, 0.12, 8]} />
          <meshStandardMaterial color="#6b4a2e" flatShading />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 1.2, 10]} />
          <meshStandardMaterial color="#b88555" flatShading roughness={0.8} />
        </mesh>
        {[0.35, 0.75, 1.15].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[0.25, 0.02, 6, 16]} />
            <meshStandardMaterial color="#5a3d26" />
          </mesh>
        ))}
        <mesh position={[0, 1.6, 0]}>
          <coneGeometry args={[0.24, 0.5, 10]} />
          <meshStandardMaterial color="#c4472f" flatShading />
        </mesh>
        <mesh position={[0, 0.95, 0.24]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={new Color('#ffd27a').multiplyScalar(1.6)} toneMapped={false} />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation={[0, (k / 3) * Math.PI * 2, 0]} position={[0, 0.35, 0]}>
            <boxGeometry args={[0.04, 0.4, 0.55]} />
            <meshStandardMaterial color="#c4472f" flatShading />
          </mesh>
        ))}
      </group>

      {/* Geyser */}
      <group position={geyser.position} quaternion={geyser.quaternion}>
        <mesh position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.03, 6, 14]} />
          <meshStandardMaterial color="#9c968c" flatShading />
        </mesh>
        <group ref={plume} position={[0, 0.02, 0]}>
          {[0, 1, 2].map((i) => (
            <sprite key={i} position={[0, 0.25 + i * 0.32, 0]} scale={[0.35 + i * 0.15, 0.45, 1]}>
              <spriteMaterial map={steam} transparent opacity={0} depthWrite={false} />
            </sprite>
          ))}
        </group>
      </group>
    </group>
  );
}
