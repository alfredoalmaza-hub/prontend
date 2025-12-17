<template>
  <div id="app" class="min-h-screen bg-white">
    <router-view v-if="$route.name === 'Login'" />
    <div v-else class="h-screen flex flex-col">
      <Navbar />
      <div class="flex flex-1 min-h-0">
        <Sidebar />
        <main class="flex-1 overflow-hidden bg-gray-200">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';
</script>

<style>
/* Global styles are in style.css */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.10s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
