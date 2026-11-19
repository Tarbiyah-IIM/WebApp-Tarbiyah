<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Search,
  X
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store.js';
import { useI18n } from '../composables/useI18n.js';

const props = defineProps({
  navMenus: {
    type: Array,
    required: true
  },
  activeSheet: {
    type: String,
    default: null
  },
  dashboardRoute: {
    type: String,
    default: '/'
  }
});

const emit = defineEmits(['toggle-sheet', 'close-sheet', 'open-search', 'pending-item', 'logout']);

const route = useRoute();
const auth = useAuthStore();
const { t } = useI18n();

const menuById = computed(() => {
  const map = {};
  for (const menu of props.navMenus) {
    map[menu.id] = menu;
  }
  return map;
});

const sheetGroups = computed(() => {
  if (props.activeSheet === 'prodi') {
    const group = menuById.value['program-studi'];
    return group ? [group] : [];
  }
  if (props.activeSheet === 'akademik') {
    const group = menuById.value.akademik;
    return group ? [group] : [];
  }
  if (props.activeSheet === 'more') {
    return [menuById.value.publikasi, menuById.value.rpl].filter(Boolean);
  }
  return [];
});

const sheetHeading = computed(() => {
  if (props.activeSheet === 'prodi') return t('nav.programs');
  if (props.activeSheet === 'akademik') return t('nav.academic');
  if (props.activeSheet === 'more') return t('nav.bottomNav.moreTitle');
  return '';
});

const isHomeActive = computed(() => !props.activeSheet && route.path === '/');
const isProdiActive = computed(
  () => props.activeSheet === 'prodi' || (!props.activeSheet && route.path.startsWith('/program-studi'))
);
const isAcademicActive = computed(
  () => props.activeSheet === 'akademik' || (!props.activeSheet && route.path.startsWith('/akademik'))
);
const isMoreActive = computed(
  () => props.activeSheet === 'more' || (!props.activeSheet && route.path.startsWith('/publikasi'))
);

function handleHomeClick() {
  emit('close-sheet');
}

