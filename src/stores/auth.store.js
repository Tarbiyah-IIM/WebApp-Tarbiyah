import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { configureApiAuth } from '../services/api.js';
import { authService } from '../services/auth.service.js';

const SESSION_HINT_KEY = 'tarbiyah_has_session';
const LEGACY_TOKEN_KEY = 'tarbiyah_token';
const LOGOUT_CHANNEL_NAME = 'tarbiyah_auth_sync';

let logoutChannel = null;

function getLogoutChannel() {
  if (typeof window === 'undefined' || typeof window.BroadcastChannel !== 'function') return null;
  if (!logoutChannel) {
    logoutChannel = new window.BroadcastChannel(LOGOUT_CHANNEL_NAME);
  }
  return logoutChannel;
}

function broadcastLogout() {
  try {
    getLogoutChannel()?.postMessage({ type: 'logout', at: Date.now() });
  } catch {}
}

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
  let initPromise = null;

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
    },
    onForbidden: async (requestConfig) => {
      if (!requestConfig?.url?.includes('/admin') || !accessToken.value) return;
      try {
        await refreshProfile();
      } catch {
        clearSession();
      }
      unauthorizedRedirectFn?.();
    }
  });

  async function initSession({ forceRefreshCheck = false } = {}) {
    if (hydrated.value && (!forceRefreshCheck || checkedCookieRefresh.value)) return;
    if (initPromise) {
      await initPromise;
      if (!forceRefreshCheck || checkedCookieRefresh.value || accessToken.value) return;
    }
    initPromise = (async () => {
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
        initPromise = null;
      }
    })();
    return initPromise;
  }

  async function login(payload) {
    const res = await authService.login(payload);
    setSession(res);
    try {
      await authService.getMe();
    } catch (err) {
      clearSession();
      throw err;
    }
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
    } catch {
    } finally {
      clearSession();
      broadcastLogout();
    }
  }

  function syncLogoutAcrossTabs() {
    if (typeof window === 'undefined') return () => {};
    const channel = getLogoutChannel();
    const onMessage = (event) => {
      if (event?.data?.type !== 'logout') return;
      clearSession();
      unauthorizedRedirectFn?.();
    };
    const onStorage = (event) => {
      if (event.key !== SESSION_HINT_KEY || event.newValue === '1') return;
      clearSession();
      unauthorizedRedirectFn?.();
    };
    channel?.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);
    return () => {
      channel?.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
    };
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
    syncLogoutAcrossTabs,
    clearSession
  };
});
