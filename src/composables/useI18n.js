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

const MONTH_PAIRS = [
  ['Januari', 'January'],
  ['Februari', 'February'],
  ['Maret', 'March'],
  ['April', 'April'],
  ['Mei', 'May'],
  ['Juni', 'June'],
  ['Juli', 'July'],
  ['Agustus', 'August'],
  ['September', 'September'],
  ['Oktober', 'October'],
  ['November', 'November'],
  ['Desember', 'December']
];

const ID_MONTHS_TO_EN = Object.fromEntries(MONTH_PAIRS.map(([idName, enName]) => [idName.toLowerCase(), enName]));
const ID_MONTH_NAMES = MONTH_PAIRS.map(([idName]) => idName);
const EN_MONTH_NAMES = MONTH_PAIRS.map(([, enName]) => enName);
const ID_MONTH_PATTERN = new RegExp(`\\b(${ID_MONTH_NAMES.join('|')})\\b`, 'gi');
const DATE_LIKE_PATTERN = new RegExp(`(\\d{1,2}\\s+)?(${ID_MONTH_NAMES.join('|')})\\s+(19|20)\\d{2}`, 'i');

function translateIndonesianMonthNames(text) {
  return text.replace(ID_MONTH_PATTERN, (match) => ID_MONTHS_TO_EN[match.toLowerCase()] || match);
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

  function formatDate(rawDate) {
    if (rawDate === null || rawDate === undefined) return '';
    const text = String(rawDate);
    const iso = text.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      const monthNames = ui.locale === 'en' ? EN_MONTH_NAMES : ID_MONTH_NAMES;
      const month = monthNames[Number(iso[2]) - 1];
      return month ? `${Number(iso[3])} ${month} ${iso[1]}` : text;
    }
    return ui.locale === 'en' ? translateIndonesianMonthNames(text) : text;
  }

  function tr(rawText) {
    if (rawText === null || rawText === undefined) return '';
    const text = String(rawText);
    if (ui.locale !== 'en') return text;
    const trimmed = text.trim();
    if (dynamicEn[trimmed]) return dynamicEn[trimmed];
    return DATE_LIKE_PATTERN.test(text) ? translateIndonesianMonthNames(text) : text;
  }

  function setLocale(nextLocale) {
    ui.setLocale(nextLocale);
  }

  return {
    locale,
    setLocale,
    t,
    tr,
    formatDate
  };
}
