<template>
  <div class="movie-card">
    <div class="poster-container">
      <img :src="movie.poster" :alt="movie.title" />
      
      <span v-if="movie.badge" class="badge">{{ movie.badge }}</span>

      <button class="favorite-btn" @click="$emit('toggle-favorite', movie)">
        ♥
      </button>

      <button class="add-btn" @click="$emit('add-to-library', movie)">
        +
      </button>

      <div class="rating">
        ⭐ {{ movie.rating }}
      </div>
    </div>

    <div class="movie-info">
      <h3>{{ movie.title }}</h3>
      <p>{{ movie.genre }} · {{ movie.year }} · {{ movie.duration }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  movie: {
    type: Object,
    required: true
  }
});

defineEmits(['add-to-library', 'toggle-favorite']);
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
</style>