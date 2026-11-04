import { ensureContext } from './engine';

export interface Note {
  /** Frequency in Hz. */
  frequency: number;
  /** Start offset in seconds. */
  at: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

/** The synthesised sound palette: short, quiet, no audio files. */
export const palette = {
  blip: [{ frequency: 880, at: 0, duration: 0.06, type: 'sine', gain: 0.18 }],
  toggle: [
    { frequency: 660, at: 0, duration: 0.07, type: 'triangle', gain: 0.2 },
    { frequency: 990, at: 0.06, duration: 0.09, type: 'triangle', gain: 0.18 },
  ],
  chime: [
    { frequency: 523.25, at: 0, duration: 0.25, type: 'sine', gain: 0.22 },
    { frequency: 659.25, at: 0.09, duration: 0.25, type: 'sine', gain: 0.2 },
    { frequency: 783.99, at: 0.18, duration: 0.35, type: 'sine', gain: 0.2 },
    { frequency: 1046.5, at: 0.27, duration: 0.5, type: 'sine', gain: 0.16 },
  ],
} satisfies Record<string, Note[]>;

export type SoundName = keyof typeof palette;

/** Envelope keyframes for one note: fast attack, exponential release. */
export function envelope(note: Note, start: number): { time: number; value: number }[] {
  const peak = note.gain ?? 0.2;
  const t0 = start + note.at;
  return [
    { time: t0, value: 0.0001 },
    { time: t0 + 0.008, value: peak },
    { time: t0 + note.duration, value: 0.0001 },
  ];
}

export function play(name: SoundName): void {
  const { context, master } = ensureContext();
  const now = context.currentTime;
  for (const note of palette[name] as Note[]) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = note.type ?? 'sine';
    osc.frequency.value = note.frequency;
    const [a, b, c] = envelope(note, now);
    gain.gain.setValueAtTime(a.value, a.time);
    gain.gain.linearRampToValueAtTime(b.value, b.time);
    gain.gain.exponentialRampToValueAtTime(c.value, c.time);
    osc.connect(gain).connect(master);
    osc.start(a.time);
    osc.stop(c.time + 0.02);
  }
}
