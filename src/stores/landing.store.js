import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { publicService } from '../services/public.service.js';

export const useLandingStore = defineStore('landing', () => {
  const data = ref(null);
  const loading = ref(false);
  const error = ref('');
  const loaded = computed(() => Boolean(data.value));

  async function fetchLanding(force = false) {
    if (data.value && !force) return data.value;
    loading.value = true;
    error.value = '';
    try {
      data.value = await publicService.getLanding();
      return data.value;
    } catch (err) {
      error.value = err?.response?.data?.error?.message || 'Gagal memuat data beranda';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    data,
    loading,
    error,
    loaded,
    fetchLanding
  };
});
