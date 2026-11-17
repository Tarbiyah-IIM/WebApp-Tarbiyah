import { ref } from 'vue';
import { extractApiError } from '../services/api.js';

export function useAsyncState() {
  const loading = ref(false);
  const error = ref('');
  const isOffline = ref(false);

  async function run(task) {
    loading.value = true;
    error.value = '';
    isOffline.value = false;
    try {
      return await task();
    } catch (err) {
      isOffline.value = !err?.response;
      error.value = extractApiError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    isOffline,
    run
  };
}
