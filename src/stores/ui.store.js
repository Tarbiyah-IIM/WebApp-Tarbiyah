import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const THEME_STORAGE_KEY = 'tarbiyah_theme';
const LOCALE_STORAGE_KEY = 'tarbiyah_locale';

function normalizeTheme(value) {
  return value === 'night' ? 'night' : 'light';
}

function normalizeLocale(value) {
  return value === 'en' ? 'en' : 'id';
}

function readStoredValue(key, normalizer, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    return normalizer(window.localStorage.getItem(key));
  } catch {
    return fallback;
  }
}

function applyThemeToDom(nextTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = nextTheme;
  root.classList.toggle('dark', nextTheme === 'night');
}

function applyLocaleToDom(nextLocale) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = nextLocale;
}

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([]);
  const theme = ref(readStoredValue(THEME_STORAGE_KEY, normalizeTheme, 'light'));
  const locale = ref(readStoredValue(LOCALE_STORAGE_KEY, normalizeLocale, 'id'));
  const isNight = computed(() => theme.value === 'night');

  function setTheme(nextTheme) {
    const normalized = normalizeTheme(nextTheme);
    theme.value = normalized;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
      } catch {}
    }
    applyThemeToDom(normalized);
  }

  function toggleTheme() {
    setTheme(theme.value === 'night' ? 'light' : 'night');
  }

  function setLocale(nextLocale) {
    const normalized = normalizeLocale(nextLocale);
    locale.value = normalized;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
      } catch {}
    }
    applyLocaleToDom(normalized);
  }

  function initPreferences() {
    theme.value = readStoredValue(THEME_STORAGE_KEY, normalizeTheme, theme.value);
    locale.value = readStoredValue(LOCALE_STORAGE_KEY, normalizeLocale, locale.value);
    applyThemeToDom(theme.value);
    applyLocaleToDom(locale.value);
  }

  function addToast({ type = 'info', title = '', message, duration = 4200 }) {
    const duplicate = toasts.value.some((item) => item.type === type && item.message === message);
    if (duplicate) return;
    while (toasts.value.length >= 5) {
      toasts.value.shift();
    }
    const id = Date.now() + Math.random();
    toasts.value.push({ id, type, title, message });
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts,
    theme,
    locale,
    isNight,
    addToast,
    removeToast,
    setTheme,
    toggleTheme,
    setLocale,
    initPreferences
  };
});
