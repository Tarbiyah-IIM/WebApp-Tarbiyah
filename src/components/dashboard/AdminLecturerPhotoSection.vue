<script setup>
import { ref } from 'vue';
import { ImagePlus, Trash2 } from 'lucide-vue-next';
import { useI18n } from '../../composables/useI18n.js';
import { getNameInitials } from '../../utils/lecturers.js';

defineProps({
  modelValue: { type: String, default: '' },
  lecturerName: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  uploading: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'upload', 'clear']);
const { t } = useI18n();
const photoInputRef = ref(null);

function onFileChange(event) {
  const file = event.target.files?.[0];
  if (photoInputRef.value) photoInputRef.value.value = '';
  if (file) emit('upload', file);
}
</script>

<template>
  <div class="rounded-2xl border border-surface-border bg-surface-page p-4 space-y-3">
    <p class="text-xs font-bold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.photoSection') }}</p>
    <div class="flex flex-wrap items-center gap-4">
      <div class="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-surface-border bg-white flex items-center justify-center">
        <img v-if="modelValue" :src="modelValue" :alt="lecturerName || 'Preview'" class="h-full w-full object-cover object-top" />
        <span v-else class="text-sm font-extrabold text-brand-700">{{ getNameInitials(lecturerName) }}</span>
      </div>
      <div class="flex-1 min-w-[200px] space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <input ref="photoInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="sr-only" @change="onFileChange" />
          <button
            type="button"
            :disabled="disabled"
            class="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            @click="photoInputRef?.click()"
          >
            <ImagePlus class="h-4 w-4" aria-hidden="true" />
            <span>{{ uploading ? t('adminDashboard.cmsPanel.lecturersPanel.uploadingBtn') : t('adminDashboard.cmsPanel.lecturersPanel.uploadPhotoBtn') }}</span>
          </button>
          <button
            v-if="modelValue"
            type="button"
            :disabled="disabled"
            class="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            @click="emit('clear')"
          >
            <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.lecturersPanel.removePhotoBtn') }}</span>
          </button>
        </div>
        <input
          :value="modelValue"
          type="text"
          :placeholder="t('adminDashboard.cmsPanel.lecturersPanel.photoUrlPlaceholder')"
          class="min-h-[38px] w-full rounded-xl border border-surface-border bg-white px-3 text-xs"
          @input="emit('update:modelValue', $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>
