import googleScholarLogo from '../assets/logos/google-scholar.webp';
import orcidLogo from '../assets/logos/orcid.webp';
import scopusLogo from '../assets/logos/scopus.webp';
import sintaLogo from '../assets/logos/sinta.png';
import wosLogo from '../assets/logos/web-of-science.webp';

export const TEACHING_STATUS_STYLES = {
  active: 'bg-emerald-600 text-white',
  study_leave: 'bg-amber-400 text-slate-900',
  inactive: 'bg-slate-200 text-slate-700'
};

export const ACADEMIC_INDEX_CONFIG = [
  {
    key: 'scholar_url',
    formKey: 'scholarUrl',
    labelKey: 'scholar',
    fieldKey: 'scholarUrl',
    placeholder: 'https://scholar.google.com/...',
    logo: googleScholarLogo,
    pillClass: 'border-slate-200 bg-[#ffffff] hover:border-sky-300 hover:shadow-sm'
  },
  {
    key: 'sinta_url',
    formKey: 'sintaUrl',
    labelKey: 'sinta',
    fieldKey: 'sintaUrl',
    placeholder: 'https://sinta.kemdikbud.go.id/...',
    logo: sintaLogo,
    pillClass: 'border-slate-200 bg-[#ffffff] hover:border-teal-300 hover:shadow-sm'
  },
  {
    key: 'orcid_url',
    formKey: 'orcidUrl',
    labelKey: 'orcid',
    fieldKey: 'orcidUrl',
    placeholder: 'https://orcid.org/...',
    logo: orcidLogo,
    pillClass: 'border-slate-200 bg-[#ffffff] hover:border-lime-300 hover:shadow-sm'
  },
  {
    key: 'scopus_url',
    formKey: 'scopusUrl',
    labelKey: 'scopus',
    fieldKey: 'scopusUrl',
    placeholder: 'https://www.scopus.com/...',
    logo: scopusLogo,
    pillClass: 'border-slate-200 bg-[#ffffff] hover:border-orange-300 hover:shadow-sm'
  },
  {
    key: 'wos_url',
    formKey: 'wosUrl',
    labelKey: 'wos',
    fieldKey: 'wosUrl',
    placeholder: 'https://www.webofscience.com/...',
    logo: wosLogo,
    pillClass: 'border-slate-200 bg-[#ffffff] hover:border-indigo-300 hover:shadow-sm'
  }
];

function parseSafeExternalUrl(rawValue) {
  if (typeof rawValue !== 'string') return '';
  const trimmed = rawValue.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}

export function formatRankAndGrade(lecturer) {
  const parts = [lecturer?.academic_rank, lecturer?.rank_grade]
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return parts.length ? parts.join(' | ') : '-';
}

export function extractLecturerIndexes(source) {
  return ACADEMIC_INDEX_CONFIG.reduce((items, cfg) => {
    const raw = source?.[cfg.key] ?? source?.[cfg.formKey];
    const url = parseSafeExternalUrl(raw);
    if (url) {
      items.push({ ...cfg, url });
    }
    return items;
  }, []);
}

const LEADING_TITLE_PATTERN = /^(?:(?:Prof\.?|Drs?\.?|Dra\.?|Ir\.?|K\.?H\.?|Hj\.?|H\.|Ust\.?|Ustadzah|Ustadz|Tgk\.?)\s+)+/i;
const TRAILING_DOTTED_DEGREE_PATTERN = /(?:\s+(?:Lc\.?|[A-Z]\.[A-Za-z.]+))+$/;

export function stripAcademicTitles(name) {
  const base = String(name || '').split(',')[0].trim();
  const stripped = base
    .replace(LEADING_TITLE_PATTERN, '')
    .replace(TRAILING_DOTTED_DEGREE_PATTERN, '')
    .trim();
  return stripped || base || String(name || '').trim();
}

export function getNameInitials(name) {
  const words = stripAcademicTitles(name).split(/\s+/).filter(Boolean);
  if (!words.length) return 'DT';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}
