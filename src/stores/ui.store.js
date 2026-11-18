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
  const prefillEmail = ref('');
  const cartItems = ref(JSON.parse(localStorage.getItem('meekoo_cart') || '[]'));
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

  const cartCount = computed(() => cartItems.value.length);
  const cartTotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + Number(item.price || 0), 0)
  );

  function addToast({ type = 'info', title = '', message = '' }) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    toasts.value.push({ id, type, title, message });
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function persistCart() {
    localStorage.setItem('meekoo_cart', JSON.stringify(cartItems.value));
  }

  function addToCart(course) {
    if (!cartItems.value.some((c) => c.id === course.id)) {
      cartItems.value.push({
        id: course.id,
        title: course.title,
        slug: course.slug,
        price: Number(course.price),
        currency: course.currency || 'USD',
        thumbnail_url: course.thumbnail_url,
        mentor_name: course.mentor_name
      });
      persistCart();
      return true;
    }
    return false;
  }

  function removeFromCart(courseId) {
    cartItems.value = cartItems.value.filter((c) => c.id !== courseId);
    persistCart();
  }

  function clearCart() {
    cartItems.value = [];
    persistCart();
  }

  function setPrefillEmail(email) {
    prefillEmail.value = email;
  }

  return {
    toasts,
    prefillEmail,
    cartItems,
    cartCount,
    cartTotal,
    theme,
    locale,
    isNight,
    addToast,
    removeToast,
    addToCart,
    removeFromCart,
    clearCart,
    setPrefillEmail,
    setTheme,
    toggleTheme,
    setLocale,
    initPreferences
  };
});
