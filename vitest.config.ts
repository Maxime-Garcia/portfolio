/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Game logic must stay fully covered (milestone 5).
      include: [
        'src/lib/achievements.ts',
        'src/components/terminal/commands.ts',
        'src/scripts/konami.ts',
      ],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
