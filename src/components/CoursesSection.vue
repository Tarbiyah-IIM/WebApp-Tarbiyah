<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
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
const hoveredId = ref(null);

const programPhotos = {
  pai: prodiPaiPhoto,
  pgmi: prodiPgmiPhoto,
  piaud: prodiPiaudPhoto
};

function resolveProgramPhoto(prodiId) {
  return programPhotos[prodiId] || prodiPaiPhoto;
}

function expandCards() {
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
      return 'lg:col-start-1 lg:row-start-1 lg:z-30 lg:translate-x-0 lg:translate-y-0 lg:rotate-0 lg:scale-100 lg:group-hover/deck:-translate-y-1';
    }
    if (index === 1) {
      return 'lg:col-start-1 lg:row-start-1 lg:z-20 lg:translate-x-10 lg:translate-y-3 lg:rotate-[3.5deg] lg:scale-[0.96] lg:opacity-95 lg:pointer-events-none lg:group-hover/deck:translate-x-16 lg:group-hover/deck:rotate-[5.5deg]';
    }
    return 'lg:col-start-1 lg:row-start-1 lg:z-10 lg:-translate-x-10 lg:translate-y-4 lg:-rotate-[3.5deg] lg:scale-[0.93] lg:opacity-90 lg:pointer-events-none lg:group-hover/deck:-translate-x-16 lg:group-hover/deck:-rotate-[5.5deg]';
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
        ref="deckContainerRef"
        class="mt-10 relative"
        :class="isExpanded ? '' : 'group/deck'"
      >
        <div
          class="grid grid-cols-1 gap-6 md:grid-cols-2"
          :class="isExpanded ? 'lg:grid-cols-3' : 'lg:mx-auto lg:max-w-2xl lg:grid-cols-1'"
        >
          <article
            v-for="(prodi, index) in studyPrograms"
            :key="prodi.id"
            :style="isExpanded ? { animationDelay: `${index * 60}ms` } : undefined"
            class="group grid grid-cols-1 overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none sm:grid-cols-12"
            :class="getCardStateClasses(prodi.id, index)"
            @mouseenter="isExpanded && (hoveredId = prodi.id)"
            @mouseleave="isExpanded && (hoveredId = null)"
            @focusin="isExpanded && (hoveredId = prodi.id)"
            @focusout="isExpanded && handleCardFocusOut($event, prodi.id)"
          >
            <div class="relative flex items-end justify-center overflow-hidden border-b border-surface-border bg-gradient-to-br from-brand-50/80 via-white to-white px-2 pt-4 sm:col-span-5 sm:border-b-0 sm:border-r">
              <img
                :src="resolveProgramPhoto(prodi.id)"
                :alt="prodi.title"
                decoding="async"
                class="h-60 w-auto max-w-full object-contain object-bottom drop-shadow-md transition duration-300 group-hover:scale-[1.03] sm:h-full sm:max-h-[300px]"
              />
            </div>

            <div class="flex flex-1 flex-col p-5 sm:col-span-7">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span class="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                  {{ prodi.code }}
                </span>
                <span class="ml-auto rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow-xs">
                  {{ prodi.badge }}
                </span>
              </div>

              <h3 class="text-base font-bold leading-snug text-brand-900 xl:text-lg">
                {{ prodi.title }}
              </h3>

              <p class="mt-2 mb-5 flex-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {{ prodi.description }}
              </p>

              <div
                class="mt-auto flex flex-col gap-2 border-t border-surface-border pt-3.5"
                :class="isExpanded ? '' : 'sm:flex-row'"
              >
                <router-link
                  :to="`/program-studi/${prodi.id}`"
                  class="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 sm:text-sm"
                >
                  <span>{{ t('courses.detailBtn') }}</span>
                </router-link>
                <a
                  :href="prodi.pmbUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 sm:text-sm"
                >
                  <span>{{ t('courses.pmbBtn') }}</span>
                  <ArrowRight class="h-4 w-4 shrink-0" aria-hidden="true" />
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
          class="hidden lg:block absolute inset-0 z-40 mx-auto max-w-2xl cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          @click="expandCards"
        />
      </div>
    </div>
  </section>
</template>
