import type { UiKey } from '../../i18n/ui';
import { skillGroups, skillNames } from '../../lib/skills';
import { fragmentIds, nextMissing, resolveBody, type FragmentId } from '../../lib/fragments';
import type { SectionId } from '../../i18n/ui';

export const commandNames = [
  'help',
  'projects',
  'contact',
  'about',
  'skills',
  'theme',
  'sound',
  'lang',
  'play',
  'scan',
  'go',
  'inventory',
  'hint',
  'journal',
  'clear',
  'exit',
] as const;

export type CommandName = (typeof commandNames)[number];

export type Action =
  | { type: 'navigate'; href: string }
  | { type: 'theme' }
  | { type: 'sound' }
  | { type: 'lang' }
  | { type: 'play' }
  | { type: 'collect'; fragment: FragmentId }
  | { type: 'clear' }
  | { type: 'exit' };

export interface CommandResult {
  lines: string[];
  error?: boolean;
  action?: Action;
}

export interface CommandContext {
  t: (key: UiKey) => string;
  /** Localized home path, e.g. "/" or "/en/". */
  home: string;
  projects: { title: string; href: string }[];
  soundOn: boolean;
  /** Section (= celestial body) currently in view. */
  section: SectionId;
  found: readonly FragmentId[];
  /** Localized path of the logbook page. */
  journal: string;
}

export const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');

export function isCommand(name: string): name is CommandName {
  return (commandNames as readonly string[]).includes(name);
}

/** Parses one terminal line. Pure: side effects are returned as an `action`. */
export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const [rawName = '', ...args] = input.trim().split(/\s+/);
  const name = rawName.toLowerCase();
  const { t } = ctx;
  if (name === '') return { lines: [] };
  if (!isCommand(name)) return { lines: [fill(t('term.unknown'), { cmd: rawName })], error: true };

  switch (name) {
    case 'help':
      return {
        lines: [
          t('term.help'),
          ...commandNames.map((cmd) => `  ${cmd.padEnd(9)} ${t(`term.cmd.${cmd}`)}`),
        ],
      };
    case 'projects': {
      if (ctx.projects.length === 0) return { lines: [t('term.projects.none')] };
      const [arg] = args;
      if (arg === undefined) return { lines: ctx.projects.map((p, i) => `  ${i + 1}. ${p.title}`) };
      const project = ctx.projects[Number(arg) - 1];
      if (!project) return { lines: [fill(t('term.projects.bad'), { arg })], error: true };
      return {
        lines: [fill(t('term.projects.open'), { title: project.title })],
        action: { type: 'navigate', href: project.href },
      };
    }
    case 'contact':
      return {
        lines: [t('term.contact')],
        action: { type: 'navigate', href: `${ctx.home}#contact` },
      };
    case 'about':
      return { lines: [t('about.lead')] };
    case 'skills':
      return {
        lines: skillGroups.map(
          (group) => `  ${t(group.label)} · ${skillNames(group, t).join(', ')}`,
        ),
      };
    case 'theme':
      return { lines: [t('term.theme')], action: { type: 'theme' } };
    case 'sound':
      return {
        lines: [t(ctx.soundOn ? 'term.sound.off' : 'term.sound.on')],
        action: { type: 'sound' },
      };
    case 'lang':
      return { lines: [t('term.lang')], action: { type: 'lang' } };
    case 'play':
      return { lines: [t('term.play')], action: { type: 'play' } };
    case 'scan': {
      const lines = [`${t(`body.${ctx.section}`)} · ${t(`scan.${ctx.section}`)}`];
      if (ctx.section === 'skills' && !ctx.found.includes('skills')) {
        return {
          lines: [...lines, t('scan.found')],
          action: { type: 'collect', fragment: 'skills' },
        };
      }
      return { lines: [...lines, t('scan.none')] };
    }
    case 'go': {
      const target = args[0] ? resolveBody(args[0]) : undefined;
      if (!target) return { lines: [t('term.go.usage')], error: Boolean(args[0]) };
      return {
        lines: [fill(t('term.go'), { body: t(`body.${target}`) })],
        action: { type: 'navigate', href: `${ctx.home}#${target}` },
      };
    }
    case 'inventory':
      return {
        lines: [
          fill(t('term.inventory'), { n: String(ctx.found.length) }),
          ...fragmentIds.map(
            (id) =>
              `  ${ctx.found.includes(id) ? '✦' : '·'} ${fill(t('fragment.name'), { body: t(`body.${id}`) })}`,
          ),
        ],
      };
    case 'hint': {
      const missing = nextMissing(ctx.found);
      return { lines: [t(missing ? `hint.${missing}` : 'hint.done')] };
    }
    case 'journal':
      if (ctx.found.length < fragmentIds.length) {
        return {
          lines: [fill(t('term.journal.locked'), { n: String(ctx.found.length) })],
          error: true,
        };
      }
      return { lines: [t('term.journal')], action: { type: 'navigate', href: ctx.journal } };
    case 'clear':
      return { lines: [], action: { type: 'clear' } };
    case 'exit':
      return { lines: [], action: { type: 'exit' } };
  }
}
