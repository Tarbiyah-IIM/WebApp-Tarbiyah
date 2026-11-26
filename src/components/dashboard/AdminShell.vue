<script setup>
import { computed, ref } from 'vue';
import {
  CheckCircle2,
  ExternalLink,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Sun,
  X
} from 'lucide-vue-next';
import ftarLogo from '../../assets/ftar-logo.png';
import LanguageDropdown from '../LanguageDropdown.vue';
import { useAuthStore } from '../../stores/auth.store.js';
import { useUiStore } from '../../stores/ui.store.js';
import { useI18n } from '../../composables/useI18n.js';
import { useFocusTrap } from '../../composables/useFocusTrap.js';

const props = defineProps({
  navGroups: { type: Array, required: true },
  activeTab: { type: String, required: true },
  syncing: { type: Boolean, default: false }
});

const emit = defineEmits(['select-tab', 'logout', 'open-account']);

const auth = useAuthStore();
const ui = useUiStore();
const { t } = useI18n();
const mobileDrawerOpen = ref(false);
const mobileDrawerRef = ref(null);

const activeItem = computed(() => {
  for (const group of props.navGroups) {
    const found = group.items.find((item) => item.id === props.activeTab);
    if (found) return found;
  }
  return null;
});

function selectTab(id) {
  emit('select-tab', id);
  mobileDrawerOpen.value = false;
}

