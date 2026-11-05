import { useMemo } from 'react';
import type { BodySpec } from './layout';
import type { Palette } from './palette';
import { galaxy } from './generators';
import { Particles, useParticleUniforms } from './Particles';
import { useFade } from './useFade';

interface GalaxyProps {
  spec: BodySpec;
  palette: Palette;
  dark: boolean;
  animate: boolean;
  count: number;
}

export function Galaxy({ spec, palette, dark, animate, count }: GalaxyProps) {
  const data = useMemo(
    () =>
      galaxy({
        count,
        radius: spec.radius,
        arms: 4,
        twist: 0.9,
        inner: palette.amp.clone().lerp(palette.ink, 0.35),
        outer: palette.signal.clone().lerp(palette.ink, 0.25),
        glow: palette.plasma.clone(),
      }),
    [count, spec.radius, palette],
  );
  const uniforms = useParticleUniforms(1.8, 0.05);
  const group = useFade(spec.radius, (fade) => {
    uniforms.uOpacity.value = fade * (dark ? 0.75 : 0.7);
  });

  return (
    <group ref={group} position={spec.position} rotation={[1.1, 0.3, -0.5]}>
      <Particles data={data} uniforms={uniforms} additive={dark} animate={animate} />
    </group>
  );
}
