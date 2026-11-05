import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  QuadraticBezierCurve3,
  Vector3,
  type Group,
  type Points,
} from 'three';
import type { Palette } from './palette';

interface IntegrationNetworkProps {
  radius: number;
  palette: Palette;
  animate: boolean;
  dark: boolean;
}

const MOONS = [
  { name: 'io', orbit: 1.45, size: 0.11, color: '#d9c45a', angle: 0.3 },
  { name: 'europa', orbit: 1.75, size: 0.09, color: '#e8e2d4', angle: 2.1 },
  { name: 'ganymede', orbit: 2.1, size: 0.14, color: '#9a8f86', angle: 3.6 },
  { name: 'callisto', orbit: 2.5, size: 0.13, color: '#6e655d', angle: 5.0 },
];

/**
 * Skills (Jupiter): the Galilean moons, linked to the planet and to each other by arcs where
 * data packets travel — the integration work, drawn as a planetary system.
 */
export function IntegrationNetwork({ radius, palette, animate, dark }: IntegrationNetworkProps) {
  const system = useRef<Group>(null);
  const packets = useRef<Points>(null);
  const { moons, curves, lines } = useMemo(() => {
    const moons = MOONS.map((m) => ({
      ...m,
      position: new Vector3(
        Math.cos(m.angle) * m.orbit * radius,
        0,
        Math.sin(m.angle) * m.orbit * radius,
      ),
    }));
    const curves: QuadraticBezierCurve3[] = [];
    for (const moon of moons) {
      const from = moon.position
        .clone()
        .normalize()
        .multiplyScalar(radius * 1.02);
      const mid = from
        .clone()
        .add(moon.position)
        .multiplyScalar(0.5)
        .add(new Vector3(0, radius * 0.5, 0));
      curves.push(new QuadraticBezierCurve3(from, mid, moon.position.clone()));
    }
    for (let i = 0; i < moons.length; i++) {
      const a = moons[i].position;
      const b = moons[(i + 1) % moons.length].position;
      const mid = a
        .clone()
        .add(b)
        .multiplyScalar(0.5)
        .multiplyScalar(1.15)
        .add(new Vector3(0, radius * 0.25, 0));
      curves.push(new QuadraticBezierCurve3(a.clone(), mid, b.clone()));
    }
    const lines = curves.map((curve) => new BufferGeometry().setFromPoints(curve.getPoints(40)));
    return { moons, curves, lines };
  }, [radius]);

  const packetData = useMemo(() => {
    const count = curves.length * 3;
    return {
      positions: new Float32Array(count * 3),
      tracks: Array.from({ length: count }, (_, i) => ({
        curve: i % curves.length,
        offset: i / count,
        speed: 0.12 + ((i * 37) % 10) / 60,
      })),
    };
  }, [curves]);
  const point = useMemo(() => new Vector3(), []);

  useFrame(({ clock }, delta) => {
    if (animate && system.current) system.current.rotation.y += delta * 0.04;
    const geometry = packets.current?.geometry;
    if (!geometry) return;
    const t = animate ? clock.elapsedTime : 0;
    packetData.tracks.forEach((track, i) => {
      curves[track.curve].getPoint((t * track.speed + track.offset) % 1, point);
      geometry.attributes.position.setXYZ(i, point.x, point.y, point.z);
    });
    geometry.attributes.position.needsUpdate = true;
  });

  const link = palette.signal.clone().multiplyScalar(dark ? 1 : 0.8);
  return (
    <group rotation={[0.45, 0, 0.12]}>
      <group ref={system}>
        {moons.map((moon) => (
          <mesh key={moon.name} position={moon.position}>
            <sphereGeometry args={[moon.size * radius, 24, 16]} />
            <meshStandardMaterial color={moon.color} roughness={0.9} />
          </mesh>
        ))}
        {lines.map((geometry, i) => (
          <line key={i}>
            <primitive object={geometry} attach="geometry" />
            <lineBasicMaterial
              color={link}
              transparent
              opacity={dark ? 0.45 : 0.6}
              depthWrite={false}
            />
          </line>
        ))}
        <points ref={packets}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[packetData.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={new Color(palette.amp).multiplyScalar(dark ? 2.5 : 1)}
            size={0.12}
            transparent
            depthWrite={false}
            blending={dark ? AdditiveBlending : undefined}
            toneMapped={false}
          />
        </points>
      </group>
    </group>
  );
}
