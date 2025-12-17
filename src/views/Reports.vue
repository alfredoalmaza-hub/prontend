<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Reports</h1>

    <div class="space-y-6">
      <div
        v-for="batch in batches"
        :key="batch.id"
        class="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-300"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="font-bold text-lg mb-1">Batch {{ batch.name }}</div>
            <div class="text-sm text-gray-600">
              Status:
              <span
                :class="batch.status === 'active' ? 'text-green-600' : 'text-blue-600'"
                class="font-medium"
              >
                {{ batch.status }}
              </span>
            </div>
            <div class="text-sm text-gray-600">
              Total Aspirants:
              <span class="font-medium">{{ batch.total_aspirants || 0 }}</span>
            </div>
            <div class="text-sm text-gray-600">
              Installed:
              <span class="font-medium text-accent">
                {{ batch.installed_count || 0 }}
              </span>
            </div>
          </div>

          <div class="flex space-x-2">
            <!-- CHANGED: now redirects to Batches -->
            <button
              @click="goToBatches(batch.id)"
              class="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
            >
              View Details
            </button>

            <button
              v-if="batch.status === 'completed'"
              @click="downloadReport(batch.id)"
              class="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
            >
              Download PDF
            </button>
          </div>
        </div>

        <!-- Installed Aspirants List (no longer used; can keep or remove) -->
        <div v-if="selectedBatchId === batch.id && installedAspirants.length > 0" class="mt-4 border-t pt-4">
          <h4 class="font-semibold mb-3">Installed Aspirants</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="aspirant in installedAspirants"
              :key="aspirant.id"
              class="p-3 border rounded-md"
            >
              <p class="font-medium">{{ aspirant.first_name }} {{ aspirant.last_name }}</p>
              <p class="text-sm text-gray-600">{{ aspirant.aspirant_id }}</p>
              <p class="text-sm text-gray-600">{{ aspirant.chapel?.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="batches.length === 0" class="text-center py-12 text-gray-500">
        No reports available
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';

const router = useRouter();

const batches = ref([]);
const installedAspirants = ref([]);
const selectedBatchId = ref(null);

onMounted(async () => {
  await fetchReports();
});

const fetchReports = async () => {
  try {
    const response = await api.get('/reports/batches');
    batches.value = response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    batches.value = [];
  }
};

// Old viewAspirants logic can be removed if no longer needed
const viewAspirants = async (batchId) => {
  // no-op now, kept only if you still use it somewhere else
};

const downloadReport = async (batchId) => {
  try {
    const response = await api.get(`/reports/batches/${batchId}/download`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `batch-${batchId}-report.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Failed to download report:', error);
    alert('Failed to download report');
  }
};

// NEW: navigate to the Batches page, optionally passing batch id
const goToBatches = (batchId) => {
  router.push({
    name: 'Batches',              // from your router config
    query: { batch: batchId }     // optional: so Batches.vue can auto-open this batch
  });
};
</script>
