# Feuille de route : site complet « Orbite »

Plan produit par l'agent **architect** le 2026-11-04 (`/plan`). C'est la référence pour construire le site après le bootstrap. Une session Claude Code qui reprend le projet lit ce fichier, puis exécute les jalons dans l'ordre, en autonomie complète.

## Pour reprendre (nouvelle session)

> Lis PROJECT.md, CLAUDE.md et docs/roadmap.md, puis exécute la feuille de route en autonomie complète, jalon par jalon.

Pour chaque jalon : `/build`, puis `/review`, puis `/ship`. Une branche, une PR squash en auto-merge, CI verte. Cocher le jalon ci-dessous dans la PR qui le livre. Ne jamais inventer de fait sur Maxime : marquer `TODO(maxime)`.

## État au 2026-11-04

- [x] Bootstrap : Astro 7, outillage, CI/CD, docs, page « Hello, universe » en production.
- [x] Jalon 1 `feat/design-system-i18n`
- [x] Jalon 2 `feat/content-sections` (livré en deux PR : sections, puis `feat/projects-collection`)
- [ ] Jalon 3 `feat/motion-scroll`
- [ ] Jalon 4 `feat/space-scene`
- [ ] Jalon 5 `feat/game-layer`
- [ ] Jalon 6 `feat/sound`
- [ ] Jalon 7 `feat/seo-polish`

Infra en place : dépôt public `Maxime-Garcia/portfolio` (main protégée : PR, check `ci`, historique linéaire) ; Vercel, projet `nova-eddf/portfolio`, intégration Git déconnectée, seuls nos workflows déploient ; production https://portfolio-umber-five-g3sqam9gtt.vercel.app (variable `PRODUCTION_URL`) ; secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Concept retenu : « Orbite »

1. Une page longue et sémantique par langue (`/` = FR, `/en/` = EN). Chaque section est une planète. En fond, une caméra 3D se dirige vers la planète de la section visible (IntersectionObserver et lissage léger lié au scroll).
2. Les pages détail des projets sont de vraies routes (`/projects/[id]`), avec ClientRouter et un canvas conservé par `transition:persist`.
3. Sans 3D (pas de WebGL, mobile faible, `saveData`, avant le chargement) : fond CSS/SVG (étoiles, nébuleuse). Le contenu est identique et entièrement lisible, ce qui est bon pour le SEO.
4. Avec `prefers-reduced-motion` : la caméra saute au lieu de voyager, rendu en `frameloop="demand"`, pas de dérive des étoiles. Lenis se désactive tout seul.
5. HUD en guise de carte stellaire : ancres vers les 6 planètes, progression des succès, boutons son, thème et langue.

### Direction visuelle (point de départ, à trancher par ui-designer avec le skill frontend-design)

- **Thème sombre :** vide `#05060f`, surfaces indigo `#0d1030`, texte `#e8ecff`. Accents : plasma `#ff4fd8`, signal cyan `#5ef2ff`, ampli ambre `#ffb347`.
- **Thème clair, « carte astronomique » :** fond crème `#f6f1e7`, encre `#14163a`, accents assombris jusqu'au contraste AA.
- **Typographies :** Unbounded (titres), Atkinson Hyperlegible Next (texte), JetBrains Mono (HUD et terminal). Polices variables, sous-ensemble latin, préchargement des titres seulement.
- **Chargement des polices :** API Fonts d'Astro (fournisseur fontsource). Auto-hébergement et polices de repli calculées, sans dépendance npm.

### i18n

`locales: ['fr','en']`, `defaultLocale: 'fr'`, `prefixDefaultLocale: false`, pour éviter une redirection à la racine. Balises hreflang avec x-default. Textes d'interface dans `src/i18n/ui.ts`, typés pour garantir la parité FR/EN. Pas de redirection automatique selon la langue du navigateur.

### État partagé entre islands

`nanostores` et `@nanostores/react` : stores `achievements`, `sound`, `activeSection` et `quality`, conservés dans localStorage. Le thème est géré à part : un script en ligne dans `<head>` l'applique avant l'affichage, puis à nouveau sur `astro:after-swap`.

## Fichiers clés

```
astro.config.mjs        i18n, fonts, site, client directive "intent", sitemap
src/content.config.ts   projects (glob {fr,en}/*.mdx), timeline (file yaml)
src/content/projects/{fr,en}/exemple-*.mdx   placeholder: true
src/i18n/{ui.ts,utils.ts}   src/lib/{site.ts,skills.ts}
src/stores/{achievements,sound,section,quality}.ts
src/layouts/BaseLayout.astro (lang, hreflang, thème, ClientRouter)
src/components/sections/{Hero,About,Timeline,Skills,Projects,Passions,Contact}.astro
src/components/hud/{Hud.astro,Toasts.tsx}   src/components/terminal/{Terminal.tsx,commands.ts}
src/components/space/{SpaceScene.tsx,Planet.tsx,Starfield.tsx,shaders/}  src/directives/intent.ts
src/animations/{timeline.ts,lenis.ts}   src/audio/{engine.ts,blips.ts,analyser.ts}
src/scripts/{theme.ts,konami.ts,filters.ts,contact.ts}
src/pages/{index,404}.astro, projects/[id].astro, en/index.astro, en/projects/[id].astro
tests/unit/*.test.ts  tests/e2e/{home,i18n,projects,a11y,game}.spec.ts  scripts/check-budget.mjs
```

