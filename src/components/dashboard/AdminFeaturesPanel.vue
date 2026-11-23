<script setup>
import { ref } from 'vue';
import AdminConfirmModal from './AdminConfirmModal.vue';
import { useI18n } from '../../composables/useI18n.js';

defineProps({
  features: { type: Array, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['save', 'delete']);
const { t } = useI18n();

const form = ref(emptyForm());
const pendingDelete = ref(null);

function emptyForm() {
  return { id: null, title: '', description: '', icon: 'check', sortOrder: 0 };
}

function submit() {
  emit('save', { ...form.value }, () => {
    form.value = emptyForm();
  });
}

function startEdit(item) {
  form.value = {
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.icon || 'check',
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
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.featuresHeading') }}</h2>
      <form class="space-y-3" @submit.prevent="submit">
        <input
          v-model="form.title"
          type="text"
          required
          :placeholder="t('adminDashboard.cmsPanel.featureTitlePlaceholder')"
          class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
        <textarea
          v-model="form.description"
          rows="4"
          required
          :placeholder="t('adminDashboard.cmsPanel.featureDescPlaceholder')"
          class="w-full rounded-xl border border-surface-border p-3.5 text-sm leading-relaxed"
        />
        <div class="flex flex-wrap gap-2">
          <button
            type="submit"
            :disabled="syncing"
            class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {{ form.id ? t('adminDashboard.cmsPanel.updateFeatureBtn') : t('adminDashboard.cmsPanel.addFeatureBtn') }}
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
      <p v-if="features.length === 0" class="py-8 text-center text-sm text-slate-500">
        {{ t('adminDashboard.cmsPanel.emptyItems') }}
      </p>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <article
          v-for="item in features"
          :key="item.id"
          class="flex flex-col justify-between gap-3 rounded-xl border border-surface-border bg-surface-page p-4"
        >
          <div class="min-w-0 space-y-1">
            <h3 class="text-sm font-bold text-brand-900">{{ item.title }}</h3>
            <p class="line-clamp-3 text-xs leading-relaxed text-slate-600">{{ item.description }}</p>
          </div>
          <div class="flex gap-2 text-xs">
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
