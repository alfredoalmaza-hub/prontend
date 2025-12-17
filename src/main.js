import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import api from './services/api'
import { useAuthStore } from './stores/auth'

async function initApp() {
  // 1️⃣ Create app & Pinia FIRST
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)

  // 2️⃣ Initialize CSRF (Sanctum requirement)
  await api.get('/sanctum/csrf-cookie')
  console.log('✅ CSRF cookie initialized')

  // 3️⃣ Restore auth state (NO try/catch)
  const authStore = useAuthStore()
  await authStore.fetchCurrentUser()

  if (authStore.user) {
    console.log(
  '✅ Auth restored:',
  authStore.user.username,
  '(' + authStore.user.role + ')'
)
  } else {
    console.log('ℹ️ Guest session (not logged in)')
  }

  // 4️⃣ Register router AFTER auth is known
  app.use(router)

  // 5️⃣ Mount app
  app.mount('#app')
}

initApp()
