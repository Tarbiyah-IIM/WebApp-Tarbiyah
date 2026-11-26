<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Award, ChevronRight, ExternalLink, GraduationCap, Search, Users } from 'lucide-vue-next';
import PortalPageShell from '../components/PortalPageShell.vue';
import LecturerProfileDetail from '../components/LecturerProfileDetail.vue';
import StateFeedback from '../components/StateFeedback.vue';
import { useLandingStore } from '../stores/landing.store.js';
import { useI18n } from '../composables/useI18n.js';
import { usePortalContent } from '../composables/usePortalContent.js';
import {
  TEACHING_STATUS_STYLES,
  extractLecturerIndexes,
  formatRankAndGrade,
  getNameInitials
} from '../utils/lecturers.js';

const route = useRoute();
const router = useRouter();
const landingStore = useLandingStore();
const { t } = useI18n();
const { mergeProgramCard } = usePortalContent();

const searchQuery = ref('');

const slug = computed(() => String(route.params.slug || '').toLowerCase());
const lecturerIdParam = computed(() => {
  if (!route.params.lecturerId) return null;
  const num = Number(route.params.lecturerId);
  return Number.isSafeInteger(num) && num > 0 ? num : -1;
});

const allCards = computed(() => (t('courses.cards') || []).map(mergeProgramCard));
const prodiCard = computed(() => allCards.value.find((card) => card.id === slug.value) || null);
const programLecturers = computed(() => {
  const list = landingStore.data?.lecturers;
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item.program_slug === slug.value);
});

const selectedLecturer = computed(() => {
  if (lecturerIdParam.value === null) return null;
  return programLecturers.value.find((item) => Number(item.id) === lecturerIdParam.value) || null;
});

const isMissing = computed(() => {
  if (!prodiCard.value) return true;
  if (lecturerIdParam.value !== null && landingStore.loaded && !selectedLecturer.value) {
    return true;
  }
  return false;
});

const activeFilter = computed(() => (route.query.filter === 'pimpinan' ? 'pimpinan' : 'all'));

watch(slug, () => {
  searchQuery.value = '';
});

const leadershipLecturers = computed(() =>
  programLecturers.value.filter((item) => Boolean(item.leadership_role && item.leadership_role.trim()))
);

const filteredLecturers = computed(() => {
  const base = activeFilter.value === 'pimpinan' ? leadershipLecturers.value : programLecturers.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return base;
  return base.filter((item) =>
    [item.name, item.nidn, item.academic_rank, item.rank_grade, item.leadership_role, item.education, item.expertise]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q))
  );
});

const directoryBackRoute = computed(() =>
  activeFilter.value === 'pimpinan'
    ? { path: `/program-studi/${slug.value}/dosen`, query: { filter: 'pimpinan' } }
    : `/program-studi/${slug.value}/dosen`
);

const pageTitle = computed(() => {
  if (!prodiCard.value) return t('portalPages.common.lecturers.notFoundTitle');
  if (selectedLecturer.value) {
    return `${t('portalPages.common.lecturers.profilePrefix')} ${selectedLecturer.value.name}`;
  }
  if (lecturerIdParam.value !== null && landingStore.loaded) {
    return t('portalPages.common.lecturers.notFoundTitle');
  }
  return `${t('portalPages.common.lecturers.pageHeading')} · ${prodiCard.value.title}`;
});

const programLabelText = computed(() => {
  if (!prodiCard.value) return '';
  return `${prodiCard.value.code} | ${prodiCard.value.title}`;
});

const activeTeachingCount = computed(
  () => programLecturers.value.filter((item) => item.teaching_status === 'active').length
);

const otherProgramDirectories = computed(() =>
  allCards.value
    .filter((card) => card.id !== slug.value)
    .map((card) => ({
      to: `/program-studi/${card.id}/dosen`,
      label: `${t('portalPages.common.lecturers.pageHeading')} · ${card.title}`
    }))
);

function setFilter(nextFilter) {
  router.replace({
    path: `/program-studi/${slug.value}/dosen`,
    query: nextFilter === 'pimpinan' ? { filter: 'pimpinan' } : {}
  });
}

