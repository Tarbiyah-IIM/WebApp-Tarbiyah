<script setup>
import { computed, ref } from 'vue';
import { Calendar, Images, Link2, Plus, Search, Trash2 } from 'lucide-vue-next';
import AdminConfirmModal from './AdminConfirmModal.vue';
import AdminNewsFormModal from './AdminNewsFormModal.vue';
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
const modalOpen = ref(false);
const editingItem = ref(null);
const confirmState = ref({ open: false, type: '', payload: null, description: '' });

function getItemCategories(item) {
  if (Array.isArray(item.categories) && item.categories.length > 0) {
    return item.categories;
  }
  if (item.category_name) {
    return [{ id: item.category_id || 0, name: item.category_name }];
  }
  return [];
}

const filteredNews = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return props.news.filter((item) => {
    if (filterCategoryId.value !== 'all') {
      const targetId = Number(filterCategoryId.value);
      const ids = Array.isArray(item.category_ids) && item.category_ids.length > 0
        ? item.category_ids.map(Number)
        : [Number(item.category_id)];
      if (!ids.includes(targetId)) {
        return false;
      }
    }
    if (!q) return true;
    return (
      String(item.name || '').toLowerCase().includes(q) ||
      String(item.quote || '').toLowerCase().includes(q) ||
      String(item.full_content || '').toLowerCase().includes(q) ||
      String(item.job_title || '').toLowerCase().includes(q)
    );
  });
});

function openAddModal() {
  editingItem.value = null;
  modalOpen.value = true;
}

function openEditModal(item) {
  editingItem.value = item;
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  editingItem.value = null;
}

function handleSaveNews(payload) {
  emit('save-news', payload, () => {
    closeModal();
  });
}

function submitCategory() {
  const trimmed = categoryName.value.trim();
  if (!trimmed) return;
  emit('add-category', trimmed, () => {
    categoryName.value = '';
  });
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

    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-2.5">
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.newsListHeading') }}</h2>
          <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
            {{ filteredNews.length }}
          </span>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="relative flex-1 sm:w-64">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="t('adminDashboard.cmsPanel.newsSearchPlaceholder')"
              class="min-h-[40px] w-full rounded-xl border border-surface-border pl-9 pr-3 text-xs"
            />
          </div>
          <select
            v-model="filterCategoryId"
            class="min-h-[40px] rounded-xl border border-surface-border px-3 text-xs font-semibold"
          >
            <option value="all">{{ t('adminDashboard.cmsPanel.allCategoriesOpt') }}</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <button
            type="button"
            :disabled="categories.length === 0"
            class="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="openAddModal"
          >
            <Plus class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.addNewsBtn') }}</span>
          </button>
        </div>
      </div>

      <div
        v-if="filteredNews.length === 0"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-border py-12 text-center"
      >
        <p class="text-sm text-slate-500">{{ t('adminDashboard.cmsPanel.noNews') }}</p>
        <button
          v-if="categories.length > 0"
          type="button"
          class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white hover:bg-brand-700"
          @click="openAddModal"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          <span>{{ t('adminDashboard.cmsPanel.addNewsBtn') }}</span>
        </button>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          v-for="item in filteredNews"
          :key="item.id"
          class="flex flex-col justify-between gap-4 rounded-2xl border border-surface-border bg-surface-page p-4"
        >
          <div class="flex items-start gap-3.5">
            <img
              v-if="item.avatar_url"
              :src="item.avatar_url"
              :alt="item.name"
              class="h-18 w-24 shrink-0 rounded-xl border border-surface-border object-cover"
            />
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <template v-if="getItemCategories(item).length">
                  <span
                    v-for="cat in getItemCategories(item)"
                    :key="cat.id + '-' + cat.name"
                    class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700"
                  >
                    {{ cat.name }}
                  </span>
                </template>
                <span v-else class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
                  {{ t('adminDashboard.cmsPanel.uncategorized') }}
                </span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  :class="item.is_visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'"
                >
                  {{ item.is_visible ? t('adminDashboard.cmsPanel.publishedBadge') : t('adminDashboard.cmsPanel.draftBadge') }}
                </span>
                <span
                  v-if="item.gallery_urls?.length"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800"
                >
                  <Images class="h-3 w-3" aria-hidden="true" />
                  <span>{{ item.gallery_urls.length }} {{ t('news.photosCountBadge') }}</span>
                </span>
                <span
                  v-if="item.related_url && item.related_url !== '#'"
                  class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700"
                >
                  <Link2 class="h-3 w-3" aria-hidden="true" />
                  <span>Link</span>
                </span>
              </div>
              <h3 class="truncate text-sm font-bold text-brand-900">{{ item.name }}</h3>
              <p class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Calendar class="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{{ item.job_title }}</span>
              </p>
              <p class="line-clamp-2 text-xs leading-relaxed text-slate-600">{{ item.quote }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-surface-border pt-3 text-xs">
            <button
              type="button"
              class="rounded-lg border border-surface-border bg-white px-3.5 py-1.5 font-semibold text-brand-600 hover:bg-brand-50"
              @click="openEditModal(item)"
            >
              {{ t('adminDashboard.cmsPanel.editBtn') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 font-semibold text-rose-600 hover:bg-rose-100"
              @click="requestDeleteNews(item)"
            >
              <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ t('adminDashboard.cmsPanel.delBtn') }}</span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <AdminNewsFormModal
      :open="modalOpen"
      :initial-item="editingItem"
      :categories="categories"
      :syncing="syncing"
      :upload-handler="uploadHandler"
      @close="closeModal"
      @save="handleSaveNews"
    />

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
