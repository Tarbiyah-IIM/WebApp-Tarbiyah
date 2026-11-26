<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ExternalLink,
  Sun,
  Moon,
  Search
} from 'lucide-vue-next';
import ftarLogo from '../assets/ftar-logo.png';
import MobileBottomNav from './MobileBottomNav.vue';
import SearchModal from './SearchModal.vue';
import { useAuthStore } from '../stores/auth.store.js';
import { useUiStore } from '../stores/ui.store.js';
import { useToast } from '../composables/useToast.js';
import { useI18n } from '../composables/useI18n.js';
import { useNavMenus } from '../composables/useNavMenus.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const toast = useToast();
const { locale, setLocale, t } = useI18n();
const {
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
} = useNavMenus(t);

const navRef = ref(null);
const searchModalOpen = ref(false);
const logoClickCount = ref(0);
let logoClickTimer = null;

const dashboardRoute = computed(() => (auth.isAdmin ? '/admin' : '/'));

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
    closeMobileSheet();
  }
}

watch(
  () => route.fullPath,
  () => {
    closeAllMenus();
    searchModalOpen.value = false;
  }
);

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleDocumentKeydown);
  resetLogoClickTracker();
});

function resetLogoClickTracker() {
  logoClickCount.value = 0;
  if (logoClickTimer) {
    clearTimeout(logoClickTimer);
    logoClickTimer = null;
  }
}

function scrollToHomeTopIfAlreadyHome() {
  if (route.path === '/' && !route.hash && typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handleLogoClick() {
  closeAllMenus();
  logoClickCount.value += 1;
  if (logoClickTimer) {
    clearTimeout(logoClickTimer);
  }
  if (logoClickCount.value >= 3) {
    resetLogoClickTracker();
    router.push('/login');
    return;
  }
  logoClickTimer = setTimeout(() => {
    resetLogoClickTracker();
  }, 1000);
}

function handleNavLinkClick(menu) {
  closeDesktopDropdown();
  if (menu?.to === '/') {
    scrollToHomeTopIfAlreadyHome();
  }
}

function openSearchModal() {
  closeAllMenus();
  searchModalOpen.value = true;
}

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
      class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:gap-2 lg:px-6 xl:gap-3 xl:px-8"
      :aria-label="t('nav.mainAria')"
    >
      <div
        data-testid="navbar-logo"
        class="flex min-w-0 shrink-0 select-none items-center gap-2.5 min-h-[44px]"
        @click="handleLogoClick"
      >
        <img
          :src="ftarLogo"
          :alt="t('nav.logoAlt')"
          class="h-10 w-auto shrink-0 object-contain sm:h-11"
        />
        <span class="flex flex-col leading-tight">
          <span class="text-sm font-extrabold tracking-tight text-brand-900 sm:text-base">
            {{ t('brand.faculty') }}
          </span>
          <span class="max-w-[180px] truncate text-[11px] font-semibold text-slate-600 sm:max-w-none lg:max-w-[150px] xl:max-w-none sm:text-xs">
            {{ t('brand.institute') }}
          </span>
        </span>
      </div>

      <div class="hidden items-center gap-3 lg:flex xl:gap-6">
        <template v-for="menu in navMenus" :key="menu.id">
          <router-link
            v-if="!menu.children"
            :to="menu.to"
            class="inline-flex min-h-[44px] items-center whitespace-nowrap text-sm font-semibold text-slate-700 transition hover:text-brand-600"
            @click="handleNavLinkClick(menu)"
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
                  <router-link
                    v-else-if="child.to"
                    :to="child.to"
                    class="flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                    @click="closeDesktopDropdown"
                  >
                    <span>{{ child.label }}</span>
                  </router-link>
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

      <div class="hidden shrink-0 items-center gap-1.5 lg:flex xl:gap-2.5">
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
          <span class="hidden xl:inline">{{ ui.isNight ? t('theme.night') : t('theme.light') }}</span>
        </button>

        <button
          type="button"
          data-testid="search-toggle"
          :aria-label="t('search.openLabel')"
          :title="t('search.openLabel')"
          class="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-surface-border bg-white text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
          @click="openSearchModal"
        >
          <Search class="h-4 w-4" />
        </button>

        <template v-if="auth.isAuthenticated">
          <router-link
            v-if="auth.isAdmin"
            :to="dashboardRoute"
            class="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition xl:px-4"
          >
            <LayoutDashboard class="h-4 w-4" />
            <span>{{ auth.user.role.toUpperCase() }} {{ t('nav.panelSuffix') }}</span>
          </router-link>
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-surface-border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition xl:px-3.5"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            {{ t('nav.logout') }}
          </button>
        </template>
      </div>

      <div class="flex shrink-0 items-center gap-1.5 lg:hidden">
        <div
          class="inline-flex items-center rounded-xl border border-surface-border bg-surface-muted p-0.5"
          role="group"
          :aria-label="t('lang.switchLabel')"
        >
          <button
            type="button"
            data-testid="lang-switch-id-mobile"
            :aria-pressed="locale === 'id'"
            class="min-h-[34px] rounded-lg px-2 text-xs font-bold transition"
            :class="locale === 'id' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600'"
            @click="setLocale('id')"
          >
            ID
          </button>
          <button
            type="button"
            data-testid="lang-switch-en-mobile"
            :aria-pressed="locale === 'en'"
            class="min-h-[34px] rounded-lg px-2 text-xs font-bold transition"
            :class="locale === 'en' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600'"
            @click="setLocale('en')"
          >
            EN
          </button>
        </div>
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
      </div>
    </nav>

    <MobileBottomNav
      :nav-menus="navMenus"
      :active-sheet="mobileSheet"
      :dashboard-route="dashboardRoute"
      @toggle-sheet="toggleMobileSheet"
      @close-sheet="closeMobileSheet"
      @open-search="openSearchModal"
      @pending-item="handlePendingItem"
      @logout="handleLogout"
    />
    <SearchModal :open="searchModalOpen" @close="searchModalOpen = false" />
  </header>
</template>
