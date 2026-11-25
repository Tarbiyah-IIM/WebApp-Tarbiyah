<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ImagePlus, Trash2 } from 'lucide-vue-next';
import ModalDialog from '../ModalDialog.vue';
import { useI18n } from '../../composables/useI18n.js';
import { formatIsoToDmy, prepareGuestLecturePhoto } from '../../services/guestLecture.service.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  dosenList: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'submit']);
const { t } = useI18n();

const MAX_PHOTOS = 3;
const fileInputRef = ref(null);
const processingPhotos = ref(false);
const photoError = ref('');
const formError = ref('');
const photos = ref([]);
const nativeDate = ref('');

const form = reactive({
  prodi: '',
  dosenPengampu: '',
  dosenTamu: '',
  mataKuliah: '',
  tema: '',
  tanggal: '',
  jam: '',
  peserta: '100'
});

const isBusy = computed(() => props.submitting || processingPhotos.value);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    form.prodi = '';
    form.dosenPengampu = '';
    form.dosenTamu = '';
    form.mataKuliah = '';
    form.tema = '';
    form.tanggal = '';
    form.jam = '';
    form.peserta = '100';
    nativeDate.value = '';
    photos.value = [];
    photoError.value = '';
    formError.value = '';
  }
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

  const slotsLeft = MAX_PHOTOS - photos.value.length;
  if (slotsLeft <= 0) {
    photoError.value = t('guestLecture.photoMaxReached');
    return;
  }

  processingPhotos.value = true;
  try {
    for (const file of files.slice(0, slotsLeft)) {
      const prepared = await prepareGuestLecturePhoto(file);
      photos.value.push(prepared);
    }
  } catch (err) {
    photoError.value = err?.message || t('guestLecture.photoError');
  } finally {
    processingPhotos.value = false;
  }
}

function removePhoto(idx) {
  photos.value.splice(idx, 1);
}

function handleSubmit() {
  if (isBusy.value) return;
  formError.value = '';
  const hasCore = Boolean(
    form.prodi ||
      form.dosenPengampu.trim() ||
      form.dosenTamu.trim() ||
      form.mataKuliah.trim() ||
      form.tema.trim() ||
      form.tanggal.trim() ||
      form.jam.trim()
  );
  if (!hasCore) {
    formError.value = 'Isi minimal satu informasi agenda kuliah tamu sebelum mengirim.';
    return;
  }
  emit('submit', {
    mode: 'new',
    rowIndex: null,
    prodi: form.prodi,
    dosenPengampu: form.dosenPengampu.trim(),
    dosenTamu: form.dosenTamu.trim(),
    mataKuliah: form.mataKuliah.trim(),
    tema: form.tema.trim(),
    tanggal: form.tanggal.trim(),
    jam: form.jam.trim(),
    peserta: form.peserta,
    existingFotoUrl: '',
    fotoFiles: photos.value.map(({ filename, mimeType, base64 }) => ({
      filename,
      mimeType,
      base64
    }))
  });
}
</script>

