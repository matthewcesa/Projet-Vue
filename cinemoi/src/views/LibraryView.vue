<template>
  <div class="library-view">
        <div class="library-header">
            <span class="subtitle-tag">VOTRE CINÉMATHÈQUE PERSONNELLE</span>
            <h1>Ma bibliothèque</h1>
        </div>
        <button
          class="stats-toggle"
          type="button"
          :aria-expanded="showStats"
          aria-controls="library-statistics"
          @click="showStats = !showStats"
        >
          <span>{{ showStats ? 'Masquer les statistiques' : 'Afficher les statistiques' }}</span>
          <span class="stats-toggle-icon" :class="{ expanded: showStats }" aria-hidden="true">⌄</span>
        </button>
        <Transition name="stats-slide">
          <div v-if="showStats" id="library-statistics" class="stats-panel">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">{{ library.length }}</div>
                <div class="stat-label">Dans ma collection</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ watchedCount }}</div>
                <div class="stat-label">Films vus</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ remainingCount }}</div>
                <div class="stat-label">Films restants</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ favoritesCount }}</div>
                <div class="stat-label">Favoris</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ averagePersonalRatingLabel }}</div>
                <div class="stat-label">Note personnelle moyenne</div>
                <div class="stat-note">{{ ratedMoviesInfo }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ watchedRuntimeLabel }}</div>
                <div class="stat-label">Temps de visionnage</div>
                <div class="stat-note">{{ watchedRuntimeInfo }}</div>
              </div>
            </div>
          </div>
        </Transition>

    <div class="tabs-row">
        <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: currentTab === tab.id }]"
            @click="selectTab(tab.id)"
        >
            {{ tab.label }} <span class="tab-count">{{ getTabCount(tab.id) }}</span>
        </button>
    </div>

    <div class="filter-toolbar">
      <div class="search-box-container">
        <SearchBar
          v-model="searchQuery"
          placeholder="Rechercher dans ma bibliothèque..."
        />
      </div>
      <label class="sort-control">
        <span>Trier par</span>
        <select v-model="sortBy" aria-label="Trier les films de la bibliothèque">
          <option value="dateAdded">Date d'ajout (plus récent)</option>
          <option value="title">Titre (A à Z)</option>
          <option value="year">Année (plus récent)</option>
        </select>
      </label>
    </div>

    <div class="movies-grid" v-if="filteredLibrary.length > 0">
      <div class="library-movie-card" v-for="movie in filteredLibrary" :key="movie.id" @click="goToDetails(movie.id)">
        <div class="poster-container">
          <img :src="movie.poster" :alt="movie.title" />
          
          <span class="status-badge" :class="movie.status">
            {{ formatStatus(movie.status) }}
          </span>

          <button
            class="remove-movie-button"
            type="button"
            :aria-label="`Supprimer ${movie.title} de la bibliothèque`"
            :title="`Supprimer ${movie.title} de la bibliothèque`"
            @click.stop="removeFromLibrary(movie.id)"
          >
            <span aria-hidden="true">×</span>
          </button>

          <div class="rating">⭐ {{ movie.rating }}</div>
        </div>
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <p>{{ movie.genre || 'Film' }} · {{ movie.year }}</p>
          <p class="movie-runtime">{{ formatMovieRuntime(movie) }}</p>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Aucun film trouvé dans cette section de votre bibliothèque.</p>
    </div>
  </div>
</template>

<script setup>
/* Filtrage : tous, favoris, vus ou à voir. */
/* Barre de recherche de la bibliothèque. */
/* Grille des films filtrés. */
/* Message affiché quand aucun film ne correspond. */

import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { getMovieRuntimeMinutes } from '../services/api.js';
import SearchBar from '../components/SearchBar.vue'

const store = useStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const sortBy = ref('dateAdded');
const showStats = ref(true);
const currentTab = ref(route.name === 'favorites' ? 'favorites' : 'all');

const tabs = [
  { id: 'all', label: 'Tous' },
  { id: 'favorites', label: 'Favoris' },
  { id: 'watched', label: 'Vus' },
  { id: 'to-watch', label: 'À voir' }
];

// Données depuis Vuex
const library = computed(() => store.state.library);

