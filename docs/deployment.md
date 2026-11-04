# Déploiement

Hébergement sur Vercel ([ADR 0002](decisions/0002-vercel.md)). Chaque PR passe par la CI. Chaque merge sur `main` part en production.

> Fichiers : `.github/workflows/ci.yml`, `deploy.yml`, `post-deploy.yml` (workflow réutilisable appelé par `deploy.yml`, lançable aussi à la main), `release-please.yml`. Tant que les secrets Vercel manquent, `deploy.yml` passe au vert en sautant le déploiement (avertissement dans le résumé). Variable de dépôt `PRODUCTION_URL` (actuellement https://portfolio-umber-five-g3sqam9gtt.vercel.app) : URL publique vérifiée après déploiement. Indispensable : les URL propres à chaque déploiement Vercel sont protégées par authentification, les tests y verraient la page de connexion Vercel.
>
> L'intégration Git de Vercel est **déconnectée** (`vercel git disconnect`) : seuls nos workflows déploient, pour garder les vérifications et le rollback. Pour la réactiver : `vercel git connect`.

## Workflows

### `ci.yml` : PR et `main`

Déclencheur : chaque PR, et chaque push sur `main` (après merge). Une branche sans PR n'est pas vérifiée : `/ship` en ouvre toujours une. Tout échec bloque le merge.

1. Install (pnpm, cache)
2. `pnpm lint`
3. `pnpm format:check`
4. `pnpm typecheck`
5. `pnpm test` (Vitest)
6. `pnpm build`
7. Tests E2E Playwright (`pnpm test:e2e`, projets desktop et mobile, axe inclus)
8. Lighthouse CI (`pnpm lhci`)

### `deploy.yml` : déploiement

- Sur push vers `main` : build puis déploiement en production via la CLI Vercel.
- Sur PR : déploiement preview, URL commentée dans la PR.

### `post-deploy.yml` : vérification en ligne

Lancé après un déploiement de production.

1. Smoke tests Playwright avec `BASE_URL` = URL de production. `playwright.config.ts` lit cette variable et ne lance alors pas de serveur local.
2. Lighthouse sur le site en ligne.
3. Vérification des liens (outil à choisir).

En cas d'échec :

1. `vercel rollback` restaure la version précédente.
2. Une issue GitHub est ouverte avec le détail de l'échec.

## Secrets

Dans le dépôt : **Settings > Secrets and variables > Actions**.

| Secret              | Rôle                                        |
| ------------------- | ------------------------------------------- |
| `VERCEL_TOKEN`      | Jeton d'accès à la CLI Vercel               |
| `VERCEL_ORG_ID`     | Identifiant de l'équipe ou du compte Vercel |
| `VERCEL_PROJECT_ID` | Identifiant du projet Vercel                |

### Où les trouver

1. **Token** : tableau de bord Vercel, Account Settings, onglet Tokens, création d'un jeton.
2. **Org et projet** : depuis la racine du projet, `vercel link`. La commande crée `.vercel/project.json`, qui contient `orgId` et `projectId`.
3. Vérifier que `.vercel/` est ignoré par Git. Ne jamais committer ces valeurs.
4. Enregistrer les secrets, par exemple avec `gh secret set VERCEL_TOKEN`.

## Domaine

Nom de domaine personnel : TODO. Une fois choisi, le brancher sur le projet Vercel et mettre à jour `SITE` dans `src/lib/site.ts` et le README.
