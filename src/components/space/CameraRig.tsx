import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import type { SectionId } from '../../i18n/ui';
import { cameraFor, planets } from './layout';

interface CameraRigProps {
  section: SectionId;
  wide: boolean;
  reduced: boolean;
}

/** Travels to the active planet with exponential smoothing; jumps instead under reduced motion. */
export function CameraRig({ section, wide, reduced }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const look = useRef(new Vector3());
  const goal = useMemo(() => {
    const spec = planets.find((planet) => planet.id === section) ?? planets[0];
    const { position, target } = cameraFor(spec, wide);
    return { position: new Vector3(...position), target: new Vector3(...target) };
  }, [section, wide]);

  useEffect(() => {
    if (!reduced) return;
    camera.position.copy(goal.position);
    look.current.copy(goal.target);
    camera.lookAt(look.current);
    invalidate();
  }, [goal, reduced, camera, invalidate]);

  useFrame((_, delta) => {
    if (reduced) return;
    const t = 1 - Math.exp(-Math.min(delta, 0.1) * 1.8);
    camera.position.lerp(goal.position, t);
    look.current.lerp(goal.target, t);
    camera.lookAt(look.current);
  });

  return null;
}