const watchedCount = computed(() => library.value.filter(m => m.status === 'watched').length);
const remainingCount = computed(() => library.value.length - watchedCount.value);
const favoritesCount = computed(() => library.value.filter(m => m.isFavorite).length);
const ratedMovies = computed(() => library.value
  .map(movie => Number(store.state.reviews[movie.id]?.rating ?? movie.personalRating))
  .filter(rating => Number.isFinite(rating) && rating >= 1 && rating <= 5)
);
const averagePersonalRating = computed(() => ratedMovies.value.length
  ? ratedMovies.value.reduce((total, rating) => total + rating, 0) / ratedMovies.value.length
  : null
);
const averagePersonalRatingLabel = computed(() => averagePersonalRating.value === null
  ? '—'
  : `${averagePersonalRating.value.toFixed(1)} / 5`
);
const ratedMoviesInfo = computed(() =>
  `${ratedMovies.value.length} film${ratedMovies.value.length === 1 ? '' : 's'} noté${ratedMovies.value.length === 1 ? '' : 's'}`
);
const watchedRuntimeEntries = computed(() => library.value
  .filter(movie => movie.status === 'watched')
  .map(movie => getRuntimeMinutes(movie))
);
const knownWatchedRuntimeMinutes = computed(() => watchedRuntimeEntries.value
  .filter(runtime => runtime !== null)
  .reduce((total, runtime) => total + runtime, 0)
);
const knownWatchedRuntimeCount = computed(() =>
  watchedRuntimeEntries.value.filter(runtime => runtime !== null).length
);
const watchedRuntimeLabel = computed(() => {
  if (watchedCount.value > 0 && knownWatchedRuntimeCount.value === 0) {
    return 'Indisponible';
  }

  const hours = Math.floor(knownWatchedRuntimeMinutes.value / 60);
  const minutes = knownWatchedRuntimeMinutes.value % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
});
const watchedRuntimeInfo = computed(() => {
  if (watchedCount.value === 0) return 'Aucun film vu pour le moment';
  if (knownWatchedRuntimeCount.value < watchedCount.value) {
    return `Durée connue pour ${knownWatchedRuntimeCount.value}/${watchedCount.value} films vus`;
  }
  return 'Durée totale des films marqués vus';
});

function getRuntimeMinutes(movie) {
  const runtimeMinutes = Number(movie.runtimeMinutes);
  if (Number.isFinite(runtimeMinutes) && runtimeMinutes > 0) {
    return runtimeMinutes;
  }

  if (typeof movie.runtime !== 'string') return null;

  const match = movie.runtime.match(/^\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*min)?\s*$/i);
  if (!match || (!match[1] && !match[2])) return null;

  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
}

function formatMovieRuntime(movie) {
  const runtime = getRuntimeMinutes(movie);
  if (runtime === null) return 'Durée inconnue';

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

watch(
  () => library.value.map(movie => movie.id).join(','),
  async () => {
    const moviesMissingRuntime = library.value.filter(movie => getRuntimeMinutes(movie) === null);
    const runtimes = await Promise.all(moviesMissingRuntime.map(async movie => ({
      movieId: movie.id,
      runtimeMinutes: await getMovieRuntimeMinutes(movie.id)
    })));

    runtimes.forEach(({ movieId, runtimeMinutes }) => {
      if (runtimeMinutes === null) return;

      const movie = library.value.find(item => item.id === movieId);
      if (!movie || getRuntimeMinutes(movie) !== null) return;

      store.commit('ADD_TO_LIBRARY', {
        movie: { ...movie, runtimeMinutes },
        status: movie.status
      });
    });
  },
  { immediate: true }
);

const getTabCount = (tabId) => {
  if (tabId === 'all') return library.value.length;
  if (tabId === 'favorites') return library.value.filter(m => m.isFavorite).length;
  if (tabId === 'watched') return library.value.filter(m => m.status === 'watched').length;
  if (tabId === 'to-watch') return library.value.filter(m => m.status === 'to-watch').length;
  return 0;
};

// Filtrage dynamique (Onglets + Recherche locale)
const filteredLibrary = computed(() => {
  let result = currentTab.value === 'favorites'
    ? store.getters.favorites
    : library.value;

  if (currentTab.value === 'watched') {
    result = result.filter(m => m.status === 'watched');
  } else if (currentTab.value === 'to-watch') {
    result = result.filter(m => m.status === 'to-watch');
  }

  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(m => m.title.toLowerCase().includes(query));
  }

  return [...result].sort((first, second) => {
    if (sortBy.value === 'title') {
      return first.title.localeCompare(second.title, 'fr', { sensitivity: 'base' });
    }

    if (sortBy.value === 'year') {
      return (Number.parseInt(second.year, 10) || 0) - (Number.parseInt(first.year, 10) || 0);
    }

    return (Date.parse(second.dateAdded) || 0) - (Date.parse(first.dateAdded) || 0);
  });
});

const selectTab = (tabId) => {
  currentTab.value = tabId;

  if (tabId === 'favorites' && route.name !== 'favorites') {
    router.push({ name: 'favorites' });
  } else if (tabId !== 'favorites' && route.name === 'favorites') {
    router.push({ name: 'library' });
  }
};

