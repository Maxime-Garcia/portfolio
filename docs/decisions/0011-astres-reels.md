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

## Mise à jour du 2026-11-05 : scènes plus personnelles

- **Nébuleuse retirée** (jugée ratée). Passions devient un **planétoïde de feu de camp**, original : pins, feu qui éclaire le sol, guitare, braises et notes de musique.
- **Galaxie photographique** : le Sombrero (M104, NASA/ESA et The Hubble Heritage Team (STScI/AURA), CC BY 4.0), imprimé à l'encre en thème clair.
- **Jupiter** : les lunes galiléennes reliées par des flux de données, clin d'œil au métier d'intégration.
- **Ceinture d'astéroïdes** traversée entre Mars et Jupiter (un seul draw call instancié).
- **Textures plus fines, chargées progressivement** : la scène démarre en 2k (environ 400 Ko), puis les versions 4k et 8k (Terre et Voie lactée en 8k, environ 4 Mo) arrivent en arrière-plan si le GPU accepte des textures de 8192 px.

## Mise à jour du 2026-11-06 : fondus et planétoïde refait

- **Aucune apparition brutale** : `useFade` fond tous les matériaux d'un astre selon la distance et selon une entrée globale de 1,8 s (0,4 s en mouvement réduit), démarrée quand les textures sont prêtes (`IntroClock`). La Voie lactée apparaît aussi en fondu.
- **Jupiter** : les arcs visibles sont retirés, seuls les paquets lumineux (ronds) circulent entre les lunes.
- **Planétoïde du feu de camp refait, sur un design original** (pas de copie d'un monde de jeu existant) : relief fbm avec lacs, rivages, prairies et falaises, environ 15 000 triangles aux normales lissées, forêt instanciée en bosquets, feu entouré de pierres avec halo, guitare dessinée, fusée en bois, geyser intermittent, atmosphère fresnel, et une lueur lunaire côté nuit.
