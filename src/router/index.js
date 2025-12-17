import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Critical views
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/batches',
    name: 'Batches',
    component: () => import('../views/Batches.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/aspirants',
    name: 'Aspirants',
    component: () => import('../views/Aspirants.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: () => import('../views/Attendance.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  // ✅ Protected routes - Check authentication
  if (requiresAuth) {
    if (!authStore.user) {
      // Not authenticated, redirect to login
      console.log('🔒 Authentication required, redirecting to login');
      next('/login');
      return;
    }
    // User exists, allow access
    next();
    return;
  }

  // ✅ Guest routes (login page) - Redirect if already authenticated
  if (requiresGuest && authStore.user) {
    console.log('✅ Already authenticated, redirecting to dashboard');
    next('/dashboard');
    return;
  }

  // ✅ Public routes - Allow access
  next();
});

export default router;