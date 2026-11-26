<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Award, Briefcase, CheckCircle2, ChevronRight, ExternalLink, GraduationCap } from 'lucide-vue-next';
import ModalDialog from '../components/ModalDialog.vue';
import PortalEmbedModal from '../components/PortalEmbedModal.vue';
import PortalPageShell from '../components/PortalPageShell.vue';
import { useI18n } from '../composables/useI18n.js';
import { usePortalContent } from '../composables/usePortalContent.js';

const route = useRoute();
const { t } = useI18n();
const { mergeProgramCard, mergeProgramDetail } = usePortalContent();

const slug = computed(() => String(route.params.slug || '').toLowerCase());
const comingSoonModalItem = ref(null);
const visionModalOpen = ref(false);
const allCards = computed(() => (t('courses.cards') || []).map(mergeProgramCard));
const prodiCard = computed(() => allCards.value.find((card) => card.id === slug.value) || null);
const prodiDetail = computed(() => mergeProgramDetail(slug.value, (t('portalPages.programs') || {})[slug.value] || null));
const isMissing = computed(() => !prodiCard.value || !prodiDetail.value);
const hasVisionMissionObjectives = computed(() =>
  Boolean(prodiDetail.value?.vision || prodiDetail.value?.missions?.length || prodiDetail.value?.objectives?.length)
);

watch(slug, () => {
  comingSoonModalItem.value = null;
  visionModalOpen.value = false;
});

function handleVisionMissionClick() {
  if (hasVisionMissionObjectives.value) {
    visionModalOpen.value = true;
    return;
  }
  openComingSoon('programVisionMissionBtn');
}

function openComingSoon(labelKey) {
  comingSoonModalItem.value = {
    label: t(`portalPages.common.${labelKey}`),
    badge: t('portalPages.common.comingSoonShortBadge'),
    description: t('portalPages.common.comingSoonPageInfoDesc')
  };
}

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
    :hide-contact-card="true"
    :other-title="t('portalPages.common.otherProgramsHeading')"
    :other-links="otherPrograms"
  >
    <template v-if="!isMissing">
      <section class="overflow-hidden rounded-3xl border border-surface-border bg-white shadow-card">
        <div class="p-6 sm:p-8 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
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
            <span class="rounded-full bg-amber-400 px-3.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
              {{ prodiCard.badge }}
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
            <span class="font-bold text-brand-900">{{ prodiDetail.accreditationStatus }}</span>
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
          v-if="prodiDetail.accreditationUrl"
          :href="prodiDetail.accreditationUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 transition"
        >
          <span>{{ t('portalPages.common.accreditationCertBtn') }}</span>
          <ExternalLink class="h-4 w-4" />
        </a>
        <button
          v-else
          type="button"
          class="flex min-h-[46px] w-full items-center justify-between gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 transition"
          @click="openComingSoon('accreditationCertBtn')"
        >
          <span>{{ t('portalPages.common.accreditationCertBtn') }}</span>
          <span class="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {{ t('portalPages.common.comingSoonShortBadge') }}
          </span>
        </button>

        <button
          type="button"
          data-testid="prodi-vision-mission-btn"
          class="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-page px-4 text-left text-sm font-semibold text-slate-700 hover:bg-brand-50 transition"
          @click="handleVisionMissionClick"
        >
          <span>{{ t('portalPages.common.programVisionMissionBtn') }}</span>
          <ChevronRight v-if="hasVisionMissionObjectives" class="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          <span v-else class="shrink-0 rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
            {{ t('portalPages.common.comingSoonShortBadge') }}
          </span>
        </button>
      </section>

      <section v-if="!isMissing" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-base font-extrabold text-brand-900">{{ t('portalPages.common.teachingStaffHeading') }}</h2>
        <div class="space-y-2.5">
          <button
            type="button"
            data-testid="prodi-leadership-btn"
            class="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 transition"
            @click="openComingSoon('programLeadershipBtn')"
          >
            <span>{{ t('portalPages.common.programLeadershipBtn') }}</span>
            <span class="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              {{ t('portalPages.common.comingSoonShortBadge') }}
            </span>
          </button>
          <router-link
            :to="`/program-studi/${slug}/dosen`"
            data-testid="prodi-lecturers-link"
            class="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-page px-4 text-sm font-semibold text-brand-900 hover:bg-brand-50 transition"
          >
            <span>{{ t('portalPages.common.programLecturersBtn') }}</span>
            <ChevronRight class="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          </router-link>
        </div>
      </section>
    </template>
  </PortalPageShell>

  <ModalDialog
    :open="visionModalOpen"
    :title="`${t('portalPages.common.programVisionMissionBtn')} · ${prodiCard?.title || ''}`"
    header-variant="macos"
    @close="visionModalOpen = false"
  >
    <div v-if="prodiDetail" class="space-y-5">
      <div v-if="prodiDetail.vision" class="rounded-2xl border border-brand-100 bg-brand-50/70 p-5">
        <span class="inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {{ t('portalPages.common.visionBadge') }}
        </span>
        <p class="mt-3 text-sm leading-relaxed font-medium text-brand-900 sm:text-base">
          {{ prodiDetail.vision }}
        </p>
      </div>

      <div v-if="prodiDetail.missions?.length" class="rounded-2xl border border-surface-border bg-surface-page p-5">
        <span class="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-900">
          {{ t('portalPages.common.missionBadge') }}
        </span>
        <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700 sm:text-base">
          <li v-for="item in prodiDetail.missions" :key="item">
            {{ item }}
          </li>
        </ol>
      </div>

      <div v-if="prodiDetail.objectives?.length" class="rounded-2xl border border-surface-border bg-surface-page p-5">
        <span class="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {{ t('portalPages.common.objectivesBadge') }}
        </span>
        <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700 sm:text-base">
          <li v-for="item in prodiDetail.objectives" :key="item">
            {{ item }}
          </li>
        </ol>
      </div>
    </div>
  </ModalDialog>

  <PortalEmbedModal :open="Boolean(comingSoonModalItem)" :item="comingSoonModalItem" @close="comingSoonModalItem = null" />
</template>
