<script setup>
import { onMounted, ref } from 'vue';
import AdminCmsSettingsForm from './AdminCmsSettingsForm.vue';
import { adminService } from '../../services/admin.service.js';
import { extractApiError } from '../../services/api.js';
import { useLandingStore } from '../../stores/landing.store.js';
import { useToast } from '../../composables/useToast.js';
import { useI18n } from '../../composables/useI18n.js';

const props = defineProps({ section: { type: String, default: 'all' } });
const landingStore = useLandingStore();
const toast = useToast();
const { t } = useI18n();
const showSection = (section) => props.section === 'all' || props.section === section;

const settings = ref({});
const loadingCms = ref(true);
const faqs = ref([]);
const stats = ref([]);
const features = ref([]);
const partners = ref([]);
const faqForm = ref({ id: null, question: '', answer: '', sortOrder: 0 });
const statForm = ref({ id: null, statGroup: 'hero', label: '', valueNum: '', suffix: '', sortOrder: 0 });
const featureForm = ref({ id: null, title: '', description: '', icon: 'check', sortOrder: 0 });
const partnerForm = ref({ id: null, name: '', url: '', sortOrder: 0 });

async function loadCms() {
  loadingCms.value = true;
  try {
    const [sRes, fRes, stRes, ftRes, pRes] = await Promise.all([
      adminService.getSettings(), adminService.listFaqs(), adminService.listStats(), adminService.listFeatures(), adminService.listPartners()
    ]);
    settings.value = sRes.settings;
    faqs.value = fRes.items;
    stats.value = stRes.items;
    features.value = ftRes.items;
    partners.value = pRes.items;
  } catch (err) {
    toast.error(extractApiError(err));
  } finally {
    loadingCms.value = false;
  }
}

async function syncLanding() {
  await Promise.all([loadCms(), landingStore.fetchLanding(true)]);
}

