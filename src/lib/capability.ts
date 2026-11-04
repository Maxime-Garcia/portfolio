export interface DeviceSignals {
  webgl: boolean;
  saveData: boolean;
  /** navigator.hardwareConcurrency, when known. */
  cores?: number;
  /** navigator.deviceMemory (GB), when known. */
  memory?: number;
  coarsePointer: boolean;
}

/** The 3D scene is an enhancement: skip it on devices that would pay too much for it. */
export function canRender3D(signals: DeviceSignals): boolean {
  if (!signals.webgl || signals.saveData) return false;
  const weakMobile =
    signals.coarsePointer &&
    ((signals.cores !== undefined && signals.cores <= 4) ||
      (signals.memory !== undefined && signals.memory <= 2));
  return !weakMobile;
}

/** Pixel ratio bounds for the canvas: lighter on touch devices. */
export function dprRange(coarsePointer: boolean): [number, number] {
  return coarsePointer ? [1, 1.5] : [1, 2];
}

export function readDeviceSignals(): DeviceSignals {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  let webgl: boolean;
  try {
    const canvas = document.createElement('canvas');
    webgl = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    webgl = false;
  }
  return {
    webgl,
    saveData: nav.connection?.saveData === true,
    cores: nav.hardwareConcurrency,
    memory: nav.deviceMemory,
    coarsePointer: matchMedia('(pointer: coarse)').matches,
  };
}
