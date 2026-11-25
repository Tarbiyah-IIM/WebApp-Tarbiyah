<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  ariaLabel: { type: String, default: 'Navigasi Halaman' },
  prevLabel: { type: String, default: 'Prev' },
  nextLabel: { type: String, default: 'Next' }
});

const emit = defineEmits(['update:page']);

const visiblePages = computed(() => {
  const total = props.totalPages;
  if (total <= 4) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }
  if (props.currentPage <= 3) {
    return [1, 2, 3];
  }
  const end = Math.min(total, props.currentPage + 1);
  const start = Math.max(2, end - 2);
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
});

const showLeadingOne = computed(() => props.totalPages > 4 && props.currentPage > 3);

const showTrailingEllipsis = computed(() => {
  const lastVisible = visiblePages.value[visiblePages.value.length - 1] || 1;
  return props.totalPages > 4 && lastVisible < props.totalPages;
});

function goToPage(page) {
  const bounded = Math.min(Math.max(1, page), props.totalPages);
  emit('update:page', bounded);
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    :aria-label="ariaLabel"
    class="mt-6 flex flex-wrap items-center justify-center gap-2"
  >
    <button
      type="button"
      :disabled="currentPage <= 1"
      class="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-surface-border bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-45"
      @click="goToPage(currentPage - 1)"
    >
      <ChevronLeft class="h-4 w-4" aria-hidden="true" />
      <span>{{ prevLabel }}</span>
    </button>

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
      <span>{{ nextLabel }}</span>
      <ChevronRight class="h-4 w-4" aria-hidden="true" />
    </button>
  </nav>
</template>
