<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Search, SlidersHorizontal, ArrowDown } from 'lucide-vue-next';
import { publicService } from '../services/public.service.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useUiStore } from '../stores/ui.store.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';
import CourseCard from '../components/CourseCard.vue';
import StateFeedback from '../components/StateFeedback.vue';

const route = useRoute();
const ui = useUiStore();
const toast = useToast();
const { t } = useI18n();
const { loading, error, isOffline, run } = useAsyncState();

const categories = ref([]);
const courses = ref([]);
const selectedCategory = ref('all');
const selectedLevel = ref('');
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '');
const page = ref(1);
const hasMore = ref(false);
const loadingMore = ref(false);

async function fetchInitial() {
  await run(async () => {
    const [catRes, courseRes] = await Promise.all([
      publicService.getCategories(),
      publicService.getCourses({
        category: selectedCategory.value === 'all' ? '' : selectedCategory.value,
        level: selectedLevel.value,
        q: searchQuery.value.trim(),
        page: 1,
        limit: 6
      })
    ]);
    categories.value = catRes.items;
    courses.value = courseRes.items;
    hasMore.value = courseRes.pagination.hasMore;
    page.value = 1;
  });
}

async function applyFilters() {
  page.value = 1;
  await run(async () => {
    const courseRes = await publicService.getCourses({
      category: selectedCategory.value === 'all' ? '' : selectedCategory.value,
      level: selectedLevel.value,
      q: searchQuery.value.trim(),
      page: 1,
      limit: 6
    });
    courses.value = courseRes.items;
    hasMore.value = courseRes.pagination.hasMore;
  });
}

async function loadMore() {
  loadingMore.value = true;
  try {
    const nextPage = page.value + 1;
    const courseRes = await publicService.getCourses({
      category: selectedCategory.value === 'all' ? '' : selectedCategory.value,
      level: selectedLevel.value,
      q: searchQuery.value.trim(),
      page: nextPage,
      limit: 6
    });
    courses.value = [...courses.value, ...courseRes.items];
    page.value = nextPage;
    hasMore.value = courseRes.pagination.hasMore;
  } finally {
    loadingMore.value = false;
  }
}

function resetFilters() {
  selectedCategory.value = 'all';
  selectedLevel.value = '';
  searchQuery.value = '';
  applyFilters();
}

function handleAddToCart(course) {
  const added = ui.addToCart(course);
  toast.success(
    added
      ? t('catalog.addedPrefix') + course.title + t('catalog.addedSuffix')
      : t('catalog.alreadyPrefix') + course.title + t('catalog.alreadySuffix')
  );
}

watch(
  () => route.query.q,
  (nextQuery) => {
    const normalized = typeof nextQuery === 'string' ? nextQuery : '';
    if (normalized !== searchQuery.value) {
      searchQuery.value = normalized;
      applyFilters();
    }
  }
);

onMounted(fetchInitial);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="rounded-3xl bg-brand-900 p-8 text-white sm:p-10">
      <h1 class="text-3xl font-extrabold sm:text-4xl">{{ t('catalog.heading') }}</h1>
      <p class="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
        {{ t('catalog.subheading') }}
      </p>

      <form class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-12" @submit.prevent="applyFilters">
        <div class="relative md:col-span-5">
          <Search class="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('catalog.searchPlaceholder')"
            :aria-label="t('catalog.searchLabel')"
            class="min-h-[46px] w-full rounded-xl bg-white pl-10 pr-4 text-sm text-brand-900 placeholder:text-slate-400"
          />
        </div>
        <div class="md:col-span-3">
          <select
            v-model="selectedCategory"
            :aria-label="t('catalog.categoryLabel')"
            class="min-h-[46px] w-full rounded-xl bg-white px-3.5 text-sm text-brand-900"
            @change="applyFilters"
          >
            <option value="all">{{ t('catalog.allCategories') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="md:col-span-2">
          <select
            v-model="selectedLevel"
            :aria-label="t('catalog.levelLabel')"
            class="min-h-[46px] w-full rounded-xl bg-white px-3.5 text-sm text-brand-900"
            @change="applyFilters"
          >
            <option value="">{{ t('catalog.allLevels') }}</option>
            <option value="beginner">{{ t('catalog.levels.beginner') }}</option>
            <option value="intermediate">{{ t('catalog.levels.intermediate') }}</option>
            <option value="advanced">{{ t('catalog.levels.advanced') }}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <button
            type="submit"
            class="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-900 hover:bg-amber-300 transition"
          >
            <SlidersHorizontal class="h-4 w-4" />
            {{ t('catalog.filterBtn') }}
          </button>
        </div>
      </form>
    </div>

    <div class="mt-10">
      <StateFeedback
        :loading="loading"
        :error="error"
        :offline="isOffline"
        :empty="!loading && courses.length === 0"
        :empty-title="t('catalog.emptyTitle')"
        :empty-description="t('catalog.emptyDesc')"
        @retry="applyFilters"
      >
        <template #empty-action>
          <button
            type="button"
            class="min-h-[44px] rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            @click="resetFilters"
          >
            {{ t('catalog.resetFiltersBtn') }}
          </button>
        </template>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CourseCard
            v-for="course in courses"
            :key="course.id"
            :course="course"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </StateFeedback>
    </div>

    <div v-if="hasMore" class="mt-10 text-center">
      <button
        type="button"
        :disabled="loadingMore"
        class="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-brand-200 bg-white px-7 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
        @click="loadMore"
      >
        <span>{{ loadingMore ? t('catalog.loadingMore') : t('catalog.loadMoreBtn') }}</span>
        <ArrowDown class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
