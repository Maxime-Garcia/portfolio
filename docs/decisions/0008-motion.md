# 0008 — GSAP, Lenis, et Motion limité aux islands

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

La spec demande des animations riches et un défilement fluide, avec un budget de 40 Ko gzip de JavaScript initial sur l'accueil. GSAP core (environ 27 Ko), Lenis (environ 5 Ko) et le ClientRouter (environ 6 Ko) atteignaient 39,5 Ko à eux seuls. ScrollTrigger aurait ajouté environ 17 Ko.

## Décision

- **Entrée du Hero en CSS pur** (`@keyframes`, décalage par `--i`). Le `h1`, élément LCP, ne fait que se déplacer et n'est jamais transparent.
- **GSAP et Lenis en import dynamique** depuis `src/scripts/motion.ts`, hors du chemin critique. Ils servent aux révélations au scroll (IntersectionObserver, sans ScrollTrigger) et au défilement fluide (Lenis sur `gsap.ticker`).
- **États masqués seulement sous `html.motion`**, posé avant l'affichage si le mouvement est autorisé. Un failsafe CSS affiche tout après 2,5 s si le JavaScript ne s'exécute pas. `html.motion-ready` coupe ce failsafe dès que GSAP prend la main (une animation CSS l'emporterait sur ses styles inline).
- **Mouvement réduit** : pas de `html.motion`, donc aucun état masqué ; `gsap.matchMedia` fige tout ; Lenis passe en 1:1 et les ancres sautent.
- **Nettoyage** : tout est arrêté sur `astro:before-swap` et relancé sur `astro:page-load`.
- **Motion** (la librairie React) reste réservée aux islands du jalon 5.

## Conséquences

JavaScript initial de l'accueil : 8,7 Ko gzip, contrôlé en CI par `pnpm budget` (`scripts/check-budget.mjs`). Si un effet lié au scroll (scrub, pin) devient nécessaire, charger ScrollTrigger lui aussi à la demande.
