<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="p-6 pb-0 flex-shrink-0">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Attendance</h1>
    </div>

    <div v-if="!activeBatch" class="text-center py-12">
      <p class="text-gray-500">No active batch found</p>
    </div>

    <div v-else class="flex-1 flex flex-col overflow-hidden px-6 pb-6 min-h-0">
      <!-- Phase Selection -->
      <div class="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300 mb-6 flex-shrink-0">
        <div class="flex items-center space-x-4">
          <label class="font-medium">Select Phase:</label>
          <div class="flex space-x-2">
            <button
              v-for="(phase, index) in activeBatch.phases"
              :key="phase.id"
              @click="handlePhaseClick(phase, index)"
              :disabled="!canAccessPhase(phase, index)"
              :class="[
                'px-4 py-2 rounded-md transition-colors relative',
                selectedPhase?.id === phase.id ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300',
                !canAccessPhase(phase, index) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                phase.status === 'completed' ? 'bg-green-100 text-green-800' : ''
              ]"
            >
              {{ phase.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Attendance Table -->
      <div v-if="selectedPhase && attendanceData" class="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden flex flex-col flex-1 min-h-0">
        <!-- Search and Filters -->
        <div class="p-4 border-b flex-shrink-0 bg-gray-50">
          <div class="flex space-x-2">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, ID..."
              class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
            <select v-model="filterZone" @change="onFilterZoneChange" class="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm">
              <option value="">All Zones</option>
              <option v-for="zone in zones" :key="zone.id" :value="zone.id">Zone {{ zone.zone_number }}</option>
            </select>
            <select v-model="filterChapel" class="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm">
              <option value="">All Chapels</option>
              <option v-for="chapel in filterChapels" :key="chapel.id" :value="chapel.id">{{ chapel.name }}</option>
            </select>
            <select v-model="filterStatus" class="px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm">
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
            <button
              v-if="selectedPhase.status === 'pending' && selectedPhase.name.toLowerCase() === 'installment'"
              @click="startPhase"
              :disabled="!canStartPhase(selectedPhase)"
              :class="[
                'px-6 py-2 rounded-md transition-colors text-sm whitespace-nowrap',
                (!canStartPhase(selectedPhase))
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              ]"
            >
              Start Installment
            </button>
            <button
              v-else-if="selectedPhase.status === 'active' && selectedPhase.name.toLowerCase() === 'installment'"
              @click="finishPhase"
              class="bg-secondary text-white px-6 py-2 rounded-md hover:bg-primary transition-colors text-sm whitespace-nowrap"
            >
              Finish Recruitment
            </button>
            <button
              v-else-if="selectedPhase.status === 'pending'"
              @click="startPhase"
              :disabled="!canStartPhase(selectedPhase)"
              :class="[
                'px-6 py-2 rounded-md transition-colors text-sm whitespace-nowrap',
                (!canStartPhase(selectedPhase))
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              ]"
            >
              Start Phase
            </button>
            <button
              v-else-if="selectedPhase.status === 'active'"
              @click="finishPhase"
              class="bg-secondary text-white px-6 py-2 rounded-md hover:bg-primary transition-colors text-sm whitespace-nowrap"
            >
              Finish Phase
            </button>
            <span v-else-if="selectedPhase.status === 'completed'" class="text-green-600 font-semibold text-sm flex items-center whitespace-nowrap">
              Phase Completed
            </span>
          </div>
        </div>

        <!-- Table Header (Fixed) -->
        <div class="bg-primary border-b flex-shrink-0">
          <table class="min-w-full table-fixed">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase" style="width: 10%">Aspirant ID</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase" style="width: 20%">Name</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase" style="width: 15%">Zone</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase" style="width: 15%">Chapel</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase" style="width: 14.5%">Status</th>
              </tr>
            </thead>
          </table>
        </div>
        
        <!-- Table Body (Scrollable) -->
        <div class="overflow-y-auto flex-1">
          <table class="min-w-full table-fixed">
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in filteredAttendance" :key="record.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm" style="width: 10%">{{ record.aspirant?.aspirant_id }}</td>
                <td class="px-6 py-4 whitespace-nowrap" style="width: 20%">{{ record.aspirant?.full_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" style="width: 15%">Zone {{ record.aspirant?.zone?.zone_number }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" style="width: 15%">{{ record.aspirant?.chapel?.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap" style="width: 14.5%">
                  <template v-if="selectedPhase.status === 'active'">
                    <select
                      v-model="record.status"
                      @change="autoSaveAttendance(record)"
                      class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="record.status === 'present' ? 'border-green-500 bg-green-50' : record.status === 'absent' ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </template>
                  <template v-else-if="selectedPhase.status === 'completed'">
                    <span
                      :class="record.status === 'present' ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'"
                    >
                      {{ record.status === 'present' ? 'Present' : record.status === 'absent' ? 'Absent' : '' }}
                    </span>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Attendance Summary -->
      <div v-if="selectedPhase && attendanceData" class="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-300 mt-6 flex-shrink-0">
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors" @click="filterByStatus('')">
            <div class="text-xl font-bold text-gray-700">{{ attendanceData.summary?.total || 0 }}</div>
            <div class="text-xs text-gray-600">Total</div>
          </div>
          <div class="text-center cursor-pointer hover:bg-green-50 p-2 rounded transition-colors" @click="filterByStatus('present')">
            <div class="text-xl font-bold text-green-600">{{ attendanceData.summary?.present || 0 }}</div>
            <div class="text-xs text-gray-600">Present</div>
          </div>
          <div class="text-center cursor-pointer hover:bg-red-50 p-2 rounded transition-colors" @click="filterByStatus('absent')">
            <div class="text-xl font-bold text-red-600">{{ attendanceData.summary?.absent || 0 }}</div>
            <div class="text-xs text-gray-600">Absent</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ConfirmModal
      :show="showFinishPhaseConfirm"
      @cancel="showFinishPhaseConfirm = false"
      @confirm="confirmFinishPhase"
    >
      Are you sure you want to finish this phase?
    </ConfirmModal>
    <ConfirmModal
      :show="showStartPhaseConfirm"
      @cancel="showStartPhaseConfirm = false"
      @confirm="confirmStartPhase"
    >
      Are you sure to activate this phase?
    </ConfirmModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { useBatchStore } from '../stores/batch';
import { useAspirantStore } from '../stores/aspirant';
import { useRoute, useRouter } from 'vue-router';

const batchStore = useBatchStore();
const aspirantStore = useAspirantStore();
const route = useRoute();
const router = useRouter();

const activeBatch = ref(null);
const selectedPhase = ref(null);
const attendanceData = ref(null);
const searchQuery = ref('');
const filterZone = ref('');
const filterChapel = ref('');
const filterStatus = ref('');
const zones = ref([]);
const chapels = ref([]);
const filterChapels = ref([]);
const showFinishPhaseConfirm = ref(false);
const showStartPhaseConfirm = ref(false);

const filteredAttendance = computed(() => {
  if (!attendanceData.value?.attendance) return [];
  
  return attendanceData.value.attendance.filter(record => {
    const matchesSearch = !searchQuery.value || 
      record.aspirant?.full_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      record.aspirant?.aspirant_id?.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesZone = !filterZone.value || 
      record.aspirant?.zone?.id === filterZone.value;
    
    const matchesChapel = !filterChapel.value || 
      record.aspirant?.chapel?.id === filterChapel.value;
    
    const matchesStatus = !filterStatus.value || 
      record.status === filterStatus.value;
    
    return matchesSearch && matchesZone && matchesChapel && matchesStatus;
  });
});

const onFilterZoneChange = async () => {
  filterChapel.value = '';
  if (filterZone.value) {
    filterChapels.value = await aspirantStore.fetchChapels(filterZone.value);
  } else {
    filterChapels.value = chapels.value;
  }
};

const filterByStatus = (status) => {
  filterStatus.value = status;
};

onMounted(async () => {
  try {
    zones.value = await aspirantStore.fetchZones();
    chapels.value = await aspirantStore.fetchChapels();
    filterChapels.value = chapels.value;
    
    activeBatch.value = await batchStore.fetchActiveBatch();
    if (activeBatch.value?.phases && activeBatch.value.phases.length > 0) {
      // If phase is in query, select it
      const phaseId = route.query.phase;
      if (phaseId) {
        const phase = activeBatch.value.phases.find(p => p.id == phaseId);
        if (phase) {
          await selectPhase(phase);
          return;
        }
      }
      // Otherwise, select active or first phase
      const activePhase = activeBatch.value.phases.find(p => p.status === 'active');
      if (activePhase) {
        await selectPhase(activePhase);
      } else {
        await selectPhase(activeBatch.value.phases[0]);
      }
    }
  } catch (error) {
    console.error('Failed to fetch active batch:', error);
  }
});

const selectPhase = async (phase, forceRegenerate = false) => {
  selectedPhase.value = phase;
  try {
    let data = await aspirantStore.fetchPhaseAttendance(phase.id);

    // If no attendance data or forced regeneration, generate attendance records
    if (forceRegenerate || !data || !data.attendance || data.attendance.length === 0) {
      let batchAspirants = [];
      const phases = activeBatch.value.phases;
      const index = phases.findIndex(p => p.id === phase.id);

      if (index === 0) {
        // Phase 1: include all aspirants in the batch
        batchAspirants = await aspirantStore.fetchAspirants({ batch_id: activeBatch.value.id });
      } else {
        // Other phases: include only those marked present in previous phase
        const prevPhase = phases[index - 1];
        const prevAttendance = await aspirantStore.fetchPhaseAttendance(prevPhase.id);
        const presentAspirantIds = (prevAttendance.attendance || [])
          .filter(a => a.status === 'present')
          .map(a => a.aspirant_id);

        if (presentAspirantIds.length > 0) {
          const allAspirants = await aspirantStore.fetchAspirants({ batch_id: activeBatch.value.id });
          batchAspirants = allAspirants.filter(a => presentAspirantIds.includes(a.id));
        }
      }

      attendanceData.value = {
  summary: {
    total: batchAspirants.length,
    present: 0,
    absent: batchAspirants.length,
    unmarked: 0
  },
  attendance: batchAspirants.map(aspirant => ({
    id: null,
    aspirant_id: aspirant.id,
    phase_id: phase.id,
    status: 'absent', // default
    aspirant: {
      aspirant_id: aspirant.aspirant_id,
      full_name: `${aspirant.first_name} ${aspirant.last_name}`,
      zone: aspirant.zone,
      chapel: aspirant.chapel
    }
  }))
};

    } else {
  // Always filter for phases after Phase 1
  const phases = activeBatch.value.phases;
  const index = phases.findIndex(p => p.id === phase.id);

  if (index > 0) {
    const prevPhase = phases[index - 1];
    const prevAttendance = await aspirantStore.fetchPhaseAttendance(prevPhase.id);
    const presentAspirantIds = (prevAttendance.attendance || [])
      .filter(a => a.status === 'present')
      .map(a => a.aspirant_id);

    // Filter and normalize, giving each row its own object and a default 'absent' status
    const normalized = (data.attendance || [])
      .filter(a => presentAspirantIds.includes(a.aspirant_id))
      .map(a => ({
        id: a.id ?? null,
        aspirant_id: a.aspirant_id,
        phase_id: a.phase_id ?? phase.id,
        status: a.status || 'absent',
        aspirant: a.aspirant
          ? {
              aspirant_id: a.aspirant.aspirant_id,
              full_name: a.aspirant.full_name,
              zone: a.aspirant.zone ? { ...a.aspirant.zone } : null,
              chapel: a.aspirant.chapel ? { ...a.aspirant.chapel } : null
            }
          : null
      }));

    data.attendance = normalized;
    data.summary.total = normalized.length;
    data.summary.present = normalized.filter(a => a.status === 'present').length;
    data.summary.absent = normalized.filter(a => a.status === 'absent').length;
    data.summary.unmarked = normalized.filter(a => !a.status).length;
  }

  attendanceData.value = data;
}

  } catch (error) {
    console.error('Failed to fetch attendance:', error);
  }
};

const canAccessPhase = (phase, index) => {
  // All phases are accessible for viewing
  return true;
};

const canStartPhase = (phase) => {
  if (!activeBatch.value || !phase) return false;
  const phases = activeBatch.value.phases;
  const index = phases.findIndex(p => p.id === phase.id);
  if (index === 0) return true; // Phase 1 can always be started
  // Previous phase must be completed
  return phases[index - 1].status === 'completed';
};

const handlePhaseClick = async (phase, index) => {
  // Check if phase can be accessed
  if (!canAccessPhase(phase, index)) {
    alert('Please complete the previous phase first');
    return;
  }

  // Select and navigate to the phase (show its attendance)
  await selectPhase(phase);

  // Optionally, update the route query so URL reflects the selected phase
  router.push({ name: 'Attendance', query: { phase: phase.id } });
};

const autoSaveAttendance = async (record) => {
  try {
    // Only save if status is present or absent
    if (!record.status || record.status === '') {
      // For unmarked, just refresh to show updated counts
      await selectPhase(selectedPhase.value);
      return;
    }
    
    // Mark attendance with present or absent
    const attendanceData = {
      aspirant_id: record.aspirant_id,
      phase_id: selectedPhase.value.id,
      status: record.status
    };
    
    await aspirantStore.markAttendance(attendanceData);
    
    // Refresh attendance data to update summary
    await selectPhase(selectedPhase.value);
  } catch (error) {
    console.error('Failed to save attendance:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to save attendance';
    alert(errorMessage);
    // Revert the status change
    await selectPhase(selectedPhase.value);
  }
};

const startPhase = async () => {
  showStartPhaseConfirm.value = true;
};

const confirmStartPhase = async () => {
  showStartPhaseConfirm.value = false;
  try {
    await batchStore.activatePhase(selectedPhase.value.id);
    activeBatch.value = await batchStore.fetchActiveBatch();
    const activatedPhase = activeBatch.value.phases.find(p => p.id === selectedPhase.value.id);
    if (activatedPhase) {
      await selectPhase(activatedPhase, true);
    }
  } catch (error) {
    alert('Failed to start phase');
  }
};

const finishPhase = async () => {
  showFinishPhaseConfirm.value = true;
};

const confirmFinishPhase = async () => {
  showFinishPhaseConfirm.value = false;

  // Normalize: treat any blank status as 'absent'
  const normalized = attendanceData.value.attendance.map(a => ({
    aspirant_id: a.aspirant_id,
    phase_id: selectedPhase.value.id,  // Add phase_id here
    status: a.status || 'absent'
  }));

  try {
    // 1) Bulk mark all attendance in ONE request
    await aspirantStore.bulkMarkAttendance(normalized);

    // 2) If installment phase, finish it (marks installed + completes batch)
    if (selectedPhase.value.name.toLowerCase() === 'installment') {
      await aspirantStore.finishInstallmentPhase(selectedPhase.value.id);
    } else {
      // For other phases, just complete the phase
      await batchStore.completePhase(selectedPhase.value.id);
    }

    // Refresh batch and phase data
    activeBatch.value = await batchStore.fetchActiveBatch();
    const completedPhase = activeBatch.value.phases.find(
      p => p.id === selectedPhase.value.id
    );
    if (completedPhase) {
      await selectPhase(completedPhase);
    }

    alert('Phase completed successfully');
  } catch (error) {
    console.error('Failed to complete phase:', error);
    alert('Failed to complete phase');
  }
};

</script>
