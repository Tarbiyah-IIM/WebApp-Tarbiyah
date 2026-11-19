<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  headerVariant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'macos'].includes(value)
  }
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
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @click.self="$emit('close')"
    >
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-float">
        <div
          v-if="headerVariant === 'macos'"
          class="flex items-center justify-between gap-3 border-b border-surface-border pb-3 mb-5"
        >
          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              class="group inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF5F57] ring-1 ring-black/10 transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label="Close modal"
              @click="$emit('close')"
            >
              <X class="h-2.5 w-2.5 text-[#4D0000] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" />
            </button>
            <span
              class="inline-block h-3.5 w-3.5 rounded-full bg-[#FEBC2E] ring-1 ring-black/10"
              aria-hidden="true"
            />
            <span
              class="inline-block h-3.5 w-3.5 rounded-full bg-[#28C840] ring-1 ring-black/10"
              aria-hidden="true"
            />
          </div>
          <h3 class="text-center text-lg font-extrabold text-brand-900">{{ title }}</h3>
          <span class="w-14 shrink-0" aria-hidden="true" />
        </div>

        <div
          v-else
          class="flex items-center justify-between border-b border-surface-border pb-3 mb-5"
        >
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
  </Teleport>
</template>
