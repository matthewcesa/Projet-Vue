<template>
  <div v-if="movie" class="details-view">
    <section class="film-hero" :style="{ '--backdrop-image': `url(${movie.backdrop})` }">
      <div class="film-hero-inner">
        <button class="back-btn" type="button" @click="$router.go(-1)">← Retour</button>

        <div class="hero-layout">
          <img :src="movie.poster" :alt="movie.title" class="details-poster" />

          <div class="details-info">
            <p class="availability"><span></span> DISPONIBLE EN STREAMING</p>
            <h1>{{ movie.title }}</h1>
            <p v-if="movie.originalTitle" class="original-title">{{ movie.originalTitle }} · {{ movie.year }}</p>
            <p class="meta">{{ movie.genres }} · {{ movie.runtime }} <span class="age-rating">12+</span></p>

            <div class="personal-rating" aria-label="Votre note personnelle sur cinq">
              <span>Ma note</span>
              <div class="rating-stars">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  :aria-label="`Noter ${star} sur 5`"
                  :aria-pressed="personalRating === star"
                  @click="savePersonalRating(star)"
                >{{ star <= personalRating ? '★' : '☆' }}</button>
              </div>
              <span class="rating-value">{{ personalRating ? `${personalRating} / 5` : 'Pas encore noté' }}</span>
            </div>

            <div class="actions">
              <!-- TODO: garder le style du cœur synchronisé avec l'état favori (rouge si actif, blanc sinon). -->
              <button
                class="btn-secondary"
                type="button"
                :aria-pressed="isFavorite"
                @click="toggleFavorite"
              >
                <span aria-hidden="true">{{ isFavorite ? '♥' : '♡' }}</span> Favori
              </button>
              <button class="btn-secondary" type="button" @click="updateStatus('watched')">
                <span aria-hidden="true">✓</span> Marquer comme vu
              </button>
            </div>
          </div>

          <form class="review-panel" @submit.prevent="saveReview">
            <h2>Votre critique</h2>
            <p>Gardez une trace de ce que ce film vous a fait ressentir.</p>
            <textarea
              v-model="reviewText"
              maxlength="1000"
              placeholder="Votre avis sur ce film..."
              aria-label="Votre critique du film"
            ></textarea>
            <div class="review-footer">
              <span>{{ reviewText.length }} / 1000</span>
              <button class="review-save-button" type="submit">Enregistrer</button>
            </div>
            <p v-if="reviewSaved" class="saved-message" role="status">Critique enregistrée</p>
          </form>
        </div>
      </div>
    </section>

    <section class="details-lower">
      <div class="synopsis-column">
        <span class="section-kicker">L’HISTOIRE</span>
        <h2>Synopsis</h2>
        <p class="overview">{{ movie.overview }}</p>
        <div class="film-facts">
          <div>
            <span>Réalisation</span>
            <strong>{{ movie.director || 'Non renseigné' }}</strong>
          </div>
          <div>
            <span>Sortie en salle</span>
            <strong>{{ movie.releaseDate || movie.year }}</strong>
          </div>
        </div>
      </div>

      <section class="cast-section" aria-labelledby="cast-heading">
        <h2 id="cast-heading">Distribution</h2>
        <div v-if="movie.cast?.length" class="cast-grid">
          <article v-for="person in movie.cast.slice(0, 3)" :key="person.id" class="cast-member">
            <img
              v-if="person.profile"
              class="cast-photo"
              :src="person.profile"
              :alt="`Portrait de ${person.name}`"
              loading="lazy"
            />
            <div v-else class="cast-photo cast-photo-fallback" aria-hidden="true">
              {{ person.name.charAt(0) }}
            </div>
            <div class="cast-credit">
              <h3>{{ person.name }}</h3>
              <p>{{ person.character || 'Rôle non précisé' }}</p>
            </div>
          </article>
        </div>
        <p v-else class="cast-empty">Aucune information de distribution disponible.</p>
      </section>

      <section class="recommendations-section" aria-labelledby="recommendations-heading">
        <h2 id="recommendations-heading">Vous aimerez aussi</h2>
        <p v-if="recommendationsLoading" class="recommendations-message">Recherche de films similaires...</p>
        <div v-else-if="recommendedMovies.length" class="recommendations-list">
          <router-link
            v-for="recommendedMovie in recommendedMovies"
            :key="recommendedMovie.id"
            :to="{ name: 'details', params: { id: recommendedMovie.id } }"
            class="recommendation-item"
          >
            <img :src="recommendedMovie.poster" :alt="recommendedMovie.title" loading="lazy" />
            <div>
              <h3>{{ recommendedMovie.title }}</h3>
              <p>{{ recommendedMovie.genre }} · {{ recommendedMovie.year }}</p>
              <strong>☆ {{ recommendedMovie.rating }}</strong>
            </div>
          </router-link>
        </div>
        <p v-else class="recommendations-message">Aucune suggestion disponible.</p>
      </section>
    </section>
  </div>

  <div v-else class="loading">Chargement des détails...</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { getMovieDetails, getMovieRecommendations } from '../services/api.js';

