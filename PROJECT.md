# Portfolio Maxime Garcia — Spécification projet

> **⚠️ ATTENTION : avant de démarrer, Maxime doit faire ces étapes (une seule fois)**
>
> 1. Installer **Docker Desktop** et le lancer.
> 2. Dans VS Code, installer les extensions **Claude Code** et **Dev Containers**.
> 3. Dans les paramètres de VS Code, rechercher « Claude Code », puis **autoriser** le mode sans permission (bypass permissions). Ne pas le choisir comme mode par défaut global : le conteneur l'active tout seul, et seulement à l'intérieur du conteneur.
> 4. Ouvrir dans VS Code le dossier qui contient ce fichier (de préférence un dossier qui ne contient rien d'autre). Le nom du dossier et du fichier n'a pas d'importance : Claude renomme le fichier en `PROJECT.md` à l'étape 0.
> 5. Dire à Claude : « Lis la spécification et suis les instructions ».
> 6. Quand VS Code le propose, cliquer sur **« Rouvrir dans le conteneur »**, puis dire à Claude « Lis PROJECT.md et suis les instructions ».
> 7. Quand Claude le demande, taper soi-même dans le chat les deux commandes d'installation des skills : `/plugin marketplace add anthropics/skills`, puis `/plugin install example-skills@anthropic-agent-skills`. Ce sont des commandes réservées à l'utilisateur : Claude ne peut pas les lancer.
> 8. Se connecter à GitHub quand Claude le demande (`gh auth login`).
> 9. Créer un compte **Vercel** ou **Cloudflare Pages**, le relier au dépôt GitHub, puis ajouter le jeton de déploiement dans les secrets du dépôt (Settings > Secrets and variables > Actions).
>
> Ensuite, tout est automatique : plus rien à valider.

Ce fichier est autosuffisant : placé seul dans un dossier (Claude le renomme en `PROJECT.md`), il contient tout ce qu'il faut pour construire le site avec Claude Code. **Claude Code : lis ce fichier en entier, puis exécute la section « Instructions de démarrage pour Claude Code » à la fin.**

## 1. Vision

- **Objectif** : un site portfolio qui présente Maxime Garcia, développeur intégration chez CGI, expert MuleSoft, polyvalent en programmation, passionné de tech depuis l'enfance.
- **Personnalité** : tech + créatif. Mettre en avant la musique (guitare), les jeux vidéo et le diplôme de game designer / chef de projet multimédia.
- **Ton** : professionnel mais vivant, avec des touches ludiques inspirées du jeu vidéo (micro-interactions, easter eggs).
- **Cibles** : recruteurs, clients, communauté tech.

## 2. Pages et sections

- **Accueil (Hero)** : nom, accroche, animation d'entrée, CTA « Voir mes projets » / « Me contacter ».
- **À propos** : parcours, de la passion d'enfance à l'expertise intégration ; timeline animée.
- **Compétences** : MuleSoft, API & intégration (Azure DevOps, CI/CD, RabbitMQ, GoAnywhere, SonarQube), langages, game design.
- **Projets** : cartes filtrables, une page détail par projet (MDX).
- **Passions** : musique/guitare (lecteur audio ou vidéo), jeux vidéo.
- **Contact** : formulaire + liens LinkedIn / GitHub.
- **Bonus** : mode sombre/clair, version FR/EN, easter egg type « Konami code ».

## Direction artistique : un site qui ne ressemble à aucun autre

Exigence centrale : un visuel frais et novateur, avec des animations et une navigation singulières qui reflètent la pluralité de Maxime. Pas de template de portfolio classique.

**Univers à faire cohabiter** : l'espace, la musique, les jeux vidéo, la programmation et l'informatique en général.

**Pistes de concept (à trancher en `/plan`)**

- **Navigation spatiale** : le site est un petit système solaire ; chaque section est une planète vers laquelle on voyage, avec transitions de caméra fluides.
- **Musique vivante** : éléments visuels qui réagissent au son (Web Audio API), micro-sons optionnels sur les interactions, section guitare comme une scène.
- **Couche jeu vidéo** : HUD discret, progression « succès débloqués » quand on explore, easter eggs (Konami code).
- **Mode développeur** : un terminal caché qui permet de naviguer au clavier (`help`, `projects`, `contact`).

**Techniques et outils (éprouvés)**

- 3D temps réel : Three.js via React Three Fiber et drei, dans une island chargée à la demande.
- Shaders légers pour les fonds (étoiles, nébuleuses), GSAP pour les séquences, Motion pour les micro-interactions.
- Skill **frontend-design** obligatoire pour chaque écran, avec la consigne explicite d'éviter tout rendu générique.

**Garde-fous** : 60 fps visés, version allégée sur mobile, respect de `prefers-reduced-motion`, son désactivé par défaut, contenu lisible même sans la 3D.

## 3. Stack technique (récente et éprouvée)

- **Framework** : Astro 5 — rendu statique ultra rapide, « islands » pour l'interactivité, Content Collections pour les projets.
- **Composants interactifs** : React 19 (dans les islands uniquement).
- **Langage** : TypeScript en mode strict.
- **Styles** : Tailwind CSS v4.
- **Animations** : GSAP + ScrollTrigger (animations au scroll, timelines), Motion (ex-Framer Motion) pour les micro-interactions React, Lenis pour le défilement fluide, View Transitions API native d'Astro pour les changements de page.
- **Contenu** : MDX + Content Collections (schémas Zod).
- **Formulaire de contact** : Formspree ou Netlify Forms (pas de backend à gérer).
- **Qualité** : ESLint, Prettier, Vitest (tests unitaires), Playwright (tests E2E et visuels), Lighthouse CI.
- **Gestion de paquets** : pnpm.
- **Hébergement** : Vercel ou Cloudflare Pages — déploiement automatique à chaque push sur GitHub, HTTPS et previews par branche gratuits. Nom de domaine perso branché dessus.

## 4. Architecture du repo

```
portfolio/
├── CLAUDE.md              # règles du projet pour Claude Code
├── .claude/
│   ├── agents/            # sous-agents spécialisés
│   ├── commands/          # slash commands du workflow
│   └── settings.json
├── .mcp.json              # serveurs MCP (Context7, Playwright)
├── src/
│   ├── components/        # Astro + islands React
│   ├── layouts/
│   ├── pages/
│   ├── content/projects/  # projets en MDX
│   ├── animations/        # timelines GSAP réutilisables
│   └── styles/
├── public/
├── tests/                 # Vitest + Playwright
└── .github/workflows/     # CI : lint, tests, Lighthouse
```

## 5. Écosystème IA : skills, plugins et MCP publics

Principe : **réutiliser l'existant public avant de créer quoi que ce soit à la main.**

**Skills / plugins officiels Anthropic**

- Marketplace : `/plugin marketplace add anthropics/skills`, puis `/plugin install example-skills@anthropic-agent-skills`.
- **frontend-design** : pousse Claude vers des choix esthétiques audacieux, évite le rendu « générique IA ». Idéal avec React + Tailwind.
- **webapp-testing** : tests du site dans un vrai navigateur via Playwright.
- **theme-factory** et **brand-guidelines** : définir une identité visuelle cohérente (couleurs, typos).
- **skill-creator** : seulement si un besoin vraiment spécifique apparaît plus tard.

**Serveurs MCP**

- **Context7** : documentation à jour d'Astro, GSAP, Tailwind… évite le code obsolète.
- **Playwright MCP** : Claude ouvre le site, prend des captures et vérifie le rendu lui-même.
- **GitHub MCP** : issues, PR, suivi du projet.
- **Vercel / Cloudflare** : suivi des déploiements depuis Claude Code.

## 6. Sous-agents (`.claude/agents/`)

- **architect** : découpe les fonctionnalités, tient le plan et `CLAUDE.md` à jour.
- **ui-designer** : maquette et design system ; s'appuie sur le skill frontend-design.
- **motion-engineer** : animations GSAP/Motion, fluidité à 60 fps, respect de `prefers-reduced-motion`.
- **content-writer** : rédige les textes FR/EN, les fiches projets et le SEO.
- **qa-tester** : tests Vitest/Playwright, accessibilité (WCAG AA), contrôle visuel via Playwright MCP.
- **perf-seo-auditor** : Lighthouse ≥ 95, images optimisées, métadonnées, sitemap.
- **devops** : CI GitHub Actions, déploiement, domaine.

Règle : chaque agent a un rôle étroit, des outils limités et rend un compte-rendu court à l'agent principal.

### Dimensionnement des agents (économie de tokens)

Règle obligatoire : chaque agent déclare dans son frontmatter un `model` adapté à sa charge, et uniquement les `tools` dont il a besoin. Le modèle le plus puissant est réservé au raisonnement complexe.

| Agent | Modèle | Pourquoi |
| --- | --- | --- |
| architect | opus | Plans, découpage, décisions d'architecture : raisonnement profond, appelé rarement |
| ui-designer | sonnet | Création de composants et design system |
| motion-engineer | sonnet | Animations complexes, code exigeant |
| content-writer | sonnet | Rédaction FR/EN et SEO de qualité |
| qa-tester | sonnet | Écriture de tests et analyse des échecs |
| perf-seo-auditor | haiku | Lancer Lighthouse et lire des rapports : tâche répétitive |
| devops | haiku | CI, déploiement, configuration simple |
| git-keeper | haiku | Messages de commit, branches, PR |
| doc-keeper | haiku | Mise à jour de doc et ADR à partir des changements |

- Session principale en **sonnet** par défaut ; passer en **opus** seulement pour les phases `/plan` (ou utiliser le mode `opusplan` de Claude Code, qui planifie avec Opus et exécute avec Sonnet).
- Un agent haiku qui bloque remonte le problème à l'agent principal au lieu d'insister.
- Contexte minimal : chaque agent ne lit que les fichiers de son périmètre et rend un résumé court.
- Suivi de la consommation avec `/cost` et `/context`, et ajustement des modèles si besoin.

**Agents créatifs ajoutés pour la direction artistique**

- **3d-engineer** (sonnet) : scène spatiale Three.js / React Three Fiber, shaders, caméras, performance GPU et versions allégées.
- **sound-designer** (sonnet) : Web Audio API, visuels réactifs au son, micro-sons d'interface, son coupé par défaut.

## 7. Workflow guidé (slash commands)

1. `/plan <fonctionnalité>` : l'architect produit un plan court avant tout code ; l'agent principal l'annonce en quelques lignes puis l'exécute, sans attendre de validation.
2. `/build` : implémentation par l'agent concerné, petits commits.
3. `/review` : qa-tester + perf-seo-auditor vérifient ; captures via Playwright.
4. `/ship` : merge, déploiement preview puis production.

Boucle recommandée : **design → code → accessibilité → performance**, puis on recommence pour la section suivante.

## Git : rigueur et conventions

Objectif : un historique propre, lisible et linéaire, où chaque commit a un sens.

**Modèle de branches (GitHub Flow strict)**

- `main` : toujours déployable, protégée. Aucun push direct, merge uniquement par Pull Request avec CI au vert.
- Branches courtes, une par sujet, nommées `type/description-courte` : `feat/hero-animation`, `fix/menu-mobile`, `docs/adr-astro`, `chore/deps`, `refactor/cards`.
- Une branche vit quelques jours maximum, puis elle est supprimée après le merge.

**Commits (Conventional Commits)**

- Format : `type(scope): description` en anglais, à l'impératif. Exemple : `feat(hero): add GSAP entrance timeline`.
- Types : feat, fix, docs, style, refactor, perf, test, build, ci, chore.
- Commits atomiques : un changement logique par commit, jamais de « wip » ni de « fix stuff » sur `main`.
- Commits signés (clé SSH ou GPG), badge « Verified » sur GitHub.

**Garde-fous automatiques**

- Husky + lint-staged : lint et formatage avant chaque commit.
- commitlint : refuse tout message qui ne respecte pas la convention.
- Protection de `main` : PR obligatoire, CI verte, historique linéaire, conversations résolues.
- Merge en **squash** : une PR = un commit propre sur `main`.

**Pull Requests et versions**

- Modèle de PR (`.github/pull_request_template.md`) : quoi, pourquoi, captures, checklist tests/accessibilité.
- Versionnage sémantique (SemVer) géré par release-please : `CHANGELOG.md`, tags et releases GitHub générés automatiquement à partir des commits.
- Fichiers de base : `.gitignore`, `.gitattributes`, `.editorconfig`.

**Agent git-keeper** (dans `.claude/agents/`) : prépare les branches, découpe les changements en commits atomiques, rédige les messages et les descriptions de PR, et refuse tout ce qui sort des conventions.

## Documentation

Objectif : un README court et soigné, plus une documentation technique de fond qui sert d'outil de veille à Maxime.

**README.md (sommaire mais beau)**

- Bannière ou capture du site, une phrase d'accroche, badges (build, déploiement, Lighthouse, licence).
- Stack en une ligne d'icônes, commandes essentielles (`pnpm dev`, `pnpm build`, `pnpm test`), lien vers le site et vers `docs/`.

**Dossier `docs/` (documentation conceptuelle et technique)**

- `architecture.md` : vue d'ensemble, rendu statique et islands, flux de contenu, schéma Mermaid.
- `stack.md` : chaque techno, son rôle dans le projet et pourquoi elle a été choisie face aux alternatives.
- `ai-workflow.md` : comment le projet a été construit avec Claude Code — agents, skills publics, serveurs MCP, slash commands et ce que chacun a apporté.
- `animations.md` : principes GSAP / Motion / Lenis utilisés, performances, accessibilité.
- `git-workflow.md` : branches, commits, PR, releases.
- `deployment.md` : CI/CD, hébergement, domaine.
- `decisions/` : ADR (Architecture Decision Records) numérotés, un par choix important, au format contexte → décision → conséquences.
- `learnings.md` : journal de veille — ce que Maxime a appris, les pièges rencontrés, les liens utiles.

**Agent doc-keeper** (dans `.claude/agents/`) : à chaque PR, met à jour la doc concernée, ajoute un ADR si une décision technique a été prise et complète `learnings.md`. La doc est vérifiée dans `/review` comme le code.

## 8. Règles pour CLAUDE.md

- Toujours consulter Context7 avant d'utiliser une API de librairie.
- TypeScript strict, composants petits et typés.
- Zéro JavaScript par défaut ; islands React uniquement quand c'est utile.
- Toute animation doit avoir une version réduite (`prefers-reduced-motion`).
- Pas de dépendance nouvelle sans justification.
- Chaque fonctionnalité passe par `/plan` puis `/review`.

## 9. Feuille de route

1. **Setup** : création du projet Astro, Tailwind, Git, CI, déploiement à vide en ligne.
2. **Identité** : couleurs, typos, logo (theme-factory + frontend-design).
3. **Sections** : Hero → À propos → Compétences → Projets → Passions → Contact.
4. **Animations** : transitions de pages, scroll, micro-interactions.
5. **Contenu** : textes définitifs, projets, version anglaise.
6. **Finitions** : audit Lighthouse, accessibilité, nom de domaine, mise en ligne.

## 10. Informations à fournir par Maxime

- Liste des projets à présenter (titre, description, technos, liens, visuels).
- Photo, liens LinkedIn / GitHub, éventuels morceaux de guitare ou vidéos.
- Ambiance visuelle souhaitée et sites qu'il aime.
- Nom de domaine souhaité.

## Kit de démarrage : fichiers à copier dans le projet

Claude Code crée lui-même ces fichiers dans `.claude/agents/`, à l'identique, lors de l'étape 1 des instructions de démarrage. Rien à copier à la main.

### Partie 1 : agents de pilotage et de création

`.claude/agents/architect.md`

```markdown
---
name: architect
description: Planifie chaque fonctionnalité avant tout code. À utiliser pour /plan et toute décision d'architecture.
tools: Read, Grep, Glob, WebFetch
model: opus
---
Tu es l'architecte du portfolio de Maxime Garcia.
- Lis PROJECT.md et CLAUDE.md avant toute réponse.
- Produis un plan court : objectif, fichiers touchés, étapes, agents à mobiliser, risques.
- Ne code jamais : rends le plan à l'agent principal, qui l'exécute sans attendre de validation.
- Toute décision technique importante donne lieu à un ADR proposé au doc-keeper.
- Consulte Context7 pour vérifier les API des librairies.
```

`.claude/agents/ui-designer.md`

```markdown
---
name: ui-designer
description: Design system, composants Astro/React et mise en page. À utiliser pour tout écran ou composant visuel.
tools: Read, Write, Edit, Glob, Grep
model: sonnet
---
Tu crées l'interface du portfolio.
- Utilise toujours le skill frontend-design ; refuse tout rendu générique de portfolio.
- Univers : espace, musique, jeux vidéo, programmation.
- Tailwind v4, composants petits et typés, zéro JS par défaut.
- Accessibilité WCAG AA : contrastes, focus visibles, navigation clavier.
```

`.claude/agents/motion-engineer.md`

```markdown
---
name: motion-engineer
description: Animations GSAP, Motion, Lenis et View Transitions. À utiliser pour toute animation 2D ou transition.
tools: Read, Write, Edit, Glob, Grep
model: sonnet
---
Tu conçois des animations singulières et fluides.
- Vise 60 fps : anime transform et opacity uniquement.
- Timelines GSAP réutilisables dans src/animations/.
- Chaque animation a une variante prefers-reduced-motion.
- Nettoie toujours les animations (kill, revert) au démontage.
```

`.claude/agents/3d-engineer.md`

```markdown
---
name: 3d-engineer
description: Scène spatiale Three.js / React Three Fiber et shaders. À utiliser pour toute 3D ou navigation planétaire.
tools: Read, Write, Edit, Glob, Grep
model: sonnet
---
Tu construis la navigation spatiale du site.
- React Three Fiber + drei, island Astro chargée en client:visible.
- Budget : moins de 100 draw calls, textures compressées, DPR limité à 2.
- Version allégée mobile et repli 2D si WebGL indisponible.
- Le contenu reste accessible sans la 3D.
```

`.claude/agents/sound-designer.md`

```markdown
---
name: sound-designer
description: Son et visuels réactifs à la musique via Web Audio API. À utiliser pour tout élément sonore.
tools: Read, Write, Edit, Glob
model: sonnet
---
Tu apportes la dimension musicale du site.
- Son coupé par défaut, activation explicite par l'utilisateur.
- Web Audio API (AnalyserNode) pour les visuels réactifs.
- Fichiers audio légers (Opus/AAC), chargés à la demande.
- Respecte prefers-reduced-motion pour les visuels associés.
```

### Partie 2 : agents de contenu, qualité et opérations

`.claude/agents/content-writer.md`

```markdown
---
name: content-writer
description: Textes FR/EN, fiches projets MDX et SEO. À utiliser pour tout contenu rédactionnel.
tools: Read, Write, Edit, Glob
model: sonnet
---
Tu écris la voix de Maxime : professionnel, vivant, une pointe ludique.
- Phrases courtes, concrètes, sans jargon creux.
- Met en avant : passion tech depuis l'enfance, expertise MuleSoft, polyvalence, game design, musique, espace.
- Fiches projets en MDX conformes au schéma Zod.
- Ne jamais inventer de fait : laisser un TODO si une info manque.
```

`.claude/agents/qa-tester.md`

```markdown
---
name: qa-tester
description: Tests Vitest et Playwright, accessibilité et contrôle visuel. À utiliser dans /review.
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---
Tu garantis la qualité.
- Écris et lance les tests unitaires (Vitest) et E2E (Playwright).
- Vérifie le rendu avec Playwright MCP : captures desktop et mobile.
- Contrôle l'accessibilité (axe) et la navigation clavier.
- Rends un rapport court : OK, ou liste précise des problèmes.
```

`.claude/agents/perf-seo-auditor.md`

```markdown
---
name: perf-seo-auditor
description: Audit Lighthouse, poids des pages, images et métadonnées SEO.
tools: Read, Bash, Glob, Grep
model: haiku
---
Tu audites, tu ne refactores pas.
- Lance Lighthouse : objectif 95 minimum sur les quatre scores.
- Signale images non optimisées, JS inutile, métadonnées ou sitemap manquants.
- Rapport en 10 lignes maximum, problèmes classés par impact.
- Si un correctif dépasse la simple configuration, remonte-le à l'agent principal.
```

`.claude/agents/devops.md`

```markdown
---
name: devops
description: CI GitHub Actions, déploiement Vercel ou Cloudflare Pages, domaine.
tools: Read, Write, Edit, Bash
model: haiku
---
Tu gères l'intégration et le déploiement.
- Workflow CI : install, lint, typecheck, tests, build, Lighthouse CI.
- Previews par branche, production sur main uniquement.
- Aucun secret en clair : variables d'environnement seulement.
```

`.claude/agents/git-keeper.md`

```markdown
---
name: git-keeper
description: Branches, commits atomiques, messages et PR. À utiliser avant chaque commit ou PR.
tools: Read, Bash, Glob
model: haiku
---
Tu es le gardien de l'historique Git.
- Branches type/description-courte depuis main à jour.
- Commits atomiques au format Conventional Commits, en anglais, à l'impératif.
- Jamais de push sur main, jamais de force push sur une branche partagée.
- Rédige la PR avec le modèle : quoi, pourquoi, captures, checklist.
- Refuse et explique tout ce qui sort des conventions.
```

`.claude/agents/doc-keeper.md`

```markdown
---
name: doc-keeper
description: Met à jour README, docs/ et les ADR. À utiliser à chaque PR.
tools: Read, Write, Edit, Glob
model: haiku
---
Tu tiens la documentation technique, outil de veille de Maxime.
- README court et soigné ; le détail va dans docs/.
- Met à jour stack.md, architecture.md, ai-workflow.md selon les changements.
- Ajoute un ADR numéroté pour chaque décision technique validée.
- Complète learnings.md : ce qui a été appris, pièges, liens utiles.
```

## Autonomie totale et automatisation

**Principe** : Maxime ne valide rien à la main. Aucune demande d'autorisation de commande, aucun plan à approuver. Le projet se construit, se teste, se déploie et se vérifie tout seul.

**Lancement sans commande à taper** : Claude ne peut pas s'accorder lui-même le mode sans permission, sinon ce garde-fou ne servirait à rien. Maxime fait donc un seul réglage, une seule fois : dans VS Code, Paramètres, rechercher « Claude Code », puis activer l'option qui **autorise** le contournement des permissions (bypass permissions), sans la choisir comme mode par défaut global. Le mode bypass n'est activé par défaut **que dans le conteneur** : le `postCreateCommand` du Dev Container l'écrit dans les réglages utilisateur du conteneur (`~/.claude/settings.json`). Hors conteneur, les autorisations classiques restent en place, avec l'allowlist ci-dessous pour limiter les demandes.

`.claude/settings.json` (partagé, valable dans et hors conteneur, **sans** `defaultMode`)

```json
{
  "permissions": {
    "allow": ["Bash", "Read", "Edit", "Write", "WebFetch", "WebSearch", "mcp__*"],
    "deny": [
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(git push origin main:*)",
      "Bash(git reset --hard:*)",
      "Bash(rm -rf /:*)",
      "Bash(rm -rf ~:*)",
      "Read(~/.ssh/**)",
      "Read(./.env)",
      "Read(./.env.*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "test -f package.json || exit 0; pnpm -s lint --fix && pnpm -s typecheck || exit 2" }]
      }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "test -f package.json || exit 0; pnpm -s test" }] }
    ]
  }
}
```

Les hooks ne font rien tant que `package.json` n'existe pas (étapes 0 à 3). Ensuite, un échec du lint ou du typecheck renvoie le code 2, ce qui transmet l'erreur à Claude pour qu'il la corrige. Les scripts `lint`, `typecheck` et `test` doivent exister dans `package.json` dès l'étape 4.

**Dev Container (isolation + sudo libre)**

`.devcontainer/devcontainer.json`

```json
{
  "name": "portfolio",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:22",
  "remoteUser": "node",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/anthropics/devcontainer-features/claude-code:1": {}
  },
  "postCreateCommand": "echo 'node ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/node && mkdir -p ~/.claude && echo '{\"permissions\":{\"defaultMode\":\"bypassPermissions\"}}' > ~/.claude/settings.json && corepack enable && if [ -f package.json ]; then pnpm install && pnpm exec playwright install --with-deps; fi",
  "customizations": {
    "vscode": {
      "extensions": ["anthropic.claude-code", "astro-build.astro-vscode", "bradlc.vscode-tailwindcss", "dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  },
  "forwardPorts": [4321]
}
```

Dans le conteneur, sudo marche sans mot de passe : Claude installe tout seul les paquets système dont il a besoin (`sudo apt-get install -y …`). Le conteneur est isolé de la machine de Maxime, il n'expose que le dossier du projet.

**Périmètre** : dans le conteneur, Claude a tous les droits, sudo compris. Hors conteneur, il reste strictement dans le dossier du projet et n'utilise pas sudo. Claude crée lui-même `.devcontainer/` à la première session. Ensuite, VS Code propose « Rouvrir dans le conteneur » : c'est un clic, à faire une seule fois (il faut Docker Desktop et l'extension Dev Containers). Dans le conteneur, le travail reprend en autonomie.

**Boucle autonome de Claude Code** : planifier, coder, laisser les hooks lancer le lint et les tests, corriger jusqu'au vert, committer, pousser la branche, ouvrir la PR, activer l'auto-merge, puis surveiller la CI avec `gh run watch` et corriger tout échec sans rien demander.

**Pipelines GitHub Actions**

- `ci.yml` (chaque push et PR) : install, lint, typecheck, tests Vitest, build, tests E2E Playwright, Lighthouse CI. Tout échec bloque le merge.
- `deploy.yml` (merge sur main) : build puis déploiement en production sur Vercel ou Cloudflare Pages.
- `post-deploy.yml` (après le déploiement) : smoke tests Playwright sur l'URL de production, Lighthouse sur le site en ligne, vérification des liens. En cas d'échec, retour automatique à la version précédente et ouverture d'une issue.
- Auto-merge des PR dès que la CI est verte. release-please publie les versions automatiquement.

**Actions manuelles, une seule fois** : installer Docker Desktop, autoriser le mode bypass dans les paramètres de Claude Code, cliquer sur « Rouvrir dans le conteneur », taper les deux commandes `/plugin`, se connecter à GitHub (`gh auth login`) et à l'hébergeur, puis ajouter le jeton de déploiement dans les secrets du dépôt. Ces étapes ne peuvent pas être automatisées : ce sont des connexions à tes comptes ou des réglages de sécurité que seul toi peux faire. Après ça, plus rien à faire.

## Instructions de démarrage pour Claude Code

Cette section s'adresse à toi, Claude Code. Maxime t'a seulement demandé de lire ce fichier : tout ce que tu dois faire est ici.

**Objectif de la première session** : poser des fondations propres, sans encore construire les sections du site.

**Règles de conduite**

- Travaille en autonomie totale : ne demande aucune validation, ni pour ton plan ni pour une commande. Annonce ton plan en quelques lignes, puis exécute.
- Reste strictement dans le dossier du projet.
- Travaille sur une branche `chore/bootstrap`, un commit atomique par étape, puis ouvre une PR en auto-merge.
- Une fois les agents créés, délègue : git-keeper pour chaque commit, doc-keeper pour la doc.
- Vérifie chaque commande et API de librairie avec Context7.
- Si quelque chose échoue, corrige et relance jusqu'au vert, sans t'arrêter pour demander.

**Étapes**

**Étape 0, avant tout** :

- Si ce fichier ne s'appelle pas `PROJECT.md`, renomme-le en `PROJECT.md` à la racine du dossier ouvert.
- Si le dossier n'est pas un dépôt Git, lance `git init -b main`.
- Crée `.claude/settings.json` et `.devcontainer/devcontainer.json` exactement comme dans la section « Autonomie totale et automatisation ».
- Dis ensuite à Maxime de cliquer sur « Rouvrir dans le conteneur » et de te dire « Lis PROJECT.md et suis les instructions ».

Si tu tournes déjà dans le conteneur (le fichier `/.dockerenv` existe), passe directement à l'étape 1.

1. Crée les onze agents de la section « Kit de démarrage » dans `.claude/agents/`, à l'identique (frontmatter, outils et modèle compris).
2. Écosystème IA : demande à Maxime de taper lui-même `/plugin marketplace add anthropics/skills`, puis `/plugin install example-skills@anthropic-agent-skills` (frontend-design, webapp-testing, theme-factory). Ce sont des commandes réservées à l'utilisateur, tu ne peux pas les exécuter : c'est la seule pause de la session. En attendant, ajoute les serveurs MCP Context7 et Playwright dans `.mcp.json`.
3. Crée `CLAUDE.md` à partir de la section « Règles pour CLAUDE.md », avec la table des agents et leurs modèles, et une ligne qui renvoie vers ce `PROJECT.md`.
4. Initialise le projet : Astro 5, TypeScript strict, Tailwind v4, React, MDX, pnpm. Définis tout de suite dans `package.json` les scripts `lint`, `typecheck` et `test` utilisés par les hooks, puis lance `pnpm install` et `pnpm exec playwright install --with-deps`.
5. Mets en place Git selon la section Git : protection de main, Husky, lint-staged, commitlint, release-please, modèle de PR, `.gitignore`, `.gitattributes`, `.editorconfig`.
6. Crée les slash commands `/plan`, `/build`, `/review` et `/ship` dans `.claude/commands/`.
7. Crée le README sommaire et le squelette de `docs/` (architecture, stack, ai-workflow, animations, git-workflow, deployment, decisions/, learnings). Premier ADR : le choix d'Astro.
8. Configure la CI GitHub Actions et prépare le déploiement sur Vercel ou Cloudflare Pages.
9. Termine par une page d'accueil minimale « Hello, universe » qui passe la CI.

**Étapes d'automatisation (dans la même session)**

- Vérifie que `.claude/settings.json` (créé à l'étape 0) est toujours conforme à la section « Autonomie totale et automatisation ».
- Crée les trois workflows `ci.yml`, `deploy.yml` et `post-deploy.yml`, avec l'auto-merge et le rollback.
- Pousse, puis surveille la CI et le déploiement jusqu'à ce que tout soit vert et que le site soit en ligne.

**Pour finir** : résume à Maxime ce qui a été fait, ce qu'il doit faire de son côté (compte GitHub, connexion à l'hébergeur), et propose la suite : la direction artistique avec ui-designer.
