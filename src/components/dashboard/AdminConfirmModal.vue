<script setup>
import { onMounted, onUnmounted } from 'vue';
import { AlertTriangle, X } from 'lucide-vue-next';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  cancelLabel: { type: String, required: true },
  busy: { type: Boolean, default: false }
});

const emit = defineEmits(['confirm', 'cancel']);

function handleKeydown(event) {
  if (props.open && event.key === 'Escape' && !props.busy) {
    emit('cancel');
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      @click.self="!busy && emit('cancel')"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="w-full max-w-md rounded-2xl border border-surface-border bg-white p-6 shadow-float"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle class="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-brand-900">{{ title }}</h3>
              <p class="mt-1 text-sm leading-relaxed text-slate-600">{{ description }}</p>
            </div>
          </div>
          <button
            type="button"
            :disabled="busy"
            :aria-label="cancelLabel"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-surface-muted hover:text-brand-900"
            @click="emit('cancel')"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            :disabled="busy"
            class="min-h-[40px] rounded-xl border border-surface-border bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-surface-muted disabled:opacity-50"
            @click="emit('cancel')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            :disabled="busy"
            class="min-h-[40px] rounded-xl bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
