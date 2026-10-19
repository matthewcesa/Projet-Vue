import { createStore } from 'vuex';

const ACCOUNTS_KEY = 'cinemoi_accounts';
const SESSION_KEY = 'cinemoi_session';
const LEGACY_LIBRARY_KEY = 'cinemoi_library';
let nextNotificationId = 0;

function readJson(key, fallback, storage = localStorage) {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Impossible de lire ${key} depuis localStorage :`, error);
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getAccountLibrary(userId) {
  const storageKey = `cinemoi_library_${userId}`;
  const library = readJson(storageKey, []);
  let migrated = false;
  const libraryWithDates = library.map((movie, index) => {
    if (movie.dateAdded) return movie;

    migrated = true;
    return {
      ...movie,
      dateAdded: new Date(Date.now() - (library.length - index) * 1000).toISOString()
    };
  });

  if (migrated) {
    saveJson(storageKey, libraryWithDates);
  }

  return libraryWithDates;
}

function getAccountReviews(userId) {
  return readJson(`cinemoi_reviews_${userId}`, {});
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Le navigateur ne permet pas le stockage sécurisé local. Utilise localhost ou HTTPS.');
  }

  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const digest = await globalThis.crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: new TextEncoder().encode(salt),
    iterations: 210000,
    hash: 'SHA-256'
  }, keyMaterial, 256);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function createSalt() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function loadInitialAuth() {
  const accounts = readJson(ACCOUNTS_KEY, []);
  const session = readJson(SESSION_KEY, null) || readJson(SESSION_KEY, null, sessionStorage);
  const account = session ? accounts.find(item => item.id === session.userId) : null;

  return {
    accounts,
    user: account ? { id: account.id, email: account.email } : null,
    library: account ? getAccountLibrary(account.id) : [],
    reviews: account ? getAccountReviews(account.id) : {}
  };
}

const initialAuth = loadInitialAuth();

export default createStore({
  state: {
    accounts: initialAuth.accounts,
    user: initialAuth.user,
    library: initialAuth.library,
    reviews: initialAuth.reviews,
    notification: null
  },

  mutations: {
    SHOW_NOTIFICATION(state, message) {
      state.notification = {
        id: ++nextNotificationId,
        message
      };
    },

    CLEAR_NOTIFICATION(state, notificationId) {
      if (state.notification?.id === notificationId) {
        state.notification = null;
      }
    },

    SET_ACCOUNTS(state, accounts) {
      state.accounts = accounts;
      saveJson(ACCOUNTS_KEY, accounts);
    },

    SET_USER(state, payload) {
      const user = payload?.user ?? payload;
      const remember = payload?.user ? payload.remember : true;
      state.user = user;
      if (user) {
        const session = { userId: user.id };
        if (remember) {
          saveJson(SESSION_KEY, session);
          sessionStorage.removeItem(SESSION_KEY);
        } else {
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
        state.library = getAccountLibrary(user.id);
        state.reviews = getAccountReviews(user.id);
      } else {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        state.library = [];
        state.reviews = {};
      }
    },

    SET_LIBRARY(state, library) {
      state.library = library;
      if (state.user) {
        saveJson(`cinemoi_library_${state.user.id}`, library);
      }
    },

    SET_MOVIE_REVIEW(state, { movieId, rating, text }) {
      const reviews = {
        ...state.reviews,
        [movieId]: { rating, text }
      };
      state.reviews = reviews;
      if (state.user) {
        saveJson(`cinemoi_reviews_${state.user.id}`, reviews);
      }
    },

    ADD_TO_LIBRARY(state, { movie, status }) {
      const existingIndex = state.library.findIndex(item => item.id === movie.id);
      const nextLibrary = [...state.library];

      if (existingIndex >= 0) {
        const existingMovie = nextLibrary[existingIndex];
        nextLibrary[existingIndex] = {
          ...existingMovie,
          ...movie,
          dateAdded: existingMovie.dateAdded || movie.dateAdded || new Date().toISOString(),
          status
        };
      } else {
        nextLibrary.push({
          ...movie,
          dateAdded: movie.dateAdded || new Date().toISOString(),
          status
        });
      }

      this.commit('SET_LIBRARY', nextLibrary);
    },

    REMOVE_FROM_LIBRARY(state, movieId) {
      this.commit('SET_LIBRARY', state.library.filter(item => item.id !== movieId));
    },

    TOGGLE_FAVORITE(state, movie) {
      const existing = state.library.find(item => item.id === movie.id);
      const nextLibrary = existing
        ? state.library.map(item => item.id === movie.id
          ? { ...item, isFavorite: !item.isFavorite }
          : item)
        : [...state.library, {
          ...movie,
          dateAdded: movie.dateAdded || new Date().toISOString(),
          status: 'to-watch',
          isFavorite: true
        }];

      this.commit('SET_LIBRARY', nextLibrary);
    },

  },

  actions: {
    async register({ state, commit }, { email, password }) {
      const normalizedEmail = email.trim().toLowerCase();
      if (state.accounts.some(account => account.email === normalizedEmail)) {
        throw new Error('Un compte avec cette adresse e-mail existe déjà.');
      }
      if (password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
      }

      const salt = createSalt();
      const isFirstAccount = state.accounts.length === 0;
      const account = {
        id: globalThis.crypto.randomUUID(),
        email: normalizedEmail,
        salt,
        passwordHash: await hashPassword(password, salt)
      };
      const accounts = [...state.accounts, account];
      commit('SET_ACCOUNTS', accounts);

      if (isFirstAccount) {
        const legacyReviews = {};
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (!key?.startsWith('cinemoi_review_')) continue;
          const movieId = key.slice('cinemoi_review_'.length);
          const savedReview = readJson(key, null);
          if (savedReview) legacyReviews[movieId] = savedReview;
          localStorage.removeItem(key);
          index -= 1;
        }

        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (!key?.startsWith('cinemoi_rating_')) continue;
          const movieId = key.slice('cinemoi_rating_'.length);
          legacyReviews[movieId] = {
            ...(legacyReviews[movieId] || {}),
            rating: Number(localStorage.getItem(key)),
            text: legacyReviews[movieId]?.text || ''
          };
          localStorage.removeItem(key);
          index -= 1;
        }
        saveJson(`cinemoi_reviews_${account.id}`, legacyReviews);
      }

      // Attribuer à la première inscription l'ancienne bibliothèque anonyme de cette installation.
      const legacyLibrary = readJson(LEGACY_LIBRARY_KEY, []);
      if (accounts.length === 1 && legacyLibrary.length > 0) {
        saveJson(`cinemoi_library_${account.id}`, legacyLibrary);
        localStorage.removeItem(LEGACY_LIBRARY_KEY);
      }

      commit('SET_USER', { user: { id: account.id, email: account.email }, remember: true });
      return state.user;
    },

    async login({ state, commit }, { email, password, remember = true }) {
      const normalizedEmail = email.trim().toLowerCase();
      const account = state.accounts.find(item => item.email === normalizedEmail);
      if (!account || await hashPassword(password, account.salt) !== account.passwordHash) {
        throw new Error('Adresse e-mail ou mot de passe incorrect.');
      }

      commit('SET_USER', { user: { id: account.id, email: account.email }, remember });
      return state.user;
    },

    logout({ commit }) {
      commit('SET_USER', null);
    }
  },

  getters: {
    favorites: state => state.library.filter(movie => movie.isFavorite),
    toWatchMovies: state => state.library.filter(movie => movie.status === 'to-watch'),
    watchedMovies: state => state.library.filter(movie => movie.status === 'watched'),
    isInLibrary: state => movieId => state.library.some(movie => movie.id === movieId)
  }
});
