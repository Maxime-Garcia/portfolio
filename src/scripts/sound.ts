import { onUnlock } from '../stores/achievements';
import { soundEnabled } from '../stores/sound';
import { getContext } from '../audio/engine';

type Audio = typeof import('../audio/blips');
let blips: Audio | undefined;

/** Loads the synth on first need; it is only ever called from user-gesture handlers. */
async function synth(): Promise<Audio> {
  blips ??= await import('../audio/blips');
  return blips;
}

let stopWind: (() => void) | undefined;

/** Scroll wind: runs while sound is on. Only ever called from a user-gesture handler. */
async function wind(on: boolean): Promise<void> {
  if (on && !stopWind) {
    const { startWind } = await import('../audio/wind');
    stopWind ??= startWind();
  } else if (!on && stopWind) {
    stopWind();
    stopWind = undefined;
  }
}

function syncButtons(on: boolean): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]')) {
    button.setAttribute('aria-pressed', String(on));
  }
}

/**
 * UI micro-sounds. Off by default; nothing plays without a user action:
 * sounds answer clicks and keys only, and the AudioContext is created inside those handlers.
 */
export function initSound(): void {
  soundEnabled.subscribe(syncButtons);
  document.addEventListener('astro:page-load', () => syncButtons(soundEnabled.get()));

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (target?.closest('[data-sound-toggle]')) {
      const on = !soundEnabled.get();
      soundEnabled.set(on);
      if (on) void synth().then((s) => s.play('toggle'));
      void wind(on);
      return;
    }
    if (soundEnabled.get() && target?.closest('button, a, [role="button"]')) {
      void synth().then((s) => s.play('blip'));
    }
  });

  // Sound left on from a previous visit: the wind starts on the first gesture (autoplay rules).
  const resume = () => {
    if (soundEnabled.get()) void wind(true);
  };
  window.addEventListener('pointerdown', resume, { once: true });
  window.addEventListener('keydown', resume, { once: true });
  // Turned off from elsewhere (terminal command): stop the wind too.
  soundEnabled.listen((on) => {
    if (!on) void wind(false);
  });

  // Unlocks can happen without a gesture (e.g. the "sound" achievement on load):
  // chime only through an AudioContext a gesture already created.
  onUnlock(() => {
    if (soundEnabled.get() && getContext()) void synth().then((s) => s.play('chime'));
  });

  // Music visualiser: wired on the first play of the Passions track (a user action).
  document.addEventListener(
    'play',
    (event) => {
      const audio = event.target;
      if (!(audio instanceof HTMLAudioElement) || !audio.matches('[data-passions-audio]')) return;
      void import('../audio/analyser').then(({ attachAnalyser }) =>
        attachAnalyser(audio, document.querySelector<HTMLCanvasElement>('[data-visualizer]')),
      );
    },
    true,
  );
}
