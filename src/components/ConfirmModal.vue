<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs text-center">
      <div class="mb-6 text-lg font-medium">
        <slot />
      </div>
      <div class="flex justify-between gap-4">
        <button
          @click="$emit('cancel')"
          class="flex-1 py-2 rounded bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          class="flex-1 py-2 rounded bg-[#0B2341] text-white font-semibold hover:bg-[#233d5a]"
        >
          Yes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean
});
</script>