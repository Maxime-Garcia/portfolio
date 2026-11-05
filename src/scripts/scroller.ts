/**
 * Scrolls to an element; Lenis registers itself here once loaded, native scrolling otherwise.
 * Both honour the CSS `scroll-padding-top` that keeps sections clear of the fixed HUD.
 */
export type Scroller = (target: HTMLElement) => void;

let current: Scroller | undefined;

export function setScroller(scroller: Scroller | undefined): void {
  current = scroller;
}

export function scrollToElement(target: HTMLElement): void {
  if (current) {
    current(target);
    return;
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
}
