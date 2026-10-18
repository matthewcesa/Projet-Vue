<template>
  <section class="catalogue-view">
    <header class="catalogue-header">
      <div>
        <span class="subtitle-tag">CINÉMOI · CATALOGUE</span>
        <h1>Tous les films</h1>
      </div>
      <p v-if="!loading && movies.length">{{ movies.length }} films</p>
    </header>

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
import { onMounted, ref } from 'vue';
import MovieCard from '../components/MovieCards.vue';
import { getPopularMovies } from '../services/api.js';

const movies = ref([]);
const loading = ref(true);
const loadingMore = ref(false);
const hasMore = ref(true);
const page = ref(1);
const error = ref('');

onMounted(async () => {
  movies.value = await getPopularMovies(page.value);
  if (movies.value.length === 0) {
    error.value = 'Impossible de charger les films. Vérifie la connexion à l’API.';
    hasMore.value = false;
  } else if (movies.value.length < 20) {
    hasMore.value = false;
  }
  loading.value = false;
});

const loadMoreMovies = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  const nextPage = page.value + 1;
  const nextMovies = await getPopularMovies(nextPage);

  movies.value.push(...nextMovies);
  page.value = nextPage;
  hasMore.value = nextMovies.length === 20 && nextPage < 500;
  loadingMore.value = false;
};
</script>

<style scoped>
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