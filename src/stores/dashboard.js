import { defineStore } from 'pinia';
import api from '../services/api';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: null,
    analytics: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchDashboardStats() {
      this.loading = true;
      this.error = null;
      try {
        // ✅ API route
        const response = await api.get('/api/dashboard');
        this.stats = response.data;
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch dashboard stats';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAnalytics(batchId = null) {
      this.loading = true;
      this.error = null;
      try {
        const params = batchId ? `?batch_id=${batchId}` : '';
        // ✅ API route
        const response = await api.get(`/api/dashboard/analytics${params}`);
        this.analytics = response.data;
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch analytics';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
