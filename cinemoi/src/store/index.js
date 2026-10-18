import { createStore } from 'vuex';

// pour recup les donnees sauvegarder dans navigateur
const loadFromStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Pour sauvegarder dans le navigateur
const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export default createStore({
  state: {

    library: loadFromStorage('cinemoi_library'),
    

    lists: loadFromStorage('cinemoi_lists')
  },
  
  mutations: {

    // ajouter ou maj un film dans la library (to-watch, watched,.)
    ADD_TO_LIBRARY(state, { movie, status }) {
      const existing = state.library.find(m => m.id === movie.id);
      if (existing) {
        existing.status = status; // maj si deja present
      } else {
        state.library.push({ ...movie, status });
      }
      saveToStorage('cinemoi_library', state.library);
    },

    // retirer un film 
    REMOVE_FROM_LIBRARY(state, movieId) {
      state.library = state.library.filter(m => m.id !== movieId);
      saveToStorage('cinemoi_library', state.library);
    },

    // ajouter un film dans une lsite specifique
    ADD_TO_LIST(state, { movie, listName }) {
      const exists = state.lists.some(m => m.id === movie.id && m.listName === listName);
      if (!exists) {
        state.lists.push({ ...movie, listName });
        saveToStorage('cinemoi_lists', state.lists);
      }
    },

    // retirer un film d'une liste
    REMOVE_FROM_LIST(state, { movieId, listName }) {
      state.lists = state.lists.filter(m => !(m.id === movieId && m.listName === listName));
      saveToStorage('cinemoi_lists', state.lists);
    }
  },

  getters: {
    // recupérer uniquement les films to watch
    toWatchMovies: (state) => state.library.filter(m => m.status === 'to-watch'),

    // recuperer uniquement les films watched
    watchedMovies: (state) => state.library.filter(m => m.status === 'watched'),

    // verifier si un film est dans la bibliothèque
    isInLibrary: (state) => (movieId) => {
      return state.library.some(m => m.id === movieId);
    }
  }
});