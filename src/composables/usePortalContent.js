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
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
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

function sanitizeHostUrl(value, prefix, fallback) {
  const safe = sanitizePortalUrl(value, '');
  if (!safe || !safe.startsWith(prefix)) return fallback;
  return safe;
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

  function pickLocaleOverride(rawObj) {
    if (!rawObj || typeof rawObj !== 'object') return null;
    const activeLocale = uiStore.locale === 'en' ? 'en' : 'id';
    if (rawObj.locales && typeof rawObj.locales === 'object' && rawObj.locales[activeLocale]) {
      return rawObj.locales[activeLocale];
    }
    return activeLocale === 'id' ? rawObj : null;
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
      mapsEmbedUrl: sanitizeHostUrl(
        override.mapsEmbedUrl,
        'https://www.google.com/maps',
        DEFAULT_CONTACTS.mapsEmbedUrl
      ),
      guestLectureUrl: sanitizeHostUrl(
        override.guestLectureUrl,
        'https://script.google.com/',
        DEFAULT_CONTACTS.guestLectureUrl
      )
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
        ov.structureImageUrl || rawOv.structureImageUrl,
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
    const ov = pickLocaleOverride(programsOverride.value[slug]);
    if (!ov || typeof ov !== 'object') return detail;
    const highlights = Array.isArray(ov.highlights)
      ? ov.highlights.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const careers = Array.isArray(ov.careers)
      ? ov.careers.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    return {
      ...detail,
      degree: nonEmptyString(ov.degree, detail.degree),
      studyMode: nonEmptyString(ov.studyMode, detail.studyMode),
      overview: nonEmptyString(ov.overview, detail.overview),
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
      const href = sanitizePortalUrl(ov.primaryCta.href, basePage.primaryCta?.href || '');
      const label = nonEmptyString(ov.primaryCta.label, basePage.primaryCta?.label || '');
      if (label && href) {
        merged.primaryCta = { ...(basePage.primaryCta || {}), label, href };
      }
    }

    if (ov.secondaryCta && typeof ov.secondaryCta === 'object') {
      const href = sanitizePortalUrl(ov.secondaryCta.href, basePage.secondaryCta?.href || '');
      const label = nonEmptyString(ov.secondaryCta.label, basePage.secondaryCta?.label || '');
      if (label && href) {
        merged.secondaryCta = { ...(basePage.secondaryCta || {}), label, href };
      }
    }

    if (ov.sidebarAction && typeof ov.sidebarAction === 'object' && basePage.sidebarAction) {
      merged.sidebarAction = {
        ...basePage.sidebarAction,
        title: nonEmptyString(ov.sidebarAction.title, basePage.sidebarAction.title),
        buttonLabel: nonEmptyString(ov.sidebarAction.buttonLabel, basePage.sidebarAction.buttonLabel),
        badge: nonEmptyString(ov.sidebarAction.badge, basePage.sidebarAction.badge),
        href: sanitizePortalUrl(ov.sidebarAction.href, '')
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
