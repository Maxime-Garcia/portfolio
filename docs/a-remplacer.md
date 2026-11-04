# À remplacer par Maxime

Chaque contenu provisoire est marqué `TODO(maxime)` dans le code (`grep -rn "TODO(maxime)" src astro.config.mjs`) et, à l'écran, par un badge « Exemple » ou « À compléter ». Cette liste est tenue à jour à chaque PR.

| Quoi                                                   | Où                                                                          | Provisoire actuel                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Nom de domaine                                         | `astro.config.mjs` (`site`)                                                 | URL Vercel de production                                         |
| Photo                                                  | `src/components/sections/About.astro`                                       | Planète SVG générée avec « MG »                                  |
| Études, diplôme, années                                | `src/content/timeline.yaml` (`studies`)                                     | Texte générique, `placeholder: true`                             |
| Morceaux de guitare                                    | `public/audio/`, `src/components/sections/Passions.astro`                   | Arpèges synthétisés (Karplus-Strong), 13 s, WAV                  |
| Jeux marquants                                         | `src/components/sections/Passions.astro` (`games`)                          | 3 cartes « À compléter »                                         |
| Identifiant Formspree                                  | variable `PUBLIC_FORMSPREE_ID` (Vercel + secret GitHub)                     | Formulaire désactivé avec message                                |
| URL LinkedIn                                           | `src/components/sections/Contact.astro`, `src/lib/site.ts`                  | « LinkedIn (bientôt) », sans lien                                |
| Projets réels (titre, résumé, technos, liens, visuels) | `src/content/projects/{fr,en}/` (même nom de fichier dans les deux langues) | 3 fiches `exemple-*.mdx`, `placeholder: true`, badge « Exemple » |
| Visuels de projets                                     | `src/components/projects/ProjectCover.astro`                                | Planète SVG générée depuis le slug                               |

| Image de partage (Open Graph) | `public/og.png` (1200×630) | Visuel généré : planète et nom |
| Favicon et icône Apple | `public/favicon.svg`, `public/apple-touch-icon.png` | Planète générée |
| LinkedIn dans le JSON-LD | `src/lib/site.ts` (`sameAs`) | GitHub seul |
| Domaine dans `robots.txt` | `public/robots.txt` | URL Vercel |

Quand les vrais projets sont ajoutés : supprimer les `exemple-*.mdx` et le test « lists the example projects still to replace » de `tests/unit/projects.test.ts`.
