<script setup>
import { onMounted, ref } from 'vue';
import { Search, SlidersHorizontal, ArrowDown } from 'lucide-vue-next';
import { publicService } from '../services/public.service.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useUiStore } from '../stores/ui.store.js';
import { useToast } from '../composables/useToast.js';
import CourseCard from '../components/CourseCard.vue';
import StateFeedback from '../components/StateFeedback.vue';

const ui = useUiStore();
const toast = useToast();
const { loading, error, isOffline, run } = useAsyncState();

const categories = ref([]);
const courses = ref([]);
const selectedCategory = ref('all');
const selectedLevel = ref('');
const searchQuery = ref('');
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
  toast.success(added ? `"${course.title}" added to cart.` : `"${course.title}" is already in cart.`);
}

onMounted(fetchInitial);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="rounded-3xl bg-brand-900 p-8 text-white sm:p-10">
      <h1 class="text-3xl font-extrabold sm:text-4xl">Explore All Courses</h1>
      <p class="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
        Search by skill, filter across categories and experience levels, and enroll directly into structured video programs.
      </p>

      <form class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-12" @submit.prevent="applyFilters">
        <div class="relative md:col-span-5">
          <Search class="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search courses (e.g. Vue, Design, AI, Finance)..."
            aria-label="Search courses"
            class="min-h-[46px] w-full rounded-xl bg-white pl-10 pr-4 text-sm text-brand-900 placeholder:text-slate-400"
          />
        </div>
        <div class="md:col-span-3">
          <select
            v-model="selectedCategory"
            aria-label="Filter by category"
            class="min-h-[46px] w-full rounded-xl bg-white px-3.5 text-sm text-brand-900"
            @change="applyFilters"
          >
            <option value="all">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="md:col-span-2">
          <select
            v-model="selectedLevel"
            aria-label="Filter by level"
            class="min-h-[46px] w-full rounded-xl bg-white px-3.5 text-sm text-brand-900"
            @change="applyFilters"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <button
            type="submit"
            class="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-900 hover:bg-amber-300 transition"
          >
            <SlidersHorizontal class="h-4 w-4" />
            Filter
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
        empty-title="No matching courses found"
        empty-description="Try clearing your search keyword or selecting another category."
        @retry="applyFilters"
      >
        <template #empty-action>
          <button
            type="button"
            class="min-h-[44px] rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            @click="resetFilters"
          >
            Reset Filters
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
        <span>{{ loadingMore ? 'Loading...' : 'Load More Courses' }}</span>
        <ArrowDown class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
