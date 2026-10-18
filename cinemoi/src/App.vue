<template>
  <div id="app" :class="{ 'auth-app': route.name === 'login' }">
    <Navbar v-if="route.name !== 'login'" />

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';

const route = useRoute();
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
</style>