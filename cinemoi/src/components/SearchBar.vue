<template>
  <div class="search-container">
    <input 
      type="text" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)" 
      :placeholder="placeholder" 
    />
    <span v-if="shortcut" class="kbd-shortcut">{{ shortcut }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Rechercher...'
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  font-size: 1rem;
}

.search-container input {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3rem;
  border-radius: 30px;
  border: 1px solid #dcd6c8;
  background-color: rgba(247, 243, 232, 0.95);
  color: #1a1a1a;
  font-size: 1rem;
  outline: none;
}

.kbd-shortcut {
  position: absolute;
  right: 1.2rem;
  background: #e2ded3;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #555;
}
</style>