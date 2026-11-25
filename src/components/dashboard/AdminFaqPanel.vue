<script setup>
import { ref } from 'vue';
import AdminConfirmModal from './AdminConfirmModal.vue';
import { useI18n } from '../../composables/useI18n.js';

defineProps({
  faqs: { type: Array, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['save', 'delete']);
const { t } = useI18n();

const form = ref(emptyForm());
const pendingDelete = ref(null);

function emptyForm() {
  return { id: null, question: '', answer: '', sortOrder: 0 };
}

function submit() {
  emit('save', { ...form.value }, () => {
    form.value = emptyForm();
  });
}

function startEdit(item) {
  form.value = {
    id: item.id,
    question: item.question,
    answer: item.answer,
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
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.faqsHeading') }}</h2>
      <form class="space-y-3" @submit.prevent="submit">
        <input
          v-model="form.question"
          type="text"
          required
          :placeholder="t('adminDashboard.cmsPanel.faqQuestionPlaceholder')"
          class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
        <textarea
          v-model="form.answer"
          rows="4"
          required
          :placeholder="t('adminDashboard.cmsPanel.faqAnswerPlaceholder')"
          class="w-full rounded-xl border border-surface-border p-3.5 text-sm leading-relaxed"
        />
        <input
          v-model.number="form.sortOrder"
          type="number"
          min="0"
          :aria-label="t('adminDashboard.cmsPanel.sortOrderLabel')"
          :placeholder="t('adminDashboard.cmsPanel.sortOrderPlaceholder')"
          class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
        />
        <div class="flex flex-wrap gap-2">
          <button
            type="submit"
            :disabled="syncing"
            class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {{ form.id ? t('adminDashboard.cmsPanel.updateFaqBtn') : t('adminDashboard.cmsPanel.addFaqBtn') }}
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
      <p v-if="faqs.length === 0" class="py-8 text-center text-sm text-slate-500">
        {{ t('adminDashboard.cmsPanel.emptyItems') }}
      </p>
      <article
        v-for="item in faqs"
        :key="item.id"
        class="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-page p-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="min-w-0 space-y-1">
          <h3 class="text-sm font-bold text-brand-900">{{ item.question }}</h3>
          <p class="line-clamp-2 text-xs leading-relaxed text-slate-600">{{ item.answer }}</p>
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
