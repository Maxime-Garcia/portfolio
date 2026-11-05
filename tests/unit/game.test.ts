// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { sections } from '../../src/i18n/ui';
import { useTranslations } from '../../src/i18n/utils';
import {
  achievementIds,
  emptyState,
  parseState,
  progress,
  unlock,
  visitPlanet,
} from '../../src/lib/achievements';
import {
  commandNames,
  fill,
  isCommand,
  runCommand,
  type CommandContext,
} from '../../src/components/terminal/commands';
import {
  createKonamiMatcher,
  isTypingTarget,
  KONAMI,
  listenKonami,
} from '../../src/scripts/konami';

describe('achievements', () => {
  it('unlocks once and reports what was gained', () => {
    const first = unlock(emptyState, 'konami');
    expect(first.gained).toEqual(['konami']);
    const again = unlock(first.state, 'konami');
    expect(again.gained).toEqual([]);
    expect(again.state).toBe(first.state);
  });

  it('unlocks "planets" only after all six visits', () => {
    let state = emptyState;
    for (const id of sections.slice(0, -1)) {
      const step = visitPlanet(state, id);
      expect(step.gained).toEqual([]);
      state = step.state;
    }
    expect(visitPlanet(state, 'about').state).toBe(state);
    const last = visitPlanet(state, 'contact');
    expect(last.gained).toEqual(['planets']);
  });

  it('counts progress', () => {
    expect(progress(unlock(emptyState, 'sound').state)).toEqual({
      done: 1,
      total: achievementIds.length,
    });
  });

  it('parses persisted state defensively', () => {
    expect(parseState(null)).toEqual(emptyState);
    expect(parseState('not json')).toEqual(emptyState);
    expect(parseState('42')).toEqual(emptyState);
    expect(parseState('null')).toEqual(emptyState);
    expect(parseState('{"unlocked":"x"}')).toEqual(emptyState);
    expect(parseState('{"unlocked":["konami","hack","konami"],"visited":["hero","mars"]}')).toEqual(
      {
        unlocked: ['konami'],
        visited: ['hero'],
      },
    );
  });
});

describe('konami', () => {
  it('matches the full sequence, case-insensitively, and resets', () => {
    const match = createKonamiMatcher();
    const keys = [...KONAMI.slice(0, -2), 'B', 'A'];
    expect(keys.map(match).at(-1)).toBe(true);
    expect(match('a')).toBe(false);
  });

  it('recovers from a repeated first key', () => {
    const match = createKonamiMatcher();
    const results = ['ArrowUp', ...KONAMI].map(match);
    expect(results.at(-1)).toBe(true);
  });

  it('ignores typing targets', () => {
    expect(isTypingTarget(document.createElement('input'))).toBe(true);
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true);
    expect(isTypingTarget(document.createElement('select'))).toBe(true);
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    expect(isTypingTarget(editable)).toBe(true);
    expect(isTypingTarget(document.createElement('button'))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });

  it('listens on window and skips fields', () => {
    let hits = 0;
    const stop = listenKonami(() => hits++);
    const press = (key: string, target: EventTarget = window) =>
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    const field = document.createElement('input');
    document.body.append(field);
    for (const key of KONAMI) press(key, field);
    expect(hits).toBe(0);
    for (const key of KONAMI) press(key);
    expect(hits).toBe(1);
    stop();
    for (const key of KONAMI) press(key);
    expect(hits).toBe(1);
  });
});

describe('terminal commands', () => {
  const ctx = (over: Partial<CommandContext> = {}): CommandContext => ({
    t: useTranslations('en'),
    home: '/en/',
    projects: [
      { title: 'Alpha', href: '/en/projects/alpha/' },
      { title: 'Beta', href: '/en/projects/beta/' },
    ],
    soundOn: false,
    section: 'hero',
    found: [],
    journal: '/en/journal/',
    ...over,
  });

  it('fills templates, blanking unknown placeholders', () => {
    expect(fill('{a}-{b}', { a: '1' })).toBe('1-');
  });

  it('knows its commands', () => {
    expect(isCommand('help')).toBe(true);
    expect(isCommand('rm')).toBe(false);
  });

  it('ignores empty input and reports unknown commands', () => {
    expect(runCommand('   ', ctx())).toEqual({ lines: [] });
    const result = runCommand('Warp 9', ctx());
    expect(result.error).toBe(true);
    expect(result.lines[0]).toContain('Warp');
  });

  it('lists every command in help, case-insensitively', () => {
    const { lines } = runCommand('HELP', ctx());
    for (const name of commandNames) expect(lines.join('\n')).toContain(name);
  });

  it('lists and opens projects', () => {
    expect(runCommand('projects', ctx()).lines).toEqual(['  1. Alpha', '  2. Beta']);
    expect(runCommand('projects 2', ctx()).action).toEqual({
      type: 'navigate',
      href: '/en/projects/beta/',
    });
    expect(runCommand('projects 9', ctx()).error).toBe(true);
    expect(runCommand('projects x', ctx()).error).toBe(true);
    expect(runCommand('projects', ctx({ projects: [] })).lines).toEqual(['No projects yet.']);
  });

  it('navigates to contact and prints about and skills', () => {
    expect(runCommand('contact', ctx()).action).toEqual({ type: 'navigate', href: '/en/#contact' });
    expect(runCommand('about', ctx()).lines[0]).toContain('Pilot file');
    expect(runCommand('skills', ctx()).lines.join(' ')).toContain('MuleSoft');
  });

  it('runs the space adventure: scan, go, inventory, hint, journal', () => {
    const onJupiter = runCommand('scan', ctx({ section: 'skills' }));
    expect(onJupiter.action).toEqual({ type: 'collect', fragment: 'skills' });
    expect(
      runCommand('scan', ctx({ section: 'skills', found: ['skills'] })).action,
    ).toBeUndefined();
    expect(runCommand('scan', ctx({ section: 'about' })).lines.at(-1)).toBe(
      'No anomaly here. Try "hint".',
    );
    expect(runCommand('go saturn', ctx()).action).toEqual({
      type: 'navigate',
      href: '/en/#projects',
    });
    expect(runCommand('go', ctx()).error).toBeFalsy();
    expect(runCommand('go pluto', ctx()).error).toBe(true);
    expect(runCommand('inventory', ctx({ found: ['hero'] })).lines[0]).toBe('Fragments: 1/6');
    expect(runCommand('hint', ctx()).lines[0]).toContain('Earth');
    const all = ['hero', 'about', 'skills', 'projects', 'passions', 'contact'] as const;
    expect(runCommand('hint', ctx({ found: all })).lines[0]).toContain('journal');
    expect(runCommand('journal', ctx()).error).toBe(true);
    expect(runCommand('journal', ctx({ found: all })).action).toEqual({
      type: 'navigate',
      href: '/en/journal/',
    });
  });

  it('returns side effects as actions', () => {
    expect(runCommand('theme', ctx()).action).toEqual({ type: 'theme' });
    expect(runCommand('sound', ctx()).lines).toEqual(['Sound on.']);
    expect(runCommand('sound', ctx({ soundOn: true })).lines).toEqual(['Sound off.']);
    expect(runCommand('lang', ctx()).action).toEqual({ type: 'lang' });
    expect(runCommand('play', ctx()).action).toEqual({ type: 'play' });
    expect(runCommand('clear', ctx()).action).toEqual({ type: 'clear' });
    expect(runCommand('exit', ctx()).action).toEqual({ type: 'exit' });
  });
});
