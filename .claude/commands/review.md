---
description: Vérification qualité, accessibilité, performance et documentation avant ship
---
Vérifie la branche courante avant le ship.

1. **qa-tester** : `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` ; captures desktop et mobile via Playwright MCP ; axe et navigation clavier.
2. **perf-seo-auditor** : `pnpm build` puis `pnpm lhci` (objectif 95 sur les quatre scores), poids des pages, métadonnées, sitemap.
3. **doc-keeper** : docs/, ADR et `learnings.md` à jour avec les changements de la branche.
4. Corrige chaque problème remonté, puis relance la vérification concernée jusqu'au vert.
5. Rends un rapport de 10 lignes maximum, puis enchaîne sur `/ship`.
