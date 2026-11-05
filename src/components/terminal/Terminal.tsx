import { useStore } from '@nanostores/react';
import { navigate } from 'astro:transitions/client';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import * as m from 'motion/react-m';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Lang } from '../../i18n/ui';
import { localizePath, otherLang, useTranslations } from '../../i18n/utils';
import { soundEnabled } from '../../stores/sound';
import { unlock } from '../../stores/achievements';
import { activeSection } from '../../stores/section';
import { collectFragment, fragments } from '../../stores/fragments';
import { scrollToElement } from '../../scripts/scroller';
import { runCommand } from './commands';
import { GAME_EVENT, TERMINAL_EVENT } from '../../scripts/shortcuts';

interface Line {
  id: number;
  kind: 'in' | 'out' | 'err';
  text: string;
}

interface TerminalProps {
  lang: Lang;
  projects: { title: string; href: string }[];
}

/** Flight terminal: a modal <dialog>, loaded on demand (HUD button or Ctrl/Cmd+K). */
export default function Terminal({ lang, projects }: TerminalProps) {
  const t = useTranslations(lang);
  const soundOn = useStore(soundEnabled);
  const section = useStore(activeSection);
  const found = useStore(fragments);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const [lines, setLines] = useState<Line[]>([{ id: 0, kind: 'out', text: t('term.welcome') }]);
  const [value, setValue] = useState('');

  const open = useCallback(() => {
    const element = dialog.current;
    if (!element || element.open) return;
    element.showModal();
    input.current?.focus();
    unlock('terminal');
  }, []);

  useEffect(() => {
    window.addEventListener(TERMINAL_EVENT, open);
    // The event that triggered hydration fired before this listener existed.
    if (document.documentElement.dataset.terminal === 'requested') {
      delete document.documentElement.dataset.terminal;
      open();
    }
    return () => window.removeEventListener(TERMINAL_EVENT, open);
  }, [open]);

  // Keep the latest output in view.
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [lines]);

  const push = (kind: Line['kind'], texts: string[]) =>
    setLines((current) => [
      ...current,
      ...texts.map((text) => ({ id: nextId.current++, kind, text })),
    ]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const entry = value;
    setValue('');
    push('in', [`> ${entry}`]);
    const result = runCommand(entry, {
      t,
      home: localizePath(lang, '/'),
      projects,
      soundOn,
      section,
      found,
      journal: localizePath(lang, '/journal/'),
    });
    push(result.error ? 'err' : 'out', result.lines);
    const action = result.action;
    if (!action) return;
    switch (action.type) {
      case 'navigate': {
        dialog.current?.close();
        // Same page with a hash: scroll there (Lenis or native), like the star map does.
        const url = new URL(action.href, location.href);
        const target =
          url.hash && url.pathname === location.pathname
            ? document.getElementById(url.hash.slice(1))
            : null;
        if (target) {
          history.pushState(history.state, '', url.hash);
          scrollToElement(target);
        } else {
          void navigate(action.href);
        }
        break;
      }
      case 'collect':
        collectFragment(action.fragment);
        break;
      case 'theme':
        document.querySelector<HTMLButtonElement>('[data-theme-toggle]')?.click();
        break;
      case 'sound':
        soundEnabled.set(!soundEnabled.get());
        break;
      case 'lang':
        unlock('lang');
        dialog.current?.close();
        void navigate(localizePath(otherLang(lang), location.pathname));
        break;
      case 'play':
        dialog.current?.close();
        window.dispatchEvent(new Event(GAME_EVENT));
        break;
      case 'clear':
        setLines([]);
        break;
      case 'exit':
        dialog.current?.close();
        break;
    }
  };

  return (
    <dialog
      ref={dialog}
      // Lenis must not hijack the wheel: the log scrolls, not the page behind.
      data-lenis-prevent
      aria-labelledby="terminal-title"
      className="m-auto w-[min(42rem,calc(100vw-2rem))] rounded-xl border border-line bg-bg p-0 text-ink shadow-2xl backdrop:bg-bg/70 backdrop:backdrop-blur-sm"
    >
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict>
          <div className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-sm">
            <h2 id="terminal-title" className="text-signal">
              {t('term.title')}
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded px-2 py-0.5 text-muted hover:text-ink"
            >
              <span aria-hidden="true">esc</span>
              <span className="sr-only">{t('term.close')}</span>
            </button>
          </div>
          <div
            ref={log}
            tabIndex={0}
            className="h-72 overflow-y-auto px-4 py-3 font-mono text-sm"
            role="log"
            aria-live="polite"
          >
            {lines.map((line) => (
              <m.p
                key={line.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className={`whitespace-pre-wrap ${line.kind === 'in' ? 'text-amp' : line.kind === 'err' ? 'text-plasma' : 'text-ink'}`}
              >
                {line.text}
              </m.p>
            ))}
          </div>
          <form
            onSubmit={submit}
            className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-sm"
          >
            <span aria-hidden="true" className="text-signal">
              ›
            </span>
            <label htmlFor="terminal-input" className="sr-only">
              {t('term.input')}
            </label>
            <input
              id="terminal-input"
              ref={input}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-ink outline-none"
            />
          </form>
        </LazyMotion>
      </MotionConfig>
    </dialog>
  );
}
