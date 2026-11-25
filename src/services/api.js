import axios from 'axios';

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
          refreshPromise = axios
            .post('/api/v1/auth/refresh', {}, { withCredentials: true, timeout: 15000 })
            .finally(() => {
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
        if (onUnauthorizedFn) {
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

export function extractApiError(error) {
  if (!error) return 'Terjadi kesalahan tidak terduga.';
  if (!error.response) {
    return 'Koneksi ke server terputus. Periksa jaringan Anda lalu coba lagi.';
  }
  const errObj = error.response.data?.error;
  if (errObj?.details?.length) {
    return `${errObj.message}: ${errObj.details.map((d) => d.message).join(', ')}`;
  }
  return errObj?.message || 'Permintaan gagal diproses.';
}

export default api;
