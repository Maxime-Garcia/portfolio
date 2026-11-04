# Portfolio — Maxime Garcia

<!-- TODO : bannière ou capture du site (à venir) -->

Portfolio d'un intégrateur qui joue de la guitare, dessine des jeux et explore l'espace.

<!-- TODO : remplacer OWNER par le compte GitHub du dépôt -->

[![CI](https://github.com/OWNER/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/portfolio/actions/workflows/ci.yml)
[![Licence : All rights reserved](https://img.shields.io/badge/licence-All%20rights%20reserved-red)](#licence)

**Stack** : Astro 7 · React 19 · TypeScript strict · Tailwind CSS 4 · MDX · Vitest · Playwright · Vercel

Site en ligne : TODO (URL de production)

## Commandes

Prérequis : Node 22.23.4 ou plus, pnpm via `corepack enable`.

| Commande         | Rôle                                     |
| ---------------- | ---------------------------------------- |
| `pnpm install`   | Installe les dépendances                 |
| `pnpm dev`       | Serveur de dev sur http://localhost:4321 |
| `pnpm build`     | Build statique dans `dist/`              |
| `pnpm test`      | Tests unitaires (Vitest)                 |
| `pnpm test:e2e`  | Tests E2E et accessibilité (Playwright)  |
| `pnpm lint`      | ESLint                                   |
| `pnpm typecheck` | `astro check` (TypeScript strict)        |

## Documentation

La documentation technique est dans [`docs/`](docs/) : architecture, stack, workflow avec Claude Code, animations, Git, déploiement et [décisions d'architecture](docs/decisions/README.md).

## Licence

© Maxime Garcia. Tous droits réservés. Ce dépôt n'est pas sous licence libre.
