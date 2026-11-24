<script setup>
import { computed, ref, watch } from 'vue';
import { Calendar, ChevronRight, Clock } from 'lucide-vue-next';
import gedungIimFallback from '../assets/gedung-iim.jpg';
import NewsDetailModal from './NewsDetailModal.vue';
import PaginationControls from './PaginationControls.vue';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  agendas: { type: Array, default: () => [] }
});

const { t, tr } = useI18n();

const PAGE_SIZE = 3;
const currentPage = ref(1);
const selectedAgenda = ref(null);

const totalPages = computed(() => Math.max(1, Math.ceil(props.agendas.length / PAGE_SIZE)));

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) {
    currentPage.value = nextTotal;
  }
});

const paginatedAgendas = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return props.agendas.slice(start, start + PAGE_SIZE);
});
</script>

<template>
  <section id="agendas" class="border-t border-surface-border/70 bg-surface-page py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <span class="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
          {{ t('agenda.badge') }}
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          {{ t('agenda.heading') }}
        </h2>
      </div>

      <div
        v-if="paginatedAgendas.length"
        data-testid="landing-agenda-grid"
        class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="item in paginatedAgendas"
          :key="item.id"
          class="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-float"
        >
          <button
            type="button"
            class="flex flex-1 flex-col text-left"
            @click="selectedAgenda = item"
          >
            <div class="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <img
                :src="item.cover_url || gedungIimFallback"
                :alt="tr(item.title)"
                loading="lazy"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            <div class="flex flex-1 flex-col p-6">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  {{ t('agenda.pillLabel') }}
                </span>
              </div>

              <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                <span class="inline-flex items-center gap-1.5">
                  <Calendar class="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                  <span>{{ tr(item.event_date) }}</span>
                </span>
                <span v-if="item.event_time" class="inline-flex items-center gap-1">
                  <Clock class="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>{{ tr(item.event_time) }}</span>
                </span>
              </div>

              <h3 class="mt-2.5 flex-1 text-base font-bold leading-snug text-brand-900 group-hover:text-brand-600">
                {{ tr(item.title) }}
              </h3>

              <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                <span>{{ t('news.readMore') }}</span>
                <ChevronRight class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </div>
          </button>
        </article>
      </div>

      <p v-else class="mt-12 text-center text-sm text-slate-500">
        {{ t('agenda.empty') }}
      </p>

      <NewsDetailModal
        :open="Boolean(selectedAgenda)"
        :item="selectedAgenda"
        :badge-fallback="t('agenda.pillLabel')"
        @close="selectedAgenda = null"
      />

      <div class="mt-4">
        <PaginationControls
          :current-page="currentPage"
          :total-pages="totalPages"
          :aria-label="t('agenda.navAria')"
          :next-label="t('news.nextLabel')"
          @update:page="currentPage = $event"
        />
      </div>
    </div>
  </section>
</template>
