<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { ImagePlus, Trash2 } from 'lucide-vue-next';
import ModalDialog from '../ModalDialog.vue';
import AdminConfirmModal from './AdminConfirmModal.vue';
import { useI18n } from '../../composables/useI18n.js';
import { adminService } from '../../services/admin.service.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  initialItem: { type: Object, default: null },
  syncing: { type: Boolean, default: false },
  uploadHandler: { type: Function, required: true }
});

const emit = defineEmits(['close', 'save', 'dirty-change']);
const { t } = useI18n();

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const uploadingCover = ref(false);
const coverInputRef = ref(null);
const selectedCoverName = ref('');
const dateValue = ref('');
const pendingUploads = new Set();
const baselineSnapshot = ref('');
const sessionToken = ref(0);
const closeConfirmOpen = ref(false);

const form = reactive({
  id: null,
  title: '',
  eventDate: '',
  eventTime: '',
  coverUrl: '',
  description: '',
  isVisible: true,
  sortOrder: 0
});

const isBusy = computed(() => props.syncing || uploadingCover.value);

function formSnapshot() {
  return JSON.stringify({
    title: form.title,
    eventDate: form.eventDate,
    eventTime: form.eventTime,
    dateValue: dateValue.value,
    coverUrl: form.coverUrl,
    description: form.description,
    isVisible: form.isVisible,
    sortOrder: form.sortOrder
  });
}

const isDirty = computed(() => Boolean(props.open) && baselineSnapshot.value !== formSnapshot());

watch(isDirty, (value) => emit('dirty-change', value));

watch(
  () => form.coverUrl,
  (nextUrl, prevUrl) => {
    if (prevUrl && prevUrl !== nextUrl) cleanupPendingUrl(prevUrl);
  }
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

function hydrateForm() {
  selectedCoverName.value = '';
  const item = props.initialItem;
  if (item) {
    form.id = item.id;
    form.title = item.title || '';
    form.eventDate = item.event_date || '';
    form.eventTime = item.event_time || '';
    form.coverUrl = item.cover_url || '';
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
  form.coverUrl = '';
  form.description = '';
  form.isVisible = true;
  form.sortOrder = 0;
  dateValue.value = '';
}

watch(
  [() => props.open, () => props.initialItem],
  ([isOpen]) => {
    if (isOpen) {
      sessionToken.value += 1;
      uploadingCover.value = false;
      closeConfirmOpen.value = false;
      hydrateForm();
      baselineSnapshot.value = formSnapshot();
      return;
    }
    sessionToken.value += 1;
    uploadingCover.value = false;
    closeConfirmOpen.value = false;
    pendingUploads.clear();
  },
  { immediate: true }
);

function cleanupPendingUrl(url) {
  if (pendingUploads.delete(url)) {
    adminService.cleanupMediaByUrl(url);
  }
}

function cleanupAllPendingUploads() {
  for (const url of Array.from(pendingUploads)) {
    pendingUploads.delete(url);
    adminService.cleanupMediaByUrl(url);
  }
}

function requestClose() {
  if (isBusy.value) return;
  if (isDirty.value) {
    closeConfirmOpen.value = true;
    return;
  }
  cleanupAllPendingUploads();
  emit('close');
}

function confirmDiscard() {
  closeConfirmOpen.value = false;
  cleanupAllPendingUploads();
  emit('close');
}

onBeforeUnmount(() => {
  sessionToken.value += 1;
  cleanupAllPendingUploads();
});

async function handleCoverFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const token = sessionToken.value;
  uploadingCover.value = true;
  try {
    const uploadedUrl = await props.uploadHandler(file);
    if (uploadedUrl && token !== sessionToken.value) {
      adminService.cleanupMediaByUrl(uploadedUrl);
      return;
    }
    if (uploadedUrl) {
      pendingUploads.add(uploadedUrl);
      form.coverUrl = uploadedUrl;
      selectedCoverName.value = file.name;
    }
  } catch {
    if (!form.coverUrl) {
      selectedCoverName.value = '';
    }
  } finally {
    if (token === sessionToken.value) uploadingCover.value = false;
    if (coverInputRef.value) coverInputRef.value.value = '';
  }
}

function clearCover() {
  if (form.coverUrl) cleanupPendingUrl(form.coverUrl);
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
    description: form.description.trim(),
    coverUrl: form.coverUrl?.trim() || null,
    isVisible: Boolean(form.isVisible),
    sortOrder: form.sortOrder
  });
}
</script>

<template>
  <ModalDialog
    :open="open"
    :title="form.id ? t('adminDashboard.cmsPanel.agendaModalTitleEdit') : t('adminDashboard.cmsPanel.agendaModalTitleAdd')"
    @close="requestClose"
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
              tabindex="-1"
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
          @click="requestClose"
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

  <AdminConfirmModal
    :open="closeConfirmOpen"
    title="Buang perubahan agenda?"
    description="Perubahan dan gambar yang belum disimpan akan dibuang."
    confirm-label="Ya, Buang"
    :cancel-label="t('adminDashboard.cancelBtn')"
    @confirm="confirmDiscard"
    @cancel="closeConfirmOpen = false"
  />
</template>
