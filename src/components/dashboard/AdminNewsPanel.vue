<script setup>
import { onMounted, ref } from 'vue';
import { adminService } from '../../services/admin.service.js';
import { extractApiError } from '../../services/api.js';
import { useLandingStore } from '../../stores/landing.store.js';
import { useToast } from '../../composables/useToast.js';
import { useI18n } from '../../composables/useI18n.js';

const toast = useToast();
const landingStore = useLandingStore();
const { t } = useI18n();
const loading = ref(true);
const news = ref([]);
const categories = ref([]);
const categoryName = ref('');
const newsForm = ref(createEmptyNewsForm());

function createEmptyNewsForm() {
  return { id: null, name: '', jobTitle: '', quote: '', avatarUrl: '', rating: 5, categoryId: '', isVisible: true, sortOrder: 0 };
}

async function loadData() {
  loading.value = true;
  try {
    if (!landingStore.data) await landingStore.fetchLanding();
    const [newsResponse, categoryResponse] = await Promise.all([
      adminService.listTestimonials(),
      adminService.listNewsCategories()
    ]);
    news.value = newsResponse.items;
    categories.value = categoryResponse.items;
    if (!newsForm.value.categoryId && categories.value.length) {
      newsForm.value.categoryId = categories.value[0].id;
    }
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    loading.value = false;
  }
}

async function saveNews() {
  try {
    const payload = { ...newsForm.value, categoryId: Number(newsForm.value.categoryId) };
    if (payload.id) await adminService.updateTestimonial(payload.id, payload);
    else await adminService.createTestimonial(payload);
    await useLandingRefresh();
    newsForm.value = { ...createEmptyNewsForm(), categoryId: categories.value[0]?.id || '' };
    await loadData();
    toast.success(t('adminDashboard.cmsPanel.toasts.newsSaved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function addCategory() {
  try {
    const response = await adminService.createNewsCategory({ name: categoryName.value });
    categoryName.value = '';
    await loadData();
    newsForm.value.categoryId = response.category.id;
    toast.success(t('adminDashboard.cmsPanel.toasts.categorySaved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeCategory(category) {
  if (!window.confirm(t('adminDashboard.cmsPanel.confirmDeleteCategory') + ' ' + category.name)) return;
  try {
    await adminService.deleteNewsCategory(category.id);
    await loadData();
    toast.success(t('adminDashboard.cmsPanel.toasts.categoryDeleted'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeNews(id) {
  if (!window.confirm(t('adminDashboard.cmsPanel.confirmDeleteNews'))) return;
  try {
    await adminService.deleteTestimonial(id);
    await loadData();
    await useLandingRefresh();
    toast.success(t('adminDashboard.cmsPanel.toasts.newsDeleted'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

function editNews(item) {
  newsForm.value = {
    id: item.id,
    name: item.name,
    jobTitle: item.job_title,
    quote: item.quote,
    avatarUrl: item.avatar_url || '',
    rating: item.rating,
    categoryId: item.category_id || categories.value[0]?.id || '',
    isVisible: Boolean(item.is_visible),
    sortOrder: item.sort_order
  };
}

function resetNewsForm() {
  newsForm.value = { ...createEmptyNewsForm(), categoryId: categories.value[0]?.id || '' };
}

async function useLandingRefresh() {
  await landingStore.fetchLanding(true);
}

onMounted(loadData);
</script>

<template>
  <div v-if="loading" class="rounded-2xl border border-surface-border bg-white p-8 text-sm text-slate-500">
    {{ t('adminDashboard.cmsPanel.loading') }}
  </div>
  <div v-else class="space-y-6">
    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.categoryHeading') }}</h2>
      <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="addCategory">
        <input v-model="categoryName" type="text" required minlength="2" maxlength="100" :placeholder="t('adminDashboard.cmsPanel.categoryPlaceholder')" class="min-h-[42px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
        <button type="submit" class="min-h-[42px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">{{ t('adminDashboard.cmsPanel.addCategoryBtn') }}</button>
      </form>
      <div class="flex flex-wrap gap-2">
        <span v-for="category in categories" :key="category.id" class="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-page px-3 py-1.5 text-xs font-semibold text-brand-900">
          {{ category.name }}
          <button type="button" class="rounded px-1 text-rose-600 hover:bg-rose-50" :aria-label="t('adminDashboard.cmsPanel.deleteCategoryAria') + ' ' + category.name" @click="removeCategory(category)">×</button>
        </span>
        <p v-if="categories.length === 0" class="text-sm text-slate-500">{{ t('adminDashboard.cmsPanel.noCategories') }}</p>
      </div>
    </section>

    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
      <h2 class="text-lg font-extrabold text-brand-900">{{ newsForm.id ? t('adminDashboard.cmsPanel.updateNewsBtn') : t('adminDashboard.cmsPanel.addNewsBtn') }}</h2>
      <form class="space-y-3" @submit.prevent="saveNews">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input v-model="newsForm.name" type="text" required :placeholder="t('adminDashboard.cmsPanel.newsTitlePlaceholder')" class="min-h-[42px] rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="newsForm.jobTitle" type="text" required :placeholder="t('adminDashboard.cmsPanel.newsMetaPlaceholder')" class="min-h-[42px] rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <select v-model="newsForm.categoryId" required class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm">
          <option value="" disabled>{{ t('adminDashboard.cmsPanel.selectCategory') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
        <input v-model="newsForm.avatarUrl" type="url" :placeholder="t('adminDashboard.cmsPanel.newsImgPlaceholder')" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        <textarea v-model="newsForm.quote" rows="3" required :placeholder="t('adminDashboard.cmsPanel.newsSummaryPlaceholder')" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
        <div class="flex flex-wrap gap-2">
          <button type="submit" :disabled="categories.length === 0" class="min-h-[42px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {{ newsForm.id ? t('adminDashboard.cmsPanel.updateNewsBtn') : t('adminDashboard.cmsPanel.addNewsBtn') }}
          </button>
          <button v-if="newsForm.id" type="button" class="min-h-[42px] rounded-xl border border-surface-border px-4 text-xs font-bold text-slate-700" @click="resetNewsForm">
            {{ t('adminDashboard.cmsPanel.cancelEditBtn') }}
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.newsListHeading') }}</h2>
      <p v-if="news.length === 0" class="text-sm text-slate-500">{{ t('adminDashboard.cmsPanel.noNews') }}</p>
      <div v-else class="space-y-2">
        <article v-for="item in news" :key="item.id" class="flex flex-col gap-3 rounded-xl bg-surface-page p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <h3 class="truncate text-sm font-bold text-brand-900">{{ item.name }}</h3>
            <p class="mt-1 text-xs text-slate-600">{{ item.category_name || t('adminDashboard.cmsPanel.uncategorized') }} · {{ item.job_title }}</p>
            <p class="mt-1 line-clamp-2 text-xs text-slate-500">{{ item.quote }}</p>
          </div>
          <div class="flex shrink-0 gap-3 text-xs">
            <button type="button" class="font-semibold text-brand-600" @click="editNews(item)">{{ t('adminDashboard.cmsPanel.editBtn') }}</button>
            <button type="button" class="font-semibold text-rose-600" @click="removeNews(item.id)">{{ t('adminDashboard.cmsPanel.delBtn') }}</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
