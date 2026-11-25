<script setup>
import { computed, ref, watch } from 'vue';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  FileText,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  Search,
  User,
  Users,
  Video
} from 'lucide-vue-next';
import { useI18n } from '../../composables/useI18n.js';
import { normalizeDocItems } from '../../services/guestLecture.service.js';

const props = defineProps({
  items: { type: Array, default: () => [] },
  prodiList: { type: Array, default: () => ['PAI', 'PIAUD', 'PGMI'] },
  refreshing: { type: Boolean, default: false }
});

const emit = defineEmits(['refresh', 'open-zoom', 'edit']);
const { t } = useI18n();

const STEP_SIZE = 5;
const searchQuery = ref('');
const activeProdi = ref('ALL');
const visibleLimit = ref(STEP_SIZE);

const sortedItems = computed(() =>
  [...props.items].sort((a, b) => Number(b.rowIndex || 0) - Number(a.rowIndex || 0))
);

const prodiCounts = computed(() => {
  const counts = { ALL: sortedItems.value.length };
  for (const prodi of props.prodiList) {
    counts[prodi] = 0;
  }
  for (const item of sortedItems.value) {
    const key = String(item.prodi || '').trim().toUpperCase();
    if (key in counts) {
      counts[key] += 1;
    }
  }
  return counts;
});

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return sortedItems.value.filter((item) => {
    if (activeProdi.value !== 'ALL' && String(item.prodi || '').trim().toUpperCase() !== activeProdi.value) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      item.prodi,
      item.dosenPengampu,
      item.dosenTamu,
      item.mataKuliah,
      item.tema,
      item.tanggal,
      item.jam,
      item.status
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
});

watch([searchQuery, activeProdi], () => {
  visibleLimit.value = STEP_SIZE;
});

const visibleItems = computed(() => filteredItems.value.slice(0, visibleLimit.value));
const remainingCount = computed(() => Math.max(0, filteredItems.value.length - visibleItems.value.length));

function statusMeta(rawStatus) {
  const lower = String(rawStatus || '').trim().toLowerCase();
  if (lower === 'done') {
    return {
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: t('guestLecture.statusDone'),
      bannerClass: 'bg-emerald-50/70 text-emerald-800 border-emerald-200',
      bannerText: t('guestLecture.bannerDone')
    };
  }
  if (lower === 'in revision' || lower === 'revision') {
    return {
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      label: t('guestLecture.statusRevision'),
      bannerClass: 'bg-rose-50/70 text-rose-800 border-rose-200',
      bannerText: t('guestLecture.bannerRevision')
    };
  }
  return {
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: t('guestLecture.statusProcess'),
    bannerClass: 'bg-amber-50/70 text-amber-800 border-amber-200',
    bannerText: t('guestLecture.bannerProcess')
  };
}

function isOfflineEvent(item) {
  return String(item.peserta || '').trim().toLowerCase() === 'offline';
}

function getInvitationDocs(item) {
  return normalizeDocItems(
    item.permohonanUndanganList,
    item.permohonanUndanganLink,
    item.permohonanUndangan,
    t('guestLecture.docs.invitation')
  );
}

function getFlayerDocs(item) {
  return normalizeDocItems(item.flayerList, item.flayerLink, item.flayer, t('guestLecture.docs.flayer'));
}

