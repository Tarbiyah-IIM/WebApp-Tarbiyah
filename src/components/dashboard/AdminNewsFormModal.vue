<script setup>
import { reactive, ref, watch } from 'vue';
import { ImagePlus, Trash2 } from 'lucide-vue-next';
import ModalDialog from '../ModalDialog.vue';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  initialItem: { type: Object, default: null },
  categories: { type: Array, required: true },
  syncing: { type: Boolean, default: false },
  uploadHandler: { type: Function, required: true }
});

const emit = defineEmits(['close', 'save']);
const { t } = useI18n();

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const uploading = ref(false);
const fileInputRef = ref(null);
const selectedFileName = ref('');
const dateValue = ref('');

const form = reactive({
  id: null,
  name: '',
  jobTitle: '',
  categoryId: '',
  avatarUrl: '',
  quote: '',
  rating: 5,
  isVisible: true,
  sortOrder: 0
});

function formatIsoToReadableDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [year, monthStr, dayStr] = iso.split('-');
  const monthIdx = Number(monthStr) - 1;
  const monthName = MONTHS_ID[monthIdx];
  if (!monthName) return iso;
  return `${Number(dayStr)} ${monthName} ${year}`;
}

function parseReadableDateToIso(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return '';
  const monthIdx = MONTHS_ID.findIndex((m) => m.toLowerCase() === match[2].toLowerCase());
  if (monthIdx === -1) return '';
  const day = String(Number(match[1])).padStart(2, '0');
  const month = String(monthIdx + 1).padStart(2, '0');
  return `${match[3]}-${month}-${day}`;
}

function hydrateForm() {
  selectedFileName.value = '';
  const item = props.initialItem;
  if (item) {
    form.id = item.id;
    form.name = item.name || '';
    form.jobTitle = item.job_title || '';
    form.categoryId = item.category_id || props.categories[0]?.id || '';
    form.avatarUrl = item.avatar_url || '';
    form.quote = item.quote || '';
    form.rating = item.rating || 5;
    form.isVisible = Boolean(item.is_visible);
    form.sortOrder = item.sort_order || 0;
    dateValue.value = parseReadableDateToIso(item.job_title);
    return;
  }
  form.id = null;
  form.name = '';
  form.jobTitle = '';
  form.categoryId = props.categories[0]?.id || '';
  form.avatarUrl = '';
  form.quote = '';
  form.rating = 5;
  form.isVisible = true;
  form.sortOrder = 0;
  dateValue.value = '';
}

watch(
  [() => props.open, () => props.initialItem],
  ([isOpen]) => {
    if (isOpen) hydrateForm();
  },
  { immediate: true }
);

