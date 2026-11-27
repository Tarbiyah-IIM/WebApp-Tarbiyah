<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Award, ChevronRight, ExternalLink, GraduationCap, Search } from 'lucide-vue-next';
import PortalPageShell from '../components/PortalPageShell.vue';
import ModalDialog from '../components/ModalDialog.vue';
import LecturerProfileDetail from '../components/LecturerProfileDetail.vue';
import StateFeedback from '../components/StateFeedback.vue';
import { useLandingStore } from '../stores/landing.store.js';
import { useI18n } from '../composables/useI18n.js';
import { usePortalContent } from '../composables/usePortalContent.js';
import {
  TEACHING_STATUS_STYLES,
  extractLecturerIndexes,
  formatRankAndGrade,
  getNameInitials,
  stripAcademicTitles
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
const activeLecturerId = ref(lecturerIdParam.value);

watch(lecturerIdParam, (nextId) => {
  activeLecturerId.value = nextId;
});

const allCards = computed(() => (t('courses.cards') || []).map(mergeProgramCard));
const prodiCard = computed(() => allCards.value.find((card) => card.id === slug.value) || null);
const programLecturers = computed(() => {
  const list = landingStore.data?.lecturers;
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item.program_slug === slug.value);
});

const selectedLecturer = computed(() => {
  if (activeLecturerId.value === null || activeLecturerId.value <= 0) return null;
  return programLecturers.value.find((item) => Number(item.id) === activeLecturerId.value) || null;
});

const isMissing = computed(() => {
  if (!prodiCard.value) return true;
  if (
    lecturerIdParam.value !== null &&
    landingStore.loaded &&
    !programLecturers.value.some((item) => Number(item.id) === lecturerIdParam.value)
  ) {
    return true;
  }
  return false;
});

watch(slug, () => {
  searchQuery.value = '';
});

const filteredLecturers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return programLecturers.value;
  return programLecturers.value.filter((item) =>
    [item.name, item.nidn, item.academic_rank, item.rank_grade, item.leadership_role, item.education]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q))
  );
});

const directoryBackRoute = computed(() => `/program-studi/${slug.value}/dosen`);

const pageTitle = computed(() => {
  if (!prodiCard.value) return t('portalPages.common.lecturers.notFoundTitle');
  if (selectedLecturer.value) {
    return `${t('portalPages.common.lecturers.profilePrefix')} ${stripAcademicTitles(selectedLecturer.value.name)}`;
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

function resetFilters() {
  searchQuery.value = '';
}

function lecturerDetailRoute(id) {
  return `/program-studi/${slug.value}/dosen/${id}`;
}

const selectedLecturerShareUrl = computed(() => {
  if (!selectedLecturer.value?.id || typeof window === 'undefined') return '';
  return `${window.location.origin}${lecturerDetailRoute(selectedLecturer.value.id)}`;
});

function openLecturerModal(lecturer) {
  activeLecturerId.value = Number(lecturer.id);
  const targetPath = lecturerDetailRoute(lecturer.id);
  if (route.path !== targetPath) {
    router.replace(targetPath);
  }
}

function closeLecturerModal() {
  activeLecturerId.value = null;
  if (route.path !== directoryBackRoute.value) {
    router.replace(directoryBackRoute.value);
  }
}
</script>

<template>
  <PortalPageShell
    :category="prodiCard?.title || t('portalPages.common.studyProgramCategory')"
    :title="pageTitle"
    :missing="isMissing"
    :hide-sidebar="true"
    :hide-back-home="true"
    :hide-contact-card="true"
  >
    <template v-if="prodiCard">
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

        <div class="border-t border-surface-border pt-4">
          <div class="relative max-w-md">
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
        <template v-if="searchQuery" #empty-action>
          <button
            type="button"
            class="inline-flex min-h-[40px] items-center rounded-xl border border-surface-border bg-white px-4 text-xs font-bold text-brand-700 hover:bg-brand-50"
            @click="resetFilters"
          >
            {{ t('portalPages.common.lecturers.resetFilterBtn') }}
          </button>
        </template>
      </StateFeedback>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <button
              type="button"
              class="flex min-h-[42px] w-full items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
              @click="openLecturerModal(lecturer)"
            >
              <span>{{ t('portalPages.common.lecturers.viewProfileBtn') }}</span>
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>

      <div>
        <router-link
          :to="`/program-studi/${slug}`"
          class="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-white px-5 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-brand-50"
        >
          <ArrowLeft class="h-4 w-4" aria-hidden="true" />
          <span>{{ t('portalPages.common.lecturers.backToProgramBtn') }}</span>
        </router-link>
      </div>

      <ModalDialog
        :open="Boolean(selectedLecturer)"
        :title="t('portalPages.common.lecturers.modalTitle')"
        header-variant="macos"
        max-width-class="max-w-5xl"
        @close="closeLecturerModal"
      >
        <LecturerProfileDetail
          v-if="selectedLecturer"
          :lecturer="selectedLecturer"
          :program-label="programLabelText"
          :back-to="directoryBackRoute"
          :share-url="selectedLecturerShareUrl"
          :is-modal="true"
        />
      </ModalDialog>
    </template>
  </PortalPageShell>
</template>
