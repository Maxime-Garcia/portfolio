import type { AstroIntegration } from 'astro';

/** Registers `client:intent` (./intent.ts) and `client:event` (./event.ts). */
export function intentDirective(): AstroIntegration {
  return {
    name: 'orbite:client-intent',
    hooks: {
      'astro:config:setup': ({ addClientDirective }) => {
        addClientDirective({ name: 'intent', entrypoint: new URL('./intent.ts', import.meta.url) });
        addClientDirective({ name: 'event', entrypoint: new URL('./event.ts', import.meta.url) });
      },
    },
  };
}
