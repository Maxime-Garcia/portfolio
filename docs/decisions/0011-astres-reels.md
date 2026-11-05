# 0011 — Astres réels, nébuleuse et galaxie procédurales

- **Statut** : Accepté (remplace la partie « planètes procédurales » de l'ADR 0007)
- **Date** : 2026-11-05

## Contexte

Maxime veut une 3D de fond « vraiment qualitative » : de vraies planètes du système solaire, des nébuleuses ou des galaxies, plutôt que des sphères en bruit fbm.

## Décision

- **Un astre par section**, un voyage vers l'extérieur : Terre (Départ), Mars, Jupiter, Saturne et ses anneaux, une nébuleuse (Passions), une galaxie spirale (Contact).
- **Textures Solar System Scope** (CC BY 4.0, dérivées de données NASA), converties en WebP par `scripts/build-textures.mjs` en deux jeux : `hd` (desktop, Terre en 4k) environ 1,2 Mo, et `sd` (tactile et qualité basse) environ 360 Ko. Elles ne sont chargées qu'avec la scène, donc après une intention. Les crédits figurent dans le pied de page et dans `public/textures/CREDITS.md`.
- **Terre** : shader jour/nuit avec lumières des villes, reflet sur les océans, couche de nuages et halo atmosphérique. Le Soleil vient de la droite, si bien que les faces nocturnes regardent le texte.
- **Nébuleuse et galaxie procédurales**, en sprites de points : filaments en marche aléatoire pour la nébuleuse, qui pulse avec la musique ; bulbe, bras et régions de formation d'étoiles pour la galaxie. Aucun asset tiers.
- **Voie lactée réelle** en fond (thème sombre), plus **bloom** (`@react-three/postprocessing`, `mipmapBlur`) en thème sombre et en qualité haute seulement.
- **Fondu par distance** en opacité (`useFade`) : les astres lointains disparaissent et ne sont plus dessinés.

## Conséquences

Le JavaScript initial ne bouge pas (la scène reste chargée sur intention). La scène est plus lourde (textures, postprocessing) : `PerformanceMonitor` bascule en qualité basse (textures `sd`, sans bloom, moins de particules). Les modèles glTF de la NASA ont été écartés : sphères texturées et shaders donnent un meilleur rendu pour bien moins de poids.