<template>
  <ModalDialog
    :open="open"
    :title="t('guestLecture.modalNewTitle')"
    header-variant="macos"
    @close="!isBusy && emit('close')"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <p class="text-xs leading-relaxed text-slate-600">
        {{ t('guestLecture.modalNewSubtitle') }}
      </p>

      <div
        v-if="formError"
        role="alert"
        class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700"
      >
        {{ formError }}
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="gl-new-prodi" class="block text-xs font-bold text-brand-900">
            {{ t('guestLecture.fields.prodi') }}
          </label>
          <select
            id="gl-new-prodi"
            v-model="form.prodi"
            class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          >
            <option value="">{{ t('guestLecture.placeholders.prodiOptional') }}</option>
            <option value="PAI">Pendidikan Agama Islam (PAI)</option>
            <option value="PIAUD">Pendidikan Islam Anak Usia Dini (PIAUD)</option>
            <option value="PGMI">Pendidikan Guru Madrasah Ibtidaiyah (PGMI)</option>
          </select>
        </div>

        <div>
          <label for="gl-new-lecturer" class="block text-xs font-bold text-brand-900">
            {{ t('guestLecture.fields.lecturer') }}
          </label>
          <input
            id="gl-new-lecturer"
            v-model="form.dosenPengampu"
            list="gl-new-dosen-list"
            type="text"
            :placeholder="t('guestLecture.placeholders.lecturer')"
            class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          />
          <datalist id="gl-new-dosen-list">
            <option v-for="name in dosenList" :key="name" :value="name" />
          </datalist>
        </div>

        <div class="sm:col-span-2">
          <label for="gl-new-course" class="block text-xs font-bold text-brand-900">
            {{ t('guestLecture.fields.course') }}
          </label>
          <input
            id="gl-new-course"
            v-model="form.mataKuliah"
            type="text"
            :placeholder="t('guestLecture.placeholders.course')"
            class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          />
        </div>

        <div class="sm:col-span-2">
          <label for="gl-new-speaker" class="block text-xs font-bold text-brand-900">
            {{ t('guestLecture.fields.speakerFull') }}
          </label>
          <input
            id="gl-new-speaker"
            v-model="form.dosenTamu"
            type="text"
            :placeholder="t('guestLecture.placeholders.speaker')"
            class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          />
        </div>

        <div class="sm:col-span-2">
          <label for="gl-new-topic" class="block text-xs font-bold text-brand-900">
            {{ t('guestLecture.fields.topic') }}
          </label>
          <textarea
            id="gl-new-topic"
            v-model="form.tema"
            rows="3"
            :placeholder="t('guestLecture.placeholders.topic')"
            class="mt-1.5 w-full rounded-xl border border-surface-border bg-white p-3 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          />
        </div>

        <div>
          <label for="gl-new-date" class="block text-xs font-bold text-brand-900">
            {{ t('guestLecture.fields.date') }}
          </label>
          <input
            id="gl-new-date"
            :value="nativeDate"
            type="date"
            class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
            @input="handleDateChange"
          />
          <p v-if="form.tanggal" class="mt-1 text-[11px] font-semibold text-slate-500">{{ form.tanggal }}</p>
        </div>

        <div>
          <label for="gl-new-time" class="block text-xs font-bold text-brand-900">
            {{ t('guestLecture.fields.time') }}
          </label>
          <input
            id="gl-new-time"
            v-model="form.jam"
            type="text"
            :placeholder="t('guestLecture.placeholders.time')"
            class="mt-1.5 min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3.5 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          />
        </div>

        <div class="sm:col-span-2">
          <label for="gl-new-participants" class="block text-xs font-bold text-brand-900">
            {{ t('guestLecture.fields.participants') }}
          </label>
          <select
            id="gl-new-participants"
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
              {{ photos.length }}/{{ MAX_PHOTOS }}
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
              :disabled="isBusy || photos.length >= MAX_PHOTOS"
              class="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
              @click="fileInputRef?.click()"
            >
              <ImagePlus class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ processingPhotos ? t('guestLecture.optimizingPhotos') : t('guestLecture.choosePhotosBtn') }}</span>
            </button>
            <span class="text-xs text-slate-500">{{ t('guestLecture.photoHint') }}</span>
          </div>

          <p v-if="photoError" role="alert" class="text-xs font-semibold text-rose-600">{{ photoError }}</p>

          <div v-if="photos.length" class="grid grid-cols-3 gap-2.5">
            <div
              v-for="(photo, idx) in photos"
              :key="photo.filename + '-' + idx"
              class="relative overflow-hidden rounded-xl border border-surface-border bg-surface-page"
            >
              <img :src="photo.previewUrl" :alt="photo.filename" class="h-24 w-full object-cover" />
              <button
                type="button"
                :aria-label="t('guestLecture.removePhotoAria')"
                class="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-rose-600"
                @click="removePhoto(idx)"
              >
                <Trash2 class="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2.5 border-t border-surface-border pt-4">
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
          {{ submitting ? t('guestLecture.savingBtn') : t('guestLecture.saveNewBtn') }}
        </button>
      </div>
    </form>
  </ModalDialog>
</template>
