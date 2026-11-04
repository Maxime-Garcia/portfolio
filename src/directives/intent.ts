import type { ClientDirective } from 'astro';
import { canRender3D, readDeviceSignals } from '../lib/capability';

// No plain "scroll": browsers fire it without any user action (load, viewport changes).
// Real scrolling always starts with one of these.
const INTENT_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

/** Chrome sends a zero-movement pointermove on load when the cursor rests over the page: not an intent. */
function isIntent(event: Event): boolean {
  if (event.type !== 'pointermove') return true;
  const { movementX, movementY } = event as PointerEvent;
  return movementX !== 0 || movementY !== 0;
}

/**
 * client:intent — hydrates on the first sign of a human (pointer, wheel, touch, key)
 * or when the HUD "ignite" button fires `orbite:ignite`. Never on incapable devices.
 * State is exposed on <html data-space="off|ready|on"> for CSS and the HUD.
 */
const intent: ClientDirective = (load) => {
  const root = document.documentElement;
  if (!canRender3D(readDeviceSignals())) {
    root.dataset.space = 'off';
    return;
  }
  root.dataset.space = 'ready';

  let started = false;
  const start = async (event: Event) => {
    if (started || !isIntent(event)) return;
    started = true;
    for (const name of INTENT_EVENTS) window.removeEventListener(name, start);
    window.removeEventListener('orbite:ignite', start);
    const hydrate = await load();
    await hydrate();
    root.dataset.space = 'on';
  };

  for (const name of INTENT_EVENTS) window.addEventListener(name, start, { passive: true });
  window.addEventListener('orbite:ignite', start);
};

export default intent;
