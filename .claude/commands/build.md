---
description: Implémente la fonctionnalité planifiée avec l'agent spécialisé, en petits commits
argument-hint: [précision optionnelle]
---
Implémente le plan en cours. $ARGUMENTS

1. Délègue chaque partie à l'agent concerné : ui-designer (écrans, avec le skill frontend-design), motion-engineer (animations), 3d-engineer (3D), sound-designer (son), content-writer (textes FR/EN, MDX).
2. Consulte Context7 avant toute API de librairie. Pas de nouvelle dépendance sans justification.
3. Les hooks lancent lint et typecheck après chaque édition : corrige jusqu'au vert.
4. Ajoute ou mets à jour les tests (Vitest pour la logique, Playwright pour le parcours).
5. Un commit atomique par changement logique, via **git-keeper** (Conventional Commits en anglais).
6. Enchaîne sur `/review`.
