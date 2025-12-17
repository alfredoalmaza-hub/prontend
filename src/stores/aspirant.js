import { defineStore } from 'pinia';
import api from '../services/api';

export const useAspirantStore = defineStore('aspirant', {
  state: () => ({
    aspirants: [],
    zones: [],
    chapels: [],
    currentAspirant: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAspirants(filters = {}) {
      this.loading = true;
      this.error = null;
      try {
        const params = new URLSearchParams(filters).toString();
        const url = params
          ? `/api/aspirants?${params}`
          : '/api/aspirants';

        const response = await api.get(url);
        this.aspirants = response.data;
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch aspirants';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAspirant(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get(`/api/aspirants/${id}`);
        this.currentAspirant = response.data;
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch aspirant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createAspirant(aspirantData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/api/aspirants', aspirantData);
        this.aspirants.push(response.data);
        return response.data;
      } catch (error) {
        if (error.response?.data?.action_required) {
          throw error;
        }
        this.error =
          error.response?.data?.message || 'Failed to create aspirant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateAspirant(id, aspirantData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.put(`/api/aspirants/${id}`, aspirantData);
        const index = this.aspirants.findIndex(a => a.id === id);
        if (index !== -1) {
          this.aspirants[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to update aspirant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAspirant(id) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/api/aspirants/${id}`);
        this.aspirants = this.aspirants.filter(a => a.id !== id);
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to delete aspirant';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async handleDuplicate(action, duplicateId, newAspirantData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(
          '/api/aspirants/handle-duplicate',
          {
            action,
            duplicate_id: duplicateId,
            new_aspirant_data: newAspirantData,
          }
        );
        if (action === 'add_anyway') {
          this.aspirants.push(response.data.aspirant);
        }
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to handle duplicate';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async importCSV(formData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(
          '/api/aspirants/import-csv',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to import CSV';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchZones() {
      try {
        const response = await api.get('/api/zones');
        this.zones = response.data;
        return response.data;
      } catch (error) {
        console.error('Failed to fetch zones:', error);
        throw error;
      }
    },

    async fetchChapels(zoneId = null) {
      try {
        const params = zoneId ? `?zone_id=${zoneId}` : '';
        const response = await api.get(`/api/chapels${params}`);
        this.chapels = response.data;
        return response.data;
      } catch (error) {
        console.error('Failed to fetch chapels:', error);
        throw error;
      }
    },

    async fetchPhaseAttendance(phaseId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get(
          `/api/phases/${phaseId}/attendance`
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch attendance';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async markAttendance(attendanceData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(
          '/api/attendance/mark',
          attendanceData
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to mark attendance';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async bulkMarkAttendance(attendances) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(
          '/api/attendance/bulk-mark',
          { attendances }
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Failed to mark bulk attendance';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async finishInstallmentPhase(phaseId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(
          `/api/phases/${phaseId}/finish-installment`
        );
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Failed to finish installment phase';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateAspirantStatus(id, status) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.patch(
          `/api/aspirants/${id}/status`,
          { status }
        );
        const idx = this.aspirants.findIndex(a => a.id === id);
        if (idx !== -1) {
          this.aspirants[idx] = {
            ...this.aspirants[idx],
            is_installed: response.data.aspirant?.is_installed,
          };
        }
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Failed to update aspirant status';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
