# 0003 — Navigation « Orbite »

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

La spec demande un site « système solaire » où chaque section est une planète. Options étudiées : une page par planète avec transitions, ou une page longue unique.

## Décision

Une page longue et sémantique par langue. Six sections-planètes : départ (Hero), à propos, compétences, projets, passions, contact, avec des ancres partagées entre les langues (`#hero`, `#about`…). Un HUD « carte stellaire » relie les ancres. La 3D (jalon 4) ne fait que suivre la section visible. Les projets ont leurs propres routes.

## Conséquences

Le contenu est complet et indexable sans JavaScript ni WebGL. La caméra 3D dépend du scroll, pas du routage. Le HUD est fixe : `scroll-padding-top` compense sa hauteur.
