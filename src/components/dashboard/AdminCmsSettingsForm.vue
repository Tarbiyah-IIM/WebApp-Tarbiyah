<script setup>
import { useI18n } from '../../composables/useI18n.js';

const settings = defineModel({ type: Object, required: true });
const emit = defineEmits(['submit']);

const { t } = useI18n();
</script>

<template>
  <form class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4" @submit.prevent="emit('submit')">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.settingsHeading') }}</h2>
      <button type="submit" class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700">
        {{ t('adminDashboard.cmsPanel.saveSyncBtn') }}
      </button>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label for="cms-hero-tagline" class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('adminDashboard.cmsPanel.heroTaglineLabel') }}</label>
        <input id="cms-hero-tagline" v-model="settings.hero_tagline" type="text" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
      </div>
      <div>
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('adminDashboard.cmsPanel.footerCtaTitleLabel') }}</label>
        <input v-model="settings.footer_cta_title" type="text" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
      </div>
      <div class="sm:col-span-2">
        <label for="cms-hero-title" class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('adminDashboard.cmsPanel.heroTitleLabel') }}</label>
        <input id="cms-hero-title" v-model="settings.hero_title" type="text" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
      </div>
      <div class="sm:col-span-2">
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">{{ t('adminDashboard.cmsPanel.heroSubtitleLabel') }}</label>
        <textarea v-model="settings.hero_subtitle" rows="2" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
      </div>
    </div>
  </form>
</template>
