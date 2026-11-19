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
          href: 'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86208'
        },
        {
          label: t('nav.items.programs.pgmi'),
          href: 'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86232'
        },
        {
          label: t('nav.items.programs.piaud'),
          href: 'https://iimsurakarta.siakadcloud.com/spmbfront/program-studi-detail/detail/86239'
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
        { label: t('nav.items.academic.correspondence') },
        { label: t('nav.items.academic.calendar') },
        { label: t('nav.items.academic.curriculum') },
        {
          label: t('nav.items.academic.comprehensive'),
          href: 'https://www.myskripsi.iimsurakarta.ac.id/mylisan/dashboard/ul-f-tarbiyah/'
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
        { label: t('nav.items.publications.ppl') },
        { label: t('nav.items.publications.kkn') },
        { label: t('nav.items.publications.journal') },
        { label: t('nav.items.publications.research') }
      ]
    },
    {
      id: 'rpl',
      label: t('nav.rpl'),
      children: [
        { label: t('nav.items.rpl.guide') },
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
