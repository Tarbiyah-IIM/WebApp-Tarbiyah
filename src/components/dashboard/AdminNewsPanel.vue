<script setup>
import { computed, ref, watch } from 'vue';
import { ImagePlus, Search, Trash2 } from 'lucide-vue-next';
import AdminConfirmModal from './AdminConfirmModal.vue';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  news: { type: Array, required: true },
  categories: { type: Array, required: true },
  syncing: { type: Boolean, default: false },
  uploadHandler: { type: Function, required: true }
});

const emit = defineEmits(['save-news', 'delete-news', 'add-category', 'delete-category']);
const { t } = useI18n();

const categoryName = ref('');
const searchQuery = ref('');
const filterCategoryId = ref('all');
const uploading = ref(false);
const fileInputRef = ref(null);
const confirmState = ref({ open: false, type: '', payload: null, description: '' });
const newsForm = ref(createEmptyNewsForm());

function createEmptyNewsForm() {
  return {
    id: null,
    name: '',
    jobTitle: '',
    quote: '',
    avatarUrl: '',
    rating: 5,
    categoryId: '',
    isVisible: true,
    sortOrder: 0
  };
}

watch(
  () => props.categories,
  (list) => {
    if (!newsForm.value.categoryId && list.length) {
      newsForm.value.categoryId = list[0].id;
    }
  },
  { immediate: true }
);

const filteredNews = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return props.news.filter((item) => {
    if (filterCategoryId.value !== 'all' && Number(item.category_id) !== Number(filterCategoryId.value)) {
      return false;
    }
    if (!q) return true;
    return (
      String(item.name || '').toLowerCase().includes(q) ||
      String(item.quote || '').toLowerCase().includes(q) ||
      String(item.job_title || '').toLowerCase().includes(q)
    );
  });
});

function submitNews() {
  const payload = {
    ...newsForm.value,
    categoryId: Number(newsForm.value.categoryId),
    avatarUrl: newsForm.value.avatarUrl?.trim() || null
  };
  emit('save-news', payload, () => {
    resetNewsForm();
  });
}

function submitCategory() {
  const trimmed = categoryName.value.trim();
  if (!trimmed) return;
  emit('add-category', trimmed, (created) => {
    categoryName.value = '';
    if (created?.id) {
      newsForm.value.categoryId = created.id;
    }
  });
}

async function handleImageFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const uploadedUrl = await props.uploadHandler(file);
    if (uploadedUrl) {
      newsForm.value.avatarUrl = uploadedUrl;
    }
  } finally {
    uploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
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
    categoryId: item.category_id || props.categories[0]?.id || '',
    isVisible: Boolean(item.is_visible),
    sortOrder: item.sort_order
  };
}

function resetNewsForm() {
  newsForm.value = { ...createEmptyNewsForm(), categoryId: props.categories[0]?.id || '' };
}

function requestDeleteCategory(category) {
  confirmState.value = {
    open: true,
    type: 'category',
    payload: category,
    description: `${t('adminDashboard.cmsPanel.confirmDeleteCategory')} (${category.name})`
  };
}

function requestDeleteNews(item) {
  confirmState.value = {
    open: true,
    type: 'news',
    payload: item,
    description: `${t('adminDashboard.cmsPanel.confirmDeleteNews')} (${item.name})`
  };
}