## Jalons

### 1. `feat/design-system-i18n`

- **Agents :** ui-designer, content-writer, doc-keeper.
- **Dépendances :** aucune.
- **Contenu :**
  - Jetons de couleur dans `@theme`, thèmes sombre et clair (`@custom-variant` avec `data-theme`), polices.
  - Routage i18n, sélecteur de langue, `site` défini dans `astro.config.mjs`.
  - HUD statique, lien d'accès direct au contenu, squelette des 6 sections (titres uniquement).
- **Terminé quand :**
  - axe ne relève aucune violation, en thème sombre comme en thème clair ;
  - Lighthouse ≥ 95 sur `/` et `/en/` ;
  - `html lang` est correct ;
  - `home.spec` est mis à jour.

### 2. `feat/content-sections`

- **Agents :** content-writer, ui-designer, qa-tester.
- **Dépendances :** aucune.
- **Contenu :**
  - **Hero** et **À propos**, avec une timeline en YAML.
  - **Compétences :** MuleSoft, Azure DevOps, CI/CD, RabbitMQ, GoAnywhere, SonarQube, game design.
  - **Collection projects :**
    - schéma Zod avec `placeholder`, `tags` en enum, `stack`, `year`, `links` ;
    - 3 projets d'exemple, avec un badge « Exemple » ;
    - filtres en JavaScript simple, avec `aria-pressed` et un compteur `aria-live`. Sans JavaScript, tous les projets restent affichés.
    - pages détail en MDX.
  - **Passions :** lecteur `<audio>` natif, morceaux en TODO.
  - **Contact :**
    - formulaire Formspree en HTML (POST natif, enrichi en fetch JSON), champ piège `_gotcha` et variable `PUBLIC_FORMSPREE_ID` ;
    - sans identifiant Formspree, le formulaire est désactivé et un TODO est affiché ;
    - liens GitHub `Maxime-Garcia` et LinkedIn en TODO.
- **Terminé quand :**
  - aucun JavaScript hors filtres et contact ;
  - tests unitaires du schéma et de l'i18n, tests E2E des filtres et des pages détail ;
  - aucun fait inventé (`grep "TODO(maxime)"`).

### 3. `feat/motion-scroll`

- **Agent :** motion-engineer.
- **Dépendances :**
  - `gsap`, pour les timelines et ScrollTrigger ;
  - `lenis`, pour le défilement fluide, branché sur `gsap.ticker` ;
  - `nanostores`, pour le store `activeSection`.
- **Contenu :**
  - séquence d'entrée du Hero et timeline au scroll ;
  - ClientRouter ;
  - nettoyage à chaque changement de page (`kill`/`revert`, destruction de Lenis).
- **Terminé quand :**
  - la variante réduite est testée en E2E avec `reducedMotion: 'reduce'` ;
  - le JavaScript initial de l'accueil fait moins de 40 Ko gzip, contrôlé par `scripts/check-budget.mjs` ;
  - Lighthouse reste ≥ 95.

### 4. `feat/space-scene`

- **Agents :** 3d-engineer, perf-seo-auditor.
- **Dépendances :** `three`, `@react-three/fiber` v9 (compatible React 19), `@react-three/drei`, `@types/three` en dev.
- **Contenu :**
  - directive `client:intent` : la scène se charge au premier scroll, pointeur ou touche, ou au clic sur « Allumer les moteurs ». Lighthouse ne voit que le fond statique.
  - canvas `aria-hidden` ;
  - `dpr` plafonné à `[1,1.5]` sur mobile et `[1,2]` sur ordinateur ;
  - `PerformanceMonitor` et prop `fallback` ;
  - moins de 100 draw calls ;
  - shaders pour les étoiles et la nébuleuse.
- **Terminé quand :**
  - aucun chunk three dans le HTML initial ;
  - 60 fps sur ordinateur et mode allégé sur mobile ;
  - la page est complète sans WebGL.

### 5. `feat/game-layer`

- **Agents :** ui-designer, motion-engineer, qa-tester.
- **Dépendances :** `@nanostores/react` et `motion` (`LazyMotion` et `m`, environ 5 Ko).
- **Contenu :**
  - **Succès :** 6 planètes visitées, terminal ouvert, Konami, son activé, langue changée, projet lu. Toasts en `aria-live="polite"`.
  - **Konami :** ignoré quand le focus est dans un champ.
  - **Terminal :**
    - fenêtre `<dialog>` ouverte avec `showModal`, chargée à la demande via le bouton du HUD ou `Ctrl/Cmd+K` (pas de raccourci à une touche, critère WCAG 2.1.4) ;
    - commandes : `help`, `projects`, `contact`, `about`, `skills`, `theme`, `sound`, `lang`, `clear`, `exit`.
