import { defineStore } from 'pinia';
import api from '../services/api';

export const useReportStore = defineStore('report', {
  state: () => ({
    batches: [],
    batchAspirants: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchBatches() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/api/reports/batches');
        this.batches = response.data;
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch batch reports';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBatchAspirants(batchId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get(
          `/api/reports/batches/${batchId}/aspirants`
        );
        this.batchAspirants = response.data.aspirants;
        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch batch aspirants';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async downloadBatchReport(batchId) {
      try {
        const response = await api.get(
          `/api/reports/batches/${batchId}/download`,
          { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `batch-${batchId}-report.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to download report';
        throw error;
      }
    },
  },
});