async function handleImageFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  selectedFileName.value = file.name;
  uploading.value = true;
  try {
    const uploadedUrl = await props.uploadHandler(file);
    if (uploadedUrl) {
      form.avatarUrl = uploadedUrl;
    }
  } finally {
    uploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

function clearCover() {
  form.avatarUrl = '';
  selectedFileName.value = '';
}

function submit() {
  const finalDate = dateValue.value ? formatIsoToReadableDate(dateValue.value) : form.jobTitle.trim();
  emit('save', {
    id: form.id,
    name: form.name.trim(),
    jobTitle: finalDate,
    quote: form.quote.trim(),
    avatarUrl: form.avatarUrl?.trim() || null,
    rating: form.rating,
    categoryId: Number(form.categoryId),
    isVisible: Boolean(form.isVisible),
    sortOrder: form.sortOrder
  });
}
</script>

<template>
  <ModalDialog
    :open="open"
    :title="form.id ? t('adminDashboard.cmsPanel.newsModalTitleEdit') : t('adminDashboard.cmsPanel.newsModalTitleAdd')"
    @close="!syncing && !uploading && emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label for="news-modal-title" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsTitleLabel') }}
          <span class="text-rose-500" aria-hidden="true">*</span>
        </label>
        <input
          id="news-modal-title"
          v-model="form.name"
          type="text"
          required
          minlength="2"
          maxlength="120"
          :placeholder="t('adminDashboard.cmsPanel.newsTitlePlaceholder')"
          class="min-h-[44px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
      </div>

      <div>
        <label for="news-modal-category" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsCategoryLabel') }}
          <span class="text-rose-500" aria-hidden="true">*</span>
        </label>
        <select
          id="news-modal-category"
          v-model="form.categoryId"
          required
          class="min-h-[44px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        >
          <option value="" disabled>{{ t('adminDashboard.cmsPanel.selectCategory') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="news-modal-date" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsDateLabel') }}
          <span class="text-rose-500" aria-hidden="true">*</span>
        </label>
        <input
          id="news-modal-date"
          v-model="dateValue"
          type="date"
          required
          class="min-h-[44px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
      </div>

      <div class="space-y-2.5">
        <label for="news-modal-cover" class="block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsCoverLabel') }}
        </label>
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-page p-2.5">
          <div class="flex min-w-0 items-center gap-3">
            <input
              id="news-modal-cover"
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="sr-only"
              @change="handleImageFile"
            />
            <button
              type="button"
              :disabled="uploading || syncing"
              class="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
              @click="fileInputRef?.click()"
            >
              <ImagePlus class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ uploading ? t('adminDashboard.cmsPanel.uploadingImageBtn') : t('adminDashboard.cmsPanel.chooseFileBtn') }}</span>
            </button>
            <span class="truncate text-xs text-slate-600">
              {{
                selectedFileName ||
                (form.avatarUrl ? t('adminDashboard.cmsPanel.coverSavedLabel') : t('adminDashboard.cmsPanel.noFileChosen'))
              }}
            </span>
          </div>
          <button
            v-if="form.avatarUrl"
            type="button"
            class="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
            @click="clearCover"
          >
            <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.removeCoverBtn') }}</span>
          </button>
        </div>
        <img
          v-if="form.avatarUrl"
          :src="form.avatarUrl"
          alt="Preview"
          class="h-36 w-full rounded-xl border border-surface-border object-cover"
        />
        <div>
          <label for="news-modal-cover-url" class="mb-1 block text-[11px] font-semibold text-slate-500">
            {{ t('adminDashboard.cmsPanel.newsCoverUrlLabel') }}
          </label>
          <input
            id="news-modal-cover-url"
            v-model="form.avatarUrl"
            type="text"
            :placeholder="t('adminDashboard.cmsPanel.newsImgPlaceholder')"
            class="min-h-[40px] w-full rounded-xl border border-surface-border px-3.5 text-xs"
          />
        </div>
      </div>

      <div>
        <label for="news-modal-summary" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsSummaryLabel') }}
          <span class="text-rose-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="news-modal-summary"
          v-model="form.quote"
          rows="4"
          required
          minlength="5"
          maxlength="2000"
          :placeholder="t('adminDashboard.cmsPanel.newsSummaryPlaceholder')"
          class="w-full rounded-xl border border-surface-border p-3.5 text-sm leading-relaxed"
        />
      </div>

      <label class="flex cursor-pointer items-center gap-2.5 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-xs font-semibold text-brand-900">
        <input
          v-model="form.isVisible"
          type="checkbox"
          class="h-4 w-4 rounded border-surface-border text-brand-600"
        />
        <span>{{ t('adminDashboard.cmsPanel.visibleLabel') }}</span>
      </label>

      <div class="flex items-center justify-end gap-2.5 border-t border-surface-border pt-4">
        <button
          type="button"
          :disabled="syncing || uploading"
          class="min-h-[42px] rounded-xl border border-surface-border bg-white px-5 text-xs font-bold text-slate-700 transition hover:bg-surface-muted disabled:opacity-50"
          @click="emit('close')"
        >
          {{ t('adminDashboard.cancelBtn') }}
        </button>
        <button
          type="submit"
          :disabled="categories.length === 0 || syncing || uploading"
          class="min-h-[42px] rounded-xl bg-brand-600 px-6 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ t('adminDashboard.cmsPanel.saveBtn') }}
        </button>
      </div>
    </form>
  </ModalDialog>
</template>
