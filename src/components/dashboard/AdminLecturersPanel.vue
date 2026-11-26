<script setup>
import { computed, ref, watch } from 'vue';
import { Award, Plus, Search, Trash2 } from 'lucide-vue-next';
import PaginationControls from '../PaginationControls.vue';
import AdminConfirmModal from './AdminConfirmModal.vue';
import AdminLecturerFormModal from './AdminLecturerFormModal.vue';
import { useI18n } from '../../composables/useI18n.js';
import { TEACHING_STATUS_STYLES, formatRankAndGrade, getNameInitials } from '../../utils/lecturers.js';

const PAGE_SIZE = 6;

const props = defineProps({
  lecturers: { type: Array, required: true },
  syncing: { type: Boolean, default: false },
  uploadHandler: { type: Function, required: true }
});

const emit = defineEmits(['save-lecturer', 'delete-lecturer', 'dirty-change']);
const { t } = useI18n();

const programFilter = ref('all');
const leadershipOnly = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const modalOpen = ref(false);
const editingItem = ref(null);
const confirmState = ref({ open: false, payload: null, description: '' });
const confirmBusy = ref(false);

const filteredLecturers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return props.lecturers.filter((item) => {
    if (programFilter.value !== 'all' && item.program_slug !== programFilter.value) return false;
    if (leadershipOnly.value && !(item.leadership_role && item.leadership_role.trim())) return false;
    if (!q) return true;
    return [item.name, item.nidn, item.academic_rank, item.rank_grade, item.leadership_role, item.education, item.expertise]
      .filter(Boolean)
      .some((val) => String(val).toLowerCase().includes(q));
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLecturers.value.length / PAGE_SIZE)));

watch([searchQuery, programFilter, leadershipOnly], () => {
  currentPage.value = 1;
});

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) currentPage.value = nextTotal;
});

const paginatedLecturers = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredLecturers.value.slice(start, start + PAGE_SIZE);
});

function openAddModal() {
  editingItem.value = null;
  modalOpen.value = true;
}

function openEditModal(item) {
  editingItem.value = item;
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  editingItem.value = null;
}

function handleSave(payload) {
  emit('save-lecturer', payload, () => {
    closeModal();
  });
}

function requestDelete(item) {
  confirmState.value = {
    open: true,
    payload: item,
    description: `${t('adminDashboard.cmsPanel.lecturersPanel.confirmDeletePrefix')} (${item.name})`
  };
}

function confirmDelete() {
  const target = confirmState.value.payload;
  if (!target || confirmBusy.value) return;
  confirmBusy.value = true;
  emit('delete-lecturer', target.id, (ok) => {
    confirmBusy.value = false;
    if (ok) confirmState.value = { open: false, payload: null, description: '' };
  });
}

