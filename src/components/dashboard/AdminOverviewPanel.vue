<script setup>
import { computed } from 'vue';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  FileCode2,
  Handshake,
  HelpCircle,
  Link2,
  Newspaper,
  Users,
  WandSparkles
} from 'lucide-vue-next';
import AdminCmsSettingsForm from './AdminCmsSettingsForm.vue';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  stats: { type: Object, required: true },
  settings: { type: Object, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['navigate', 'save-settings']);

const { t } = useI18n();

const kpiCards = computed(() => [
  {
    id: 'users',
    label: t('adminDashboard.stats.users'),
    value: props.stats.totalUsers || 0,
    icon: Users,
    accent: 'bg-brand-50 text-brand-700'
  },
  {
    id: 'news',
    label: t('adminDashboard.stats.news'),
    value: props.stats.totalNews || 0,
    icon: Newspaper,
    accent: 'bg-amber-50 text-amber-700'
  },
  {
    id: 'agendas',
    label: t('adminDashboard.stats.agendas'),
    value: props.stats.totalAgendas || 0,
    icon: CalendarDays,
    accent: 'bg-emerald-50 text-emerald-700'
  },
  {
    id: 'faqs',
    label: t('adminDashboard.stats.faqs'),
    value: props.stats.totalFaqs || 0,
    icon: HelpCircle,
    accent: 'bg-emerald-50 text-emerald-700'
  },
  {
    id: 'partners',
    label: t('adminDashboard.stats.services'),
    value: props.stats.totalServices || 0,
    icon: Handshake,
    accent: 'bg-brand-50 text-brand-700'
  },
  {
    id: 'features',
    label: t('adminDashboard.stats.features'),
    value: props.stats.totalFeatures || 0,
    icon: WandSparkles,
    accent: 'bg-rose-50 text-rose-700'
  }
]);
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      <button
        v-for="card in kpiCards"
        :key="card.id"
        type="button"
        class="group rounded-2xl border border-surface-border bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand-300"
        @click="emit('navigate', card.id)"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="card.accent">
            <component :is="card.icon" class="h-5 w-5" aria-hidden="true" />
          </div>
          <ArrowRight class="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden="true" />
        </div>
        <p class="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{{ card.label }}</p>
        <p class="mt-1 text-2xl font-extrabold text-brand-900">{{ card.value }}</p>
      </button>
    </div>

    <section class="rounded-2xl border border-surface-border bg-white p-5 shadow-card space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-extrabold uppercase tracking-wider text-brand-900">
          {{ t('adminDashboard.quickActionsTitle') }}
        </h2>
      </div>

      <div
        v-if="!stats.totalNews"
        class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900"
      >
        <span class="flex items-center gap-2">
          <AlertCircle class="h-4 w-4 shrink-0" aria-hidden="true" />
          {{ t('adminDashboard.emptyNewsAlert') }}
        </span>
        <button
          type="button"
          class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
          @click="emit('navigate', 'news')"
        >
          {{ t('adminDashboard.quickActionNews') }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-between rounded-xl border border-surface-border bg-surface-page px-4 text-xs font-bold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
          @click="emit('navigate', 'news')"
        >
          <span class="flex items-center gap-2">
            <Newspaper class="h-4 w-4 text-brand-600" aria-hidden="true" />
            {{ t('adminDashboard.quickActionNews') }}
          </span>
          <ArrowRight class="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-between rounded-xl border border-surface-border bg-surface-page px-4 text-xs font-bold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
          @click="emit('navigate', 'menus')"
        >
          <span class="flex items-center gap-2">
            <Link2 class="h-4 w-4 text-brand-600" aria-hidden="true" />
            {{ t('adminDashboard.quickActionMenus') }}
          </span>
          <ArrowRight class="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex min-h-[44px] items-center justify-between rounded-xl border border-surface-border bg-surface-page px-4 text-xs font-bold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
          @click="emit('navigate', 'pages')"
        >
          <span class="flex items-center gap-2">
            <FileCode2 class="h-4 w-4 text-brand-600" aria-hidden="true" />
            {{ t('adminDashboard.quickActionPages') }}
          </span>
          <ArrowRight class="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        </button>
        <a
          href="/kuliah-tamu"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-[44px] items-center justify-between rounded-xl border border-surface-border bg-surface-page px-4 text-xs font-bold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
        >
          <span>{{ t('adminDashboard.quickActionGuestLecture') }}</span>
          <ExternalLink class="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
        </a>
      </div>
    </section>

    <AdminCmsSettingsForm
      :settings="settings"
      :syncing="syncing"
      @submit="emit('save-settings', $event)"
    />
  </div>
</template>
