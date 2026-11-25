import { computed } from 'vue';
import { useUiStore } from '../stores/ui.store';
import { dynamicEn, translations } from '../i18n/translations';

function resolvePath(source, path) {
  if (!source || !path) return undefined;
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, source);
}

const ID_MONTHS_TO_EN = {
  januari: 'January',
  februari: 'February',
  maret: 'March',
  april: 'April',
  mei: 'May',
  juni: 'June',
  juli: 'July',
  agustus: 'August',
  september: 'September',
  oktober: 'October',
  november: 'November',
  desember: 'December'
};

function translateIndonesianDateText(text) {
  return text.replace(
    /\b(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b/gi,
    (match) => ID_MONTHS_TO_EN[match.toLowerCase()] || match
  );
}

export function useI18n() {
  const ui = useUiStore();
  const locale = computed(() => ui.locale);

  function t(key, fallback = '') {
    const active = resolvePath(translations[ui.locale], key);
    if (active !== undefined) return active;
    const base = resolvePath(translations.id, key);
    if (base !== undefined) return base;
    return fallback || key;
  }

  function tr(rawText) {
    if (rawText === null || rawText === undefined) return '';
    const text = String(rawText);
    if (ui.locale !== 'en') return text;
    const trimmed = text.trim();
    if (dynamicEn[trimmed]) return dynamicEn[trimmed];
    return translateIndonesianDateText(text);
  }

  function setLocale(nextLocale) {
    ui.setLocale(nextLocale);
  }

  return {
    locale,
    setLocale,
    t,
    tr
  };
}
