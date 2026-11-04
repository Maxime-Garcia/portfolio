import { atom } from 'nanostores';

export type Quality = 'high' | 'low';

const KEY = 'orbite:quality';

function initial(): Quality {
  try {
    return localStorage.getItem(KEY) === 'low' ? 'low' : 'high';
  } catch {
    return 'high';
  }
}

/** 3D quality. Drops to "low" when the PerformanceMonitor sees a sustained fps decline; remembered. */
export const quality = atom<Quality>(typeof localStorage === 'undefined' ? 'high' : initial());

quality.listen((value) => {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* storage blocked */
  }
});
