<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Aspirants</h1>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          v-model="filters.search"
          @input="debouncedSearch"
          type="text"
          placeholder="Search by name or ID..."
          class="px-4 py-2 border rounded-md"
        />
        <select v-model="filters.batch_id" @change="fetchAspirants" class="px-4 py-2 border rounded-md">
          <option value="">All Batches</option>
          <option v-for="batch in batches" :key="batch.id" :value="batch.id">
            {{ batch.name }}
          </option>
        </select>
        <select v-model="filters.zone_id" @change="onZoneChange" class="px-4 py-2 border rounded-md">
          <option value="">All Zones</option>
          <option v-for="zone in zones" :key="zone.id" :value="zone.id">
            Zone {{ zone.zone_number }}
          </option>
        </select>
        <select v-model="filters.chapel_id" @change="fetchAspirants" class="px-4 py-2 border rounded-md">
          <option value="">All Chapels</option>
          <option v-for="chapel in filteredChapels" :key="chapel.id" :value="chapel.id">
            {{ chapel.name }}
          </option>
        </select>
        <select v-model="filters.is_installed" @change="fetchAspirants" class="px-4 py-2 border rounded-md">
          <option value="">All Status</option>
          <option value="false">Not Installed</option>
          <option value="true">Installed</option>
        </select>
      </div>
    </div>

    <!-- Aspirants Table -->
    <div class="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden">
      <!-- HEADER TABLE -->
      <table class="min-w-full table-fixed">
        <thead class="bg-black">
          <tr>
            <th class="w-[9%] px-6 py-3 text-left text-xs font-medium text-white uppercase">ID</th>
            <th class="w-[15%] px-6 py-3 text-left text-xs font-medium text-white uppercase">Name</th>
            <th class="w-[15%] px-6 py-3 text-left text-xs font-medium text-white uppercase">Contact</th>
            <th class="w-[10%] px-6 py-3 text-left text-xs font-medium text-white uppercase">Birthdate</th>
            <th class="w-[10%] px-6 py-3 text-left text-xs font-medium text-white uppercase">Zone</th>
            <th class="w-[15%] px-6 py-3 text-left text-xs font-medium text-white uppercase">Chapel</th>
            <th class="w-[12%] px-6 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
            <th class="w-[10%] px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
          </tr>
        </thead>
      </table>

      <!-- SCROLLABLE BODY -->
      <div class="h-[440px] overflow-y-auto">
        <table class="min-w-full table-fixed divide-y divide-gray-200">
          <tbody class="bg-white">
            <tr v-for="aspirant in paginatedAspirants" :key="aspirant.id">
              <td class="w-[9%] px-6 py-4 text-sm">{{ aspirant.aspirant_id }}</td>
              <td class="w-[15%] px-6 py-4">{{ aspirant.first_name }} {{ aspirant.last_name }}</td>
              <td class="w-[15%] px-6 py-4 text-sm">{{ aspirant.contact_number }}</td>
              <td class="w-[10%] px-6 py-4 text-sm">{{ formatDate(aspirant.birthdate) }}</td>
              <td class="w-[10%] px-6 py-4 text-sm">Zone {{ aspirant.zone?.zone_number }}</td>
              <td class="w-[15%] px-6 py-4 text-sm">{{ aspirant.chapel?.name }}</td>
              <td class="w-[12%] px-6 py-4">
                <span
                  v-if="aspirant.is_installed"
                  class="px-2 py-1 rounded text-xs bg-blue-100 text-black w-[50px]"
                >
                  Installed
                </span>
                <span
                  v-else-if="aspirant.batch?.status === 'completed'"
                  class="px-2 py-1 rounded text-xs bg-red-100 text-primary"
                >
                  Not Installed
                </span>
                <span
                  v-else
                  class="px-2 py-1 rounded text-xs bg-yellow-100 text-primary"
                >
                  In Progress
                </span>
              </td>

              <td class="w-[10%] px-6 py-4 text-sm space-x-2">
                <button @click="editAspirant(aspirant)" class="text-secondary hover:text-primary">Edit</button>
                <button @click="confirmDeleteAspirant(aspirant.id)" class="text-red-600 hover:text-red-800">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="aspirants.length === 0" class="text-center py-12 text-gray-500">
          No aspirants found
        </div>
      </div>

      <!-- Pagination controls -->
<div
  v-if="totalPages > 1"
  class="flex items-center justify-center px-6 py-4 border-t bg-gray-50"
>
  <div class="inline-flex items-center gap-4">

    <!-- Prev button -->
    <button
      class="h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
    >
      ‹
    </button>

    <!-- Page indicators (dots / pills) -->
    <div class="flex items-center gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        class="h-1.5 rounded-full transition-all"
        :class="page === currentPage
          ? 'w-10 bg-black'
          : 'w-8 bg-white border border-gray-400'"
      />
    </div>

    <!-- Next button -->
    <button
      class="h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 text-sm text-white bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
    >
      ›
    </button>

    <!-- Page size selector -->
    <select
      v-model.number="pageSize"
      class="ml-4 px-3 py-1.5 border rounded-md text-sm bg-white"
    >
      <option :value="10">10</option>
      <option :value="25">25</option>
      <option :value="50">50</option>
    </select>
  </div>
