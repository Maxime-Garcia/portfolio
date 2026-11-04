# 0002 — Vercel pour l'hébergement

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

Le site doit être déployé à chaque push, avec une URL de preview par PR, du HTTPS et un nom de domaine personnel. Il faut pouvoir revenir en arrière vite si une mise en production casse le site. Le coût doit rester nul.

Options étudiées : **Vercel** et **Cloudflare Pages**. Les deux servent un build statique depuis un dépôt GitHub et proposent des previews.

## Décision

Héberger sur **Vercel**, offre gratuite (Hobby). Le déploiement passe par la CLI Vercel dans GitHub Actions (`deploy.yml`).

Motifs :

- **Rollback en une commande** (`vercel rollback`), appelé par `post-deploy.yml` en cas d'échec.
- **Previews** par PR, générées sans configuration supplémentaire.
- **CLI** claire pour piloter le déploiement depuis la CI et depuis Claude Code.
- L'offre gratuite suffit pour un site personnel.

Cloudflare Pages reste une option de repli. Le build est statique (`dist/`) : changer d'hébergeur ne demande pas de toucher au code.

## Conséquences

- Le projet dépend de trois secrets : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Procédure dans [deployment](../deployment.md).
- Les conditions de l'offre Hobby réservent l'usage à un projet personnel et non commercial. À réévaluer si le site devient une vitrine commerciale.
- Le domaine personnel se branche dans le tableau de bord Vercel. Il reste à choisir.
