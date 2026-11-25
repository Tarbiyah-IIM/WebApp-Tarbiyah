<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Calendar, ChevronRight } from 'lucide-vue-next';
import gedungIimFallback from '../assets/gedung-iim.webp';
import NewsDetailModal from './NewsDetailModal.vue';
import PaginationControls from './PaginationControls.vue';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  testimonials: { type: Array, default: () => [] }
});

const { t, tr } = useI18n();
const route = useRoute();
const router = useRouter();

const PAGE_SIZE = 3;
const currentPage = ref(1);
const selectedNews = ref(null);

const totalPages = computed(() => Math.max(1, Math.ceil(props.testimonials.length / PAGE_SIZE)));

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) {
    currentPage.value = nextTotal;
  }
});

watch(
  () => [route.query.newsId, props.testimonials],
  ([rawId, list]) => {
    const targetId = Number(rawId);
    if (!Number.isInteger(targetId) || targetId <= 0 || !Array.isArray(list) || !list.length) return;
    const index = list.findIndex((item) => item.id === targetId);
    if (index === -1) return;
    currentPage.value = Math.floor(index / PAGE_SIZE) + 1;
    selectedNews.value = list[index];
    const nextQuery = { ...route.query };
    delete nextQuery.newsId;
    router.replace({ path: route.path, query: nextQuery, hash: route.hash });
  },
  { immediate: true }
);

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return props.testimonials.slice(start, start + PAGE_SIZE);
});

function getCategories(item) {
  if (Array.isArray(item.categories) && item.categories.length > 0) {
    return item.categories;
  }
  if (item.category_name) {
    return [{ id: item.category_id || 0, name: item.category_name }];
  }
  return [];
}
</script>

<template>
  <section id="testimonials" class="py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <span class="rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
          {{ t('news.badge') }}
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          {{ t('news.heading') }}
        </h2>
      </div>

      <div v-if="paginatedNews.length" data-testid="landing-news-grid" class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in paginatedNews"
          :key="item.id"
          class="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-float"
        >
          <button
            type="button"
            class="flex min-w-0 flex-1 flex-col text-left"
            @click="selectedNews = item"
          >
            <div class="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <img
                :src="item.avatar_url || gedungIimFallback"
                :alt="tr(item.name)"
                loading="lazy"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            <div class="flex flex-1 flex-col p-6">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  v-for="cat in getCategories(item)"
                  :key="cat.id + '-' + cat.name"
                  class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700"
                >
                  {{ tr(cat.name) }}
                </span>
              </div>

              <div class="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Calendar class="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span>{{ tr(item.job_title) }}</span>
              </div>

              <h3 class="mt-2 break-words text-base font-bold leading-snug text-brand-900 group-hover:text-brand-600">
                {{ tr(item.name) }}
              </h3>

              <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-600 [overflow-wrap:anywhere]">
                {{ tr(item.quote) }}
              </p>

              <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-600">
                <span>{{ t('news.readMore') }}</span>
                <ChevronRight class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </div>
          </button>
        </article>
      </div>

      <p v-else class="mt-12 text-center text-sm text-slate-500">
        {{ t('news.empty') }}
      </p>

      <NewsDetailModal
        :open="Boolean(selectedNews)"
        :item="selectedNews"
        @close="selectedNews = null"
      />

      <div class="mt-4">
        <PaginationControls
          :current-page="currentPage"
          :total-pages="totalPages"
          :aria-label="t('news.navAria')"
          :prev-label="t('news.prevLabel')"
          :next-label="t('news.nextLabel')"
          @update:page="currentPage = $event"
        />
      </div>
    </div>
  </section>
</template>