const route = useRoute();
const store = useStore();
const movie = ref(null);
const recommendedMovies = ref([]);
const recommendationsLoading = ref(false);
const personalRating = ref(0);
const reviewText = ref('');
const reviewSaved = ref(false);

const isFavorite = computed(() =>
  store.state.library.some(item => item.id === movie.value?.id && item.isFavorite)
);

watch(() => [route.params.id, store.state.user?.id], async ([movieId]) => {
  movie.value = null;
  recommendedMovies.value = [];
  recommendationsLoading.value = false;
  reviewSaved.value = false;

  const savedReview = store.state.reviews[movieId] || { rating: 0, text: '' };
  personalRating.value = savedReview.rating;
  reviewText.value = savedReview.text;

  const movieDetails = await getMovieDetails(movieId);
  movie.value = movieDetails;

  if (movieDetails?.genreIds?.length) {
    recommendationsLoading.value = true;
    const suggestions = await getMovieRecommendations(movieId, movieDetails.genreIds);
    recommendedMovies.value = suggestions.slice(0, 2);
    recommendationsLoading.value = false;
  }
}, { immediate: true });

function persistReview() {
  if (!movie.value) return false;

  try {
    store.commit('SET_MOVIE_REVIEW', {
      movieId: movie.value.id,
      rating: personalRating.value,
      text: reviewText.value
    });
    return true;
  } catch (error) {
    console.error('Impossible de sauvegarder la critique et la note dans le compte :', error);
    return false;
  }
}

const savePersonalRating = (rating) => {
  personalRating.value = rating;
  persistReview();
};

const saveReview = () => {
  reviewSaved.value = persistReview();
};

const updateStatus = (status) => {
  if (!movie.value) return;

  store.commit('ADD_TO_LIBRARY', {
    movie: movie.value,
    status
  });
};

const toggleFavorite = () => {
  if (movie.value) {
    store.commit('TOGGLE_FAVORITE', movie.value);
  }
};
</script>

<style scoped>
.details-view {
  min-height: 100vh;
  background: #f7f1e6;
  color: #292522;
}

.film-hero {
  position: relative;
  isolation: isolate;
  min-height: 370px;
  padding: 1.4rem clamp(1.25rem, 4vw, 3rem) 2rem;
  background: #171316;
  color: #f8f4ed;
}

.film-hero::before {
  position: absolute;
  z-index: -2;
  inset: 0;
  background-image: var(--backdrop-image);
  background-position: center 35%;
  background-size: cover;
  content: '';
}

.film-hero::after {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: linear-gradient(90deg, rgba(18, 13, 17, 0.93), rgba(18, 13, 17, 0.74) 60%, rgba(18, 13, 17, 0.62));
  content: '';
}

.film-hero-inner {
  max-width: 1440px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 1rem;
  padding: 0;
  border: 0;
  background: none;
  color: #f8f4ed;
  font: inherit;
  cursor: pointer;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(170px, 240px) minmax(0, 1fr) minmax(250px, 320px);
  align-items: start;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.details-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border: 2px solid #2ea8d7;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.details-info {
  min-width: 0;
  padding-top: 0.2rem;
}

.availability {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
}

.availability span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #57bd78;
}

.details-info h1,
.details-lower h2 {
  font-family: Georgia, 'Times New Roman', serif;
}

.details-info h1 {
  margin: 0 0 0.25rem;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.05;
}

.original-title {
  margin-bottom: 0.7rem;
  color: #bbb4b8;
  font-style: italic;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  color: #d0c9cc;
  font-size: 0.9rem;
}

