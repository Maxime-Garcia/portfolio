# Workflow Git

Objectif : un historique propre, linéaire, où chaque commit a un sens.

## Branches : GitHub Flow strict

- `main` est toujours déployable. Aucun push direct. Merge uniquement par Pull Request, CI au vert.
- Une branche par sujet, courte (quelques jours au maximum), supprimée après le merge.
- Nommage `type/description-courte`, en minuscules et avec des tirets :

```
feat/hero-animation
fix/menu-mobile
docs/adr-astro
chore/deps
refactor/cards
```

## Commits : Conventional Commits

Format : `type(scope): description`, en anglais, à l'impératif.

```
feat(hero): add GSAP entrance timeline
```

| Type       | Usage                                           |
| ---------- | ----------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité visible                 |
| `fix`      | Correction de bug                               |
| `docs`     | Documentation seule                             |
| `style`    | Formatage, sans changement de logique           |
| `refactor` | Restructuration sans changement de comportement |
| `perf`     | Gain de performance                             |
| `test`     | Tests                                           |
| `build`    | Build, dépendances, bundler                     |
| `ci`       | Pipelines GitHub Actions                        |
| `chore`    | Maintenance, configuration                      |

Règles :

- Commits atomiques : un changement logique par commit.
- Jamais de « wip » ni de « fix stuff » sur `main`.
- Commits signés (clé SSH ou GPG) pour le badge « Verified » sur GitHub.

## Garde-fous automatiques

- **Husky** lance lint-staged avant chaque commit : ESLint et Prettier sur les fichiers indexés.
- **commitlint** (config conventionnelle) refuse tout message hors convention.
- **Protection de `main`** (réglage GitHub, à configurer) : PR obligatoire, CI verte, historique linéaire, conversations résolues.

## Pull Requests

- Modèle : `.github/pull_request_template.md`. Sections : quoi, pourquoi, captures, checklist tests et accessibilité.
- **Merge en squash** : une PR donne un commit sur `main`. GitHub reprend le titre de la PR comme message du commit. Le titre de la PR doit donc être un Conventional Commit valide.
- **Auto-merge** : activé par `/ship` avec le compte `gh` de Maxime (`gh pr merge --auto --squash`). Pas depuis la CI : un merge fait avec `GITHUB_TOKEN` ne déclencherait pas le workflow Deploy.

## Versions : release-please

- release-please lit les commits de `main` et ouvre une PR de release.
- Versionnage sémantique : `feat` monte la version mineure, `fix` la version de correctif (patch), `BREAKING CHANGE` la majeure.
- Génère `CHANGELOG.md`, les tags et les releases GitHub. Le fichier CHANGELOG n'est pas formaté par Prettier.

Configuration : `.github/workflows/release-please.yml`, `release-please-config.json`, `.release-please-manifest.json`.

Piège : une PR ouverte avec `GITHUB_TOKEN` ne déclenche pas la CI. Ajouter un secret `RELEASE_PLEASE_TOKEN` (jeton personnel à portée fine : contents + pull requests en écriture) pour que la PR de release passe la CI et puisse être mergée.

Voir aussi : [deployment](deployment.md).
