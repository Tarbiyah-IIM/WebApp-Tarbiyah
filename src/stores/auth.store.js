import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { configureApiAuth } from '../services/api.js';
import { authService } from '../services/auth.service.js';

const SESSION_HINT_KEY = 'tarbiyah_has_session';
const LEGACY_TOKEN_KEY = 'tarbiyah_token';

function readSessionHint() {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    return window.localStorage.getItem(SESSION_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSessionHint(active) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    if (active) {
      window.localStorage.setItem(SESSION_HINT_KEY, '1');
    } else {
      window.localStorage.removeItem(SESSION_HINT_KEY);
    }
  } catch {}
}

let unauthorizedRedirectFn = null;

export function registerUnauthorizedRedirect(fn) {
  unauthorizedRedirectFn = typeof fn === 'function' ? fn : null;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const accessToken = ref('');
  const hydrated = ref(false);
  const checkedCookieRefresh = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value && accessToken.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setSession({ accessToken: token, user: nextUser }) {
    accessToken.value = token || '';
    user.value = nextUser || null;
    writeSessionHint(Boolean(token));
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
      unauthorizedRedirectFn?.();
    }
  });

  async function initSession({ forceRefreshCheck = false } = {}) {
    if (hydrated.value && (!forceRefreshCheck || checkedCookieRefresh.value)) return;
    try {
      if (accessToken.value) {
        const res = await authService.getMe();
        user.value = res.user;
      } else if (forceRefreshCheck || readSessionHint()) {
        checkedCookieRefresh.value = true;
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
