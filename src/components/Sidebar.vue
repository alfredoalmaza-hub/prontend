<template>
  <aside :class="isCollapsed ? 'w-16' : 'w-64'" class="bg-white shadow-lg min-h-screen transition-all duration-300 relative">
    <button
      @click="toggleSidebar"
      class="absolute top-4 right-2 p-2 text-gray-600 hover:text-primary transition-colors z-10"
    >
      <svg v-if="!isCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <nav class="mt-16">
      <router-link
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        :class="isCollapsed ? 'justify-center' : ''"
        class="flex items-center px-6 py-3 text-gray-700 hover:bg-secondary hover:text-white transition-all duration-300 hover:scale-105"
        active-class="bg-primary text-white"
        :title="isCollapsed ? link.name : ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" :class="isCollapsed ? 'h-7 w-7' : 'h-6 w-6 mr-3'" class="transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path v-if="link.icon === 'dashboard'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          <path v-else-if="link.icon === 'batches'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          <path v-else-if="link.icon === 'aspirants'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          <path v-else-if="link.icon === 'attendance'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path v-else-if="link.icon === 'reports'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span v-if="!isCollapsed">{{ link.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

const isCollapsed = ref(false);

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Batches', path: '/batches', icon: 'batches' },
  { name: 'Aspirants', path: '/aspirants', icon: 'aspirants' },
  { name: 'Attendance', path: '/attendance', icon: 'attendance' },
  { name: 'Reports', path: '/reports', icon: 'reports' },
];

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
