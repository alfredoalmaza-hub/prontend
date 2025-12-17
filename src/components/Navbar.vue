<template>
  <nav class="bg-[#0B2341] text-white shadow-lg h-[95px] border-b-[5px] border-b-[#F7B137] flex items-center">
    <div class="w-full flex items-center justify-between px-8">
      <!-- Logo and Title -->
      <div class="flex items-center gap-5">
        <img src="/logo.png" alt="Church Logo" 
        class="h-[70px] w-[70px] rounded-full bg-white p-1 object-cover"
        />
        <span class="text-xl md:text-2xl font-bold tracking-widest uppercase">
          Altar Server Recruitment Attendance Checker
        </span>
      </div>
      <!-- Profile Icon -->
      <router-link
        to="/profile"
        class="bg-white text-[#0B2341] p-2 rounded-full hover:bg-opacity-90 transition-colors h-[40px] w-[40px] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>