function resetFilters() {
  searchQuery.value = '';
  if (activeFilter.value !== 'all') {
    setFilter('all');
  }
}

function lecturerDetailRoute(id) {
  return {
    path: `/program-studi/${slug.value}/dosen/${id}`,
    query: activeFilter.value === 'pimpinan' ? { filter: 'pimpinan' } : {}
  };
}
</script>

<template>
  <PortalPageShell
    :category="prodiCard?.title || t('portalPages.common.studyProgramCategory')"
    :title="pageTitle"
    :missing="isMissing"
    :hide-contact-card="true"
    :other-title="t('portalPages.common.otherProgramsHeading')"
    :other-links="otherProgramDirectories"
  >
    <template v-if="selectedLecturer">
      <LecturerProfileDetail
        :lecturer="selectedLecturer"
        :program-label="programLabelText"
        :back-to="directoryBackRoute"
      />
    </template>

    <template v-else-if="prodiCard">
      <section class="rounded-3xl border border-surface-border bg-white p-6 sm:p-8 shadow-card space-y-5">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <GraduationCap class="h-3.5 w-3.5" aria-hidden="true" />
              {{ prodiCard.code }}
            </span>
            <span class="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">
              {{ prodiCard.badge }}
            </span>
          </div>

          <h1 class="text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
            {{ t('portalPages.common.lecturers.pageHeading') }}
          </h1>
          <p class="text-sm text-slate-600 sm:text-base">
            {{ t('portalPages.common.lecturers.directorySubtitle') }} {{ prodiCard.title }}.
          </p>
        </div>

        <div class="flex flex-col gap-3 border-t border-surface-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="inline-flex rounded-xl border border-surface-border bg-surface-page p-1" role="group">
            <button
              type="button"
              data-testid="lecturers-filter-all"
              class="min-h-[38px] rounded-lg px-3.5 text-xs font-bold transition"
              :class="activeFilter === 'all' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-brand-900'"
              @click="setFilter('all')"
            >
              {{ t('portalPages.common.lecturers.allTab') }} ({{ programLecturers.length }})
            </button>
            <button
              type="button"
              data-testid="lecturers-filter-leadership"
              class="min-h-[38px] rounded-lg px-3.5 text-xs font-bold transition"
              :class="activeFilter === 'pimpinan' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-brand-900'"
              @click="setFilter('pimpinan')"
            >
              {{ t('portalPages.common.lecturers.leadershipTab') }} ({{ leadershipLecturers.length }})
            </button>
          </div>

          <div class="relative flex-1 sm:max-w-xs">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="search"
              data-testid="lecturers-search-input"
              :aria-label="t('portalPages.common.lecturers.searchPlaceholder')"
              :placeholder="t('portalPages.common.lecturers.searchPlaceholder')"
              class="min-h-[40px] w-full rounded-xl border border-surface-border bg-surface-page pl-9 pr-3 text-xs text-brand-900"
            />
          </div>
        </div>
      </section>

      <StateFeedback
        v-if="!landingStore.loaded && landingStore.loading"
        :loading="true"
      />

      <StateFeedback
        v-else-if="filteredLecturers.length === 0"
        :empty="true"
        :empty-title="t('portalPages.common.lecturers.emptyDirectoryTitle')"
        :empty-description="t('portalPages.common.lecturers.emptyDirectoryDesc')"
      >
        <template v-if="searchQuery || activeFilter !== 'all'" #empty-action>
          <button
            type="button"
            class="inline-flex min-h-[40px] items-center rounded-xl border border-surface-border bg-white px-4 text-xs font-bold text-brand-700 hover:bg-brand-50"
            @click="resetFilters"
          >
            {{ t('portalPages.common.lecturers.resetFilterBtn') }}
          </button>
        </template>
      </StateFeedback>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article
          v-for="lecturer in filteredLecturers"
          :key="lecturer.id"
          data-testid="lecturer-card"
          class="flex flex-col rounded-2xl border border-surface-border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-float"
        >
          <div class="flex items-start gap-4">
            <div class="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-surface-border bg-brand-50/70 flex items-center justify-center">
              <img
                v-if="lecturer.photo_url"
                :src="lecturer.photo_url"
                :alt="lecturer.name"
                loading="lazy"
                class="h-full w-full object-cover object-top"
              />
              <span v-else class="text-base font-extrabold text-brand-700">
                {{ getNameInitials(lecturer.name) }}
              </span>
            </div>

            <div class="min-w-0 flex-1 space-y-1.5">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  v-if="lecturer.leadership_role"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-slate-900"
                >
                  <Award class="h-3 w-3" aria-hidden="true" />
                  {{ lecturer.leadership_role }}
                </span>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  :class="TEACHING_STATUS_STYLES[lecturer.teaching_status] || TEACHING_STATUS_STYLES.inactive"
                >
                  {{ t(`portalPages.common.lecturers.statusLabels.${lecturer.teaching_status || 'active'}`) }}
                </span>
              </div>

              <h2 class="text-base font-extrabold leading-snug text-brand-900">
                {{ lecturer.name }}
              </h2>

              <p class="text-xs font-semibold text-slate-600">
                {{ formatRankAndGrade(lecturer) }}
              </p>

              <p v-if="lecturer.education" class="text-xs text-slate-500 line-clamp-1">
                {{ lecturer.education }}
              </p>
            </div>
          </div>

          <div v-if="extractLecturerIndexes(lecturer).length" class="mt-3 flex flex-wrap gap-2 border-t border-surface-border pt-3">
            <a
              v-for="idx in extractLecturerIndexes(lecturer)"
              :key="idx.key"
              :href="idx.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="t(`portalPages.common.lecturers.indexes.${idx.labelKey}`)"
              :title="t(`portalPages.common.lecturers.indexes.${idx.labelKey}`)"
              class="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border px-2.5 py-1 transition"
              :class="idx.pillClass"
            >
              <img
                :src="idx.logo"
                :alt="t(`portalPages.common.lecturers.indexes.${idx.labelKey}`)"
                class="h-4 w-auto max-w-[84px] object-contain"
              />
              <ExternalLink class="h-2.5 w-2.5 shrink-0 text-slate-400" aria-hidden="true" />
            </a>
          </div>

          <div class="mt-auto pt-4">
            <router-link
              :to="lecturerDetailRoute(lecturer.id)"
              class="flex min-h-[42px] w-full items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
            >
              <span>{{ t('portalPages.common.lecturers.viewProfileBtn') }}</span>
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </router-link>
          </div>
        </article>
      </div>
    </template>

    <template #sidebar-top>
      <section v-if="prodiCard" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <div class="flex items-center gap-2">
          <Users class="h-5 w-5 text-brand-600" aria-hidden="true" />
          <h2 class="text-base font-extrabold text-brand-900">{{ t('portalPages.common.teachingStaffHeading') }}</h2>
        </div>

        <div class="space-y-2.5 text-sm">
          <div class="flex items-center justify-between gap-2 border-b border-surface-border pb-2">
            <span class="text-slate-500">{{ t('portalPages.common.lecturers.totalLecturersLabel') }}</span>
            <span class="font-bold text-brand-900">{{ programLecturers.length }}</span>
          </div>
          <div class="flex items-center justify-between gap-2 border-b border-surface-border pb-2">
            <span class="text-slate-500">{{ t('portalPages.common.lecturers.totalLeadershipLabel') }}</span>
            <span class="font-bold text-brand-900">{{ leadershipLecturers.length }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-500">{{ t('portalPages.common.lecturers.activeCountLabel') }}</span>
            <span class="font-bold text-emerald-700">{{ activeTeachingCount }}</span>
          </div>
        </div>

        <router-link
          :to="`/program-studi/${slug}`"
          class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-page px-4 text-sm font-semibold text-slate-700 transition hover:bg-brand-50"
        >
          <ArrowLeft class="h-4 w-4" aria-hidden="true" />
          <span>{{ t('portalPages.common.lecturers.backToProgramBtn') }}</span>
        </router-link>
      </section>
    </template>
  </PortalPageShell>
</template>
