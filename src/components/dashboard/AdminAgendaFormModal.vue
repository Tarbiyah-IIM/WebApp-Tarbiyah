<script setup>
import { computed, reactive, ref, watch } from 'vue';
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Images,
  Trash2
} from 'lucide-vue-next';
import ModalDialog from '../ModalDialog.vue';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  initialItem: { type: Object, default: null },
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
const selectedCoverName = ref('');
const dateValue = ref('');

const form = reactive({
  id: null,
  title: '',
  eventDate: '',
  eventTime: '',
  location: '',
  coverUrl: '',
  galleryUrls: [],
  slideshowPosition: 'bottom',
  description: '',
  isVisible: true,
  sortOrder: 0
});

const isBusy = computed(() => props.syncing || uploadingCover.value || uploadingGallery.value);

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
  selectedCoverName.value = '';
  const item = props.initialItem;
  if (item) {
    form.id = item.id;
    form.title = item.title || '';
    form.eventDate = item.event_date || '';
    form.eventTime = item.event_time || '';
    form.location = item.location || '';
    form.coverUrl = item.cover_url || '';
    form.galleryUrls = Array.isArray(item.gallery_urls) ? [...item.gallery_urls] : [];
    form.slideshowPosition = ['top', 'middle', 'bottom', 'none'].includes(item.slideshow_position)
      ? item.slideshow_position
      : 'bottom';
    form.description = item.description || item.excerpt || '';
    form.isVisible = Boolean(item.is_visible);
    form.sortOrder = item.sort_order || 0;
    dateValue.value = parseReadableDateToIso(item.event_date);
    return;
  }
  form.id = null;
  form.title = '';
  form.eventDate = '';
  form.eventTime = '';
  form.location = '';
  form.coverUrl = '';
  form.galleryUrls = [];
  form.slideshowPosition = 'bottom';
  form.description = '';
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

