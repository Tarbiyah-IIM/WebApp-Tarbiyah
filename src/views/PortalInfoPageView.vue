<script setup>
import { computed, ref } from 'vue';
import { ArrowLeft, CheckCircle2, Download, ExternalLink, FileText, Lock } from 'lucide-vue-next';
import PortalEmbedModal from '../components/PortalEmbedModal.vue';
import PortalPageShell from '../components/PortalPageShell.vue';
import WorkPermitFormModal from '../components/WorkPermitFormModal.vue';
import { useI18n } from '../composables/useI18n.js';
import { useToast } from '../composables/useToast.js';

const props = defineProps({
  pageKey: { type: String, required: true }
});

const { t } = useI18n();
const toast = useToast();
const activePopupItem = ref(null);
const workPermitModalOpen = ref(false);

const infoPages = computed(() => t('portalPages.infoPages') || {});
const pageData = computed(() => infoPages.value[props.pageKey] || null);
const categoryLabel = computed(() =>
  pageData.value ? t(`portalPages.common.${pageData.value.categoryKey}`) : t('portalPages.common.academicCategory')
);
const highlightsGridClass = computed(() =>
  pageData.value?.highlights?.length === 1 ? 'sm:grid-cols-1' : 'sm:grid-cols-2'
);

function handlePendingLink(item) {
  if (item?.formType === 'work-permit') {
    workPermitModalOpen.value = true;
    return;
  }
  if (item?.popup || item?.modalUrl) {
    activePopupItem.value = item;
    return;
  }
  const label = item?.label || item?.buttonLabel || '';
  toast.info(t('portalPages.common.pendingNoticePrefix') + label + t('portalPages.common.pendingNoticeSuffix'));
}

const routeMap = {
  'administrasi-persuratan': '/akademik/administrasi-persuratan',
  'ujian-komprehensif': '/akademik/ujian-komprehensif',
  ppl: '/publikasi/ppl',
  pkn: '/publikasi/pkn',
  jurnal: '/publikasi/jurnal'
};

const relatedPages = computed(() =>
  Object.entries(routeMap)
    .filter(([key]) => key !== props.pageKey && infoPages.value[key])
    .map(([key, to]) => ({
      to,
      label: infoPages.value[key].title
    }))
);
</script>

