<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Plus, RefreshCw } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';
import { usePortalContent } from '../composables/usePortalContent.js';
import { useToast } from '../composables/useToast.js';
import { extractApiError } from '../services/api.js';
import { guestLectureService } from '../services/guestLecture.service.js';
import GuestLectureIncompleteList from '../components/guest-lecture/GuestLectureIncompleteList.vue';
import GuestLectureTrackingList from '../components/guest-lecture/GuestLectureTrackingList.vue';
import GuestLectureDrawer from '../components/guest-lecture/GuestLectureDrawer.vue';
import GuestLectureFormModal from '../components/guest-lecture/GuestLectureFormModal.vue';
import GuestLectureZoomModal from '../components/guest-lecture/GuestLectureZoomModal.vue';

const { t } = useI18n();
const { contacts } = usePortalContent();
const toast = useToast();

const loading = ref(true);
const refreshing = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const needsAppsScriptDeploy = ref(false);
const resolvedScriptUrl = ref('');
const fallbackIframeRef = ref(null);
const iframeAutoHeight = ref(0);
const activeTab = ref('tracking');
const offline = ref(typeof navigator !== 'undefined' && !navigator.onLine);

const prodiList = ref(['PAI', 'PIAUD', 'PGMI']);
const dosenList = ref([]);
const incompleteLectures = ref([]);
const trackingLectures = ref([]);

const selectedIncomplete = ref(null);
const newModalOpen = ref(false);
const zoomModalItem = ref(null);

const fallbackUrl = computed(() => resolvedScriptUrl.value || contacts.value.guestLectureUrl);
const isIframeFallback = computed(
  () => !offline.value && !loading.value && needsAppsScriptDeploy.value
);
const iframeStyle = computed(() =>
  iframeAutoHeight.value > 0 ? { height: `${iframeAutoHeight.value}px` } : undefined
);

function isTrustedHeightOrigin(origin) {
  if (!origin || origin === 'null') return false;
  if (typeof window !== 'undefined' && origin === window.location.origin) return true;
  return (
    origin === 'https://script.google.com' ||
    origin.endsWith('.googleusercontent.com') ||
    origin.endsWith('.script.google.com')
  );
}

function handleIframeMessage(event) {
  if (!isTrustedHeightOrigin(event.origin)) return;
  if (fallbackIframeRef.value?.contentWindow && event.source !== fallbackIframeRef.value.contentWindow) {
    return;
  }
  const payload = event.data;
  if (!payload || payload.type !== 'TARBIYAH_GUEST_LECTURE_HEIGHT') return;
  const parsedHeight = Number(payload.height);
  if (Number.isFinite(parsedHeight) && parsedHeight >= 400 && parsedHeight <= 30000) {
    iframeAutoHeight.value = Math.ceil(parsedHeight);
  }
}

function syncOfflineState() {
  offline.value = !navigator.onLine;
  if (!offline.value && (errorMessage.value || (!needsAppsScriptDeploy.value && trackingLectures.value.length === 0))) {
    loadData();
  }
}

