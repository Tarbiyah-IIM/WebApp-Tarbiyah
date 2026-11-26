<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import ModalDialog from '../ModalDialog.vue';
import AdminConfirmModal from './AdminConfirmModal.vue';
import AdminLecturerEducationSection from './AdminLecturerEducationSection.vue';
import AdminLecturerIndexesSection from './AdminLecturerIndexesSection.vue';
import AdminLecturerPhotoSection from './AdminLecturerPhotoSection.vue';
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

const uploadingPhoto = ref(false);
const pendingUploads = new Set();
const baselineSnapshot = ref('');
const sessionToken = ref(0);
const closeConfirmOpen = ref(false);

const form = reactive({
  id: null,
  programSlug: 'pai',
  name: '',
  photoUrl: '',
  nidn: '',
  teachingStatus: 'active',
  academicRank: '',
  rankGrade: '',
  leadershipRole: '',
  email: '',
  education: '',
  biography: '',
  educationHistory: [],
  scholarUrl: '',
  orcidUrl: '',
  scopusUrl: '',
  sintaUrl: '',
  wosUrl: '',
  isVisible: true,
  sortOrder: 0
});

const isBusy = computed(() => props.syncing || uploadingPhoto.value);

function formSnapshot() {
  return JSON.stringify({ ...form });
}

const isDirty = computed(() => Boolean(props.open) && baselineSnapshot.value !== formSnapshot());

watch(isDirty, (value) => emit('dirty-change', value));

watch(
  () => form.photoUrl,
  (nextUrl, prevUrl) => {
    if (prevUrl && prevUrl !== nextUrl && pendingUploads.delete(prevUrl)) {
      adminService.cleanupMediaByUrl(prevUrl);
    }
  }
);

function normalizeEducationRows(rawRows) {
  if (!Array.isArray(rawRows)) return [];
  return rawRows.map((row) => ({
    degreeLevel: String(row?.degreeLevel || '').trim(),
    institution: String(row?.institution || '').trim(),
    major: String(row?.major || '').trim(),
    academicDegree: String(row?.academicDegree || '').trim(),
    graduationYear: String(row?.graduationYear || '').trim()
  }));
}

function hydrateForm() {
  const item = props.initialItem;
  if (item) {
    form.id = item.id;
    form.programSlug = item.program_slug || 'pai';
    form.name = item.name || '';
    form.photoUrl = item.photo_url || '';
    form.nidn = item.nidn || '';
    form.teachingStatus = item.teaching_status || 'active';
    form.academicRank = item.academic_rank || '';
    form.rankGrade = item.rank_grade || '';
    form.leadershipRole = item.leadership_role || '';
    form.email = item.email || '';
    form.education = item.education || '';
    form.biography = item.biography || '';
    form.educationHistory = normalizeEducationRows(item.education_history);
    form.scholarUrl = item.scholar_url || '';
    form.orcidUrl = item.orcid_url || '';
    form.scopusUrl = item.scopus_url || '';
    form.sintaUrl = item.sinta_url || '';
    form.wosUrl = item.wos_url || '';
    form.isVisible = Boolean(item.is_visible);
    form.sortOrder = item.sort_order || 0;
    return;
  }
  form.id = null;
  form.programSlug = 'pai';
  form.name = '';
  form.photoUrl = '';
  form.nidn = '';
  form.teachingStatus = 'active';
  form.academicRank = '';
  form.rankGrade = '';
  form.leadershipRole = '';
  form.email = '';
  form.education = '';
  form.biography = '';
  form.educationHistory = [];
  form.scholarUrl = '';
  form.orcidUrl = '';
  form.scopusUrl = '';
  form.sintaUrl = '';
  form.wosUrl = '';
  form.isVisible = true;
  form.sortOrder = 0;
}

watch(
  [() => props.open, () => props.initialItem],
  ([isOpen]) => {
    if (isOpen) {
      sessionToken.value += 1;
      uploadingPhoto.value = false;
      closeConfirmOpen.value = false;
      hydrateForm();
      baselineSnapshot.value = formSnapshot();
      return;
    }
    sessionToken.value += 1;
    uploadingPhoto.value = false;
    closeConfirmOpen.value = false;
    pendingUploads.clear();
  },
  { immediate: true }
);

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

async function handlePhotoFile(file) {
  if (!file) return;
  const token = sessionToken.value;
  uploadingPhoto.value = true;
  try {
    const uploadedUrl = await props.uploadHandler(file);
    if (uploadedUrl && token !== sessionToken.value) {
      adminService.cleanupMediaByUrl(uploadedUrl);
      return;
    }
    if (uploadedUrl) {
      pendingUploads.add(uploadedUrl);
      form.photoUrl = uploadedUrl;
    }
  } finally {
    if (token === sessionToken.value) uploadingPhoto.value = false;
  }
}

function clearPhoto() {
  if (form.photoUrl && pendingUploads.delete(form.photoUrl)) {
    adminService.cleanupMediaByUrl(form.photoUrl);
  }
  form.photoUrl = '';
}