<template>
  <PortalPageShell
    :category="categoryLabel"
    :title="pageData?.title || t('portalPages.common.notFoundTitle')"
    :missing="!pageData"
    :hide-sidebar="Boolean(pageData?.hideSidebar)"
    :hide-contact-card="Boolean(pageData?.hideContactCard)"
    :other-title="pageData?.customOtherTitle || t('portalPages.common.otherPagesHeading')"
    :other-links="pageData?.customOtherLinks || relatedPages"
    @pending-link="handlePendingLink"
  >
    <template v-if="pageData">
      <section class="rounded-3xl border border-surface-border bg-gradient-to-br from-brand-50/80 via-white to-white p-6 sm:p-8 shadow-card space-y-4">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3.5 py-1 text-xs font-bold text-brand-700">
          <FileText class="h-3.5 w-3.5" />
          {{ pageData.badge }}
        </span>
        <h1 class="text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
          {{ pageData.title }}
        </h1>

        <div v-if="pageData.summaryBlocks?.length" class="space-y-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          <template v-for="(block, idx) in pageData.summaryBlocks" :key="idx">
            <p v-if="block.bold" class="font-extrabold text-brand-900">
              {{ block.text }}
            </p>
            <p v-else-if="block.segments">
              <template v-for="(seg, segIdx) in block.segments" :key="segIdx">
                <a
                  v-if="seg.href"
                  :href="seg.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-semibold text-brand-600 underline hover:text-brand-700"
                >
                  {{ seg.label }}
                </a>
                <span v-else>{{ seg.text }}</span>
              </template>
            </p>
            <p v-else>{{ block.text }}</p>
          </template>
        </div>
        <p v-else class="text-sm leading-relaxed text-slate-600 sm:text-base">
          {{ pageData.summary }}
        </p>

        <div v-if="pageData.primaryCta || pageData.secondaryCta" class="flex flex-wrap items-center gap-3 pt-1">
          <a
            v-if="pageData.primaryCta"
            :href="pageData.primaryCta.href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 transition"
          >
            <Download v-if="pageData.primaryCta.icon === 'download'" class="h-4 w-4" />
            <span>{{ pageData.primaryCta.label }}</span>
            <ExternalLink v-if="pageData.primaryCta.icon !== 'download'" class="h-4 w-4" />
          </a>
          <a
            v-if="pageData.secondaryCta"
            :href="pageData.secondaryCta.href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-5 text-sm font-bold text-brand-700 hover:bg-brand-100 transition"
          >
            <span>{{ pageData.secondaryCta.label }}</span>
            <ExternalLink class="h-4 w-4" />
          </a>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 sm:p-7 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">
          {{ pageData.highlightsTitle || t('portalPages.common.highlightsHeading') }}
        </h2>
        <div class="grid grid-cols-1 gap-4" :class="highlightsGridClass">
          <template v-for="item in pageData.highlights" :key="item.title">
            <a
              v-if="item.href"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-start justify-between gap-3 rounded-xl border border-surface-border bg-surface-page p-4 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <div class="space-y-1.5 min-w-0">
                <div class="flex items-start gap-2">
                  <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <h3 class="text-sm font-bold text-brand-900 group-hover:text-brand-700">{{ item.title }}</h3>
                </div>
                <p class="pl-6 text-xs leading-relaxed text-slate-600">{{ item.desc }}</p>
              </div>
              <Download class="mt-0.5 h-4 w-4 shrink-0 text-brand-600 transition group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
            <article
              v-else
              class="rounded-xl border border-surface-border bg-surface-page p-4 space-y-1.5"
            >
              <div class="flex items-start gap-2">
                <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <h3 class="text-sm font-bold text-brand-900">{{ item.title }}</h3>
              </div>
              <p class="pl-6 text-xs leading-relaxed text-slate-600">{{ item.desc }}</p>
            </article>
          </template>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 sm:p-7 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">
          {{ t('portalPages.common.stepsHeading') }}
        </h2>
        <ol class="space-y-3">
          <li
            v-for="(step, idx) in pageData.steps"
            :key="step"
            class="flex items-start gap-3 rounded-xl border border-surface-border bg-surface-page p-3.5"
          >
            <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
              {{ idx + 1 }}
            </span>
            <span class="pt-0.5 text-sm leading-relaxed text-slate-700">{{ step }}</span>
          </li>
        </ol>
      </section>
    </template>

    <template #sidebar-top>
      <section v-if="pageData?.sidebarAction" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-3">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-base font-extrabold text-brand-900">{{ pageData.sidebarAction.title }}</h2>
          <span class="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
            {{ pageData.sidebarAction.badge }}
          </span>
        </div>
        <button
          type="button"
          class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
          @click="handlePendingLink(pageData.sidebarAction)"
        >
          <Lock class="h-4 w-4" />
          <span>{{ pageData.sidebarAction.buttonLabel }}</span>
        </button>
      </section>

      <section v-else-if="pageData" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-3">
        <a
          v-if="pageData.primaryCta"
          :href="pageData.primaryCta.href"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 transition"
        >
          <span>{{ pageData.primaryCta.label }}</span>
          <ExternalLink class="h-4 w-4" />
        </a>
        <router-link
          to="/"
          class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-page px-4 text-sm font-semibold text-slate-700 hover:bg-brand-50 transition"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>{{ t('portalPages.common.backHomeBtn') }}</span>
        </router-link>
      </section>
    </template>
  </PortalPageShell>
  <PortalEmbedModal :open="Boolean(activePopupItem)" :item="activePopupItem" @close="activePopupItem = null" />
  <WorkPermitFormModal :open="workPermitModalOpen" @close="workPermitModalOpen = false" />
</template>
