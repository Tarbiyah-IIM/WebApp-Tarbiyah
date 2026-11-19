import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { configureApiAuth } from '../services/api.js';
import { authService } from '../services/auth.service.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('meekoo_token') || '');
  const hydrated = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value && accessToken.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setSession({ accessToken: token, user: nextUser }) {
    accessToken.value = token || '';
    user.value = nextUser || null;
    if (token) {
      localStorage.setItem('meekoo_token', token);
    } else {
      localStorage.removeItem('meekoo_token');
    }
  }

  function clearSession() {
    setSession({ accessToken: '', user: null });
  }

  configureApiAuth({
    getToken: () => accessToken.value,
    onTokenRefreshed: ({ accessToken: token, user: nextUser }) => {
      setSession({ accessToken: token, user: nextUser });
    },
    onUnauthorized: () => {
      clearSession();
    }
  });

  async function initSession() {
    if (hydrated.value) return;
    try {
      if (accessToken.value) {
        const res = await authService.getMe();
        user.value = res.user;
      } else {
        const res = await authService.refresh();
        setSession(res);
        await authService.getMe();
      }
    } catch {
      clearSession();
    } finally {
      hydrated.value = true;
    }
  }

  async function login(payload) {
    const res = await authService.login(payload);
    setSession(res);
    await authService.getMe();
    return res.user;
  }

  async function refreshProfile() {
    const me = await authService.getMe();
    user.value = me.user;
    return me;
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }

  return {
    user,
    accessToken,
    hydrated,
    isAuthenticated,
    isAdmin,
    initSession,
    login,
    refreshProfile,
    logout,
    clearSession
  };
});
