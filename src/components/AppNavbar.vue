<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-vue-next';
import ftarLogo from '../assets/ftar-logo.png';
import { useAuthStore } from '../stores/auth.store.js';
import { useUiStore } from '../stores/ui.store.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const toast = useToast();
const { locale, setLocale, t } = useI18n();

const navRef = ref(null);
const mobileOpen = ref(false);
const hoveredDropdown = ref(null);
const pinnedDropdown = ref(null);
const mobileExpanded = ref(null);

const activeDropdown = computed(() => pinnedDropdown.value || hoveredDropdown.value);

const dashboardRoute = computed(() => {
  if (auth.isAdmin) return '/admin';
  if (auth.isMentor) return '/mentor';
  return '/dashboard';
});

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
  pinnedDropdown.value = null;
  hoveredDropdown.value = null;
  mobileOpen.value = false;
  mobileExpanded.value = null;
}

function handlePendingItem(menuLabel, itemLabel) {
  closeAllMenus();
  toast.info(t('nav.pendingPrefix') + itemLabel + t('nav.pendingSuffix'), menuLabel);
}

function handleDocumentClick(event) {
  if (navRef.value && !navRef.value.contains(event.target)) {
    closeDesktopDropdown();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') {
    closeDesktopDropdown();
    mobileOpen.value = false;
  }
}

watch(
  () => route.fullPath,
  () => {
    closeAllMenus();
  }
);

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleDocumentKeydown);
});

async function handleLogout() {
  await auth.logout();
  closeAllMenus();
  router.push('/');
}
</script>

