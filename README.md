# Info bonnes pratiques

Ce guide tout public présente les bonnes pratiques informatiques du quotidien.
Le but est de configurer un environment confortable et sécurisé,
tout en permettant un minimum de dépendance face aux géants du numérique.

## Le site

Site statique, sans framework ni étape de build. Présentation façon slides :
navigation horizontale (swipe / flèches / clavier), sommaire latéral, routage
par ancre `#`, thème clair/sombre (auto + bouton).

```
index.html            # structure de la page
css/style.css         # design & responsive (tokens, dark mode)
js/app.js             # chargement des chapitres + navigation
content/
  chapters.json       # liste ordonnée des chapitres
  *.md                # un fichier Markdown par chapitre
```

## Ajouter / modifier un chapitre

1. Créez un fichier `content/06-mon-sujet.md`.
2. Ajoutez une entrée dans `content/chapters.json` :

```json
{ "id": "mon-sujet", "title": "Mon sujet", "file": "content/06-mon-sujet.md" }
```

L'ordre du tableau JSON = l'ordre des slides. L'`id` sert d'ancre (`#mon-sujet`).

## Aperçu en local

Le contenu est chargé via `fetch`, il faut donc un serveur (pas `file://`) :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```
