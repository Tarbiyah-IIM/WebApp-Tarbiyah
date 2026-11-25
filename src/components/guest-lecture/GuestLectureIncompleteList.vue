<script setup>
import { computed } from 'vue';
import { AlertCircle, BookOpen, Calendar, CheckCircle2, Clock, Edit3, User, Users } from 'lucide-vue-next';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  items: { type: Array, default: () => [] }
});

const emit = defineEmits(['select']);
const { t } = useI18n();

const sortedItems = computed(() =>
  [...props.items].sort((a, b) => Number(b.rowIndex || 0) - Number(a.rowIndex || 0))
);

function missingBadges(item) {
  const badges = [];
  if (!item.prodi) badges.push(t('guestLecture.missing.prodi'));
  if (item.needsDosenPengampu || !item.dosenPengampu) badges.push(t('guestLecture.missing.lecturer'));
  if (item.needsMataKuliah || !item.mataKuliah) badges.push(t('guestLecture.missing.course'));
  if (item.needsDosenTamu || !item.dosenTamu) badges.push(t('guestLecture.missing.speaker'));
  if (item.needsTema || !item.tema) badges.push(t('guestLecture.missing.topic'));
  if (item.needsTanggal || !item.tanggal) badges.push(t('guestLecture.missing.date'));
  if (item.needsJam || !item.jam) badges.push(t('guestLecture.missing.time'));
  if (item.needsFoto || !item.fotoNarsum) badges.push(t('guestLecture.missing.photo'));
  return badges;
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-surface-border bg-white px-5 py-4 shadow-card">
      <div>
        <h2 class="text-sm font-extrabold text-brand-900 sm:text-base">
          {{ t('guestLecture.incompleteHeading') }}
        </h2>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ t('guestLecture.incompleteHint') }}
        </p>
      </div>
    </div>

    <div
      v-if="sortedItems.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/60 px-6 py-12 text-center"
    >
      <CheckCircle2 class="h-10 w-10 text-emerald-600" aria-hidden="true" />
      <p class="mt-3 text-base font-bold text-brand-900">
        {{ t('guestLecture.incompleteEmptyTitle') }}
      </p>
      <p class="mt-1 max-w-md text-xs text-slate-600">
        {{ t('guestLecture.incompleteEmptyDesc') }}
      </p>
    </div>

    <div v-else data-testid="guest-lecture-incomplete-list" class="space-y-3.5">
      <article
        v-for="item in sortedItems"
        :key="item.rowIndex"
        class="group rounded-2xl border border-surface-border bg-white p-5 shadow-card transition hover:border-brand-300 hover:shadow-float"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1 space-y-2.5">
            <div class="flex flex-wrap items-center gap-2">
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
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                :class="
                  ['in revision', 'revision'].includes(String(item.status || '').trim().toLowerCase())
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-800'
                "
              >
                <AlertCircle class="h-3 w-3" aria-hidden="true" />
                <span>{{ item.status || t('guestLecture.statusNotStarted') }}</span>
              </span>
            </div>

            <h3 class="text-base font-extrabold text-brand-900">
              {{ item.mataKuliah || t('guestLecture.unsetCourse') }}
            </h3>

            <dl class="grid grid-cols-1 gap-1.5 text-xs text-slate-600 sm:grid-cols-2">
              <div class="flex items-center gap-1.5">
                <User class="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span class="font-semibold text-slate-500">{{ t('guestLecture.fields.lecturer') }}:</span>
                <span class="truncate font-semibold text-brand-900">{{ item.dosenPengampu || '—' }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Users class="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span class="font-semibold text-slate-500">{{ t('guestLecture.fields.speaker') }}:</span>
                <span class="truncate font-semibold text-brand-900">{{ item.dosenTamu || '—' }}</span>
              </div>
              <div v-if="item.tema" class="flex items-start gap-1.5 sm:col-span-2">
                <BookOpen class="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                <span class="font-semibold text-slate-500">{{ t('guestLecture.fields.topic') }}:</span>
                <span class="text-slate-700">{{ item.tema }}</span>
              </div>
              <div v-if="item.tanggal || item.jam" class="flex items-center gap-3 sm:col-span-2">
                <span v-if="item.tanggal" class="inline-flex items-center gap-1 font-semibold text-slate-600">
                  <Calendar class="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  <span>{{ item.tanggal }}</span>
                </span>
                <span v-if="item.jam" class="inline-flex items-center gap-1 font-semibold text-slate-600">
                  <Clock class="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                  <span>{{ item.jam }}</span>
                </span>
              </div>
            </dl>

            <div v-if="missingBadges(item).length" class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[11px] font-semibold text-slate-500">{{ t('guestLecture.missingLabel') }}:</span>
              <span
                v-for="label in missingBadges(item)"
                :key="label"
                class="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
              >
                {{ label }}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
            @click="emit('select', item)"
          >
            <Edit3 class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('guestLecture.completeActionBtn') }}</span>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