function cancelConfirm() {
  if (confirmBusy.value) return;
  confirmState.value = { open: false, payload: null, description: '' };
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-2.5">
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.lecturersPanel.heading') }}</h2>
          <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
            {{ filteredLecturers.length }}
          </span>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="relative flex-1 sm:w-64">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="search"
              :aria-label="t('adminDashboard.cmsPanel.lecturersPanel.searchPlaceholder')"
              :placeholder="t('adminDashboard.cmsPanel.lecturersPanel.searchPlaceholder')"
              class="min-h-[40px] w-full rounded-xl border border-surface-border pl-9 pr-3 text-xs"
            />
          </div>
          <button
            type="button"
            :disabled="syncing || confirmBusy"
            data-testid="admin-add-lecturer"
            class="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            @click="openAddModal"
          >
            <Plus class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.lecturersPanel.addBtn') }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tab in [
              { id: 'all', label: t('adminDashboard.cmsPanel.lecturersPanel.allPrograms') },
              { id: 'pai', label: 'PAI' },
              { id: 'pgmi', label: 'PGMI' },
              { id: 'piaud', label: 'PIAUD' }
            ]"
            :key="tab.id"
            type="button"
            class="min-h-[34px] rounded-xl px-3 text-xs font-bold transition"
            :class="programFilter === tab.id ? 'bg-brand-600 text-white' : 'border border-surface-border bg-surface-page text-slate-600 hover:bg-brand-50'"
            @click="programFilter = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <label class="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input v-model="leadershipOnly" type="checkbox" class="h-4 w-4 rounded border-surface-border text-brand-600" />
          <span>{{ t('adminDashboard.cmsPanel.lecturersPanel.leadershipOnly') }}</span>
        </label>
      </div>

      <div
        v-if="filteredLecturers.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border py-12 text-center"
      >
        <p class="text-sm text-slate-500">{{ t('adminDashboard.cmsPanel.lecturersPanel.emptyList') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="admin-lecturer-grid">
        <article
          v-for="item in paginatedLecturers"
          :key="item.id"
          class="flex flex-col justify-between gap-4 rounded-2xl border border-surface-border bg-surface-page p-4"
        >
          <div class="flex items-start gap-3.5">
            <div class="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-surface-border bg-white flex items-center justify-center">
              <img v-if="item.photo_url" :src="item.photo_url" :alt="item.name" class="h-full w-full object-cover object-top" />
              <span v-else class="text-xs font-extrabold text-brand-700">{{ getNameInitials(item.name) }}</span>
            </div>

            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                  {{ item.program_slug }}
                </span>
                <span
                  v-if="item.leadership_role"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900"
                >
                  <Award class="h-3 w-3" aria-hidden="true" />
                  {{ item.leadership_role }}
                </span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  :class="TEACHING_STATUS_STYLES[item.teaching_status] || TEACHING_STATUS_STYLES.inactive"
                >
                  {{ t(`portalPages.common.lecturers.statusLabels.${item.teaching_status || 'active'}`) }}
                </span>
                <span v-if="!item.is_visible" class="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {{ t('adminDashboard.cmsPanel.lecturersPanel.hiddenBadge') }}
                </span>
              </div>

              <h3 class="truncate text-sm font-bold text-brand-900">{{ item.name }}</h3>
              <p class="text-xs font-medium text-slate-600">{{ formatRankAndGrade(item) }}</p>
              <p v-if="item.education" class="truncate text-xs text-slate-500">{{ item.education }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-surface-border pt-3 text-xs">
            <button
              type="button"
              :disabled="syncing || confirmBusy"
              class="rounded-lg border border-surface-border bg-white px-3.5 py-1.5 font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
              @click="openEditModal(item)"
            >
              {{ t('adminDashboard.cmsPanel.lecturersPanel.editBtn') }}
            </button>
            <button
              type="button"
              :disabled="syncing || confirmBusy"
              class="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
              @click="requestDelete(item)"
            >
              <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ t('adminDashboard.cmsPanel.lecturersPanel.delBtn') }}</span>
            </button>
          </div>
        </article>
      </div>

      <PaginationControls
        :current-page="currentPage"
        :total-pages="totalPages"
        :aria-label="t('adminDashboard.cmsPanel.lecturersPanel.heading')"
        :prev-label="t('news.prevLabel')"
        :next-label="t('news.nextLabel')"
        @update:page="currentPage = $event"
      />
    </section>

    <AdminLecturerFormModal
      :open="modalOpen"
      :initial-item="editingItem"
      :syncing="syncing"
      :upload-handler="uploadHandler"
      @close="closeModal"
      @save="handleSave"
      @dirty-change="emit('dirty-change', $event)"
    />

    <AdminConfirmModal
      :open="confirmState.open"
      :title="t('adminDashboard.confirmDeleteTitle')"
      :description="confirmState.description"
      :confirm-label="t('adminDashboard.confirmDeleteBtn')"
      :cancel-label="t('adminDashboard.cancelBtn')"
      :busy="confirmBusy"
      @confirm="confirmDelete"
      @cancel="cancelConfirm"
    />
  </div>
</template>
