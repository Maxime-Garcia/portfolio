# Animations

> **Statut : rien n'est implémenté.** Ce document fixe les principes avant le premier composant animé.

## Outils prévus

| Outil                       | Rôle                                             |
| --------------------------- | ------------------------------------------------ |
| GSAP + ScrollTrigger        | Séquences, timelines, animations liées au scroll |
| Motion                      | Micro-interactions dans les islands React        |
| Lenis                       | Défilement fluide                                |
| View Transitions (Astro)    | Transitions entre les pages                      |
| Three.js, React Three Fiber | Scène spatiale, islands chargées à la demande    |

## Principes

1. **Transform et opacity seulement.** Ces propriétés restent sur le GPU. On évite les animations de `width`, `top` ou `margin`, qui forcent le recalcul de la mise en page.
2. **60 fps visés.** Mesurer sur une page réelle avant de valider une animation. Version allégée sur mobile.
3. **Timelines réutilisables dans `src/animations/`.** Une timeline par séquence, appelée depuis le composant. Pas de logique d'animation éparpillée dans les pages.
4. **Motion pour les micro-interactions.** Hover, focus, états d'une island React.
5. **GSAP pour les séquences et le scroll.** Motion ne gère pas les timelines longues.
6. **Variante `prefers-reduced-motion` obligatoire.** Chaque animation a sa version réduite : pas de mouvement, fondu ou changement immédiat. Lenis est désactivé dans ce cas.
7. **Nettoyage au démontage.** Tuer les tweens et les ScrollTrigger (`kill`), revenir à l'état initial (`revert`). Une island démontée ne laisse aucun listener actif.
8. **Le contenu reste lisible sans animation.** Une animation d'entrée ne doit jamais cacher du texte de façon permanente.

## Vérifications avant implémentation

Les API ci-dessous sont à confirmer dans la documentation à jour (Context7) avant usage :

- GSAP : `gsap.matchMedia()` pour la variante réduite, `gsap.context()` et `revert()` pour le nettoyage.
- Motion : `useReducedMotion` pour lire la préférence dans une island.
- CSS : `@media (prefers-reduced-motion: reduce)` pour les transitions de View Transitions.

## Accessibilité et performance

- Les tests axe et Playwright couvrent le contenu, pas le mouvement. Vérifier à la main la version réduite.
- Lighthouse en CI surveille le coût des animations sur la performance.
