<script setup>
import { computed, ref, watch } from 'vue';
import { ImagePlus, Plus, RotateCcw, Trash2 } from 'lucide-vue-next';
import { safeParseCmsJson } from '../../composables/usePortalContent.js';
import { useI18n } from '../../composables/useI18n.js';
import { useUiStore } from '../../stores/ui.store.js';

const props = defineProps({
  settings: { type: Object, required: true },
  syncing: { type: Boolean, default: false },
  uploadHandler: { type: Function, required: true }
});

const emit = defineEmits(['save-settings']);
const { t } = useI18n();
const ui = useUiStore();

const selectedKey = ref('program:pai');
const uploading = ref(false);
const fileInputRef = ref(null);
const draft = ref({});

const programSlugs = ['pai', 'pgmi', 'piaud'];
const infoPageKeys = ['administrasi-persuratan', 'ujian-komprehensif', 'ppl', 'pkn', 'jurnal'];

const pageOptions = computed(() => {
  const cards = t('courses.cards') || [];
  const infoPages = t('portalPages.infoPages') || {};
  return {
    programs: programSlugs.map((slug) => ({
      key: `program:${slug}`,
      label: cards.find((c) => c.id === slug)?.title || slug.toUpperCase()
    })),
    services: infoPageKeys.map((pageKey) => ({
      key: `page:${pageKey}`,
      label: infoPages[pageKey]?.title || pageKey
    })),
    profile: [{ key: 'profile:main', label: t('hero.modalTitle') }]
  };
});

const mode = computed(() => selectedKey.value.split(':')[0]);
const targetId = computed(() => selectedKey.value.split(':')[1]);

function linesToText(arr) {
  return Array.isArray(arr) ? arr.join('\n') : '';
}

function textToLines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function pickLocaleEntry(rawEntry) {
  if (!rawEntry || typeof rawEntry !== 'object') return {};
  const activeLocale = ui.locale === 'en' ? 'en' : 'id';
  if (rawEntry.locales && typeof rawEntry.locales === 'object' && rawEntry.locales[activeLocale]) {
    return rawEntry.locales[activeLocale];
  }
  return activeLocale === 'id' ? rawEntry : {};
}

function loadDraft() {
  if (mode.value === 'program') {
    const slug = targetId.value;
    const baseCard = (t('courses.cards') || []).find((c) => c.id === slug) || {};
    const baseDetail = (t('portalPages.programs') || {})[slug] || {};
    const rawSaved = safeParseCmsJson(props.settings?.cms_programs, {})[slug] || {};
    const saved = pickLocaleEntry(rawSaved);
    draft.value = {
      title: saved.title ?? baseCard.title ?? '',
      badge: saved.badge ?? baseCard.badge ?? '',
      description: saved.description ?? baseCard.description ?? '',
      pmbUrl: saved.pmbUrl ?? rawSaved.pmbUrl ?? baseCard.pmbUrl ?? '',
      degree: saved.degree ?? baseDetail.degree ?? '',
      studyMode: saved.studyMode ?? baseDetail.studyMode ?? '',
      overview: saved.overview ?? baseDetail.overview ?? '',
      highlightsText: linesToText(saved.highlights ?? baseDetail.highlights),
      careersText: linesToText(saved.careers ?? baseDetail.careers)
    };
    return;
  }

  if (mode.value === 'page') {
    const pageKey = targetId.value;
    const basePage = (t('portalPages.infoPages') || {})[pageKey] || {};
    const rawSaved = safeParseCmsJson(props.settings?.cms_info_pages, {})[pageKey] || {};
    const saved = pickLocaleEntry(rawSaved);
    const defaultSummary =
      basePage.summary ||
      (Array.isArray(basePage.summaryBlocks)
        ? basePage.summaryBlocks
            .map((b) => (b.segments ? b.segments.map((s) => s.label || s.text).join('') : b.text))
            .join('\n\n')
        : '');
    const sourceHighlights =
      Array.isArray(saved.highlights) && saved.highlights.length
        ? saved.highlights
        : Array.isArray(rawSaved.highlights) && rawSaved.highlights.length && ui.locale === 'id'
          ? rawSaved.highlights
          : basePage.highlights || [];
    draft.value = {
      title: saved.title ?? basePage.title ?? '',
      badge: saved.badge ?? basePage.badge ?? '',
      summary: saved.summary || defaultSummary,
      defaultFlatSummary: basePage.summaryBlocks?.length ? defaultSummary : '',
      hasPrimaryCta: Boolean(basePage.primaryCta || saved.primaryCta),
      primaryCtaLabel: saved.primaryCta?.label ?? basePage.primaryCta?.label ?? '',
      primaryCtaHref: saved.primaryCta?.href ?? basePage.primaryCta?.href ?? '',
      hasSecondaryCta: Boolean(basePage.secondaryCta || saved.secondaryCta),
      secondaryCtaLabel: saved.secondaryCta?.label ?? basePage.secondaryCta?.label ?? '',
      secondaryCtaHref: saved.secondaryCta?.href ?? basePage.secondaryCta?.href ?? '',
      hasSidebarAction: Boolean(basePage.sidebarAction),
      sidebarTitle: saved.sidebarAction?.title ?? basePage.sidebarAction?.title ?? '',
      sidebarButtonLabel: saved.sidebarAction?.buttonLabel ?? basePage.sidebarAction?.buttonLabel ?? '',
      sidebarBadge: saved.sidebarAction?.badge ?? basePage.sidebarAction?.badge ?? '',
      sidebarHref: saved.sidebarAction?.href ?? '',
      highlights: sourceHighlights.map((item) => ({
        title: item.title || '',
        desc: item.desc || '',
        href: item.href || '',
        icon: item.icon || ''
      })),
      stepsText: linesToText(saved.steps ?? basePage.steps)
    };
    return;
  }

  const rawProfile = safeParseCmsJson(props.settings?.cms_profile, {});
  const savedProfile = pickLocaleEntry(rawProfile);
  draft.value = {
    visionText: savedProfile.visionText ?? t('hero.visionText'),
    missionsText: linesToText(savedProfile.missions ?? t('hero.missions')),
    structureImageUrl: savedProfile.structureImageUrl ?? rawProfile.structureImageUrl ?? ''
  };
}

