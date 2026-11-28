<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ArrowRight, BookOpen, GraduationCap, School, Sparkles } from 'lucide-vue-next';
import prodiPaiPhoto from '../assets/prodi-pai.webp';
import prodiPgmiPhoto from '../assets/prodi-pgmi.webp';
import prodiPiaudPhoto from '../assets/prodi-piaud.webp';
import { useI18n } from '../composables/useI18n.js';
import { usePortalContent } from '../composables/usePortalContent.js';

const { t } = useI18n();
const { mergeProgramCard } = usePortalContent();
const studyPrograms = computed(() => (t('courses.cards') || []).map(mergeProgramCard));

const deckContainerRef = ref(null);
const isExpanded = ref(false);
const hasExpandedOnce = ref(false);
const hoveredId = ref(null);

const programIcons = {
  'book-open': BookOpen,
  school: School,
  sparkles: Sparkles
};

const programPhotos = {
  pai: prodiPaiPhoto,
  pgmi: prodiPgmiPhoto,
  piaud: prodiPiaudPhoto
};

function resolveProgramIcon(iconKey) {
  return programIcons[iconKey] || GraduationCap;
}

function resolveProgramPhoto(prodiId) {
  return programPhotos[prodiId] || prodiPaiPhoto;
}

function expandCards() {
  hasExpandedOnce.value = true;
  isExpanded.value = true;
  hoveredId.value = null;
}

function collapseCards() {
  isExpanded.value = false;
  hoveredId.value = null;
}

function handleDocumentPointerDown(event) {
  if (!isExpanded.value || !deckContainerRef.value) return;
  if (!deckContainerRef.value.contains(event.target)) {
    collapseCards();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape' && isExpanded.value) {
    collapseCards();
  }
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeydown);
  }
});

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerdown', handleDocumentPointerDown);
    document.removeEventListener('keydown', handleDocumentKeydown);
  }
});

function handleCardFocusOut(event, prodiId) {
  if (event.currentTarget?.contains(event.relatedTarget)) return;
  if (hoveredId.value === prodiId) {
    hoveredId.value = null;
  }
}