watch(() => route.name, (name) => {
  if (name === 'favorites') {
    currentTab.value = 'favorites';
  } else if (name === 'library') {
    currentTab.value = 'all';
  }
});

const formatStatus = (status) => {
  if (status === 'watched') return 'Vu';
  if (status === 'to-watch') return 'À voir';
  return 'Film';
};

const goToDetails = (id) => {
  router.push({ name: 'details', params: { id } });
};

const removeFromLibrary = (movieId) => {
  const movie = library.value.find(item => item.id === movieId);
  if (!movie) return;

  const confirmed = window.confirm(`Supprimer « ${movie.title} » de votre bibliothèque ?`);
  if (!confirmed) return;

  store.commit('REMOVE_FROM_LIBRARY', movieId);
  store.commit('SHOW_NOTIFICATION', `${movie.title} a été supprimé de votre bibliothèque.`);
};
</script>

<style scoped>
.library-view {
  background-color: #fcf9f2;
  min-height: 100vh;
  padding: 3rem 4rem;
  color: #1a1a1a;
  width: 100%;
}

.library-header .subtitle-tag {
  font-size: 0.75rem;
  font-weight: bold;
  color: #b85d38;
  letter-spacing: 1px;
}

.library-header h1 {
  font-size: 2.8rem;
  font-family: serif;
  margin-top: 0.3rem;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  padding-bottom: 2.5rem;
}

.stats-toggle {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: -1rem 0 1.25rem;
  padding: 0.45rem 0;
  border: 0;
  background: transparent;
  color: #8f4528;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.stats-toggle:hover {
  color: #b85d38;
}

.stats-toggle:focus-visible {
  outline: 2px solid #b85d38;
  outline-offset: 3px;
}

.stats-toggle-icon {
  display: inline-block;
  font-size: 1.2rem;
  line-height: 1;
  transition: transform 0.25s ease;
}

.stats-toggle-icon.expanded {
  transform: rotate(180deg);
}

.stats-slide-enter-active,
.stats-slide-leave-active {
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.25s ease, transform 0.3s ease;
}

.stats-slide-enter-from,
.stats-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}

.stats-slide-enter-to,
.stats-slide-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .stats-slide-enter-active,
  .stats-slide-leave-active,
  .stats-toggle-icon {
    transition-duration: 0.01ms;
  }
}

.stat-card {
  background-color: #f3efe6;
  border: 1px solid #e2ded3;
  padding: 1.5rem;
  border-radius: 12px;
}

.stat-number {
  font-size: 2rem;
  font-family: serif;
  font-weight: bold;
  color: #1a1a1a;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.2rem;
}

.stat-note {
  margin-top: 0.35rem;
  color: #817a74;
  font-size: 0.72rem;
  line-height: 1.35;
}

.tabs-row {
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid #e2ded3;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #777;
  cursor: pointer;
  padding-bottom: 0.5rem;
  position: relative;
}

.tab-btn.active {
  color: #1a1a1a;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #b85d38;
}

.tab-count {
  font-size: 0.75rem;
  background: #e2ded3;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

.filter-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  border-radius: 8px;
  border: 1px solid #dcd6c8;
  background-color: #fff;
  outline: none;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.library-movie-card {
  cursor: pointer;
}

.poster-container {
  position: relative;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.poster-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-movie-button {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font: inherit;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.remove-movie-button:hover {
  border-color: #b85d38;
  background: #b85d38;
}

.remove-movie-button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 10px;
  font-size: 0.75rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.status-badge.watched {
  background-color: #1a1a1a;
  color: #fff;
}

.status-badge.to-watch {
  background-color: #b85d38;
  color: #fff;
}

.rating {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #ffc107;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.movie-info {
  margin-top: 0.5rem;
}

.movie-info h3 {
  font-size: 1rem;
  font-family: serif;
  margin-bottom: 0.2rem;
}

.movie-info p {
  font-size: 0.8rem;
  color: #666;
}

.movie-info .movie-runtime {
  margin-top: 0.2rem;
  color: #8a8178;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-style: italic;
}

.filter-toolbar {
  margin-bottom: 2rem;
}

.search-box-container {
  max-width: 400px;
  flex: 1;
}

.sort-control {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #666;
  font-size: 0.8rem;
}

.sort-control select {
  min-height: 42px;
  padding: 0.6rem 0.8rem;
  border: 1px solid #dcd6c8;
  border-radius: 8px;
  background: #fff;
  color: #1a1a1a;
  font: inherit;
  cursor: pointer;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-box-container {
    max-width: none;
  }
}

@media (min-width: 601px) and (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>