<template>
  <div id="app">
    <Navbar />

  
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
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
</style>