</div>
    </div>

    <!-- Add/Edit Modal -->
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
          <button type="button" @click="closeAddModal" class="px-4 py-2 border rounded-md hover:bg-light">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90">
            {{ editMode ? 'Update' : 'Add' }}
          </button>
        </div>
      </form>
    </Modal>

     <!-- Global confirm dialog -->
    <ConfirmDialog
      :show="showConfirm"
      @cancel="showConfirm = false"
      @confirm="handleConfirm"
    >
      {{ confirmMessage }}
    </ConfirmDialog>

    <!-- Add/Edit Modal -->
    <!-- ... your existing modals and ConfirmDialog stay unchanged ... -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAspirantStore } from '../stores/aspirant';
import { useBatchStore } from '../stores/batch';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import Modal from '../components/Modal.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const aspirantStore = useAspirantStore();
const batchStore = useBatchStore();

const aspirants = ref([]);
const batches = ref([]);
const zones = ref([]);
const chapels = ref([]);
const formChapels = ref([]);
const showAddModal = ref(false);
const showImportModal = ref(false);
const editMode = ref(false);
const selectedFile = ref(null);

// confirm dialog state
const showConfirm = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);

// pagination state
const currentPage = ref(1);
const pageSize = ref(10);

const filters = ref({
  search: '',
  batch_id: '',
  zone_id: '',
  chapel_id: '',
  is_installed: ''
});

const form = ref({
  first_name: '',
  last_name: '',
  contact_number: '',
  birthdate: '',
  zone_id: '',
  chapel_id: ''
});

const filteredChapels = computed(() => {
  if (!filters.value.zone_id) return chapels.value;
  return chapels.value.filter(c => c.zone_id == filters.value.zone_id);
});

// pagination computed
const totalPages = computed(() =>
  aspirants.value.length === 0 ? 1 : Math.ceil(aspirants.value.length / pageSize.value)
);

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value);

const endIndex = computed(() => {
  const end = startIndex.value + pageSize.value;
  return end > aspirants.value.length ? aspirants.value.length : end;
});

const paginatedAspirants = computed(() =>
  aspirants.value.slice(startIndex.value, endIndex.value)
);

const goToPage = (page) => {
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;
  currentPage.value = page;
};

let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchAspirants();
  }, 300);
};

onMounted(async () => {
  await Promise.all([
    fetchAspirants(),
    fetchBatches(),
    fetchZones(),
    fetchChapels()
  ]);
});

const fetchAspirants = async () => {
  try {
    const cleanFilters = {};
    Object.keys(filters.value).forEach(key => {
      if (filters.value[key]) cleanFilters[key] = filters.value[key];
    });
    aspirantStore.lastFetch = {};
    aspirants.value = await aspirantStore.fetchAspirants(cleanFilters);
    currentPage.value = 1; // reset to first page after new fetch
  } catch (error) {
    console.error('Failed to fetch aspirants:', error);
  }
};

const fetchBatches = async () => {
  try {
    batches.value = await batchStore.fetchBatches();
  } catch (error) {
    console.error('Failed to fetch batches:', error);
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

const onZoneChange = async () => {
  filters.value.chapel_id = '';
  await fetchAspirants();
};

const onFormZoneChange = async () => {
  form.value.chapel_id = '';
  try {
    formChapels.value = await aspirantStore.fetchChapels(form.value.zone_id);
  } catch (error) {
    console.error('Failed to fetch chapels:', error);
  }
};

const handleSubmit = async () => {
  try {
    if (editMode.value) {
      await aspirantStore.updateAspirant(form.value.id, form.value);
    } else {
      await aspirantStore.createAspirant(form.value);
    }
    await fetchAspirants();
    closeAddModal();
    alert('Aspirant added successfully!');
  } catch (error) {
    console.error('Error details:', error.response);
    if (error.response?.data?.action_required) {
      if (confirm(`Duplicate found: ${error.response.data.duplicate.first_name} ${error.response.data.duplicate.last_name}. Add anyway?`)) {
        try {
          await aspirantStore.handleDuplicate('add_anyway', error.response.data.duplicate.id, form.value);
          await fetchAspirants();
          closeAddModal();
          alert('Aspirant added successfully!');
        } catch (err) {
          console.error('Duplicate error:', err.response);
          alert(err.response?.data?.message || 'Failed to add aspirant');
        }
      }
    } else {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save aspirant. Please check console for details.';
      alert(errorMessage);
    }
  }
};

const editAspirant = async (aspirant) => {
  console.log('🔥 EDIT ASPIRANT CLICKED:', aspirant);
  editMode.value = true;
  form.value = { ...aspirant };
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
  console.log('🔥 DELETE ASPIRANT CLICKED - ID:', id);
  confirmMessage.value = 'Are you sure you want to delete this aspirant?';
  confirmAction.value = async () => {
    console.log('🔥 CONFIRM DELETE EXECUTING');
    try {
      await aspirantStore.deleteAspirant(id);
      await fetchAspirants();
    } catch (error) {
      alert('Failed to delete aspirant');
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
  if (!selectedFile.value) return;
  try {
    await aspirantStore.importCSV(selectedFile.value);
    await fetchAspirants();
    showImportModal.value = false;
    selectedFile.value = null;
    alert('CSV imported successfully');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to import CSV');
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</script>
