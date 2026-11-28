<script setup>
import { computed, ref } from 'vue';
import { ArrowRight, BookOpen, GraduationCap, Layers, School, Sparkles } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';
import { usePortalContent } from '../composables/usePortalContent.js';

const { t } = useI18n();
const { mergeProgramCard } = usePortalContent();
const studyPrograms = computed(() => (t('courses.cards') || []).map(mergeProgramCard));

const isExpanded = ref(false);
const hoveredId = ref(null);

const programIcons = {
  'book-open': BookOpen,
  school: School,
  sparkles: Sparkles
};

function resolveProgramIcon(iconKey) {
  return programIcons[iconKey] || GraduationCap;
}

function expandCards() {
  isExpanded.value = true;
  hoveredId.value = null;
}

function collapseCards() {
  isExpanded.value = false;
  hoveredId.value = null;
}

function handleCardFocusOut(event, prodiId) {
  if (event.currentTarget?.contains(event.relatedTarget)) return;
  if (hoveredId.value === prodiId) {
    hoveredId.value = null;
  }
}

function getCardStateClasses(prodiId, index) {
  if (!isExpanded.value) {
    if (index === 0) {
      return 'lg:col-start-1 lg:row-start-1 lg:z-30 lg:translate-x-0 lg:translate-y-0 lg:rotate-0 lg:scale-100 lg:group-hover/deck:-translate-y-1';
    }
    if (index === 1) {
      return 'lg:col-start-1 lg:row-start-1 lg:z-20 lg:translate-x-9 lg:translate-y-3 lg:rotate-[4deg] lg:scale-[0.96] lg:opacity-95 lg:pointer-events-none lg:group-hover/deck:translate-x-14 lg:group-hover/deck:rotate-[6deg]';
    }
    return 'lg:col-start-1 lg:row-start-1 lg:z-10 lg:-translate-x-9 lg:translate-y-4 lg:-rotate-[4deg] lg:scale-[0.93] lg:opacity-90 lg:pointer-events-none lg:group-hover/deck:-translate-x-14 lg:group-hover/deck:-rotate-[6deg]';
  }

  if (hoveredId.value === null) {
    return 'courses-popup-card lg:grayscale-0 lg:opacity-100 lg:hover:-translate-y-1 lg:hover:shadow-float';
  }
  if (hoveredId.value === prodiId) {
    return 'courses-popup-card lg:z-20 lg:-translate-y-2 lg:scale-[1.03] lg:grayscale-0 lg:opacity-100 lg:shadow-float lg:ring-2 lg:ring-brand-600/25';
  }
  return 'courses-popup-card lg:grayscale lg:opacity-75 lg:scale-[0.98]';
}
</script>

<template>
  <section id="courses-section" class="py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl text-center">
        <span class="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          {{ t('courses.badge') }}
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          {{ t('courses.heading') }}
        </h2>
        <p class="mt-3 text-base text-slate-600 lg:whitespace-nowrap">
          {{ t('courses.subtitle') }}
        </p>
      </div>

      <div
        class="mt-10 relative"
        :class="isExpanded ? '' : 'group/deck lg:pb-8'"
      >
        <div
          class="grid grid-cols-1 gap-6 md:grid-cols-2"
          :class="isExpanded ? 'lg:grid-cols-3' : 'lg:mx-auto lg:max-w-md lg:grid-cols-1'"
        >
          <article
            v-for="(prodi, index) in studyPrograms"
            :key="prodi.id"
            :style="isExpanded ? { animationDelay: `${index * 60}ms` } : undefined"
            class="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none"
            :class="getCardStateClasses(prodi.id, index)"
            @mouseenter="isExpanded && (hoveredId = prodi.id)"
            @mouseleave="isExpanded && (hoveredId = null)"
            @focusin="isExpanded && (hoveredId = prodi.id)"
            @focusout="isExpanded && handleCardFocusOut($event, prodi.id)"
          >
            <div class="relative flex flex-col items-center justify-center gap-4 border-b border-surface-border bg-gradient-to-br from-brand-50/80 via-white to-white px-6 py-8">
              <span class="absolute top-3 left-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
                {{ prodi.badge }}
              </span>
              <div class="mt-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-200 bg-brand-100 text-brand-700 shadow-sm transition duration-200 group-hover:scale-105">
                <component :is="resolveProgramIcon(prodi.icon)" class="h-8 w-8" aria-hidden="true" />
              </div>
            </div>

            <div class="flex flex-1 flex-col p-6">
              <div class="mb-3 flex items-center justify-between gap-2">
                <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {{ prodi.code }}
                </span>
                <GraduationCap class="h-4 w-4 text-brand-600" />
              </div>

              <h3 class="text-lg font-bold text-brand-900">
                {{ prodi.title }}
              </h3>

              <p class="mt-2 mb-6 text-sm leading-relaxed text-slate-600">
                {{ prodi.description }}
              </p>

              <div class="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                <router-link
                  :to="`/program-studi/${prodi.id}`"
                  class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition"
                >
                  <span>{{ t('courses.detailBtn') }}</span>
                </router-link>
                <a
                  :href="prodi.pmbUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition"
                >
                  {{ t('courses.pmbBtn') }}
                  <ArrowRight class="h-4 w-4" />
                </a>
              </div>
            </div>
          </article>
        </div>

        <button
          v-if="!isExpanded"
          type="button"
          data-testid="courses-stack-trigger"
          :aria-label="t('courses.expandAria')"
          class="hidden lg:flex absolute inset-0 z-40 mx-auto max-w-md cursor-pointer items-end justify-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          @click="expandCards"
        >
          <span class="mb-0 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-float transition duration-200 group-hover/deck:scale-105 group-hover/deck:bg-brand-700">
            <Layers class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('courses.expandHint') }}</span>
          </span>
        </button>

        <div v-else class="mt-8 hidden justify-center lg:flex">
          <button
            type="button"
            data-testid="courses-collapse-btn"
            class="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-surface-border bg-white px-4 py-2 text-xs font-bold text-brand-700 shadow-card transition hover:border-brand-300 hover:bg-brand-50"
            @click="collapseCards"
          >
            <Layers class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('courses.collapseBtn') }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
