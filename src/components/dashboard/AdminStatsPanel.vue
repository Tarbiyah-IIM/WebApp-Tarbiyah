<script setup>
import { computed, ref, watch } from 'vue';
import AdminConfirmModal from './AdminConfirmModal.vue';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  stats: { type: Array, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['save', 'delete']);
const { t } = useI18n();

const form = ref(emptyForm());
const pendingDelete = ref(null);

const filteredStats = computed(() =>
  props.stats.filter((item) => item.stat_group === form.value.statGroup)
);

const activeGroupLabel = computed(() =>
  form.value.statGroup === 'journey'
    ? t('adminDashboard.cmsPanel.statJourneyOpt')
    : t('adminDashboard.cmsPanel.statHeroOpt')
);

watch(
  () => props.stats,
  (list) => {
    if (form.value.id && !list.some((item) => item.id === form.value.id)) {
      form.value = emptyForm(form.value.statGroup);
    }
  },
  { deep: true }
);

function emptyForm(statGroup = 'hero') {
  return { id: null, statGroup, label: '', valueNum: '', suffix: '', sortOrder: 0 };
}

function submit() {
  const currentGroup = form.value.statGroup;
  emit('save', { ...form.value }, () => {
    form.value = emptyForm(currentGroup);
  });
}

function startEdit(item) {
  form.value = {
    id: item.id,
    statGroup: item.stat_group,
    label: item.label,
    valueNum: item.value_num,
    suffix: item.suffix || '',
    sortOrder: item.sort_order || 0
  };
}

function confirmDelete() {
  if (!pendingDelete.value) return;
  const id = pendingDelete.value.id;
  pendingDelete.value = null;
  emit('delete', id);
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4 xl:col-span-5">
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.statsHeading') }}</h2>
      <form class="space-y-3" @submit.prevent="submit">
        <select
          v-model="form.statGroup"
          data-testid="stat-group-select"
          :aria-label="t('adminDashboard.cmsPanel.statsHeading')"
          class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        >
          <option value="hero">{{ t('adminDashboard.cmsPanel.statHeroOpt') }}</option>
          <option value="journey">{{ t('adminDashboard.cmsPanel.statJourneyOpt') }}</option>
        </select>
        <input
          v-model="form.label"
          type="text"
          required
          :aria-label="t('adminDashboard.cmsPanel.statLabelPlaceholder')"
          :placeholder="t('adminDashboard.cmsPanel.statLabelPlaceholder')"
          class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
        <div class="grid grid-cols-3 gap-3">
          <input
            v-model="form.valueNum"
            type="text"
            required
            :aria-label="t('adminDashboard.cmsPanel.statValuePlaceholder')"
            :placeholder="t('adminDashboard.cmsPanel.statValuePlaceholder')"
            class="min-h-[42px] rounded-xl border border-surface-border px-3.5 text-sm"
          />
          <input
            v-model="form.suffix"
            type="text"
            :aria-label="t('adminDashboard.cmsPanel.statSuffixPlaceholder')"
            :placeholder="t('adminDashboard.cmsPanel.statSuffixPlaceholder')"
            class="min-h-[42px] rounded-xl border border-surface-border px-3.5 text-sm"
          />
          <input
            v-model.number="form.sortOrder"
            type="number"
            min="0"
            :aria-label="t('adminDashboard.cmsPanel.sortOrderLabel')"
            :placeholder="t('adminDashboard.cmsPanel.sortOrderPlaceholder')"
            class="min-h-[42px] rounded-xl border border-surface-border px-3.5 text-sm"
          />
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="submit"
            :disabled="syncing"
            class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {{ t('adminDashboard.cmsPanel.saveBtn') }}
          </button>
          <button
            v-if="form.id"
            type="button"
            class="min-h-[42px] rounded-xl border border-surface-border px-4 text-xs font-bold text-slate-700 hover:bg-surface-muted"
            @click="form = emptyForm(form.statGroup)"
          >
            {{ t('adminDashboard.cmsPanel.cancelEditBtn') }}
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4 xl:col-span-7">
      <div class="flex items-center justify-between gap-2 border-b border-surface-border pb-3">
        <h3 data-testid="stats-filtered-heading" class="text-sm font-extrabold text-brand-900">
          {{ activeGroupLabel }}
        </h3>
        <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
          {{ filteredStats.length }}
        </span>
      </div>
      <p v-if="filteredStats.length === 0" class="py-8 text-center text-sm text-slate-500">
        {{ t('adminDashboard.cmsPanel.emptyItems') }}
      </p>
      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article
          v-for="item in filteredStats"
          :key="item.id"
          class="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-page p-4"
        >
          <div class="min-w-0">
            <span class="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">
              {{ item.stat_group }}
            </span>
            <p class="mt-1.5 text-lg font-extrabold text-brand-900">{{ item.value_num }}{{ item.suffix }}</p>
            <p class="truncate text-xs text-slate-600">{{ item.label }}</p>
          </div>
          <div class="flex shrink-0 flex-col gap-1.5 text-xs">
            <button
              type="button"
              class="rounded-lg border border-surface-border bg-white px-3 py-1 font-semibold text-brand-600 hover:bg-brand-50"
              @click="startEdit(item)"
            >
              {{ t('adminDashboard.cmsPanel.editBtn') }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600 hover:bg-rose-100"
              @click="pendingDelete = item"
            >
              {{ t('adminDashboard.cmsPanel.delBtn') }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <AdminConfirmModal
      :open="Boolean(pendingDelete)"
      :title="t('adminDashboard.confirmDeleteTitle')"
      :description="t('adminDashboard.cmsPanel.confirmDeleteItem')"
      :confirm-label="t('adminDashboard.confirmDeleteBtn')"
      :cancel-label="t('adminDashboard.cancelBtn')"
      :busy="syncing"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>
