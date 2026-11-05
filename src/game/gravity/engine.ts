/** Gravité: steer a probe to a target through the pull of planets. Pure logic, no DOM. */

export interface Vec {
  x: number;
  y: number;
}

export interface Body extends Vec {
  r: number;
  mass: number;
  /** Palette key used by the renderer. */
  tone: 'plasma' | 'signal' | 'amp';
}

export interface Level {
  id: number;
  start: Vec;
  target: Vec & { r: number };
  bodies: Body[];
}

/** The play field, in world units. */
export const WORLD = { width: 1000, height: 600 } as const;
export const G = 9000;
export const MAX_SPEED = 420;
export const MAX_TIME = 14;
export const PROBE_RADIUS = 6;

export type Status = 'aiming' | 'flying' | 'won' | 'crashed' | 'lost';

export interface Probe {
  position: Vec;
  velocity: Vec;
  time: number;
  trail: Vec[];
}

export interface Aim {
  /** Radians, 0 = right, positive = down (screen coordinates). */
  angle: number;
  /** 0..1 of MAX_SPEED. */
  power: number;
}

export const clampAim = ({ angle, power }: Aim): Aim => ({
  angle: ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
  power: Math.min(1, Math.max(0.1, power)),
});

export function launch(level: Level, aim: Aim): Probe {
  const { angle, power } = clampAim(aim);
  return {
    position: { ...level.start },
    velocity: { x: Math.cos(angle) * power * MAX_SPEED, y: Math.sin(angle) * power * MAX_SPEED },
    time: 0,
    trail: [{ ...level.start }],
  };
}

/** Gravitational acceleration at a point, softened so close passes stay stable. */
export function acceleration(point: Vec, bodies: readonly Body[]): Vec {
  let ax = 0;
  let ay = 0;
  for (const body of bodies) {
    const dx = body.x - point.x;
    const dy = body.y - point.y;
    const d2 = dx * dx + dy * dy + 400;
    const inv = (G * body.mass) / (d2 * Math.sqrt(d2));
    ax += dx * inv;
    ay += dy * inv;
  }
  return { x: ax, y: ay };
}

/** Advances the probe by dt (semi-implicit Euler) and reports the outcome. */
export function step(
  level: Level,
  probe: Probe,
  dt: number,
): { probe: Probe; status: Status; hit?: Body } {
  const a = acceleration(probe.position, level.bodies);
  const velocity = { x: probe.velocity.x + a.x * dt, y: probe.velocity.y + a.y * dt };
  const position = { x: probe.position.x + velocity.x * dt, y: probe.position.y + velocity.y * dt };
  const time = probe.time + dt;
  const last = probe.trail[probe.trail.length - 1];
  const trail =
    Math.hypot(position.x - last.x, position.y - last.y) > 4
      ? [...probe.trail, position].slice(-240)
      : probe.trail;
  const next = { position, velocity, time, trail };

  const toTarget = Math.hypot(position.x - level.target.x, position.y - level.target.y);
  if (toTarget <= level.target.r + PROBE_RADIUS) return { probe: next, status: 'won' };
  for (const body of level.bodies) {
    if (Math.hypot(position.x - body.x, position.y - body.y) <= body.r + PROBE_RADIUS) {
      return { probe: next, status: 'crashed', hit: body };
    }
  }
  const margin = 200;
  const out =
    position.x < -margin ||
    position.y < -margin ||
    position.x > WORLD.width + margin ||
    position.y > WORLD.height + margin;
  if (out || time >= MAX_TIME) return { probe: next, status: 'lost' };
  return { probe: next, status: 'flying' };
}

/** First part of the predicted path, drawn as an aiming guide (stops at the first collision). */
export function predict(level: Level, aim: Aim, seconds = 0.9, dt = 1 / 60): Vec[] {
  let probe = launch(level, aim);
  const points: Vec[] = [probe.position];
  for (let t = 0; t < seconds; t += dt) {
    const result = step(level, probe, dt);
    probe = result.probe;
    points.push(probe.position);
    if (result.status !== 'flying') break;
  }
  return points;
}

/** Stars earned: 3 on the first try, 2 within three, 1 otherwise. */
export function starsFor(attempts: number): 1 | 2 | 3 {
  if (attempts <= 1) return 3;
  return attempts <= 3 ? 2 : 1;
}

/** Best results per level, persisted by the UI. Keeps the fewest attempts. */
export function recordBest(
  best: Record<number, number>,
  level: number,
  attempts: number,
): Record<number, number> {
  const previous = best[level];
  return previous !== undefined && previous <= attempts ? best : { ...best, [level]: attempts };
}

export function parseBest(raw: string | null): Record<number, number> {
  try {
    const data: unknown = JSON.parse(raw ?? '{}');
    if (typeof data !== 'object' || data === null) return {};
    const result: Record<number, number> = {};
    for (const [key, value] of Object.entries(data)) {
      if (Number.isInteger(Number(key)) && typeof value === 'number' && value > 0)
        result[Number(key)] = value;
    }
    return result;
  } catch {
    return {};
  }
}