function handleSearchClick() {
  emit('close-sheet');
  emit('open-search');
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="activeSheet"
      class="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
      aria-hidden="true"
      @click="emit('close-sheet')"
    />

    <section
      v-if="activeSheet"
      id="mobile-bottom-sheet"
      role="dialog"
      aria-modal="true"
      :aria-label="sheetHeading"
      data-testid="mobile-bottom-sheet"
      class="fixed inset-x-3 bottom-[82px] z-50 mx-auto max-h-[68vh] max-w-lg overflow-y-auto rounded-3xl border border-surface-border bg-white p-4 shadow-float lg:hidden"
    >
      <div class="mb-3 flex items-center justify-between gap-2 border-b border-surface-border pb-3">
        <h2 class="text-sm font-extrabold text-brand-900">{{ sheetHeading }}</h2>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
          :aria-label="t('nav.bottomNav.closeSheet')"
          @click="emit('close-sheet')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="group in sheetGroups" :key="group.id" class="space-y-2">
          <p
            v-if="activeSheet === 'more'"
            class="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            {{ group.label }}
          </p>
          <div class="space-y-1.5">
            <template v-for="child in group.children" :key="child.label">
              <a
                v-if="child.href"
                :href="child.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex min-h-[44px] items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
                @click="emit('close-sheet')"
              >
                <span>{{ child.label }}</span>
                <ExternalLink class="h-4 w-4 shrink-0 text-slate-400" />
              </a>
              <router-link
                v-else-if="child.to"
                :to="child.to"
                class="flex min-h-[44px] items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
                @click="emit('close-sheet')"
              >
                <span>{{ child.label }}</span>
                <ChevronRight class="h-4 w-4 shrink-0 text-brand-600" />
              </router-link>
              <button
                v-else
                type="button"
                class="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-left text-sm font-semibold text-brand-900 transition hover:border-brand-300 hover:bg-brand-50"
                @click="emit('pending-item', group.label, child.label)"
              >
                <span>{{ child.label }}</span>
                <ChevronRight class="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            </template>
          </div>
        </div>

        <div v-if="activeSheet === 'more'" class="space-y-2 border-t border-surface-border pt-3">
          <router-link
            to="/#features"
            class="flex min-h-[44px] items-center justify-between rounded-xl border border-surface-border bg-surface-page px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
            @click="emit('close-sheet')"
          >
            <span>{{ t('nav.about') }}</span>
            <ChevronRight class="h-4 w-4 shrink-0 text-slate-400" />
          </router-link>

          <template v-if="auth.isAuthenticated">
            <router-link
              v-if="auth.isAdmin"
              :to="dashboardRoute"
              class="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 transition"
              @click="emit('close-sheet')"
            >
              <LayoutDashboard class="h-4 w-4" />
              <span>{{ auth.user.role.toUpperCase() }} {{ t('nav.dashboardSuffix') }}</span>
            </router-link>
            <button
              type="button"
              class="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-surface-border px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              @click="emit('logout')"
            >
              <LogOut class="h-4 w-4" />
              <span>{{ t('nav.logout') }}</span>
            </button>
          </template>
        </div>
      </div>
    </section>

    <nav
      :aria-label="t('nav.bottomNav.ariaLabel')"
      data-testid="mobile-bottom-nav"
      class="fixed inset-x-0 bottom-0 z-50 lg:hidden"
    >
      <div class="mx-auto max-w-xl rounded-t-3xl border-x border-t border-surface-border bg-white px-2 pt-2 pb-2.5 shadow-float">
        <div class="grid grid-cols-5 items-end">
          <router-link
            to="/"
            data-testid="bottom-nav-home"
            class="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] transition"
            :class="isHomeActive ? 'font-bold text-brand-600' : 'font-semibold text-slate-600 hover:text-brand-600'"
            @click="handleHomeClick"
          >
            <Home class="h-5 w-5" />
            <span>{{ t('nav.bottomNav.home') }}</span>
          </router-link>

          <button
            type="button"
            data-testid="bottom-nav-prodi"
            aria-controls="mobile-bottom-sheet"
            :aria-expanded="activeSheet === 'prodi'"
            class="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] transition"
            :class="isProdiActive ? 'font-bold text-brand-600' : 'font-semibold text-slate-600 hover:text-brand-600'"
            @click="emit('toggle-sheet', 'prodi')"
          >
            <GraduationCap class="h-5 w-5" />
            <span>{{ t('nav.bottomNav.prodi') }}</span>
          </button>

          <div class="flex flex-col items-center justify-end">
            <button
              type="button"
              data-testid="mobile-bottom-search"
              :aria-label="t('search.openLabel')"
              :title="t('search.openLabel')"
              class="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-float ring-4 ring-white transition hover:bg-brand-700 active:scale-95"
              @click="handleSearchClick"
            >
              <Search class="h-6 w-6" />
            </button>
          </div>

          <button
            type="button"
            data-testid="bottom-nav-akademik"
            aria-controls="mobile-bottom-sheet"
            :aria-expanded="activeSheet === 'akademik'"
            class="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] transition"
            :class="isAcademicActive ? 'font-bold text-brand-600' : 'font-semibold text-slate-600 hover:text-brand-600'"
            @click="emit('toggle-sheet', 'akademik')"
          >
            <BookOpen class="h-5 w-5" />
            <span>{{ t('nav.bottomNav.academic') }}</span>
          </button>

          <button
            type="button"
            data-testid="bottom-nav-more"
            aria-controls="mobile-bottom-sheet"
            :aria-expanded="activeSheet === 'more'"
            class="flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[11px] transition"
            :class="isMoreActive ? 'font-bold text-brand-600' : 'font-semibold text-slate-600 hover:text-brand-600'"
            @click="emit('toggle-sheet', 'more')"
          >
            <LayoutGrid class="h-5 w-5" />
            <span>{{ t('nav.bottomNav.more') }}</span>
          </button>
        </div>

        <div class="mx-auto mt-1.5 h-1 w-24 rounded-full bg-slate-200" aria-hidden="true" />
      </div>
    </nav>
  </Teleport>
</template>
