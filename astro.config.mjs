// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { intentDirective } from './src/directives/register.ts';

// https://astro.build/config
export default defineConfig({
  // TODO(maxime): replace with the custom domain once it is bought.
  site: 'https://portfolio-umber-five-g3sqam9gtt.vercel.app',

  integrations: [react(), mdx(), intentDirective()],

  // FR lives at the root, EN under /en/. No redirect, no browser-language detection.
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: { prefixDefaultLocale: false },
  },

  // Self-hosted variable fonts, latin subset, with computed fallbacks.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Unbounded',
      cssVariable: '--font-unbounded',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Atkinson Hyperlegible Next',
      cssVariable: '--font-atkinson',
      weights: ['200 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
