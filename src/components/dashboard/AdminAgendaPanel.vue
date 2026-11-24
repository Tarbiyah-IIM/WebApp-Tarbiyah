<script setup>
import { computed, ref, watch } from 'vue';
import { Calendar, Clock, Images, MapPin, Plus, Search, Trash2 } from 'lucide-vue-next';
import PaginationControls from '../PaginationControls.vue';
import AdminConfirmModal from './AdminConfirmModal.vue';
import AdminAgendaFormModal from './AdminAgendaFormModal.vue';
import { useI18n } from '../../composables/useI18n.js';

const PAGE_SIZE = 6;

const props = defineProps({
  agendas: { type: Array, required: true },
  syncing: { type: Boolean, default: false },
  uploadHandler: { type: Function, required: true }
});

const emit = defineEmits(['save-agenda', 'delete-agenda']);
const { t } = useI18n();

const searchQuery = ref('');
const currentPage = ref(1);
const modalOpen = ref(false);
const editingItem = ref(null);
const confirmState = ref({ open: false, payload: null, description: '' });

const filteredAgendas = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.agendas;
  return props.agendas.filter((item) =>
    String(item.title || '').toLowerCase().includes(q) ||
    String(item.event_date || '').toLowerCase().includes(q) ||
    String(item.location || '').toLowerCase().includes(q) ||
    String(item.description || '').toLowerCase().includes(q)
  );
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAgendas.value.length / PAGE_SIZE)));

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) {
    currentPage.value = nextTotal;
  }
});

const paginatedAgendas = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredAgendas.value.slice(start, start + PAGE_SIZE);
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

function handleSaveAgenda(payload) {
  emit('save-agenda', payload, () => {
    closeModal();
  });
}

function requestDeleteAgenda(item) {
  confirmState.value = {
    open: true,
    payload: item,
    description: `${t('adminDashboard.cmsPanel.confirmDeleteAgenda')} (${item.title})`
  };
}

function confirmDelete() {
  const target = confirmState.value.payload;
  confirmState.value.open = false;
  if (target) {
    emit('delete-agenda', target.id);
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-2.5">
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.agendaListHeading') }}</h2>
          <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
            {{ filteredAgendas.length }}
          </span>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div class="relative flex-1 sm:w-64">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="t('adminDashboard.cmsPanel.agendaSearchPlaceholder')"
              class="min-h-[40px] w-full rounded-xl border border-surface-border pl-9 pr-3 text-xs"
            />
          </div>
          <button
            type="button"
            class="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
            @click="openAddModal"
          >
            <Plus class="h-4 w-4" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.addAgendaBtn') }}</span>
          </button>
        </div>
      </div>

      <div
        v-if="filteredAgendas.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border py-12 text-center"
      >
        <p class="text-sm text-slate-500">{{ t('adminDashboard.cmsPanel.noAgendas') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="admin-agenda-grid">
        <article
          v-for="item in paginatedAgendas"
          :key="item.id"
          class="flex flex-col justify-between gap-4 rounded-2xl border border-surface-border bg-surface-page p-4"
        >
          <div class="flex items-start gap-3.5">
            <img
              v-if="item.cover_url"
              :src="item.cover_url"
              :alt="item.title"
              class="h-18 w-24 shrink-0 rounded-xl border border-surface-border object-cover"
            />
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  {{ t('agenda.pillLabel') }}
                </span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  :class="item.is_visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'"
                >
                  {{ item.is_visible ? t('adminDashboard.cmsPanel.publishedBadge') : t('adminDashboard.cmsPanel.draftBadge') }}
                </span>
                <span
                  v-if="item.gallery_urls?.length"
                  class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800"
                >
                  <Images class="h-3 w-3" aria-hidden="true" />
                  <span>{{ item.gallery_urls.length }} {{ t('news.photosCountBadge') }}</span>
                </span>
              </div>
              <h3 class="truncate text-sm font-bold text-brand-900">{{ item.title }}</h3>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-medium text-slate-500">
                <span class="inline-flex items-center gap-1">
                  <Calendar class="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{{ item.event_date }}</span>
                </span>
                <span v-if="item.event_time" class="inline-flex items-center gap-1">
                  <Clock class="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>{{ item.event_time }}</span>
                </span>
                <span v-if="item.location" class="inline-flex items-center gap-1">
                  <MapPin class="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span class="truncate">{{ item.location }}</span>
                </span>
              </div>
              <p class="line-clamp-2 text-xs leading-relaxed text-slate-600">{{ item.excerpt }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-surface-border pt-3 text-xs">
            <button
              type="button"
              class="rounded-lg border border-surface-border bg-white px-3.5 py-1.5 font-semibold text-brand-600 hover:bg-brand-50"
              @click="openEditModal(item)"
            >
              {{ t('adminDashboard.cmsPanel.editBtn') }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 font-semibold text-rose-600 hover:bg-rose-100"
              @click="requestDeleteAgenda(item)"
            >
              <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ t('adminDashboard.cmsPanel.delBtn') }}</span>
            </button>
          </div>
        </article>
      </div>

      <PaginationControls
        :current-page="currentPage"
        :total-pages="totalPages"
        :aria-label="t('agenda.navAria')"
        :next-label="t('news.nextLabel')"
        @update:page="currentPage = $event"
      />
    </section>

    <AdminAgendaFormModal
      :open="modalOpen"
      :initial-item="editingItem"
      :syncing="syncing"
      :upload-handler="uploadHandler"
      @close="closeModal"
      @save="handleSaveAgenda"
    />

    <AdminConfirmModal
      :open="confirmState.open"
      :title="t('adminDashboard.confirmDeleteTitle')"
      :description="confirmState.description"
      :confirm-label="t('adminDashboard.confirmDeleteBtn')"
      :cancel-label="t('adminDashboard.cancelBtn')"
      :busy="syncing"
      @confirm="confirmDelete"
      @cancel="confirmState.open = false"
    />
  </div>
</template>
