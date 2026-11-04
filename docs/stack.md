# Stack

Versions réellement installées (voir `package.json`). Chaque choix est motivé face aux alternatives.

## Framework et UI

| Techno         | Version                     | Rôle                                                                       | Pourquoi ce choix                                                                                                                        |
| -------------- | --------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Astro          | 7.4                         | Framework : rendu statique, islands, Content Collections, View Transitions | Zéro JS par défaut pour un site vitrine. La spec visait Astro 5 ; la 7 est la stable actuelle. Voir [ADR 0001](decisions/0001-astro.md). |
| React          | 19.3                        | UI interactive, dans les islands uniquement                                | React Three Fiber (Three.js) n'existe qu'en React. Svelte et Preact écartés pour cette raison.                                           |
| @astrojs/react | 7.1                         | Intégration React pour Astro                                               | Hydratation des islands.                                                                                                                 |
| TypeScript     | 6.0 (`~6.0.3`)              | Typage strict de tout le code                                              | TS 7 n'est pas supporté par `astro check` ni par typescript-eslint. Retour en 6.0, voir [learnings](learnings.md).                       |
| Tailwind CSS   | 4.3 via `@tailwindcss/vite` | Styles utilitaires et thème                                                | Moteur v4 branché en plugin Vite, sans PostCSS à configurer. CSS Modules jugé plus verbeux, CSS-in-JS coûte du JS à l'exécution.         |
| MDX            | `@astrojs/mdx` 8            | Fiches projets : Markdown avec composants                                  | Texte simple pour Maxime, composants Astro ou React au besoin.                                                                           |

## Contenu

| Techno                      | Version | Rôle                                                  | Statut   |
| --------------------------- | ------- | ----------------------------------------------------- | -------- |
| Content Collections         | (Astro) | Collection `projects`, validée par schéma             | À créer  |
| Zod                         | (Astro) | Schémas des fiches projets                            | À créer  |
| `@astrojs/markdown-satteri` | 0.4     | Ajouté par `astro add mdx` (rendu Markdown d'Astro 7) | Installé |

## Animations (prévu, non installé)

| Techno                            | Rôle                                       | Pourquoi ce choix                                                                             |
| --------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| GSAP + ScrollTrigger              | Séquences, timelines, animations au scroll | Timelines précises et pilotage au scroll. Motion seul est moins adapté aux séquences longues. |
| Motion                            | Micro-interactions React                   | API React native, ex-Framer Motion.                                                           |
| Lenis                             | Défilement fluide                          | Léger et indépendant du framework.                                                            |
| View Transitions (Astro)          | Changements de page                        | Intégré à Astro, aucune dépendance en plus.                                                   |
| Three.js, React Three Fiber, drei | Scène spatiale 3D                          | R3F donne Three.js sous forme de composants React.                                            |

Détail des principes : [animations](animations.md).

## Qualité

| Techno               | Version                  | Rôle                            | Pourquoi ce choix                                                                                                            |
| -------------------- | ------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ESLint               | 10                       | Lint                            | Configuration en flat config. `eslint-plugin-jsx-a11y` écarté : incompatible ESLint 10. L'accessibilité est testée par axe.  |
| typescript-eslint    | 8                        | Règles TypeScript               | Standard pour lint TS strict.                                                                                                |
| eslint-plugin-astro  | 3                        | Règles pour `.astro`            | Lint des fichiers Astro.                                                                                                     |
| Prettier             | 3                        | Formatage                       | Standard. Plugins `prettier-plugin-astro` 1.1 et `prettier-plugin-tailwindcss` 0.8 pour les `.astro` et l'ordre des classes. |
| `astro check`        | via `@astrojs/check` 0.9 | Typecheck des `.astro` et `.ts` | Seul outil qui vérifie les fichiers Astro. Script `pnpm typecheck`.                                                          |
| Vitest               | 5                        | Tests unitaires                 | Partage la configuration Vite. Pas de second outillage de transformation.                                                    |
| Playwright           | 1.64                     | Tests E2E desktop et mobile     | Vrais navigateurs. Projets `desktop` et `mobile` dans `playwright.config.ts`.                                                |
| @axe-core/playwright | 4.14                     | Accessibilité WCAG A et AA      | Contrôle automatique dans les tests E2E.                                                                                     |
| Lighthouse CI        | `@lhci/cli` 0.15         | Performance, accessibilité, SEO | Score mesuré à chaque PR (script `lhci`).                                                                                    |

## Git et automatisation

| Techno         | Version                    | Rôle                                          | Statut       |
| -------------- | -------------------------- | --------------------------------------------- | ------------ |
| Husky          | 9                          | Hooks Git (`prepare`)                         | Installé     |
| lint-staged    | 17                         | Lint et format des fichiers indexés           | Installé     |
| commitlint     | 21 (`config-conventional`) | Refuse les messages hors Conventional Commits | Installé     |
| release-please | action GitHub              | CHANGELOG, tags, releases                     | À configurer |

Détail : [git-workflow](git-workflow.md).

## Outillage et hébergement

| Techno | Version                  | Rôle                                 | Pourquoi ce choix                                                  |
| ------ | ------------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| pnpm   | 12.15 (`packageManager`) | Gestionnaire de paquets              | Installation rapide et dépendances strictes. Node 22.23.4 minimum. |
| Vercel | offre gratuite           | Hébergement, CDN, previews, rollback | Voir [ADR 0002](decisions/0002-vercel.md).                         |

## Dépendances en attente

- Lenis, GSAP, Motion, Three.js, R3F, drei : à installer avec leur ADR ou une justification dans la PR.
- Formulaire de contact (Formspree ou Netlify Forms) : à trancher.
