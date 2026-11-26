import { computed } from 'vue';
import { useLandingStore } from '../stores/landing.store.js';
import { useUiStore } from '../stores/ui.store.js';

export const DEFAULT_NAV_LINKS = {
  activeLetter: 'https://baau.iim.ac.id/index.php/layanan/surat-aktif-kuliah/',
  calendar: '',
  curriculum: '',
  munaqasyah: 'https://www.myskripsi.iimsurakarta.ac.id/myskripsi/dashboard/',
  research: '',
  rplGuide: 'https://drive.google.com/drive/folders/1knidvsDcia_CmXB4wfi81Xrr9RPImn7l?usp=sharing',
  rplRegulations: '',
  rplDecree: ''
};

export const DEFAULT_CONTACTS = {
  waPmbUrl: 'https://wa.link/agu1p5',
  waAdminUrl: 'https://wa.link/qrwv15',
  campusBuilding: '',
  addressText: '',
  phoneText: '',
  mapsEmbedUrl: 'https://www.google.com/maps?q=-7.584322,110.81806&z=17&hl=id&output=embed',
  guestLectureUrl: 'https://script.google.com/macros/s/AKfycbwjx4f_R-H4MXwGpjMyI8X-BpGKASOTfkuwqMWp1JkjcvPRYyhiI9C00gMQTp351LHo/exec'
};

