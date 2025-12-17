<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-xl font-semibold">{{ title }}</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <div class="p-6">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="border-t p-4">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Modal'
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>
