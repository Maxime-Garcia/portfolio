import { describe, expect, it } from 'vitest';
import {
  acceleration,
  clampAim,
  launch,
  parseBest,
  predict,
  recordBest,
  starsFor,
  step,
  type Aim,
  type Level,
  type Status,
} from '../../src/game/gravity/engine';
import { levels } from '../../src/game/gravity/levels';

function simulate(level: Level, aim: Aim): Status {
  let probe = launch(level, aim);
  for (let i = 0; i < 60 * 15; i++) {
    const result = step(level, probe, 1 / 60);
    if (result.status !== 'flying') return result.status;
    probe = result.probe;
  }
  return 'lost';
}

/** Brute force: every level must have winning shots, and not too many (no trivial level). */
function winningShots(level: Level) {
  let wins = 0;
  for (let deg = 0; deg < 360; deg += 2) {
    for (let power = 0.2; power <= 1; power += 0.05) {
      if (simulate(level, { angle: (deg * Math.PI) / 180, power }) === 'won') wins += 1;
    }
  }
  return wins;
}

describe('gravity engine', () => {
  it('pulls towards bodies', () => {
    const a = acceleration({ x: 0, y: 0 }, [{ x: 100, y: 0, r: 10, mass: 5, tone: 'amp' }]);
    expect(a.x).toBeGreaterThan(0);
    expect(a.y).toBe(0);
  });

  it('clamps aim', () => {
    expect(clampAim({ angle: -Math.PI / 2, power: 5 })).toEqual({
      angle: (3 * Math.PI) / 2,
      power: 1,
    });
    expect(clampAim({ angle: 0, power: 0 }).power).toBe(0.1);
  });

  it('wins, crashes and gets lost', () => {
    const empty: Level = {
      id: 0,
      start: { x: 0, y: 0 },
      target: { x: 100, y: 0, r: 10 },
      bodies: [],
    };
    expect(simulate(empty, { angle: 0, power: 0.5 })).toBe('won');
    expect(simulate(empty, { angle: Math.PI, power: 1 })).toBe('lost');
    const wall: Level = { ...empty, bodies: [{ x: 50, y: 0, r: 10, mass: 1, tone: 'amp' }] };
    expect(simulate(wall, { angle: 0, power: 0.5 })).toBe('crashed');
  });

  it('predicts a short path for aiming', () => {
    const path = predict(levels[0], { angle: 0, power: 0.6 });
    expect(path.length).toBeGreaterThan(10);
    expect(path[0]).toEqual(levels[0].start);
  });

  it('scores and keeps the best attempts', () => {
    expect([starsFor(1), starsFor(3), starsFor(9)]).toEqual([3, 2, 1]);
    const best = recordBest({}, 1, 3);
    expect(recordBest(best, 1, 5)).toBe(best);
    expect(recordBest(best, 1, 2)).toEqual({ 1: 2 });
    expect(parseBest('{"1":2,"x":3,"2":-1}')).toEqual({ 1: 2 });
    expect(parseBest('nope')).toEqual({});
    expect(parseBest('null')).toEqual({});
  });
});

describe('levels', () => {
  for (const level of levels) {
    it(`level ${level.id} is solvable but not trivial`, () => {
      const wins = winningShots(level);
      expect(wins).toBeGreaterThan(0);
      expect(wins).toBeLessThan(1500);
    });
  }
});
