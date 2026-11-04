# 0006 — nanostores pour l'état partagé

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

Plusieurs morceaux de JavaScript indépendants (HUD, scène 3D, succès, son) doivent partager un état : section visible, succès, son, qualité. Les islands Astro ne partagent pas de contexte React.

## Décision

`nanostores` (moins de 1 Ko), un store par sujet dans `src/stores/`. `@nanostores/react` viendra avec la première island React (jalon 5). Les stores qui doivent survivre au rechargement passeront par localStorage.

## Conséquences

État lisible depuis un script Astro comme depuis React. Logique pure (`pickActive`) testée sous Vitest, sans DOM.
