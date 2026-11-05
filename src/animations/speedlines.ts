import { scrollVelocity } from '../stores/velocity';
import { seeded } from '../components/space/random';

const LINES = 90;

/**
 * Anime-style speed lines: thin wedges radiating from the centre to the edges,
 * redrawn with fresh randomness every other frame while scrolling fast.
 * Purely decorative (aria-hidden canvas). Never started under reduced motion.
 */
export function drawSpeedLines(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
  color: string,
  random: () => number,
): void {
  context.clearRect(0, 0, width, height);
  if (intensity <= 0.02) return;
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.hypot(cx, cy) * 1.05;
  context.fillStyle = color;
  for (let i = 0; i < LINES; i++) {
    if (random() > 0.35 + intensity * 0.6) continue;
    const angle = random() * Math.PI * 2;
    // Stronger scroll: lines reach further into the centre.
    const inner = outer * (0.78 - intensity * 0.4 + random() * 0.15);
    const spread = (0.002 + random() * 0.006) * (0.6 + intensity);
    context.globalAlpha = (0.08 + random() * 0.3) * intensity;
    context.beginPath();
    context.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    context.lineTo(cx + Math.cos(angle - spread) * outer, cy + Math.sin(angle - spread) * outer);
    context.lineTo(cx + Math.cos(angle + spread) * outer, cy + Math.sin(angle + spread) * outer);
    context.closePath();
    context.fill();
  }
  context.globalAlpha = 1;
}

export function startSpeedLines(): () => void {
  const canvas = document.createElement('canvas');
  canvas.className = 'speed-lines';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const context = canvas.getContext('2d');
  const random = seeded(Date.now() & 0xffff);
  let frame = 0;
  let tick = 0;

  const resize = () => {
    canvas.width = Math.round(window.innerWidth);
    canvas.height = Math.round(window.innerHeight);
  };
  resize();
  window.addEventListener('resize', resize);

  const loop = () => {
    frame = requestAnimationFrame(loop);
    tick += 1;
    if (!context || tick % 2) return;
    const color =
      getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#e8ecff';
    drawSpeedLines(context, canvas.width, canvas.height, scrollVelocity.intensity, color, random);
  };
  frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    canvas.remove();
  };
}
