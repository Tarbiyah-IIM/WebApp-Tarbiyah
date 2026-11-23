<script setup>
import { reactive, watch } from 'vue';
import { DEFAULT_CONTACTS, DEFAULT_NAV_LINKS, safeParseCmsJson } from '../../composables/usePortalContent.js';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({
  settings: { type: Object, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['save-settings']);
const { t } = useI18n();

const navForm = reactive({ ...DEFAULT_NAV_LINKS });
const contactForm = reactive({ ...DEFAULT_CONTACTS });

const navKeys = [
  'activeLetter',
  'calendar',
  'curriculum',
  'munaqasyah',
  'research',
  'rplGuide',
  'rplRegulations',
  'rplDecree'
];

const contactKeys = [
  'waPmbUrl',
  'waAdminUrl',
  'campusBuilding',
  'addressText',
  'phoneText',
  'mapsEmbedUrl',
  'guestLectureUrl'
];

function hydrate(source) {
  const navOverride = safeParseCmsJson(source?.cms_nav_links, {});
  for (const key of navKeys) {
    navForm[key] = navOverride[key] !== undefined ? String(navOverride[key]) : DEFAULT_NAV_LINKS[key];
  }
  const contactOverride = safeParseCmsJson(source?.cms_contacts, {});
  for (const key of contactKeys) {
    contactForm[key] = contactOverride[key] !== undefined ? String(contactOverride[key]) : DEFAULT_CONTACTS[key];
  }
}

watch(
  () => props.settings,
  (next) => hydrate(next),
  { immediate: true, deep: true }
);

function saveNav() {
  const payload = {};
  for (const key of navKeys) {
    payload[key] = String(navForm[key] || '').trim();
  }
  emit(
    'save-settings',
    { cms_nav_links: JSON.stringify(payload) },
    t('adminDashboard.cmsPanel.portalMenus.navSaved')
  );
}

function saveContacts() {
  const payload = {};
  for (const key of contactKeys) {
    payload[key] = String(contactForm[key] || '').trim();
  }
  emit(
    'save-settings',
    { cms_contacts: JSON.stringify(payload) },
    t('adminDashboard.cmsPanel.portalMenus.contactsSaved')
  );
}
</script>

<template>
  <div class="space-y-6">
    <form class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5" @submit.prevent="saveNav">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.portalMenus.heading') }}</h2>
          <p class="mt-1 text-xs text-slate-500">{{ t('adminDashboard.cmsPanel.portalMenus.subtitle') }}</p>
        </div>
        <button
          type="submit"
          :disabled="syncing"
          class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {{ t('adminDashboard.cmsPanel.portalMenus.saveNavBtn') }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div v-for="key in navKeys" :key="key">
          <label :for="`cms-nav-${key}`" class="mb-1.5 block text-xs font-bold text-slate-600">
            {{ t(`adminDashboard.cmsPanel.portalMenus.fields.${key}`) }}
          </label>
          <input
            :id="`cms-nav-${key}`"
            v-model="navForm[key]"
            type="text"
            placeholder="https://... atau /path"
            class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
          />
        </div>
      </div>
    </form>

    <form class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-5" @submit.prevent="saveContacts">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.portalMenus.contactsHeading') }}</h2>
          <p class="mt-1 text-xs text-slate-500">{{ t('adminDashboard.cmsPanel.portalMenus.contactsSubtitle') }}</p>
        </div>
        <button
          type="submit"
          :disabled="syncing"
          class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {{ t('adminDashboard.cmsPanel.portalMenus.saveContactsBtn') }}
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div v-for="key in contactKeys" :key="key" :class="key === 'mapsEmbedUrl' || key === 'guestLectureUrl' ? 'md:col-span-2' : ''">
          <label :for="`cms-contact-${key}`" class="mb-1.5 block text-xs font-bold text-slate-600">
            {{ t(`adminDashboard.cmsPanel.portalMenus.fields.${key}`) }}
          </label>
          <input
            :id="`cms-contact-${key}`"
            v-model="contactForm[key]"
            type="text"
            class="min-h-[42px] w-full rounded-xl border border-surface-border px-3.5 text-sm"
          />
        </div>
      </div>
    </form>
  </div>
</template>