async function saveSettings() {
  try {
    await adminService.updateSettings(settings.value);
    await syncLanding();
    toast.success(t('adminDashboard.cmsPanel.toasts.settingsSaved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function saveFaq() {
  try {
    if (faqForm.value.id) await adminService.updateFaq(faqForm.value.id, faqForm.value);
    else await adminService.createFaq(faqForm.value);
    faqForm.value = { id: null, question: '', answer: '', sortOrder: 0 };
    await syncLanding();
    toast.success(t('adminDashboard.cmsPanel.toasts.faqSaved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeFaq(id) {
  try {
    await adminService.deleteFaq(id);
    await syncLanding();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function saveStat() {
  try {
    if (statForm.value.id) await adminService.updateStat(statForm.value.id, statForm.value);
    else await adminService.createStat(statForm.value);
    statForm.value = { id: null, statGroup: 'hero', label: '', valueNum: '', suffix: '', sortOrder: 0 };
    await syncLanding();
    toast.success(t('adminDashboard.cmsPanel.toasts.statSaved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeStat(id) {
  try {
    await adminService.deleteStat(id);
    await syncLanding();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function savePartner() {
  try {
    if (partnerForm.value.id) await adminService.updatePartner(partnerForm.value.id, partnerForm.value);
    else await adminService.createPartner(partnerForm.value);
    partnerForm.value = { id: null, name: '', url: '', sortOrder: 0 };
    await syncLanding();
    toast.success(t('adminDashboard.cmsPanel.toasts.partnerSaved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removePartner(id) {
  try {
    await adminService.deletePartner(id);
    await syncLanding();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function saveFeature() {
  try {
    if (featureForm.value.id) await adminService.updateFeature(featureForm.value.id, featureForm.value);
    else await adminService.createFeature(featureForm.value);
    featureForm.value = { id: null, title: '', description: '', icon: 'check', sortOrder: 0 };
    await syncLanding();
    toast.success(t('adminDashboard.cmsPanel.toasts.featureSaved'));
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeFeature(id) {
  try {
    await adminService.deleteFeature(id);
    await syncLanding();
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

onMounted(loadCms);
</script>

<template>
  <div v-if="loadingCms" class="rounded-2xl border border-surface-border bg-white p-8 text-sm text-slate-500">
    {{ t('adminDashboard.cmsPanel.loading') }}
  </div>
  <div v-else class="space-y-8">
    <AdminCmsSettingsForm v-if="showSection('settings') || showSection('all')" v-model="settings" @submit="saveSettings" />

    <div v-if="showSection('stats') || showSection('partners')" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section v-if="showSection('stats')" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.statsHeading') }}</h2>
        <form class="grid grid-cols-2 gap-2" @submit.prevent="saveStat">
          <select v-model="statForm.statGroup" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm">
            <option value="hero">{{ t('adminDashboard.cmsPanel.statHeroOpt') }}</option>
            <option value="journey">{{ t('adminDashboard.cmsPanel.statJourneyOpt') }}</option>
          </select>
          <input v-model="statForm.label" type="text" required :placeholder="t('adminDashboard.cmsPanel.statLabelPlaceholder')" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="statForm.valueNum" type="text" required :placeholder="t('adminDashboard.cmsPanel.statValuePlaceholder')" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <div class="flex gap-2">
            <input v-model="statForm.suffix" type="text" :placeholder="t('adminDashboard.cmsPanel.statSuffixPlaceholder')" class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
            <button type="submit" class="rounded-xl bg-brand-600 px-3 text-xs font-bold text-white">{{ t('adminDashboard.cmsPanel.saveBtn') }}</button>
          </div>
        </form>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="st in stats" :key="st.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-xs">
            <span><strong>[{{ st.stat_group }}]</strong> {{ st.value_num }}{{ st.suffix }} — {{ st.label }}</span>
            <div class="flex gap-2">
              <button type="button" class="text-brand-600 font-semibold" @click="statForm = { id: st.id, statGroup: st.stat_group, label: st.label, valueNum: st.value_num, suffix: st.suffix, sortOrder: st.sort_order }">{{ t('adminDashboard.cmsPanel.editBtn') }}</button>
              <button type="button" class="text-rose-600" @click="removeStat(st.id)">{{ t('adminDashboard.cmsPanel.delBtn') }}</button>
            </div>
          </div>
        </div>
      </section>
      <section v-if="showSection('partners')" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.partnersHeading') }}</h2>
        <form class="flex gap-2" @submit.prevent="savePartner">
          <input v-model="partnerForm.name" type="text" required :placeholder="t('adminDashboard.cmsPanel.partnerNamePlaceholder')" class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="partnerForm.url" type="text" :placeholder="t('adminDashboard.cmsPanel.partnerUrlPlaceholder')" class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
          <button type="submit" class="rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">{{ t('adminDashboard.cmsPanel.saveBtn') }}</button>
        </form>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="p in partners" :key="p.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-xs">
            <span class="font-bold text-brand-900">{{ p.name }}</span>
            <div class="flex gap-2">
              <button type="button" class="text-brand-600 font-semibold" @click="partnerForm = { id: p.id, name: p.name, url: p.url || '', sortOrder: p.sort_order }">{{ t('adminDashboard.cmsPanel.editBtn') }}</button>
              <button type="button" class="text-rose-600" @click="removePartner(p.id)">{{ t('adminDashboard.cmsPanel.delBtn') }}</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="showSection('faqs') || showSection('features')" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section v-if="showSection('faqs')" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.faqsHeading') }}</h2>
        <form class="space-y-2" @submit.prevent="saveFaq">
          <input v-model="faqForm.question" type="text" required :placeholder="t('adminDashboard.cmsPanel.faqQuestionPlaceholder')" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          <textarea v-model="faqForm.answer" rows="2" required :placeholder="t('adminDashboard.cmsPanel.faqAnswerPlaceholder')" class="w-full rounded-xl border border-surface-border p-2.5 text-sm" />
          <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">{{ faqForm.id ? t('adminDashboard.cmsPanel.updateFaqBtn') : t('adminDashboard.cmsPanel.addFaqBtn') }}</button>
        </form>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="f in faqs" :key="f.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-xs">
            <span class="truncate pr-3 font-semibold text-brand-900">{{ f.question }}</span>
            <div class="flex gap-2 shrink-0">
              <button type="button" class="text-brand-600 font-semibold" @click="faqForm = { id: f.id, question: f.question, answer: f.answer, sortOrder: f.sort_order }">{{ t('adminDashboard.cmsPanel.editBtn') }}</button>
              <button type="button" class="text-rose-600" @click="removeFaq(f.id)">{{ t('adminDashboard.cmsPanel.delBtn') }}</button>
            </div>
          </div>
        </div>
      </section>
      <section v-if="showSection('features')" class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">{{ t('adminDashboard.cmsPanel.featuresHeading') }}</h2>
        <form class="grid grid-cols-1 gap-2 sm:grid-cols-12" @submit.prevent="saveFeature">
          <input v-model="featureForm.title" type="text" required :placeholder="t('adminDashboard.cmsPanel.featureTitlePlaceholder')" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm sm:col-span-4" />
          <input v-model="featureForm.description" type="text" required :placeholder="t('adminDashboard.cmsPanel.featureDescPlaceholder')" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm sm:col-span-6" />
          <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white sm:col-span-2">{{ featureForm.id ? t('adminDashboard.cmsPanel.updateFeatureBtn') : t('adminDashboard.cmsPanel.addFeatureBtn') }}</button>
        </form>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div v-for="ft in features" :key="ft.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2.5 text-xs">
            <div class="pr-3 min-w-0">
              <p class="font-bold text-brand-900 truncate">{{ ft.title }}</p>
              <p class="text-slate-600 truncate">{{ ft.description }}</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button type="button" class="text-brand-600 font-semibold" @click="featureForm = { id: ft.id, title: ft.title, description: ft.description, icon: ft.icon || 'check', sortOrder: ft.sort_order }">{{ t('adminDashboard.cmsPanel.editBtn') }}</button>
              <button type="button" class="text-rose-600" @click="removeFeature(ft.id)">{{ t('adminDashboard.cmsPanel.delBtn') }}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
