# 0010 — Politique son

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

La spec veut une « musique vivante » : micro-sons et visuels qui réagissent au son. Un son imposé gêne et viole les règles d'autoplay des navigateurs. Charger de l'audio pour rien coûte de la bande passante.

## Décision

- **Coupé par défaut**, bouton ♪ dans le HUD (`aria-pressed`), choix mémorisé (`orbite:sound`).
- **L'`AudioContext` n'est créé que dans un gestionnaire d'action** (clic ou touche), jamais au chargement, même quand le son a été laissé activé. Les sons ne répondent qu'à des interactions.
- **Micro-sons synthétisés** (oscillateurs et enveloppes, `src/audio/blips.ts`), sans fichier audio. Le synthé est chargé à la demande.
- **Musique** : ~~lecteur `<audio>` et analyseur~~, remplacés le 2026-11-05 par des pastilles d'artistes et de styles (voir `docs/musique.md`). Plus aucun fichier audio sur le site.

- **Vent au scroll** (ajout du 2026-11-05) : bruit blanc en boucle à travers un passe-bande dont la fréquence et le volume suivent la vitesse de défilement. Il ne tourne que si le son est activé, et ne démarre qu'au premier clic ou à la première touche. Le carillon des succès n'utilise qu'un contexte déjà créé par un geste.

## Conséquences

Testé en E2E : aucun `AudioContext` avant une action, même après rechargement avec le son activé ; aucune requête audio avant la lecture.
