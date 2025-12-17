import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,          // null = unknown, false = guest, object = logged in
    authChecked: false,  // 👈 ADD THIS
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,

    isPresident: (state) => state.user?.role === 'President',
    isSecretary: (state) => state.user?.role === 'Secretary',
    isAuditor: (state) => state.user?.role === 'Auditor',
    isOfficer: (state) => state.user?.role === 'Officer',

    userRole: (state) => state.user?.role || null,
  },

  actions: {
    // 🔐 LOGIN
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        await api.get('/sanctum/csrf-cookie')
        await api.post('/api/login', credentials)

        // ✅ always resync user after login
        await this.fetchCurrentUser()
        return this.user
      } catch (error) {
        this.user = false
        this.error =
          error.response?.data?.message ||
          'Login failed. Please try again.'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 🔄 RESTORE SESSION (FIXED)
    async fetchCurrentUser() {
      try {
        const { data } = await api.get('/api/user')
        this.user = data           // logged in
      } catch {
        this.user = false          // guest
      } finally {
        this.authChecked = true    // 👈 VERY IMPORTANT
      }
    },

    // 🚪 LOGOUT
    async logout() {
      try {
        await api.post('/api/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.user = false
        this.authChecked = true
      }
    },
  },
})
