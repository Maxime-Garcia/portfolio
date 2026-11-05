import type { Level } from './engine';

/** Hand-made levels, easy to hard. World: 1000 × 600. */
export const levels: readonly Level[] = [
  {
    id: 1,
    start: { x: 90, y: 300 },
    target: { x: 900, y: 300, r: 30 },
    bodies: [{ x: 500, y: 360, r: 46, mass: 9, tone: 'signal' }],
  },
  {
    id: 2,
    start: { x: 90, y: 480 },
    target: { x: 880, y: 140, r: 40 },
    bodies: [
      { x: 430, y: 300, r: 58, mass: 14, tone: 'amp' },
      { x: 700, y: 430, r: 26, mass: 4, tone: 'plasma' },
    ],
  },
  {
    id: 3,
    start: { x: 100, y: 120 },
    target: { x: 120, y: 480, r: 28 },
    bodies: [{ x: 420, y: 300, r: 70, mass: 22, tone: 'plasma' }],
  },
  {
    id: 4,
    start: { x: 80, y: 300 },
    target: { x: 920, y: 300, r: 24 },
    bodies: [
      { x: 330, y: 220, r: 40, mass: 10, tone: 'signal' },
      { x: 520, y: 380, r: 52, mass: 14, tone: 'amp' },
      { x: 720, y: 240, r: 34, mass: 8, tone: 'plasma' },
    ],
  },
  {
    id: 5,
    start: { x: 500, y: 540 },
    target: { x: 500, y: 70, r: 38 },
    bodies: [
      { x: 560, y: 320, r: 56, mass: 12, tone: 'amp' },
      { x: 260, y: 230, r: 26, mass: 6, tone: 'signal' },
      { x: 800, y: 160, r: 26, mass: 6, tone: 'plasma' },
    ],
  },
];
