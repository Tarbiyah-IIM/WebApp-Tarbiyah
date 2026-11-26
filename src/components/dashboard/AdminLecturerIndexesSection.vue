<script setup>
import { computed } from 'vue';
import { ExternalLink } from 'lucide-vue-next';
import { useI18n } from '../../composables/useI18n.js';
import { ACADEMIC_INDEX_CONFIG, extractLecturerIndexes } from '../../utils/lecturers.js';

const props = defineProps({
  form: { type: Object, required: true }
});

const { t } = useI18n();
const activeFormIndexes = computed(() => extractLecturerIndexes(props.form));
</script>

<template>
  <div class="rounded-2xl border border-surface-border bg-surface-page p-4 space-y-3">
    <p class="text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.indexesSectionTitle') }}</p>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="(idx, pos) in ACADEMIC_INDEX_CONFIG"
        :key="idx.key"
        :class="{ 'sm:col-span-2': pos === ACADEMIC_INDEX_CONFIG.length - 1 && ACADEMIC_INDEX_CONFIG.length % 2 === 1 }"
      >
        <label :for="`lec-${idx.labelKey}`" class="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
          <span>{{ t(`adminDashboard.cmsPanel.lecturersPanel.fields.${idx.fieldKey}`) }}</span>
          <span class="inline-flex h-6 items-center rounded-md border border-slate-200 bg-[#ffffff] px-2">
            <img
              :src="idx.logo"
              alt=""
              aria-hidden="true"
              class="h-3.5 w-auto max-w-[72px] object-contain"
            />
          </span>
        </label>
        <input
          :id="`lec-${idx.labelKey}`"
          v-model="form[idx.formKey]"
          type="url"
          maxlength="500"
          :placeholder="idx.placeholder"
          class="min-h-[38px] w-full rounded-xl border border-surface-border bg-white px-3 text-xs"
        />
      </div>
    </div>

    <div
      v-if="activeFormIndexes.length > 0"
      data-testid="lecturer-form-index-preview"
      class="flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-white px-3 py-2.5"
    >
      <span class="text-[11px] font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.lecturersPanel.indexesPreviewLabel') }}</span>
      <a
        v-for="item in activeFormIndexes"
        :key="item.key"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="t(`portalPages.common.lecturers.indexes.${item.labelKey}`)"
        :title="t(`portalPages.common.lecturers.indexes.${item.labelKey}`)"
        class="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border px-2.5 py-1 transition"
        :class="item.pillClass"
      >
        <img
          :src="item.logo"
          :alt="t(`portalPages.common.lecturers.indexes.${item.labelKey}`)"
          class="h-4 w-auto max-w-[88px] object-contain"
        />
        <ExternalLink class="h-2.5 w-2.5 shrink-0 text-slate-400" aria-hidden="true" />
      </a>
    </div>
  </div>
</template>
