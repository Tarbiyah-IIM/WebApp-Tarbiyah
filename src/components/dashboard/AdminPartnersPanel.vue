<script setup>
import { ref, watch } from 'vue';
import AdminConfirmModal from './AdminConfirmModal.vue';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  partners: { type: Array, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['save', 'delete']);
const { t } = useI18n();

const form = ref(emptyForm());
const pendingDelete = ref(null);

watch(
  () => props.partners,
  (list) => {
    if (form.value.id && !list.some((item) => item.id === form.value.id)) {
      form.value = emptyForm();
    }
  },
  { deep: true }
);

function emptyForm() {
  return { id: null, name: '', logoUrl: '', url: '', sortOrder: 0 };
}

function submit() {
  emit(
    'save',
    {
      ...form.value,
      name: form.value.name.trim(),
      logoUrl: form.value.logoUrl?.trim() || null,
      url: form.value.url?.trim() || null,
      sortOrder: Math.max(0, Number(form.value.sortOrder) || 0)
    },
    () => {
      form.value = emptyForm();
    }
  );
}

function startEdit(item) {
  form.value = {
    id: item.id,
    name: item.name,
    logoUrl: item.logo_url || '',
    url: item.url || '',
    sortOrder: item.sort_order ?? 0
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
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.partnersHeading') }}</h2>
      <form class="space-y-3" @submit.prevent="submit">
        <input
          v-model="form.name"
          type="text"
          required
          :aria-label="t('adminDashboard.cmsPanel.partnerNamePlaceholder')"
          :placeholder="t('adminDashboard.cmsPanel.partnerNamePlaceholder')"
          class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
        <input
          v-model="form.url"
          type="text"
          :aria-label="t('adminDashboard.cmsPanel.partnerUrlPlaceholder')"
          :placeholder="t('adminDashboard.cmsPanel.partnerUrlPlaceholder')"
          class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            v-model="form.logoUrl"
            type="text"
            :aria-label="t('adminDashboard.cmsPanel.partnerLogoPlaceholder')"
            :placeholder="t('adminDashboard.cmsPanel.partnerLogoPlaceholder')"
            class="min-h-[42px] rounded-xl border border-surface-border px-3.5 text-sm sm:col-span-2"
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
            @click="form = emptyForm()"
          >
            {{ t('adminDashboard.cmsPanel.cancelEditBtn') }}
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-3 xl:col-span-7">
      <p v-if="partners.length === 0" class="py-8 text-center text-sm text-slate-500">
        {{ t('adminDashboard.cmsPanel.emptyItems') }}
      </p>
      <article
        v-for="item in partners"
        :key="item.id"
        class="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-page p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-brand-900">{{ item.name }}</p>
          <p class="mt-0.5 truncate text-xs text-slate-500">{{ item.url || '—' }}</p>
        </div>
        <div class="flex shrink-0 gap-2 text-xs">
          <button
            type="button"
            class="rounded-lg border border-surface-border bg-white px-3 py-1.5 font-semibold text-brand-600 hover:bg-brand-50"
            @click="startEdit(item)"
          >
            {{ t('adminDashboard.cmsPanel.editBtn') }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-100"
            @click="pendingDelete = item"
          >
            {{ t('adminDashboard.cmsPanel.delBtn') }}
          </button>
        </div>
      </article>
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
