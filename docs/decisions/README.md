# Décisions d'architecture (ADR)

Un ADR par décision technique importante. Numérotés dans l'ordre, jamais réécrits : une décision remplacée reçoit le statut « Remplacé par ». Le doc-keeper en crée un à chaque décision validée.

## Index

| N°                                | Titre                      | Statut  | Date       |
| --------------------------------- | -------------------------- | ------- | ---------- |
| [0001](0001-astro.md)             | Astro comme framework      | Accepté | 2026-11-04 |
| [0002](0002-vercel.md)            | Vercel pour l'hébergement  | Accepté | 2026-11-04 |
| [0003](0003-navigation-orbite.md) | Navigation « Orbite »      | Accepté | 2026-11-04 |
| [0004](0004-i18n.md)              | i18n, FR racine, EN `/en/` | Accepté | 2026-11-04 |
| [0005](0005-astro-fonts.md)       | API Fonts d'Astro          | Accepté | 2026-11-04 |

## Modèle

Copier ce bloc dans `docs/decisions/NNNN-titre-court.md`, avec le numéro suivant.

```markdown
# NNNN — Titre de la décision

- **Statut** : Proposé | Accepté | Remplacé par NNNN
- **Date** : AAAA-MM-JJ

## Contexte

Le problème, les contraintes, les options étudiées.

## Décision

Ce qui est décidé, en une ou deux phrases précises.

## Conséquences

Ce que la décision apporte et ce qu'elle coûte. Les risques et ce qu'il faudra revoir.
```
