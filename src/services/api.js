import axios from 'axios';
import { translations } from '../i18n/translations.js';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 15000
});

let getTokenFn = () => '';
let onTokenRefreshedFn = null;
let onUnauthorizedFn = null;
let onForbiddenFn = null;
let refreshPromise = null;

const REFRESH_LOCK_NAME = 'tarbiyah_refresh_lock';

async function runWithCrossTabLock(task) {
  if (typeof navigator === 'undefined' || !navigator.locks?.request) return task();
  return navigator.locks.request(REFRESH_LOCK_NAME, task);
}

export function configureApiAuth({ getToken, onTokenRefreshed, onUnauthorized, onForbidden }) {
  getTokenFn = getToken;
  onTokenRefreshedFn = onTokenRefreshed;
  onUnauthorizedFn = onUnauthorized;
  onForbiddenFn = onForbidden;
}

api.interceptors.request.use((config) => {
  const token = getTokenFn ? getTokenFn() : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = runWithCrossTabLock(() =>
            axios.post('/api/v1/auth/refresh', {}, { withCredentials: true, timeout: 15000 })
          ).finally(() => {
            refreshPromise = null;
          });
        }
        const refreshRes = await refreshPromise;
        const { accessToken, user } = refreshRes.data;
        if (onTokenRefreshedFn) {
          onTokenRefreshedFn({ accessToken, user });
        }
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        const refreshStatus = refreshError?.response?.status;
        if (onUnauthorizedFn && (refreshStatus === 401 || refreshStatus === 403)) {
          onUnauthorizedFn();
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403 && !originalRequest?.url?.includes('/auth/') && onForbiddenFn) {
      onForbiddenFn(originalRequest);
    }

    return Promise.reject(error);
  }
);

function apiErrorMessage(key, overrides = {}) {
  if (overrides[key]) return overrides[key];
  const lang = typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'id';
  return translations[lang]?.apiError?.[key] || translations.id.apiError[key];
}

export function extractApiError(error, messages = {}) {
  if (!error) return apiErrorMessage('unexpected', messages);
  if (!error.response) {
    return apiErrorMessage('network', messages);
  }
  const errObj = error.response.data?.error;
  if (errObj?.details?.length) {
    return `${errObj.message}: ${errObj.details.map((d) => d.message).join(', ')}`;
  }
  return errObj?.message || apiErrorMessage('requestFailed', messages);
}

export default api;
