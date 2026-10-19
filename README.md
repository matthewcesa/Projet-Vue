# Cinémoi

Cinémoi est une application web de découverte de films et de gestion d'une
cinémathèque personnelle. Les utilisateurs peuvent rechercher des films, consulter
leurs informations, les ajouter à leur bibliothèque, gérer leurs favoris et suivre
les films vus ou à voir.

## Équipe

- Prénom 1 : Matthew-Frederick CESA
- Prénom 2 : Constant NGYUEN

## Technologies

- Vue 3
- Vue Router
- Vuex
- Vite
- API TMDB (The Movie Database)
- `localStorage` pour conserver les comptes, la session et la bibliothèque

## Installation et lancement

Prérequis : Node.js et npm installés.

Depuis la racine du dépôt, lancer :

```sh
cd cinemoi
npm install
npm run dev
```

Vite affiche ensuite l'adresse locale à ouvrir dans le navigateur.

Pour générer une version de production :

```sh
npm run build
```

Pour prévisualiser le build :

```sh
npm run preview
```

## Fonctionnalités

- Recherche et découverte de films depuis TMDB, avec affiches, genres, années,
  durées, informations détaillées et suggestions de films similaires.
- Chargement des résultats par pages, indicateurs de chargement et messages
  d'erreur ou d'absence de résultats.
- Création de compte et connexion locales.
- Ajout de films dans une bibliothèque personnelle, avec indication des films
  déjà ajoutés.
- Suivi du statut « À voir » ou « Vu », gestion des favoris et suppression avec
  confirmation.
- Page bibliothèque, page favoris et fiches détaillées accessibles par routage.
- Notes personnelles et critiques associées aux films.
- Statistiques sur la collection, les films vus, les favoris et le temps de
  visionnage connu.
- Notifications après ajout ou suppression d'un film.
- Conservation de la bibliothèque et des critiques après actualisation.

## API utilisée

L'application utilise l'API **TMDB** pour rechercher des films et récupérer leurs
affiches, genres, dates de sortie, durées, synopsis, distribution, réalisateurs et
recommandations.

## Parcours principaux

- Accueil et catalogue : `/`
- Connexion et inscription : `/login`
- Bibliothèque : `/library`
- Favoris : `/favorites`
- Listes : `/lists`
- Détails d'un film : `/movie/:id`

Les pages de découverte, bibliothèque, favoris, listes et détails nécessitent une
connexion.

## Conception UX/UI

Le persona, les wireframes et le prototype Figma sont fournis séparément avec les
livrables du projet.