function getCertificateDocs(item) {
  return normalizeDocItems(
    item.sertifikatList,
    item.sertifikatLink,
    item.sertifikat,
    t('guestLecture.docs.certificate'),
    true
  );
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-surface-border bg-white p-4 shadow-card space-y-3.5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('guestLecture.searchPlaceholder')"
            class="min-h-[42px] w-full rounded-xl border border-surface-border bg-surface-page pl-10 pr-4 text-sm text-brand-900 placeholder:text-slate-400 focus:border-brand-600 focus:bg-white focus:outline-none"
          />
        </div>
        <button
          type="button"
          :disabled="refreshing"
          class="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface-page px-4 text-xs font-bold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-60"
          @click="emit('refresh')"
        >
          <RefreshCw class="h-3.5 w-3.5" :class="refreshing ? 'animate-spin' : ''" aria-hidden="true" />
          <span>{{ refreshing ? t('guestLecture.refreshingBtn') : t('guestLecture.refreshBtn') }}</span>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {{ t('guestLecture.filterProdiLabel') }}:
        </span>
        <div class="flex flex-wrap items-center gap-1.5" role="group" :aria-label="t('guestLecture.filterProdiLabel')">
          <button
            type="button"
            class="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition"
            :class="
              activeProdi === 'ALL'
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-surface-border bg-surface-page text-slate-600 hover:border-brand-300 hover:text-brand-700'
            "
            @click="activeProdi = 'ALL'"
          >
            <span>{{ t('guestLecture.allProdi') }}</span>
            <span
              class="rounded-full px-1.5 py-0.5 text-[10px]"
              :class="activeProdi === 'ALL' ? 'bg-white/20 text-white' : 'bg-surface-muted text-slate-600'"
            >
              {{ prodiCounts.ALL }}
            </span>
          </button>

          <button
            v-for="prodi in prodiList"
            :key="prodi"
            type="button"
            class="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition"
            :class="
              activeProdi === prodi
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-surface-border bg-surface-page text-slate-600 hover:border-brand-300 hover:text-brand-700'
            "
            @click="activeProdi = prodi"
          >
            <span>{{ prodi }}</span>
            <span
              class="rounded-full px-1.5 py-0.5 text-[10px]"
              :class="activeProdi === prodi ? 'bg-white/20 text-white' : 'bg-surface-muted text-slate-600'"
            >
              {{ prodiCounts[prodi] || 0 }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="filteredItems.length === 0"
      class="rounded-2xl border border-surface-border bg-white px-6 py-12 text-center shadow-card"
    >
      <p class="text-sm font-bold text-brand-900">{{ t('guestLecture.trackingEmptyTitle') }}</p>
      <p class="mt-1 text-xs text-slate-500">{{ t('guestLecture.trackingEmptyDesc') }}</p>
    </div>

    <div v-else data-testid="guest-lecture-tracking-list" class="space-y-4">
      <article
        v-for="item in visibleItems"
        :key="item.rowIndex"
        class="rounded-2xl border border-surface-border bg-white p-5 shadow-card transition hover:border-brand-200 hover:shadow-float space-y-4"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <h3 class="text-base font-extrabold text-brand-900 sm:text-lg">
              {{ item.mataKuliah || t('guestLecture.unsetCourse') }}
            </h3>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 sm:justify-end">
            <span
              v-if="item.prodi"
              class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700"
            >
              {{ item.prodi }}
            </span>
            <span class="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {{ t('guestLecture.rowPrefix') }} #{{ item.rowIndex }}
            </span>
            <span
              class="rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              :class="statusMeta(item.status).badgeClass"
            >
              {{ statusMeta(item.status).label }}
            </span>
          </div>
        </div>

        <dl class="space-y-1.5 text-xs sm:text-sm text-slate-600">
          <div class="flex items-start gap-2">
            <User class="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <span class="font-semibold text-slate-500">{{ t('guestLecture.fields.lecturer') }}: </span>
              <span class="font-bold text-brand-900">{{ item.dosenPengampu || '—' }}</span>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <Users class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <div>
              <span class="font-semibold text-slate-500">{{ t('guestLecture.fields.speaker') }}: </span>
              <span class="font-semibold text-brand-900">{{ item.dosenTamu || '—' }}</span>
            </div>
          </div>
          <div v-if="item.tema" class="flex items-start gap-2">
            <BookOpen class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <span class="font-semibold text-slate-500">{{ t('guestLecture.fields.topic') }}: </span>
              <span class="text-slate-700">{{ item.tema }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
            <span class="inline-flex items-center gap-1.5 font-bold text-brand-900">
              <Calendar class="h-4 w-4 text-brand-600" aria-hidden="true" />
              <span>{{ item.tanggal || '—' }}</span>
            </span>
            <span v-if="item.jam" class="inline-flex items-center gap-1.5 font-semibold text-slate-600">
              <Clock class="h-4 w-4 text-amber-600" aria-hidden="true" />
              <span>{{ item.jam }}</span>
            </span>
            <span
              class="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
            >
              <MapPin v-if="isOfflineEvent(item)" class="h-3 w-3 text-emerald-600" aria-hidden="true" />
              <span>{{ isOfflineEvent(item) ? t('guestLecture.offlineBadge') : item.peserta ? `${item.peserta} ${t('guestLecture.participantsUnit')}` : '—' }}</span>
            </span>
          </div>
        </dl>

        <div
          class="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold"
          :class="statusMeta(item.status).bannerClass"
        >
          <CheckCircle2 v-if="String(item.status || '').toLowerCase() === 'done'" class="h-3.5 w-3.5" aria-hidden="true" />
          <Clock v-else class="h-3.5 w-3.5" aria-hidden="true" />
          <span>{{ statusMeta(item.status).bannerText }}</span>
        </div>

        <div class="flex flex-wrap items-center gap-2 border-t border-surface-border/80 pt-3.5">
          <template v-if="isOfflineEvent(item)">
            <span class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800">
              <MapPin class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ t('guestLecture.offlineNoZoom') }}</span>
            </span>
          </template>
          <template v-else-if="item.linkZoom">
            <button
              type="button"
              class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-bold text-white transition hover:bg-brand-700"
              @click="emit('open-zoom', item)"
            >
              <Video class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ t('guestLecture.docs.zoom') }}</span>
            </button>
          </template>
          <span
            v-else
            class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-dashed border-surface-border bg-surface-page px-3 text-xs font-medium text-slate-400"
          >
            <Video class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('guestLecture.docs.zoomEmpty') }}</span>
          </span>

          <template v-if="getInvitationDocs(item).kind === 'links'">
            <a
              v-for="doc in getInvitationDocs(item).items"
              :key="doc.url"
              :href="doc.url"
              :title="doc.tooltip"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <FileText class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ doc.label }}</span>
            </a>
          </template>
          <span
            v-else-if="getInvitationDocs(item).kind === 'note'"
            :title="getInvitationDocs(item).text"
            class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs font-semibold text-slate-600"
          >
            <FileText class="h-3.5 w-3.5" aria-hidden="true" />
            <span class="max-w-[180px] truncate">{{ getInvitationDocs(item).text }}</span>
          </span>
          <span
            v-else
            class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-dashed border-surface-border bg-surface-page px-3 text-xs font-medium text-slate-400"
          >
            <FileText class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('guestLecture.docs.invitationEmpty') }}</span>
          </span>

          <template v-if="getFlayerDocs(item).kind === 'links'">
            <a
              v-for="doc in getFlayerDocs(item).items"
              :key="doc.url"
              :href="doc.url"
              :title="doc.tooltip"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
            >
              <ImageIcon class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ doc.label }}</span>
            </a>
          </template>
          <span
            v-else-if="getFlayerDocs(item).kind === 'note'"
            :title="getFlayerDocs(item).text"
            class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs font-semibold text-slate-600"
          >
            <ImageIcon class="h-3.5 w-3.5" aria-hidden="true" />
            <span class="max-w-[180px] truncate">{{ getFlayerDocs(item).text }}</span>
          </span>
          <span
            v-else
            class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-dashed border-surface-border bg-surface-page px-3 text-xs font-medium text-slate-400"
          >
            <ImageIcon class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('guestLecture.docs.flayerEmpty') }}</span>
          </span>

          <template v-if="getCertificateDocs(item).kind === 'links'">
            <a
              v-for="doc in getCertificateDocs(item).items"
              :key="doc.url"
              :href="doc.url"
              :title="doc.tooltip"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
            >
              <Award class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ doc.label }}</span>
            </a>
          </template>
          <span
            v-else-if="getCertificateDocs(item).kind === 'note'"
            :title="getCertificateDocs(item).text"
            class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs font-semibold text-slate-600"
          >
            <Award class="h-3.5 w-3.5" aria-hidden="true" />
            <span class="max-w-[180px] truncate">{{ getCertificateDocs(item).text }}</span>
          </span>
          <span
            v-else
            class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-dashed border-surface-border bg-surface-page px-3 text-xs font-medium text-slate-400"
          >
            <Award class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('guestLecture.docs.certificateEmpty') }}</span>
          </span>

          <button
            v-if="['in revision', 'revision'].includes(String(item.status || '').trim().toLowerCase())"
            type="button"
            class="ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 text-xs font-bold text-white transition hover:bg-rose-700"
            @click="emit('edit', item)"
          >
            <Edit3 class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('guestLecture.editRevisionBtn') }}</span>
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="filteredItems.length > 0"
      class="flex flex-col items-center gap-3 rounded-2xl border border-surface-border bg-white px-4 py-4 text-center shadow-card"
    >
      <p class="text-xs font-semibold text-slate-500">
        {{ t('guestLecture.showingPrefix') }}
        <strong class="text-brand-900">{{ visibleItems.length }}</strong>
        {{ t('guestLecture.showingOf') }}
        <strong class="text-brand-900">{{ filteredItems.length }}</strong>
        {{ t('guestLecture.showingSuffix') }}
      </p>
      <button
        v-if="remainingCount > 0"
        type="button"
        class="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
        @click="visibleLimit += STEP_SIZE"
      >
        <ChevronDown class="h-4 w-4" aria-hidden="true" />
        <span>{{ t('guestLecture.loadMoreBtn') }} ({{ Math.min(STEP_SIZE, remainingCount) }})</span>
      </button>
      <p v-else class="text-xs font-semibold text-emerald-700">
        {{ t('guestLecture.allDisplayedNotice') }}
      </p>
    </div>
  </div>
</template>
