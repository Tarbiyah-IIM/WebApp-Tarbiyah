<script setup>
import { computed } from 'vue';
import { ArrowRight, BookOpen, GraduationCap, School, Sparkles } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';
import { usePortalContent } from '../composables/usePortalContent.js';

const { t } = useI18n();
const { mergeProgramCard } = usePortalContent();
const studyPrograms = computed(() => (t('courses.cards') || []).map(mergeProgramCard));

const programIcons = {
  'book-open': BookOpen,
  school: School,
  sparkles: Sparkles
};

function resolveProgramIcon(iconKey) {
  return programIcons[iconKey] || GraduationCap;
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

      <div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article
          v-for="prodi in studyPrograms"
          :key="prodi.id"
          class="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-float"
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
    </div>
  </section>
</template>
