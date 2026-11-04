import type { ClientDirective } from 'astro';

/**
 * client:event="name" — hydrates the island the first time `name` is dispatched on window.
 * Used for on-demand UI (the terminal): zero JavaScript until it is asked for.
 */
const eventDirective: ClientDirective = (load, opts) => {
  const name = String(opts.value);
  const handler = async () => {
    window.removeEventListener(name, handler);
    const hydrate = await load();
    await hydrate();
  };
  window.addEventListener(name, handler);
};

export default eventDirective;