async function handleCoverFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  selectedCoverName.value = file.name;
  uploadingCover.value = true;
  try {
    const uploadedUrl = await props.uploadHandler(file);
    if (uploadedUrl) {
      form.coverUrl = uploadedUrl;
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
  form.coverUrl = '';
  selectedCoverName.value = '';
}

function submit() {
  const finalDate = dateValue.value ? formatIsoToReadableDate(dateValue.value) : form.eventDate.trim();
  emit('save', {
    id: form.id,
    title: form.title.trim(),
    eventDate: finalDate,
    eventTime: form.eventTime.trim() || null,
    location: form.location.trim() || null,
    description: form.description.trim(),
    coverUrl: form.coverUrl?.trim() || null,
    galleryUrls: form.galleryUrls.filter(Boolean),
    slideshowPosition: form.slideshowPosition,
    isVisible: Boolean(form.isVisible),
    sortOrder: form.sortOrder
  });
}
</script>

<template>
  <ModalDialog
    :open="open"
    :title="form.id ? t('adminDashboard.cmsPanel.agendaModalTitleEdit') : t('adminDashboard.cmsPanel.agendaModalTitleAdd')"
    @close="!isBusy && emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label for="agenda-modal-title" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.agendaTitleLabel') }}
          <span class="text-rose-500" aria-hidden="true">*</span>
        </label>
        <input
          id="agenda-modal-title"
          v-model="form.title"
          type="text"
          required
          minlength="2"
          maxlength="160"
          :placeholder="t('adminDashboard.cmsPanel.agendaTitlePlaceholder')"
          class="min-h-[44px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label for="agenda-modal-date" class="mb-1.5 block text-xs font-bold text-brand-900">
            {{ t('adminDashboard.cmsPanel.agendaDateLabel') }}
            <span class="text-rose-500" aria-hidden="true">*</span>
          </label>
          <input
            id="agenda-modal-date"
            v-model="dateValue"
            type="date"
            :required="!form.eventDate"
            class="min-h-[44px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
          />
          <p v-if="!dateValue && form.eventDate" class="mt-1 text-[11px] text-slate-500">
            {{ form.eventDate }}
          </p>
        </div>

        <div>
          <label for="agenda-modal-time" class="mb-1.5 block text-xs font-bold text-brand-900">
            {{ t('adminDashboard.cmsPanel.agendaTimeLabel') }}
          </label>
          <input
            id="agenda-modal-time"
            v-model="form.eventTime"
            type="text"
            maxlength="80"
            :placeholder="t('adminDashboard.cmsPanel.agendaTimePlaceholder')"
            class="min-h-[44px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label for="agenda-modal-location" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.agendaLocationLabel') }}
        </label>
        <input
          id="agenda-modal-location"
          v-model="form.location"
          type="text"
          maxlength="180"
          :placeholder="t('adminDashboard.cmsPanel.agendaLocationPlaceholder')"
          class="min-h-[44px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
      </div>

      <div class="space-y-2.5">
        <label for="agenda-modal-cover" class="block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.newsCoverLabel') }}
        </label>
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-page p-2.5">
          <div class="flex min-w-0 items-center gap-3">
            <input
              id="agenda-modal-cover"
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
                (form.coverUrl ? t('adminDashboard.cmsPanel.coverSavedLabel') : t('adminDashboard.cmsPanel.noFileChosen'))
              }}
            </span>
          </div>
          <button
            v-if="form.coverUrl"
            type="button"
            class="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
            @click="clearCover"
          >
            <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.removeCoverBtn') }}</span>
          </button>
        </div>
        <img
          v-if="form.coverUrl"
          :src="form.coverUrl"
          alt="Preview"
          class="h-36 w-full rounded-xl border border-surface-border object-cover"
        />
        <div>
          <label for="agenda-modal-cover-url" class="mb-1 block text-[11px] font-semibold text-slate-500">
            {{ t('adminDashboard.cmsPanel.newsCoverUrlLabel') }}
          </label>
          <input
            id="agenda-modal-cover-url"
            v-model="form.coverUrl"
            type="text"
            :placeholder="t('adminDashboard.cmsPanel.newsImgPlaceholder')"
            class="min-h-[40px] w-full rounded-xl border border-surface-border px-3.5 text-xs"
          />
        </div>
      </div>

      <div class="space-y-3 rounded-2xl border border-surface-border bg-surface-page p-4">
        <div class="space-y-2">
          <label for="agenda-modal-gallery" class="block text-xs font-bold text-brand-900">
            {{ t('adminDashboard.cmsPanel.newsGalleryLabel') }}
          </label>
          <div class="flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-white p-2.5">
            <input
              id="agenda-modal-gallery"
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
          <label for="agenda-modal-slideshow-pos" class="mb-1.5 block text-xs font-bold text-brand-900">
            {{ t('adminDashboard.cmsPanel.slideshowPosLabel') }}
          </label>
          <select
            id="agenda-modal-slideshow-pos"
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
        <label for="agenda-modal-description" class="mb-1.5 block text-xs font-bold text-brand-900">
          {{ t('adminDashboard.cmsPanel.agendaDescLabel') }}
          <span class="text-rose-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="agenda-modal-description"
          v-model="form.description"
          rows="6"
          required
          minlength="5"
          maxlength="100000"
          :placeholder="t('adminDashboard.cmsPanel.agendaDescPlaceholder')"
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
          :disabled="isBusy"
          class="min-h-[42px] rounded-xl border border-surface-border bg-white px-5 text-xs font-bold text-slate-700 transition hover:bg-surface-muted disabled:opacity-50"
          @click="emit('close')"
        >
          {{ t('adminDashboard.cancelBtn') }}
        </button>
        <button
          type="submit"
          :disabled="isBusy"
          class="min-h-[42px] rounded-xl bg-brand-600 px-6 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ t('adminDashboard.cmsPanel.saveBtn') }}
        </button>
      </div>
    </form>
  </ModalDialog>
</template>
