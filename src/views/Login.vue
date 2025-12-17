<template>
  <div
    class="relative min-h-screen flex items-center justify-center bg-cover bg-center"
    style="background-image: url('/churchstruct.jpg')"
  >
    <!-- Faint blue overlay -->
    <div class="absolute inset-0 bg-[#0B2341]/40"></div>

    <!-- Outer card -->
    <div
      class="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex"
    >
      <!-- Left brand panel -->
      <div
        class="w-full md:w-1/2 bg-[#101b3a] text-white flex flex-col items-center justify-center px-12 py-12"
      >
        <!-- Logo -->
        <div
          class="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-8 shadow-lg"
        >
          <img src="/edited-photo.png" alt="Logo" class="w-24 h-24 object-contain" />
        </div>

        <div class="text-center">
          <h2 class="text-2xl font-semibold">Altar Server Recruitment</h2>
          <p class="text-xl mt-2 opacity-95">Attendance Checker</p>

          <div class="w-16 h-1 bg-[#f5b947] mx-auto mt-10 mb-8 rounded-full"></div>

          <p class="text-sm opacity-90">
            “We are called to serve, not to be served”
          </p>
        </div>
      </div>

      <!-- Right login panel -->
      <div class="w-full md:w-1/2 bg-white px-12 py-12 flex flex-col justify-center">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p class="text-sm text-gray-500 mt-1">
            Login with your admin credentials.
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div class="relative">
              <!-- <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-primary">
                <span class="h-4 w-4 rounded-full border border-primary"></span>
              </span> -->
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                placeholder="Enter your e-mail"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <!-- <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-primary">
                <span class="h-4 w-4 border border-primary rounded-sm"></span>
              </span> -->
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div
            v-if="error"
            class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-[#0B2341] text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-[#111c33] disabled:opacity-60 transition-colors"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- <div class="mt-6 text-center text-[11px] text-gray-500 space-y-1">
          <p>Default Test Credentials:</p>
          <p><strong>President:</strong> president@asrecruitment.com / password</p>
          <p><strong>Secretary:</strong> secretary@asrecruitment.com / password</p>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    await authStore.login(form.value);
    router.push('/dashboard');
  } catch (err) {
    error.value =
      err.response?.data?.message || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>
