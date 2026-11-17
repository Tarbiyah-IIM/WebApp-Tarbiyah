import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { configureApiAuth } from '../services/api.js';
import { authService } from '../services/auth.service.js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('meekoo_token') || '');
  const subscription = ref(null);
  const hydrated = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value && accessToken.value));
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isMentor = computed(() => user.value?.role === 'mentor');
  const isStudent = computed(() => user.value?.role === 'student');
  const hasActiveSubscription = computed(() => {
    if (!subscription.value) return false;
    return subscription.value.status === 'active' && new Date(subscription.value.ends_at) > new Date();
  });

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
    subscription.value = null;
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
        subscription.value = res.subscription || null;
      } else {
        const res = await authService.refresh();
        setSession(res);
        const me = await authService.getMe();
        subscription.value = me.subscription || null;
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
    const me = await authService.getMe();
    subscription.value = me.subscription || null;
    return res.user;
  }

  async function register(payload) {
    const res = await authService.register(payload);
    setSession(res);
    subscription.value = null;
    return res.user;
  }

  async function refreshProfile() {
    const me = await authService.getMe();
    user.value = me.user;
    subscription.value = me.subscription || null;
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
    subscription,
    hydrated,
    isAuthenticated,
    isAdmin,
    isMentor,
    isStudent,
    hasActiveSubscription,
    initSession,
    login,
    register,
    refreshProfile,
    logout,
    clearSession
  };
});
