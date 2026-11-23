<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, Award, BookOpen, Briefcase, CheckCircle2, ExternalLink, GraduationCap, School, Sparkles } from 'lucide-vue-next';
import PortalPageShell from '../components/PortalPageShell.vue';
import { useI18n } from '../composables/useI18n.js';
import { usePortalContent } from '../composables/usePortalContent.js';

const route = useRoute();
const { t } = useI18n();
const { mergeProgramCard, mergeProgramDetail } = usePortalContent();

const programIcons = {
  'book-open': BookOpen,
  school: School,
  sparkles: Sparkles
};

const slug = computed(() => String(route.params.slug || '').toLowerCase());
const allCards = computed(() => (t('courses.cards') || []).map(mergeProgramCard));
const prodiCard = computed(() => allCards.value.find((card) => card.id === slug.value) || null);
const prodiDetail = computed(() => mergeProgramDetail(slug.value, (t('portalPages.programs') || {})[slug.value] || null));
const prodiIcon = computed(() => programIcons[prodiCard.value?.icon] || GraduationCap);
const isMissing = computed(() => !prodiCard.value || !prodiDetail.value);

const otherPrograms = computed(() =>
  allCards.value
    .filter((card) => card.id !== slug.value)
    .map((card) => ({
      to: `/program-studi/${card.id}`,
      label: card.title
    }))
);
</script>

<template>
  <PortalPageShell
    :category="t('portalPages.common.studyProgramCategory')"
    :title="prodiCard?.title || t('portalPages.common.notFoundTitle')"
    :missing="isMissing"
    :other-title="t('portalPages.common.otherProgramsHeading')"
    :other-links="otherPrograms"
  >
    <template v-if="!isMissing">
      <section class="overflow-hidden rounded-3xl border border-surface-border bg-white shadow-card">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border bg-gradient-to-br from-brand-50/80 via-white to-white px-6 py-6 sm:px-8">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-200 bg-brand-100 text-brand-700 shadow-sm">
            <component :is="prodiIcon" class="h-8 w-8" aria-hidden="true" />
          </div>
          <span class="rounded-full bg-amber-400 px-3.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
            {{ prodiCard.badge }}
          </span>
        </div>

        <div class="p-6 sm:p-8 space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <GraduationCap class="h-3.5 w-3.5" />
              {{ prodiCard.code }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <Award class="h-3.5 w-3.5" />
              {{ prodiDetail.degree }}
            </span>
          </div>

          <h1 class="text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
            {{ prodiCard.title }}
          </h1>

          <p class="text-sm leading-relaxed text-slate-600 sm:text-base">
            {{ prodiCard.description }}
          </p>
          <p class="text-sm leading-relaxed text-slate-600">
            {{ prodiDetail.overview }}
          </p>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 sm:p-7 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">
          {{ t('portalPages.common.curriculumHeading') }}
        </h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="item in prodiDetail.highlights"
            :key="item"
            class="flex items-start gap-2.5 rounded-xl border border-surface-border bg-surface-page p-3.5"
          >
            <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span class="text-sm text-slate-700 leading-relaxed">{{ item }}</span>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 sm:p-7 shadow-card space-y-4">
        <div class="flex items-center gap-2">
          <Briefcase class="h-5 w-5 text-brand-600" />
          <h2 class="text-lg font-extrabold text-brand-900">
            {{ t('portalPages.common.careerHeading') }}
          </h2>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="career in prodiDetail.careers"
            :key="career"
            class="rounded-xl border border-surface-border bg-brand-50/60 px-4 py-3 text-sm font-semibold text-brand-900"
          >
            {{ career }}
          </div>
        </div>
      </section>
    </template>

    <template #sidebar-top>
      <section v-if="!isMissing" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <div class="space-y-2.5 text-sm">
          <div class="flex items-center justify-between gap-2 border-b border-surface-border pb-2">
            <span class="text-slate-500">{{ t('portalPages.common.accreditationLabel') }}</span>
            <span class="font-bold text-brand-900">{{ prodiCard.badge }}</span>
          </div>
          <div class="flex items-center justify-between gap-2 border-b border-surface-border pb-2">
            <span class="text-slate-500">{{ t('portalPages.common.degreeLabel') }}</span>
            <span class="font-bold text-brand-900">{{ prodiDetail.degree }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-500">{{ t('portalPages.common.modeLabel') }}</span>
            <span class="font-bold text-brand-900 text-right">{{ prodiDetail.studyMode }}</span>
          </div>
        </div>

        <a
          :href="prodiCard.pmbUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 transition"
        >
          <span>{{ t('courses.pmbBtn') }}</span>
          <ExternalLink class="h-4 w-4" />
        </a>

        <router-link
          to="/#courses-section"
          class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-page px-4 text-sm font-semibold text-slate-700 hover:bg-brand-50 transition"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>{{ t('portalPages.common.backHomeBtn') }}</span>
        </router-link>
      </section>
    </template>
  </PortalPageShell>
</template>
