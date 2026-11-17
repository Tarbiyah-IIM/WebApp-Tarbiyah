<script setup>
import { onMounted, ref } from 'vue';
import { adminService } from '../../services/admin.service.js';
import { extractApiError } from '../../services/api.js';
import { useLandingStore } from '../../stores/landing.store.js';
import { useToast } from '../../composables/useToast.js';

const landingStore = useLandingStore();
const toast = useToast();

const settings = ref({});
const loadingCms = ref(true);
const testimonials = ref([]);
const faqs = ref([]);
const stats = ref([]);
const features = ref([]);
const partners = ref([]);

const faqForm = ref({ id: null, question: '', answer: '', sortOrder: 0 });
const testForm = ref({ id: null, name: '', jobTitle: '', quote: '', rating: 5, isVisible: true, sortOrder: 0 });
const statForm = ref({ id: null, statGroup: 'hero', label: '', valueNum: '', suffix: '', sortOrder: 0 });
const featureForm = ref({ id: null, title: '', description: '', icon: 'check', sortOrder: 0 });
const partnerForm = ref({ id: null, name: '', url: '', sortOrder: 0 });

async function loadCms() {
  loadingCms.value = true;
  try {
    const [sRes, tRes, fRes, stRes, ftRes, pRes] = await Promise.all([
      adminService.getSettings(),
      adminService.listTestimonials(),
      adminService.listFaqs(),
      adminService.listStats(),
      adminService.listFeatures(),
      adminService.listPartners()
    ]);
    settings.value = sRes.settings;
    testimonials.value = tRes.items;
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
    toast.success('Site settings saved & landing page updated!');
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
    toast.success('FAQ saved & synced.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeFaq(id) {
  await adminService.deleteFaq(id);
  await syncLanding();
}

async function saveTestimonial() {
  try {
    if (testForm.value.id) await adminService.updateTestimonial(testForm.value.id, testForm.value);
    else await adminService.createTestimonial(testForm.value);
    testForm.value = { id: null, name: '', jobTitle: '', quote: '', rating: 5, isVisible: true, sortOrder: 0 };
    await syncLanding();
    toast.success('Testimonial saved & synced.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeTestimonial(id) {
  await adminService.deleteTestimonial(id);
  await syncLanding();
}

async function saveStat() {
  try {
    if (statForm.value.id) await adminService.updateStat(statForm.value.id, statForm.value);
    else await adminService.createStat(statForm.value);
    statForm.value = { id: null, statGroup: 'hero', label: '', valueNum: '', suffix: '', sortOrder: 0 };
    await syncLanding();
    toast.success('Statistic saved & synced.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeStat(id) {
  await adminService.deleteStat(id);
  await syncLanding();
}

async function savePartner() {
  try {
    if (partnerForm.value.id) await adminService.updatePartner(partnerForm.value.id, partnerForm.value);
    else await adminService.createPartner(partnerForm.value);
    partnerForm.value = { id: null, name: '', url: '', sortOrder: 0 };
    await syncLanding();
    toast.success('Partner saved & synced.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removePartner(id) {
  await adminService.deletePartner(id);
  await syncLanding();
}

async function saveFeature() {
  try {
    if (featureForm.value.id) await adminService.updateFeature(featureForm.value.id, featureForm.value);
    else await adminService.createFeature(featureForm.value);
    featureForm.value = { id: null, title: '', description: '', icon: 'check', sortOrder: 0 };
    await syncLanding();
    toast.success('Feature saved & synced.');
  } catch (err) {
    toast.error(extractApiError(err));
  }
}

async function removeFeature(id) {
  await adminService.deleteFeature(id);
  await syncLanding();
}

onMounted(loadCms);
</script>

<template>
  <div v-if="loadingCms" class="rounded-2xl border border-surface-border bg-white p-8 text-sm text-slate-500">
    Loading CMS content...
  </div>
  <div v-else class="space-y-8">
    <form class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4" @submit.prevent="saveSettings">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-extrabold text-brand-900">Hero, Pricing & Contact Settings</h2>
        <button type="submit" class="min-h-[42px] rounded-xl bg-brand-600 px-5 text-xs font-bold text-white hover:bg-brand-700">
          Save & Sync Landing
        </button>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label for="cms-hero-badge" class="block text-xs font-bold uppercase text-slate-500 mb-1">Hero Badge</label>
          <input id="cms-hero-badge" v-model="settings.hero_badge" type="text" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div>
          <label for="cms-premium-price" class="block text-xs font-bold uppercase text-slate-500 mb-1">Premium Price (USD)</label>
          <input id="cms-premium-price" v-model="settings.premium_price" type="text" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div class="sm:col-span-2">
          <label for="cms-hero-title" class="block text-xs font-bold uppercase text-slate-500 mb-1">Hero Title</label>
          <input id="cms-hero-title" v-model="settings.hero_title" type="text" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Hero Subtitle</label>
          <textarea v-model="settings.hero_subtitle" rows="2" class="w-full rounded-xl border border-surface-border p-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Contact Email</label>
          <input v-model="settings.contact_email" type="email" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Footer CTA Title</label>
          <input v-model="settings.footer_cta_title" type="text" class="min-h-[42px] w-full rounded-xl border border-surface-border px-3 text-sm" />
        </div>
      </div>
    </form>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">Statistics (Hero & Journey)</h2>
        <form class="grid grid-cols-2 gap-2" @submit.prevent="saveStat">
          <select v-model="statForm.statGroup" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm">
            <option value="hero">Hero Strip</option>
            <option value="journey">Journey Excellence</option>
          </select>
          <input v-model="statForm.label" type="text" required placeholder="Label" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="statForm.valueNum" type="text" required placeholder="Value (e.g. 100 or 20k)" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          <div class="flex gap-2">
            <input v-model="statForm.suffix" type="text" placeholder="Suffix (+ / %)" class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
            <button type="submit" class="rounded-xl bg-brand-600 px-3 text-xs font-bold text-white">Save</button>
          </div>
        </form>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="st in stats" :key="st.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-xs">
            <span><strong>[{{ st.stat_group }}]</strong> {{ st.value_num }}{{ st.suffix }} — {{ st.label }}</span>
            <div class="flex gap-2">
              <button type="button" class="text-brand-600 font-semibold" @click="statForm = { id: st.id, statGroup: st.stat_group, label: st.label, valueNum: st.value_num, suffix: st.suffix, sortOrder: st.sort_order }">Edit</button>
              <button type="button" class="text-rose-600" @click="removeStat(st.id)">Del</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">Trusted Partners</h2>
        <form class="flex gap-2" @submit.prevent="savePartner">
          <input v-model="partnerForm.name" type="text" required placeholder="Partner Name" class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
          <input v-model="partnerForm.url" type="url" placeholder="https://..." class="min-h-[40px] flex-1 rounded-xl border border-surface-border px-3 text-sm" />
          <button type="submit" class="rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">Save</button>
        </form>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="p in partners" :key="p.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-xs">
            <span class="font-bold text-brand-900">{{ p.name }}</span>
            <div class="flex gap-2">
              <button type="button" class="text-brand-600 font-semibold" @click="partnerForm = { id: p.id, name: p.name, url: p.url || '', sortOrder: p.sort_order }">Edit</button>
              <button type="button" class="text-rose-600" @click="removePartner(p.id)">Del</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">Testimonials</h2>
        <form class="space-y-2" @submit.prevent="saveTestimonial">
          <div class="grid grid-cols-2 gap-2">
            <input v-model="testForm.name" type="text" required placeholder="Learner Name" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
            <input v-model="testForm.jobTitle" type="text" required placeholder="Job Title" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm" />
          </div>
          <textarea v-model="testForm.quote" rows="2" required placeholder="Quote" class="w-full rounded-xl border border-surface-border p-2.5 text-sm" />
          <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">
            {{ testForm.id ? 'Update Testimonial' : 'Add Testimonial' }}
          </button>
        </form>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="t in testimonials" :key="t.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-xs">
            <span class="truncate pr-3"><strong>{{ t.name }}</strong>: "{{ t.quote }}"</span>
            <div class="flex gap-2 shrink-0">
              <button type="button" class="text-brand-600 font-semibold" @click="testForm = { id: t.id, name: t.name, jobTitle: t.job_title, quote: t.quote, rating: t.rating, isVisible: Boolean(t.is_visible), sortOrder: t.sort_order }">Edit</button>
              <button type="button" class="text-rose-600" @click="removeTestimonial(t.id)">Del</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
        <h2 class="text-lg font-extrabold text-brand-900">FAQs</h2>
        <form class="space-y-2" @submit.prevent="saveFaq">
          <input v-model="faqForm.question" type="text" required placeholder="Question" class="min-h-[40px] w-full rounded-xl border border-surface-border px-3 text-sm" />
          <textarea v-model="faqForm.answer" rows="2" required placeholder="Answer" class="w-full rounded-xl border border-surface-border p-2.5 text-sm" />
          <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white">
            {{ faqForm.id ? 'Update FAQ' : 'Add FAQ' }}
          </button>
        </form>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="f in faqs" :key="f.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2 text-xs">
            <span class="truncate pr-3 font-semibold text-brand-900">{{ f.question }}</span>
            <div class="flex gap-2 shrink-0">
              <button type="button" class="text-brand-600 font-semibold" @click="faqForm = { id: f.id, question: f.question, answer: f.answer, sortOrder: f.sort_order }">Edit</button>
              <button type="button" class="text-rose-600" @click="removeFaq(f.id)">Del</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section class="rounded-2xl border border-surface-border bg-white p-6 shadow-card space-y-4">
      <h2 class="text-lg font-extrabold text-brand-900">Powerful Features Section</h2>
      <form class="grid grid-cols-1 gap-2 sm:grid-cols-12" @submit.prevent="saveFeature">
        <input v-model="featureForm.title" type="text" required placeholder="Feature Title" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm sm:col-span-4" />
        <input v-model="featureForm.description" type="text" required placeholder="Feature Description" class="min-h-[40px] rounded-xl border border-surface-border px-3 text-sm sm:col-span-6" />
        <button type="submit" class="min-h-[40px] rounded-xl bg-brand-600 px-4 text-xs font-bold text-white sm:col-span-2">
          {{ featureForm.id ? 'Update Feature' : 'Add Feature' }}
        </button>
      </form>
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div v-for="ft in features" :key="ft.id" class="flex items-center justify-between rounded-xl bg-surface-page px-3 py-2.5 text-xs">
          <div class="pr-3 min-w-0">
            <p class="font-bold text-brand-900 truncate">{{ ft.title }}</p>
            <p class="text-slate-600 truncate">{{ ft.description }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button type="button" class="text-brand-600 font-semibold" @click="featureForm = { id: ft.id, title: ft.title, description: ft.description, icon: ft.icon || 'check', sortOrder: ft.sort_order }">Edit</button>
            <button type="button" class="text-rose-600" @click="removeFeature(ft.id)">Del</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
