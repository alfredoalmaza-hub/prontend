<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="pt-6 pl-6 pr-6 pb-0 flex-shrink-0">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center space-x-4">
          <h1 class="text-3xl font-bold text-gray-800">Batches</h1>

          <!-- Back to all batches (only in single-batch view) -->
          <button
            v-if="expandedBatch"
            @click="expandedBatch = null"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 text-primary text-sm font-medium bg-white/70 hover:bg-primary hover:text-white hover:border-primary shadow-sm transition-colors"
          >
            <span>Back to All Batches</span>
          </button>
        </div>

        <button
          v-if="isPresident && !expandedBatch"
          @click="createBatch"
          class="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 shadow-sm transition-colors"
        >
          Create New
        </button>
      </div>

      <div v-if="batches.length === 0" class="text-center text-gray-500 py-8">
        No batches found. Create one to get started!
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden min-h-0 px-6">
      <!-- All Batches View -->
      <div v-if="!expandedBatch" class="space-y-6 h-full overflow-y-auto pb-6">
        <!-- Active Batches Section -->
        <div v-if="activeBatches.length > 0">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Active</h2>
          <div class="space-y-4">
            <div
              v-for="batch in activeBatches"
              :key="batch.id"
              class="bg-white rounded-lg shadow-lg border-2 border-gray-300 hover:shadow-xl hover:border-accent transition-all"
            >
              <div class="p-6 flex items-start gap-4">
                <!-- Batch Info -->
                <div class="flex-1 cursor-pointer" @click="toggleBatchAspirants(batch.id)">
                  <h3 class="text-xl font-semibold mb-2">{{ batch.name }}</h3>
                  <div class="flex items-center gap-6 text-sm text-gray-600">
                    <p>Created: <span class="font-semibold">{{ formatDate(batch.created_at) }}</span></p>
                    <p>
                      Aspirants: <span class="font-semibold">{{ batchAspirants[batch.id]?.length || 0 }}</span>
                    </p>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center space-x-2 flex-shrink-0" @click.stop>
                  <button
                    v-if="isPresident && batch.status === 'draft'"
                    @click="confirmActivateBatch(batch.id)"
                    class="bg-accent text-white px-4 py-2 rounded-md hover:bg-secondary"
                  >
                    Activate
                  </button>
                </div>

                <!-- Delete Button -->
                <button
                  v-if="isPresident"
                  @click.stop="confirmDeleteBatch(batch.id)"
                  class="flex-shrink-0 text-white pl-2 rounded-md hover:bg-[#c9c5c5] transition-colors"
                  title="Delete Batch"
                >
                  <img
                    src="/trashcan.png"
                    alt="Delete batch"
                    class="h-[25px] w-[25px]"
                  />
                </button>
              </div>

              <!-- Phases Section -->
              <div v-if="batch.phases" class="px-6 py-3 border-t">
                <h4 class="font-semibold mb-2 text-sm">Phases</h4>
                <div class="flex justify-between gap-4">
                  <div
                    v-for="phase in batch.phases"
                    :key="phase.id"
                    class="flex-1 p-3 rounded-lg text-center transition-colors shadow-md"
                    :class="getPhaseClass(phase.status)"
                    :style="{ borderWidth: '3px' }"
                  >
                    <div class="text-xs font-medium">{{ phase.name }}</div>
                    <div class="text-xs mt-1 capitalize">{{ phase.status }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed Batches Section -->
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Completed</h2>
          <div v-if="completedBatches.length > 0" class="space-y-4">
            <div
              v-for="batch in completedBatches"
              :key="batch.id"
              class="bg-white rounded-lg shadow-lg border-2 border-gray-300 hover:shadow-xl hover:border-accent transition-all"
            >
              <div class="p-6 flex items-start gap-4">
                <!-- Batch Info -->
                <div class="flex-1 cursor-pointer" @click="toggleBatchAspirants(batch.id)">
                  <h3 class="text-xl font-semibold mb-2">{{ batch.name }}</h3>
                  <div class="flex items-center gap-6 text-sm text-gray-600">
                    <p>Created: <span class="font-semibold">{{ formatDate(batch.created_at) }}</span></p>
                    <p>
                      Aspirants: <span class="font-semibold">{{ batchAspirants[batch.id]?.length || 0 }}</span>
                    </p>
                  </div>
                </div>

                <!-- Delete Button -->
                <button
                  v-if="isPresident"
                  @click.stop="confirmDeleteBatch(batch.id)"
                  class="flex-shrink-0 text-white pl-2 rounded-md hover:bg-[#c9c5c5] transition-colors"
                  title="Delete Batch"
                >
                  <img
                    src="/trashcan.png"
                    alt="Delete batch"
                    class="h-[25px] w-[25px]"
                  />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            No Completed Batches Yet
          </div>
        </div>
      </div>

      <!-- Single Batch View -->
      <div v-else class="h-full flex overflow-hidden">
        <div class="bg-white rounded-lg shadow-lg border-2 border-gray-300 flex flex-col m-1 flex-1 overflow-hidden">
          <!-- Aspirants Section -->
          <div class="px-6 pt-2 pb-2 flex-1 flex flex-col min-h-0">
            <div class="flex justify-between items-center mb-2 flex-shrink-0">
              <div class="flex items-center space-x-4">
                <h4 class="font-bold text-xl">Aspirants - {{ currentBatch?.name }}</h4>
              </div>
              <div class="flex items-center space-x-3">
                <p class="text-xm text-gray-600">
                  Status: <span :class="getStatusClass(currentBatch?.status)">{{ currentBatch?.status }}</span>
                </p>
                <p class="text-xm text-gray-600">Created: {{ formatDate(currentBatch?.created_at) }}</p>
                <p class="text-xm text-gray-600">
                  Aspirants: <span class="font-bold text-sx">{{ batchAspirants[expandedBatch]?.length || 0 }}</span>
                </p>
                <div v-if="currentBatch?.status !== 'completed'" class="flex space-x-2">
                  <button
                    @click="showImportModal = true; selectedBatchId = expandedBatch"
                    class="bg-secondary text-white px-4 py-1.5 rounded-md hover:bg-opacity-90 font-semibold shadow-md text-sm"
                  >
                    Import CSV
                  </button>
                  <button
                    @click="showAddModal = true; selectedBatchId = expandedBatch"
                    class="bg-primary text-white px-4 py-1.5 rounded-md hover:bg-opacity-90 font-semibold shadow-md text-sm"
                  >
                    Add Aspirant
                  </button>
                </div>
              </div>
            </div>

            <!-- Search and Filter -->
            <div class="flex space-x-2 mb-2 flex-shrink-0">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, ID, or contact..."
                class="flex-1 px-3 py-1.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
              <select v-model="filterZone" @change="onFilterZoneChange" class="px-3 py-1.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                <option value="">All Zones</option>
                <option v-for="zone in zones" :key="zone.id" :value="zone.id">Zone {{ zone.zone_number }}</option>
              </select>
              <select v-model="filterChapel" class="px-3 py-1.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                <option value="">All Chapels</option>
                <option v-for="chapel in filterChapels" :key="chapel.id" :value="chapel.id">{{ chapel.name }}</option>
              </select>
              <select v-model="filterStatus" class="px-3 py-1.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                <option value="">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="installed">Installed</option>
              </select>
            </div>

            <!-- Aspirants Table (Scrollable) -->
            <div class="bg-white rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg flex-1 min-h-0 flex flex-col">
              <!-- Table Header (Fixed) -->
              <div class="bg-black flex-shrink-0 border-b-2 border-gray-300">
                <table class="min-w-full">
                  <thead>
                    <tr>
                      <th class="pl-6 pr-4 py-3 text-left text-xs font-bold text-white uppercase" style="width: 9%">ID</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-white uppercase" style="width: 17%">Name</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-white uppercase" style="width: 15%">Contact</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-white uppercase" style="width: 10%">Zone</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-white uppercase" style="width: 20%">Chapel</th>
                      <th class="px-4 py-3 text-left text-xs font-bold text-white uppercase" style="width: 12%">Status</th>
                      <th class="px-4 pr-6 py-3 text-left text-xs font-bold text-white uppercase" style="width: 12%">Actions</th>
                    </tr>
                  </thead>
                </table>
              </div>
              
              <!-- Table Body (Scrollable) -->
              <div class="flex-1 overflow-y-auto">
                <table class="min-w-full">
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="aspirant in filteredAspirants" :key="aspirant.id">
                      <td class="pl-6 pr-4 py-3 text-sm" style="width: 9%">{{ aspirant.aspirant_id }}</td>
                      <td class="px-4 py-3 text-sm" style="width: 17%">{{ aspirant.first_name }} {{ aspirant.last_name }}</td>
                      <td class="px-4 py-3 text-sm" style="width: 15%">{{ aspirant.contact_number }}</td>
                      <td class="px-4 py-3 text-sm" style="width: 10%">Zone {{ aspirant.zone?.zone_number }}</td>
                      <td class="px-4 py-3 text-sm" style="width: 20%">{{ aspirant.chapel?.name }}</td>

                      <!-- Status pill -->
                      <td class="px-4 py-3" style="width: 12%">
                        <span
                          v-if="currentBatch?.status === 'completed'"
                          class="px-2 py-1 rounded text-xs"
                          :class="aspirant.is_installed ? 'bg-blue-100 text-black' : 'bg-red-100 text-black'"
                        >
                          {{ aspirant.is_installed ? 'Installed' : 'Not Installed' }}
                        </span>
                        <span
                          v-else
                          class="px-2 py-1 rounded text-xs"
                          :class="aspirant.is_installed ? 'bg-blue-100 text-black' : 'bg-yellow-100 text-primary'"
                        >
                          {{ aspirant.is_installed ? 'Installed' : 'In Progress' }}
                        </span>
                      </td>

                      <td class="px-4 pr-6 py-3 text-sm space-x-2" style="width: 12%">
                        <button @click="editAspirant(aspirant)" class="text-secondary hover:text-primary">Edit</button>
                        <button @click="confirmDeleteAspirant(aspirant.id)" class="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="!filteredAspirants || filteredAspirants.length === 0" class="text-center py-8 text-gray-500">
                  No aspirants found
                </div>
              </div>
            </div>
          </div>

          <!-- Phases Section (Inside Batch Card) -->
          <div v-if="currentBatch?.phases" class="px-6 py-4 border-t-2 border-gray-300 flex-shrink-0 bg-gray-50">
            <div class="flex justify-between gap-6">
              <div
                v-for="phase in currentBatch.phases"
                :key="phase.id"
                class="flex-1 p-4 rounded-lg text-center transition-colors shadow-lg cursor-pointer hover:bg-gray-100"
                :class="getPhaseClass(phase.status)"
                :style="{ borderWidth: '3px' }"
                @click="navigateToAttendance(phase.id)"
              >
                <div class="text-sm font-semibold">{{ phase.name }}</div>
                <div class="text-xs mt-1 capitalize font-medium">{{ phase.status }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Aspirant Modal -->
    <Modal :show="showAddModal" :title="editMode ? 'Edit Aspirant' : 'Add Aspirant'" @close="closeAddModal">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input v-model="form.first_name" required class="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input v-model="form.last_name" required class="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
          <input v-model="form.contact_number" required class="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Birthdate</label>
          <input v-model="form.birthdate" type="date" required class="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Zone</label>
          <select v-model="form.zone_id" @change="onFormZoneChange" required class="w-full px-3 py-2 border rounded-md">
            <option value="">Select Zone</option>
            <option v-for="zone in zones" :key="zone.id" :value="zone.id">Zone {{ zone.zone_number }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Chapel</label>
          <select v-model="form.chapel_id" required class="w-full px-3 py-2 border rounded-md">
            <option value="">Select Chapel</option>
            <option v-for="chapel in formChapels" :key="chapel.id" :value="chapel.id">{{ chapel.name }}</option>
          </select>
        </div>
        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="closeAddModal" class="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90">
            {{ editMode ? 'Update' : 'Add' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Import CSV Modal -->
    <Modal :show="showImportModal" title="Import CSV" @close="showImportModal = false">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">Upload a CSV file with columns: first_name, last_name, contact_number, birthdate, zone_id, chapel_id</p>
        <input type="file" @change="handleFileSelect" accept=".csv" class="w-full" />
        <div class="flex justify-end space-x-3 pt-4">
          <button @click="showImportModal = false" class="px-4 py-2 border rounded-md">Cancel</button>
          <button @click="importCSV" :disabled="!selectedFile" class="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50">
            Import
          </button>
        </div>
      </div>
    </Modal>

    <!-- Global confirm dialog -->
    <ConfirmDialog
      :show="showConfirm"
      @cancel="showConfirm = false"
      @confirm="handleConfirm"
    >
      {{ confirmMessage }}
    </ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBatchStore } from '../stores/batch';
import { useAspirantStore } from '../stores/aspirant';
import { useAuthStore } from '../stores/auth';
import Modal from '../components/Modal.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { useRouter } from 'vue-router';

const batchStore = useBatchStore();
const aspirantStore = useAspirantStore();
const authStore = useAuthStore();
const router = useRouter();

const batches = ref([]);
const batchAspirants = ref({});
const expandedBatch = ref(null);
const selectedBatchId = ref(null);
const showAddModal = ref(false);
const showImportModal = ref(false);
const editMode = ref(false);
const selectedFile = ref(null);
const zones = ref([]);
const chapels = ref([]);
const formChapels = ref([]);
const filterChapels = ref([]);
const searchQuery = ref('');
const filterZone = ref('');
const filterChapel = ref('');
const filterStatus = ref('');

// confirm dialog state
const showConfirm = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);

const form = ref({
  first_name: '',
  last_name: '',
  contact_number: '',
  birthdate: '',
  zone_id: '',
  chapel_id: ''
});

const isPresident = computed(() => authStore.isPresident);

const activeBatches = computed(() => {
  return batches.value.filter(b => b.status === 'draft' || b.status === 'active');
});

const completedBatches = computed(() =>
  batches.value.filter(batch => batch.status === 'completed')
);

const currentBatch = computed(() => {
  if (!expandedBatch.value) return null;
  return batches.value.find(b => b.id === expandedBatch.value);
});

const filteredAspirants = computed(() => {
  if (!expandedBatch.value || !batchAspirants.value[expandedBatch.value]) return [];
  
  let filtered = batchAspirants.value[expandedBatch.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(a => 
      a.aspirant_id?.toLowerCase().includes(query) ||
      a.first_name?.toLowerCase().includes(query) ||
      a.last_name?.toLowerCase().includes(query) ||
      a.contact_number?.includes(query)
    );
  }
  
  if (filterZone.value) {
    filtered = filtered.filter(a => a.zone_id === parseInt(filterZone.value));
  }
  
  if (filterChapel.value) {
    filtered = filtered.filter(a => a.chapel_id === parseInt(filterChapel.value));
  }
  
  if (filterStatus.value) {
    if (filterStatus.value === 'installed') {
      filtered = filtered.filter(a => a.is_installed);
    } else if (filterStatus.value === 'in_progress') {
      filtered = filtered.filter(a => !a.is_installed);
    }
  }
  
  return filtered;
});

onMounted(async () => {
  await Promise.all([
    fetchBatches(),
    fetchZones(),
    fetchChapels()
  ]);
  filterChapels.value = chapels.value;
  await fetchAllBatchAspirantsCounts();
});

const fetchBatches = async (force = false) => {
  try {
    batches.value = await batchStore.fetchBatches(force);
  } catch (error) {
    console.error('Failed to fetch batches:', error);
  }
};

const fetchAllBatchAspirantsCounts = async () => {
  try {
    await Promise.all(
      batches.value.map(batch => fetchBatchAspirants(batch.id))
    );
  } catch (error) {
    console.error('Failed to fetch batch aspirants counts:', error);
  }
};

const toggleBatchAspirants = async (batchId) => {
  if (expandedBatch.value === batchId) {
    expandedBatch.value = null;
  } else {
    expandedBatch.value = batchId;
    if (!batchAspirants.value[batchId]) {
      await fetchBatchAspirants(batchId);
    }
  }
};

const fetchBatchAspirants = async (batchId) => {
  try {
    const response = await aspirantStore.fetchAspirants({ batch_id: batchId });
    const aspirants = Array.isArray(response)
      ? response
      : response.data ?? [];
    batchAspirants.value[batchId] = aspirants;
  } catch (error) {
    console.error('Failed to fetch batch aspirants:', error);
  }
};

const fetchZones = async () => {
  try {
    zones.value = await aspirantStore.fetchZones();
  } catch (error) {
    console.error('Failed to fetch zones:', error);
  }
};

const fetchChapels = async () => {
  try {
    chapels.value = await aspirantStore.fetchChapels();
  } catch (error) {
    console.error('Failed to fetch chapels:', error);
  }
};

const onFormZoneChange = async () => {
  form.value.chapel_id = '';
  try {
    formChapels.value = await aspirantStore.fetchChapels(form.value.zone_id);
  } catch (error) {
    console.error('Failed to fetch chapels:', error);
  }
};

const onFilterZoneChange = async () => {
  filterChapel.value = '';
  if (filterZone.value) {
    try {
      filterChapels.value = await aspirantStore.fetchChapels(filterZone.value);
    } catch (error) {
      console.error('Failed to fetch chapels:', error);
    }
  } else {
    filterChapels.value = chapels.value;
  }
};

const handleSubmit = async () => {
  try {
    const aspirantData = { ...form.value, batch_id: selectedBatchId.value };
    if (editMode.value) {
      await aspirantStore.updateAspirant(form.value.id, aspirantData);
    } else {
      await aspirantStore.createAspirant(aspirantData);
    }
    await fetchBatchAspirants(selectedBatchId.value);
    closeAddModal();
    alert('Aspirant saved successfully!');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to save aspirant');
  }
};

const editAspirant = async (aspirant) => {
  editMode.value = true;
  form.value = { ...aspirant };
  selectedBatchId.value = aspirant.batch_id;
  if (form.value.zone_id) {
    try {
      formChapels.value = await aspirantStore.fetchChapels(form.value.zone_id);
    } catch (error) {
      console.error('Failed to fetch chapels:', error);
    }
  }
  showAddModal.value = true;
};

const confirmDeleteAspirant = (id) => {
  confirmMessage.value = 'Are you sure you want to delete this aspirant?';
  confirmAction.value = async () => {
    try {
      await aspirantStore.deleteAspirant(id);
      if (expandedBatch.value) {
        await fetchBatchAspirants(expandedBatch.value);
      }
    } catch (error) {
      console.error('Failed to delete aspirant:', error);
      alert(error.response?.data?.message || 'Failed to delete aspirant');
    }
  };
  showConfirm.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
  editMode.value = false;
  form.value = {
    first_name: '',
    last_name: '',
    contact_number: '',
    birthdate: '',
    zone_id: '',
    chapel_id: ''
  };
  formChapels.value = [];
};

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0];
};

const importCSV = async () => {
  if (!selectedFile.value || !selectedBatchId.value) return;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('batch_id', selectedBatchId.value);

    await aspirantStore.importCSV(formData);
    await fetchBatchAspirants(selectedBatchId.value);

    showImportModal.value = false;
    selectedFile.value = null;

    alert('CSV imported successfully');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to import CSV');
  }
};

