import { defineStore } from 'pinia';
import api from '../services/api';

export const useBatchStore = defineStore('batch', {
  state: () => ({
    batches: [],
    activeBatch: null,
    currentBatch: null,
    loading: false,
    error: null,
    lastFetch: null,
    cacheDuration: 30000, // 30 seconds cache
  }),

  actions: {
    async fetchBatches(forceRefresh = false) {
  if (!forceRefresh && this.batches.length > 0 && this.lastFetch) {
    const now = Date.now();
    if (now - this.lastFetch < this.cacheDuration) {
      return this.batches;
    }
  }

  this.loading = true;
  this.error = null;

  try {
    const response = await api.get('/api/batches');

    const uniqueBatches = response.data.reduce((acc, batch) => {
      if (!acc.find(b => b.id === batch.id)) {
        acc.push(batch);
      }
      return acc;
    }, []);

    this.batches = uniqueBatches;
    this.lastFetch = Date.now();
    return uniqueBatches;
  } catch (error) {
    this.error = error.response?.data?.message || 'Failed to fetch batches';
    throw error;
  } finally {
    this.loading = false;
  }
},

    async fetchActiveBatch() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/api/batches/active');
        const payload = response.data;
        this.activeBatch = payload?.batch ?? null;
        return this.activeBatch;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch active batch';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBatch(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get(`/api/batches/${id}`);
        this.currentBatch = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch batch';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createBatch() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/api/batches');
        this.batches.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create batch';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async activateBatch(id) {
      this.loading = true;
      this.error = null;
      try {
        console.log('🔥 STORE: Activating batch', id);
        const response = await api.post(`/api/batches/${id}/activate`);
        console.log('✅ STORE: Activate response:', response.data);
        await this.fetchBatches(true);
        await this.fetchActiveBatch();
        return response.data;
      } catch (error) {
        console.error('❌ STORE: Activate failed:', error); // ADD THIS
        console.error('❌ Response:', error.response); // ADD THIS
        this.error = error.response?.data?.message || 'Failed to activate batch';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async completeBatch(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(`/api/batches/${id}/complete`);
        await this.fetchBatches(true);
        await this.fetchActiveBatch();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to complete batch';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteBatch(id) {
  this.loading = true
  this.error = null

  try {
    // ✅ ENSURE CSRF IS FRESH (PREVENT 419)
    await api.get('/sanctum/csrf-cookie')

    console.log('🔥 STORE: Deleting batch', id)
    await api.delete(`/api/batches/${id}`)
    console.log('✅ STORE: Delete successful')

    // ✅ REMOVE LOCALLY FIRST
    this.batches = this.batches.filter(b => b.id !== id)

    if (this.activeBatch?.id === id) {
      this.activeBatch = null
    }

    // ✅ RESET CACHE
    this.lastFetch = null

    // ✅ REFRESH FROM SERVER
    await this.fetchBatches(true)

    return true
  } catch (error) {
    console.error('❌ STORE: Delete failed:', error)
    console.error('❌ Response:', error.response)
    this.error = error.response?.data?.message || 'Failed to delete batch'
    throw error
  } finally {
    this.loading = false
  }
},

    async completePhase(phaseId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(`/api/phases/${phaseId}/complete`);
        await this.fetchActiveBatch();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to complete phase';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async reactivatePhase(phaseId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(`/api/phases/${phaseId}/reactivate`);
        await this.fetchActiveBatch();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to reactivate phase';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async resetPhaseAttendance(phaseId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(`/api/phases/${phaseId}/reset-attendance`);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to reset attendance';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
