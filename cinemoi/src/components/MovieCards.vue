<template>
    <div class="movie-card">
      <div class="poster-container">
        <img :src="movie.poster" :alt="movie.title" @click="goToDetails" />
        
        <button
          class="favorite-btn"
          :class="{ 'is-favorite': isFavorite }"
          type="button"
          :aria-label="isFavorite ? `Retirer ${movie.title} des favoris` : `Ajouter ${movie.title} aux favoris`"
          :aria-pressed="isFavorite"
          @click.stop="toggleFav"
        >
          {{ isFavorite ? '♥' : '♡' }}
        </button>

        <button
          class="add-btn"
          :class="{ 'already-added': isInLibrary }"
          type="button"
          :disabled="isInLibrary || isAdding"
          :aria-label="isInLibrary ? `${movie.title} est dans votre bibliothèque` : `Ajouter ${movie.title} à votre bibliothèque`"
          :title="isInLibrary ? 'Déjà dans votre bibliothèque' : 'Ajouter à ma bibliothèque'"
          @click.stop="quickAddToLibrary"
        >
          {{ isInLibrary ? '✓' : isAdding ? '…' : '+' }}
        </button>
        
        <div class="rating">{{ movie.rating }}</div>
      </div>
      <div class="movie-info" @click="goToDetails">
        <h3>{{ movie.title }}</h3>
        <p>{{ movie.genre }} · {{ movie.year }} · {{ runtimeLabel }}</p>
      </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getMovieRuntimeMinutes } from '../services/api.js';

const props = defineProps({
  movie: { type: Object, required: true }
});

const store = useStore();
const router = useRouter();
const isInLibrary = computed(() => store.getters.isInLibrary(props.movie.id));
const isFavorite = computed(() =>
  store.state.library.some(item => item.id === props.movie.id && item.isFavorite)
);
const runtimeMinutes = ref(props.movie.runtimeMinutes || null);
const isAdding = ref(false);

watch(() => props.movie.id, async (movieId) => {
  runtimeMinutes.value = props.movie.runtimeMinutes || null;
  if (runtimeMinutes.value) return;

  const fetchedRuntime = await getMovieRuntimeMinutes(movieId);
  if (props.movie.id === movieId) {
    runtimeMinutes.value = fetchedRuntime;
  }
}, { immediate: true });

const runtimeLabel = computed(() => {
  if (!runtimeMinutes.value) return 'Durée inconnue';

  const hours = Math.floor(runtimeMinutes.value / 60);
  const minutes = runtimeMinutes.value % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
});

const quickAddToLibrary = async () => {
  if (isInLibrary.value || isAdding.value) return;
  isAdding.value = true;

  try {
    if (!runtimeMinutes.value) {
      runtimeMinutes.value = await getMovieRuntimeMinutes(props.movie.id);
    }

    const movieToAdd = {
      ...props.movie,
      runtimeMinutes: runtimeMinutes.value
    };
    store.commit('ADD_TO_LIBRARY', {
      movie: movieToAdd,
      status: 'to-watch'
    });
    store.commit('SHOW_NOTIFICATION', `${props.movie.title} a été ajouté à votre bibliothèque.`);
  } finally {
    isAdding.value = false;
  }
};

const toggleFav = async () => {
  const alreadyInLibrary = store.getters.isInLibrary(props.movie.id);
  let movieToToggle = props.movie;

  if (!alreadyInLibrary && !runtimeMinutes.value) {
    runtimeMinutes.value = await getMovieRuntimeMinutes(props.movie.id);
  }
  if (!alreadyInLibrary) {
    movieToToggle = { ...props.movie, runtimeMinutes: runtimeMinutes.value };
  }

  store.commit('TOGGLE_FAVORITE', movieToToggle);
  if (!alreadyInLibrary) {
    store.commit('SHOW_NOTIFICATION', `${props.movie.title} a été ajouté à votre bibliothèque et à vos favoris.`);
  }
};

const goToDetails = () => {
  router.push({ name: 'details', params: { id: props.movie.id } });
};
</script>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.poster-container {
  position: relative;
  width: 100%;
  height: 340px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  background-color: #111;
}

.poster-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .poster-container img {
  transform: scale(1.03);
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: #f7f3e8;
  color: #1a1a1a;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 20px;
}

.favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

.favorite-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  color: #e50914;
}

.favorite-btn.is-favorite {
  color: #e50914;
}

.favorite-btn.is-favorite:hover {
  color: #ff4b55;
}

.add-btn {
  position: absolute;
  bottom: 14px;
  right: 14px;
  background-color: #b85d38; 
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(184, 93, 56, 0.4);
  transition: transform 0.2s, background-color 0.2s;
}

.add-btn:hover {
  background-color: #a04f2f;
  transform: scale(1.05);
}

.add-btn:disabled {
  cursor: default;
}

.add-btn:disabled:hover {
  transform: none;
}

.add-btn.already-added {
  background-color: #35764a;
  box-shadow: 0 4px 10px rgba(53, 118, 74, 0.35);
}

.rating {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #ffc107;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  backdrop-filter: blur(4px);
}

.movie-info {
  padding-top: 0.8rem;
}

.movie-info h3 {
  font-size: 1.05rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 0.2rem;
  font-family: serif;
}

.movie-info p {
  color: #666;
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  .poster-container {
    height: auto;
    aspect-ratio: 2 / 3;
    border-radius: 11px;
  }

  .movie-info {
    padding-top: 0.55rem;
  }

  .movie-info h3 {
    display: -webkit-box;
    overflow: hidden;
    font-size: 0.92rem;
    line-height: 1.25;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .movie-info p {
    font-size: 0.72rem;
    line-height: 1.35;
  }

  .favorite-btn {
    top: 8px;
    right: 8px;
    width: 30px;
    height: 30px;
  }

  .add-btn {
    right: 8px;
    bottom: 8px;
    width: 32px;
    height: 32px;
  }

  .rating {
    bottom: 8px;
    left: 8px;
    font-size: 0.7rem;
  }
}
</style>