.age-rating {
  padding: 0.1rem 0.35rem;
  border: 1px solid #aaa;
  border-radius: 3px;
  font-size: 0.7rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.personal-rating {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1rem 0;
  font-size: 0.82rem;
}

.rating-stars {
  display: flex;
  gap: 0.15rem;
}

.rating-stars button {
  padding: 0;
  border: 0;
  background: none;
  color: #e5ae36;
  font-size: 1.25rem;
  cursor: pointer;
}

.rating-stars button:focus-visible {
  outline: 2px solid #e5ae36;
  outline-offset: 2px;
}

.rating-value {
  color: #e5ae36;
}

.review-panel {
  display: flex;
  flex-direction: column;
  min-height: 275px;
  padding: 1.25rem;
  background: #f8f4ed;
  color: #292522;
}

.review-panel h2 {
  margin: 0 0 0.4rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.45rem;
}

.review-panel > p {
  margin: 0 0 0.8rem;
  color: #77716d;
  font-size: 0.84rem;
}

.review-panel textarea {
  width: 100%;
  min-height: 110px;
  flex: 1;
  padding: 0.8rem;
  resize: vertical;
  border: 1px solid #d8cfc1;
  background: #f5efe4;
  color: #292522;
  font: inherit;
  font-size: 0.82rem;
}

.review-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 0.7rem;
  color: #77716d;
  font-size: 0.72rem;
}

.review-save-button {
  min-height: 36px;
  padding: 0.5rem 0.9rem;
  border: 1px solid #c94f24;
  background: #c94f24;
  color: #fff;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.review-panel .saved-message {
  margin: 0.5rem 0 0;
  color: #35764a;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0.6rem 0.9rem;
  border-radius: 3px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
}

.btn-secondary[aria-pressed='true'] {
  border-color: #e06b58;
  color: #ff9a85;
}

.details-lower {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.9fr) minmax(0, 0.9fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem clamp(1.25rem, 4vw, 3rem) 3rem;
}

.section-kicker {
  color: #c94f24;
  font-size: 0.7rem;
  font-weight: 700;
}

.details-lower h2 {
  margin: 0.45rem 0 0.75rem;
  font-size: 1.5rem;
}

.overview {
  margin-bottom: 1.4rem;
  color: #77716d;
  font-size: 0.9rem;
  line-height: 1.55;
}

.film-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.film-facts div {
  display: grid;
  gap: 0.25rem;
}

.film-facts span {
  color: #89817a;
  font-size: 0.65rem;
  text-transform: uppercase;
}

.film-facts strong {
  font-size: 0.82rem;
}

.cast-grid,
.recommendations-list {
  display: grid;
  gap: 0.8rem;
}

.cast-member {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.cast-photo {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  border-radius: 50%;
  object-fit: cover;
  background: #e2ded3;
}

.cast-photo-fallback {
  display: grid;
  place-items: center;
  color: #7c442d;
  font-family: serif;
  font-size: 1.2rem;
}

.cast-credit,
.recommendation-item > div {
  min-width: 0;
}

.cast-credit h3,
.recommendation-item h3 {
  overflow: hidden;
  margin: 0 0 0.2rem;
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cast-credit p,
.cast-empty,
.recommendation-item p,
.recommendations-message {
  color: #817a74;
  font-size: 0.72rem;
}

.recommendation-item {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  color: inherit;
  text-decoration: none;
}

.recommendation-item img {
  width: 58px;
  height: 78px;
  object-fit: cover;
}

.recommendation-item strong {
  display: inline-block;
  margin-top: 0.25rem;
  color: #af7622;
  font-size: 0.75rem;
}

.recommendation-item:hover h3 {
  color: #b64a27;
  text-decoration: underline;
}

.loading {
  padding: 5rem;
  color: #666;
  text-align: center;
}

@media (max-width: 900px) {
  .hero-layout {
    grid-template-columns: minmax(150px, 210px) minmax(0, 1fr);
  }

  .review-panel {
    grid-column: 2;
  }

  .details-lower {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .synopsis-column {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .film-hero {
    padding: 1rem 1rem 1.5rem;
  }

  .hero-layout {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .review-panel {
    grid-column: auto;
  }

  .details-poster {
    width: min(190px, 55vw);
  }

  .details-lower {
    grid-template-columns: 1fr;
    gap: 1.75rem;
    padding: 1.5rem 1rem 2rem;
  }

  .synopsis-column {
    grid-column: auto;
  }

}
</style>