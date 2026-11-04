# 0010 — Politique son

- **Statut** : Accepté
- **Date** : 2026-11-04

## Contexte

La spec veut une « musique vivante » : micro-sons et visuels qui réagissent au son. Un son imposé gêne et viole les règles d'autoplay des navigateurs. Charger de l'audio pour rien coûte de la bande passante.

## Décision

- **Coupé par défaut**, bouton ♪ dans le HUD (`aria-pressed`), choix mémorisé (`orbite:sound`).
- **L'`AudioContext` n'est créé que dans un gestionnaire d'action** (clic ou touche), jamais au chargement, même quand le son a été laissé activé. Les sons ne répondent qu'à des interactions.
- **Micro-sons synthétisés** (oscillateurs et enveloppes, `src/audio/blips.ts`), sans fichier audio. Le synthé est chargé à la demande.
- **Musique** : `<audio preload="none">` natif. L'`AnalyserNode` est branché au premier `play` ; il alimente un visualiseur 2D et la pulsation de la planète Passions. Les deux sont figés en mouvement réduit. La musique ne dépend pas du bouton ♪, qui ne concerne que les sons d'interface.

## Conséquences

Testé en E2E : aucun `AudioContext` avant une action, même après rechargement avec le son activé ; aucune requête audio avant la lecture.
