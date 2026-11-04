# 0001 — Astro comme framework

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

Le site est un portfolio vitrine. Il doit charger vite, envoyer le moins de JavaScript possible et rester interactif là où il le faut : scène 3D, animations, navigation spatiale. Le contenu (fiches projets) est écrit en MDX.

`PROJECT.md` vise Astro 5. Au moment du bootstrap, la version stable est Astro 7 (7.4 installée).

Options étudiées :

- **Next.js** : pensé pour les applications React. Le JavaScript de React part au navigateur par défaut, même pour une page statique.
- **SvelteKit** : très bon rendu statique et peu de JavaScript. Écarté : React Three Fiber, requis pour la 3D, n'existe pas en Svelte.
- **Vite + React en SPA** : pas de HTML pré-rendu, premier affichage et SEO moins bons, tout le JavaScript chargé d'un coup.

## Décision

Utiliser **Astro 7 (7.4)** :

- rendu statique (`astro build` vers `dist/`) ;
- zéro JavaScript par défaut, islands React uniquement là où c'est utile ;
- Content Collections et schémas Zod pour les projets ;
- View Transitions natives pour les changements de page.

Écart avec la spec : Astro 7 au lieu d'Astro 5. Les concepts visés (islands, Content Collections, View Transitions) sont présents dans Astro 7. Les API précises se vérifient via Context7 à chaque usage.

## Conséquences

- Le HTML est généré au build. Le JavaScript n'existe que pour les islands.
- Les islands 3D et animations restent dans React, chargées à la demande.
- Le passage à Astro 7 réduit la quantité de retours d'expérience disponibles. La documentation officielle et Context7 servent de référence.
- Les mises à jour majeures d'Astro demanderont une revue de ce document.
