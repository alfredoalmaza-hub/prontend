<template>
  <div v-if="show" class="flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: true
  }
});
</script>
