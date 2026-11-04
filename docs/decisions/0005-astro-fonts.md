# 0005 — API Fonts d'Astro

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

Trois familles : Unbounded (titres), Atkinson Hyperlegible Next (texte), JetBrains Mono (HUD). La spec citait `@fontsource/*`.

## Décision

API Fonts intégrée à Astro 7, fournisseur `fontProviders.fontsource()`, polices variables, sous-ensemble latin, replis calculés. Seule Unbounded est préchargée (`<Font preload />`), car le `h1` est le LCP.

## Conséquences

Aucune dépendance npm. Les fichiers sont téléchargés au build et auto-hébergés : le build a besoin du réseau.
