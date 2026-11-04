# Workflow avec Claude Code

Le projet est construit par Claude Code, en autonomie. Principe : réutiliser l'existant public avant de créer quoi que ce soit à la main.

## Agents (`.claude/agents/`)

Chaque agent a un rôle étroit et un modèle adapté à sa charge. La session principale tourne en sonnet. Opus sert pour `/plan`.

| Agent            | Modèle | Rôle                                       |
| ---------------- | ------ | ------------------------------------------ |
| architect        | opus   | Plans, découpage, décisions d'architecture |
| ui-designer      | sonnet | Design system, composants, mise en page    |
| motion-engineer  | sonnet | GSAP, Motion, Lenis, View Transitions      |
| 3d-engineer      | sonnet | Three.js, React Three Fiber, shaders       |
| sound-designer   | sonnet | Web Audio API, visuels réactifs au son     |
| content-writer   | sonnet | Textes FR et EN, fiches projets MDX, SEO   |
| qa-tester        | sonnet | Vitest, Playwright, accessibilité          |
| perf-seo-auditor | haiku  | Lighthouse, poids, métadonnées             |
| devops           | haiku  | CI GitHub Actions, déploiement, domaine    |
| git-keeper       | haiku  | Branches, commits atomiques, PR            |
| doc-keeper       | haiku  | README, `docs/`, ADR, `learnings.md`       |

Un agent haiku bloqué remonte le problème à la session principale au lieu d'insister.

## Skills publics

Installés par Maxime, pas par Claude : ces commandes sont réservées à l'utilisateur.

Dans le terminal (l'extension VS Code n'expose pas `/plugin`, voir [learnings](learnings.md)) :

```
claude plugin marketplace add anthropics/skills
claude plugin install example-skills@anthropic-agent-skills
```

| Skill            | Usage                                               | Statut                                             |
| ---------------- | --------------------------------------------------- | -------------------------------------------------- |
| frontend-design  | Choix esthétiques audacieux, pas de rendu générique | Prévu pour chaque écran                            |
| webapp-testing   | Tests du site dans un vrai navigateur               | Prévu                                              |
| theme-factory    | Palette et typographies cohérentes                  | Prévu pour la direction artistique                 |
| brand-guidelines | Identité visuelle                                   | Prévu                                              |
| skill-creator    | Créer un skill maison                               | Non retenu, seulement si un besoin précis apparaît |

## Serveurs MCP (`.mcp.json`)

| Serveur    | Commande                     | Rôle                                                                                  |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| Context7   | `@upstash/context7-mcp`      | Documentation à jour des librairies (Astro, GSAP, Tailwind…). Évite le code obsolète. |
| Playwright | `@playwright/mcp --headless` | Ouvre le site, prend des captures, vérifie le rendu.                                  |

Prévus, pas encore branchés : GitHub (issues, PR) et Vercel ou Cloudflare (suivi des déploiements).

## Slash commands (`.claude/commands/`)

| Commande                 | Rôle                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `/plan <fonctionnalité>` | L'architect produit un plan court. Il est annoncé puis exécuté sans validation.                      |
| `/build`                 | Implémentation par l'agent concerné, en petits commits.                                              |
| `/review`                | qa-tester et perf-seo-auditor vérifient. Captures via Playwright. La doc est vérifiée comme le code. |
| `/ship`                  | Merge, déploiement preview, puis production.                                                         |

Boucle recommandée : design, code, accessibilité, performance.

## Hooks (`.claude/settings.json`)

- **PostToolUse** sur `Edit|Write` : `pnpm lint --fix` puis `pnpm typecheck`. Un échec renvoie le code 2 : l'erreur est transmise à Claude pour correction.
- **Stop** : `pnpm test`. La session ne s'arrête qu'au vert.
- Les hooks ne font rien tant que `package.json` n'existe pas.

## Permissions

- `.claude/settings.json` (partagé) : autorise les outils courants et les MCP. Refuse les `git push --force`, les `git push origin main`, les `git reset --hard`, la lecture de `.env` et des clés SSH.
- **Mode bypass** : `postCreateCommand` du Dev Container écrit `defaultMode: bypassPermissions` dans `~/.claude/settings.json` du conteneur seulement. Hors conteneur, les autorisations classiques restent actives.
- Le conteneur est isolé de la machine et n'expose que le dossier du projet.

## Ce qui a déjà servi

- La spec `PROJECT.md` pilote l'ensemble. Elle est lue en entier avant chaque étape.
- Context7 a servi à vérifier les API avant usage. Les versions installées ne sont pas toujours celles de la spec (voir [ADR 0001](decisions/0001-astro.md)).
- Les pièges de l'environnement sont consignés dans [learnings](learnings.md).
