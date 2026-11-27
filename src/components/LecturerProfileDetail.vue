<script setup>
import { computed, ref, watch } from 'vue';
import { ArrowLeft, Award, ExternalLink, GraduationCap, Mail, UserRound } from 'lucide-vue-next';
import ShareActionBar from './ShareActionBar.vue';
import { useI18n } from '../composables/useI18n.js';
import {
  TEACHING_STATUS_STYLES,
  extractLecturerIndexes,
  formatRankAndGrade,
  getNameInitials,
  stripAcademicTitles
} from '../utils/lecturers.js';

const props = defineProps({
  lecturer: { type: Object, required: true },
  programLabel: { type: String, required: true },
  backTo: { type: [String, Object], required: true },
  shareUrl: { type: String, default: '' },
  isModal: { type: Boolean, default: false }
});

const { t } = useI18n();
const photoFailed = ref(false);

watch(
  () => [props.lecturer?.id, props.lecturer?.photo_url],
  () => {
    photoFailed.value = false;
  }
);

const indexLinks = computed(() => extractLecturerIndexes(props.lecturer));
const hasPhoto = computed(() => Boolean(props.lecturer?.photo_url && !photoFailed.value));
const statusKey = computed(() => props.lecturer?.teaching_status || 'active');
const statusLabel = computed(
  () => t(`portalPages.common.lecturers.statusLabels.${statusKey.value}`) || statusKey.value
);
const statusClass = computed(
  () => TEACHING_STATUS_STYLES[statusKey.value] || TEACHING_STATUS_STYLES.inactive
);
const rankAndGrade = computed(() => formatRankAndGrade(props.lecturer));
const displayHeadingName = computed(() => stripAcademicTitles(props.lecturer?.name));
const educationHistoryRows = computed(() => {
  const list = props.lecturer?.education_history;
  if (!Array.isArray(list)) return [];
  return list.filter((row) => row && (row.degreeLevel || row.institution || row.major));
});
const biographyParagraphs = computed(() =>
  String(props.lecturer?.biography || '')
    .split(/\r?\n\r?\n|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
);
</script>

<template>
  <article class="space-y-6">
    <section class="rounded-3xl border border-surface-border bg-white p-6 sm:p-8 shadow-card space-y-6">
      <div class="border-b border-surface-border pb-6 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <UserRound class="h-3.5 w-3.5" aria-hidden="true" />
              {{ t('portalPages.common.lecturers.roleBadge') }}
            </span>
            <span
              v-if="lecturer.leadership_role"
              class="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900"
            >
              <Award class="h-3.5 w-3.5" aria-hidden="true" />
              {{ lecturer.leadership_role }}
            </span>
          </div>

          <ShareActionBar
            :url="shareUrl"
            :title="`${t('portalPages.common.lecturers.profilePrefix')} ${lecturer.name}`"
            test-id-prefix="lecturer"
          />
        </div>

        <div class="text-center space-y-3">
          <h1 class="text-2xl font-extrabold tracking-tight text-brand-900 sm:text-3xl">
            {{ t('portalPages.common.lecturers.profilePrefix') }} {{ displayHeadingName }}
          </h1>

        <div v-if="indexLinks.length" class="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <a
            v-for="item in indexLinks"
            :key="item.key"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t(`portalPages.common.lecturers.indexes.${item.labelKey}`)"
            :title="t(`portalPages.common.lecturers.indexes.${item.labelKey}`)"
            class="inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 py-1.5 transition hover:-translate-y-0.5"
            :class="item.pillClass"
          >
            <img
              :src="item.logo"
              :alt="t(`portalPages.common.lecturers.indexes.${item.labelKey}`)"
              class="h-5 w-auto max-w-[116px] object-contain"
            />
            <ExternalLink class="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
          </a>
        </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-12 items-start">
        <div class="md:col-span-4 space-y-3">
          <div class="overflow-hidden rounded-2xl border border-surface-border bg-brand-50/70 aspect-[3/4] flex items-center justify-center">
            <img
              v-if="hasPhoto"
              :src="lecturer.photo_url"
              :alt="lecturer.name"
              class="h-full w-full object-cover object-top"
              @error="photoFailed = true"
            />
            <div v-else class="flex flex-col items-center justify-center gap-2 p-6 text-center text-brand-700">
              <div class="flex h-20 w-20 items-center justify-center rounded-full border border-brand-200 bg-white text-2xl font-extrabold text-brand-700 shadow-sm">
                {{ getNameInitials(lecturer.name) }}
              </div>
              <span class="text-xs font-semibold text-slate-500">{{ t('brand.faculty') }}</span>
            </div>
          </div>

          <div class="rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-center">
            <p class="text-xs font-bold text-brand-900">{{ t('brand.faculty') }}</p>
            <p class="text-[11px] font-medium text-slate-500">{{ t('brand.institute') }}</p>
          </div>
        </div>

        <dl class="md:col-span-8 divide-y divide-surface-border rounded-2xl border border-surface-border bg-surface-page/50">
          <div class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.name') }}</dt>
            <dd class="text-sm font-bold text-brand-900 sm:col-span-7">{{ lecturer.name }}</dd>
          </div>

          <div v-if="lecturer.nidn" class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.nidn') }}</dt>
            <dd class="text-sm font-semibold text-slate-700 sm:col-span-7">{{ lecturer.nidn }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.program') }}</dt>
            <dd class="text-sm font-semibold text-slate-700 sm:col-span-7">{{ programLabel }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.faculty') }}</dt>
            <dd class="text-sm font-semibold text-slate-700 sm:col-span-7">{{ t('brand.faculty') }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4 sm:items-center">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.status') }}</dt>
            <dd class="flex flex-wrap items-center gap-2 text-sm text-slate-700 sm:col-span-7">
              <span class="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold" :class="statusClass">
                {{ statusLabel }}
              </span>
            </dd>
          </div>

          <div class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.academicRankAndGrade') }}</dt>
            <dd class="text-sm font-semibold text-slate-700 sm:col-span-7">{{ rankAndGrade }}</dd>
          </div>

          <div v-if="lecturer.leadership_role" class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.leadershipRole') }}</dt>
            <dd class="text-sm font-bold text-brand-700 sm:col-span-7">{{ lecturer.leadership_role }}</dd>
          </div>

          <div class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.email') }}</dt>
            <dd class="text-sm text-slate-700 sm:col-span-7">
              <a
                v-if="lecturer.email"
                :href="`mailto:${lecturer.email}`"
                class="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline break-all"
              >
                <Mail class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{{ lecturer.email }}</span>
              </a>
              <span v-else>-</span>
            </dd>
          </div>

          <div class="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-12 sm:gap-4">
            <dt class="text-xs font-bold text-slate-500 sm:col-span-5 sm:text-sm">{{ t('portalPages.common.lecturers.fields.education') }}</dt>
            <dd class="inline-flex items-start gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-7">
              <GraduationCap class="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>{{ lecturer.education || '-' }}</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section v-if="biographyParagraphs.length" class="rounded-2xl border border-surface-border bg-white p-6 sm:p-8 shadow-card space-y-3">
      <h2 class="text-lg font-extrabold text-brand-900">
        {{ t('portalPages.common.lecturers.fields.biography') }}
      </h2>
      <div class="space-y-3 text-justify text-sm leading-relaxed text-slate-700 sm:text-base">
        <p v-for="(para, idx) in biographyParagraphs" :key="idx">{{ para }}</p>
      </div>
    </section>

    <section
      v-if="educationHistoryRows.length"
      data-testid="lecturer-education-history"
      class="rounded-2xl border border-surface-border bg-white p-6 sm:p-8 shadow-card space-y-4"
    >
      <h2 class="text-lg font-extrabold text-brand-900">
        {{ t('portalPages.common.lecturers.educationHistory.heading') }}
      </h2>
      <div class="overflow-x-auto rounded-xl border border-surface-border">
        <table class="w-full min-w-[680px] border-collapse text-left text-sm">
          <caption class="sr-only">{{ t('portalPages.common.lecturers.educationHistory.heading') }}</caption>
          <thead class="bg-brand-700 text-white">
            <tr>
              <th scope="col" class="px-4 py-3 text-xs font-bold whitespace-nowrap">{{ t('portalPages.common.lecturers.educationHistory.no') }}</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold whitespace-nowrap">{{ t('portalPages.common.lecturers.educationHistory.degreeLevel') }}</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold">{{ t('portalPages.common.lecturers.educationHistory.institution') }}</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold">{{ t('portalPages.common.lecturers.educationHistory.major') }}</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold whitespace-nowrap">{{ t('portalPages.common.lecturers.educationHistory.academicDegree') }}</th>
              <th scope="col" class="px-4 py-3 text-xs font-bold whitespace-nowrap">{{ t('portalPages.common.lecturers.educationHistory.graduationYear') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-border bg-white text-slate-700">
            <tr v-for="(row, idx) in educationHistoryRows" :key="idx" class="transition hover:bg-surface-page/70">
              <td class="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">{{ idx + 1 }}</td>
              <td class="px-4 py-3 font-bold text-brand-900 whitespace-nowrap">{{ row.degreeLevel }}</td>
              <td class="px-4 py-3">{{ row.institution }}</td>
              <td class="px-4 py-3">{{ row.major || '-' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">{{ row.academicDegree || '-' }}</td>
              <td class="px-4 py-3 font-medium whitespace-nowrap">{{ row.graduationYear || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="!isModal">
      <router-link
        :to="backTo"
        class="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-surface-border bg-white px-5 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-brand-50"
      >
        <ArrowLeft class="h-4 w-4" aria-hidden="true" />
        <span>{{ t('portalPages.common.lecturers.backToListBtn') }}</span>
      </router-link>
    </div>
  </article>
</template>
