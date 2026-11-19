<script setup>
import { computed } from 'vue';
import { ArrowLeft, CheckCircle2, ExternalLink, FileText } from 'lucide-vue-next';
import PortalPageShell from '../components/PortalPageShell.vue';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  pageKey: { type: String, required: true }
});

const { t } = useI18n();

const infoPages = computed(() => t('portalPages.infoPages') || {});
const pageData = computed(() => infoPages.value[props.pageKey] || null);
const categoryLabel = computed(() =>
  pageData.value ? t(`portalPages.common.${pageData.value.categoryKey}`) : t('portalPages.common.academicCategory')
);

const routeMap = {
  'administrasi-persuratan': '/akademik/administrasi-persuratan',
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
    :other-title="t('portalPages.common.otherPagesHeading')"
    :other-links="relatedPages"
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
        <p class="text-sm leading-relaxed text-slate-600 sm:text-base">
          {{ pageData.summary }}
        </p>
        <div v-if="pageData.primaryCta" class="pt-1">
          <a
            :href="pageData.primaryCta.href"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 transition"
          >
            <span>{{ pageData.primaryCta.label }}</span>
            <ExternalLink class="h-4 w-4" />
          </a>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 sm:p-7 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">
          {{ pageData.highlightsTitle || t('portalPages.common.highlightsHeading') }}
        </h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article
            v-for="item in pageData.highlights"
            :key="item.title"
            class="rounded-xl border border-surface-border bg-surface-page p-4 space-y-1.5"
          >
            <div class="flex items-start gap-2">
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <h3 class="text-sm font-bold text-brand-900">{{ item.title }}</h3>
            </div>
            <p class="pl-6 text-xs leading-relaxed text-slate-600">{{ item.desc }}</p>
          </article>
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
      <section v-if="pageData" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-3">
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
</template>