async function loadData(forceRefresh = false) {
  if (offline.value) {
    loading.value = false;
    return;
  }
  if (forceRefresh) {
    refreshing.value = true;
  } else {
    loading.value = true;
  }
  errorMessage.value = '';

  try {
    const res = await guestLectureService.fetchData({ refresh: forceRefresh });
    if (res?.fallbackUrl) {
      resolvedScriptUrl.value = res.fallbackUrl;
    }
    if (res?.needsAppsScriptDeploy) {
      needsAppsScriptDeploy.value = true;
      return;
    }
    needsAppsScriptDeploy.value = false;
    const payload = res?.data || {};
    prodiList.value =
      Array.isArray(payload.prodiList) && payload.prodiList.length
        ? payload.prodiList
        : ['PAI', 'PIAUD', 'PGMI'];
    dosenList.value = Array.isArray(payload.dosenList) ? payload.dosenList : [];
    incompleteLectures.value = Array.isArray(payload.incompleteLectures) ? payload.incompleteLectures : [];
    trackingLectures.value = Array.isArray(payload.trackingLectures) ? payload.trackingLectures : [];

    if (!forceRefresh && trackingLectures.value.length === 0 && incompleteLectures.value.length > 0) {
      activeTab.value = 'incomplete';
    }
    if (forceRefresh) {
      toast.success(t('guestLecture.refreshSuccessToast'));
    }
  } catch (err) {
    errorMessage.value = extractApiError(err);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function handleSubmitAgenda(payload) {
  submitting.value = true;
  try {
    const res = await guestLectureService.submitAgenda(payload);
    toast.success(res?.message || t('guestLecture.refreshSuccessToast'));
    selectedIncomplete.value = null;
    newModalOpen.value = false;
    activeTab.value = res?.isComplete ? 'tracking' : 'incomplete';
    await loadData(true);
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  window.addEventListener('online', syncOfflineState);
  window.addEventListener('offline', syncOfflineState);
  window.addEventListener('message', handleIframeMessage);
  loadData(false);
});

onUnmounted(() => {
  window.removeEventListener('online', syncOfflineState);
  window.removeEventListener('offline', syncOfflineState);
  window.removeEventListener('message', handleIframeMessage);
});
</script>

<template>
  <section
    :aria-label="t('guestLecture.title')"
    class="bg-surface-page"
    :class="isIframeFallback ? 'min-h-[calc(100dvh-73px)]' : 'min-h-[calc(100vh-73px)] py-8 sm:py-10'"
  >
    <iframe
      v-if="isIframeFallback"
      ref="fallbackIframeRef"
      :src="fallbackUrl"
      :title="t('guestLecture.iframeTitle')"
      :style="iframeStyle"
      :scrolling="iframeAutoHeight > 0 ? 'no' : 'auto'"
      class="block w-full border-0"
      :class="iframeAutoHeight > 0 ? 'overflow-hidden' : 'h-[calc(100dvh-138px)] lg:h-[calc(100dvh-73px)]'"
      loading="eager"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      referrerpolicy="strict-origin-when-cross-origin"
    />

    <div v-else class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
      <div
        v-if="offline"
        role="alert"
        class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
      >
        <p class="font-medium">{{ t('guestLecture.unavailable') }}</p>
        <button
          type="button"
          class="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
          @click="syncOfflineState"
        >
          <RefreshCw class="h-3.5 w-3.5" aria-hidden="true" />
          <span>{{ t('guestLecture.retryBtn') }}</span>
        </button>
      </div>

      <div
        v-if="loading && !offline"
        role="status"
        aria-live="polite"
        class="rounded-3xl border border-surface-border bg-white p-8 text-center shadow-card space-y-3"
      >
        <RefreshCw class="mx-auto h-7 w-7 animate-spin text-brand-600" aria-hidden="true" />
        <p class="text-sm font-semibold text-slate-600">{{ t('guestLecture.loading') }}</p>
      </div>

      <div
        v-else-if="errorMessage && !offline"
        role="alert"
        class="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-card space-y-4"
      >
        <p class="text-sm font-semibold text-rose-700">{{ errorMessage }}</p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            class="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-brand-600 px-5 text-xs font-bold text-white transition hover:bg-brand-700"
            @click="loadData(false)"
          >
            <RefreshCw class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('guestLecture.retryBtn') }}</span>
          </button>
        </div>
      </div>

      <template v-else-if="!offline">
        <header class="flex flex-col gap-4 rounded-3xl bg-brand-900 px-6 py-6 text-white shadow-float sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div class="flex items-start gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-sm font-extrabold tracking-wide text-white">
              FT
            </div>
            <div class="min-w-0">
              <h1 class="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                {{ t('guestLecture.heroHeading') }}
              </h1>
              <p class="mt-1 max-w-2xl text-xs leading-relaxed text-slate-200 sm:text-sm">
                {{ t('guestLecture.heroSubtitle') }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-extrabold text-brand-900 shadow-card transition hover:bg-brand-50 sm:text-sm"
            @click="newModalOpen = true"
          >
            <Plus class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('guestLecture.addNewBtn') }}</span>
          </button>
        </header>

        <div
          role="tablist"
          :aria-label="t('guestLecture.title')"
          class="grid grid-cols-2 gap-2 rounded-2xl border border-surface-border bg-white p-1.5 shadow-card"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'incomplete'"
            class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition sm:text-sm"
            :class="
              activeTab === 'incomplete'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-surface-page hover:text-brand-900'
            "
            @click="activeTab = 'incomplete'"
          >
            <span>{{ t('guestLecture.tabIncomplete') }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
              :class="activeTab === 'incomplete' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'"
            >
              {{ incompleteLectures.length }}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'tracking'"
            class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition sm:text-sm"
            :class="
              activeTab === 'tracking'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-surface-page hover:text-brand-900'
            "
            @click="activeTab = 'tracking'"
          >
            <span>{{ t('guestLecture.tabTracking') }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
              :class="activeTab === 'tracking' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'"
            >
              {{ trackingLectures.length }}
            </span>
          </button>
        </div>

        <GuestLectureIncompleteList
          v-if="activeTab === 'incomplete'"
          :items="incompleteLectures"
          @select="selectedIncomplete = $event"
        />

        <GuestLectureTrackingList
          v-else
          :items="trackingLectures"
          :prodi-list="prodiList"
          :refreshing="refreshing"
          @refresh="loadData(true)"
          @open-zoom="zoomModalItem = $event"
          @edit="selectedIncomplete = $event"
        />
      </template>
    </div>

    <GuestLectureDrawer
      :open="Boolean(selectedIncomplete)"
      :item="selectedIncomplete"
      :dosen-list="dosenList"
      :submitting="submitting"
      @close="selectedIncomplete = null"
      @submit="handleSubmitAgenda"
    />

    <GuestLectureFormModal
      :open="newModalOpen"
      :dosen-list="dosenList"
      :submitting="submitting"
      @close="newModalOpen = false"
      @submit="handleSubmitAgenda"
    />

    <GuestLectureZoomModal
      :open="Boolean(zoomModalItem)"
      :item="zoomModalItem"
      @close="zoomModalItem = null"
    />
  </section>
</template>