function confirmDelete() {
  const { type, payload } = confirmState.value;
  confirmState.value.open = false;
  if (type === 'category' && payload) {
    emit('delete-category', payload.id);
  } else if (type === 'news' && payload) {
    emit('delete-news', payload.id);
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.categoryHeading') }}</h2>
      <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="submitCategory">
        <input
          v-model="categoryName"
          type="text"
          required
          minlength="2"
          maxlength="100"
          :placeholder="t('adminDashboard.cmsPanel.categoryPlaceholder')"
          class="min-h-[42px] flex-1 rounded-xl border border-surface-border px-3.5 text-sm"
        />
        <button
          type="submit"
          :disabled="syncing"
          class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {{ t('adminDashboard.cmsPanel.addCategoryBtn') }}
        </button>
      </form>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="category in categories"
          :key="category.id"
          class="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface-page px-3.5 py-1.5 text-xs font-semibold text-brand-900"
        >
          {{ category.name }}
          <button
            type="button"
            class="rounded-full px-1 text-rose-600 transition hover:bg-rose-50"
            :aria-label="t('adminDashboard.cmsPanel.deleteCategoryAria') + ' ' + category.name"
            @click="requestDeleteCategory(category)"
          >
            ×
          </button>
        </span>
        <p v-if="categories.length === 0" class="text-sm text-slate-500">
          {{ t('adminDashboard.cmsPanel.noCategories') }}
        </p>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4 xl:col-span-5">
        <h2 class="text-lg font-extrabold text-brand-900">
          {{ newsForm.id ? t('adminDashboard.cmsPanel.updateNewsBtn') : t('adminDashboard.cmsPanel.addNewsBtn') }}
        </h2>
        <form class="space-y-3" @submit.prevent="submitNews">
          <input
            v-model="newsForm.name"
            type="text"
            required
            :placeholder="t('adminDashboard.cmsPanel.newsTitlePlaceholder')"
            class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
          />
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              v-model="newsForm.jobTitle"
              type="text"
              required
              :placeholder="t('adminDashboard.cmsPanel.newsMetaPlaceholder')"
              class="min-h-[42px] rounded-xl border border-surface-border px-3.5 text-sm"
            />
            <select
              v-model="newsForm.categoryId"
              required
              class="min-h-[42px] rounded-xl border border-surface-border px-3.5 text-sm"
            >
              <option value="" disabled>{{ t('adminDashboard.cmsPanel.selectCategory') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <div class="flex gap-2">
              <input
                v-model="newsForm.avatarUrl"
                type="text"
                :placeholder="t('adminDashboard.cmsPanel.newsImgPlaceholder')"
                class="min-h-[42px] flex-1 rounded-xl border border-surface-border px-3.5 text-sm"
              />
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="sr-only"
                @change="handleImageFile"
              />
              <button
                type="button"
                :disabled="uploading || syncing"
                class="inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-xl border border-surface-border bg-surface-page px-3.5 text-xs font-bold text-brand-900 transition hover:bg-brand-50 disabled:opacity-50"
                @click="fileInputRef?.click()"
              >
                <ImagePlus class="h-4 w-4 text-brand-600" aria-hidden="true" />
                <span>{{ uploading ? t('adminDashboard.cmsPanel.uploadingImageBtn') : t('adminDashboard.cmsPanel.uploadImageBtn') }}</span>
              </button>
            </div>
            <img
              v-if="newsForm.avatarUrl"
              :src="newsForm.avatarUrl"
              alt="Preview"
              class="h-28 w-full rounded-xl border border-surface-border object-cover"
            />
          </div>

          <textarea
            v-model="newsForm.quote"
            rows="4"
            required
            :placeholder="t('adminDashboard.cmsPanel.newsSummaryPlaceholder')"
            class="w-full rounded-xl border border-surface-border p-3.5 text-sm leading-relaxed"
          />

          <label class="inline-flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
            <input
              v-model="newsForm.isVisible"
              type="checkbox"
              class="h-4 w-4 rounded border-surface-border text-brand-600"
            />
            <span>{{ t('adminDashboard.cmsPanel.visibleLabel') }}</span>
          </label>

          <div class="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              :disabled="categories.length === 0 || syncing || uploading"
              class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ newsForm.id ? t('adminDashboard.cmsPanel.updateNewsBtn') : t('adminDashboard.cmsPanel.addNewsBtn') }}
            </button>
            <button
              v-if="newsForm.id"
              type="button"
              class="min-h-[42px] rounded-xl border border-surface-border px-4 text-xs font-bold text-slate-700 hover:bg-surface-muted"
              @click="resetNewsForm"
            >
              {{ t('adminDashboard.cmsPanel.cancelEditBtn') }}
            </button>
          </div>
        </form>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4 xl:col-span-7">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.newsListHeading') }}</h2>
          <div class="flex flex-col gap-2 sm:flex-row">
            <div class="relative">
              <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                v-model="searchQuery"
                type="search"
                :placeholder="t('adminDashboard.cmsPanel.newsSearchPlaceholder')"
                class="min-h-[38px] w-full rounded-xl border border-surface-border pl-9 pr-3 text-xs sm:w-52"
              />
            </div>
            <select
              v-model="filterCategoryId"
              class="min-h-[38px] rounded-xl border border-surface-border px-3 text-xs font-semibold"
            >
              <option value="all">{{ t('adminDashboard.cmsPanel.allCategoriesOpt') }}</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <p v-if="filteredNews.length === 0" class="rounded-xl border border-dashed border-surface-border py-8 text-center text-sm text-slate-500">
          {{ t('adminDashboard.cmsPanel.noNews') }}
        </p>

        <div v-else class="space-y-3">
          <article
            v-for="item in filteredNews"
            :key="item.id"
            class="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-page p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex min-w-0 items-start gap-3">
              <img
                v-if="item.avatar_url"
                :src="item.avatar_url"
                :alt="item.name"
                class="h-14 w-16 shrink-0 rounded-lg border border-surface-border object-cover"
              />
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate text-sm font-bold text-brand-900">{{ item.name }}</h3>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    :class="item.is_visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'"
                  >
                    {{ item.is_visible ? t('adminDashboard.cmsPanel.publishedBadge') : t('adminDashboard.cmsPanel.draftBadge') }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-slate-600">
                  {{ item.category_name || t('adminDashboard.cmsPanel.uncategorized') }} · {{ item.job_title }}
                </p>
                <p class="mt-1 line-clamp-2 text-xs text-slate-500">{{ item.quote }}</p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2 text-xs">
              <button
                type="button"
                class="rounded-lg border border-surface-border bg-white px-3 py-1.5 font-semibold text-brand-600 hover:bg-brand-50"
                @click="editNews(item)"
              >
                {{ t('adminDashboard.cmsPanel.editBtn') }}
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-100"
                @click="requestDeleteNews(item)"
              >
                <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
                <span>{{ t('adminDashboard.cmsPanel.delBtn') }}</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <AdminConfirmModal
      :open="confirmState.open"
      :title="t('adminDashboard.confirmDeleteTitle')"
      :description="confirmState.description"
      :confirm-label="t('adminDashboard.confirmDeleteBtn')"
      :cancel-label="t('adminDashboard.cancelBtn')"
      :busy="syncing"
      @confirm="confirmDelete"
      @cancel="confirmState.open = false"
    />
  </div>
</template>
