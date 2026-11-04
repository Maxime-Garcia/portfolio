# CLAUDE.md — Portfolio Maxime Garcia

Spécification complète : [PROJECT.md](PROJECT.md). La lire avant toute fonctionnalité nouvelle.

## Règles

- Toujours consulter Context7 avant d'utiliser une API de librairie.
- TypeScript strict, composants petits et typés.
- Zéro JavaScript par défaut ; islands React uniquement quand c'est utile.
- Toute animation doit avoir une version réduite (`prefers-reduced-motion`).
- Pas de dépendance nouvelle sans justification (ADR dans `docs/decisions/` si elle est structurante).
- Chaque fonctionnalité passe par `/plan` puis `/review`.
- Git : GitHub Flow strict, branches `type/description-courte`, Conventional Commits en anglais, squash merge, jamais de push direct sur `main`.

## Commandes

| Commande         | Rôle                              |
| ---------------- | --------------------------------- |
| `pnpm dev`       | Serveur de dev (port 4321)        |
| `pnpm build`     | Build statique dans `dist/`       |
| `pnpm lint`      | ESLint + Prettier (check)         |
| `pnpm typecheck` | `astro check` (TypeScript strict) |
| `pnpm test`      | Vitest (unitaires)                |
| `pnpm test:e2e`  | Playwright (E2E)                  |

## Agents (`.claude/agents/`)

| Agent            | Modèle | Rôle                                          |
| ---------------- | ------ | --------------------------------------------- |
| architect        | opus   | Plans, découpage, décisions d'architecture    |
| ui-designer      | sonnet | Design system, composants, mise en page       |
| motion-engineer  | sonnet | GSAP, Motion, Lenis, View Transitions         |
| 3d-engineer      | sonnet | Three.js / React Three Fiber, shaders         |
| sound-designer   | sonnet | Web Audio API, visuels réactifs au son        |
| content-writer   | sonnet | Textes FR/EN, fiches projets MDX, SEO         |
| qa-tester        | sonnet | Vitest, Playwright, accessibilité             |
| perf-seo-auditor | haiku  | Lighthouse, poids, métadonnées                |
| devops           | haiku  | CI GitHub Actions, déploiement, domaine       |
| git-keeper       | haiku  | Branches, commits atomiques, PR               |
| doc-keeper       | haiku  | README, `docs/`, ADR, `learnings.md`          |

Session principale en sonnet ; opus (ou `opusplan`) uniquement pour `/plan`.

## Workflow

`/plan` → `/build` → `/review` → `/ship`. Boucle : design → code → accessibilité → performance.