<template>
  <header
    ref="navRef"
    class="sticky top-0 z-40 border-b border-surface-border/80 bg-white/95 backdrop-blur-md"
  >
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8"
      :aria-label="t('nav.mainAria')"
    >
      <router-link to="/" class="flex min-w-0 shrink-0 items-center gap-2.5 min-h-[44px]" @click="closeAllMenus">
        <img
          :src="ftarLogo"
          :alt="t('nav.logoAlt')"
          class="h-10 w-auto shrink-0 object-contain sm:h-11"
        />
        <span class="flex flex-col leading-tight">
          <span class="text-sm font-extrabold tracking-tight text-brand-900 sm:text-base">
            {{ t('brand.faculty') }}
          </span>
          <span class="max-w-[180px] truncate text-[11px] font-semibold text-slate-600 sm:max-w-none sm:text-xs">
            {{ t('brand.institute') }}
          </span>
        </span>
      </router-link>

      <div class="hidden items-center gap-4 xl:gap-6 lg:flex">
        <template v-for="menu in navMenus" :key="menu.id">
          <router-link
            v-if="!menu.children"
            :to="menu.to"
            class="inline-flex min-h-[44px] items-center whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-brand-600"
            @click="closeDesktopDropdown"
          >
            {{ menu.label }}
          </router-link>

          <div
            v-else
            class="relative"
            @mouseenter="openDesktopDropdown(menu.id)"
            @mouseleave="handleDesktopMouseLeave(menu.id)"
          >
            <button
              type="button"
              :aria-expanded="activeDropdown === menu.id"
              aria-haspopup="true"
              class="inline-flex min-h-[44px] items-center gap-1 whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-brand-600"
              @click="toggleDesktopDropdown(menu.id)"
            >
              <span>{{ menu.label }}</span>
              <ChevronDown
                class="h-4 w-4 transition-transform duration-150"
                :class="{ 'rotate-180 text-brand-600': activeDropdown === menu.id }"
              />
            </button>

            <div
              v-if="activeDropdown === menu.id"
              class="absolute left-0 top-full z-50 w-72 pt-1.5"
            >
              <div class="rounded-2xl border border-surface-border bg-white p-2 shadow-float">
                <template v-for="child in menu.children" :key="child.label">
                  <a
                    v-if="child.href"
                    :href="child.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                    @click="closeDesktopDropdown"
                  >
                    <span>{{ child.label }}</span>
                    <ExternalLink class="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </a>
                  <button
                    v-else
                    type="button"
                    class="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                    @click="handlePendingItem(menu.label, child.label)"
                  >
                    <span>{{ child.label }}</span>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="hidden shrink-0 items-center gap-2.5 lg:flex">
        <div
          class="inline-flex items-center rounded-xl border border-surface-border bg-surface-muted p-0.5"
          role="group"
          :aria-label="t('lang.switchLabel')"
        >
          <button
            type="button"
            data-testid="lang-switch-id"
            :aria-pressed="locale === 'id'"
            class="min-h-[36px] rounded-lg px-2.5 text-xs font-bold transition"
            :class="locale === 'id' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-brand-900'"
            @click="setLocale('id')"
          >
            ID
          </button>
          <button
            type="button"
            data-testid="lang-switch-en"
            :aria-pressed="locale === 'en'"
            class="min-h-[36px] rounded-lg px-2.5 text-xs font-bold transition"
            :class="locale === 'en' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-brand-900'"
            @click="setLocale('en')"
          >
            EN
          </button>
        </div>

        <button
          type="button"
          data-testid="theme-toggle"
          :aria-pressed="ui.isNight"
          :aria-label="ui.isNight ? t('theme.switchToLight') : t('theme.switchToNight')"
          :title="ui.isNight ? t('theme.switchToLight') : t('theme.switchToNight')"
          class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-surface-border bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          @click="ui.toggleTheme"
        >
          <Moon v-if="ui.isNight" class="h-4 w-4 text-amber-300" />
          <Sun v-else class="h-4 w-4 text-amber-500" />
          <span>{{ ui.isNight ? t('theme.night') : t('theme.light') }}</span>
        </button>

        <template v-if="auth.isAuthenticated">
          <router-link
            :to="dashboardRoute"
            class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition"
          >
            <LayoutDashboard class="h-4 w-4" />
            <span>{{ auth.user.role.toUpperCase() }} {{ t('nav.panelSuffix') }}</span>
          </router-link>
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-surface-border px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            {{ t('nav.logout') }}
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="inline-flex min-h-[44px] items-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
          >
            {{ t('nav.login') }}
          </router-link>
        </template>
      </div>

      <div class="flex shrink-0 items-center gap-1.5 lg:hidden">
        <button
          type="button"
          data-testid="theme-toggle-mobile"
          :aria-pressed="ui.isNight"
          :aria-label="ui.isNight ? t('theme.switchToLight') : t('theme.switchToNight')"
          class="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-surface-border text-slate-700"
          @click="ui.toggleTheme"
        >
          <Moon v-if="ui.isNight" class="h-4 w-4 text-amber-300" />
          <Sun v-else class="h-4 w-4 text-amber-500" />
        </button>
        <button
          type="button"
          class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-surface-border text-slate-700"
          :aria-expanded="mobileOpen"
          :aria-label="t('nav.toggleMenu')"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" class="h-6 w-6" />
          <Menu v-else class="h-6 w-6" />
        </button>
      </div>
    </nav>

    <div v-if="mobileOpen" class="border-t border-surface-border bg-white px-4 py-4 lg:hidden">
      <div class="flex flex-col gap-1">
        <template v-for="menu in navMenus" :key="menu.id">
          <router-link
            v-if="!menu.children"
            :to="menu.to"
            class="flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            @click="closeAllMenus"
          >
            {{ menu.label }}
          </router-link>

          <div v-else class="flex flex-col">
            <button
              type="button"
              :aria-expanded="mobileExpanded === menu.id"
              class="flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              @click="toggleMobileSubmenu(menu.id)"
            >
              <span>{{ menu.label }}</span>
              <ChevronDown
                class="h-4 w-4 transition-transform duration-150"
                :class="{ 'rotate-180 text-brand-600': mobileExpanded === menu.id }"
              />
            </button>

            <div
              v-if="mobileExpanded === menu.id"
              class="ml-3 mt-1 flex flex-col gap-1 border-l-2 border-brand-100 pl-3 pb-2"
            >
              <template v-for="child in menu.children" :key="child.label">
                <a
                  v-if="child.href"
                  :href="child.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex min-h-[44px] items-center justify-between gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  @click="closeAllMenus"
                >
                  <span>{{ child.label }}</span>
                  <ExternalLink class="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </a>
                <button
                  v-else
                  type="button"
                  class="flex min-h-[44px] w-full items-center rounded-xl px-3 text-left text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  @click="handlePendingItem(menu.label, child.label)"
                >
                  <span>{{ child.label }}</span>
                </button>
              </template>
            </div>
          </div>
        </template>

        <div class="mt-2 border-t border-surface-border pt-3 flex flex-col gap-2">
          <div class="flex items-center justify-between gap-2 pb-1">
            <div
              class="inline-flex items-center rounded-xl border border-surface-border bg-surface-muted p-0.5"
              role="group"
              :aria-label="t('lang.switchLabel')"
            >
              <button
                type="button"
                data-testid="lang-switch-id-mobile"
                :aria-pressed="locale === 'id'"
                class="min-h-[38px] rounded-lg px-3 text-xs font-bold transition"
                :class="locale === 'id' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600'"
                @click="setLocale('id')"
              >
                ID
              </button>
              <button
                type="button"
                data-testid="lang-switch-en-mobile"
                :aria-pressed="locale === 'en'"
                class="min-h-[38px] rounded-lg px-3 text-xs font-bold transition"
                :class="locale === 'en' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600'"
                @click="setLocale('en')"
              >
                EN
              </button>
            </div>
            <button
              type="button"
              :aria-pressed="ui.isNight"
              :aria-label="ui.isNight ? t('theme.switchToLight') : t('theme.switchToNight')"
              class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-surface-border px-3 py-2 text-xs font-bold text-slate-700"
              @click="ui.toggleTheme"
            >
              <Moon v-if="ui.isNight" class="h-4 w-4 text-amber-300" />
              <Sun v-else class="h-4 w-4 text-amber-500" />
              <span>{{ ui.isNight ? t('theme.night') : t('theme.light') }}</span>
            </button>
          </div>
          <template v-if="auth.isAuthenticated">
            <router-link
              :to="dashboardRoute"
              class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white"
              @click="closeAllMenus"
            >
              <LayoutDashboard class="h-4 w-4" />
              {{ auth.user.role.toUpperCase() }} {{ t('nav.dashboardSuffix') }}
            </router-link>
            <button
              type="button"
              class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-surface-border px-4 text-sm font-semibold text-slate-700"
              @click="handleLogout"
            >
              <LogOut class="h-4 w-4" />
              {{ t('nav.logout') }}
            </button>
          </template>
          <router-link
            v-else
            to="/login"
            class="flex min-h-[44px] items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white"
            @click="closeAllMenus"
          >
            {{ t('nav.login') }}
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
