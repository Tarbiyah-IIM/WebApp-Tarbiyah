<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { ExternalLink } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';

const formUrl = 'https://script.google.com/macros/s/AKfycbwjx4f_R-H4MXwGpjMyI8X-BpGKASOTfkuwqMWp1JkjcvPRYyhiI9C00gMQTp351LHo/exec';
const { t } = useI18n();
const loading = ref(true);
const loadFailed = ref(false);
const offline = ref(typeof navigator !== 'undefined' && !navigator.onLine);
let loadTimeout;

function syncOfflineState() {
  offline.value = !navigator.onLine;
}

function handleFrameLoad() {
  loading.value = false;
  loadFailed.value = false;
  window.clearTimeout(loadTimeout);
}

function handleFrameError() {
  loading.value = false;
  loadFailed.value = true;
  window.clearTimeout(loadTimeout);
}

onMounted(() => {
  window.addEventListener('online', syncOfflineState);
  window.addEventListener('offline', syncOfflineState);
  loadTimeout = window.setTimeout(() => {
    if (loading.value) {
      loading.value = false;
      loadFailed.value = true;
    }
  }, 15000);
});

onUnmounted(() => {
  window.clearTimeout(loadTimeout);
  window.removeEventListener('online', syncOfflineState);
  window.removeEventListener('offline', syncOfflineState);
});
</script>

<template>
  <section :aria-label="t('guestLecture.title')" class="bg-surface-page">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
        <p v-if="loading && !offline" class="px-4 py-3 text-sm text-slate-600" role="status" aria-live="polite">
          {{ t('guestLecture.loading') }}
        </p>
        <div v-if="offline || loadFailed" class="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p role="alert">{{ t('guestLecture.unavailable') }}</p>
          <a
            :href="formUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-[44px] items-center gap-2 font-semibold underline underline-offset-2"
          >
            {{ t('guestLecture.openDirect') }}
            <ExternalLink class="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
        <iframe
          :src="formUrl"
          :title="t('guestLecture.iframeTitle')"
          class="block h-[calc(100dvh-15rem)] min-h-[600px] w-full border-0 sm:h-[calc(100dvh-17rem)] lg:h-[calc(100dvh-19rem)]"
          loading="eager"
          referrerpolicy="strict-origin-when-cross-origin"
          @load="handleFrameLoad"
          @error="handleFrameError"
        />
      </div>
    </div>
  </section>
</template>
