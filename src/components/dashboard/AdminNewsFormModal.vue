<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  ImagePlus,
  Images,
  Info,
  Trash2,
  X
} from 'lucide-vue-next';
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

const uploadingCover = ref(false);
const uploadingGallery = ref(false);
const coverInputRef = ref(null);
const galleryInputRef = ref(null);
const categoryDropdownRef = ref(null);
const categoryMenuOpen = ref(false);
const categoryError = ref(false);
const selectedCoverName = ref('');
const dateValue = ref('');

const form = reactive({
  id: null,
  name: '',
  jobTitle: '',
  categoryIds: [],
  avatarUrl: '',
  galleryUrls: [],
  slideshowPosition: 'bottom',
  quote: '',
  fullContent: '',
  relatedUrl: '',
  rating: 5,
  isVisible: true,
  sortOrder: 0
});

const isBusy = computed(() => props.syncing || uploadingCover.value || uploadingGallery.value);

const selectedCategories = computed(() =>
  props.categories.filter((cat) => form.categoryIds.includes(Number(cat.id)))
);

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

function hydrateCategoryIds(item) {
  if (Array.isArray(item.category_ids) && item.category_ids.length > 0) {
    return item.category_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
  }
  if (item.category_id) {
    return [Number(item.category_id)];
  }
  return [];
}

function hydrateForm() {
  selectedCoverName.value = '';
  categoryMenuOpen.value = false;
  categoryError.value = false;
  const item = props.initialItem;
  if (item) {
    form.id = item.id;
    form.name = item.name || '';
    form.jobTitle = item.job_title || '';
    form.categoryIds = hydrateCategoryIds(item);
    form.avatarUrl = item.avatar_url || '';
    form.galleryUrls = Array.isArray(item.gallery_urls) ? [...item.gallery_urls] : [];
    form.slideshowPosition = ['top', 'middle', 'bottom', 'none'].includes(item.slideshow_position)
      ? item.slideshow_position
      : 'bottom';
    form.quote = item.quote || '';
    form.fullContent = item.full_content || '';
    form.relatedUrl = item.related_url || '';
    form.rating = item.rating || 5;
    form.isVisible = Boolean(item.is_visible);
    form.sortOrder = item.sort_order || 0;
    dateValue.value = parseReadableDateToIso(item.job_title);
    return;
  }
  form.id = null;
  form.name = '';
  form.jobTitle = '';
  form.categoryIds = props.categories[0]?.id ? [Number(props.categories[0].id)] : [];
  form.avatarUrl = '';
  form.galleryUrls = [];
  form.slideshowPosition = 'bottom';
  form.quote = '';
  form.fullContent = '';
  form.relatedUrl = '';
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

function handleDocumentClick(event) {
  if (!categoryMenuOpen.value || !categoryDropdownRef.value) return;
  if (!categoryDropdownRef.value.contains(event.target)) {
    categoryMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});

function toggleCategory(catId) {
  const numericId = Number(catId);
  const idx = form.categoryIds.indexOf(numericId);
  if (idx === -1) {
    form.categoryIds.push(numericId);
  } else {
    form.categoryIds.splice(idx, 1);
  }
  categoryError.value = false;
}

function removeCategory(catId) {
  const numericId = Number(catId);
  form.categoryIds = form.categoryIds.filter((id) => id !== numericId);
}

async function handleCoverFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  selectedCoverName.value = file.name;
  uploadingCover.value = true;
  try {
    const uploadedUrl = await props.uploadHandler(file);
    if (uploadedUrl) {
      form.avatarUrl = uploadedUrl;
    }
  } finally {
    uploadingCover.value = false;
    if (coverInputRef.value) coverInputRef.value.value = '';
  }
}

async function handleGalleryFiles(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;
  uploadingGallery.value = true;
  try {
    for (const file of files) {
      if (form.galleryUrls.length >= 20) break;
      const uploadedUrl = await props.uploadHandler(file);
      if (uploadedUrl && !form.galleryUrls.includes(uploadedUrl)) {
        form.galleryUrls.push(uploadedUrl);
      }
    }
  } finally {
    uploadingGallery.value = false;
    if (galleryInputRef.value) galleryInputRef.value.value = '';
  }
}

function moveGalleryPhoto(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= form.galleryUrls.length) return;
  const copy = [...form.galleryUrls];
  const [moved] = copy.splice(index, 1);
  copy.splice(target, 0, moved);
  form.galleryUrls = copy;
}

function removeGalleryPhoto(index) {
  form.galleryUrls.splice(index, 1);
}

function clearCover() {
  form.avatarUrl = '';
  selectedCoverName.value = '';
}

