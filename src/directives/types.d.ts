import 'astro';

declare module 'astro' {
  interface AstroClientDirectives {
    /** Hydrate on first user intent or on `orbite:ignite`. */
    'client:intent'?: boolean;
  }
}
