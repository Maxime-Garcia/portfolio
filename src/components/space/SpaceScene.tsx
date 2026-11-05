import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useEffect, useState } from 'react';
import { dprRange } from '../../lib/capability';
import { activeSection } from '../../stores/section';
import { quality } from '../../stores/quality';
import { CameraRig } from './CameraRig';
import { Earth } from './Earth';
import { Galaxy } from './Galaxy';
import { useMedia, useStore, useTheme } from './hooks';
import { SUN_DIRECTION, bodies, cameraFor, type BodySpec } from './layout';
import { NebulaCloud } from './NebulaCloud';
import { palettes } from './palette';
import { Sky } from './Sky';
import { Starfield } from './Starfield';
import { TexturedPlanet } from './TexturedPlanet';
import type { Tier } from './textures';

const hasTexture = (
  spec: BodySpec,
): spec is BodySpec & { texture: NonNullable<BodySpec['texture']> } => spec.texture !== undefined;

/**
 * Background voyage: Earth, Mars, Jupiter, Saturn, a nebula, a galaxy — one per section.
 * The camera follows the visible section. Decorative only (the wrapper is aria-hidden);
 * the page is complete without it. Textures: Solar System Scope, CC BY 4.0.
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
  const dark = theme === 'dark';
  const low = level === 'low';
  const tier: Tier = coarse || low ? 'sd' : 'hd';
  const segments = low ? 48 : 96;
  const animate = !reduced;
  const start = cameraFor(bodies.find((b) => b.id === section) ?? bodies[0], wide);
  // Client only: no <canvas> in the server HTML, nothing to hydrate against.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Canvas
      dpr={low ? 1 : range}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ fov: 50, near: 0.1, far: 1200, position: start.position }}
      gl={{ alpha: true, antialias: !coarse && !low, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <PerformanceMonitor onDecline={() => quality.set('low')} flipflops={2} />
      <CameraRig section={section} wide={wide} reduced={reduced} />
      <ambientLight intensity={dark ? 0.06 : 0.35} />
      <directionalLight
        position={SUN_DIRECTION.map((v) => v * 100) as [number, number, number]}
        intensity={3.2}
      />
      <Starfield count={low ? 900 : 2600} palette={palette} additive={dark} animate={animate} />
      <Suspense fallback={null}>
        {dark && <Sky tier={tier} />}
        {bodies.map((spec) => {
          if (spec.kind === 'earth')
            return (
              <Earth key={spec.id} spec={spec} tier={tier} animate={animate} segments={segments} />
            );
          if (spec.kind === 'nebula')
            return (
              <NebulaCloud
                key={spec.id}
                spec={spec}
                palette={palette}
                dark={dark}
                animate={animate}
                clouds={low ? 360 : 900}
              />
            );
          if (spec.kind === 'galaxy')
            return (
              <Galaxy
                key={spec.id}
                spec={spec}
                palette={palette}
                dark={dark}
                animate={animate}
                count={low ? 18000 : 60000}
              />
            );
          return hasTexture(spec) ? (
            <TexturedPlanet
              key={spec.id}
              spec={spec}
              tier={tier}
              animate={animate}
              segments={segments}
            />
          ) : null;
        })}
      </Suspense>
      {dark && !low && (
        <EffectComposer multisampling={coarse ? 0 : 4}>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.55}
            luminanceSmoothing={0.3}
            intensity={0.9}
            radius={0.75}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
