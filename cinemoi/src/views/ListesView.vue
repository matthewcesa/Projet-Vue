<template>
  <section class="catalogue-view">
    <header class="catalogue-header">
      <div>
        <span class="subtitle-tag">CINÉMOI · CATALOGUE</span>
        <h1>{{ catalogueTitle }}</h1>
      </div>
      <p v-if="!loading && movies.length">{{ movies.length }} films</p>
    </header>

    <div class="catalogue-search-wrapper">
      <SearchBar
        v-model="searchQuery"
        placeholder="Titre, acteur, réalisateur, genre, année (ex: 2014)..."
        @submit="runSearch" 
      />
      <p class="search-hint">Exemples : Interstellar, Christopher Nolan, Action, 2014 (Appuie sur Entrée)</p>
    </div>

    <div class="genres-row" aria-label="Filtrer le catalogue par genre">
      <button
        type="button"
        :class="['genre-filter', { active: selectedGenreId === null }]"
        :aria-pressed="selectedGenreId === null"
        @click="selectGenre(null)"
      >
        Tous
      </button>
      <button
        v-for="genre in genres"
        :key="genre.id"
        type="button"
        :class="['genre-filter', { active: selectedGenreId === genre.id }]"
        :aria-pressed="selectedGenreId === genre.id"
        @click="selectGenre(genre.id)"
      >
        {{ genre.name }}
      </button>
    </div>

    <p v-if="loading" class="catalogue-message">Chargement des films...</p>
    <p v-else-if="error" class="catalogue-message" role="alert">{{ error }}</p>
    <div v-else-if="movies.length" class="movies-grid">
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
      />
    </div>
    <p v-else class="catalogue-message">Aucun film n’a été trouvé.</p>

    <button
      v-if="!loading && hasMore"
      class="load-more-button"
      type="button"
      :disabled="loadingMore"
      @click="loadMoreMovies"
    >
      {{ loadingMore ? 'Chargement...' : 'Afficher plus de films' }}
    </button>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import MovieCard from '../components/MovieCards.vue';
import { getMovieGenres, searchCatalogue } from '../services/api.js';
import SearchBar from '../components/SearchBar.vue';

const movies = ref([]);
const genres = ref([]);
const searchQuery = ref('');
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const page = ref(1);
const totalPages = ref(500);
const selectedGenreId = ref(null);
const selectedGenreName = ref('');
const error = ref('');
let requestId = 0;

const catalogueTitle = computed(() => {
  if (searchQuery.value.trim()) return `Résultats : ${searchQuery.value.trim()}`;
  return selectedGenreName.value ? `Films : ${selectedGenreName.value}` : 'Tous les films populaires';
});

onMounted(async () => {
  const [movieGenres] = await Promise.all([getMovieGenres()]);
  genres.value = movieGenres;
  await runSearch();
});

const selectGenre = async (genreId) => {
  selectedGenreId.value = genreId;
  selectedGenreName.value = genres.value.find(genre => genre.id === genreId)?.name || '';
  await runSearch();
};

// Fonction de recherche propre qui utilise searchCatalogue
const runSearch = async () => {
  page.value = 1;
  hasMore.value = false;
  error.value = '';
  loading.value = true;
  const currentRequestId = ++requestId;

  const result = await searchCatalogue({
    query: searchQuery.value,
    genreId: selectedGenreId.value,
    genres: genres.value,
    page: page.value
  });

  if (currentRequestId !== requestId) return;

  movies.value = result.movies;
  totalPages.value = result.totalPages;
  hasMore.value = page.value < totalPages.value;
  loading.value = false;

  if (result.error) {
    error.value = 'La recherche a échoué. Vérifie ta connexion puis réessaie.';
  } else if (movies.value.length === 0) {
    error.value = 'Aucun résultat trouvé. Essaie un autre titre, nom, genre ou année.';
  }
};

const loadMoreMovies = async () => {
  if (loadingMore.value || loading.value || !hasMore.value) return;

  loadingMore.value = true;
  const nextPage = page.value + 1;
  const currentRequestId = ++requestId;
  const nextResult = await searchCatalogue({
    query: searchQuery.value,
    genreId: selectedGenreId.value,
    genres: genres.value,
    page: nextPage
  });

  if (currentRequestId !== requestId) return;

  movies.value.push(...nextResult.movies);
  page.value = nextPage;
  totalPages.value = nextResult.totalPages;
  hasMore.value = nextResult.movies.length === 20 && page.value < totalPages.value;
  if (nextResult.error) error.value = 'Impossible de charger plus de résultats.';
  loadingMore.value = false;
};
</script>

<style scoped>
/* Conserve exactement tes styles actuels */
.catalogue-view {
  min-height: calc(100vh - 70px);
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem clamp(1.25rem, 5vw, 4rem);
  background-color: #fcf9f2;
  color: #1a1a1a;
}

.catalogue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.subtitle-tag {
  color: #b85d38;
  font-size: 0.75rem;
  font-weight: bold;
}

h1 {
  margin-top: 0.3rem;
  font-family: serif;
  font-size: 2.8rem;
}

.catalogue-header p,
.catalogue-message {
  color: #666;
}

.catalogue-search-wrapper {
  max-width: 760px;
  margin-bottom: 1.5rem;
}

.search-hint {
  margin-top: 0.4rem;
  color: #817a74;
  font-size: 0.72rem;
}

.genres-row {
  display: flex;
  gap: 0.65rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.55rem;
  scrollbar-color: #b85d38 #e2ded3;
  scrollbar-width: thin;
}

.genre-filter {
  flex: 0 0 auto;
  padding: 0.5rem 0.9rem;
  border: 1px solid #dcd6c8;
  background: transparent;
  color: #555;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.genre-filter:hover,
.genre-filter.active {
  border-color: #1a1a1a;
  background: #1a1a1a;
  color: #fff;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
}

.catalogue-message {
  padding: 2rem 0;
}

.load-more-button {
  display: block;
  margin: 2.5rem auto 0;
  padding: 0.8rem 1.25rem;
  border: 1px solid #b85d38;
  background: transparent;
  color: #8f4528;
  font: inherit;
  cursor: pointer;
}

.load-more-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

@media (max-width: 600px) {
  .catalogue-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>