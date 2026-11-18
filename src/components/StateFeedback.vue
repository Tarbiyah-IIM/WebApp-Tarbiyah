<script setup>
import { AlertTriangle, Inbox, WifiOff, RefreshCw } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';

defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  offline: { type: Boolean, default: false },
  empty: { type: Boolean, default: false },
  emptyTitle: { type: String, default: '' },
  emptyDescription: { type: String, default: '' }
});

defineEmits(['retry']);

const { t } = useI18n();
</script>

<template>
  <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
    <div
      v-for="idx in 3"
      :key="idx"
      class="animate-pulse rounded-2xl border border-surface-border bg-white p-5 shadow-card"
    >
      <div class="h-40 rounded-xl bg-slate-200 mb-4" />
      <div class="h-4 w-24 rounded bg-slate-200 mb-3" />
      <div class="h-5 w-3/4 rounded bg-slate-200 mb-2" />
      <div class="h-4 w-1/2 rounded bg-slate-200" />
    </div>
  </div>

  <div
    v-else-if="error"
    class="rounded-2xl border border-rose-200 bg-rose-50/70 p-8 text-center"
    role="alert"
  >
    <WifiOff v-if="offline" class="mx-auto h-10 w-10 text-rose-600 mb-3" />
    <AlertTriangle v-else class="mx-auto h-10 w-10 text-rose-600 mb-3" />
    <h3 class="text-lg font-semibold text-brand-900 mb-1">
      {{ offline ? t('feedback.offlineTitle') : t('feedback.errorTitle') }}
    </h3>
    <p class="text-sm text-slate-600 max-w-md mx-auto mb-5">{{ error }}</p>
    <button
      type="button"
      class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition"
      @click="$emit('retry')"
    >
      <RefreshCw class="h-4 w-4" />
      {{ t('feedback.retryBtn') }}
    </button>
  </div>

  <div
    v-else-if="empty"
    class="rounded-2xl border border-surface-border bg-white p-10 text-center shadow-card"
  >
    <Inbox class="mx-auto h-10 w-10 text-slate-400 mb-3" />
    <h3 class="text-lg font-semibold text-brand-900 mb-1">{{ emptyTitle || t('feedback.noDataTitle') }}</h3>
    <p class="text-sm text-slate-600 max-w-md mx-auto mb-5">{{ emptyDescription || t('feedback.noDataDesc') }}</p>
    <slot name="empty-action" />
  </div>

  <slot v-else />
</template>
