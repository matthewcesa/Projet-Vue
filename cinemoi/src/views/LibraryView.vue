<template>
  <div class="library-view">
        <div class="library-header">
            <span class="subtitle-tag">VOTRE CINÉMATHÈQUE PERSONNELLE</span>
            <h1>Ma bibliothèque</h1>
        </div>
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
                <div class="stat-number">{{ favoritesCount }}</div>
                <div class="stat-label">Favoris</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">-- h</div>
                <div class="stat-label">Temps de cinéma</div>
            </div>
        </div>

    <!-- filtrage (all, favorites, watched, to watch) -->
    <div class="tabs-row">
        <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
        >
            {{ tab.label }} <span class="tab-count">{{ getTabCount(tab.id) }}</span>
        </button>
    </div>

    <!-- barre de recherche-->
    <div class="filter-toolbar">
    <div class="search-box-container">
      <SearchBar 
        v-model="searchQuery" 
        placeholder="Rechercher dans ma bibliothèque..."
      />
    </div>
  </div>

    <!--grille des films -->
    <div class="movies-grid" v-if="filteredLibrary.length > 0">
      <div class="library-movie-card" v-for="movie in filteredLibrary" :key="movie.id" @click="goToDetails(movie.id)">
        <div class="poster-container">
          <img :src="movie.poster" :alt="movie.title" />
          
          <span class="status-badge" :class="movie.status">
            {{ formatStatus(movie.status) }}
          </span>

          <div class="rating">⭐ {{ movie.rating }}</div>
        </div>
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <p>{{ movie.genre || 'Film' }} · {{ movie.year }}</p>
        </div>
      </div>
    </div>

    <!-- message si pas de films /vide -->
    <div v-else class="empty-state">
      <p>Aucun film trouvé dans cette section de votre bibliothèque.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import SearchBar from '../components/SearchBar.vue'

const store = useStore();
const router = useRouter();

const searchQuery = ref('');
const currentTab = ref('all');

const tabs = [
  { id: 'all', label: 'Tous' },
  { id: 'favorites', label: 'Favoris' },
  { id: 'watched', label: 'Vus' },
  { id: 'to-watch', label: 'À voir' }
];

// Données depuis Vuex
const library = computed(() => store.state.library);

const watchedCount = computed(() => library.value.filter(m => m.status === 'watched').length);
const favoritesCount = computed(() => library.value.filter(m => m.isFavorite).length);

const getTabCount = (tabId) => {
  if (tabId === 'all') return library.value.length;
  if (tabId === 'favorites') return library.value.filter(m => m.isFavorite).length;
  if (tabId === 'watched') return library.value.filter(m => m.status === 'watched').length;
  if (tabId === 'to-watch') return library.value.filter(m => m.status === 'to-watch').length;
  return 0;
};

// Filtrage dynamique (Onglets + Recherche locale)
const filteredLibrary = computed(() => {
  let result = library.value;

  if (currentTab.value === 'favorites') {
    result = result.filter(m => m.isFavorite);
  } else if (currentTab.value === 'watched') {
    result = result.filter(m => m.status === 'watched');
  } else if (currentTab.value === 'to-watch') {
    result = result.filter(m => m.status === 'to-watch');
  }

  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(m => m.title.toLowerCase().includes(query));
  }

  return result;
});

const formatStatus = (status) => {
  if (status === 'watched') return 'Vu';
  if (status === 'to-watch') return 'À voir';
  return 'Film';
};

const goToDetails = (id) => {
  router.push({ name: 'details', params: { id } });
};
</script>

<style scoped>
.library-view {
  background-color: #fcf9f2;
  min-height: 100vh;
  padding: 3rem 4rem;
  color: #1a1a1a;
  max-width: 1400px;
  margin: 0 auto;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
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
}
</style>