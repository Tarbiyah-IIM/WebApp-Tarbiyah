<script setup>
import { computed, reactive, watch } from 'vue';
import { CheckCircle2, RotateCcw } from 'lucide-vue-next';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  settings: { type: Object, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['submit']);
const { t } = useI18n();

const form = reactive({
  hero_tagline: '',
  hero_title: '',
  hero_subtitle: '',
  footer_cta_title: '',
  footer_cta_subtitle: ''
});

function syncFromProps(source) {
  form.hero_tagline = source?.hero_tagline || '';
  form.hero_title = source?.hero_title || '';
  form.hero_subtitle = source?.hero_subtitle || '';
  form.footer_cta_title = source?.footer_cta_title || '';
  form.footer_cta_subtitle = source?.footer_cta_subtitle || '';
}

watch(
  () => props.settings,
  (next) => syncFromProps(next),
  { immediate: true, deep: true }
);

const isDirty = computed(
  () =>
    form.hero_tagline !== (props.settings?.hero_tagline || '') ||
    form.hero_title !== (props.settings?.hero_title || '') ||
    form.hero_subtitle !== (props.settings?.hero_subtitle || '') ||
    form.footer_cta_title !== (props.settings?.footer_cta_title || '') ||
    form.footer_cta_subtitle !== (props.settings?.footer_cta_subtitle || '')
);

function handleSubmit() {
  emit('submit', {
    hero_tagline: form.hero_tagline,
    hero_title: form.hero_title,
    hero_subtitle: form.hero_subtitle,
    footer_cta_title: form.footer_cta_title,
    footer_cta_subtitle: form.footer_cta_subtitle
  });
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
    <form
      class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5 xl:col-span-7"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.settingsHeading') }}</h2>
          <span
            v-if="isDirty"
            class="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800"
          >
            {{ t('adminDashboard.cmsPanel.unsavedBadge') }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="isDirty"
            type="button"
            :disabled="syncing"
            class="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-surface-border px-3.5 text-xs font-bold text-slate-700 hover:bg-surface-muted disabled:opacity-50"
            @click="syncFromProps(props.settings)"
          >
            <RotateCcw class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.resetBtn') }}</span>
          </button>
          <button
            type="submit"
            :disabled="syncing"
            class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {{ t('adminDashboard.cmsPanel.saveSyncBtn') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="cms-hero-tagline" class="mb-1.5 block text-xs font-bold uppercase text-slate-500">
            {{ t('adminDashboard.cmsPanel.heroTaglineLabel') }}
          </label>
          <input
            id="cms-hero-tagline"
            v-model="form.hero_tagline"
            type="text"
            class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
          />
        </div>
        <div>
          <label for="cms-footer-cta-title" class="mb-1.5 block text-xs font-bold uppercase text-slate-500">
            {{ t('adminDashboard.cmsPanel.footerCtaTitleLabel') }}
          </label>
          <input
            id="cms-footer-cta-title"
            v-model="form.footer_cta_title"
            type="text"
            class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
          />
        </div>
        <div class="sm:col-span-2">
          <label for="cms-hero-title" class="mb-1.5 block text-xs font-bold uppercase text-slate-500">
            {{ t('adminDashboard.cmsPanel.heroTitleLabel') }}
          </label>
          <input
            id="cms-hero-title"
            v-model="form.hero_title"
            type="text"
            class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
          />
        </div>
        <div class="sm:col-span-2">
          <label for="cms-hero-subtitle" class="mb-1.5 block text-xs font-bold uppercase text-slate-500">
            {{ t('adminDashboard.cmsPanel.heroSubtitleLabel') }}
          </label>
          <textarea
            id="cms-hero-subtitle"
            v-model="form.hero_subtitle"
            rows="4"
            class="w-full rounded-xl border border-surface-border p-3.5 text-sm leading-relaxed"
          />
        </div>
        <div class="sm:col-span-2">
          <label for="cms-footer-cta-subtitle" class="mb-1.5 block text-xs font-bold uppercase text-slate-500">
            {{ t('adminDashboard.cmsPanel.footerCtaSubtitleLabel') }}
          </label>
          <textarea
            id="cms-footer-cta-subtitle"
            v-model="form.footer_cta_subtitle"
            rows="2"
            class="w-full rounded-xl border border-surface-border p-3.5 text-sm leading-relaxed"
          />
        </div>
      </div>
    </form>

    <aside class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4 xl:col-span-5">
      <p class="text-xs font-bold uppercase tracking-wider text-slate-500">
        {{ t('adminDashboard.cmsPanel.livePreviewTitle') }}
      </p>
      <div class="rounded-2xl border border-brand-100 bg-gradient-to-b from-brand-50/80 via-white to-white p-6 space-y-4">
        <h3 class="text-2xl font-extrabold tracking-tight text-brand-900">
          {{ form.hero_title || 'Selamat Datang di Fakultas Tarbiyah' }}
        </h3>
        <p class="text-sm leading-relaxed text-slate-600">
          {{ form.hero_subtitle || '...' }}
        </p>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <CheckCircle2 class="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{{ form.hero_tagline || 'Become Future Educators with Global Impact' }}</span>
        </div>
      </div>

      <div class="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-5 text-white space-y-1.5">
        <p class="text-base font-extrabold">{{ form.footer_cta_title || 'Your Future Start Here!' }}</p>
        <p class="text-xs text-brand-100 leading-relaxed">{{ form.footer_cta_subtitle || '...' }}</p>
      </div>
    </aside>
  </div>
</template>
