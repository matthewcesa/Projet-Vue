<template>
    <div class="details-view" v-if="movie">
        <div class="backdrop" :style="{ backgroundImage: `url(${movie.backdrop})` }">
            <div class="overlay">
                <button class="back-btn" @click="$router.go(-1)">← Retour</button>
            </div>
        </div>

        <div class="content-container">
            <img :src="movie.poster" :alt="movie.title" class="details-poster" />
            
            <div class="details-info">
                <h1>{{ movie.title }}</h1>
                <p class="meta">{{ movie.genres }} · {{ movie.year }} · {{ movie.runtime }}</p>
                
                <div class="rating-badge">
                    ⭐ {{ movie.rating }} / 10
                </div>

                <h3>Synopsis</h3>
                <p class="overview">{{ movie.overview }}</p>

                <div class="actions">
                    <button class="btn-primary" @click="updateStatus('to-watch')"> Ajouter à "À voir"</button>
                    <button class="btn-secondary" @click="updateStatus('watched')">Marquer comme "Vu"</button>
                </div>
            </div>
        </div>
    </div>
  <div v-else class="loading">
    Chargement des détails...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getMovieDetails } from '../services/api';
import { useStore } from 'vuex';

const route = useRoute();
const movie = ref(null);
const store = useStore();

onMounted(async () => {
  const movieId = route.params.id;
  movie.value = await getMovieDetails(movieId);
});
/*
const addToLibrary = () => {
  console.log("Ajouté :", movie.value.title);
};

const toggleFavorite = () => {
  console.log("Favori :", movie.value.title);
};
*/
const updateStatus = (status) => {
  if (!movie.value) return;
  
  store.commit('ADD_TO_LIBRARY', { 
    movie: movie.value, 
    status: status 
  });
  
  alert(`Film enregistré dans votre bibliothèque (${status === 'watched' ? 'Vu' : 'À voir'}) !`);
};
</script>

<style scoped>
.details-view {
  background-color: #fcf9f2;
  min-height: 100vh;
  color: #1a1a1a;
  padding-bottom: 4rem;
}

.backdrop {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.overlay {
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(252,249,242,1));
  height: 100%;
  padding: 2rem 3rem;
}

.back-btn {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  backdrop-filter: blur(4px);
}

.content-container {
  max-width: 1100px;
  margin: -100px auto 0 auto;
  display: flex;
  gap: 3rem;
  padding: 0 3rem;
  position: relative;
  z-index: 2;
}

.details-poster {
  width: 300px;
  height: 450px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.details-info {
  flex: 1;
  padding-top: 2rem;
}

.details-info h1 {
  font-size: 2.5rem;
  font-family: serif;
  margin-bottom: 0.5rem;
}

.meta {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.rating-badge {
  display: inline-block;
  background: #1a1a1a;
  color: #ffc107;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.details-info h3 {
  font-size: 1.2rem;
  font-family: serif;
  margin-bottom: 0.5rem;
}

.overview {
  color: #444;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background-color: #b85d38;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
}

.btn-secondary {
  background-color: transparent;
  color: #1a1a1a;
  border: 1px solid #1a1a1a;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 5rem;
  font-size: 1.2rem;
  color: #666;
}
</style>