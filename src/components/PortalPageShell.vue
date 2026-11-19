<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ArrowLeft, ChevronRight, Home, WifiOff } from 'lucide-vue-next';
import FooterSection from './FooterSection.vue';
import StateFeedback from './StateFeedback.vue';
import { useLandingStore } from '../stores/landing.store.js';
import { useI18n } from '../composables/useI18n.js';

defineProps({
  category: { type: String, required: true },
  title: { type: String, required: true },
  missing: { type: Boolean, default: false },
  hideSidebar: { type: Boolean, default: false },
  hideContactCard: { type: Boolean, default: false },
  otherTitle: { type: String, default: '' },
  otherLinks: { type: Array, default: () => [] }
});

defineEmits(['pending-link']);

const landingStore = useLandingStore();
const { t } = useI18n();
const isOffline = ref(typeof navigator !== 'undefined' ? !navigator.onLine : false);

const settings = computed(() => landingStore.data?.settings || {});
const contactEmail = computed(() => settings.value.contact_email || 'tarbiyah@iim.ac.id');

function syncOnlineStatus() {
  isOffline.value = typeof navigator !== 'undefined' ? !navigator.onLine : false;
}

function loadPortalSync() {
  if (!landingStore.data) {
    landingStore.fetchLanding().catch(() => {});
  }
}

onMounted(() => {
  loadPortalSync();
  window.addEventListener('online', syncOnlineStatus);
  window.addEventListener('offline', syncOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', syncOnlineStatus);
  window.removeEventListener('offline', syncOnlineStatus);
});
</script>

<template>
  <div class="bg-surface-page">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" class="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
        <router-link to="/" class="inline-flex min-h-[36px] items-center gap-1 text-brand-700 hover:underline">
          <Home class="h-3.5 w-3.5" />
          <span>{{ t('portalPages.common.homeLabel') }}</span>
        </router-link>
        <ChevronRight class="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span>{{ category }}</span>
        <ChevronRight class="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span class="text-brand-900">{{ title }}</span>
      </nav>

      <div
        v-if="isOffline || landingStore.error"
        class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900"
        role="status"
      >
        <div class="flex items-center gap-2">
          <WifiOff class="h-4 w-4 shrink-0" />
          <span>{{ t('portalPages.common.offlineNotice') }}</span>
        </div>
        <button
          type="button"
          class="min-h-[36px] rounded-xl border border-amber-300 bg-white px-3 font-bold text-amber-900 hover:bg-amber-100"
          @click="landingStore.fetchLanding(true).catch(() => {})"
        >
          {{ t('portalPages.common.retryBtn') }}
        </button>
      </div>

      <StateFeedback
        :empty="missing"
        :empty-title="t('portalPages.common.notFoundTitle')"
        :empty-description="t('portalPages.common.notFoundDesc')"
      >
        <template #empty-action>
          <router-link
            to="/"
            class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 transition"
          >
            {{ t('portalPages.common.backHomeBtn') }}
          </router-link>
        </template>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div class="space-y-6" :class="hideSidebar ? 'lg:col-span-12' : 'lg:col-span-8'">
            <slot />

            <div v-if="hideSidebar" class="pt-1">
              <router-link
                to="/"
                class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-surface-border bg-white px-5 text-sm font-semibold text-slate-700 shadow-card hover:bg-brand-50 transition"
              >
                <ArrowLeft class="h-4 w-4" />
                <span>{{ t('portalPages.common.backHomeBtn') }}</span>
              </router-link>
            </div>
          </div>

          <aside v-if="!hideSidebar" class="space-y-6 lg:col-span-4">
            <slot name="sidebar-top" />

            <section v-if="!hideContactCard" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
              <h2 class="text-base font-extrabold text-brand-900">{{ t('portalPages.common.contactHeading') }}</h2>
              <div class="rounded-xl border border-surface-border bg-surface-page px-4 py-3">
                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {{ t('portalPages.common.emailLabel') }}
                </p>
                <a :href="`mailto:${contactEmail}`" class="mt-0.5 block text-sm font-bold text-brand-700 hover:underline">
                  {{ contactEmail }}
                </a>
              </div>
              <div class="space-y-2.5">
                <a
                  href="https://wa.link/qrwv15"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 transition"
                >
                  {{ t('portalPages.common.waAdminLabel') }}
                </a>
                <a
                  href="https://wa.link/agu1p5"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-surface-border bg-surface-page px-4 text-sm font-semibold text-brand-900 hover:bg-brand-50 transition"
                >
                  {{ t('portalPages.common.waPmbLabel') }}
                </a>
              </div>
            </section>

            <section v-if="otherLinks.length" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-3">
              <h2 class="text-base font-extrabold text-brand-900">{{ otherTitle }}</h2>
              <div class="space-y-2">
                <template v-for="item in otherLinks" :key="item.to || item.label">
                  <router-link
                    v-if="item.to"
                    :to="item.to"
                    class="flex min-h-[44px] items-center justify-between rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span>{{ item.label }}</span>
                    <ChevronRight class="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  </router-link>
                  <button
                    v-else
                    type="button"
                    class="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left text-sm font-semibold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
                    @click="$emit('pending-link', item)"
                  >
                    <span>{{ item.label }}</span>
                    <span
                      class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="item.modalUrl ? 'bg-brand-50 text-brand-700' : 'bg-surface-muted text-slate-500'"
                    >
                      {{ item.badge || t('portalPages.common.comingSoonBadge') }}
                    </span>
                  </button>
                </template>
              </div>
            </section>
          </aside>
        </div>
      </StateFeedback>
    </div>

    <FooterSection :settings="settings" />
  </div>
</template>
