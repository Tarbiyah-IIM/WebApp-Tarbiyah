<script setup>
import { computed, ref, watch } from 'vue';
import { Calendar, ChevronRight } from 'lucide-vue-next';
import gedungIimFallback from '../assets/gedung-iim.jpg';

const props = defineProps({
  testimonials: { type: Array, default: () => [] }
});

const PAGE_SIZE = 6;
const currentPage = ref(1);

const totalPages = computed(() => Math.max(1, Math.ceil(props.testimonials.length / PAGE_SIZE)));

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) {
    currentPage.value = nextTotal;
  }
});

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return props.testimonials.slice(start, start + PAGE_SIZE);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  if (total <= 3) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }
  if (currentPage.value <= 3) {
    return [1, 2, 3];
  }
  const end = Math.min(total, currentPage.value + 1);
  const start = Math.max(2, end - 2);
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
});

const showLeadingOne = computed(() => totalPages.value > 3 && currentPage.value > 3);

const showTrailingEllipsis = computed(() => {
  const lastVisible = visiblePages.value[visiblePages.value.length - 1] || 1;
  return totalPages.value > 3 && lastVisible < totalPages.value;
});

function goToPage(page) {
  const bounded = Math.min(Math.max(1, page), totalPages.value);
  currentPage.value = bounded;
}
</script>

<template>
  <section id="testimonials" class="py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <span class="rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
          Kegiatan Terbaru
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Berita Fakultas
        </h2>
      </div>

      <div v-if="paginatedNews.length" class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in paginatedNews"
          :key="item.id"
          class="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-float"
        >
          <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <img
              :src="item.avatar_url || gedungIimFallback"
              :alt="item.name"
              loading="lazy"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>

          <div class="flex flex-1 flex-col p-6">
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <Calendar class="h-3.5 w-3.5 shrink-0" />
              <span>{{ item.job_title }}</span>
            </div>

            <h3 class="mt-2.5 text-base font-bold leading-snug text-brand-900">
              {{ item.name }}
            </h3>

            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              {{ item.quote }}
            </p>
          </div>
        </article>
      </div>

      <p v-else class="mt-12 text-center text-sm text-slate-500">
        Belum ada berita fakultas yang dipublikasikan.
      </p>

      <nav
        v-if="totalPages > 1"
        aria-label="Navigasi Halaman Berita"
        class="mt-10 flex flex-wrap items-center justify-center gap-2"
      >
        <template v-if="showLeadingOne">
          <button
            type="button"
            class="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-surface-border bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            @click="goToPage(1)"
          >
            1
          </button>
          <span class="px-1 text-sm font-bold text-slate-400" aria-hidden="true">...</span>
        </template>

        <button
          v-for="pageNum in visiblePages"
          :key="pageNum"
          type="button"
          :aria-current="currentPage === pageNum ? 'page' : undefined"
          class="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border px-3 text-sm font-semibold transition"
          :class="
            currentPage === pageNum
              ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
              : 'border-surface-border bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700'
          "
          @click="goToPage(pageNum)"
        >
          {{ pageNum }}
        </button>

        <span
          v-if="showTrailingEllipsis"
          class="px-1 text-sm font-bold text-slate-400"
          aria-hidden="true"
        >
          ...
        </span>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          class="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-surface-border bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-45"
          @click="goToPage(currentPage + 1)"
        >
          <span>Next</span>
          <ChevronRight class="h-4 w-4" />
        </button>
      </nav>
    </div>
  </section>
</template>
