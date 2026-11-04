import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { dprRange } from '../../lib/capability';
import { activeSection } from '../../stores/section';
import { quality } from '../../stores/quality';
import { CameraRig } from './CameraRig';
import { useMedia, useStore, useTheme } from './hooks';
import { cameraFor, planets } from './layout';
import { Nebula } from './Nebula';
import { palettes } from './palette';
import { FOG_FAR, FOG_NEAR, Planet } from './Planet';
import { Starfield } from './Starfield';

/**
 * Background solar system: one planet per section, the camera follows the visible one.
 * Decorative only (the wrapper is aria-hidden); the page is complete without it.
 * About 10 draw calls: 6 planets, 2 rings, stars, nebula.
 */
export default function SpaceScene() {
  const section = useStore(activeSection);
  const level = useStore(quality);
  const theme = useTheme();
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const coarse = useMedia('(pointer: coarse)');
  const wide = useMedia('(min-width: 768px)');
  const [range] = useState(() => dprRange(coarse));
  const palette = palettes[theme];
  const low = level === 'low';
  const start = cameraFor(planets.find((p) => p.id === section) ?? planets[0], wide);
  // Client only: no <canvas> in the server HTML, nothing to hydrate against.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Canvas
      dpr={low ? 1 : range}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ fov: 50, near: 0.1, far: 400, position: start.position }}
      gl={{ alpha: true, antialias: !coarse && !low, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <fog attach="fog" args={[palette.background, FOG_NEAR, FOG_FAR]} />
      <PerformanceMonitor onDecline={() => quality.set('low')} flipflops={2} />
      <CameraRig section={section} wide={wide} reduced={reduced} />
      <Nebula palette={palette} animate={!reduced} />
      <Starfield
        count={low ? 900 : 2200}
        palette={palette}
        additive={theme === 'dark'}
        animate={!reduced}
      />
      {planets.map((spec, index) => (
        <Planet
          key={spec.id}
          spec={spec}
          palette={palette}
          seed={index * 1.7 + 0.3}
          animate={!reduced}
          segments={low ? 32 : 64}
        />
      ))}
    </Canvas>
  );
}
