/**
 * Live music level (0..1), written every frame by the analyser and read every frame by the 3D scene.
 * A plain mutable object on purpose: a store would trigger re-renders 60 times per second.
 */
export const audioLevel = { value: 0 };
