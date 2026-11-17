<script setup>
import { onMounted, ref } from 'vue';
import { ArrowDown } from 'lucide-vue-next';
import { publicService } from '../services/public.service.js';
import { useAsyncState } from '../composables/useAsyncState.js';
import { useUiStore } from '../stores/ui.store.js';
import { useToast } from '../composables/useToast.js';
import CourseCard from './CourseCard.vue';
import StateFeedback from './StateFeedback.vue';

defineProps({
  categories: { type: Array, default: () => [] }
});

const ui = useUiStore();
const toast = useToast();
const { loading, error, isOffline, run } = useAsyncState();

const activeCategory = ref('all');
const courses = ref([]);
const page = ref(1);
const hasMore = ref(false);
const loadingMore = ref(false);

async function fetchCourses(reset = true) {
  if (reset) {
    page.value = 1;
    await run(async () => {
      const res = await publicService.getCourses({
        category: activeCategory.value === 'all' ? '' : activeCategory.value,
        page: 1,
        limit: 6
      });
      courses.value = res.items;
      hasMore.value = res.pagination.hasMore;
    });
  } else {
    loadingMore.value = true;
    try {
      const nextPage = page.value + 1;
      const res = await publicService.getCourses({
        category: activeCategory.value === 'all' ? '' : activeCategory.value,
        page: nextPage,
        limit: 6
      });
      courses.value = [...courses.value, ...res.items];
      page.value = nextPage;
      hasMore.value = res.pagination.hasMore;
    } finally {
      loadingMore.value = false;
    }
  }
}

function selectCategory(slug) {
  if (activeCategory.value === slug) return;
  activeCategory.value = slug;
  fetchCourses(true);
}

function handleAddToCart(course) {
  const added = ui.addToCart(course);
  if (added) {
    toast.success(`"${course.title}" added to cart.`);
  } else {
    toast.info(`"${course.title}" is already in your cart.`);
  }
}

onMounted(() => {
  fetchCourses(true);
});
</script>

<template>
  <section id="courses-section" class="py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <span class="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          Curated Curriculum
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Courses Designed for Success
        </h2>
        <p class="mt-3 text-base text-slate-600">
          Pick a category to filter courses instantly, explore real curriculum syllabi, and start learning today.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Course Categories"
        class="mt-8 flex flex-wrap items-center justify-center gap-2.5"
      >
        <button
          role="tab"
          type="button"
          :aria-selected="activeCategory === 'all'"
          class="min-h-[44px] rounded-full px-5 py-2 text-sm font-semibold transition"
          :class="
            activeCategory === 'all'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'border border-surface-border bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700'
          "
          @click="selectCategory('all')"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          role="tab"
          type="button"
          :aria-selected="activeCategory === cat.slug"
          class="min-h-[44px] rounded-full px-5 py-2 text-sm font-semibold transition"
          :class="
            activeCategory === cat.slug
              ? 'bg-brand-600 text-white shadow-sm'
              : 'border border-surface-border bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-700'
          "
          @click="selectCategory(cat.slug)"
        >
          {{ cat.name }}
        </button>
      </div>

      <div class="mt-10">
        <StateFeedback
          :loading="loading"
          :error="error"
          :offline="isOffline"
          :empty="!loading && courses.length === 0"
          empty-title="No courses in this category yet"
          empty-description="Switch to All categories or explore our full catalog."
          @retry="fetchCourses(true)"
        >
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
          class="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-brand-200 bg-white px-7 py-3 text-sm font-bold text-brand-700 shadow-sm hover:bg-brand-50 disabled:opacity-60 transition"
          @click="fetchCourses(false)"
        >
          <span>{{ loadingMore ? 'Loading...' : 'Load More Courses' }}</span>
          <ArrowDown class="h-4 w-4" />
        </button>
      </div>
    </div>
  </section>
</template>
