import { scrollToElement } from './scroller';

/** The in-page target of a link, or null when the link leaves the page. */
export function samePageHash(link: HTMLAnchorElement, location: Location): string | null {
  const url = new URL(link.href, location.href);
  if (!url.hash || url.origin !== location.origin) return null;
  const normalize = (path: string) => path.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
  return normalize(url.pathname) === normalize(location.pathname)
    ? decodeURIComponent(url.hash.slice(1))
    : null;
}

/**
 * One owner for in-page anchors (HUD, hero CTAs, skip link): scroll, update the URL,
 * and move focus to the target for keyboard and screen-reader users.
 * Runs in the capture phase, before the ClientRouter sees the click.
 */
export function initAnchors(): void {
  window.addEventListener(
    'click',
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target) return;
      const id = samePageHash(link, window.location);
      if (id === null) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      history.pushState(history.state, '', `#${id}`);
      scrollToElement(target);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    },
    { capture: true },
  );
}
