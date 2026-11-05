import { scrollVelocity } from '../stores/velocity';
import { ensureContext } from './engine';

/** Wind voice settings for a scroll intensity (0..1): louder and brighter as you speed up. */
export function windFor(intensity: number): { gain: number; frequency: number; q: number } {
  const i = Math.min(1, Math.max(0, intensity));
  return { gain: i * i * 0.35, frequency: 350 + i * 1900, q: 0.7 + i * 1.5 };
}

/**
 * "Swish": looped white noise through a sweeping band-pass filter, following scroll speed.
 * Idle = silent (gain 0). Must be started from a user gesture (it creates the AudioContext).
 * Returns a cleanup.
 */
export function startWind(): () => void {
  const { context, master } = ensureContext();
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const noise = context.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  const gain = context.createGain();
  gain.gain.value = 0;
  noise.connect(filter).connect(gain).connect(master);
  noise.start();

  let frame = 0;
  const loop = () => {
    const { gain: g, frequency, q } = windFor(scrollVelocity.intensity);
    const now = context.currentTime;
    gain.gain.setTargetAtTime(g, now, 0.06);
    filter.frequency.setTargetAtTime(frequency, now, 0.08);
    filter.Q.setTargetAtTime(q, now, 0.1);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    gain.gain.setTargetAtTime(0, context.currentTime, 0.05);
    noise.stop(context.currentTime + 0.3);
  };
}
