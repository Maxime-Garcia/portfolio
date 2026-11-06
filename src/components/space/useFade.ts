import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector3, type Material, type Object3D } from 'three';
import { fadeFor } from './layout';
import { introFactor } from './intro';

const world = new Vector3();

type Fadable = Material & { opacity: number; userData: { baseOpacity?: number } };

/** Every material under `root`, made transparent once, with its original opacity remembered. */
function collect(root: Object3D): Fadable[] {
  const materials = new Set<Fadable>();
  root.traverse((child) => {
    const value = (child as Object3D & { material?: Material | Material[] }).material;
    for (const material of Array.isArray(value) ? value : value ? [value] : []) {
      const fadable = material as Fadable;
      fadable.userData.baseOpacity ??= fadable.opacity;
      fadable.transparent = true;
      materials.add(fadable);
    }
  });
  return [...materials];
}

/**
 * Fades a body with distance (1 near the camera, 0 far, from its surface) and with the scene
 * entrance, so nothing ever pops in or out. Every material under the returned ref follows;
 * `apply(fade)` lets shader materials sync their own uniforms. Hidden entirely at 0.
 */
export function useFade(radius: number, apply?: (fade: number) => void) {
  const ref = useRef<Object3D>(null);
  const materials = useRef<Fadable[] | null>(null);
  useFrame(({ camera, clock }) => {
    const object = ref.current;
    if (!object) return;
    object.getWorldPosition(world);
    const fade =
      fadeFor(camera.position.distanceTo(world) - radius) * introFactor(clock.elapsedTime);
    object.visible = fade > 0.001;
    if (!object.visible) return;
    materials.current ??= collect(object);
    for (const material of materials.current)
      material.opacity = (material.userData.baseOpacity ?? 1) * fade;
    apply?.(fade);
  });
  return ref;
}
