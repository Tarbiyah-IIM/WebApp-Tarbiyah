<script setup>
import { computed } from 'vue';
import { ArrowRight, GraduationCap } from 'lucide-vue-next';
import { useI18n } from '../composables/useI18n.js';

const { t } = useI18n();
const studyPrograms = computed(() => t('courses.cards'));
</script>

<template>
  <section id="courses-section" class="py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <span class="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          {{ t('courses.badge') }}
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          {{ t('courses.heading') }}
        </h2>
        <p class="mt-3 text-base text-slate-600">
          {{ t('courses.subtitle') }}
        </p>
      </div>

      <div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article
          v-for="prodi in studyPrograms"
          :key="prodi.id"
          class="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-float"
        >
          <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <img
              :src="prodi.image"
              :alt="prodi.title"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <span class="absolute top-3 left-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
              {{ prodi.badge }}
            </span>
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

            <div class="mt-auto border-t border-slate-100 pt-4">
              <a
                :href="prodi.pmbUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition"
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