useFocusTrap(mobileDrawerRef, () => mobileDrawerOpen.value, {
  onEscape: () => {
    mobileDrawerOpen.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-surface-page text-brand-900 lg:flex">
    <aside class="hidden w-72 shrink-0 flex-col border-r border-surface-border bg-white lg:sticky lg:top-0 lg:flex lg:h-screen">
      <div class="flex items-center gap-3 border-b border-surface-border px-5 py-4">
        <img :src="ftarLogo" :alt="t('nav.logoAlt')" class="h-10 w-auto shrink-0 object-contain" />
        <div class="min-w-0">
          <p class="truncate text-sm font-extrabold text-brand-900">{{ t('adminDashboard.sidebarTitle') }}</p>
          <p class="truncate text-xs text-slate-500">{{ t('adminDashboard.sidebarSubtitle') }}</p>
        </div>
      </div>

      <nav :aria-label="t('adminDashboard.navAria')" class="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <div v-for="group in navGroups" :key="group.id" class="space-y-1">
          <p class="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {{ group.label }}
          </p>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            :aria-current="activeTab === item.id ? 'page' : undefined"
            class="flex min-h-[42px] w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-sm font-semibold transition"
            :class="activeTab === item.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-surface-page hover:text-brand-700'"
            @click="selectTab(item.id)"
          >
            <span class="flex min-w-0 items-center gap-3">
              <component :is="item.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
              <span class="truncate">{{ item.label }}</span>
            </span>
            <span
              v-if="item.count !== undefined"
              aria-hidden="true"
              class="rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="activeTab === item.id ? 'bg-brand-600 text-white' : 'bg-surface-muted text-slate-600'"
            >
              {{ item.count }}
            </span>
          </button>
        </div>
      </nav>

      <div class="border-t border-surface-border p-3 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-[42px] w-full items-center justify-between rounded-xl border border-surface-border bg-surface-page px-3.5 text-xs font-bold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <span>{{ t('adminDashboard.viewWebsite') }}</span>
          <ExternalLink class="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </aside>

    <Teleport to="body">
      <div
        v-if="mobileDrawerOpen"
        class="fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-xs lg:hidden"
        @click.self="mobileDrawerOpen = false"
      >
        <aside
          ref="mobileDrawerRef"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          :aria-label="t('adminDashboard.openMenuAria')"
          class="flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-float focus:outline-none"
        >
          <div class="flex items-center justify-between border-b border-surface-border px-4 py-3.5">
            <div class="flex items-center gap-2.5 min-w-0">
              <img :src="ftarLogo" :alt="t('nav.logoAlt')" class="h-9 w-auto shrink-0 object-contain" />
              <p class="truncate text-sm font-extrabold text-brand-900">{{ t('adminDashboard.sidebarTitle') }}</p>
            </div>
            <button
              type="button"
              :aria-label="t('adminDashboard.closeMenuAria')"
              class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border text-slate-600"
              @click="mobileDrawerOpen = false"
            >
              <X class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <nav :aria-label="t('adminDashboard.navAria')" class="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            <div v-for="group in navGroups" :key="group.id" class="space-y-1">
              <p class="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {{ group.label }}
              </p>
              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                :aria-current="activeTab === item.id ? 'page' : undefined"
                class="flex min-h-[42px] w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-sm font-semibold transition"
                :class="activeTab === item.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-surface-page hover:text-brand-700'"
                @click="selectTab(item.id)"
              >
                <span class="flex min-w-0 items-center gap-3">
                  <component :is="item.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span class="truncate">{{ item.label }}</span>
                </span>
                <span
                  v-if="item.count !== undefined"
                  aria-hidden="true"
                  class="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-bold text-slate-600"
                >
                  {{ item.count }}
                </span>
              </button>
            </div>
          </nav>

          <div class="border-t border-surface-border p-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex min-h-[42px] w-full items-center justify-between rounded-xl border border-surface-border bg-surface-page px-3.5 text-xs font-bold text-brand-900"
            >
              <span>{{ t('adminDashboard.viewWebsite') }}</span>
              <ExternalLink class="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </Teleport>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 border-b border-surface-border/80 bg-white/95 backdrop-blur-md">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              :aria-label="t('adminDashboard.openMenuAria')"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-white text-slate-700 lg:hidden"
              @click="mobileDrawerOpen = true"
            >
              <Menu class="h-5 w-5" aria-hidden="true" />
            </button>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold text-slate-500">{{ t('brand.faculty') }}</p>
              <p class="truncate text-sm font-extrabold text-brand-900 sm:text-base">
                {{ activeItem?.label || t('adminDashboard.nav.overview') }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <span
              class="hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold md:inline-flex"
              :class="syncing ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'"
            >
              <RefreshCw v-if="syncing" class="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              <CheckCircle2 v-else class="h-3.5 w-3.5" aria-hidden="true" />
              <span>{{ syncing ? t('adminDashboard.syncingBadge') : t('adminDashboard.syncedBadge') }}</span>
            </span>

            <LanguageDropdown compact />

            <button
              type="button"
              data-testid="theme-toggle"
              :aria-pressed="ui.isNight"
              :aria-label="ui.isNight ? t('theme.switchToLight') : t('theme.switchToNight')"
              :title="ui.isNight ? t('theme.switchToLight') : t('theme.switchToNight')"
              class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl border border-surface-border bg-white text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
              @click="ui.toggleTheme"
            >
              <Moon v-if="ui.isNight" class="h-4 w-4 text-amber-300" aria-hidden="true" />
              <Sun v-else class="h-4 w-4 text-amber-500" aria-hidden="true" />
            </button>

            <button
              v-if="auth.user"
              type="button"
              data-testid="admin-account-trigger"
              :title="t('adminDashboard.accountBtn')"
              :aria-label="t('adminDashboard.accountBtn')"
              class="hidden items-center gap-2 rounded-xl border border-surface-border bg-surface-page px-3 py-1.5 transition hover:border-brand-300 hover:bg-brand-50 md:inline-flex"
              @click="emit('open-account')"
            >
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-extrabold text-white">
                {{ (auth.user.name || 'A').charAt(0).toUpperCase() }}
              </span>
              <span class="max-w-[130px] truncate text-xs font-bold text-brand-900">{{ auth.user.name }}</span>
            </button>

            <button
              type="button"
              class="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-surface-border bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
              @click="emit('logout')"
            >
              <LogOut class="h-4 w-4" aria-hidden="true" />
              <span>{{ t('nav.logout') }}</span>
            </button>
          </div>
        </div>
      </header>

      <div class="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section class="rounded-3xl bg-brand-900 p-6 text-white shadow-card sm:p-7">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-amber-300">{{ t('adminDashboard.badge') }}</p>
              <h1 class="mt-1 text-xl font-extrabold sm:text-2xl">{{ t('adminDashboard.heading') }}</h1>
              <p class="mt-1 max-w-2xl text-xs text-slate-300 sm:text-sm">{{ t('adminDashboard.subtitle') }}</p>
            </div>
          </div>
        </section>

        <slot />
      </div>
    </div>
  </div>
</template>