function submit() {
  emit('save', {
    id: form.id,
    programSlug: form.programSlug,
    name: form.name.trim(),
    photoUrl: form.photoUrl.trim(),
    nidn: form.nidn.trim(),
    teachingStatus: form.teachingStatus,
    academicRank: form.academicRank.trim(),
    rankGrade: form.rankGrade.trim(),
    leadershipRole: form.leadershipRole.trim(),
    email: form.email.trim(),
    education: form.education.trim(),
    biography: form.biography.trim(),
    educationHistory: normalizeEducationRows(form.educationHistory),
    scholarUrl: form.scholarUrl.trim(),
    orcidUrl: form.orcidUrl.trim(),
    scopusUrl: form.scopusUrl.trim(),
    sintaUrl: form.sintaUrl.trim(),
    wosUrl: form.wosUrl.trim(),
    isVisible: Boolean(form.isVisible),
    sortOrder: Number(form.sortOrder) || 0
  });
}
</script>

<template>
  <ModalDialog
    :open="open"
    :title="form.id ? t('adminDashboard.cmsPanel.lecturersPanel.editTitle') : t('adminDashboard.cmsPanel.lecturersPanel.createTitle')"
    @close="requestClose"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <AdminLecturerPhotoSection
        v-model="form.photoUrl"
        :lecturer-name="form.name"
        :disabled="isBusy"
        :uploading="uploadingPhoto"
        @upload="handlePhotoFile"
        @clear="clearPhoto"
      />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label for="lec-prodi" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.programSlug') }}</label>
          <select id="lec-prodi" v-model="form.programSlug" class="min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm">
            <option value="pai">S1 - Pendidikan Agama Islam</option>
            <option value="pgmi">S1 - Pendidikan Guru Madrasah Ibtidaiyah</option>
            <option value="piaud">S1 - Pendidikan Islam Anak Usia Dini</option>
          </select>
        </div>
        <div>
          <label for="lec-status" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.teachingStatus') }}</label>
          <select id="lec-status" v-model="form.teachingStatus" class="min-h-[42px] w-full rounded-xl border border-surface-border bg-white px-3 text-sm">
            <option value="active">{{ t('portalPages.common.lecturers.statusLabels.active') }}</option>
            <option value="study_leave">{{ t('portalPages.common.lecturers.statusLabels.study_leave') }}</option>
            <option value="inactive">{{ t('portalPages.common.lecturers.statusLabels.inactive') }}</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label for="lec-name" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.name') }} <span class="text-rose-500">*</span></label>
          <input id="lec-name" v-model="form.name" type="text" required minlength="2" maxlength="160" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div class="sm:col-span-2">
          <label for="lec-nidn" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.nidn') }}</label>
          <input id="lec-nidn" v-model="form.nidn" type="text" maxlength="40" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div>
          <label for="lec-rank" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.academicRank') }}</label>
          <input id="lec-rank" v-model="form.academicRank" type="text" maxlength="80" placeholder="Lektor Kepala / Lektor" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div>
          <label for="lec-grade" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.rankGrade') }}</label>
          <input id="lec-grade" v-model="form.rankGrade" type="text" maxlength="40" placeholder="IV/A / III/C" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div>
          <label for="lec-leader" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.leadershipRole') }}</label>
          <input id="lec-leader" v-model="form.leadershipRole" type="text" maxlength="100" placeholder="Ketua Program Studi" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div>
          <label for="lec-email" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.email') }}</label>
          <input id="lec-email" v-model="form.email" type="email" maxlength="191" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div class="sm:col-span-2">
          <label for="lec-edu" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.education') }}</label>
          <input id="lec-edu" v-model="form.education" type="text" maxlength="200" placeholder="S3 | Pendidikan Agama Islam" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
      </div>

      <AdminLecturerIndexesSection :form="form" />

      <div>
        <label for="lec-bio" class="mb-1 block text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.biography') }}</label>
        <textarea id="lec-bio" v-model="form.biography" rows="4" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
      </div>

      <AdminLecturerEducationSection v-model="form.educationHistory" />

      <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-page px-4 py-3">
        <label class="inline-flex items-center gap-2 text-xs font-bold text-brand-900 cursor-pointer">
          <input v-model="form.isVisible" type="checkbox" class="h-4 w-4 rounded border-surface-border text-brand-600" />
          <span>{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.isVisible') }}</span>
        </label>
        <div class="flex items-center gap-2">
          <label for="lec-sort" class="text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.lecturersPanel.fields.sortOrder') }}</label>
          <input id="lec-sort" v-model.number="form.sortOrder" type="number" min="0" class="w-20 rounded-lg border border-surface-border bg-white px-2 py-1 text-xs" />
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          :disabled="isBusy"
          class="min-h-[42px] rounded-xl border border-surface-border px-4 text-xs font-bold text-slate-600 hover:bg-surface-muted"
          @click="requestClose"
        >
          {{ t('adminDashboard.cmsPanel.lecturersPanel.cancelBtn') }}
        </button>
        <button
          type="submit"
          :disabled="isBusy"
          class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {{ isBusy ? t('adminDashboard.cmsPanel.lecturersPanel.savingBtn') : t('adminDashboard.cmsPanel.lecturersPanel.saveBtn') }}
        </button>
      </div>
    </form>

    <AdminConfirmModal
      :open="closeConfirmOpen"
      title="Buang perubahan profil dosen?"
      description="Perubahan yang belum disimpan akan hilang."
      confirm-label="Ya, Buang"
      :cancel-label="t('adminDashboard.cmsPanel.lecturersPanel.cancelBtn')"
      @confirm="confirmDiscard"
      @cancel="closeConfirmOpen = false"
    />
  </ModalDialog>
</template>
