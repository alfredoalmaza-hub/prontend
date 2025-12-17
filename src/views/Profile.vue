<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Info -->
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="text-center">
          <div class="w-32 h-32 mx-auto mb-4 rounded-full bg-light flex items-center justify-center overflow-hidden">
            <img
              v-if="user?.profile_picture"
              :src="'http://localhost:8000' + user.profile_picture"
              alt="Profile"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-4xl text-gray-400">👤</span>
          </div>
          <h3 class="text-xl font-semibold">{{ user?.username }}</h3>
          <p class="text-gray-600">{{ user?.role }}</p>
          <p class="text-sm text-gray-500 mt-2">{{ user?.email }}</p>

          <div class="mt-4">
            <input
              type="file"
              ref="fileInput"
              @change="uploadProfilePicture"
              accept="image/*"
              class="hidden"
            />
            <button
              @click="$refs.fileInput.click()"
              class="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 text-sm"
            >
              Change Picture
            </button>
          </div>
        </div>
      </div>

      <!-- Update Profile Form -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Update Profile</h2>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              v-model="profileForm.username"
              required
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="profileForm.email"
              type="email"
              required
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-primary text-white py-2 rounded-md hover:bg-opacity-90"
          >
            Update Profile
          </button>
        </form>
      </div>

      <!-- Change Password Form -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Change Password</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              v-model="passwordForm.current_password"
              type="password"
              required
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              v-model="passwordForm.password"
              type="password"
              required
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              v-model="passwordForm.password_confirmation"
              type="password"
              required
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-primary text-white py-2 rounded-md hover:bg-opacity-90"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>

    <!-- Logout Section -->
    <div class="mt-6 bg-white p-6 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4">Account Actions</h2>
      <button
        @click="showLogoutConfirm = true"
        class="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>

    <!-- Logout Confirm Dialog -->
    <ConfirmDialog
      :show="showLogoutConfirm"
      @cancel="showLogoutConfirm = false"
      @confirm="confirmLogout"
    >
      Are you sure you want to logout?
    </ConfirmDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import ConfirmDialog from '../components/ConfirmDialog.vue';

const authStore = useAuthStore();
const router = useRouter();

const user = computed(() => authStore.user);

const profileForm = ref({
  username: '',
  email: ''
});

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
});

// logout confirm dialog state
const showLogoutConfirm = ref(false);

onMounted(() => {
  profileForm.value.username = user.value?.username || '';
  profileForm.value.email = user.value?.email || '';
});

const updateProfile = async () => {
  try {
    await authStore.updateProfile(profileForm.value);
    alert('Profile updated successfully');
  } catch (error) {
    alert('Failed to update profile');
  }
};

const changePassword = async () => {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    alert('Passwords do not match');
    return;
  }

  try {
    await authStore.updatePassword(passwordForm.value);
    passwordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: ''
    };
    alert('Password changed successfully');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to change password');
  }
};

const confirmLogout = async () => {
  showLogoutConfirm.value = false;
  await authStore.logout();
  router.push('/login');
};

const uploadProfilePicture = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('profile_picture', file);

  try {
    await authStore.updateProfilePicture(formData);
    alert('Profile picture updated successfully');
  } catch (error) {
    alert('Failed to upload profile picture');
  }
};
</script>