function submit() {
  if (form.categoryIds.length === 0) {
    categoryError.value = true;
    categoryMenuOpen.value = true;
    return;
  }
  const finalDate = dateValue.value ? formatIsoToReadableDate(dateValue.value) : form.jobTitle.trim();
  emit('save', {
    id: form.id,
    name: form.name.trim(),
    jobTitle: finalDate,
    quote: form.quote.trim(),
    fullContent: form.fullContent.trim() || null,
    avatarUrl: form.avatarUrl?.trim() || null,
    galleryUrls: form.galleryUrls.filter(Boolean),
    slideshowPosition: form.slideshowPosition,
    relatedUrl: form.relatedUrl?.trim() || null,
    rating: form.rating,
    categoryId: form.categoryIds[0],
    categoryIds: [...form.categoryIds],
    isVisible: Boolean(form.isVisible),
    sortOrder: form.sortOrder
  });
}
</script>

<template>
  <ModalDialog
    :open="open"
    :title="form.id ? t('adminDashboard.cmsPanel.newsModalTitleEdit') : t('adminDashboard.cmsPanel.newsModalTitleAdd')"
    @close="!isBusy && emit('close')"
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

      <div ref="categoryDropdownRef" class="relative">
        <label id="news-modal-category-label" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsCategoryLabel') }}
          <span class="text-rose-500" aria-hidden="true">*</span>
        </label>
        <button
          id="news-modal-category-trigger"
          type="button"
          aria-labelledby="news-modal-category-label"
          :aria-expanded="categoryMenuOpen"
          class="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2 text-left text-sm transition"
          :class="categoryError ? 'border-rose-400 ring-1 ring-rose-300' : 'border-surface-border hover:border-brand-300'"
          @click="categoryMenuOpen = !categoryMenuOpen"
        >
          <span v-if="selectedCategories.length === 0" class="text-slate-400">
            {{ t('adminDashboard.cmsPanel.selectCategoryMulti') }}
          </span>
          <span v-else class="flex flex-wrap items-center gap-1.5">
            <span
              v-for="cat in selectedCategories"
              :key="cat.id"
              class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700"
            >
              <span>{{ cat.name }}</span>
              <span
                role="button"
                tabindex="0"
                :aria-label="'Hapus ' + cat.name"
                class="rounded-full p-0.5 hover:bg-brand-100"
                @click.stop="removeCategory(cat.id)"
                @keydown.enter.stop.prevent="removeCategory(cat.id)"
              >
                <X class="h-3 w-3" aria-hidden="true" />
              </span>
            </span>
          </span>
          <ChevronDown
            class="h-4 w-4 shrink-0 text-slate-400 transition"
            :class="{ 'rotate-180': categoryMenuOpen }"
            aria-hidden="true"
          />
        </button>

        <div
          v-if="categoryMenuOpen"
          class="absolute z-20 mt-1.5 max-h-52 w-full overflow-y-auto rounded-xl border border-surface-border bg-white p-1.5 shadow-float"
        >
          <label
            v-for="category in categories"
            :key="category.id"
            class="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-brand-900 transition hover:bg-brand-50"
          >
            <input
              type="checkbox"
              :checked="form.categoryIds.includes(Number(category.id))"
              class="h-4 w-4 rounded border-surface-border text-brand-600"
              @change="toggleCategory(category.id)"
            />
            <span>{{ category.name }}</span>
          </label>
        </div>

        <p v-if="categoryError" class="mt-1 text-xs font-semibold text-rose-600">
          {{ t('adminDashboard.cmsPanel.categoryRequiredHint') }}
        </p>
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
          :required="!form.jobTitle"
          class="min-h-[44px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
        <p v-if="!dateValue && form.jobTitle" class="mt-1 text-[11px] text-slate-500">
          {{ form.jobTitle }}
        </p>
      </div>

      <div class="space-y-2.5">
        <label for="news-modal-cover" class="block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsCoverLabel') }}
        </label>
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-page p-2.5">
          <div class="flex min-w-0 items-center gap-3">
            <input
              id="news-modal-cover"
              ref="coverInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="sr-only"
              @change="handleCoverFile"
            />
            <button
              type="button"
              :disabled="isBusy"
              class="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
              @click="coverInputRef?.click()"
            >
              <ImagePlus class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ uploadingCover ? t('adminDashboard.cmsPanel.uploadingImageBtn') : t('adminDashboard.cmsPanel.chooseFileBtn') }}</span>
            </button>
            <span class="truncate text-xs text-slate-600">
              {{
                selectedCoverName ||
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

      <div class="space-y-3 rounded-2xl border border-surface-border bg-surface-page p-4">
        <div class="space-y-2">
          <label for="news-modal-gallery" class="block text-xs font-bold text-brand-900">
            {{ t('adminDashboard.cmsPanel.newsGalleryLabel') }}
          </label>
          <div class="flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-white p-2.5">
            <input
              id="news-modal-gallery"
              ref="galleryInputRef"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="sr-only"
              @change="handleGalleryFiles"
            />
            <button
              type="button"
              :disabled="isBusy || form.galleryUrls.length >= 20"
              class="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 text-xs font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
              @click="galleryInputRef?.click()"
            >
              <Images class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ uploadingGallery ? t('adminDashboard.cmsPanel.uploadingGalleryBtn') : t('adminDashboard.cmsPanel.chooseMultipleFilesBtn') }}</span>
            </button>
            <span class="text-xs text-slate-600">
              {{
                form.galleryUrls.length > 0
                  ? `${form.galleryUrls.length} ${t('adminDashboard.cmsPanel.galleryCountSuffix')}`
                  : t('adminDashboard.cmsPanel.noFileChosen')
              }}
            </span>
          </div>

          <div v-if="form.galleryUrls.length > 0" class="grid grid-cols-2 gap-2.5 pt-1 sm:grid-cols-3">
            <div
              v-for="(url, idx) in form.galleryUrls"
              :key="url + '-' + idx"
              class="group relative overflow-hidden rounded-xl border border-surface-border bg-white"
            >
              <img :src="url" :alt="`Dokumentasi ${idx + 1}`" class="h-20 w-full object-cover" />
              <div class="flex items-center justify-between gap-1 px-1.5 py-1 text-[10px]">
                <div class="flex items-center gap-0.5">
                  <button
                    type="button"
                    :disabled="idx === 0"
                    aria-label="Geser kiri"
                    class="rounded p-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    @click="moveGalleryPhoto(idx, -1)"
                  >
                    <ChevronLeft class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    :disabled="idx === form.galleryUrls.length - 1"
                    aria-label="Geser kanan"
                    class="rounded p-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    @click="moveGalleryPhoto(idx, 1)"
                  >
                    <ChevronRight class="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Hapus foto dokumentasi"
                  class="rounded p-0.5 text-rose-600 hover:bg-rose-50"
                  @click="removeGalleryPhoto(idx)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label for="news-modal-slideshow-pos" class="mb-1.5 block text-xs font-bold text-brand-900">
            {{ t('adminDashboard.cmsPanel.slideshowPosLabel') }}
          </label>
          <select
            id="news-modal-slideshow-pos"
            v-model="form.slideshowPosition"
            class="min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm font-medium"
          >
            <option value="bottom">{{ t('adminDashboard.cmsPanel.slideshowPosBottom') }}</option>
            <option value="middle">{{ t('adminDashboard.cmsPanel.slideshowPosMiddle') }}</option>
            <option value="top">{{ t('adminDashboard.cmsPanel.slideshowPosTop') }}</option>
            <option value="none">{{ t('adminDashboard.cmsPanel.slideshowPosNone') }}</option>
          </select>
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
          rows="3"
          required
          minlength="5"
          maxlength="2000"
          :placeholder="t('adminDashboard.cmsPanel.newsSummaryPlaceholder')"
          class="w-full rounded-xl border border-surface-border p-3.5 text-sm leading-relaxed"
        />
      </div>

      <div>
        <label for="news-modal-full-content" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsFullContentLabel') }}
        </label>
        <textarea
          id="news-modal-full-content"
          v-model="form.fullContent"
          rows="5"
          maxlength="100000"
          :placeholder="t('adminDashboard.cmsPanel.newsFullContentPlaceholder')"
          class="w-full rounded-xl border border-surface-border p-3.5 text-sm leading-relaxed"
        />
      </div>

      <div>
        <label for="news-modal-related-url" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsRelatedUrlLabel') }}
        </label>
        <div class="relative">
          <input
            id="news-modal-related-url"
            v-model="form.relatedUrl"
            type="text"
            maxlength="500"
            :placeholder="t('adminDashboard.cmsPanel.newsRelatedUrlPlaceholder')"
            class="min-h-[44px] w-full rounded-xl border border-surface-border pl-3.5 pr-10 text-sm"
          />
          <Globe
            class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </div>
        <p class="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info class="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden="true" />
          <span>{{ t('adminDashboard.cmsPanel.newsRelatedUrlHint') }}</span>
        </p>
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
          :disabled="isBusy"
          class="min-h-[42px] rounded-xl border border-surface-border bg-white px-5 text-xs font-bold text-slate-700 transition hover:bg-surface-muted disabled:opacity-50"
          @click="emit('close')"
        >
          {{ t('adminDashboard.cancelBtn') }}
        </button>
        <button
          type="submit"
          :disabled="categories.length === 0 || isBusy"
          class="min-h-[42px] rounded-xl bg-brand-600 px-6 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ t('adminDashboard.cmsPanel.saveBtn') }}
        </button>
      </div>
    </form>
  </ModalDialog>
</template>
