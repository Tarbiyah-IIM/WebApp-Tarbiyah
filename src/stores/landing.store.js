import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { publicService } from '../services/public.service.js';

const LANDING_UPDATED_CHANNEL = 'tarbiyah_landing_updated';
const SYNC_CHANNEL_NAME = 'tarbiyah_cms_sync';

let inflightRequest = null;
let broadcastChannel = null;

function getBroadcastChannel() {
  if (typeof window === 'undefined' || typeof window.BroadcastChannel !== 'function') return null;
  if (!broadcastChannel) {
    broadcastChannel = new window.BroadcastChannel(SYNC_CHANNEL_NAME);
  }
  return broadcastChannel;
}

export const useLandingStore = defineStore('landing', () => {
  const data = ref(null);
  const loading = ref(false);
  const error = ref('');
  const loaded = computed(() => Boolean(data.value));

  async function fetchLanding(force = false) {
    if (data.value && !force) return data.value;
    if (inflightRequest) return inflightRequest;

    loading.value = true;
    error.value = '';
    inflightRequest = publicService
      .getLanding()
      .then((payload) => {
        data.value = payload;
        return payload;
      })
      .catch((err) => {
        error.value = err?.response?.data?.error?.message || 'Gagal memuat data beranda';
        throw err;
      })
      .finally(() => {
        loading.value = false;
        inflightRequest = null;
      });

    return inflightRequest;
  }

  function clearError() {
    error.value = '';
  }

  function notifyLandingUpdated() {
    try {
      getBroadcastChannel()?.postMessage({ type: LANDING_UPDATED_CHANNEL, at: Date.now() });
    } catch (err) {
      console.warn('[landing] sinkronisasi CMS lintas-tab gagal', err?.message || err);
    }
  }

  function listenForLandingUpdates() {
    if (typeof window === 'undefined') return () => {};
    const channel = getBroadcastChannel();
    if (!channel) return () => {};
    const onMessage = (event) => {
      if (event?.data?.type !== LANDING_UPDATED_CHANNEL) return;
      fetchLanding(true).catch(() => {});
    };
    channel.addEventListener('message', onMessage);
    return () => channel.removeEventListener('message', onMessage);
  }

  return {
    data,
    loading,
    error,
    loaded,
    fetchLanding,
    clearError,
    notifyLandingUpdated,
    listenForLandingUpdates
  };
});