const createBatch = async () => {
  try {
    await batchStore.createBatch();
    await fetchBatches();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to create batch');
  }
};

const confirmActivateBatch = (id) => {
  console.log('🔥 ACTIVATE BATCH CLICKED - ID:', id);
  confirmMessage.value = 'Are you sure you want to activate this batch?';
  confirmAction.value = async () => {
    console.log('🔥 CONFIRM ACTIVATE EXECUTING');
    try {
      await batchStore.activateBatch(id);
      await fetchBatches();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to activate batch');
    }
  };
  showConfirm.value = true;
};

const confirmCompleteBatch = (id) => {
  confirmMessage.value = 'Are you sure you want to complete this batch?';
  confirmAction.value = async () => {
    try {
      await batchStore.completeBatch(id);
      await fetchBatches();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to complete batch');
    }
  };
  showConfirm.value = true;
};

const confirmDeleteBatch = (id) => {
  console.log('🔥 DELETE BATCH CLICKED - ID:', id);
  confirmMessage.value = 'Are you sure you want to delete this batch?';
  confirmAction.value = async () => {
    console.log('🔥 CONFIRM DELETE EXECUTING'); 
    try {
      await batchStore.deleteBatch(id);
      await fetchBatches(true); // 🔥 force fresh GET /api/batches
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete batch');
    }
  };
  showConfirm.value = true;
};


const handleConfirm = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
  }
  showConfirm.value = false;
};

const getStatusClass = (status) => {
  const classes = {
    draft: 'text-gray-600 font-medium',
    active: 'text-green-600 font-medium',
    completed: 'text-blue-600 font-medium'
  };
  return classes[status] || 'text-gray-600';
};

const getPhaseClass = (status) => {
  const classes = {
    pending: 'bg-white border-gray-300 text-gray-700',
    active: 'bg-white border-green-500 text-green-700',
    completed: 'bg-white border-blue-500 text-blue-700'
  };
  return classes[status] || 'bg-white border-gray-300';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const navigateToAttendance = (phaseId) => {
  router.push({ name: 'Attendance', query: { phase: phaseId } });
};
</script>