watch([selectedKey, () => props.settings, () => ui.locale], loadDraft, { immediate: true, deep: true });

function addHighlightItem() {
  draft.value.highlights.push({
    title: '',
    desc: '',
    href: '',
    icon: targetId.value === 'jurnal' ? 'external' : ''
  });
}

function removeHighlightItem(index) {
  draft.value.highlights.splice(index, 1);
}

async function handleStructureUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const url = await props.uploadHandler(file);
    if (url) draft.value.structureImageUrl = url;
  } catch {
  } finally {
    uploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

function saveCurrent() {
  const activeLocale = ui.locale === 'en' ? 'en' : 'id';

  if (mode.value === 'program') {
    const all = { ...safeParseCmsJson(props.settings?.cms_programs, {}) };
    const existing = all[targetId.value] || {};
    const localized = {
      title: draft.value.title.trim(),
      badge: draft.value.badge.trim(),
      description: draft.value.description.trim(),
      pmbUrl: draft.value.pmbUrl.trim(),
      degree: draft.value.degree.trim(),
      studyMode: draft.value.studyMode.trim(),
      overview: draft.value.overview.trim(),
      highlights: textToLines(draft.value.highlightsText),
      careers: textToLines(draft.value.careersText)
    };
    const nextLocales = { ...(existing.locales || {}), [activeLocale]: localized };
    all[targetId.value] =
      activeLocale === 'id'
        ? { ...existing, ...localized, locales: nextLocales }
        : { ...existing, pmbUrl: localized.pmbUrl || existing.pmbUrl, locales: nextLocales };
    emit('save-settings', { cms_programs: JSON.stringify(all) }, t('adminDashboard.cmsPanel.portalPages.savedToast'));
    return;
  }

  if (mode.value === 'page') {
    const all = { ...safeParseCmsJson(props.settings?.cms_info_pages, {}) };
    const existing = all[targetId.value] || {};
    const summaryValue =
      draft.value.defaultFlatSummary && draft.value.summary.trim() === draft.value.defaultFlatSummary.trim()
        ? ''
        : draft.value.summary.trim();
    const localized = {
      title: draft.value.title.trim(),
      badge: draft.value.badge.trim(),
      summary: summaryValue,
      highlights: draft.value.highlights
        .filter((h) => h.title.trim())
        .map((h) => ({
          title: h.title.trim(),
          desc: h.desc.trim(),
          href: h.href.trim(),
          icon: h.icon || undefined
        })),
      steps: textToLines(draft.value.stepsText)
    };
    if (draft.value.hasPrimaryCta) {
      localized.primaryCta = { label: draft.value.primaryCtaLabel.trim(), href: draft.value.primaryCtaHref.trim() };
    }
    if (draft.value.hasSecondaryCta) {
      localized.secondaryCta = { label: draft.value.secondaryCtaLabel.trim(), href: draft.value.secondaryCtaHref.trim() };
    }
    if (draft.value.hasSidebarAction) {
      localized.sidebarAction = {
        title: draft.value.sidebarTitle.trim(),
        buttonLabel: draft.value.sidebarButtonLabel.trim(),
        badge: draft.value.sidebarBadge.trim(),
        href: draft.value.sidebarHref.trim()
      };
    }
    if (Array.isArray(existing.customOtherLinks)) {
      localized.customOtherLinks = existing.customOtherLinks;
    }
    const nextLocales = { ...(existing.locales || {}), [activeLocale]: localized };
    all[targetId.value] =
      activeLocale === 'id' ? { ...existing, ...localized, locales: nextLocales } : { ...existing, locales: nextLocales };
    emit('save-settings', { cms_info_pages: JSON.stringify(all) }, t('adminDashboard.cmsPanel.portalPages.savedToast'));
    return;
  }

  const rawProfile = safeParseCmsJson(props.settings?.cms_profile, {});
  const localizedProfile = {
    visionText: draft.value.visionText.trim(),
    missions: textToLines(draft.value.missionsText),
    structureImageUrl: draft.value.structureImageUrl.trim()
  };
  const nextLocales = { ...(rawProfile.locales || {}), [activeLocale]: localizedProfile };
  const profilePayload =
    activeLocale === 'id'
      ? { ...rawProfile, ...localizedProfile, locales: nextLocales }
      : { ...rawProfile, structureImageUrl: localizedProfile.structureImageUrl, locales: nextLocales };
  emit('save-settings', { cms_profile: JSON.stringify(profilePayload) }, t('adminDashboard.cmsPanel.portalPages.savedToast'));
}

function resetLocalizedEntry(all, key, activeLocale) {
  const entry = all[key];
  if (!entry || typeof entry !== 'object') return;
  if (activeLocale === 'en') {
    if (entry.locales?.en) {
      delete entry.locales.en;
      if (Object.keys(entry.locales).length === 0) {
        delete entry.locales;
      }
      if (Object.keys(entry).length === 0) {
        delete all[key];
      }
    }
    return;
  }
  const enOverride = entry.locales?.en;
  if (enOverride && Object.keys(enOverride).length > 0) {
    all[key] = { locales: { en: enOverride } };
  } else {
    delete all[key];
  }
}

function resetCurrentDefault() {
  const activeLocale = ui.locale === 'en' ? 'en' : 'id';
  if (mode.value === 'program') {
    const all = { ...safeParseCmsJson(props.settings?.cms_programs, {}) };
    resetLocalizedEntry(all, targetId.value, activeLocale);
    emit('save-settings', { cms_programs: JSON.stringify(all) }, t('adminDashboard.cmsPanel.portalPages.resetToast'));
    return;
  }
  if (mode.value === 'page') {
    const all = { ...safeParseCmsJson(props.settings?.cms_info_pages, {}) };
    resetLocalizedEntry(all, targetId.value, activeLocale);
    emit('save-settings', { cms_info_pages: JSON.stringify(all) }, t('adminDashboard.cmsPanel.portalPages.resetToast'));
    return;
  }
  const rawProfile = { ...safeParseCmsJson(props.settings?.cms_profile, {}) };
  if (activeLocale === 'en') {
    if (rawProfile.locales?.en) {
      delete rawProfile.locales.en;
      if (Object.keys(rawProfile.locales).length === 0) {
        delete rawProfile.locales;
      }
    }
    emit('save-settings', { cms_profile: JSON.stringify(rawProfile) }, t('adminDashboard.cmsPanel.portalPages.resetToast'));
    return;
  }
  const enOverride = rawProfile.locales?.en;
  const nextProfile = enOverride && Object.keys(enOverride).length > 0
    ? { locales: { en: enOverride } }
    : {};
  emit('save-settings', { cms_profile: JSON.stringify(nextProfile) }, t('adminDashboard.cmsPanel.portalPages.resetToast'));
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
    <aside class="rounded-2xl border border-surface-border bg-white p-4 shadow-card space-y-4 xl:col-span-4">
      <div>
        <h2 class="text-base font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.portalPages.heading') }}</h2>
        <p class="mt-1 text-xs text-slate-500">{{ t('adminDashboard.cmsPanel.portalPages.subtitle') }}</p>
      </div>

      <div class="space-y-1">
        <p class="px-2 text-[11px] font-bold uppercase text-slate-400">{{ t('adminDashboard.cmsPanel.portalPages.groupPrograms') }}</p>
        <button
          v-for="opt in pageOptions.programs"
          :key="opt.key"
          type="button"
          class="flex min-h-[40px] w-full items-center rounded-xl px-3 text-left text-xs font-bold transition"
          :class="selectedKey === opt.key ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-surface-page'"
          @click="selectedKey = opt.key"
        >
          {{ opt.label }}
        </button>
      </div>

      <div class="space-y-1">
        <p class="px-2 text-[11px] font-bold uppercase text-slate-400">{{ t('adminDashboard.cmsPanel.portalPages.groupServices') }}</p>
        <button
          v-for="opt in pageOptions.services"
          :key="opt.key"
          type="button"
          class="flex min-h-[40px] w-full items-center rounded-xl px-3 text-left text-xs font-bold transition"
          :class="selectedKey === opt.key ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-surface-page'"
          @click="selectedKey = opt.key"
        >
          {{ opt.label }}
        </button>
      </div>

      <div class="space-y-1">
        <p class="px-2 text-[11px] font-bold uppercase text-slate-400">{{ t('adminDashboard.cmsPanel.portalPages.groupProfile') }}</p>
        <button
          v-for="opt in pageOptions.profile"
          :key="opt.key"
          type="button"
          class="flex min-h-[40px] w-full items-center rounded-xl px-3 text-left text-xs font-bold transition"
          :class="selectedKey === opt.key ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-surface-page'"
          @click="selectedKey = opt.key"
        >
          {{ opt.label }}
        </button>
      </div>
    </aside>

    <form
      class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5 xl:col-span-8"
      @submit.prevent="saveCurrent"
    >
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-4">
        <div class="flex items-center gap-2">
          <h3 class="text-base font-extrabold text-brand-900">{{ draft.title || t('hero.modalTitle') }}</h3>
          <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-brand-700">
            {{ ui.locale.toUpperCase() }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            :disabled="syncing"
            class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-surface-border px-3.5 text-xs font-bold text-slate-700 hover:bg-surface-muted disabled:opacity-50"
            @click="resetCurrentDefault"
          >
            <RotateCcw class="h-3.5 w-3.5" aria-hidden="true" />
            <span>{{ t('adminDashboard.cmsPanel.portalPages.resetDefaultBtn') }}</span>
          </button>
          <button
            type="submit"
            :disabled="syncing || uploading"
            class="min-h-[40px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {{ t('adminDashboard.cmsPanel.portalPages.savePageBtn') }}
          </button>
        </div>
      </div>

      <template v-if="mode === 'program'">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="pg-title" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.title') }}</label>
            <input id="pg-title" v-model="draft.title" type="text" required class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div>
            <label for="pg-badge" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.badge') }}</label>
            <input id="pg-badge" v-model="draft.badge" type="text" required class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div>
            <label for="pg-degree" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.degree') }}</label>
            <input id="pg-degree" v-model="draft.degree" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div>
            <label for="pg-mode" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.studyMode') }}</label>
            <input id="pg-mode" v-model="draft.studyMode" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label for="pg-pmb" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.pmbUrl') }}</label>
            <input id="pg-pmb" v-model="draft.pmbUrl" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label for="pg-desc" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.description') }}</label>
            <textarea id="pg-desc" v-model="draft.description" rows="2" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label for="pg-overview" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.overview') }}</label>
            <textarea id="pg-overview" v-model="draft.overview" rows="3" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label for="pg-highlights" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.highlightsLines') }}</label>
            <textarea id="pg-highlights" v-model="draft.highlightsText" rows="4" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label for="pg-careers" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.careersLines') }}</label>
            <textarea id="pg-careers" v-model="draft.careersText" rows="4" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
          </div>
        </div>
      </template>

      <template v-else-if="mode === 'page'">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="info-title" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.title') }}</label>
            <input id="info-title" v-model="draft.title" type="text" required class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div>
            <label for="info-badge" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.badge') }}</label>
            <input id="info-badge" v-model="draft.badge" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <div class="sm:col-span-2">
            <label for="info-summary" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.summary') }}</label>
            <textarea id="info-summary" v-model="draft.summary" rows="3" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
          </div>

          <template v-if="draft.hasPrimaryCta">
            <div>
              <label for="info-cta1-label" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.primaryCtaLabel') }}</label>
              <input id="info-cta1-label" v-model="draft.primaryCtaLabel" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
            </div>
            <div>
              <label for="info-cta1-href" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.primaryCtaHref') }}</label>
              <input id="info-cta1-href" v-model="draft.primaryCtaHref" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
            </div>
          </template>

          <template v-if="draft.hasSecondaryCta">
            <div>
              <label for="info-cta2-label" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.secondaryCtaLabel') }}</label>
              <input id="info-cta2-label" v-model="draft.secondaryCtaLabel" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
            </div>
            <div>
              <label for="info-cta2-href" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.secondaryCtaHref') }}</label>
              <input id="info-cta2-href" v-model="draft.secondaryCtaHref" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
            </div>
          </template>

          <template v-if="draft.hasSidebarAction">
            <div>
              <label for="info-sb-title" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.sidebarTitle') }}</label>
              <input id="info-sb-title" v-model="draft.sidebarTitle" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
            </div>
            <div>
              <label for="info-sb-btn" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.sidebarButtonLabel') }}</label>
              <input id="info-sb-btn" v-model="draft.sidebarButtonLabel" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
            </div>
            <div>
              <label for="info-sb-badge" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.sidebarBadge') }}</label>
              <input id="info-sb-badge" v-model="draft.sidebarBadge" type="text" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
            </div>
            <div>
              <label for="info-sb-href" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.sidebarHref') }}</label>
              <input id="info-sb-href" v-model="draft.sidebarHref" type="text" placeholder="https://..." class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
            </div>
          </template>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold uppercase text-slate-500">{{ t('adminDashboard.cmsPanel.portalPages.fields.highlightsSection') }}</p>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-surface-border bg-surface-page px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50"
              @click="addHighlightItem"
            >
              <Plus class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ t('adminDashboard.cmsPanel.portalPages.fields.addHighlightBtn') }}</span>
            </button>
          </div>
          <div
            v-for="(item, idx) in draft.highlights"
            :key="idx"
            class="grid grid-cols-1 gap-2 rounded-xl border border-surface-border bg-surface-page p-3 sm:grid-cols-12"
          >
            <input
              v-model="item.title"
              type="text"
              :placeholder="t('adminDashboard.cmsPanel.portalPages.fields.itemTitle')"
              class="min-h-[38px] rounded-lg border border-surface-border px-3 text-xs sm:col-span-3"
            />
            <input
              v-model="item.desc"
              type="text"
              :placeholder="t('adminDashboard.cmsPanel.portalPages.fields.itemDesc')"
              class="min-h-[38px] rounded-lg border border-surface-border px-3 text-xs sm:col-span-3"
            />
            <input
              v-model="item.href"
              type="text"
              :placeholder="t('adminDashboard.cmsPanel.portalPages.fields.itemHref')"
              class="min-h-[38px] rounded-lg border border-surface-border px-3 text-xs sm:col-span-3"
            />
            <select
              v-model="item.icon"
              :aria-label="t('adminDashboard.cmsPanel.portalPages.fields.itemIcon')"
              class="min-h-[38px] rounded-lg border border-surface-border px-2.5 text-xs sm:col-span-2"
            >
              <option value="">Download</option>
              <option value="external">External Link</option>
            </select>
            <button
              type="button"
              :aria-label="t('adminDashboard.cmsPanel.delBtn')"
              class="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 sm:col-span-1"
              @click="removeHighlightItem(idx)"
            >
              <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div>
          <label for="info-steps" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.stepsLines') }}</label>
          <textarea id="info-steps" v-model="draft.stepsText" rows="4" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
        </div>
      </template>

      <template v-else>
        <div class="space-y-4">
          <div>
            <label for="prof-vision" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.visionText') }}</label>
            <textarea id="prof-vision" v-model="draft.visionText" rows="3" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
          </div>
          <div>
            <label for="prof-missions" class="mb-1 block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.missionsLines') }}</label>
            <textarea id="prof-missions" v-model="draft.missionsText" rows="4" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
          </div>
          <div class="space-y-2">
            <label for="prof-structure" class="block text-xs font-bold text-slate-600">{{ t('adminDashboard.cmsPanel.portalPages.fields.structureImageUrl') }}</label>
            <div class="flex gap-2">
              <input id="prof-structure" v-model="draft.structureImageUrl" type="text" placeholder="/api/v1/media/... atau https://..." class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
              <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="handleStructureUpload" />
              <button
                type="button"
                :disabled="uploading || syncing"
                class="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-surface-border bg-surface-page px-3.5 text-xs font-bold text-brand-900 hover:bg-brand-50 disabled:opacity-50"
                @click="fileInputRef?.click()"
              >
                <ImagePlus class="h-4 w-4 text-brand-600" aria-hidden="true" />
                <span>{{ uploading ? t('adminDashboard.cmsPanel.uploadingImageBtn') : t('adminDashboard.cmsPanel.uploadImageBtn') }}</span>
              </button>
            </div>
            <img
              v-if="draft.structureImageUrl"
              :src="draft.structureImageUrl"
              alt="Structure preview"
              class="max-h-48 w-full rounded-xl border border-surface-border object-contain bg-surface-page p-2"
            />
          </div>
        </div>
      </template>
    </form>
  </div>
</template>
