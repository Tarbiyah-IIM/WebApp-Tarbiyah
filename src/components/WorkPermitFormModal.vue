<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { CheckCircle2, Download, Loader2, Lock, RotateCcw, WifiOff } from 'lucide-vue-next';
import ModalDialog from './ModalDialog.vue';
import { publicService } from '../services/public.service.js';
import { extractApiError } from '../services/api.js';
import { useI18n } from '../composables/useI18n.js';
import { useToast } from '../composables/useToast.js';

const props = defineProps({
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
const { t } = useI18n();
const toast = useToast();

const NIM_REGEX = /^[A-Za-z0-9.\-\/]+$/;
const emptyForm = () => ({
  kepada: '',
  nama_mahasiswa: '',
  nim: '',
  program_studi: '',
  semester: '',
  tempat_ppl: '',
  alamat_ppl: ''
});

const form = ref(emptyForm());
const fieldErrors = ref({});
const globalError = ref('');
const metaLoading = ref(false);
const submitting = ref(false);
const needsAppsScriptDeploy = ref(false);
const meta = ref({
  tahun_akademik: '',
  tanggal_bulan_tahun: '',
  system_status: 'OPEN',
  program_studi_options: [
    'Pendidikan Agama Islam',
    'Pendidikan Guru Madrasah Ibtidaiyah',
    'Pendidikan Islam Anak Usia Dini'
  ],
  semester_options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
});
const resultData = ref(null);
const isOffline = ref(typeof navigator !== 'undefined' ? !navigator.onLine : false);

const isClosed = computed(() => String(meta.value.system_status || 'OPEN').toUpperCase() !== 'OPEN');

function syncOnline() {
  isOffline.value = typeof navigator !== 'undefined' ? !navigator.onLine : false;
}

async function fetchMeta() {
  metaLoading.value = true;
  globalError.value = '';
  try {
    const res = await publicService.getWorkPermitMeta();
    if (res?.data) {
      meta.value = { ...meta.value, ...res.data };
    }
    needsAppsScriptDeploy.value = Boolean(res?.needsAppsScriptDeploy);
  } catch (err) {
    globalError.value = extractApiError(err);
  } finally {
    metaLoading.value = false;
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      syncOnline();
      window.addEventListener('online', syncOnline);
      window.addEventListener('offline', syncOnline);
      fetchMeta();
    } else {
      window.removeEventListener('online', syncOnline);
      window.removeEventListener('offline', syncOnline);
    }
  }
);

onUnmounted(() => {
  window.removeEventListener('online', syncOnline);
  window.removeEventListener('offline', syncOnline);
});

function validateLocal() {
  const errs = {};
  const requiredFields = [
    ['kepada', t('workPermit.kepadaLabel')],
    ['nama_mahasiswa', t('workPermit.namaLabel')],
    ['nim', t('workPermit.nimLabel')],
    ['program_studi', t('workPermit.prodiLabel')],
    ['semester', t('workPermit.semesterLabel')],
    ['tempat_ppl', t('workPermit.tempatLabel')],
    ['alamat_ppl', t('workPermit.alamatLabel')]
  ];
  for (const [key, label] of requiredFields) {
    if (!String(form.value[key] || '').trim()) {
      errs[key] = `${label} ${t('workPermit.validationRequired')}`;
    }
  }
  const nim = String(form.value.nim || '').trim();
  if (!errs.nim) {
    if (nim.length < 3) errs.nim = t('workPermit.validationNimMin');
    else if (/^[=+\-@\t\r]/.test(nim) || !NIM_REGEX.test(nim)) errs.nim = t('workPermit.validationNimFormat');
  }
  fieldErrors.value = errs;
  return Object.keys(errs).length === 0;
}

function triggerBase64PdfDownload(base64, fileName) {
  if (!base64) return false;
  try {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName || 'Surat_Ijin_Kerja_PPL.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
    return true;
  } catch {
    return false;
  }
}

function isSafeHttpsUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return false;
  try {
    return new URL(rawUrl.trim()).protocol === 'https:';
  } catch {
    return false;
  }
}

