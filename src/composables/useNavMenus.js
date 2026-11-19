import { computed, ref } from 'vue';

/**
 * Provides localized navigation menus and dropdown/drawer open state for the top navbar.
 */
export function useNavMenus(t) {
  const mobileOpen = ref(false);
  const hoveredDropdown = ref(null);
  const pinnedDropdown = ref(null);
  const mobileExpanded = ref(null);

  const activeDropdown = computed(() => pinnedDropdown.value || hoveredDropdown.value);

  const navMenus = computed(() => [
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
          href: 'https://baau.iim.ac.id/index.php/layanan/surat-aktif-kuliah/'
        },
        {
          label: t('nav.items.academic.correspondence'),
          to: '/akademik/administrasi-persuratan'
        },
        { label: t('nav.items.academic.calendar') },
        { label: t('nav.items.academic.curriculum') },
        {
          label: t('nav.items.academic.comprehensive'),
          to: '/akademik/ujian-komprehensif'
        },
        {
          label: t('nav.items.academic.munaqasyah'),
          href: 'https://www.myskripsi.iimsurakarta.ac.id/myskripsi/dashboard/'
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
        { label: t('nav.items.publications.research') }
      ]
    },
    {
      id: 'rpl',
      label: t('nav.rpl'),
      children: [
        {
          label: t('nav.items.rpl.guide'),
          href: 'https://drive.google.com/drive/folders/1knidvsDcia_CmXB4wfi81Xrr9RPImn7l?usp=sharing'
        },
        { label: t('nav.items.rpl.regulations') },
        { label: t('nav.items.rpl.decree') }
      ]
    }
  ]);

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

  function toggleMobileSubmenu(id) {
    mobileExpanded.value = mobileExpanded.value === id ? null : id;
  }

  function closeAllMenus() {
    closeDesktopDropdown();
    mobileOpen.value = false;
    mobileExpanded.value = null;
  }

  return {
    navMenus,
    mobileOpen,
    mobileExpanded,
    activeDropdown,
    toggleDesktopDropdown,
    openDesktopDropdown,
    handleDesktopMouseLeave,
    closeDesktopDropdown,
    toggleMobileSubmenu,
    closeAllMenus
  };
}
