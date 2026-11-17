<script setup>
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next';
import { useUiStore } from '../stores/ui.store.js';

const ui = useUiStore();
</script>

<template>
  <div
    aria-live="polite"
    class="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 pointer-events-none px-4 sm:px-0"
  >
    <div
      v-for="toast in ui.toasts"
      :key="toast.id"
      class="pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-float transition-all"
      :class="{
        'border-emerald-200': toast.type === 'success',
        'border-rose-200': toast.type === 'error',
        'border-brand-200': toast.type === 'info'
      }"
      role="status"
    >
      <CheckCircle2 v-if="toast.type === 'success'" class="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
      <AlertCircle v-else-if="toast.type === 'error'" class="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
      <Info v-else class="h-5 w-5 shrink-0 text-brand-600 mt-0.5" />
      <div class="flex-1 min-w-0">
        <p v-if="toast.title" class="text-sm font-semibold text-brand-900">{{ toast.title }}</p>
        <p class="text-sm text-slate-600 break-words">{{ toast.message }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Close notification"
        @click="ui.removeToast(toast.id)"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