export function safeParseCmsJson(raw, fallback) {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function sanitizePortalUrl(value, fallback = '') {
  if (typeof value !== 'string' || /[\r\n\t]/.test(value)) return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes('\\')) return fallback;
  if (trimmed.startsWith('/')) {
    return trimmed.startsWith('//') ? fallback : trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function sanitizeMapsEmbedUrl(value, fallback) {
  const safe = sanitizePortalUrl(value, '');
  if (!safe) return fallback;
  try {
    const parsed = new URL(safe);
    if (parsed.protocol !== 'https:') return fallback;
    if (parsed.hostname === 'maps.google.com') return safe;
    if (parsed.hostname === 'www.google.com' && (parsed.pathname === '/maps' || parsed.pathname.startsWith('/maps/'))) {
      return safe;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function sanitizeAppsScriptUrl(value, fallback) {
  const safe = sanitizePortalUrl(value, '');
  if (!safe) return fallback;
  try {
    const parsed = new URL(safe);
    return parsed.protocol === 'https:' && parsed.hostname === 'script.google.com' ? safe : fallback;
  } catch {
    return fallback;
  }
}

function nonEmptyString(value, fallback) {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

function nonEmptyArray(value, fallback) {
  if (Array.isArray(value) && value.length > 0) return value;
  return fallback;
}

export function usePortalContent() {
  const landingStore = useLandingStore();
  const uiStore = useUiStore();
  const settings = computed(() => landingStore.data?.settings || {});

  const FUNCTIONAL_OVERRIDE_KEYS = ['primaryCta', 'secondaryCta', 'sidebarAction'];

  function withRootFunctionalFallback(rawObj, localeOverride) {
    const mergedEntry = { ...rawObj, ...localeOverride };
    for (const key of FUNCTIONAL_OVERRIDE_KEYS) {
      const rootValue = rawObj?.[key];
      const localeValue = localeOverride?.[key];
      if (rootValue && typeof rootValue === 'object') {
        mergedEntry[key] = { ...rootValue, ...(localeValue && typeof localeValue === 'object' ? localeValue : {}) };
      }
    }
    if (!Array.isArray(localeOverride?.highlights) && Array.isArray(rawObj?.highlights)) {
      mergedEntry.highlights = rawObj.highlights;
    }
    if (!Array.isArray(localeOverride?.customOtherLinks) && Array.isArray(rawObj?.customOtherLinks)) {
      mergedEntry.customOtherLinks = rawObj.customOtherLinks;
    }
    return mergedEntry;
  }

  function pickLocaleOverride(rawObj) {
    if (!rawObj || typeof rawObj !== 'object') return null;
    const activeLocale = uiStore.locale === 'en' ? 'en' : 'id';
    if (rawObj.locales && typeof rawObj.locales === 'object' && rawObj.locales[activeLocale]) {
      return withRootFunctionalFallback(rawObj, rawObj.locales[activeLocale]);
    }
    return activeLocale === 'id' ? rawObj : null;
  }

  function resolveOverrideCta(localeCta, baseCta) {
    if (!localeCta || typeof localeCta !== 'object') return null;
    if (localeCta.enabled === false) return null;
    const label = typeof localeCta.label === 'string' ? localeCta.label.trim() : '';
    const href = sanitizePortalUrl(localeCta.href, '');
    if (!label || !href) {
      return Object.keys(localeCta).length ? null : baseCta ? { ...baseCta } : null;
    }
    return { ...(baseCta || {}), label, href };
  }

  const navLinks = computed(() => {
    const override = safeParseCmsJson(settings.value.cms_nav_links, {});
    const resolved = {};
    for (const [key, fallback] of Object.entries(DEFAULT_NAV_LINKS)) {
      const raw = override[key];
      resolved[key] = raw === undefined ? fallback : sanitizePortalUrl(String(raw), '');
    }
    return resolved;
  });

  const contacts = computed(() => {
    const override = safeParseCmsJson(settings.value.cms_contacts, {});
    return {
      waPmbUrl: sanitizePortalUrl(override.waPmbUrl, DEFAULT_CONTACTS.waPmbUrl),
      waAdminUrl: sanitizePortalUrl(override.waAdminUrl, DEFAULT_CONTACTS.waAdminUrl),
      campusBuilding: nonEmptyString(override.campusBuilding, ''),
      addressText: nonEmptyString(override.addressText, ''),
      phoneText: nonEmptyString(override.phoneText, ''),
      mapsEmbedUrl: sanitizeMapsEmbedUrl(override.mapsEmbedUrl, DEFAULT_CONTACTS.mapsEmbedUrl),
      guestLectureUrl: sanitizeAppsScriptUrl(override.guestLectureUrl, DEFAULT_CONTACTS.guestLectureUrl)
    };
  });

  const profileOverride = computed(() => safeParseCmsJson(settings.value.cms_profile, {}));
  const programsOverride = computed(() => safeParseCmsJson(settings.value.cms_programs, {}));
  const infoPagesOverride = computed(() => safeParseCmsJson(settings.value.cms_info_pages, {}));

  function mergeProfile(defaultProfile) {
    const rawOv = profileOverride.value || {};
    const ov = pickLocaleOverride(rawOv) || {};
    const missions = Array.isArray(ov.missions)
      ? ov.missions.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    return {
      visionText: nonEmptyString(ov.visionText, defaultProfile.visionText),
      missions: missions.length ? missions : defaultProfile.missions,
      structureImageUrl: sanitizePortalUrl(
        rawOv.structureImageUrl || ov.structureImageUrl,
        defaultProfile.structureImageUrl
      )
    };
  }

  function mergeProgramCard(card) {
    const rawOv = programsOverride.value[card.id];
    const ov = pickLocaleOverride(rawOv);
    if (!ov || typeof ov !== 'object') {
      if (rawOv?.pmbUrl) {
        return { ...card, pmbUrl: sanitizePortalUrl(rawOv.pmbUrl, card.pmbUrl) };
      }
      return card;
    }
    return {
      ...card,
      badge: nonEmptyString(ov.badge, card.badge),
      title: nonEmptyString(ov.title, card.title),
      description: nonEmptyString(ov.description, card.description),
      pmbUrl: sanitizePortalUrl(ov.pmbUrl || rawOv?.pmbUrl, card.pmbUrl)
    };
  }

  function mergeProgramDetail(slug, detail) {
    if (!detail) return null;
    const rawOv = programsOverride.value[slug];
    const ov = pickLocaleOverride(rawOv);
    if (!ov || typeof ov !== 'object') {
      if (rawOv?.accreditationUrl !== undefined) {
        return {
          ...detail,
          accreditationUrl: sanitizePortalUrl(rawOv.accreditationUrl, detail.accreditationUrl || '')
        };
      }
      return detail;
    }
    const highlights = Array.isArray(ov.highlights)
      ? ov.highlights.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const careers = Array.isArray(ov.careers)
      ? ov.careers.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const accreditationUrl =
      ov.accreditationUrl !== undefined
        ? sanitizePortalUrl(ov.accreditationUrl, '')
        : rawOv?.accreditationUrl !== undefined
          ? sanitizePortalUrl(rawOv.accreditationUrl, '')
          : detail.accreditationUrl || '';
    return {
      ...detail,
      degree: nonEmptyString(ov.degree, detail.degree),
      studyMode: nonEmptyString(ov.studyMode, detail.studyMode),
      overview: nonEmptyString(ov.overview, detail.overview),
      accreditationUrl,
      highlights: highlights.length ? highlights : detail.highlights,
      careers: careers.length ? careers : detail.careers
    };
  }

  function hydrateSummaryBlocks(blocks) {
    if (!Array.isArray(blocks)) return blocks;
    const activeWaAdminUrl = contacts.value.waAdminUrl;
    return blocks.map((block) => {
      if (!Array.isArray(block?.segments)) return block;
      return {
        ...block,
        segments: block.segments.map((seg) => {
          if (seg?.href && seg.href.includes('wa.link/')) {
            return { ...seg, href: activeWaAdminUrl };
          }
          return seg;
        })
      };
    });
  }

  function mergeInfoPage(pageKey, basePage) {
    if (!basePage) return null;
    const rawOv = infoPagesOverride.value[pageKey];
    const ov = pickLocaleOverride(rawOv);
    if (!ov || typeof ov !== 'object') {
      return basePage.summaryBlocks
        ? { ...basePage, summaryBlocks: hydrateSummaryBlocks(basePage.summaryBlocks) }
        : basePage;
    }

    const merged = {
      ...basePage,
      title: nonEmptyString(ov.title, basePage.title),
      badge: nonEmptyString(ov.badge, basePage.badge)
    };

    if (typeof ov.summary === 'string' && ov.summary.trim()) {
      merged.summary = ov.summary.trim();
      if (merged.summaryBlocks) {
        merged.summaryBlocks = null;
      }
    } else if (merged.summaryBlocks) {
      merged.summaryBlocks = hydrateSummaryBlocks(merged.summaryBlocks);
    }

    if (ov.primaryCta && typeof ov.primaryCta === 'object') {
      merged.primaryCta = resolveOverrideCta(ov.primaryCta, basePage.primaryCta);
    }

    if (ov.secondaryCta && typeof ov.secondaryCta === 'object') {
      merged.secondaryCta = resolveOverrideCta(ov.secondaryCta, basePage.secondaryCta);
    }

    if (ov.sidebarAction && typeof ov.sidebarAction === 'object' && basePage.sidebarAction) {
      const sidebarHref = sanitizePortalUrl(ov.sidebarAction.href, '');
      merged.sidebarAction =
        ov.sidebarAction.enabled === false || !sidebarHref
          ? null
          : {
              ...basePage.sidebarAction,
              title: nonEmptyString(ov.sidebarAction.title, basePage.sidebarAction.title),
              buttonLabel: nonEmptyString(ov.sidebarAction.buttonLabel, basePage.sidebarAction.buttonLabel),
              badge: nonEmptyString(ov.sidebarAction.badge, basePage.sidebarAction.badge),
              href: sidebarHref
            };
    }

    if (Array.isArray(ov.highlights) && ov.highlights.length > 0) {
      merged.highlights = ov.highlights
        .filter((item) => item && nonEmptyString(item.title, ''))
        .map((item) => ({
          title: item.title.trim(),
          desc: String(item.desc || '').trim(),
          href: sanitizePortalUrl(item.href, ''),
          icon: item.icon || undefined
        }));
    }

    if (Array.isArray(ov.steps)) {
      const cleanSteps = ov.steps.map((step) => String(step || '').trim()).filter(Boolean);
      merged.steps = nonEmptyArray(cleanSteps, basePage.steps);
    }

    const activeCustomOtherLinks = Array.isArray(ov.customOtherLinks)
      ? ov.customOtherLinks
      : Array.isArray(rawOv?.customOtherLinks)
        ? rawOv.customOtherLinks
        : null;

    if (activeCustomOtherLinks && activeCustomOtherLinks.length > 0 && basePage.customOtherLinks) {
      merged.customOtherLinks = basePage.customOtherLinks.map((baseItem, idx) => {
        const nextItem = activeCustomOtherLinks[idx];
        if (!nextItem || typeof nextItem !== 'object') return baseItem;
        return {
          ...baseItem,
          label: nonEmptyString(nextItem.label, baseItem.label),
          badge: nonEmptyString(nextItem.badge, baseItem.badge),
          modalUrl: sanitizePortalUrl(nextItem.modalUrl, baseItem.modalUrl || ''),
          externalUrl: sanitizePortalUrl(nextItem.externalUrl, baseItem.externalUrl || '')
        };
      });
    }

    return merged;
  }

  return {
    settings,
    navLinks,
    contacts,
    profileOverride,
    programsOverride,
    infoPagesOverride,
    mergeProfile,
    mergeProgramCard,
    mergeProgramDetail,
    mergeInfoPage
  };
}
