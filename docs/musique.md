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

- `--top` : nombre d'artistes classés (12 par défaut).
- `--tracks` : nombre de pochettes « En rotation » (6 par défaut).
- `--since` : ne compter que les écoutes depuis cette date (facultatif).

Le script :

- garde les écoutes YouTube Music et classe les artistes ;
- interroge MusicBrainz pour leurs styles (1 requête par seconde, environ 15 s pour 12 artistes) ;
- écrit `src/content/music.json`.

## Ce qui est publié

- **La dernière écoute**, avec son titre, son artiste, sa pochette et sa **date** (affichée « il y a 3 heures »).
- **Les morceaux les plus écoutés** (« En rotation »), avec titre, artiste et pochette.
- **Le classement des styles.**

Les pochettes sont téléchargées depuis les miniatures YouTube, recadrées au carré et enregistrées dans `public/music/`. **Ni le reste de l'historique, ni le nombre d'écoutes** ne sont publiés. Ne pas committer le dossier Takeout.

Pour rafraîchir, relancer le script et ouvrir une PR avec le nouveau `music.json`.
