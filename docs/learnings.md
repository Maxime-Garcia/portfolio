# Learnings

Journal de veille. Une entrée par session de travail, la plus récente en haut. Chaque entrée : ce qui a été appris, les pièges rencontrés, les liens utiles.

## 2026-11-04 : jalon 1, design system et i18n

### Pièges

**a. `astro preview` passe en arrière-plan sous un agent IA.**
Astro 7 détecte l'agent et lance la preview en tâche de fond : Playwright voit le `webServer` quitter et échoue (« exited early »). Un verrou peut aussi survivre d'une session à l'autre. Solution : `pnpm preview --ignore-lock` dans `playwright.config.ts`, et `astro preview stop` pour un verrou orphelin.

**b. Chromium sans bibliothèques système dans un conteneur neuf.**
Exit 127 au lancement. Solution : `sudo env "PATH=$PATH" npx playwright install-deps chromium`.

**c. Lighthouse local échoue sans `--no-sandbox`.**
En local : `lhci collect --settings.chromeFlags="--no-sandbox --headless=new"` avec `CHROME_PATH` vers le Chromium de Playwright. La CI n'en a pas besoin.

**d. axe `label-content-name-mismatch`.**
Un `aria-label` doit contenir le texte visible (WCAG 2.5.3). Pour le logo « MG » : texte visible et `sr-only`, sans `aria-label`.

**e. `gh auth login` sans terminal interactif.**
Lancer `gh auth login --web` en arrière-plan, lire le code d'appareil dans sa sortie, le saisir sur github.com/login/device.

### Ce qui a été appris

- Tailwind 4 : `@theme inline` pour des utilitaires (`bg-bg`, `text-ink`) qui pointent vers des variables changeant selon `data-theme`.
- L'API Fonts d'Astro 7 est stable (clé `fonts` au premier niveau).

## 2026-11-04 : bootstrap du projet

### Pièges

**a. Projet sur un montage Windows 9p / drvfs.**
Dans le conteneur, le dossier du projet est un montage Windows. Les I/O sont très lentes : `astro dev` et `astro preview` ne démarrent pas en 30 s.
Solution : déplacer le projet dans le système de fichiers WSL, ou dans un volume Docker.

**b. TypeScript 7 incompatible avec l'outillage.**
`astro check` et typescript-eslint ne supportent pas encore TypeScript 7.
Solution : rester en TypeScript 6.0 (`~6.0.3`). Revoir quand les deux outils suivront.

**c. `eslint-plugin-jsx-a11y` incompatible avec ESLint 10.**
Plugin écarté. L'accessibilité est testée par axe dans Playwright (`@axe-core/playwright`).

**d. `/plugin` indisponible dans l'extension VS Code.**
La commande slash ne répond pas dans l'extension. Passer par le terminal :

```
claude plugin marketplace add anthropics/skills
claude plugin install example-skills@anthropic-agent-skills
```

**e. Prettier reformatait `.claude/` et `.devcontainer/`.**
Les deux dossiers sont ajoutés à `.prettierignore`, avec les fichiers générés (`CHANGELOG.md`, `PROJECT.md`, lock files).

**f. Les URL de déploiement Vercel sont protégées.**
Les smoke tests visaient `portfolio-<hash>-<équipe>.vercel.app` : Vercel y sert une page de connexion (302), et axe signalait ses contrastes à elle. Seul le domaine de production est public. Solution : variable de dépôt `PRODUCTION_URL`.

**g. `vercel rollback` exige un projet lié.**
Dans un job sans `.vercel/`, le CLI échoue (« Could not retrieve Project Settings »). Lancer `vercel pull --yes --environment=production` d'abord. Le premier déploiement n'a rien vers quoi revenir : l'issue doit être ouverte même si le rollback échoue.

**h. Créer le projet depuis le site Vercel connecte l'intégration Git.**
Résultat : deux déploiements par push (Vercel + nos workflows), et une production qui contourne les vérifications. Déconnectée avec `vercel git disconnect`.

### Ce qui a été appris

- La spec `PROJECT.md` cite Astro 5. La stable actuelle est Astro 7 : voir [ADR 0001](decisions/0001-astro.md).
- Les outils de qualité suivent les versions majeures avec un décalage. Vérifier la compatibilité avant de monter une version majeure.

### Liens utiles

- Astro : https://docs.astro.build
- Context7 (documentation à jour pour les agents) : https://context7.com
- Playwright : https://playwright.dev
- @axe-core/playwright : https://github.com/dequelabs/axe-core-npm
- Conventional Commits : https://www.conventionalcommits.org
- commitlint : https://commitlint.js.org
- release-please : https://github.com/googleapis/release-please
- Vercel CLI : https://vercel.com/docs/cli
- GitHub Flow : https://docs.github.com/en/get-started/using-github/github-flow
- `prefers-reduced-motion` (MDN) : https://developer.mozilla.org/fr/docs/Web/CSS/@media/prefers-reduced-motion
- Mermaid : https://mermaid.js.org
