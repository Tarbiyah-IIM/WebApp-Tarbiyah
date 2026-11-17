<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' }
});

const emit = defineEmits(['close']);

function handleKey(e) {
  if (e.key === 'Escape' && props.open) {
    emit('close');
  }
}

onMounted(() => window.addEventListener('keydown', handleKey));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey));
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    @click.self="$emit('close')"
  >
    <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-float">
      <div class="flex items-center justify-between border-b border-surface-border pb-3 mb-5">
        <h3 class="text-lg font-extrabold text-brand-900">{{ title }}</h3>
        <button
          type="button"
          class="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-brand-900"
          aria-label="Close modal"
          @click="$emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