function downloadLastPdf() {
  if (!resultData.value) return;
  const ok = triggerBase64PdfDownload(resultData.value.pdf_base64, resultData.value.file_name);
  if (!ok && isSafeHttpsUrl(resultData.value.download_url)) {
    window.open(resultData.value.download_url, '_blank', 'noopener,noreferrer');
  }
}

async function handleSubmit() {
  if (submitting.value) return;
  globalError.value = '';
  if (!validateLocal()) return;

  submitting.value = true;
  try {
    const res = await publicService.submitWorkPermit(form.value);
    resultData.value = res.data || null;
    if (resultData.value?.pdf_base64) {
      triggerBase64PdfDownload(resultData.value.pdf_base64, resultData.value.file_name);
    }
    toast.success(res.message || t('workPermit.successTitle'));
  } catch (err) {
    const apiErr = err?.response?.data;
    if (apiErr?.fieldErrors) {
      fieldErrors.value = apiErr.fieldErrors;
    }
    globalError.value = extractApiError(err);
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  form.value = emptyForm();
  fieldErrors.value = {};
  globalError.value = '';
  resultData.value = null;
}
</script>

<template>
  <ModalDialog :open="open" :title="t('workPermit.modalTitle')" header-variant="macos" @close="!submitting && emit('close')">
    <div class="space-y-4">
      <p class="text-xs leading-relaxed text-slate-600">{{ t('workPermit.subtitle') }}</p>

      <div v-if="isOffline" class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900" role="alert">
        <WifiOff class="h-4 w-4 shrink-0" />
        <span>{{ t('workPermit.offlineWarning') }}</span>
      </div>

      <div v-if="needsAppsScriptDeploy" class="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900" role="status">
        {{ t('workPermit.deployNotice') }}
      </div>

      <div v-if="globalError" class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700" role="alert">
        {{ globalError }}
      </div>

      <div v-if="metaLoading" class="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-page px-3.5 py-3 text-xs text-slate-600">
        <Loader2 class="h-4 w-4 animate-spin text-brand-600" />
        <span>{{ t('workPermit.loadingMeta') }}</span>
      </div>

      <section v-if="isClosed" class="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center space-y-3" role="status">
        <Lock class="mx-auto h-8 w-8 text-rose-600" />
        <h4 class="text-base font-extrabold text-brand-900">{{ t('workPermit.closedTitle') }}</h4>
        <p class="text-xs text-slate-600">{{ t('workPermit.closedDesc') }}</p>
        <button type="button" class="min-h-[42px] rounded-xl border border-surface-border bg-white px-4 text-xs font-bold text-brand-900" @click="fetchMeta">
          {{ t('workPermit.recheckBtn') }}
        </button>
      </section>

      <section v-else-if="resultData" class="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
        <div class="flex items-start gap-3">
          <CheckCircle2 class="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h4 class="text-base font-extrabold text-brand-900">{{ t('workPermit.successTitle') }}</h4>
            <p class="mt-0.5 text-xs text-slate-600">{{ t('workPermit.successDesc') }}</p>
          </div>
        </div>

        <dl class="grid grid-cols-1 gap-2 rounded-xl border border-surface-border bg-white p-4 text-xs sm:grid-cols-2">
          <div><dt class="text-slate-500">{{ t('workPermit.summaryNumber') }}</dt><dd class="font-bold text-brand-900">{{ resultData.nomor_surat }}</dd></div>
          <div><dt class="text-slate-500">{{ t('workPermit.summaryName') }}</dt><dd class="font-bold text-brand-900">{{ resultData.nama_mahasiswa }}</dd></div>
          <div><dt class="text-slate-500">{{ t('workPermit.summaryNim') }}</dt><dd class="font-bold text-brand-900">{{ resultData.nim }}</dd></div>
          <div><dt class="text-slate-500">{{ t('workPermit.summaryProdi') }}</dt><dd class="font-bold text-brand-900">{{ resultData.program_studi }}</dd></div>
          <div class="sm:col-span-2"><dt class="text-slate-500">{{ t('workPermit.summaryLocation') }}</dt><dd class="font-bold text-brand-900">{{ resultData.tempat_ppl }}</dd></div>
          <div class="sm:col-span-2"><dt class="text-slate-500">{{ t('workPermit.summaryFile') }}</dt><dd class="font-bold text-brand-700 break-all">{{ resultData.file_name }}</dd></div>
        </dl>

        <div class="flex flex-wrap items-center gap-2.5">
          <button type="button" class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white hover:bg-brand-700" @click="downloadLastPdf">
            <Download class="h-4 w-4" />
            <span>{{ t('workPermit.downloadAgainBtn') }}</span>
          </button>
          <button type="button" class="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-surface-border bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-surface-muted" @click="resetForm">
            <RotateCcw class="h-3.5 w-3.5" />
            <span>{{ t('workPermit.newSubmissionBtn') }}</span>
          </button>
        </div>
      </section>

      <form v-else class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-3 rounded-xl border border-surface-border bg-surface-page p-3.5 sm:grid-cols-2">
          <div>
            <label for="wp-tahun" class="block text-[11px] font-bold uppercase text-slate-500 mb-1">{{ t('workPermit.academicYearLabel') }}</label>
            <input id="wp-tahun" :value="meta.tahun_akademik || '...'" type="text" readonly class="min-h-[40px] w-full rounded-lg border border-surface-border bg-white px-3 text-xs font-semibold text-brand-900" />
          </div>
          <div>
            <label for="wp-tanggal" class="block text-[11px] font-bold uppercase text-slate-500 mb-1">{{ t('workPermit.letterDateLabel') }}</label>
            <input id="wp-tanggal" :value="meta.tanggal_bulan_tahun || '...'" type="text" readonly class="min-h-[40px] w-full rounded-lg border border-surface-border bg-white px-3 text-xs font-semibold text-brand-900" />
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-extrabold uppercase tracking-wider text-brand-700">{{ t('workPermit.sectionTarget') }}</p>
          <div>
            <label for="wp-kepada" class="block text-xs font-bold text-brand-900 mb-1">{{ t('workPermit.kepadaLabel') }} *</label>
            <input id="wp-kepada" v-model="form.kepada" type="text" maxlength="150" required :placeholder="t('workPermit.kepadaPlaceholder')" class="min-h-[42px] w-full rounded-xl border border-surface-border bg-surface-page px-3.5 text-sm text-brand-900" />
            <p class="mt-1 text-[11px] text-slate-500">{{ t('workPermit.kepadaHint') }}</p>
            <p v-if="fieldErrors.kepada" class="mt-1 text-xs font-semibold text-rose-600">{{ fieldErrors.kepada }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-extrabold uppercase tracking-wider text-brand-700">{{ t('workPermit.sectionStudent') }}</p>
          <div>
            <label for="wp-nama" class="block text-xs font-bold text-brand-900 mb-1">{{ t('workPermit.namaLabel') }} *</label>
            <input id="wp-nama" v-model="form.nama_mahasiswa" type="text" maxlength="120" required :placeholder="t('workPermit.namaPlaceholder')" class="min-h-[42px] w-full rounded-xl border border-surface-border bg-surface-page px-3.5 text-sm text-brand-900" />
            <p v-if="fieldErrors.nama_mahasiswa" class="mt-1 text-xs font-semibold text-rose-600">{{ fieldErrors.nama_mahasiswa }}</p>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label for="wp-nim" class="block text-xs font-bold text-brand-900 mb-1">{{ t('workPermit.nimLabel') }} *</label>
              <input id="wp-nim" v-model="form.nim" type="text" maxlength="30" required :placeholder="t('workPermit.nimPlaceholder')" class="min-h-[42px] w-full rounded-xl border border-surface-border bg-surface-page px-3.5 text-sm text-brand-900" />
              <p v-if="fieldErrors.nim" class="mt-1 text-xs font-semibold text-rose-600">{{ fieldErrors.nim }}</p>
            </div>
            <div>
              <label for="wp-semester" class="block text-xs font-bold text-brand-900 mb-1">{{ t('workPermit.semesterLabel') }} *</label>
              <select id="wp-semester" v-model="form.semester" required class="min-h-[42px] w-full rounded-xl border border-surface-border bg-surface-page px-3.5 text-sm text-brand-900">
                <option value="">{{ t('workPermit.semesterPlaceholder') }}</option>
                <option v-for="sem in meta.semester_options" :key="sem" :value="sem">{{ t('workPermit.semesterPrefix') }} {{ sem }}</option>
              </select>
              <p v-if="fieldErrors.semester" class="mt-1 text-xs font-semibold text-rose-600">{{ fieldErrors.semester }}</p>
            </div>
          </div>
          <div>
            <label for="wp-prodi" class="block text-xs font-bold text-brand-900 mb-1">{{ t('workPermit.prodiLabel') }} *</label>
            <select id="wp-prodi" v-model="form.program_studi" required class="min-h-[42px] w-full rounded-xl border border-surface-border bg-surface-page px-3.5 text-sm text-brand-900">
              <option value="">{{ t('workPermit.prodiPlaceholder') }}</option>
              <option v-for="prodi in meta.program_studi_options" :key="prodi" :value="prodi">{{ prodi }}</option>
            </select>
            <p v-if="fieldErrors.program_studi" class="mt-1 text-xs font-semibold text-rose-600">{{ fieldErrors.program_studi }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-extrabold uppercase tracking-wider text-brand-700">{{ t('workPermit.sectionLocation') }}</p>
          <div>
            <label for="wp-tempat" class="block text-xs font-bold text-brand-900 mb-1">{{ t('workPermit.tempatLabel') }} *</label>
            <input id="wp-tempat" v-model="form.tempat_ppl" type="text" maxlength="150" required :placeholder="t('workPermit.tempatPlaceholder')" class="min-h-[42px] w-full rounded-xl border border-surface-border bg-surface-page px-3.5 text-sm text-brand-900" />
            <p v-if="fieldErrors.tempat_ppl" class="mt-1 text-xs font-semibold text-rose-600">{{ fieldErrors.tempat_ppl }}</p>
          </div>
          <div>
            <label for="wp-alamat" class="block text-xs font-bold text-brand-900 mb-1">{{ t('workPermit.alamatLabel') }} *</label>
            <textarea id="wp-alamat" v-model="form.alamat_ppl" rows="2" maxlength="300" required :placeholder="t('workPermit.alamatPlaceholder')" class="w-full rounded-xl border border-surface-border bg-surface-page p-3 text-sm text-brand-900" />
            <p v-if="fieldErrors.alamat_ppl" class="mt-1 text-xs font-semibold text-rose-600">{{ fieldErrors.alamat_ppl }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2 border-t border-surface-border pt-4">
          <button type="button" :disabled="submitting" class="min-h-[44px] rounded-xl border border-surface-border bg-surface-page px-4 text-xs font-semibold text-slate-700 hover:bg-surface-muted" @click="resetForm">
            {{ t('workPermit.resetBtn') }}
          </button>
          <button type="submit" :disabled="submitting || isOffline" class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60">
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            <span>{{ submitting ? t('workPermit.submittingBtn') : t('workPermit.submitBtn') }}</span>
          </button>
        </div>
      </form>
    </div>
  </ModalDialog>
</template>
