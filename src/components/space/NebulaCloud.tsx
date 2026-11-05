import { useMemo } from 'react';
import { audioLevel } from '../../stores/audio';
import type { BodySpec } from './layout';
import type { Palette } from './palette';
import { nebula } from './generators';
import { Particles, useParticleUniforms } from './Particles';
import { useFade } from './useFade';

interface NebulaCloudProps {
  spec: BodySpec;
  palette: Palette;
  dark: boolean;
  animate: boolean;
  clouds: number;
}

/** The Passions nebula: gas glows and swells with the music (audio level is 0 under reduced motion). */
export function NebulaCloud({ spec, palette, dark, animate, clouds }: NebulaCloudProps) {
  const data = useMemo(
    () =>
      nebula({
        clouds,
        stars: clouds * 2,
        radius: spec.radius,
        palette: [palette.plasma, palette.signal, palette.amp],
      }),
    [clouds, spec.radius, palette],
  );
  const uniforms = useParticleUniforms(2.6);
  const group = useFade(spec.radius, (fade) => {
    const pulse = animate ? audioLevel.value : 0;
    uniforms.uScale.value += (1 + pulse * 0.6 - uniforms.uScale.value) * 0.15;
    uniforms.uOpacity.value = fade * (dark ? 0.7 + pulse * 0.5 : 0.6);
  });

  return (
    <group ref={group} position={spec.position} rotation={[0.2, 0.5, 0]}>
      <Particles data={data} uniforms={uniforms} additive={dark} animate={animate} />
    </group>
  );
}
