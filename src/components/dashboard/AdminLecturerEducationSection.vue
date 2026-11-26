<script setup>
import { Plus, Trash2 } from 'lucide-vue-next';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const MAX_EDUCATION_ROWS = 15;

function cloneList() {
  return props.modelValue.map((item) => ({ ...item }));
}

function addRow() {
  if (props.modelValue.length >= MAX_EDUCATION_ROWS) return;
  const next = cloneList();
  next.push({
    degreeLevel: '',
    institution: '',
    major: '',
    academicDegree: '',
    graduationYear: ''
  });
  emit('update:modelValue', next);
}

function removeRow(index) {
  const next = cloneList();
  next.splice(index, 1);
  emit('update:modelValue', next);
}

function updateCell(index, field, value) {
  const next = cloneList();
  if (!next[index]) return;
  next[index][field] = value;
  emit('update:modelValue', next);
}
</script>

<template>
  <div class="rounded-2xl border border-surface-border bg-surface-page p-4 space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.educationHistorySectionTitle') }}</p>
      <button
        v-if="modelValue.length < MAX_EDUCATION_ROWS"
        type="button"
        data-testid="add-lecturer-education"
        class="inline-flex min-h-[34px] items-center gap-1 rounded-xl border border-brand-200 bg-white px-3 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
        @click="addRow"
      >
        <Plus class="h-3.5 w-3.5" aria-hidden="true" />
        <span>{{ t('adminDashboard.cmsPanel.lecturersPanel.addEducationBtn') }}</span>
      </button>
    </div>

    <div v-if="modelValue.length > 0" class="space-y-3">
      <div
        v-for="(row, idx) in modelValue"
        :key="idx"
        data-testid="lecturer-education-form-row"
        class="rounded-xl border border-surface-border bg-white p-3 space-y-2.5"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-brand-700">#{{ idx + 1 }}</span>
          <button
            type="button"
            :aria-label="`${t('adminDashboard.cmsPanel.lecturersPanel.removeEducationBtn')} #${idx + 1}`"
            class="inline-flex min-h-[30px] items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100"
            @click="removeRow(idx)"
          >
            <Trash2 class="h-3 w-3" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.lecturersPanel.removeEducationBtn') }}</span>
          </button>
        </div>

        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
          <div class="sm:col-span-3">
            <label :for="`edu-lvl-${idx}`" class="mb-1 block text-[11px] font-bold text-slate-600">
              {{ t('adminDashboard.cmsPanel.lecturersPanel.educationFields.degreeLevel') }} <span class="text-rose-500">*</span>
            </label>
            <input
              :id="`edu-lvl-${idx}`"
              :value="row.degreeLevel"
              type="text"
              required
              maxlength="20"
              list="lecturer-degree-levels"
              placeholder="S3 / S2 / S1"
              class="min-h-[36px] w-full rounded-lg border border-surface-border px-2.5 text-xs"
              @input="updateCell(idx, 'degreeLevel', $event.target.value)"
            />
          </div>

          <div class="sm:col-span-5">
            <label :for="`edu-inst-${idx}`" class="mb-1 block text-[11px] font-bold text-slate-600">
              {{ t('adminDashboard.cmsPanel.lecturersPanel.educationFields.institution') }} <span class="text-rose-500">*</span>
            </label>
            <input
              :id="`edu-inst-${idx}`"
              :value="row.institution"
              type="text"
              required
              maxlength="160"
              placeholder="UIN / Universitas..."
              class="min-h-[36px] w-full rounded-lg border border-surface-border px-2.5 text-xs"
              @input="updateCell(idx, 'institution', $event.target.value)"
            />
          </div>

          <div class="sm:col-span-4">
            <label :for="`edu-major-${idx}`" class="mb-1 block text-[11px] font-bold text-slate-600">
              {{ t('adminDashboard.cmsPanel.lecturersPanel.educationFields.major') }} <span class="text-rose-500">*</span>
            </label>
            <input
              :id="`edu-major-${idx}`"
              :value="row.major"
              type="text"
              required
              maxlength="160"
              placeholder="Pendidikan Agama Islam"
              class="min-h-[36px] w-full rounded-lg border border-surface-border px-2.5 text-xs"
              @input="updateCell(idx, 'major', $event.target.value)"
            />
          </div>

          <div class="sm:col-span-6">
            <label :for="`edu-title-${idx}`" class="mb-1 block text-[11px] font-bold text-slate-600">
              {{ t('adminDashboard.cmsPanel.lecturersPanel.educationFields.academicDegree') }}
            </label>
            <input
              :id="`edu-title-${idx}`"
              :value="row.academicDegree"
              type="text"
              maxlength="40"
              placeholder="Dr. / M.Pd. / S.Pd.I."
              class="min-h-[36px] w-full rounded-lg border border-surface-border px-2.5 text-xs"
              @input="updateCell(idx, 'academicDegree', $event.target.value)"
            />
          </div>

          <div class="sm:col-span-6">
            <label :for="`edu-year-${idx}`" class="mb-1 block text-[11px] font-bold text-slate-600">
              {{ t('adminDashboard.cmsPanel.lecturersPanel.educationFields.graduationYear') }}
            </label>
            <input
              :id="`edu-year-${idx}`"
              :value="row.graduationYear"
              type="text"
              maxlength="12"
              placeholder="2020"
              class="min-h-[36px] w-full rounded-lg border border-surface-border px-2.5 text-xs"
              @input="updateCell(idx, 'graduationYear', $event.target.value)"
            />
          </div>
        </div>
      </div>
    </div>

    <datalist id="lecturer-degree-levels">
      <option value="S3" />
      <option value="S2" />
      <option value="S1" />
      <option value="D4" />
      <option value="D3" />
      <option value="Profesi" />
    </datalist>
  </div>
</template>
