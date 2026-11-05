# Musique : générer « Ce que j'écoute » depuis YouTube Music

YouTube Music n'a pas d'API publique pour l'historique d'écoute. Le site s'appuie donc sur un export Google Takeout, traité en local.

## 1. Exporter l'historique (2 minutes)

1. Ouvrir https://takeout.google.com et cliquer sur « Tout désélectionner ».
2. Cocher **YouTube et YouTube Music**, puis « Toutes les données YouTube incluses » : ne garder que **historique**.
3. Dans « Formats multiples », passer l'historique en **JSON** (le HTML marche aussi).
4. Créer l'export, puis télécharger et décompresser l'archive.

Le fichier se trouve dans `Takeout/YouTube et YouTube Music/historique/watch-history.json` (ou `.html`).

## 2. Générer les pastilles

```sh
node scripts/music-takeout.ts "chemin/vers/watch-history.json" --top 12 --since 2025-01-01
```

- `--top` : nombre d'artistes affichés (12 par défaut).
- `--since` : ne compter que les écoutes depuis cette date (facultatif).

Le script :

- garde les écoutes YouTube Music et classe les artistes ;
- interroge MusicBrainz pour leurs styles (1 requête par seconde, environ 15 s pour 12 artistes) ;
- écrit `src/content/music.json`.

## Ce qui est publié

Uniquement le classement des artistes et des styles, avec un lien YouTube Music par artiste. **Ni l'historique brut, ni les titres, ni les dates, ni le nombre d'écoutes** : ils restent sur ta machine. Ne pas committer le dossier Takeout.

Pour rafraîchir, relancer le script et ouvrir une PR avec le nouveau `music.json`.
