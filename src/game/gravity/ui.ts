import { isLang, useTranslations } from '../../i18n/utils';
import { defaultLang } from '../../i18n/ui';
import { fill } from '../../components/terminal/commands';
import {
  WORLD,
  clampAim,
  launch,
  parseBest,
  predict,
  recordBest,
  starsFor,
  step,
  type Aim,
  type Probe,
  type Status,
} from './engine';
import { levels } from './levels';

const BEST_KEY = 'orbite:gravity';
import { GRAVITY_WIN_EVENT } from './events';

let dialog: HTMLDialogElement | undefined;

const css = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  ...children: (Node | string)[]
) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

/** Opens the Gravité game in a modal dialog (built on first use). */
export function openGravityGame(): void {
  dialog ??= build();
  if (!dialog.open) {
    dialog.showModal();
    dialog.dispatchEvent(new Event('game-open'));
  }
}

function build(): HTMLDialogElement {
  const lang = isLang(document.documentElement.lang) ? document.documentElement.lang : defaultLang;
  const t = useTranslations(lang);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let best = (() => {
    try {
      return parseBest(localStorage.getItem(BEST_KEY));
    } catch {
      return {};
    }
  })();

  let index = Math.min(levels.length - 1, Object.keys(best).length);
  let aim: Aim = { angle: 0, power: 0.55 };
  let attempts = 0;
  let probe: Probe | undefined;
  let status: Status = 'aiming';
  let frame = 0;
  let dragging = false;

  const box = el('dialog', { className: 'game-dialog' });
  box.setAttribute('aria-labelledby', 'game-title');
  box.setAttribute('data-lenis-prevent', '');
  const title = el(
    'h2',
    { id: 'game-title', className: 'font-display text-lg font-bold' },
    t('game.title'),
  );
  const close = el(
    'button',
    { type: 'button', className: 'game-button' },
    el('span', { ariaHidden: 'true' }, 'esc'),
    el('span', { className: 'sr-only' }, t('game.close')),
  );
  const meta = el('p', { className: 'font-mono text-xs text-muted' });
  const intro = el('p', { className: 'text-sm text-muted' }, t('game.intro'));
  const canvas = el('canvas', { className: 'game-canvas', tabIndex: 0 });
  canvas.setAttribute('role', 'img');
  const aimText = el('p', { className: 'font-mono text-sm text-ink' });
  const statusText = el('p', { className: 'font-mono text-sm text-amp' });
  statusText.setAttribute('role', 'status');
  const help = el('p', { id: 'game-help', className: 'text-xs text-muted' }, t('game.controls'));
  canvas.setAttribute('aria-describedby', 'game-help');
  const button = (label: string, onClick: () => void) => {
    const b = el('button', { type: 'button', className: 'game-button' }, label);
    b.addEventListener('click', onClick);
    return b;
  };
  const launchButton = button(t('game.launch'), () => fire());
  const nextButton = button(t('game.next'), () => goto(index + 1));
  const controls = el(
    'div',
    { className: 'flex flex-wrap items-center gap-2' },
    button(`${t('game.angle')} −`, () => nudge(-5, 0)),
    button(`${t('game.angle')} +`, () => nudge(5, 0)),
    button(`${t('game.power')} −`, () => nudge(0, -0.05)),
    button(`${t('game.power')} +`, () => nudge(0, 0.05)),
    launchButton,
    button(t('game.reset'), () => reset()),
    nextButton,
  );
  box.append(
    el(
      'div',
      { className: 'flex items-center justify-between gap-4' },
      el('div', {}, title, meta),
      close,
    ),
    intro,
    canvas,
    aimText,
    statusText,
    controls,
    help,
  );
  document.body.append(box);

  const level = () => levels[index];

  function updateText() {
    const n = String(index + 1);
    const record = best[level().id];
    meta.textContent = [
      fill(t('game.level'), { n, total: String(levels.length) }),
      fill(t('game.attempts'), { n: String(attempts) }),
      record ? fill(t('game.best'), { n: String(record) }) : '',
    ]
      .filter(Boolean)
      .join(' · ');
    const deg = Math.round((clampAim(aim).angle * 180) / Math.PI);
    aimText.textContent = fill(t('game.aim'), {
      angle: String(deg),
      power: String(Math.round(clampAim(aim).power * 100)),
    });
    canvas.setAttribute(
      'aria-label',
      fill(t('game.board'), { count: String(level().bodies.length) }),
    );
    nextButton.hidden = status !== 'won' || index >= levels.length - 1;
    launchButton.disabled = status === 'flying';
  }

  function nudge(degrees: number, power: number) {
    if (status === 'flying') return;
    aim = clampAim({ angle: aim.angle + (degrees * Math.PI) / 180, power: aim.power + power });
    if (status !== 'aiming') status = 'aiming';
    updateText();
    draw();
  }

  function reset() {
    cancelAnimationFrame(frame);
    probe = undefined;
    status = 'aiming';
    statusText.textContent = '';
    updateText();
    draw();
  }

  function goto(next: number) {
    index = Math.max(0, Math.min(levels.length - 1, next));
    attempts = 0;
    aim = { angle: 0, power: 0.55 };
    reset();
  }

  function fire() {
    if (status === 'flying') return;
    attempts += 1;
    probe = launch(level(), aim);
    status = 'flying';
    statusText.textContent = '';
    updateText();
    // Fixed 1/240 s physics steps: the same shot always gives the same path, whatever the frame rate.
    const STEP = 1 / 240;
    let last = performance.now();
    let pending = 0;
    const loop = (now: number) => {
      pending += Math.min(0.1, (now - last) / 1000);
      last = now;
      while (pending >= STEP && probe && status === 'flying') {
        const result = step(level(), probe, STEP);
        probe = result.probe;
        status = result.status;
        pending -= STEP;
      }
      draw();
      if (status === 'flying') frame = requestAnimationFrame(loop);
      else finish();
    };
    frame = requestAnimationFrame(loop);
  }

  function finish() {
    if (status === 'won') {
      const stars = '★'.repeat(starsFor(attempts)) + '☆'.repeat(3 - starsFor(attempts));
      best = recordBest(best, level().id, attempts);
      try {
        localStorage.setItem(BEST_KEY, JSON.stringify(best));
      } catch {
        /* storage blocked */
      }
      statusText.textContent =
        index === levels.length - 1
          ? `${fill(t('game.won'), { n: String(attempts), stars })} ${t('game.done')}`
          : fill(t('game.won'), { n: String(attempts), stars });
      window.dispatchEvent(
        new CustomEvent(GRAVITY_WIN_EVENT, { detail: { level: level().id, attempts } }),
      );
    } else {
      statusText.textContent = t(status === 'crashed' ? 'game.crashed' : 'game.lost');
    }
    updateText();
  }

  // Drawing ---------------------------------------------------------------
  const context = canvas.getContext('2d');
  const stars = Array.from({ length: 90 }, (_, i) => ({
    x: (i * 379) % WORLD.width,
    y: (i * 233 + (i % 7) * 41) % WORLD.height,
    r: i % 9 === 0 ? 1.6 : 0.9,
  }));
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = canvas.clientWidth || 800;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(((width * WORLD.height) / WORLD.width) * dpr);
    draw();
  }

  function draw() {
    if (!context) return;
    const scale = canvas.width / WORLD.width;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, WORLD.width, WORLD.height);
    context.fillStyle = css('--bg', '#05060f');
    context.fillRect(0, 0, WORLD.width, WORLD.height);
    const ink = css('--ink', '#e8ecff');
    context.fillStyle = ink;
    context.globalAlpha = 0.35;
    for (const star of stars) {
      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    const { start, target, bodies } = level();

    // Target ring.
    context.strokeStyle = css('--signal', '#5ef2ff');
    context.lineWidth = 4;
    context.beginPath();
    context.arc(target.x, target.y, target.r, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 0.15;
    context.fillStyle = css('--signal', '#5ef2ff');
    context.fill();
    context.globalAlpha = 1;

    // Planets with a soft halo showing their pull.
    for (const body of bodies) {
      const color = css(`--${body.tone}`, '#ff4fd8');
      const halo = context.createRadialGradient(
        body.x,
        body.y,
        body.r,
        body.x,
        body.y,
        body.r * 2.6,
      );
      halo.addColorStop(0, `${color}33`);
      halo.addColorStop(1, `${color}00`);
      context.fillStyle = halo;
      context.beginPath();
      context.arc(body.x, body.y, body.r * 2.6, 0, Math.PI * 2);
      context.fill();
      const fillGradient = context.createRadialGradient(
        body.x - body.r * 0.35,
        body.y - body.r * 0.35,
        body.r * 0.1,
        body.x,
        body.y,
        body.r,
      );
      fillGradient.addColorStop(0, ink);
      fillGradient.addColorStop(0.25, color);
      fillGradient.addColorStop(1, css('--surface', '#0d1030'));
      context.fillStyle = fillGradient;
      context.beginPath();
      context.arc(body.x, body.y, body.r, 0, Math.PI * 2);
      context.fill();
    }

    // Aiming guide.
    if (status !== 'flying') {
      context.setLineDash([6, 8]);
      context.strokeStyle = ink;
      context.globalAlpha = 0.6;
      context.lineWidth = 2;
      context.beginPath();
      for (const [i, p] of predict(level(), aim).entries()) {
        if (i === 0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
      }
      context.stroke();
      context.setLineDash([]);
      context.globalAlpha = 1;
    }

    // Probe and trail.
    if (probe) {
      context.strokeStyle = css('--amp', '#ffb347');
      context.lineWidth = 2;
      context.beginPath();
      probe.trail.forEach((p, i) => (i ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y)));
      context.stroke();
    }
    const at = probe?.position ?? start;
    context.fillStyle = css('--amp', '#ffb347');
    context.beginPath();
    context.arc(at.x, at.y, 7, 0, Math.PI * 2);
    context.fill();
    if (!reduced && status === 'crashed') {
      context.strokeStyle = css('--plasma', '#ff4fd8');
      context.beginPath();
      context.arc(at.x, at.y, 18, 0, Math.PI * 2);
      context.stroke();
    }
  }

  // Input ----------------------------------------------------------------
  const toWorld = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WORLD.width,
      y: ((event.clientY - rect.top) / rect.height) * WORLD.height,
    };
  };
  const aimAt = (event: PointerEvent) => {
    const point = toWorld(event);
    const { start } = level();
    aim = clampAim({
      angle: Math.atan2(point.y - start.y, point.x - start.x),
      power: Math.hypot(point.x - start.x, point.y - start.y) / 400,
    });
    updateText();
    draw();
  };
  canvas.addEventListener('pointerdown', (event) => {
    if (status === 'flying') return;
    if (status !== 'aiming') reset();
    dragging = true;
    canvas.setPointerCapture(event.pointerId);
    aimAt(event);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (dragging) aimAt(event);
  });
  canvas.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    fire();
  });
  box.addEventListener('keydown', (event) => {
    if ((event.target as Element).closest('button')) return;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => nudge(-2, 0),
      ArrowRight: () => nudge(2, 0),
      ArrowUp: () => nudge(0, 0.03),
      ArrowDown: () => nudge(0, -0.03),
      ' ': () => fire(),
      Enter: () => fire(),
      r: () => reset(),
      R: () => reset(),
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  });
  close.addEventListener('click', () => box.close());
  box.addEventListener('close', () => cancelAnimationFrame(frame));
  window.addEventListener('resize', () => box.open && resize());
  box.addEventListener('game-open', () => {
    requestAnimationFrame(resize);
    canvas.focus();
  });

  updateText();
  requestAnimationFrame(resize);
  return box;
}
