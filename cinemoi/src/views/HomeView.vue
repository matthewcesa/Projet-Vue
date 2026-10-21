<template>
  <div class="home-view">
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-left">
          <span class="films-count">12 846 FILMS DISPONIBLES</span>
          <h1>Quel film vous fera vibrer ce soir ?</h1>
          
          <div class="hero-search">
            <SearchBar
              v-model="searchQuery"
              placeholder="Rechercher un titre, un cinéaste, un acteur..."
              shortcut="⌘ K"
              @update:model-value="handleSearch"
            />
          </div>
        </div>
      </div>
    </div>


    <section class="movies-section">
      <div class="section-header">
        <div>
          <span class="subtitle-tag">SÉLECTION TMDB</span>
          <h2>{{ sectionTitle }}</h2>
        </div>
        <router-link to="/lists" class="see-all-link">Voir tous les films →</router-link>
      </div>


      <p v-if="loadingMovies" class="no-results" role="status">Chargement des films...</p>
      <p v-else-if="apiError" class="no-results" role="alert">{{ apiError }}</p>

      <div v-else-if="movies.length" class="movies-grid">
        <MovieCard 
          v-for="movie in movies" 
          :key="movie.id" 
          :movie="movie"
        />
      </div>


      <p v-else class="no-results">
        {{ searchQuery.trim().length > 2 ? 'Aucun film trouvé pour cette recherche.' : 'Aucun film disponible.' }}
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SearchBar from '../components/SearchBar.vue';
import MovieCard from '../components/MovieCards.vue';
import { getTopRatedMovies, searchMovies } from '../services/api.js';

const searchQuery = ref('');
const movies = ref([]);
const topRatedMovies = ref([]);
const loadingMovies = ref(true);
const apiError = ref('');
const sectionTitle = computed(() => searchQuery.value.trim().length > 2
  ? 'Résultats de recherche'
  : 'Les 20 films les mieux notés');
let searchRequestId = 0;

onMounted(async () => {
  topRatedMovies.value = await getTopRatedMovies();
  movies.value = topRatedMovies.value;
  loadingMovies.value = false;
  if (movies.value.length === 0) {
    apiError.value = 'Impossible de charger les films. Vérifie ta connexion à TMDB.';
  }
});

const handleSearch = async (query = searchQuery.value) => {
  const currentRequestId = ++searchRequestId;
  apiError.value = '';

  if (query.trim().length > 2) {
    loadingMovies.value = true;
    const results = await searchMovies(query);
    if (currentRequestId !== searchRequestId) return;

    movies.value = results;
    loadingMovies.value = false;
    if (results.length === 0) {
      apiError.value = 'Aucun résultat trouvé pour cette recherche.';
    }
  } else {
    movies.value = topRatedMovies.value;
    loadingMovies.value = false;
  }
};

</script>

<style scoped>
.home-view {
  background-color: #fcf9f2;
  min-height: 100vh;
  padding-bottom: 4rem;
  color: #1a1a1a;
}

.hero-banner {
  background:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)),
    url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop') center/cover;
  padding: 4rem 3rem;
  color: white;
}

.hero-content {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.hero-left {
  flex: 1;
}

.films-count {
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: #f7f3e8;
  font-weight: bold;
}

.hero-left h1 {
  font-size: 2.8rem;
  font-family: serif;
  margin: 0.8rem 0 1.5rem;
  line-height: 1.2;
}

.hero-card-right {
  background: rgba(28, 28, 28, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  max-width: 350px;
}

.selection-tag {
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: #b85d38;
  font-weight: bold;
}

.hero-card-right h2 {
  font-size: 1.4rem;
  font-family: serif;
  margin: 0.5rem 0;
}

.hero-card-right p {
  font-size: 0.9rem;
  color: #ccc;
  line-height: 1.4;
}

.movies-section {
  max-width: 1300px;
  margin: 3rem auto 0;
  padding: 0 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.subtitle-tag {
  font-size: 0.75rem;
  font-weight: bold;
  color: #b85d38;
  letter-spacing: 1px;
}

.section-header h2 {
  font-size: 2rem;
  font-family: serif;
  color: #1a1a1a;
  margin-top: 0.2rem;
}

.see-all-link {
  color: #b85d38;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.95rem;
}

.filters-row {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.filter-pill {
  background-color: transparent;
  border: 1px solid #dcd6c8;
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-pill:hover,
.filter-pill.active {
  background-color: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}

.movies-grid {
  display: grid;
  grid-auto-columns: minmax(210px, 240px);
  grid-auto-flow: column;
  gap: 2rem;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  padding: 0 0 1rem;
  scroll-snap-type: inline mandatory;
  scrollbar-color: #b85d38 #e2ded3;
  scrollbar-width: thin;
}

.movies-grid > * {
  scroll-snap-align: start;
}

.no-results {
  margin-top: 2rem;
  color: #666;
  font-style: italic;
}

@media (max-width: 900px) {
  .hero-banner {
    padding: 3rem 1.5rem;
  }

  .hero-content {
    align-items: stretch;
    flex-direction: column;
    gap: 1.5rem;
  }

  .hero-left {
    width: 100%;
  }

  .hero-left h1 {
    max-width: 16ch;
    font-size: clamp(2rem, 6vw, 2.6rem);
  }

  .hero-search,
  .hero-search :deep(.search-container) {
    width: 100%;
    max-width: none;
  }

  .hero-card-right {
    max-width: none;
  }

  .movies-section {
    margin-top: 2.25rem;
    padding: 0 1.5rem;
  }

  .movies-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-auto-columns: unset;
    grid-auto-flow: row;
    gap: 1.25rem;
    overflow: visible;
    scroll-snap-type: none;
  }
}

@media (max-width: 600px) {
  .hero-banner {
    padding: 2.25rem 1rem;
    background-position: center;
  }

  .hero-content {
    gap: 1.25rem;
  }

  .films-count {
    font-size: 0.68rem;
  }

  .hero-left h1 {
    max-width: 14ch;
    margin: 0.65rem 0 1.1rem;
    font-size: clamp(1.8rem, 8vw, 2.25rem);
    line-height: 1.12;
  }

  .hero-search :deep(.search-container input) {
    min-width: 0;
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
  }

  .hero-search :deep(.kbd-shortcut) {
    display: none;
  }

  .hero-card-right {
    padding: 1.15rem;
    border-radius: 12px;
  }

  .hero-card-right h2 {
    font-size: 1.2rem;
  }

  .hero-card-right p {
    font-size: 0.82rem;
  }

  .movies-section {
    margin-top: 1.75rem;
    padding: 0 1rem;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.65rem;
    margin-bottom: 1.1rem;
  }

  .section-header h2 {
    font-size: clamp(1.45rem, 6vw, 1.8rem);
    line-height: 1.15;
  }

  .see-all-link {
    font-size: 0.85rem;
  }

  .movies-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 0.75rem;
  }
}

@media (max-width: 360px) {
  .movies-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>