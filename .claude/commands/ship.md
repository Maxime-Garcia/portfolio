---
description: Pousse la branche, ouvre la PR en auto-merge et surveille CI et déploiement
---
Livre la branche courante.

1. Refuse si la branche courante est `main`.
2. **git-keeper** : vérifie que l'historique de la branche respecte les conventions, puis `git push -u origin HEAD`.
3. Ouvre la PR avec le modèle `.github/pull_request_template.md` : `gh pr create --fill-first --body-file <corps rempli>`, titre au format Conventional Commits.
4. Active l'auto-merge depuis ton compte (pas depuis la CI, sinon le merge ne déclenche pas le déploiement) : `gh pr merge --auto --squash --delete-branch`.
5. Surveille : `gh pr checks --watch`, puis après le merge `gh run watch` sur les workflows Deploy et Post-deploy.
6. En cas d'échec : lis les logs (`gh run view --log-failed`), corrige sur la branche, repousse. Ne t'arrête pas pour demander.
7. Termine par l'URL de la PR, celle du déploiement, et une ligne de résumé.
