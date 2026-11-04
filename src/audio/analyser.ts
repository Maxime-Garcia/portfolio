import { audioLevel } from '../stores/audio';
import { ensureContext } from './engine';

const wired = new WeakSet<HTMLMediaElement>();

/** Average of a byte frequency array, normalised to 0..1. */
export function levelOf(bins: Uint8Array): number {
  if (bins.length === 0) return 0;
  let sum = 0;
  for (const value of bins) sum += value;
  return sum / bins.length / 255;
}

/**
 * Routes a media element through an AnalyserNode, on its first "play" (a user action).
 * Drives the shared audio level and an optional 2D bar visualiser (static under reduced motion).
 */
export function attachAnalyser(audio: HTMLMediaElement, canvas: HTMLCanvasElement | null): void {
  if (wired.has(audio)) return;
  wired.add(audio);
  const { context } = ensureContext();
  const source = context.createMediaElementSource(audio);
  const analyser = context.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.8;
  // Straight to the speakers: the music does not depend on the UI sound toggle.
  source.connect(analyser).connect(context.destination);

  const bins = new Uint8Array(analyser.frequencyBinCount);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const draw2d = canvas?.getContext('2d');
  const color = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--plasma').trim() || '#ff4fd8';

  const frame = () => {
    if (audio.paused || audio.ended) {
      audioLevel.value = 0;
      return;
    }
    analyser.getByteFrequencyData(bins);
    audioLevel.value = reduced.matches ? 0 : levelOf(bins);
    if (draw2d && canvas && !reduced.matches) {
      const { width, height } = canvas;
      draw2d.clearRect(0, 0, width, height);
      draw2d.fillStyle = color();
      const bars = 32;
      const step = Math.floor(bins.length / bars);
      const barWidth = width / bars;
      for (let i = 0; i < bars; i++) {
        const value = (bins[i * step] ?? 0) / 255;
        const h = Math.max(2, value * height);
        draw2d.fillRect(i * barWidth + 1, height - h, barWidth - 2, h);
      }
    }
    requestAnimationFrame(frame);
  };

  audio.addEventListener('play', () => {
    if (context.state === 'suspended') void context.resume();
    requestAnimationFrame(frame);
  });
  requestAnimationFrame(frame);
}
