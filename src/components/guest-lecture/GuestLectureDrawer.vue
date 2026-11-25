<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ExternalLink, ImagePlus, Trash2, X } from 'lucide-vue-next';
import { useI18n } from '../../composables/useI18n.js';
import { useFocusTrap } from '../../composables/useFocusTrap.js';
import {
  formatIsoToDmy,
  isSafeExternalHttpUrl,
  parseDmyToIso,
  prepareGuestLecturePhoto
} from '../../services/guestLecture.service.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null },
  dosenList: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'submit']);
const { t } = useI18n();

const MAX_PHOTOS = 3;
const fileInputRef = ref(null);
const drawerRef = ref(null);
const processingPhotos = ref(false);
const photoError = ref('');
const newPhotos = ref([]);
const existingFotoUrls = ref([]);
const nativeDate = ref('');

const form = reactive({
  prodi: 'PAI',
  dosenPengampu: '',
  dosenTamu: '',
  mataKuliah: '',
  tema: '',
  tanggal: '',
  jam: '',
  peserta: '100'
});

const totalPhotoCount = computed(() => existingFotoUrls.value.length + newPhotos.value.length);
const isBusy = computed(() => props.submitting || processingPhotos.value);

watch(
  () => [props.open, props.item],
  ([isOpen, nextItem]) => {
    if (!isOpen || !nextItem) return;
    form.prodi = nextItem.prodi || 'PAI';
    form.dosenPengampu = nextItem.dosenPengampu || '';
    form.dosenTamu = nextItem.dosenTamu || '';
    form.mataKuliah = nextItem.mataKuliah || '';
    form.tema = nextItem.tema || '';
    form.tanggal = nextItem.tanggal || '';
    nativeDate.value = parseDmyToIso(nextItem.tanggal || '');
    form.jam = nextItem.jam || '';
    form.peserta = nextItem.peserta || '100';
    existingFotoUrls.value = String(nextItem.fotoNarsum || '')
      .split(/[\r\n]+/)
      .map((u) => u.trim())
      .filter((u) => isSafeExternalHttpUrl(u));
    newPhotos.value = [];
    photoError.value = '';
  },
  { immediate: true }
);

function handleDateChange(event) {
  nativeDate.value = event.target.value;
  form.tanggal = formatIsoToDmy(nativeDate.value);
}

async function handlePhotoSelect(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = '';
  if (!files.length) return;
  photoError.value = '';

  const slotsLeft = MAX_PHOTOS - totalPhotoCount.value;
  if (slotsLeft <= 0) {
    photoError.value = t('guestLecture.photoMaxReached');
    return;
  }

  processingPhotos.value = true;
  try {
    for (const file of files.slice(0, slotsLeft)) {
      const prepared = await prepareGuestLecturePhoto(file);
      newPhotos.value.push(prepared);
    }
  } catch (err) {
    photoError.value = err?.message || t('guestLecture.photoError');
  } finally {
    processingPhotos.value = false;
  }
}

function removeNewPhoto(idx) {
  newPhotos.value.splice(idx, 1);
}

function clearExistingPhotos() {
  existingFotoUrls.value = [];
}

function handleSubmit() {
  if (!props.item || isBusy.value) return;
  emit('submit', {
    mode: 'update',
    rowIndex: props.item.rowIndex,
    prodi: form.prodi,
    dosenPengampu: form.dosenPengampu.trim(),
    dosenTamu: form.dosenTamu.trim(),
    mataKuliah: form.mataKuliah.trim(),
    tema: form.tema.trim(),
    tanggal: form.tanggal.trim(),
    jam: form.jam.trim(),
    peserta: form.peserta,
    existingFotoUrl: existingFotoUrls.value.join('\n'),
    fotoFiles: newPhotos.value.map(({ filename, mimeType, base64 }) => ({
      filename,
      mimeType,
      base64
    }))
  });
}

const isRevisionMode = computed(() => {
  const status = String(props.item?.status || '').trim().toLowerCase();
  return status === 'in revision' || status === 'revision';
});

