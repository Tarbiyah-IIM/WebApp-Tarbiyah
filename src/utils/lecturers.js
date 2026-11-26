export const TEACHING_STATUS_STYLES = {
  active: 'bg-emerald-600 text-white',
  study_leave: 'bg-amber-400 text-slate-900',
  inactive: 'bg-slate-200 text-slate-700'
};

export const ACADEMIC_INDEX_CONFIG = [
  { key: 'scholar_url', labelKey: 'scholar', pillClass: 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100' },
  { key: 'orcid_url', labelKey: 'orcid', pillClass: 'border-lime-200 bg-lime-50 text-lime-800 hover:bg-lime-100' },
  { key: 'scopus_url', labelKey: 'scopus', pillClass: 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100' },
  { key: 'sinta_url', labelKey: 'sinta', pillClass: 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100' },
  { key: 'wos_url', labelKey: 'wos', pillClass: 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100' }
];

export function formatRankAndGrade(lecturer) {
  const parts = [lecturer?.academic_rank, lecturer?.rank_grade]
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return parts.length ? parts.join(' | ') : '-';
}

export function extractLecturerIndexes(lecturer) {
  return ACADEMIC_INDEX_CONFIG.filter((cfg) => {
    const val = lecturer?.[cfg.key];
    return typeof val === 'string' && val.trim().length > 0;
  }).map((cfg) => ({
    ...cfg,
    url: lecturer[cfg.key].trim()
  }));
}

export function getNameInitials(name) {
  const words = String(name || '')
    .trim()
    .replace(/^(Prof\.?|Dr\.?|H\.?|Hj\.?)\s+/gi, '')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return 'DT';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}
