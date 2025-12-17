<template>
  <div class="p-8 h-full flex flex-col">
    <h1 class="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
      <div class="bg-white p-10 rounded-lg shadow-lg border-2 border-gray-300 hover:shadow-xl transition-shadow">
        <div class="text-gray-600 text-base mb-3">Total Batches</div>
        <div class="text-5xl font-bold text-primary">{{ stats?.total_batches || 0 }}</div>
      </div>
      <div class="bg-white p-10 rounded-lg shadow-lg border-2 border-gray-300 hover:shadow-xl transition-shadow">
        <div class="text-gray-600 text-base mb-3">Total Aspirants</div>
        <div class="text-5xl font-bold text-secondary">{{ stats?.total_aspirants || 0 }}</div>
      </div>
      <div class="bg-white p-10 rounded-lg shadow-lg border-2 border-gray-300 hover:shadow-xl transition-shadow">
        <div class="text-gray-600 text-base mb-3">Installed Aspirants</div>
        <div class="text-5xl font-bold text-accent">{{ stats?.installed_aspirants || 0 }}</div>
      </div>
      <div class="bg-white p-10 rounded-lg shadow-lg border-2 border-gray-300 hover:shadow-xl transition-shadow">
        <div class="text-gray-600 text-base mb-3">Active Batch</div>
        <div class="text-2xl font-bold text-gray-700">
          {{ stats?.active_batch?.name || 'None' }}
        </div>
      </div>
    </div>

    <!-- Active Batch Info & Recent Batches -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
      <!-- Active Batch Section -->
      <div v-if="activeBatchWithPhases" class="lg:col-span-2 bg-white p-10 rounded-lg shadow-lg border-2 border-gray-300 max-h-[350px]">
        <h2 class="text-3xl font-semibold mb-8">Active Batch: {{ activeBatchWithPhases.name }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div class="text-lg">
            <p class="text-gray-600">Total Aspirants: <span class="font-semibold text-2xl">{{ activeBatchWithPhases.total_aspirants }}</span></p>
          </div>
          <div v-if="activeBatchWithPhases.active_phase" class="text-lg">
            <p class="text-gray-600">
              Current Phase: <span class="font-semibold text-primary text-2xl">{{ activeBatchWithPhases.active_phase.name }}</span>
            </p>
          </div>
        </div>

        <!-- Phases Section -->
        <div 
          v-if="activeBatchWithPhases.phases && activeBatchWithPhases.phases.length > 0"
          class="mt-8 border-t-2 border-gray-200">
          <h3 class="text-2xl font-semibold mb-6">Phases</h3>
          <div class="grid grid-cols-5 gap-4">
            <div
              v-for="phase in activeBatchWithPhases.phases"
              :key="phase.id"
              class="p-4 rounded-lg text-center transition-all border-2 cursor-pointer hover:bg-gray-50"
              :class="getPhaseClass(phase.status)"
              @click="navigateToAttendance(phase.id)"
            >
              <div class="text-base font-semibold mb-2">{{ phase.name }}</div>
              <div class="text-sm capitalize font-medium">{{ phase.status }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recently Accessed Batches Section -->
      <div class="bg-white p-10 rounded-lg shadow-lg border-2 border-gray-300 max-h-[350px]">
        <h2 class="text-2xl font-semibold mb-6">Recent Batches</h2>
        <div class="space-y-4">
          <div
            v-for="batch in recentBatches"
            :key="batch.id"
            class="p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:shadow-md transition-all cursor-pointer"
            @click="navigateToBatch(batch.id)"
          >
            <h3 class="font-semibold text-lg mb-1">{{ batch.name }}</h3>
            <p class="text-sm text-gray-600 capitalize">Status: {{ batch.status }}</p>
            <p class="text-sm text-gray-600">Aspirants: {{ batch.total_aspirants || 0 }}</p>
          </div>
          <div v-if="!recentBatches || recentBatches.length === 0" class="text-center text-gray-500 py-8">
            No recent batches
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../stores/dashboard';
import { useBatchStore } from '../stores/batch';

const router = useRouter();
const dashboardStore = useDashboardStore();
const batchStore = useBatchStore();
const stats = ref(null);

const recentBatches = computed(() => {
  if (!batchStore.batches) return [];
  return batchStore.batches.slice(0, 5);
});

const activeBatchWithPhases = computed(() => {
  if (!stats.value?.active_batch) return null;
  
  // Find the full batch details from batchStore to get phases
  const fullBatch = batchStore.batches?.find(b => b.id === stats.value.active_batch.id);
  
  return {
    ...stats.value.active_batch,
    phases: fullBatch?.phases || []
  };
});

const getPhaseClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 border-green-500 text-green-800';
    case 'active':
      return 'bg-blue-100 border-blue-500 text-blue-800';
    case 'pending':
      return 'bg-gray-100 border-gray-400 text-gray-600';
    default:
      return 'bg-gray-100 border-gray-400 text-gray-600';
  }
};

const navigateToBatch = (batchId) => {
  router.push({ name: 'Batches', query: { batch: batchId } });
};

const navigateToAttendance = (phaseId) => {
  router.push({ name: 'Attendance', query: { phase: phaseId } });
};

onMounted(async () => {
  try {
    stats.value = await dashboardStore.fetchDashboardStats();
    await batchStore.fetchBatches();
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }
});
</script>
