import { gsap } from 'gsap';

/**
 * Scroll reveals. The hero entrance is pure CSS (instant, no JS on the LCP path).
 * Hidden states only exist under `html.motion`, with a CSS failsafe if this never runs.
 * Returns a cleanup function that reverts every tween.
 */
export function startTimelines(): () => void {
  const mm = gsap.matchMedia();
  let observer: IntersectionObserver | undefined;

  mm.add(
    {
      full: '(prefers-reduced-motion: no-preference)',
      reduced: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      if (reveals.length === 0) return;
      if (context.conditions?.reduced) {
        gsap.set(reveals, { opacity: 1, y: 0 });
        return;
      }

      // Already on screen (e.g. reload mid-page): show at once, no animation.
      const fold = window.innerHeight;
      const pending = reveals.filter((element) => element.getBoundingClientRect().top >= fold);
      const visible = reveals.filter((element) => !pending.includes(element));
      if (visible.length > 0) gsap.set(visible, { opacity: 1, y: 0 });
      if (pending.length > 0) gsap.set(pending, { opacity: 0, y: 32 });
      document.documentElement.classList.add('motion-ready');

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer?.unobserve(entry.target);
            context.add(() => {
              gsap.fromTo(
                entry.target,
                { y: 32, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', clearProps: 'transform' },
              );
            });
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      for (const element of pending) observer.observe(element);
      return () => observer?.disconnect();
    },
  );

  return () => {
    observer?.disconnect();
    mm.revert();
    document.documentElement.classList.remove('motion-ready');
  };
}