function getCardStateClasses(prodiId, index) {
  if (!isExpanded.value) {
    if (index === 0) {
      return [
        'lg:col-start-1 lg:row-start-1 lg:z-30 lg:translate-x-0 lg:translate-y-0 lg:rotate-0 lg:shadow-float lg:group-hover/deck:-translate-y-2',
        hasExpandedOnce.value ? 'courses-collapse-front' : ''
      ].join(' ');
    }
    if (index === 1) {
      return [
        'lg:col-start-1 lg:row-start-1 lg:z-20 lg:translate-x-12 lg:translate-y-3.5 lg:rotate-[4deg] lg:scale-[0.95] lg:opacity-95 lg:pointer-events-none lg:group-hover/deck:translate-x-20 lg:group-hover/deck:rotate-[6.5deg]',
        hasExpandedOnce.value ? 'courses-collapse-right' : ''
      ].join(' ');
    }
    return [
      'lg:col-start-1 lg:row-start-1 lg:z-10 lg:-translate-x-12 lg:translate-y-4.5 lg:-rotate-[4deg] lg:scale-[0.92] lg:opacity-90 lg:pointer-events-none lg:group-hover/deck:-translate-x-20 lg:group-hover/deck:-rotate-[6.5deg]',
      hasExpandedOnce.value ? 'courses-collapse-left' : ''
    ].join(' ');
  }

  if (hoveredId.value === null) {
    return 'courses-popup-card lg:grayscale-0 lg:opacity-100 lg:hover:-translate-y-2 lg:hover:shadow-float';
  }
  if (hoveredId.value === prodiId) {
    return 'courses-popup-card lg:z-20 lg:-translate-y-2.5 lg:grayscale-0 lg:opacity-100 lg:shadow-[0_28px_60px_-15px_rgba(37,99,235,0.28)] lg:ring-2 lg:ring-brand-600/25';
  }
  return 'courses-popup-card lg:grayscale lg:opacity-70';
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
        ref="deckContainerRef"
        class="mt-10 relative"
        :class="isExpanded ? '' : 'group/deck'"
      >
        <div
          class="grid grid-cols-1 gap-6 md:grid-cols-2"
          :class="isExpanded ? 'lg:grid-cols-3' : 'lg:mx-auto lg:max-w-lg lg:grid-cols-1'"
        >
          <article
            v-for="(prodi, index) in studyPrograms"
            :key="prodi.id"
            :style="isExpanded ? { animationDelay: `${index * 70}ms` } : undefined"
            class="group relative grid overflow-hidden rounded-3xl border border-surface-border bg-white shadow-card transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:transform-none"
            :class="[getCardStateClasses(prodi.id, index), isExpanded ? 'grid-cols-12' : 'grid-cols-12 lg:grid-cols-1']"
            @mouseenter="isExpanded && (hoveredId = prodi.id)"
            @mouseleave="isExpanded && (hoveredId = null)"
            @focusin="isExpanded && (hoveredId = prodi.id)"
            @focusout="isExpanded && handleCardFocusOut($event, prodi.id)"
          >
            <div
              class="pointer-events-none absolute -left-8 bottom-0 top-4 w-3/5 rounded-full bg-brand-100/70 blur-3xl transition duration-500 group-hover:scale-110"
              :class="isExpanded ? '' : 'lg:hidden'"
              aria-hidden="true"
            />

            <div
              v-if="!isExpanded"
              class="hidden lg:flex relative flex-col items-center justify-center gap-4 border-b border-surface-border bg-gradient-to-br from-brand-50/80 via-white to-white px-6 py-9"
            >
              <span class="absolute top-4 left-5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 shadow-xs">
                {{ prodi.badge }}
              </span>
              <div class="mt-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-200 bg-brand-100 text-brand-700 shadow-xs transition duration-200 group-hover:scale-105">
                <component :is="resolveProgramIcon(prodi.icon)" class="h-8 w-8" aria-hidden="true" />
              </div>
            </div>

            <div
              class="relative z-10 col-span-5 flex items-end justify-center pt-3 pl-1 sm:col-span-6 sm:pl-0"
              :class="isExpanded ? '' : 'lg:hidden'"
            >
              <img
                :src="resolveProgramPhoto(prodi.id)"
                :alt="prodi.title"
                decoding="async"
                class="relative z-10 h-full w-full object-contain object-bottom drop-shadow-[0_16px_24px_rgba(15,23,42,0.22)] transition duration-500 ease-out group-hover:-translate-y-1"
                :class="isExpanded ? 'min-h-[225px] max-h-[290px] sm:min-h-[340px] sm:max-h-[400px]' : 'min-h-[225px] max-h-[290px] sm:min-h-[310px] sm:max-h-[370px]'"
              />
            </div>

            <div
              class="relative z-10 col-span-7 flex flex-1 flex-col p-3.5 sm:col-span-6 sm:p-5"
              :class="isExpanded ? '' : 'lg:col-span-1 lg:p-7'"
            >
              <div
                class="mb-2 flex flex-wrap gap-1 sm:mb-2.5 sm:gap-1.5"
                :class="isExpanded ? 'flex-col items-end' : 'flex-col items-end lg:flex-row lg:items-center lg:justify-between'"
              >
                <span
                  class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold text-brand-700 sm:py-1 sm:text-[11px]"
                  :class="isExpanded ? 'order-2' : 'order-2 lg:order-1 lg:px-3 lg:text-xs'"
                >
                  {{ prodi.code }}
                </span>
                <span
                  class="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs sm:py-1 sm:text-[11px]"
                  :class="isExpanded ? 'order-1' : 'order-1 lg:hidden'"
                >
                  {{ prodi.badge }}
                </span>
                <GraduationCap
                  v-if="!isExpanded"
                  class="hidden h-4 w-4 text-brand-600 lg:order-2 lg:inline-block"
                  aria-hidden="true"
                />
              </div>

              <h3
                class="text-sm font-bold leading-snug text-brand-900 sm:text-base xl:text-lg"
                :class="isExpanded ? '' : 'lg:text-lg'"
              >
                {{ prodi.title }}
              </h3>

              <p
                class="mt-1.5 flex-1 text-[11px] leading-relaxed text-slate-600 sm:mt-2"
                :class="isExpanded ? 'sm:text-xs' : 'sm:text-xs md:text-sm lg:mb-1 lg:text-sm'"
              >
                {{ prodi.description }}
              </p>

              <div
                class="mt-2.5 flex flex-col gap-1.5 pt-1 transition-all duration-300 sm:mt-3 sm:gap-2"
                :class="isExpanded ? 'flex' : 'flex lg:hidden'"
              >
                <router-link
                  :to="`/program-studi/${prodi.id}`"
                  class="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 sm:min-h-[40px] sm:px-3.5 sm:py-2 sm:text-sm"
                >
                  <span>{{ t('courses.detailBtn') }}</span>
                </router-link>
                <a
                  :href="prodi.pmbUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 sm:min-h-[40px] sm:px-3.5 sm:py-2 sm:text-sm"
                >
                  <span>{{ t('courses.pmbBtn') }}</span>
                  <ArrowRight class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
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
          class="hidden lg:block absolute inset-0 z-40 mx-auto max-w-lg cursor-pointer rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          @click="expandCards"
        />
      </div>
    </div>
  </section>
</template>