useFocusTrap(
  drawerRef,
  () => Boolean(props.open && props.item),
  {
    onEscape: () => {
      if (!isBusy.value) {
        emit('close');
      }
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && item"
      class="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs"
      @click.self="!isBusy && emit('close')"
    >
      <aside
        ref="drawerRef"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-label="t('guestLecture.drawerTitle')"
        class="flex h-full w-full max-w-xl flex-col bg-white shadow-float"
      >
        <div class="flex items-start justify-between gap-3 border-b border-surface-border px-5 py-4">
          <div class="min-w-0">
            <h2 class="text-base font-extrabold text-brand-900 sm:text-lg">
              {{ t('guestLecture.drawerTitle') }}
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              {{ t('guestLecture.drawerSubtitle') }}
            </p>
          </div>
          <button
            type="button"
            :disabled="isBusy"
            :aria-label="t('guestLecture.closeBtn')"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-border text-slate-600 transition hover:bg-surface-page"
            @click="emit('close')"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form class="flex flex-1 flex-col overflow-hidden" @submit.prevent="handleSubmit">
          <div class="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div class="rounded-2xl border border-surface-border bg-surface-page p-4">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {{ t('guestLecture.drawerRegisteredLabel') }} (#{{ item.rowIndex }})
              </p>
              <dl class="mt-2.5 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt class="text-slate-500">{{ t('guestLecture.fields.prodi') }}</dt>
                  <dd class="font-bold text-brand-900">{{ item.prodi || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">{{ t('guestLecture.fields.lecturer') }}</dt>
                  <dd class="font-bold text-brand-900">{{ item.dosenPengampu || '—' }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-slate-500">{{ t('guestLecture.fields.course') }}</dt>
                  <dd class="font-bold text-brand-900">{{ item.mataKuliah || '—' }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-slate-500">{{ t('guestLecture.fields.speaker') }}</dt>
                  <dd class="font-bold text-brand-900">{{ item.dosenTamu || '—' }}</dd>
                </div>
              </dl>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div v-if="isRevisionMode || !item.prodi">
                <label for="gl-edit-prodi" class="block text-xs font-bold text-brand-900">
                  {{ t('guestLecture.fields.prodi') }} <span class="text-rose-600">*</span>
                </label>
                <select
                  id="gl-edit-prodi"
                  v-model="form.prodi"
                  required
                  class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
                >
                  <option value="PAI">PAI</option>
                  <option value="PIAUD">PIAUD</option>
                  <option value="PGMI">PGMI</option>
                </select>
              </div>

              <div v-if="isRevisionMode || item.needsDosenPengampu || !item.dosenPengampu">
                <label for="gl-edit-lecturer" class="block text-xs font-bold text-brand-900">
                  {{ t('guestLecture.fields.lecturer') }} <span class="text-rose-600">*</span>
                </label>
                <input
                  id="gl-edit-lecturer"
                  v-model="form.dosenPengampu"
                  list="gl-dosen-datalist"
                  type="text"
                  required
                  class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div v-if="isRevisionMode || item.needsMataKuliah || !item.mataKuliah" class="sm:col-span-2">
                <label for="gl-edit-course" class="block text-xs font-bold text-brand-900">
                  {{ t('guestLecture.fields.course') }} <span class="text-rose-600">*</span>
                </label>
                <input
                  id="gl-edit-course"
                  v-model="form.mataKuliah"
                  type="text"
                  required
                  class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div v-if="isRevisionMode || item.needsDosenTamu || !item.dosenTamu" class="sm:col-span-2">
                <label for="gl-edit-speaker" class="block text-xs font-bold text-brand-900">
                  {{ t('guestLecture.fields.speaker') }} <span class="text-rose-600">*</span>
                </label>
                <input
                  id="gl-edit-speaker"
                  v-model="form.dosenTamu"
                  type="text"
                  required
                  class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div class="sm:col-span-2">
                <label for="gl-edit-topic" class="block text-xs font-bold text-brand-900">
                  {{ t('guestLecture.fields.topic') }} <span class="text-rose-600">*</span>
                </label>
                <textarea
                  id="gl-edit-topic"
                  v-model="form.tema"
                  rows="3"
                  required
                  :placeholder="t('guestLecture.placeholders.topic')"
                  class="mt-1.5 w-full rounded-xl border border-surface-border bg-white p-3 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div>
                <label for="gl-edit-date" class="block text-xs font-bold text-brand-900">
                  {{ t('guestLecture.fields.date') }} <span class="text-rose-600">*</span>
                </label>
                <input
                  id="gl-edit-date"
                  :value="nativeDate"
                  type="date"
                  required
                  class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
                  @input="handleDateChange"
                />
                <p v-if="form.tanggal" class="mt-1 text-[11px] font-semibold text-slate-500">
                  {{ form.tanggal }}
                </p>
              </div>

              <div>
                <label for="gl-edit-time" class="block text-xs font-bold text-brand-900">
                  {{ t('guestLecture.fields.time') }} <span class="text-rose-600">*</span>
                </label>
                <input
                  id="gl-edit-time"
                  v-model="form.jam"
                  type="text"
                  required
                  :placeholder="t('guestLecture.placeholders.time')"
                  class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div class="sm:col-span-2">
                <label for="gl-edit-participants" class="block text-xs font-bold text-brand-900">
                  {{ t('guestLecture.fields.participants') }}
                </label>
                <select
                  id="gl-edit-participants"
                  v-model="form.peserta"
                  class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
                >
                  <option value="100">100 {{ t('guestLecture.participantsUnit') }}</option>
                  <option value="300">300 {{ t('guestLecture.participantsUnit') }}</option>
                  <option value="500">500 {{ t('guestLecture.participantsUnit') }}</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div class="space-y-2.5 sm:col-span-2">
                <div class="flex items-center justify-between gap-2">
                  <label class="text-xs font-bold text-brand-900">{{ t('guestLecture.fields.photos') }}</label>
                  <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                    {{ totalPhotoCount }}/{{ MAX_PHOTOS }}
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-surface-border bg-surface-page p-3">
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    class="sr-only"
                    @change="handlePhotoSelect"
                  />
                  <button
                    type="button"
                    :disabled="isBusy || totalPhotoCount >= MAX_PHOTOS"
                    class="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
                    @click="fileInputRef?.click()"
                  >
                    <ImagePlus class="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{{ processingPhotos ? t('guestLecture.optimizingPhotos') : t('guestLecture.choosePhotosBtn') }}</span>
                  </button>
                  <span class="text-xs text-slate-500">{{ t('guestLecture.photoHint') }}</span>
                </div>

                <p v-if="photoError" role="alert" class="text-xs font-semibold text-rose-600">{{ photoError }}</p>

                <div v-if="existingFotoUrls.length" class="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs">
                  <span class="font-semibold text-emerald-800">{{ t('guestLecture.savedPhotosLabel') }}:</span>
                  <a
                    v-for="(url, idx) in existingFotoUrls"
                    :key="url"
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 font-bold text-brand-700 underline"
                  >
                    <span>#{{ idx + 1 }}</span>
                    <ExternalLink class="h-3 w-3" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    class="ml-auto font-bold text-rose-600 hover:underline"
                    @click="clearExistingPhotos"
                  >
                    {{ t('guestLecture.clearSavedPhotosBtn') }}
                  </button>
                </div>

                <div v-if="newPhotos.length" class="grid grid-cols-3 gap-2.5">
                  <div
                    v-for="(photo, idx) in newPhotos"
                    :key="photo.filename + '-' + idx"
                    class="relative overflow-hidden rounded-xl border border-surface-border bg-surface-page"
                  >
                    <img :src="photo.previewUrl" :alt="photo.filename" class="h-24 w-full object-cover" />
                    <button
                      type="button"
                      :aria-label="t('guestLecture.removePhotoAria')"
                      class="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-rose-600"
                      @click="removeNewPhoto(idx)"
                    >
                      <Trash2 class="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 border-t border-surface-border bg-surface-page px-5 py-3.5">
            <button
              type="button"
              :disabled="isBusy"
              class="min-h-[42px] rounded-xl border border-surface-border bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-surface-muted disabled:opacity-50"
              @click="emit('close')"
            >
              {{ t('guestLecture.cancelBtn') }}
            </button>
            <button
              type="submit"
              :disabled="isBusy"
              class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {{ submitting ? t('guestLecture.savingBtn') : t('guestLecture.saveCompleteBtn') }}
            </button>
          </div>
        </form>

        <datalist id="gl-dosen-datalist">
          <option v-for="name in dosenList" :key="name" :value="name" />
        </datalist>
      </aside>
    </div>
  </Teleport>
</template>