- **Terminé quand :**
  - l'analyseur de commandes et la logique des succès sont couverts à 100 % ;
  - la navigation au clavier est testée en E2E ;
  - axe ne relève aucune violation.

### 6. `feat/sound`

- **Agent :** sound-designer.
- **Dépendances :** aucune.
- **Contenu :**
  - `AudioContext` créé seulement au clic sur le bouton son (coupé par défaut, choix mémorisé) ;
  - micro-sons synthétisés, sans fichier audio ;
  - `AnalyserNode` sur le lecteur de Passions : la planète et un visualiseur 2D réagissent au son, figés en mouvement réduit.
- **Terminé quand :**
  - aucun son ne joue sans action de l'utilisateur ;
  - aucune requête audio n'est faite avant la lecture.

### 7. `feat/seo-polish`

- **Agents :** perf-seo-auditor, qa-tester, doc-keeper.
- **Dépendance :** `@astrojs/sitemap`.
- **Contenu :**
  - page 404 thématique ;
  - JSON-LD `Person`, Open Graph, `robots.txt` ;
  - audit final ;
  - mise à jour des docs.
- **Terminé quand :**
  - Lighthouse ≥ 95 sur toutes les pages ;
  - axe ne relève aucune violation ;
  - le sitemap inclut les versions hreflang.

## Divergences avec la spec (à vérifier avec Context7 avant de coder)

- **Astro :** le projet est en 7.4 et non en 5.
- **API Fonts d'Astro :** elle est intégrée et remplace `@fontsource/*`.
- **Lenis :** le paquet s'appelle `lenis` (plus `@studio-freight/lenis`) et respecte le mouvement réduit par défaut.
- **Content Collections :**
  - `src/content.config.ts` avec loaders ;
  - `entry.id` remplace `slug` ;
  - Zod s'importe depuis `astro/zod`.
- **Scripts et View Transitions :** les scripts empaquetés ne s'exécutent qu'une fois, il faut donc relancer l'initialisation sur `astro:page-load`.
- **Configuration :** `site` est absent d'`astro.config.mjs`, et `SITE.locale` est figé sur `'en'`.
- **Points ouverts :**
  - `addClientDirective` ;
  - `@custom-variant` de Tailwind 4 ;
  - R3F 9 et drei avec React 19.3 ;
  - licence des plugins GSAP ;
  - `image()` dans les schémas.

## Risques et parades

- **Three.js pénalise TBT et LCP :** chargement à l'intention, LCP sur le texte du `h1`, budget JavaScript contrôlé en CI.
- **Contrastes du thème clair et du HUD translucide :** jetons validés AA dès le jalon 1, axe testé dans les deux thèmes.
- **GPU mobile :** niveaux de qualité, `PerformanceMonitor` et repli statique.
- **Lenis face au clavier, aux ancres et au focus :** option `anchors`, focus sur la section ciblée.
- **Contenu inventé :** drapeau `placeholder`, `TODO(maxime)` et un test qui liste les exemples.
- **PR trop grosse (plus de 600 lignes environ) :** découper le jalon.

## ADR à rédiger (doc-keeper)

- 0003 : navigation « Orbite »
- 0004 : i18n, FR à la racine et EN sur `/en/`
- 0005 : API Fonts d'Astro
- 0006 : nanostores
- 0007 : chargement de la 3D (directive `intent`, repli, budget)
- 0008 : GSAP, Lenis, et Motion limité aux islands
- 0009 : Formspree en HTML natif
- 0010 : politique son

## Environnement : leçons du bootstrap

- **Disque Windows (9p/drvfs) :** un projet ouvert depuis C: est très lent et `astro dev`/`astro preview` ne démarrent pas. Travailler dans un volume Docker (« Dev Containers: Clone Repository in Container Volume »).
- **Mode sans permission dans VS Code :** il faut `claudeCode.allowDangerouslySkipPermissions: true` et `claudeCode.initialPermissionMode: "bypassPermissions"` dans les réglages Remote du conteneur, puis recharger la fenêtre.
- **Connexions à refaire dans chaque nouveau conteneur :** `gh auth login` et `pnpm dlx vercel login`. Pour lier le projet : `vercel link --yes --project portfolio --scope nova-eddf`.
- **Tests sur une URL Vercel :** les URL de déploiement sont protégées par authentification, il faut tester le domaine de production.

## À fournir par Maxime (remplace les `TODO(maxime)`)

Liste détaillée, fichier par fichier : [a-remplacer.md](a-remplacer.md).

- Projets réels : titre, description, technos, liens, visuels.
- Photo, URL LinkedIn, morceaux de guitare ou vidéos.
- Identifiant Formspree (`PUBLIC_FORMSPREE_ID`) et nom de domaine.
- Ambiance visuelle et sites qu'il aime (facultatif : le concept « Orbite » sert de base par défaut).
