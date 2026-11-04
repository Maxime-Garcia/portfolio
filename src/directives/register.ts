import type { AstroIntegration } from 'astro';

/** Registers `client:intent` (see ./intent.ts). */
export function intentDirective(): AstroIntegration {
  return {
    name: 'orbite:client-intent',
    hooks: {
      'astro:config:setup': ({ addClientDirective }) => {
        addClientDirective({ name: 'intent', entrypoint: new URL('./intent.ts', import.meta.url) });
      },
    },
  };
}
