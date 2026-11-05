import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector3, type Object3D } from 'three';
import { fadeFor } from './layout';

const world = new Vector3();

/**
 * Calls `apply(fade)` every frame with 1 near the camera and 0 far away,
 * measured from the body's surface. Objects are hidden entirely at 0 (no draw call).
 */
export function useFade(radius: number, apply: (fade: number) => void) {
  const ref = useRef<Object3D>(null);
  useFrame(({ camera }) => {
    const object = ref.current;
    if (!object) return;
    object.getWorldPosition(world);
    const fade = fadeFor(camera.position.distanceTo(world) - radius);
    object.visible = fade > 0.001;
    apply(fade);
  });
  return ref;
}
