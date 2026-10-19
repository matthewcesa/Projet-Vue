<template>
  <div id="app" :class="{ 'auth-app': route.name === 'login' }">
    <Navbar v-if="route.name !== 'login'" />

    <main class="main-content">
      <router-view />
    </main>

    <Transition name="toast">
      <div v-if="notification" class="app-toast" role="status" aria-live="polite">
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Navbar from './components/Navbar.vue';

const route = useRoute();
const store = useStore();
const notification = computed(() => store.state.notification);
let notificationTimeout;

watch(notification, (currentNotification) => {
  clearTimeout(notificationTimeout);
  if (!currentNotification) return;

  notificationTimeout = setTimeout(() => {
    store.commit('CLEAR_NOTIFICATION', currentNotification.id);
  }, 3000);
});

onUnmounted(() => clearTimeout(notificationTimeout));
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0b0b0b;
  color: #ffffff;
}

.main-content {
  min-height: calc(100vh - 70px); 
}

.auth-app .main-content {
  min-height: 100vh;
}

.app-toast {
  position: fixed;
  z-index: 1000;
  right: 1.5rem;
  bottom: 1.5rem;
  max-width: min(24rem, calc(100vw - 2rem));
  padding: 0.9rem 1.2rem;
  border: 1px solid #35764a;
  border-radius: 8px;
  background: #f1f8f2;
  color: #245b36;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  font-size: 0.9rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>