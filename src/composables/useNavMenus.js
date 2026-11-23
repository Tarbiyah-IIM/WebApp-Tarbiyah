import { computed, ref } from 'vue';
import { usePortalContent } from './usePortalContent.js';

function linkProps(url) {
  if (!url) return {};
  if (url.startsWith('/')) return { to: url };
  return { href: url };
}

export function useNavMenus(t) {
  const { navLinks } = usePortalContent();
  const hoveredDropdown = ref(null);
  const pinnedDropdown = ref(null);
  const mobileSheet = ref(null);

  const activeDropdown = computed(() => pinnedDropdown.value || hoveredDropdown.value);

  const navMenus = computed(() => {
    const links = navLinks.value;
    return [
      {
        id: 'tentang-kami',
        label: t('nav.about'),
        to: '/#features'
      },
      {
        id: 'program-studi',
        label: t('nav.programs'),
        children: [
          {
            label: t('nav.items.programs.pai'),
            to: '/program-studi/pai'
          },
          {
            label: t('nav.items.programs.pgmi'),
            to: '/program-studi/pgmi'
          },
          {
            label: t('nav.items.programs.piaud'),
            to: '/program-studi/piaud'
          }
        ]
      },
      {
        id: 'akademik',
        label: t('nav.academic'),
        children: [
          {
            label: t('nav.items.academic.activeLetter'),
            ...linkProps(links.activeLetter)
          },
          {
            label: t('nav.items.academic.correspondence'),
            to: '/akademik/administrasi-persuratan'
          },
          {
            label: t('nav.items.academic.calendar'),
            ...linkProps(links.calendar)
          },
          {
            label: t('nav.items.academic.curriculum'),
            ...linkProps(links.curriculum)
          },
          {
            label: t('nav.items.academic.comprehensive'),
            to: '/akademik/ujian-komprehensif'
          },
          {
            label: t('nav.items.academic.munaqasyah'),
            ...linkProps(links.munaqasyah)
          }
        ]
      },
      {
        id: 'publikasi',
        label: t('nav.publications'),
        children: [
          {
            label: t('nav.items.publications.ppl'),
            to: '/publikasi/ppl'
          },
          {
            label: t('nav.items.publications.kkn'),
            to: '/publikasi/pkn'
          },
          {
            label: t('nav.items.publications.journal'),
            to: '/publikasi/jurnal'
          },
          {
            label: t('nav.items.publications.research'),
            ...linkProps(links.research)
          }
        ]
      },
      {
        id: 'rpl',
        label: t('nav.rpl'),
        children: [
          {
            label: t('nav.items.rpl.guide'),
            ...linkProps(links.rplGuide)
          },
          {
            label: t('nav.items.rpl.regulations'),
            ...linkProps(links.rplRegulations)
          },
          {
            label: t('nav.items.rpl.decree'),
            ...linkProps(links.rplDecree)
          }
        ]
      }
    ];
  });

  function toggleDesktopDropdown(id) {
    if (pinnedDropdown.value === id) {
      pinnedDropdown.value = null;
      hoveredDropdown.value = null;
      return;
    }
    pinnedDropdown.value = id;
    hoveredDropdown.value = id;
  }

  function openDesktopDropdown(id) {
    hoveredDropdown.value = id;
    if (pinnedDropdown.value && pinnedDropdown.value !== id) {
      pinnedDropdown.value = null;
    }
  }

  function handleDesktopMouseLeave(id) {
    if (hoveredDropdown.value === id) {
      hoveredDropdown.value = null;
    }
  }

  function closeDesktopDropdown() {
    pinnedDropdown.value = null;
    hoveredDropdown.value = null;
  }

  function toggleMobileSheet(sheetId) {
    mobileSheet.value = mobileSheet.value === sheetId ? null : sheetId;
  }

  function closeMobileSheet() {
    mobileSheet.value = null;
  }

  function closeAllMenus() {
    closeDesktopDropdown();
    closeMobileSheet();
  }

  return {
    navMenus,
    mobileSheet,
    activeDropdown,
    toggleDesktopDropdown,
    openDesktopDropdown,
    handleDesktopMouseLeave,
    closeDesktopDropdown,
    toggleMobileSheet,
    closeMobileSheet,
    closeAllMenus
  };
}
