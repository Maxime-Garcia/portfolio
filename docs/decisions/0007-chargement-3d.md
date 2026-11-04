# 0007 — Chargement de la 3D : directive `intent`, repli, budget

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

La scène Three.js / React Three Fiber pèse plusieurs centaines de Ko. Chargée d'emblée, elle dégraderait TBT et LCP. Elle est décorative : le contenu doit être complet sans elle.

## Décision

- **Directive `client:intent`** (`src/directives/intent.ts`, enregistrée par `addClientDirective`). L'island s'hydrate au premier signe d'un humain (`pointermove` avec un vrai déplacement, `pointerdown`, `wheel`, `touchstart`, `keydown`) ou au clic sur « Allumer les moteurs ». Le `scroll` seul est exclu (le navigateur en émet sans action), comme le `pointermove` sans mouvement que Chrome envoie au chargement. Lighthouse ne voit donc que le fond CSS.
- **Pas de 3D** sans WebGL, avec Save-Data, ou sur un appareil tactile faible (≤ 4 cœurs ou ≤ 2 Go). L'état est exposé par `<html data-space="off|ready|on">`.
- **Rendu** : composant monté côté client seulement (pas de `<canvas>` dans le HTML) ; wrapper `aria-hidden` et `transition:persist` ; `dpr` `[1,1.5]` en tactile et `[1,2]` sinon ; `PerformanceMonitor` qui passe le store `quality` en `low` (dpr 1, moins d'étoiles, sphères allégées) ; environ 10 draw calls.
- **Mouvement réduit** : `frameloop="demand"`, caméra qui saute, pas de rotation ni de scintillement.
- **Shaders maison** (bruit fbm) pour les planètes, les étoiles et la nébuleuse ; un fondu de profondeur efface les planètes lointaines derrière le texte.

## Conséquences

Aucun chunk 3D avant une intention (testé en E2E). drei n'est utilisé que pour `PerformanceMonitor`. Le fond CSS reste en dessous et sert de repli.
