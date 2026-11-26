import { computed, ref } from 'vue';
import { adminService } from '../services/admin.service.js';
import { extractApiError } from '../services/api.js';
import { optimizeImageForUpload } from '../services/imageOptimizer.service.js';
import { useLandingStore } from '../stores/landing.store.js';
import { useAsyncState } from './useAsyncState.js';
import { useToast } from './useToast.js';

export function useAdminPortal() {
  const landingStore = useLandingStore();
  const toast = useToast();
  const { loading, error, isOffline, run } = useAsyncState();

  const overviewStats = ref({
    totalUsers: 0,
    totalNews: 0,
    totalAgendas: 0,
    totalFaqs: 0,
    totalServices: 0,
    totalFeatures: 0
  });
  const users = ref([]);
  const settings = ref({});
  const faqs = ref([]);
  const stats = ref([]);
  const features = ref([]);
  const partners = ref([]);
  const news = ref([]);
  const agendas = ref([]);
  const categories = ref([]);
  const lecturers = ref([]);
  const syncing = ref(false);
  const lastSyncedAt = ref(null);

  const badgeCounts = computed(() => ({
    users: users.value.length || overviewStats.value.totalUsers || 0,
    news: news.value.length || overviewStats.value.totalNews || 0,
    agendas: agendas.value.length || overviewStats.value.totalAgendas || 0,
    faqs: faqs.value.length || overviewStats.value.totalFaqs || 0,
    stats: stats.value.length || 0,
    partners: partners.value.length || overviewStats.value.totalServices || 0,
    features: features.value.length || overviewStats.value.totalFeatures || 0,
    lecturers: lecturers.value.length || overviewStats.value.totalLecturers || 0
  }));

  async function loadAll() {
    await run(async () => {
      const [ovRes, uRes, sRes, fRes, stRes, ftRes, pRes, nRes, aRes, cRes, lRes] = await Promise.all([
        adminService.getOverview(),
        adminService.listUsers(),
        adminService.getSettings(),
        adminService.listFaqs(),
        adminService.listStats(),
        adminService.listFeatures(),
        adminService.listPartners(),
        adminService.listTestimonials(),
        adminService.listAgendas(),
        adminService.listNewsCategories(),
        adminService.listLecturers()
      ]);
      overviewStats.value = ovRes.stats;
      users.value = uRes.items;
      settings.value = sRes.settings;
      faqs.value = fRes.items;
      stats.value = stRes.items;
      features.value = ftRes.items;
      partners.value = pRes.items;
      news.value = nRes.items;
      agendas.value = aRes.items;
      categories.value = cRes.items;
      lecturers.value = lRes.items;
      lastSyncedAt.value = new Date();
    });
  }

  async function refreshOverviewAndLanding() {
    try {
      const ovRes = await adminService.getOverview();
      overviewStats.value = ovRes.stats;
      lastSyncedAt.value = new Date();
    } catch (err) {
      notifyRefreshFailure(err);
    }
    try {
      await landingStore.fetchLanding(true);
    } catch {
      toast.info('Perubahan tersimpan. Muat ulang halaman jika portal publik belum menampilkan pembaruan.');
    }
  }

  function notifyRefreshFailure(err) {
    toast.error(extractApiError(err));
  }

  async function withSync(action, successMessage) {
    syncing.value = true;
    try {
      const result = await action();
      landingStore.notifyLandingUpdated();
      if (successMessage) toast.success(successMessage);
      return result;
    } catch (err) {
      toast.error(extractApiError(err));
      throw err;
    } finally {
      syncing.value = false;
    }
  }

  async function saveSettingsPatch(patch, successMessage) {
    return withSync(async () => {
      const res = await adminService.updateSettings(patch);
      settings.value = res.settings;
      await refreshOverviewAndLanding();
      return res.settings;
    }, successMessage);
  }

  async function saveFaq(payload, successMessage) {
    return withSync(async () => {
      if (payload.id) await adminService.updateFaq(payload.id, payload);
      else await adminService.createFaq(payload);
      try {
        const res = await adminService.listFaqs();
        faqs.value = res.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function removeFaq(id, successMessage) {
    return withSync(async () => {
      await adminService.deleteFaq(id);
      try {
        const res = await adminService.listFaqs();
        faqs.value = res.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function saveStat(payload, successMessage) {
    return withSync(async () => {
      if (payload.id) await adminService.updateStat(payload.id, payload);
      else await adminService.createStat(payload);
      try {
        const res = await adminService.listStats();
        stats.value = res.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function removeStat(id, successMessage) {
    return withSync(async () => {
      await adminService.deleteStat(id);
      try {
        const res = await adminService.listStats();
        stats.value = res.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function savePartner(payload, successMessage) {
    return withSync(async () => {
      if (payload.id) await adminService.updatePartner(payload.id, payload);
      else await adminService.createPartner(payload);
      try {
        const res = await adminService.listPartners();
        partners.value = res.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function removePartner(id, successMessage) {
    return withSync(async () => {
      await adminService.deletePartner(id);
      try {
        const res = await adminService.listPartners();
        partners.value = res.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function saveFeature(payload, successMessage) {
    return withSync(async () => {
      if (payload.id) await adminService.updateFeature(payload.id, payload);
      else await adminService.createFeature(payload);
      try {
        const res = await adminService.listFeatures();
        features.value = res.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function removeFeature(id, successMessage) {
    return withSync(async () => {
      await adminService.deleteFeature(id);
      try {
        const res = await adminService.listFeatures();
        features.value = res.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function saveNews(payload, successMessage) {
    return withSync(async () => {
      if (payload.id) await adminService.updateTestimonial(payload.id, payload);
      else await adminService.createTestimonial(payload);
      try {
        const [nRes, cRes] = await Promise.all([
          adminService.listTestimonials(),
          adminService.listNewsCategories()
        ]);
        news.value = nRes.items;
        categories.value = cRes.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function removeNews(id, successMessage) {
    return withSync(async () => {
      await adminService.deleteTestimonial(id);
      try {
        const nRes = await adminService.listTestimonials();
        news.value = nRes.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function saveAgenda(payload, successMessage) {
    return withSync(async () => {
      if (payload.id) await adminService.updateAgenda(payload.id, payload);
      else await adminService.createAgenda(payload);
      try {
        const aRes = await adminService.listAgendas();
        agendas.value = aRes.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function removeAgenda(id, successMessage) {
    return withSync(async () => {
      await adminService.deleteAgenda(id);
      try {
        const aRes = await adminService.listAgendas();
        agendas.value = aRes.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function saveLecturer(payload, successMessage) {
    return withSync(async () => {
      if (payload.id) await adminService.updateLecturer(payload.id, payload);
      else await adminService.createLecturer(payload);
      try {
        const lRes = await adminService.listLecturers();
        lecturers.value = lRes.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function removeLecturer(id, successMessage) {
    return withSync(async () => {
      await adminService.deleteLecturer(id);
      try {
        const lRes = await adminService.listLecturers();
        lecturers.value = lRes.items;
      } catch (err) {
        notifyRefreshFailure(err);
      }
      await refreshOverviewAndLanding();
    }, successMessage);
  }

  async function addCategory(name, successMessage) {
    return withSync(async () => {
      const response = await adminService.createNewsCategory({ name });
      const cRes = await adminService.listNewsCategories();
      categories.value = cRes.items;
      return response.category;
    }, successMessage);
  }

  async function removeCategory(id, successMessage) {
    return withSync(async () => {
      await adminService.deleteNewsCategory(id);
      const cRes = await adminService.listNewsCategories();
      categories.value = cRes.items;
    }, successMessage);
  }

  async function updateUser(id, payload, successMessage) {
    return withSync(async () => {
      await adminService.updateUser(id, payload);
      const [uRes, ovRes] = await Promise.all([adminService.listUsers(), adminService.getOverview()]);
      users.value = uRes.items;
      overviewStats.value = ovRes.stats;
    }, successMessage);
  }

  async function uploadImage(file) {
    return withSync(async () => {
      const optimizedFile = await optimizeImageForUpload(file);
      const res = await adminService.uploadImage(optimizedFile);
      return res.url;
    });
  }

  return {
    loading,
    syncing,
    error,
    isOffline,
    lastSyncedAt,
    overviewStats,
    badgeCounts,
    users,
    settings,
    faqs,
    stats,
    features,
    partners,
    news,
    agendas,
    categories,
    lecturers,
    loadAll,
    saveSettingsPatch,
    saveFaq,
    removeFaq,
    saveStat,
    removeStat,
    savePartner,
    removePartner,
    saveFeature,
    removeFeature,
    saveNews,
    removeNews,
    saveAgenda,
    removeAgenda,
    saveLecturer,
    removeLecturer,
    addCategory,
    removeCategory,
    updateUser,
    uploadImage
  };
}
