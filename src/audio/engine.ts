/**
 * Single AudioContext, created lazily and only from a user gesture (click, key).
 * Nothing in this module runs at import time.
 */
let context: AudioContext | undefined;
let master: GainNode | undefined;

export function getContext(): AudioContext | undefined {
  return context;
}

/** Creates (or resumes) the context. Must be called inside a user-gesture handler. */
export function ensureContext(): { context: AudioContext; master: GainNode } {
  if (!context || !master) {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0.5;
    master.connect(context.destination);
  }
  if (context.state === 'suspended') void context.resume();
  return { context, master };
}
